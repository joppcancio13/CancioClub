import { GREET_MANHA, GREET_NOITE, GREET_TARDE } from "../styles/tokens";
import { todayISO } from "./date";
import { seed } from "./seedData";

/* ---------------------------- helpers ---------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const genCode = () => String(Math.floor(1000 + Math.random() * 9000));
/* ---- séries (aquecimento/trabalho) — compatível com histórico antigo ---- */
const uidShort = () => Math.random().toString(36).slice(2, 7);
// vibração tátil nos pontos de CONFIRMAÇÃO de estado (não em toda interação — isso cansaria em
// segundos). "tick" já existia isolado dentro do PressStep; centralizado aqui pra reuso.
const HAPTIC = { tick: 10, confirm: [8, 40, 14], record: [10, 30, 10, 30, 22] };
function haptic(pattern) {
    try {
        navigator.vibrate && navigator.vibrate(HAPTIC[pattern] ?? pattern);
    }
    catch (e) { }
}
// escolhe uma frase de forma estável ao longo do dia (mesma pessoa + mesmo dia = mesma frase), sem depender de Math.random puro
function pickDailyPhrase(list, seedStr) {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++)
        h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    return list[h % list.length];
}
function greeting(seed, isTraining) {
    const h = new Date().getHours();
    if (!isTraining) {
        return h < 12 ? "Bom dia," : h < 18 ? "Boa tarde," : "Boa noite,";
    }
    const list = h < 12 ? GREET_MANHA : h < 18 ? GREET_TARDE : GREET_NOITE;
    return pickDailyPhrase(list, todayISO() + "greet" + (seed || ""));
}
/* --------------------- bola de espelhos (SVG) --------------------- */
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lerpColor(h1, h2, t) { const P = (o) => parseInt(o, 16); const a = h1.replace("#", ""), b = h2.replace("#", ""); const r = Math.round(P(a.slice(0, 2)) + (P(b.slice(0, 2)) - P(a.slice(0, 2))) * t); const g = Math.round(P(a.slice(2, 4)) + (P(b.slice(2, 4)) - P(a.slice(2, 4))) * t); const bl = Math.round(P(a.slice(4, 6)) + (P(b.slice(4, 6)) - P(a.slice(4, 6))) * t); return `rgb(${r},${g},${bl})`; }
// centraliza usando a API nativa do canvas (textAlign) — aplica letterSpacing só se o navegador suportar; sem centralização manual
function drawCentered(ctx, text, cx, y, spacing) {
    const prevAlign = ctx.textAlign, prevSpacing = ctx.letterSpacing;
    ctx.textAlign = "center";
    if (spacing && "letterSpacing" in ctx)
        ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(text, cx, y);
    ctx.textAlign = prevAlign;
    if ("letterSpacing" in ctx)
        ctx.letterSpacing = prevSpacing || "0px";
}
// referência estável pros props de ação que a view do aluno não usa (onRemove/onMove/onDeleteRecord)
// — module-scope em vez de `() => {}` inline, senão vira uma prop nova a cada render e derruba
// o React.memo do ExerciseCard mesmo quando nada relevante mudou
const noop = () => { };
/* --------------------------- exercise ---------------------------- */
function ytId(url) { const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; }
export { uid, genCode, uidShort, HAPTIC, haptic, pickDailyPhrase, greeting, mulberry32, lerpColor, drawCentered, noop, ytId };
