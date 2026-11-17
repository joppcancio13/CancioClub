import React, { useMemo, useState } from "react";
import { C, DAYS, F, NON_COUNTING_KINDS, KICKER, PROGRESS } from "../../styles/tokens";
import { GROUP_ORDER, fmtVol, plannedGroupVolume, calculateWeeklyVolume } from "../../utils/volumeCalculator";
import { repsCeiling, parseReps } from "../../utils/workout";
import { describe } from "../student/WorkoutV3";

// Ficha do aluno no professor — design v3 (README · Professor 3 "Ficha", 17b página única + 27b
// prescrito × feito). Semana (cada dia abre o prescrito × feito), Rendimento e Volume; "Abrir ›",
// "Feito ›" e "Editar este dia" levam às telas completas (Rendimento, Volume, Editar ficha).

const WD_SHORT = { seg: "SEG", ter: "TER", qua: "QUA", qui: "QUI", sex: "SEX", sab: "SÁB", dom: "DOM" };
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WDL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const kicker = KICKER;
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const linkBtn = { background: "none", border: "none", padding: 0, minHeight: 44, color: C.text2, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" };
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
    const [openEx, setOpenEx] = useState(null);
    const days = DAYS.filter((d) => (week[d.key] || []).length);
    const nameOf = (k) => String((dayNames && dayNames[k]) || (DAYS.find((d) => d.key === k) || {}).full || "").split("·")[0].trim();
    const mon = mondayISO();
    const weekSess = (sessions || []).filter((s) => s.date >= mon);
    const todayList = week[todayKey] || [];

    // última sessão de cada dia da ficha: o dia aberto mostra prescrito × feito ali mesmo
    const lastOf = (k) => [...(sessions || [])].filter((s) => s.day === k).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const [openDay, setOpenDay] = useState(() => (todayList.length ? todayKey : null));

    // volume (design v4 · 37a): o FEITO na semana (barra prata) sobre o PRESCRITO (contorno), nos 11 grupos
    const vol = useMemo(() => plannedGroupVolume(week), [week]);
    const done = useMemo(() => { const all = []; DAYS.forEach((d) => (week[d.key] || []).forEach((e) => all.push({ ...e, _day: d.key }))); return calculateWeeklyVolume(all, 0); }, [week]);
    const volRows = GROUP_ORDER.map((g) => ({ g, p: vol.values[g] || 0, d: Math.round((done.groupTotals[g] || 0) * 10) / 10 }));
    const vmax = Math.max(1, ...volRows.map((x) => Math.max(x.p, x.d)));
    const rangeLabel = (() => { const a = new Date(done.startISO + "T12:00:00"), b = new Date(done.endISO + "T12:00:00"); return a.getDate() + "–" + b.getDate() + " " + MO[b.getMonth()]; })();
    const weekDone = DAYS.filter((d) => (week[d.key] || []).length && weekSess.some((x) => x.day === d.key)).length;
    const stats = [[rend.volDelta != null ? (rend.volDelta > 0 ? "+" : "") + rend.volDelta + "%" : "–", "volume semanal"], [rend.freqPct != null ? rend.freqPct + "%" : "–", "frequência"], [rend.prTotal + " ★", "recordes"]];

    const dayDetail = (k) => {
        const last = lastOf(k);
        const rows = (week[k] || []).map((ex) => describe(ex, last ? last.date : "0000-00-00"));
        const done = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);
        const total = rows.reduce((n, r) => n + r.sets.length, 0);
        return (
            <div style={{ padding: "0 0 14px 48px", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, color: C.text3, ...num }}>{last ? "Última vez · " + dateShort(last.date) + " · " + done + " de " + total + " séries" : "Ainda não feito"}</span>
                {rows.map((r, i) => {
                    const st = last ? statusOf(r) : null;
                    const isOpen = openEx === r.ex.id;
                    return (
                        <div key={r.ex.id} style={divider}>
                            <button type="button" onClick={() => setOpenEx(isOpen ? null : r.ex.id)} disabled={!last} aria-expanded={isOpen}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 0", border: "none", background: "none", color: C.text, textAlign: "left", cursor: last ? "pointer" : "default" }}>
                                <span style={{ width: 20, fontSize: 11, color: C.text3, ...num }}>{String(i + 1).padStart(2, "0")}</span>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                                    <span style={{ fontSize: 15, fontWeight: 600 }}>{r.ex.name}</span>
                                    <span style={{ fontSize: 13, color: C.text3, ...num }}>{r.workCount}×{r.planReps || "—"}{r.planLoad ? " · " + br(r.planLoad) + " kg" : ""}</span>
                                </span>
                                {st && <span style={{ flex: "none", fontSize: 13, fontWeight: 700, color: st.c }}>{st.t}</span>}
                            </button>
                            {isOpen && (
                                <div style={{ padding: "0 0 12px 30px", display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
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
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button type="button" onClick={() => onEdit(k)} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Editar este dia</button>
                </div>
            </div>
        );
    };

    // arrumação (pedido do professor, 16/nov): Semana primeiro, cada dia abre o prescrito × feito ali
    // mesmo; depois Rendimento e Volume. Sai a fileira de atalhos e a seção "Ficha de …" separada.
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {todayList.length > 0 && (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: C.panel, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={kicker}>Aula hoje?</span>
                        <span style={{ fontSize: 15 }}>{nameOf(todayKey)}</span>
                    </span>
                    <button type="button" onClick={onAula} style={{ flex: "none", minHeight: 48, padding: "0 16px", borderRadius: 12, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Modo aula</button>
                </div>
            )}
            <div style={{ ...kicker, paddingTop: 18 }}>{"Essa semana · " + weekDone + " de " + days.length}</div>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>
                {days.length === 0 && (
                    <button type="button" onClick={() => onEdit(todayKey)} style={{ minHeight: 48, marginTop: 4, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>Ficha vazia · Montar a ficha</button>
                )}
                {days.map((d) => {
                    const isToday = d.key === todayKey;
                    const done = weekSess.some((s) => s.day === d.key);
                    const isOpen = openDay === d.key;
                    const n = (week[d.key] || []).length;
                    return (
                        <div key={d.key} style={isOpen ? null : divider}>
                            <button type="button" onClick={() => { setOpenDay(isOpen ? null : d.key); setOpenEx(null); }} aria-expanded={isOpen}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", border: "none", background: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                                <span style={{ width: 36, fontSize: 13, fontWeight: isToday ? 800 : 400, color: isToday ? C.text : C.text4 }}>{WD_SHORT[d.key]}</span>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                                    <span style={{ fontSize: 15, fontWeight: isOpen ? 700 : 400 }}>{nameOf(d.key)}</span>
                                    <span style={{ fontSize: 13, color: C.text3 }}>{n} {n === 1 ? "exercício" : "exercícios"}</span>
                                </span>
                                {done ? <span style={{ fontSize: 13, color: C.text2 }}>✓ feito</span> : isToday ? <span style={{ ...kicker, fontSize: 10, color: C.text2 }}>Hoje</span> : null}
                                <span aria-hidden="true" style={{ color: C.text4, transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                            </button>
                            {isOpen && dayDetail(d.key)}
                        </div>
                    );
                })}
            </div>

            <button type="button" onClick={onOpenRend} style={{ marginTop: 22, width: "100%", minHeight: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", borderRadius: 16, border: "none", background: C.panel, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={kicker}>{"Rendimento · " + rend.freqWeeks + (rend.freqWeeks === 1 ? " semana" : " semanas")}</span>
                    <span style={{ fontSize: 15 }}>{"Volume " + (rend.volDelta != null ? (rend.volDelta > 0 ? "+" : "") + rend.volDelta + "%" : "–") + " · frequência " + (rend.freqPct != null ? rend.freqPct + "%" : "–") + " · " + rend.prTotal + (rend.prTotal === 1 ? " recorde" : " recordes")}</span>
                </span>
                <span aria-hidden="true" style={{ color: C.text3 }}>›</span>
            </button>

            <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={kicker}>{"Volume · " + rangeLabel}</span>
                <span style={{ display: "flex", gap: 10, fontSize: 13, color: C.text3 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 8, borderRadius: 3, boxShadow: "inset 0 0 0 1px #3A404C" }} />prescrito</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 8, borderRadius: 3, backgroundImage: PROGRESS }} />feito</span>
                </span>
            </div>
            {vol.unmatched > 0 && (
                <button type="button" onClick={onOpenVol} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 6px 10px 14px", borderRadius: 16, border: "none", background: C.panel, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{vol.unmatched + (vol.unmatched === 1 ? " exercício fora da conta" : " exercícios fora da conta")}</span>
                        <span style={{ fontSize: 13, color: C.text3 }}>Sem vínculo com o catálogo</span>
                    </span>
                    <span style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, background: C.text, color: C.bg, display: "flex", alignItems: "center", fontSize: 13, fontWeight: 800 }}>Vincular</span>
                </button>
            )}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
                {volRows.map((x) => (
                    <div key={x.g} style={{ display: "grid", gridTemplateColumns: "92px minmax(0,1fr) 72px", alignItems: "center", gap: 10, minHeight: 30 }}>
                        <span style={{ fontSize: 13, color: C.text2 }}>{x.g}</span>
                        <span style={{ position: "relative", height: 10, borderRadius: 5, background: "#11141A" }}>
                            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.round((x.p / vmax) * 100) + "%", borderRadius: 5, boxShadow: "inset 0 0 0 1px #3A404C" }} />
                            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.round((x.d / vmax) * 100) + "%", borderRadius: 5, backgroundImage: PROGRESS }} />
                        </span>
                        <span style={{ textAlign: "right", fontSize: 15, fontWeight: 700, fontStretch: "75%", ...num }}>{fmtVol(x.d)} <span style={{ color: C.text3, fontWeight: 600 }}>{"/ " + fmtVol(x.p)}</span></span>
                    </div>
                ))}
            </div>
            <span style={{ display: "block", marginTop: 10, fontSize: 13, lineHeight: 1.4, color: C.text3 }}>Séries por grupo, contadas pela maior ativação do grupo em cada exercício.</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={kicker}>Séries na semana</span><span style={{ fontSize: 11, color: C.text3 }}>todas as fichas · pela ativação</span></div>
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
