import React, { useEffect, useMemo, useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { parseReps, sortedHistory } from "../../utils/workout";
import { describe } from "../student/WorkoutV3";

// Modo aula — design v3 (README · Professor 6, 20b): o professor registra pelo próprio celular, um
// exercício por vez, vendo a sessão passada série a série e anotando a técnica (vai pro histórico do
// aluno, em `techNotes` do dia). Barra de baixo: registrar → próximo exercício → encerrar e salvar.

const TECH = ["Desceu rápido", "Amplitude curta", "Compensou com a lombar", "Ótima execução"];
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WDL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const kicker = { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", textTransform: "uppercase" };
const colLabel = { fontFamily: F.display, fontSize: 10, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.1em" };
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const mmss = (sec) => { const s = Math.max(0, Math.floor(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const dateShort = (iso) => { const [y, m, d] = iso.split("-").map(Number); return WDL[new Date(y, m - 1, d).getDay()] + " " + d + " " + MO[m - 1]; };

function Stepper({ value, unit, onMinus, onPlus, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, borderRadius: 10, background: C.raised }}>
            <button type="button" aria-label={"Diminuir " + label} onClick={() => { haptic("tick"); onMinus(); }} style={{ width: 48, height: 56, border: "none", background: "none", fontSize: 22, color: C.text3, cursor: "pointer" }}>−</button>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, fontStretch: "110%", lineHeight: 1, ...num }}>{br(value)}</span><span style={{ fontSize: 11, color: C.text4 }}>{unit}</span></span>
            <button type="button" aria-label={"Aumentar " + label} onClick={() => { haptic("tick"); onPlus(); }} style={{ width: 48, height: 56, border: "none", background: "none", fontSize: 22, color: C.text3, cursor: "pointer" }}>+</button>
        </div>
    );
}

function AulaV3({ list, dayDate, studentName, restrictionOf, onAddLoad, onTech, onStart, onEnd, onExit }) {
    const rows = useMemo(() => list.map((ex) => describe(ex, dayDate)), [list, dayDate]);
    const [i, setI] = useState(() => { const k = rows.findIndex((r) => !r.allDone); return k < 0 ? 0 : k; });
    const [started] = useState(() => Date.now());
    const [now, setNow] = useState(Date.now());
    const [draft, setDraft] = useState(null);
    const [techDraft, setTechDraft] = useState(null);
    useEffect(() => { onStart && onStart(); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
    const r = rows[Math.min(i, rows.length - 1)];
    const cur = r && r.sets.find((s) => !s.done);
    useEffect(() => { setDraft(cur ? { load: cur.suggest.load, reps: cur.suggest.reps } : null); }, [r && r.ex.id, cur && cur.id]);
    if (!r) return null;

    const hist = sortedHistory(r.ex.history || []);
    const past = [...hist].reverse().find((h) => h.date < dayDate && Array.isArray(h.entries) && h.entries.length);
    const todayH = hist.find((h) => h.date === dayDate && Array.isArray(h.entries));
    const techNotes = (todayH && todayH.techNotes) || [];
    const restr = restrictionOf(r.ex.name);
    const allDone = rows.every((x) => x.allDone);
    const nextI = rows.findIndex((x, k) => k > i && !x.allDone);
    const setTech = (notes) => onTech(r.ex.id, dayDate, notes);
    const toggleTech = (t) => setTech(techNotes.includes(t) ? techNotes.filter((x) => x !== t) : [...techNotes, t]);
    const register = () => { if (!cur || !draft) return; haptic("confirm"); onAddLoad(r.ex.id, { date: dayDate, setId: cur.id, kind: cur.kind, targetReps: cur.target, load: draft.load, reps: draft.reps, checkPR: false }); };
    const step = (v) => (v < 10 ? 1 : 2.5);
    const btnMain = { height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" };

    return (
        <div role="dialog" aria-modal="true" aria-label="Modo aula" style={{ position: "fixed", inset: 0, zIndex: 99, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", paddingTop: "calc(16px + env(safe-area-inset-top, 0px))", paddingBottom: 260, paddingLeft: "max(20px, env(safe-area-inset-left, 0px))", paddingRight: "max(20px, env(safe-area-inset-right, 0px))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ ...kicker, flex: 1, color: C.text2, ...num }}>Modo aula · {String(studentName || "").split(" ")[0]} · {mmss((now - started) / 1000)}</span>
                    <button type="button" onClick={onExit} style={{ minHeight: 44, padding: 0, border: "none", background: "none", color: C.text4, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Sair</button>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" aria-label="Exercício anterior" disabled={i === 0} onClick={() => setI(i - 1)} style={{ width: 36, height: 36, marginLeft: -8, border: "none", background: "none", fontSize: 18, color: i === 0 ? C.dim : C.text3, cursor: "pointer" }}>‹</button>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 13, color: C.text3, ...num }}>{i + 1} de {rows.length}</span>
                    <button type="button" aria-label="Próximo exercício" disabled={i >= rows.length - 1} onClick={() => setI(i + 1)} style={{ width: 36, height: 36, marginRight: -8, border: "none", background: "none", fontSize: 18, color: i >= rows.length - 1 ? C.dim : C.text3, cursor: "pointer" }}>›</button>
                </div>
                <div style={{ marginTop: 8, fontFamily: F.display, fontSize: 24, fontWeight: 900, fontStretch: "125%", lineHeight: 1.05 }}>{r.ex.name}</div>
                <span style={{ display: "block", marginTop: 6, fontSize: 13, color: C.text3, ...num }}>
                    Alvo {r.alvo} · descanso {mmss(r.rest)}
                    {restr && <span style={{ marginLeft: 8, color: C.accent, fontWeight: 700 }}>● {restr.region}</span>}
                </span>

                <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 16, background: C.panel, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ ...kicker, color: C.text4 }}>{past ? "Sessão passada · " + dateShort(past.date) : "Primeira vez deste exercício"}</span>
                    {past && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
                            {r.sets.map((s) => { const e = past.entries.find((x) => x.setId === s.id); return (
                                <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <span style={{ fontSize: 11, color: C.text4 }}>{s.n}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: e ? C.text : C.text4, ...num }}>{e && typeof e.load === "number" ? br(e.load) + " × " + (e.reps ?? "—") : "—"}</span>
                                </div>
                            ); })}
                        </div>
                    )}
                    {past && past.studentNote && <span style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>Nota: “{past.studentNote}”</span>}
                    {r.ex.profNote && <span style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>Sua nota: “{r.ex.profNote}”</span>}
                </div>

                <div style={{ ...kicker, marginTop: 16, color: C.text4 }}>Hoje</div>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column" }}>
                    {r.sets.map((s) => {
                        const isCur = cur && s.id === cur.id;
                        return (
                            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", ...divider, fontSize: 15, color: s.done ? C.text3 : isCur ? C.text : C.text4 }}>
                                <span style={{ width: 22, fontSize: s.working ? 15 : 11, fontWeight: 800 }}>{s.n}</span>
                                <span style={{ flex: 1, fontWeight: isCur ? 700 : 400, ...num }}>{s.done ? br(s.log.load) + " kg × " + s.log.reps : "alvo " + (s.target || "—")}</span>
                                {s.done && <span style={{ color: C.text2 }}>✓</span>}
                                {isCur && <span style={{ ...colLabel, color: C.text2 }}>AGORA ↓</span>}
                            </div>
                        );
                    })}
                </div>

                <div style={{ ...kicker, marginTop: 14, color: C.text4 }}>Técnica · vai pro histórico do aluno</div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[...TECH, ...techNotes.filter((t) => !TECH.includes(t))].map((t) => { const on = techNotes.includes(t); return (
                        <button key={t} type="button" aria-pressed={on} onClick={() => toggleTech(t)} style={{ minHeight: 40, padding: "0 12px", borderRadius: 999, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}`, fontFamily: F.body, fontSize: 13, fontWeight: on ? 700 : 400, cursor: "pointer" }}>{t}</button>
                    ); })}
                    {techDraft == null && <button type="button" onClick={() => setTechDraft("")} style={{ minHeight: 40, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>+ Escrever</button>}
                </div>
                {techDraft != null && (
                    <input autoFocus value={techDraft} onChange={(e) => setTechDraft(e.target.value)} placeholder="Observação e Enter" aria-label="Observação de técnica"
                        onKeyDown={(e) => { if (e.key === "Enter") { const v = techDraft.trim(); if (v && !techNotes.includes(v)) setTech([...techNotes, v]); setTechDraft(null); } if (e.key === "Escape") setTechDraft(null); }}
                        onBlur={() => { const v = (techDraft || "").trim(); if (v && !techNotes.includes(v)) setTech([...techNotes, v]); setTechDraft(null); }}
                        style={{ marginTop: 8, width: "100%", boxSizing: "border-box", height: 48, padding: "0 14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15 }} />
                )}
            </div>

            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 660, background: C.panel, borderRadius: "24px 24px 0 0", padding: "14px 12px calc(14px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}>
                    {cur && draft ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "0 4px" }}>
                                <span style={{ ...colLabel, color: C.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.ex.name.toUpperCase()} · {cur.label}</span>
                                <span style={{ ...colLabel, color: C.text4, flex: "none" }}>{r.sets.indexOf(cur) + 1} DE {r.sets.length}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
                                <Stepper label="carga" unit="kg" value={draft.load} onMinus={() => setDraft((d) => ({ ...d, load: Math.max(0, d.load - step(d.load)) }))} onPlus={() => setDraft((d) => ({ ...d, load: d.load + step(d.load) }))} />
                                <Stepper label="repetições" unit="reps" value={draft.reps} onMinus={() => setDraft((d) => ({ ...d, reps: Math.max(1, (parseReps(d.reps) || 1) - 1) }))} onPlus={() => setDraft((d) => ({ ...d, reps: (parseReps(d.reps) || 0) + 1 }))} />
                            </div>
                            <button type="button" style={btnMain} onClick={register}>Feito</button>
                        </>
                    ) : !allDone ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}><span style={{ ...colLabel, color: C.text2 }}>EXERCÍCIO FEITO</span><span style={{ ...colLabel, color: C.text4 }}>{nextI >= 0 ? rows[nextI].ex.name.toUpperCase() : ""}</span></div>
                            <button type="button" style={btnMain} onClick={() => setI(nextI >= 0 ? nextI : rows.findIndex((x) => !x.allDone))}>Próximo exercício →</button>
                        </>
                    ) : (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}><span style={{ ...colLabel, color: C.text2 }}>AULA COMPLETA</span><span style={{ ...colLabel, color: C.text4, ...num }}>{mmss((now - started) / 1000)}</span></div>
                            <button type="button" style={btnMain} onClick={onEnd}>Encerrar e salvar</button>
                        </>
                    )}
                    {!allDone && rows.some((x) => x.sets.some((s) => s.done)) && <button type="button" onClick={onEnd} style={{ minHeight: 36, border: "none", background: "none", color: C.text4, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>Encerrar aula agora e salvar</button>}
                </div>
            </div>
        </div>
    );
}

export { AulaV3 };
