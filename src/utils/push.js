// Avisos no celular (design v4 · 34a) — lado do app. Inscreve o aparelho no Web Push com a chave
// pública VAPID e conversa com a Edge Function `push` (supabase/functions/push). O aluno se identifica
// pelo código; o professor, pela sessão do Supabase Auth.
import { SUPABASE_URL, SUPABASE_ANON_KEY, sb } from "../lib/supabaseClient";

const VAPID_PUBLIC_KEY = "BJMF58AzzYt_YCKM0wkaqq7GuoaK5b6Lr0xu6xwasOPclajV1omYCDyDfgE_tdqhQx-bsX41FWOoE6GgP6G0Kx0";
const PREFS_KEY = "cancio:avisos";

const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
// iPhone/iPad: Web Push só funciona com o app instalado na tela inicial (iOS 16.4+)
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo"; } catch (e) { return "America/Sao_Paulo"; } };

function b64ToBytes(b64) {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function call(body, who) {
    let auth = SUPABASE_ANON_KEY;
    if (who === "prof" && sb) { try { const { data } = await sb.auth.getSession(); if (data && data.session) auth = data.session.access_token; } catch (e) { } }
    const res = await fetch(SUPABASE_URL + "/functions/v1/push", { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + auth }, body: JSON.stringify(body) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || "falha " + res.status);
    return out;
}

// service worker pronto, com limite: sem ele (dev, navegador sem suporte) a tela não fica presa esperando
const swReady = (ms = 4000) => Promise.race([navigator.serviceWorker.ready, new Promise((_, rej) => setTimeout(() => rej(new Error("O app ainda não terminou de instalar. Feche e abra de novo.")), ms))]);
const loadPrefs = (kind) => { try { const all = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); return all[kind] || null; } catch (e) { return null; } };
const savePrefs = (kind, prefs) => { try { const all = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); all[kind] = prefs; localStorage.setItem(PREFS_KEY, JSON.stringify(all)); } catch (e) { } };

async function currentSubscription() {
    if (!pushSupported()) return null;
    try { const reg = await swReady(); return await reg.pushManager.getSubscription(); } catch (e) { return null; }
}
// liga os avisos neste aparelho: pede permissão, inscreve e manda pro servidor
async function subscribePush(kind, auth, prefs) {
    if (!pushSupported()) throw new Error("Este navegador não recebe avisos.");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(perm === "denied" ? "Os avisos estão bloqueados nos ajustes do celular." : "Permissão não dada.");
    const reg = await swReady();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC_KEY) });
    await call({ action: "subscribe", who: kind, code: auth && auth.code, sub: sub.toJSON(), prefs, tz: tz() }, kind);
    savePrefs(kind, prefs);
    return sub;
}
async function updatePushPrefs(kind, auth, prefs) {
    savePrefs(kind, prefs);
    const sub = await currentSubscription(); if (!sub) return;
    await call({ action: "prefs", who: kind, code: auth && auth.code, endpoint: sub.endpoint, prefs, tz: tz() }, kind);
}
async function unsubscribePush(kind, auth) {
    const sub = await currentSubscription(); if (!sub) return;
    try { await call({ action: "unsubscribe", who: kind, code: auth && auth.code, endpoint: sub.endpoint }, kind); } catch (e) { }
    try { await sub.unsubscribe(); } catch (e) { }
}
const sendTestPush = (kind, auth) => call({ action: "test", who: kind, code: auth && auth.code }, kind);
// acontecimento que vira aviso pro outro lado — nunca trava o app (sem rede, só não avisa)
function pushEvent(kind, payload) {
    call({ action: "event", who: kind, ...payload }, kind).catch(() => { });
}

export { VAPID_PUBLIC_KEY, pushSupported, isIOS, isStandalone, currentSubscription, subscribePush, updatePushPrefs, unsubscribePush, sendTestPush, pushEvent, loadPrefs };
