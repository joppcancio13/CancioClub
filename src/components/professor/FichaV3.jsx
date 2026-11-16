import React, { useMemo, useRef, useState } from "react";
import { C, DAYS, F, NON_COUNTING_KINDS } from "../../styles/tokens";
import { GROUP_ORDER, fmtVol, plannedGroupVolume } from "../../utils/volumeCalculator";
import { repsCeiling, parseReps } from "../../utils/workout";
import { describe } from "../student/WorkoutV3";

// Ficha do aluno no professor — design v3 (README · Professor 3 "Ficha", 17b página única + 27b
// prescrito × feito). Seções que rolam (Semana, Rendimento, Volume, Ficha do dia) com atalhos no topo;
// "Abrir ›" / "Editar ›" levam às telas completas que já existem (aba Rendimento, Volume, Treino).

const WD_SHORT = { seg: "SEG", ter: "TER", qua: "QUA", qui: "QUI", sex: "SEX", sab: "SÁB", dom: "DOM" };
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WDL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const kicker = { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", textTransform: "uppercase", color: C.text4 };
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const linkBtn = { background: "none", border: "none", padding: 0, minHeight: 36, color: C.text2, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const dateShort = (iso) => { const [y, m, d] = iso.split("-").map(Number); return WDL[new Date(y, m - 1, d).getDay()] + " · " + d + " " + MO[m - 1]; };
const mondayISO = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

// status de um exercício numa sessão: séries válidas feitas × prescritas e reps contra a meta
function statusOf(r) {
    const work = r.sets.filter((s) => !NON_COUNTING_KINDS.has(s.kind));
    const done = work.filter((s) => s.done);
    if (!done.length) return { t: "não fez", c: C.text4 };
    if (done.length < work.length) return { t: done.length + " de " + work.length, c: C.accent };
    const low = done.some((s) => { const min = parseInt(String(s.target || "").split(/[-–]/)[0]); const reps = parseReps(s.log.reps); return min && reps != null && reps < min; });
    const high = done.every((s) => { const c = repsCeiling(s.target); const reps = parseReps(s.log.reps); return c && reps != null && reps >= c; });
    return low ? { t: "abaixo", c: C.accent } : high ? { t: "no teto", c: C.text } : { t: "no alvo", c: C.text2 };
}

function FichaV3({ student, week, dayNames, sessions, todayKey, rend, onAula, onEdit, onOpenRend, onOpenVol }) {
    const refs = { semana: useRef(null), rend: useRef(null), vol: useRef(null), ficha: useRef(null) };
    const [openEx, setOpenEx] = useState(null);
    const days = DAYS.filter((d) => (week[d.key] || []).length);
    const nameOf = (k) => String((dayNames && dayNames[k]) || (DAYS.find((d) => d.key === k) || {}).full || "").split("·")[0].trim();
    const mon = mondayISO();
    const weekSess = (sessions || []).filter((s) => s.date >= mon);
    const todayList = week[todayKey] || [];
    const todaySets = todayList.reduce((n, ex) => n + describe(ex, "0000-00-00").sets.length, 0);

    // ficha em destaque: a de hoje; sem treino hoje, a do último treino feito
    const lastSess = [...(sessions || [])].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const focusKey = todayList.length ? todayKey : lastSess && (week[lastSess.day] || []).length ? lastSess.day : (days[0] && days[0].key);
    const focusList = (focusKey && week[focusKey]) || [];
    const lastForFocus = [...(sessions || [])].filter((s) => s.day === focusKey).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const pvRows = focusList.map((ex) => describe(ex, lastForFocus ? lastForFocus.date : "0000-00-00"));
    const pvDone = pvRows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);
    const pvTotal = pvRows.reduce((n, r) => n + r.sets.length, 0);

    const vol = useMemo(() => plannedGroupVolume(week), [week]);
    const volRows = GROUP_ORDER.map((g) => ({ g, v: vol.values[g] || 0 })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
    const vmax = Math.max(1, ...volRows.map((x) => x.v));

    const go = (k) => { const el = refs[k].current; if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" }); };
    const stats = [[rend.volDelta != null ? (rend.volDelta > 0 ? "+" : "") + rend.volDelta + "%" : "–", "volume semanal"], [rend.freqPct != null ? rend.freqPct + "%" : "–", "frequência"], [rend.prTotal + " ★", "recordes"]];

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: C.panel, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={kicker}>Aula hoje?</span>
                    <span style={{ fontSize: 15, ...num }}>{todayList.length ? nameOf(todayKey) + " · " + todaySets + " séries" : "Sem treino na ficha de hoje"}</span>
                </div>
                {todayList.length > 0 && <button type="button" onClick={onAula} style={{ flex: "none", height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Modo aula</button>}
            </div>

            <div style={{ position: "sticky", top: "env(safe-area-inset-top, 0px)", zIndex: 5, margin: "14px -20px 0", padding: "10px 20px", background: C.bg, boxShadow: `inset 0 -1px 0 ${C.line}`, display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                {[["semana", "Semana"], ["rend", "Rendimento"], ["vol", "Volume"], ["ficha", "Ficha"]].map(([k, l]) => (
                    <button key={k} type="button" onClick={() => go(k)} style={{ flex: "none", minHeight: 36, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>{l}</button>
                ))}
            </div>

            <div ref={refs.semana} style={{ ...kicker, paddingTop: 16 }}>Semana</div>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>
                {days.length === 0 && <span style={{ fontSize: 13, color: C.text3, padding: "11px 0" }}>Ficha vazia. Monte em "Editar ficha".</span>}
                {days.map((d) => {
                    const isToday = d.key === todayKey;
                    const done = weekSess.some((s) => s.day === d.key);
                    return (
                        <button key={d.key} type="button" onClick={() => onEdit(d.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", border: "none", ...divider, color: C.text, textAlign: "left", cursor: "pointer" }}>
                            <span style={{ width: 36, fontSize: 13, fontWeight: isToday ? 800 : 400, color: isToday ? C.text : C.text4 }}>{WD_SHORT[d.key]}</span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 15 }}>{nameOf(d.key)}</span>
                            {done ? <span aria-label="feito" style={{ color: C.text2 }}>✓</span> : isToday ? <span style={{ ...kicker, fontSize: 10, color: C.text2 }}>Hoje</span> : null}
                        </button>
                    );
                })}
            </div>

            <div ref={refs.rend} style={{ paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={kicker}>Rendimento · {rend.freqWeeks} {rend.freqWeeks === 1 ? "semana" : "semanas"}</span>
                <button type="button" onClick={onOpenRend} style={linkBtn}>Abrir ›</button>
            </div>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                {stats.map(([v, l]) => <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, fontStretch: "110%", ...num }}>{v}</span><span style={{ fontSize: 11, color: C.text4 }}>{l}</span></div>)}
            </div>

            <div ref={refs.vol} style={{ paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={kicker}>Volume por músculo · séries na semana</span>
                <button type="button" onClick={onOpenVol} style={{ ...linkBtn, flex: "none" }}>Feito ›</button>
            </div>
            <span style={{ fontSize: 13, color: C.text3 }}>Prescrito em todas as fichas, pela ativação de cada exercício.</span>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {volRows.length === 0 && <span style={{ fontSize: 13, color: C.text3 }}>Nenhum exercício vinculado ao catálogo ainda.</span>}
                {volRows.map((x) => (
                    <div key={x.g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 96, fontSize: 13 }}>{x.g}</span>
                        <span style={{ flex: 1, height: 8, borderRadius: 4, background: C.raised, overflow: "hidden" }}><span style={{ display: "block", width: Math.round((x.v / vmax) * 100) + "%", height: "100%", background: C.text2, borderRadius: 4 }} /></span>
                        <span style={{ width: 40, textAlign: "right", fontSize: 13, fontWeight: 700, ...num }}>{fmtVol(x.v)}</span>
                    </div>
                ))}
                {vol.unmatched > 0 && <button type="button" onClick={onOpenVol} style={{ ...linkBtn, alignSelf: "flex-start", color: C.text3 }}>{vol.unmatched} {vol.unmatched === 1 ? "exercício fora da conta" : "exercícios fora da conta"} · Vincular ›</button>}
            </div>

            {focusKey && (
                <>
                    <div ref={refs.ficha} style={{ paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={kicker}>Ficha de {(DAYS.find((d) => d.key === focusKey) || {}).full} · {nameOf(focusKey)}</span>
                        <button type="button" onClick={() => onEdit(focusKey)} style={{ ...linkBtn, flex: "none" }}>Editar ›</button>
                    </div>
                    <span style={{ fontSize: 13, color: C.text3, ...num }}>{lastForFocus ? "Última sessão · " + dateShort(lastForFocus.date) + " · " + pvDone + " de " + pvTotal + " séries" : "Ainda não feita"}</span>
                    <div style={{ marginTop: 4, display: "flex", flexDirection: "column" }}>
                        {pvRows.map((r, i) => {
                            const st = lastForFocus ? statusOf(r) : null;
                            const isOpen = openEx === r.ex.id;
                            return (
                                <div key={r.ex.id} style={divider}>
                                    <button type="button" onClick={() => setOpenEx(isOpen ? null : r.ex.id)} disabled={!lastForFocus} aria-expanded={isOpen}
                                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", border: "none", background: "none", color: C.text, textAlign: "left", cursor: lastForFocus ? "pointer" : "default" }}>
                                        <span style={{ width: 22, fontSize: 13, color: C.text4, ...num }}>{String(i + 1).padStart(2, "0")}</span>
                                        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                            <span style={{ fontSize: 15, fontWeight: 600 }}>{r.ex.name}</span>
                                            <span style={{ fontSize: 15, fontWeight: 600, fontStretch: "75%", color: C.text3, ...num }}>{r.workCount}×{r.planReps || "—"}{r.planLoad ? " · " + br(r.planLoad) + " kg" : ""}</span>
                                        </span>
                                        {st && <span style={{ flex: "none", fontSize: 13, fontWeight: 700, color: st.c }}>{st.t}</span>}
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: "0 0 14px 34px", display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
                                            {r.sets.map((s) => (
                                                <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text4 }}>{s.n} · alvo {s.target || "—"}</span>
                                                    <span style={{ fontSize: 15, fontWeight: 700, color: s.done ? C.text : C.text4, ...num }}>{s.done ? br(s.log.load) + " × " + s.log.reps : "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// Bloco "SÉRIES NA SEMANA" da edição da ficha (design v3 · 28a): os 11 grupos em 2 colunas, barras
// de 4px, grupo trabalhado aceso e os outros apagados, e o quanto mudou desde que a edição abriu
// (`baseline`). Sem alvo de volume (README). Vem sempre de todas as fichas da semana.
function EditVolumeBlock({ week, baseline }) {
    const vol = plannedGroupVolume(week).values;
    const base = baseline || vol;
    const vmax = Math.max(1, ...GROUP_ORDER.map((g) => vol[g] || 0));
    return (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 16, background: C.panel, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={kicker}>Séries na semana</span><span style={{ fontSize: 11, color: C.text4 }}>todas as fichas · pela ativação</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px 16px" }}>
                {GROUP_ORDER.map((g) => {
                    const v = vol[g] || 0, d = Math.round((v - (base[g] || 0)) * 10) / 10, on = v > 0;
                    return (
                        <div key={g} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 13 }}>
                                <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: on ? C.text : C.text4 }}>{g}</span>
                                {d !== 0 && <span style={{ fontSize: 11, fontWeight: 700, color: d > 0 ? C.text : C.text3, ...num }}>{(d > 0 ? "+" : "−") + fmtVol(Math.abs(d))}</span>}
                                <span style={{ fontWeight: 700, color: on ? C.text : C.text4, ...num }}>{fmtVol(v)}</span>
                            </div>
                            <span style={{ height: 4, borderRadius: 2, background: C.raised, overflow: "hidden" }}><span style={{ display: "block", width: Math.round((v / vmax) * 100) + "%", height: "100%", background: on ? C.text2 : C.dim }} /></span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export { FichaV3, EditVolumeBlock };
