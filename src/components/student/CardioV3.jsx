import React, { useEffect, useState } from "react";
import { C, F, KICKER, COL_LABEL, PROGRESS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Cardio — design v4 (39b): dia de cardio da ficha. Nome, ALVO / ÚLTIMA / ESFORÇO e a nota do
// professor; a barra vira um cronômetro grande que enche até o alvo, com pausar e Terminar; depois o
// registro com o tempo já preenchido, km opcional, esforço (Leve / Moderado / Forte) e Feito.
// Quem usa o relógio da esteira toca Terminar logo de cara e vai direto para o registro.

const EFFORTS = [["leve", "Leve"], ["moderado", "Moderado"], ["forte", "Forte"]];
const mmss = (sec) => { const s = Math.max(0, Math.floor(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const KEY = "cancio:cardio";

function CardioV3({ weekday, plan, last, autoStart, bottomOffset = 0, onExit, onDone }) {
    const p = plan && typeof plan === "object" ? plan : {};
    const activity = p.activity || "Cardio";
    const target = Number(p.target) || 0; // minutos
    // cronômetro guardado no aparelho: sobrevive a recarregar a página no meio do cardio
    const [t, setT] = useState(() => { try { const v = JSON.parse(sessionStorage.getItem(KEY) || "null"); return v && v.activity === activity ? v : autoStart ? { activity, start: Date.now(), acc: 0, paused: false } : null; } catch (e) { return null; } });
    const [log, setLog] = useState(null); // { min, km, effort } depois de Terminar
    const [now, setNow] = useState(Date.now());
    useEffect(() => { try { if (t) sessionStorage.setItem(KEY, JSON.stringify(t)); else sessionStorage.removeItem(KEY); } catch (e) { } }, [t]);
    useEffect(() => { if (!t || t.paused) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [t]);
    const elapsed = t ? t.acc + (t.paused ? 0 : (now - t.start) / 1000) : 0;
    const pct = target ? Math.min(100, (elapsed / (target * 60)) * 100) : 0;

    const start = () => { haptic("confirm"); setT({ activity, start: Date.now(), acc: 0, paused: false }); };
    const toggle = () => { haptic("tick"); setT((x) => (x.paused ? { ...x, paused: false, start: Date.now() } : { ...x, paused: true, acc: x.acc + (Date.now() - x.start) / 1000 })); };
    const stop = () => { haptic("confirm"); setLog({ min: Math.max(1, Math.round(elapsed / 60)) || target || 1, km: 0, effort: p.effort || null }); setT(null); };
    const done = () => { if (!log) return; haptic("confirm"); onDone({ activity, minutes: log.min, km: log.km || undefined, effort: log.effort || undefined }); };

    const cols = [["ALVO", target ? target + " min" : "—"], ["ÚLTIMA", last ? last.minutes + " min" : "—"], ["ESFORÇO", p.effort || "—"]];
    const btnMain = { height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" };
    const btnSec = { height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" };
    const stepper = (v, unit, minus, plus) => (
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6, padding: 6, borderRadius: 14, background: C.bg }}>
            <button type="button" onClick={minus} aria-label="Diminuir" style={{ width: 44, height: 44, flex: "none", borderRadius: 10, border: "none", background: C.raised, color: C.text, fontSize: 20, cursor: "pointer" }}>−</button>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                <span style={{ fontSize: 11, color: C.text3 }}>{unit}</span>
            </span>
            <button type="button" onClick={plus} aria-label="Aumentar" style={{ width: 44, height: 44, flex: "none", borderRadius: 10, border: "none", background: C.raised, color: C.text, fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 260, color: C.text, fontFamily: F.body }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={KICKER}>{weekday} · CARDIO</span>
                <button type="button" onClick={onExit} style={{ minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Sair</button>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 38, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>CARDIO</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{activity}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                {cols.map(([l, v]) => <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={COL_LABEL}>{l}</span><span style={{ fontSize: 15, fontWeight: 700 }}>{v}</span></div>)}
            </div>
            {p.note && <div style={{ fontSize: 15, lineHeight: 1.45, color: C.text2 }}>{"“" + p.note + "”"}</div>}

            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 660, boxSizing: "border-box", background: C.panel, borderRadius: "24px 24px 0 0", padding: `14px 12px calc(${14 + bottomOffset}px + env(safe-area-inset-bottom, 0px))`, display: "flex", flexDirection: "column", gap: 12 }}>
                    {log ? (
                        <>
                            <span style={{ ...COL_LABEL, color: C.text2, padding: "0 4px" }}>{activity.toUpperCase()} · COMO FOI</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                {stepper(String(log.min), "min", () => setLog((l) => ({ ...l, min: Math.max(1, l.min - 1) })), () => setLog((l) => ({ ...l, min: l.min + 1 })))}
                                {stepper(log.km ? br(log.km) : "—", "km · opcional", () => setLog((l) => ({ ...l, km: Math.max(0, Math.round((l.km - 0.1) * 10) / 10) })), () => setLog((l) => ({ ...l, km: Math.round((l.km + 0.1) * 10) / 10 })))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                                {EFFORTS.map(([k, l]) => { const on = log.effort === k; return <button key={k} type="button" aria-pressed={on} onClick={() => setLog((x) => ({ ...x, effort: on ? null : k }))} style={{ height: 44, borderRadius: 10, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}`, fontFamily: F.body, fontSize: 13, fontWeight: on ? 700 : 400, cursor: "pointer" }}>{l}</button>; })}
                            </div>
                            <button type="button" onClick={done} style={btnMain}>Feito</button>
                        </>
                    ) : t ? (
                        <>
                            <span style={{ ...COL_LABEL, color: C.text2, padding: "0 4px" }}>{activity.toUpperCase() + (target ? " · ALVO " + target + ":00" : "")}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 4px" }}>
                                <span style={{ flex: 1, fontFamily: F.display, fontSize: 56, fontWeight: 900, fontStretch: "125%", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{mmss(elapsed)}</span>
                                <button type="button" onClick={toggle} aria-label={t.paused ? "Continuar" : "Pausar"} style={{ width: 56, height: 56, flex: "none", borderRadius: 16, border: "none", background: C.raised, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="22" height="22" viewBox="0 0 256 256" aria-hidden="true">{t.paused ? <path d="M80 48l128 80-128 80z" fill="currentColor" /> : <path d="M72 48h40v160H72zM144 48h40v160h-40z" fill="currentColor" />}</svg>
                                </button>
                            </div>
                            {target > 0 && <div style={{ height: 6, borderRadius: 3, background: C.raised, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", backgroundImage: PROGRESS, transition: "width .25s linear" }} /></div>}
                            <button type="button" onClick={stop} style={btnSec}>Terminar</button>
                        </>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                            <button type="button" onClick={() => { haptic("tick"); setLog({ min: target || 30, km: 0, effort: p.effort || null }); }} style={btnSec}>Já fiz</button>
                            <button type="button" onClick={start} style={btnMain}>Começar cardio</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { CardioV3 };
