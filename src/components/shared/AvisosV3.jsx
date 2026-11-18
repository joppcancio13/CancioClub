import React, { useEffect, useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { pushSupported, isIOS, isStandalone, currentSubscription, subscribePush, updatePushPrefs, unsubscribePush, sendTestPush, loadPrefs } from "../../utils/push";

// Avisos — design v4 (34a): um interruptor por tipo, horário do lembrete (aluno) e silêncio.
// Professor: Mais › Avisos. Aluno: Perfil › Avisos. "Sentiu dor" toca mesmo no silêncio.

const TYPES = {
    prof: [["dor", "Sentiu dor", "Na hora, mesmo no silêncio · abre o recado"], ["recado", "Recado novo", "Na hora · abre a conversa"], ["fim", "Terminou o treino", "Na hora · abre a ficha do aluno"], ["reav", "Reavaliação vencida", "Às 08:00 · abre a lista de alunos"]],
    student: [["resposta", "O professor respondeu", "Na hora · abre os recados"], ["ficha", "Sua ficha mudou", "Na hora · abre o treino"], ["lembrete", "Lembrete do treino", "Nos dias com treino, no horário abaixo"], ["semana", "Resumo da semana", "Domingo às 18:00"]],
};
const defaults = (kind) => ({ ...Object.fromEntries(TYPES[kind].map(([k]) => [k, true])), silencioDe: "22:00", silencioAte: "07:00", lembreteHora: "07:30" });

function Toggle({ on }) {
    return <span aria-hidden="true" style={{ flex: "none", width: 46, height: 28, borderRadius: 999, background: on ? C.text : C.raised, position: "relative", transition: "background .15s" }}><span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: on ? C.bg : C.text3, transition: "left .15s" }} /></span>;
}

function AvisosV3({ kind, auth, onBack, backLabel }) {
    const [state, setState] = useState("loading"); // loading · off · on · unsupported · ios
    const [prefs, setPrefs] = useState(() => ({ ...defaults(kind), ...(loadPrefs(kind) || {}) }));
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    useEffect(() => {
        if (!pushSupported()) { setState(isIOS() && !isStandalone() ? "ios" : "unsupported"); return; }
        currentSubscription().then((s) => setState(s && Notification.permission === "granted" ? "on" : "off"));
    }, []);
    const run = async (fn, ok) => { setBusy(true); setMsg(""); try { await fn(); if (ok) setMsg(ok); } catch (e) { setMsg(e && e.message ? e.message : "Não deu certo. Tente de novo."); } setBusy(false); };
    const turnOn = () => run(async () => { await subscribePush(kind, auth, prefs); haptic("confirm"); setState("on"); }, "Avisos ligados neste aparelho.");
    const turnOff = () => run(async () => { await unsubscribePush(kind, auth); setState("off"); }, "Avisos desligados neste aparelho.");
    const change = (patch) => { const p = { ...prefs, ...patch }; setPrefs(p); haptic("tick"); if (state === "on") updatePushPrefs(kind, auth, p).catch(() => setMsg("Não deu pra salvar agora. Tente de novo com internet.")); };
    const timeInput = (k, label) => (
        <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "0 14px", background: C.panel }}>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{label}</span>
            <input type="time" value={prefs[k]} onChange={(e) => change({ [k]: e.target.value })} disabled={state !== "on"} style={{ minHeight: 40, padding: "0 10px", borderRadius: 10, border: "none", background: C.raised, color: C.text, fontFamily: F.body, fontSize: 15, colorScheme: "dark" }} />
        </label>
    );
    const group = { display: "flex", flexDirection: "column", gap: 2, borderRadius: 16, overflow: "hidden" };
    return (
        <div style={{ display: "flex", flexDirection: "column", color: C.text, fontFamily: F.body }}>
            <button type="button" onClick={onBack} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>{"‹ " + (backLabel || "Voltar")}</button>
            <span style={{ fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>AVISOS</span>
            {state === "ios" && <span style={{ marginTop: 12, fontSize: 15, lineHeight: 1.45, color: C.text2 }}>No iPhone, os avisos só funcionam com o app na tela inicial: toque em Compartilhar › "Adicionar à Tela de Início", abra o Cancio Club por lá e volte aqui.</span>}
            {state === "unsupported" && <span style={{ marginTop: 12, fontSize: 15, lineHeight: 1.45, color: C.text2 }}>Este navegador não recebe avisos. Abra o app pelo Chrome (Android) ou instale na tela inicial (iPhone).</span>}
            {state === "off" && (
                <>
                    <span style={{ marginTop: 12, fontSize: 15, lineHeight: 1.45, color: C.text3 }}>{kind === "prof" ? "Receba no celular quando um aluno sentir dor, mandar recado ou terminar o treino." : "Receba no celular quando o professor responder ou mudar sua ficha, e um lembrete nos dias de treino."}</span>
                    <button type="button" onClick={turnOn} disabled={busy} style={{ marginTop: 16, height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{busy ? "Ligando…" : "Ligar avisos neste aparelho"}</button>
                </>
            )}
            {(state === "on" || state === "off") && (
                <>
                    <span style={{ ...KICKER, marginTop: 22 }}>{kind === "prof" ? "Alunos" : "O que avisar"}</span>
                    <div style={{ ...group, marginTop: 8, opacity: state === "on" ? 1 : 0.5 }}>
                        {TYPES[kind].map(([k, t, s]) => (
                            <button key={k} type="button" role="switch" aria-checked={prefs[k] !== false} disabled={state !== "on"} onClick={() => change({ [k]: prefs[k] === false })}
                                style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 64, padding: "10px 14px", border: "none", background: C.panel, color: C.text, textAlign: "left", cursor: state === "on" ? "pointer" : "default", fontFamily: F.body }}>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span><span style={{ fontSize: 13, color: C.text3 }}>{s}</span></span>
                                <Toggle on={prefs[k] !== false} />
                            </button>
                        ))}
                    </div>
                    <span style={{ ...KICKER, marginTop: 22 }}>Horário</span>
                    <div style={{ ...group, marginTop: 8, opacity: state === "on" ? 1 : 0.5 }}>
                        {kind === "student" && timeInput("lembreteHora", "Hora do lembrete")}
                        {timeInput("silencioDe", "Silêncio a partir de")}
                        {timeInput("silencioAte", "Silêncio até")}
                    </div>
                    <span style={{ marginTop: 8, fontSize: 13, color: C.text3 }}>{kind === "prof" ? "No silêncio nada toca, a não ser \"Sentiu dor\"." : "No silêncio nada toca."}</span>
                </>
            )}
            {state === "on" && (
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                    <button type="button" onClick={() => run(() => sendTestPush(kind, auth), "Aviso de teste enviado. Se não chegar em alguns segundos, confira os ajustes do celular.")} disabled={busy} style={{ minHeight: 52, borderRadius: 14, border: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Mandar um aviso de teste</button>
                    <button type="button" onClick={turnOff} disabled={busy} style={{ minHeight: 44, border: "none", background: "none", color: C.accent, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Desligar neste aparelho</button>
                </div>
            )}
            {msg && <span role="status" style={{ marginTop: 12, fontSize: 13, color: C.text2 }}>{msg}</span>}
        </div>
    );
}

export { AvisosV3 };
