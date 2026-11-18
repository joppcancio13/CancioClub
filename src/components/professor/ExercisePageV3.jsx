import React, { useState } from "react";
import { C, F, KICKER, COL_LABEL, NON_COUNTING_KINDS, PILL_V3 } from "../../styles/tokens";
import { haptic, uidShort } from "../../utils/misc";
import { ccConfirm } from "../../utils/confirm";
import { exerciseCatalog } from "../../data/exerciseCatalog";
import { groupActivation, fmtVol } from "../../utils/volumeCalculator";
import { daySummary, sortedHistory } from "../../utils/workout";
import { describe } from "../student/WorkoutV3";
import { CatalogPicker } from "../shared/CatalogPicker";

// Exercício aberto — design v4 (42b): página própria ao tocar na linha do Editar ficha.
// Topo com "DIA · 02 DE 06", nome e ativações por grupo; abas Prescrição | Histórico; ações no pé:
// Trocar exercício · Vídeo · Duplicar · Tirar da ficha. O subir/descer saiu daqui (arrastar na lista).

const KN = { warmup: ["Aquec.", PILL_V3.warmup], recon: ["Reconh.", PILL_V3.recon], working: ["Válida", PILL_V3.working] };
const ORD = ["warmup", "recon", "working"];
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const mmss = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

function ExercisePageV3({ ex, idx, total, dayShort, onBack, onUpdate, onSwap, onDuplicate, onRemove, onDeleteRecord }) {
    const [tab, setTab] = useState("presc");
    const [linkOpen, setLinkOpen] = useState(false);
    const [video, setVideo] = useState(null); // rascunho do link do vídeo
    const [name, setName] = useState(null); // rascunho do nome
    const [note, setNote] = useState(ex.note || "");
    const entry = ex.catalogId ? exerciseCatalog[ex.catalogId] : null;
    const act = entry ? Object.entries(groupActivation(entry)).sort((a, b) => b[1] - a[1]).map(([g, v]) => g + " " + fmtVol(v)).join(" · ") : "Fora da conta de volume";
    const plan = Array.isArray(ex.setPlan) && ex.setPlan.length ? ex.setPlan : [];
    const sug = describe(ex, "9999-12-31").sets; // carga sugerida de cada série (a da última sessão)
    const commit = (np) => { const wr = (np.find((s) => !NON_COUNTING_KINDS.has(s.kind)) || {}).reps || ex.reps || "10"; onUpdate({ setPlan: np, sets: np.filter((s) => !NON_COUNTING_KINDS.has(s.kind)).length || np.length, reps: wr, planAt: Date.now() }); };
    const cycle = (i) => { haptic("tick"); commit(plan.map((s, k) => (k === i ? { ...s, kind: ORD[(ORD.indexOf(s.kind) + 1) % 3] } : s))); };
    const setReps = (i, v) => commit(plan.map((s, k) => (k === i ? { ...s, reps: v } : s)));
    const addSet = () => { const last = plan[plan.length - 1] || { kind: "working", reps: ex.reps || "10" }; commit([...plan, { id: uidShort(), kind: "working", reps: last.kind === "working" ? last.reps : ex.reps || "10" }]); };
    const rmSet = () => { if (plan.length <= 1) return; commit(plan.slice(0, -1)); };

    // histórico: carga da série válida por sessão
    const hist = sortedHistory(ex.history || []).map((h) => ({ h, s: daySummary(h) })).filter((x) => typeof x.s.load === "number" && x.s.load > 0);
    const first = hist[0], lastH = hist[hist.length - 1];
    const gain = first && lastH && hist.length > 1 ? Math.round((lastH.s.load - first.s.load) * 10) / 10 : null;
    const pts = hist.slice(-12).map((x) => x.s.load);
    const spark = (() => { if (pts.length < 2) return ""; const mn = Math.min(...pts), mx = Math.max(...pts), sp = mx - mn || 1; return pts.map((v, i) => ((i / (pts.length - 1)) * 346 + 2).toFixed(1) + "," + (82 - ((v - mn) / sp) * 72).toFixed(1)).join(" "); })();
    const dLabel = (iso) => { const d = new Date(iso + "T12:00:00"); return ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d.getDay()] + " · " + d.getDate() + " " + MO[d.getMonth()]; };

    const actBtn = (label, onClick, color, icon) => (
        <button type="button" onClick={onClick} style={{ flex: 1, minWidth: 0, minHeight: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 14, border: "none", background: C.panel, color: color || C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><path d={icon} fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" /></svg>{label}
        </button>
    );
    const inp = { boxSizing: "border-box", width: "100%", minHeight: 48, padding: "0 14px", borderRadius: 12, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15 };

    return (
        <div role="dialog" aria-modal="true" aria-label={ex.name} style={{ position: "fixed", inset: 0, zIndex: 105, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", boxSizing: "border-box", padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 120px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={onBack} aria-label="Voltar" style={{ minHeight: 44, padding: "0 10px 0 0", border: "none", background: "none", color: C.text3, fontSize: 20, cursor: "pointer" }}>‹</button>
                    <span style={KICKER}>{dayShort + " · " + String(idx + 1).padStart(2, "0") + " de " + String(total).padStart(2, "0")}</span>
                </div>
                {name === null
                    ? <button type="button" onClick={() => setName(ex.name)} aria-label="Renomear" style={{ alignSelf: "flex-start", padding: 0, border: "none", background: "none", color: C.text, textAlign: "left", fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "110%", lineHeight: 1.1, cursor: "pointer" }}>{ex.name.toUpperCase()}</button>
                    : <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { const v = name.trim(); if (v && v !== ex.name) onUpdate({ name: v }); setName(null); }} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} aria-label="Nome do exercício" style={{ ...inp, fontFamily: F.display, fontSize: 22, fontWeight: 900 }} />}
                <button type="button" onClick={() => setLinkOpen(!linkOpen)} style={{ alignSelf: "flex-start", padding: 0, minHeight: 32, border: "none", background: "none", color: entry ? C.text2 : C.accent, fontFamily: F.body, fontSize: 13, textAlign: "left", cursor: "pointer" }}>{act + " ›"}</button>
                {linkOpen && <CatalogPicker label="Conta no volume como" value={ex.catalogId || ""} exerciseName={ex.name} onChange={(v) => { onUpdate({ catalogId: v || undefined }); setLinkOpen(false); }} />}

                <div role="tablist" style={{ marginTop: 6, display: "flex", padding: 4, borderRadius: 999, background: C.panel, alignSelf: "flex-start" }}>
                    {[["presc", "Prescrição"], ["hist", "Histórico"]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ minHeight: 40, padding: "0 16px", borderRadius: 999, border: "none", background: tab === k ? C.text : "transparent", color: tab === k ? C.bg : C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>)}
                </div>

                {tab === "presc" && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 0.8fr", gap: 8, padding: "6px 0" }}>{["SÉRIE", "REPS", "CARGA", "DESC."].map((l) => <span key={l} style={COL_LABEL}>{l}</span>)}</div>
                        {plan.map((s, i) => (
                            <div key={s.id || i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 0.8fr", gap: 8, alignItems: "center", minHeight: 48, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                                <button type="button" onClick={() => cycle(i)} aria-label={"Tipo da série: " + KN[s.kind][0] + ". Tocar troca"} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: 0, border: "none", background: "none", color: C.text, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>
                                    <span style={{ width: 14, height: 14, borderRadius: 3, ...KN[s.kind][1] }} />{KN[s.kind][0]}
                                </button>
                                <input value={s.reps || ""} onChange={(e) => setReps(i, e.target.value)} aria-label={"Repetições da série " + (i + 1)} style={{ ...inp, minHeight: 40, padding: "0 10px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }} />
                                <span style={{ fontSize: 15, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{sug[i] && sug[i].suggest.load ? br(sug[i].suggest.load) + " kg" : "—"}</span>
                                <span style={{ fontSize: 15, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{s.kind === "working" ? mmss(ex.rest || 90) : "1:00"}</span>
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" onClick={addSet} style={{ flex: 1, minHeight: 48, borderRadius: 12, border: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ Série</button>
                            <button type="button" onClick={rmSet} disabled={plan.length <= 1} style={{ flex: 1, minHeight: 48, borderRadius: 12, border: "none", background: C.panel, color: plan.length > 1 ? C.text : C.text4, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>− Série</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ ...KICKER, flex: 1 }}>Descanso das válidas</span>
                            <button type="button" onClick={() => onUpdate({ rest: Math.max(15, (ex.rest || 90) - 15) })} aria-label="Diminuir descanso" style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: C.panel, color: C.text, fontSize: 18, cursor: "pointer" }}>−</button>
                            <span style={{ width: 52, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{mmss(ex.rest || 90)}</span>
                            <button type="button" onClick={() => onUpdate({ rest: Math.min(600, (ex.rest || 90) + 15) })} aria-label="Aumentar descanso" style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: C.panel, color: C.text, fontSize: 18, cursor: "pointer" }}>+</button>
                        </div>
                        <span style={{ ...KICKER, marginTop: 8 }}>Observação</span>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => { if (note.trim() !== (ex.note || "")) onUpdate({ note: note.trim() || undefined }); }} rows={2} placeholder="Dica de execução pro aluno" aria-label="Observação" style={{ ...inp, padding: 12, resize: "none", lineHeight: 1.4 }} />
                        {video !== null && (
                            <>
                                <span style={{ ...KICKER, marginTop: 8 }}>Vídeo</span>
                                <input autoFocus value={video} onChange={(e) => setVideo(e.target.value)} onBlur={() => { if (video.trim() !== (ex.url || "")) onUpdate({ url: video.trim() || undefined }); setVideo(null); }} placeholder="Cole o link do vídeo" inputMode="url" aria-label="Link do vídeo" style={inp} />
                            </>
                        )}
                    </>
                )}

                {tab === "hist" && (
                    <>
                        <span style={{ ...KICKER, marginTop: 6 }}>Carga da série válida</span>
                        {lastH ? (
                            <>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                                    <span style={{ fontFamily: F.display, fontSize: 34, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{br(lastH.s.load) + " kg"}</span>
                                    {gain != null && <span style={{ fontSize: 15, color: C.text2 }}>{(gain === 0 ? "mesma carga" : (gain > 0 ? "+" : "−") + br(Math.abs(gain)) + " kg") + " desde " + MO[new Date(first.h.date + "T12:00:00").getMonth()]}</span>}
                                </div>
                                {spark && <svg viewBox="0 0 350 90" width="100%" aria-hidden="true" style={{ display: "block" }}><polyline points={spark} fill="none" stroke={C.text2} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></svg>}
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {[...hist].reverse().map(({ h, s }) => (
                                        <div key={h.date} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 48, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                                            <span style={{ flex: 1, fontSize: 15, color: C.text2 }}>{dLabel(h.date)}</span>
                                            <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{br(s.load) + " × " + (s.reps != null ? s.reps : "—")}</span>
                                            {onDeleteRecord && <button type="button" aria-label={"Apagar o registro de " + dLabel(h.date)} onClick={async () => { if (await ccConfirm("O registro de " + dLabel(h.date) + " sai do histórico deste exercício.", { title: "Apagar registro?", ok: "Apagar", danger: true })) onDeleteRecord(h); }} style={{ width: 44, height: 44, border: "none", background: "none", color: C.text3, fontSize: 18, cursor: "pointer" }}>×</button>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : <span style={{ fontSize: 15, color: C.text3 }}>Ainda sem carga registrada neste exercício.</span>}
                    </>
                )}
            </div>
            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "10px 12px calc(12px + env(safe-area-inset-bottom, 0px))", background: `linear-gradient(to top, ${C.bg} 75%, transparent)`, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 600, display: "flex", gap: 6 }}>
                    {actBtn("Trocar", onSwap, null, "M200 88l-32-32 32-32M168 56h40a24 24 0 0 1 24 24v16M56 168l32 32-32 32M88 200H48a24 24 0 0 1-24-24v-16")}
                    {actBtn("Vídeo", () => { setTab("presc"); setVideo(ex.url || ""); }, null, "M128 32a96 96 0 1 0 0 192 96 96 0 0 0 0-192ZM112 92l56 36-56 36z")}
                    {actBtn("Duplicar", onDuplicate, null, "M184 72V40H40v144h32M72 72h144v144H72z")}
                    {actBtn("Tirar", onRemove, C.accent, "M216 56H40M104 104v64M152 104v64M200 56v152a8 8 0 0 1-8 8H64a8 8 0 0 1-8-8V56M168 56V40a16 16 0 0 0-16-16h-48a16 16 0 0 0-16 16v16")}
                </div>
            </div>
        </div>
    );
}

export { ExercisePageV3 };
