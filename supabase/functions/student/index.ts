// Cancio Club — Edge Function: acesso do aluno à própria ficha
//
// Por que existe: o aluno nunca autentica de verdade (só digita um código de 4 dígitos), então
// o Postgres não tem como saber, via RLS, "esse pedido anônimo é desse aluno específico" — toda
// visita ao app usa a mesma anon key pública. Por isso o app não pode mais falar direto com a
// tabela `cancio` para o fluxo do aluno: isso exigiria liberar leitura/escrita de TODAS as fichas
// pra qualquer pessoa com a anon key (que fica exposta no index.html, como é normal).
//
// Esta função roda no servidor com a service role key auto-injetada pela própria Supabase em
// toda Edge Function (SUPABASE_SERVICE_ROLE_KEY — nunca exposta ao navegador), confere o código
// antes de tocar no banco, e só lê/grava a ÚNICA linha que combina com aquele código. A tabela
// `cancio` fica fechada pra `anon` (ver RLS do projeto).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", ...extraHeaders },
  });
}

// Rate limiting do código de 4 dígitos: o PIN é curto o bastante pra ser varrido por força
// bruta (10.000 combinações) se nada travar tentativas repetidas. Depois de 5 tentativas com
// código NÃO ENCONTRADO vindas do mesmo IP em 15 minutos, passa a responder 429 pra esse IP até
// a janela expirar — sem nem tocar na tabela `cancio`. Um código encontrado (tentativa certa)
// limpa o histórico de falhas daquele IP (são "tentativas falhas CONSECUTIVAS").
// Guardado em public.student_login_rate_limits (migração correspondente em supabase/migrations) —
// só a service role usada aqui enxerga essa tabela, nunca anon/authenticated.
const RATE_LIMIT_MAX_FAILURES = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

async function checkRateLimit(admin: ReturnType<typeof createClient>, ip: string): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  try {
    const { data: row } = await admin
      .from("student_login_rate_limits")
      .select("fail_count, window_start")
      .eq("ip", ip)
      .maybeSingle();
    if (!row) return { blocked: false, retryAfterSeconds: 0 };
    const windowStart = new Date(row.window_start).getTime();
    const windowExpired = Date.now() - windowStart > RATE_LIMIT_WINDOW_MS;
    if (windowExpired || row.fail_count < RATE_LIMIT_MAX_FAILURES) return { blocked: false, retryAfterSeconds: 0 };
    const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000));
    return { blocked: true, retryAfterSeconds };
  } catch {
    // indisponibilidade da checagem de rate limit nunca deve derrubar o login de verdade — falha aberta
    return { blocked: false, retryAfterSeconds: 0 };
  }
}

async function recordLoginFailure(admin: ReturnType<typeof createClient>, ip: string) {
  try {
    await admin.rpc("cancio_record_login_failure", { p_ip: ip, p_window_ms: RATE_LIMIT_WINDOW_MS });
  } catch {
    // mesmo raciocínio: não deixa uma falha ao REGISTRAR a tentativa quebrar a resposta já decidida
  }
}

async function recordLoginSuccess(admin: ReturnType<typeof createClient>, ip: string) {
  try {
    await admin.from("student_login_rate_limits").delete().eq("ip", ip);
  } catch {
    // idem — limpar o histórico de falhas é só limpeza, não pode bloquear um login válido
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: "function mal configurada" }, 500);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const ip = clientIp(req);

  const limitState = await checkRateLimit(admin, ip);
  if (limitState.blocked) {
    return json(
      { error: "Muitas tentativas com código inválido. Tente novamente em alguns minutos.", retryAfterSeconds: limitState.retryAfterSeconds },
      429,
      { "Retry-After": String(limitState.retryAfterSeconds) }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const action = body?.action;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!/^\d{4}$/.test(code)) return json({ error: "código inválido" }, 400);

  // acha a linha do aluno pelo código — nunca mais de uma, nunca outra ficha
  const { data: rows, error: findErr } = await admin
    .from("cancio")
    .select("*")
    .like("id", "student_%")
    .eq("data->>code", code)
    .limit(1);

  if (findErr) return json({ error: "erro ao buscar" }, 500);
  if (!rows || rows.length === 0) {
    await recordLoginFailure(admin, ip);
    return json({ error: "código não encontrado" }, 404);
  }
  const row = rows[0];
  await recordLoginSuccess(admin, ip);

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
