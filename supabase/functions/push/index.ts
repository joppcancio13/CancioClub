// Cancio Club — Edge Function `push`: avisos no celular (design v4 · 34a).
//
// Ações:
// - subscribe / prefs / unsubscribe: o aparelho se inscreve (ou muda as preferências). O aluno se
//   identifica pelo código (como na função `student`); o professor, pelo login (JWT do Supabase Auth).
// - event: um acontecimento que vira aviso. Do aluno (pelo código): "dor", "recado", "fim" → vão pro
//   professor. Do professor (pelo login): "resposta", "ficha" → vão pro aluno.
// - cron: chamada a cada 15 min pelo pg_cron (confere o segredo guardado no Vault): lembrete do treino
//   (07:30 por padrão), reavaliação vencida (08:00, professor) e resumo de domingo (18:00, aluno).
//
// Silêncio (padrão 22:00–07:00): nada toca, a não ser "Sentiu dor". Cada tipo tem seu interruptor.
// Segredos (Supabase › Edge Functions › Secrets): VAPID_PRIVATE_KEY. A chave pública vai no app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = "BJMF58AzzYt_YCKM0wkaqq7GuoaK5b6Lr0xu6xwasOPclajV1omYCDyDfgE_tdqhQx-bsX41FWOoE6GgP6G0Kx0";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const PROF_UID = "1617b8a8-8134-4b6a-a749-5a5669a427c7"; // o mesmo das policies da tabela `cancio`
const APP_URL = "https://cancioclub.netlify.app/";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// preferências: tudo ligado por padrão; silêncio 22–07; lembrete 07:30
const PROF_TYPES = ["dor", "recado", "fim", "reav"];
const STUDENT_TYPES = ["resposta", "ficha", "lembrete", "semana"];
const defaults = (kind: string) => ({ ...(Object.fromEntries((kind === "prof" ? PROF_TYPES : STUDENT_TYPES).map((t) => [t, true]))), silencioDe: "22:00", silencioAte: "07:00", lembreteHora: "07:30" });
const prefsOf = (row: any) => ({ ...defaults(row.owner_kind), ...(row.prefs || {}) });

// hora local do aparelho
function localParts(tz: string, d = new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false });
  const p: Record<string, string> = {}; f.formatToParts(d).forEach((x) => { p[x.type] = x.value; });
  const hh = p.hour === "24" ? "00" : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, hm: `${hh}:${p.minute}`, min: Number(hh) * 60 + Number(p.minute), wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
}
const toMin = (hm: string) => { const [h, m] = String(hm || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
function inQuiet(prefs: any, tz: string) {
  const now = localParts(tz).min, a = toMin(prefs.silencioDe), b = toMin(prefs.silencioAte);
  if (a === b) return false;
  return a < b ? now >= a && now < b : now >= a || now < b;
}
const KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

async function send(admin: any, row: any, payload: Record<string, unknown>) {
  try {
    await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify(payload), { TTL: 3600 });
    return true;
  } catch (e: any) {
    const code = e && e.statusCode;
    if (code === 404 || code === 410) await admin.from("push_subscriptions").delete().eq("endpoint", row.endpoint); // aparelho saiu
    console.error("push falhou", code || e);
    return false;
  }
}
// manda pra todos os aparelhos de um dono, respeitando o interruptor do tipo e o silêncio
async function sendTo(admin: any, kind: string, ownerId: string | null, type: string, payload: Record<string, unknown>) {
  let q = admin.from("push_subscriptions").select("*").eq("owner_kind", kind);
  if (ownerId) q = q.eq("owner_id", ownerId);
  const { data: rows } = await q;
  let n = 0;
  for (const row of rows || []) {
    const pr = prefsOf(row);
    if (pr[type] === false) continue;
    if (type !== "dor" && inQuiet(pr, row.tz)) continue;
    if (await send(admin, row, { ...payload, type })) n++;
  }
  return n;
}

async function studentByCode(admin: any, code: string) {
  if (!/^\d{4}$/.test(code || "")) return null;
  const { data } = await admin.from("cancio").select("*").like("id", "student_%").eq("data->>code", code).limit(1);
  return data && data[0] ? data[0].data : null;
}
async function studentById(admin: any, sid: string) {
  const { data } = await admin.from("cancio").select("*").eq("id", "student_" + sid).maybeSingle();
  return data ? data.data : null;
}
async function isProf(admin: any, req: Request) {
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok) return false;
  try { const { data } = await admin.auth.getUser(tok); return !!(data && data.user && data.user.id === PROF_UID); } catch { return false; }
}
const first = (n: string) => String(n || "").trim().split(/\s+/)[0] || "Aluno";
const cut = (t: string, n = 120) => { const s = String(t || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

// ---------- agendados ----------
function weekCount(st: any, localDate: string) {
  const d = new Date(localDate + "T12:00:00Z"); const mon = new Date(d); mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const start = mon.toISOString().slice(0, 10);
  const done = new Set((st.sessions || []).filter((x: any) => x.date >= start && x.date <= localDate && x.effort !== "descanso").map((x: any) => x.date)).size;
  const planned = Number(String(st.freqWeekly || "").match(/\d+/)?.[0]) || KEYS.filter((k) => ((st.workouts || {})[k] || []).length).length;
  return { done, planned };
}
function reassessDue(st: any) {
  if (!st || !st.assessmentAt) return false;
  const list = (st.reassessments || []).filter((r: any) => !r.onlyPhoto); // só foto (Corpo) não conta
  const dates = [st.assessmentAt, list.length ? list[list.length - 1].date : null, st.reassessDoneAt].filter(Boolean).map((x: string) => new Date(x).getTime());
  let next = Math.max(...dates) + (Number(st.reassessEvery) || 6) * 7 * 864e5;
  if (st.reassessSnoozeUntil) next = Math.max(next, new Date(st.reassessSnoozeUntil).getTime());
  return Date.now() >= next;
}
async function runCron(admin: any) {
  const { data: subs } = await admin.from("push_subscriptions").select("*");
  let sent = 0;
  const window = (lp: any, hm: string) => lp.min >= toMin(hm) && lp.min < toMin(hm) + 15;
  const mark = async (row: any, key: string, date: string) => { await admin.from("push_subscriptions").update({ last_sent: { ...(row.last_sent || {}), [key]: date } }).eq("id", row.id); };
  for (const row of subs || []) {
    const pr = prefsOf(row); const lp = localParts(row.tz);
    if (row.owner_kind === "student") {
      const st = await studentById(admin, row.owner_id); if (!st) continue;
      // lembrete do treino, nos dias com treino e se ainda não treinou hoje
      if (pr.lembrete !== false && window(lp, pr.lembreteHora) && (row.last_sent || {}).lembrete !== lp.date) {
        const k = KEYS[lp.wd]; const list = ((st.workouts || {})[k] || []); const cardio = (st.cardio || {})[k];
        const trained = (st.sessions || []).some((x: any) => x.date === lp.date);
        if ((list.length || cardio) && !trained) {
          const name = ((st.dayNames || {})[k]) || (list.length ? "Treino" : "Cardio");
          if (await send(admin, row, { type: "lembrete", title: "Hoje é dia de " + String(name).split("·")[0].trim(), body: list.length ? list.length + " exercícios te esperando." : "Dia de cardio.", url: APP_URL + "?abrir=hoje" })) sent++;
          await mark(row, "lembrete", lp.date);
        }
      }
      // domingo 18:00: resumo da semana
      if (pr.semana !== false && lp.wd === 0 && window(lp, "18:00") && (row.last_sent || {}).semana !== lp.date) {
        const w = weekCount(st, lp.date);
        if (w.done > 0 && await send(admin, row, { type: "semana", title: "Sua semana fechou", body: w.done + " de " + (w.planned || w.done) + " treinos. Veja o resumo.", url: APP_URL + "?abrir=semana" })) sent++;
        await mark(row, "semana", lp.date);
      }
    } else if (row.owner_kind === "prof") {
      // 08:00: reavaliação vencida
      if (pr.reav !== false && window(lp, "08:00") && (row.last_sent || {}).reav !== lp.date) {
        const { data: rows } = await admin.from("cancio").select("data").like("id", "student_%");
        const due = (rows || []).map((r: any) => r.data).filter(reassessDue);
        if (due.length && await send(admin, row, { type: "reav", title: due.length === 1 ? "Reavaliação vencida" : due.length + " reavaliações vencidas", body: due.slice(0, 4).map((s: any) => first(s.name)).join(", "), url: APP_URL + "?abrir=alunos" })) sent++;
        await mark(row, "reav", lp.date);
      }
    }
  }
  return sent;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!VAPID_PRIVATE_KEY) return json({ error: "VAPID_PRIVATE_KEY não configurada" }, 500);
  webpush.setVapidDetails(APP_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  const action = body?.action;

  if (action === "cron") {
    const { data: secret } = await admin.rpc("push_cron_secret");
    if (!secret || req.headers.get("x-cron-secret") !== secret) return json({ error: "não autorizado" }, 403);
    return json({ ok: true, sent: await runCron(admin) });
  }

  // quem está chamando: aluno (código) ou professor (login)
  const prof = body?.who === "prof" ? await isProf(admin, req) : false;
  const st = body?.who === "student" ? await studentByCode(admin, String(body?.code || "")) : null;
  if (!prof && !st) return json({ error: "não autorizado" }, 403);
  const owner = prof ? { kind: "prof", id: PROF_UID } : { kind: "student", id: st.id };

  if (action === "subscribe") {
    const sub = body?.sub;
    if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return json({ error: "inscrição inválida" }, 400);
    const { error } = await admin.from("push_subscriptions").upsert({ owner_kind: owner.kind, owner_id: owner.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, prefs: body?.prefs || {}, tz: String(body?.tz || "America/Sao_Paulo"), updated_at: new Date().toISOString() }, { onConflict: "endpoint" });
    return error ? json({ error: "erro ao gravar" }, 500) : json({ ok: true });
  }
  if (action === "prefs") {
    const { error } = await admin.from("push_subscriptions").update({ prefs: body?.prefs || {}, tz: String(body?.tz || "America/Sao_Paulo"), updated_at: new Date().toISOString() }).eq("endpoint", String(body?.endpoint || "")).eq("owner_kind", owner.kind).eq("owner_id", owner.id);
    return error ? json({ error: "erro ao gravar" }, 500) : json({ ok: true });
  }
  if (action === "unsubscribe") {
    await admin.from("push_subscriptions").delete().eq("endpoint", String(body?.endpoint || "")).eq("owner_kind", owner.kind).eq("owner_id", owner.id);
    return json({ ok: true });
  }
  if (action === "test") {
    const n = await sendTo(admin, owner.kind, owner.id, "teste", { title: "Avisos ligados", body: "É assim que os avisos do Cancio Club vão chegar.", url: APP_URL });
    return json({ ok: true, sent: n });
  }

  if (action === "event") {
    const type = String(body?.type || "");
    if (st && ["dor", "recado", "fim"].includes(type)) {
      const name = first(st.name);
      const payload = type === "dor" ? { title: name + " sentiu dor agora", body: cut(body?.text), url: APP_URL + "?abrir=recados&aluno=" + st.id }
        : type === "recado" ? { title: "Recado de " + name, body: cut(body?.text), url: APP_URL + "?abrir=recados&aluno=" + st.id }
        : { title: name + " terminou o treino", body: cut(body?.text || ""), url: APP_URL + "?abrir=ficha&aluno=" + st.id };
      return json({ ok: true, sent: await sendTo(admin, "prof", null, type, payload) });
    }
    if (prof && ["resposta", "ficha"].includes(type)) {
      const sid = String(body?.studentId || "");
      const target = await studentById(admin, sid);
      if (!target) return json({ error: "aluno não encontrado" }, 404);
      const payload = type === "resposta" ? { title: "O professor respondeu", body: cut(body?.text), url: APP_URL + "?abrir=recados" }
        : { title: "Sua ficha mudou", body: cut(body?.text || "O professor atualizou o seu treino."), url: APP_URL + "?abrir=treino" + (body?.day ? "&dia=" + body.day : "") };
      return json({ ok: true, sent: await sendTo(admin, "student", sid, type, payload) });
    }
    return json({ error: "evento não permitido" }, 403);
  }

  return json({ error: "ação desconhecida" }, 400);
});
