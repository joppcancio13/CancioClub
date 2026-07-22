// Cancio Club — Edge Function: acesso do aluno à própria ficha
//
// Por que existe: o aluno nunca autentica de verdade (só digita um código de 4 dígitos), então
// o Postgres não tem como saber, via RLS, "esse pedido anônimo é desse aluno específico" — toda
// visita ao app usa a mesma anon key pública. Por isso o app não pode mais falar direto com a
// tabela `cancio` para o fluxo do aluno: isso exigiria liberar leitura/escrita de TODAS as fichas
// pra qualquer pessoa com a anon key (que fica exposta no index.html, como é normal).
//
// Esta função roda no servidor com a service role key (nunca exposta ao navegador — fica só como
// secret do projeto), confere o código antes de tocar no banco, e só lê/grava a ÚNICA linha que
// combina com aquele código. A tabela `cancio` deve ficar fechada pra `anon` depois que isso
// estiver no ar (ver instruções de deploy).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: "function mal configurada" }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const action = body?.action;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!/^\d{4}$/.test(code)) return json({ error: "código inválido" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // acha a linha do aluno pelo código — nunca mais de uma, nunca outra ficha
  const { data: rows, error: findErr } = await admin
    .from("cancio")
    .select("*")
    .like("id", "student_%")
    .eq("data->>code", code)
    .limit(1);

  if (findErr) return json({ error: "erro ao buscar" }, 500);
  if (!rows || rows.length === 0) return json({ error: "código não encontrado" }, 404);
  const row = rows[0];

  if (action === "login") {
    return json({ data: row.data });
  }

  if (action === "sync") {
    const incoming = body?.data;
    if (!incoming || typeof incoming !== "object") return json({ error: "payload inválido" }, 400);
    // trava: o aluno só grava NA MESMA linha que ele achou com o próprio código — nunca em outra
    if (incoming.id !== row.data.id || incoming.code !== code) {
      return json({ error: "não autorizado a gravar nesse registro" }, 403);
    }
    const { error: upErr } = await admin
      .from("cancio")
      .upsert({ id: row.id, data: { ...incoming, updatedAt: Date.now() } });
    if (upErr) return json({ error: "erro ao gravar" }, 500);
    return json({ ok: true });
  }

  return json({ error: "ação desconhecida" }, 400);
});
