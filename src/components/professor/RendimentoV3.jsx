import React, { useEffect, useState } from "react";
import { C, DAYS, F, JS2KEY, NON_COUNTING_KINDS, KICKER, COL_LABEL } from "../../styles/tokens";
import { daySummary, sortedHistory } from "../../utils/workout";

// Rendimento do aluno no professor — design v3 (README · Professor 5, 18a → 18b): números do topo,
// volume das 8 semanas, exercícios agrupados por dia de treino; tocar abre o gráfico com escala,
// carga inicial no 1º ponto e a melhor série no último, e o aviso de carga parada. Mantém o que já
// existia: últimas sessões série a série, nota do professor, esforço relatado e lista de sessões.

const kicker = KICKER;
const colLabel = COL_LABEL;
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const fmtDate = (iso) => { const [, m, d] = iso.split("-"); return d + "/" + m; };
const EFF = { facil: "fácil", medida: "na medida", destruidor: "destruidor", descanso: "descanso" };

// histórico com carga, uma linha por dia: carga do dia, melhor série e volume
function seriesOf(ex) {
    return sortedHistory(ex.history || []).map((h) => {
        const s = daySummary(h);
        const work = Array.isArray(h.entries) ? h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && typeof e.load === "number") : [];
        return { date: h.date, load: s.load, reps: s.reps, volume: s.volume, work };
    }).filter((x) => x.load > 0);
}
const pct = (a, b) => (a && b !== a ? Math.round(((b - a) / a) * 100) : 0);

function Chart({ points }) {
    // points: 8 semanas (null = sem treino), da mais antiga pra esta
    const vals = points.filter((v) => v != null);
    if (vals.length < 2) return <div style={{ padding: "24px 0", fontSize: 13, color: C.text3 }}>O gráfico aparece depois de 2 semanas com registro.</div>;
    const lo = Math.min(...vals), hi = Math.max(...vals), pad = Math.max(1, (hi - lo) * 0.15);
    const y0 = lo - pad, y1 = hi + pad, X = (i) => 42 + i * ((334 - 42) / 7), Y = (v) => 110 - ((v - y0) / (y1 - y0 || 1)) * 96;
    const idx = points.map((v, i) => (v != null ? i : null)).filter((i) => i != null);
    const first = idx[0], last = idx[idx.length - 1];
    const ticks = [hi, (hi + lo) / 2, lo];
    return (
        <svg viewBox="0 -14 350 184" width="100%" style={{ marginTop: 4, display: "block", fontFamily: "Archivo, sans-serif" }} aria-label="Carga por semana">
            <g stroke={C.line}>{ticks.map((t, i) => <line key={i} x1="30" x2="346" y1={Y(t)} y2={Y(t)} />)}</g>
            <g fill={C.text3} fontSize="11">{ticks.map((t, i) => <text key={i} x="0" y={Y(t) + 4}>{br(t)}</text>)}</g>
            <g fill={C.text4} fontSize="11" textAnchor="middle">{points.map((_, i) => <text key={i} x={X(i)} y="160">{i === 7 ? "hoje" : "S" + (i + 1)}</text>)}</g>
            <polyline points={idx.map((i) => X(i) + "," + Y(points[i])).join(" ")} fill="none" stroke={C.text2} strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx={X(first)} cy={Y(points[first])} r="4" fill={C.bg} stroke={C.text2} strokeWidth="2" />
            <text x={X(first)} y={Y(points[first]) - 10} fill={C.text3} fontSize="11" textAnchor="middle">{br(points[first])}</text>
            <circle cx={X(last)} cy={Y(points[last])} r="5" fill={C.text} />
            <text x={X(last)} y={Y(points[last]) - 10} fill={C.text} fontSize="11" fontWeight="700" textAnchor="middle">{br(points[last])}</text>
        </svg>
    );
}

function RendimentoV3({ allEx, week, dayNames, sessions, rend, exId, onOpenEx, onEditDay, onSaveNote }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekIdx = (iso) => Math.floor((today - new Date(iso + "T00:00:00")) / (7 * 86400000));
    const nameOf = (k) => String((dayNames && dayNames[k]) || (DAYS.find((d) => d.key === k) || {}).full || "").split("·")[0].trim();
    const ex = exId ? allEx.find((e) => e.id === exId) : null;
    const [note, setNote] = useState("");
    useEffect(() => { setNote((ex && ex.profNote) || ""); }, [exId]);

    // ---------- Exercício (18b) ----------
    if (ex) {
        const ss = seriesOf(ex);
        const weeks = Array(8).fill(null);
        ss.forEach((x) => { const w = weekIdx(x.date); if (w >= 0 && w < 8) weeks[7 - w] = Math.max(weeks[7 - w] || 0, x.load); });
        const first = ss[0], last = ss[ss.length - 1];
        const best = ss.reduce((b, x) => (!b || x.load > b.load || (x.load === b.load && (x.reps || 0) > (b.reps || 0)) ? x : b), null);
        const d = first && last ? pct(first.load, last.load) : 0;
        // carga parada: as últimas semanas com registro repetem a mesma carga máxima
        const withData = weeks.map((v, i) => [v, i]).filter(([v]) => v != null);
        let stalled = 0; if (withData.length >= 3) { const lastV = withData[withData.length - 1][0]; for (let k = withData.length - 1; k >= 0 && withData[k][0] === lastV; k--) stalled = 7 - withData[k][1] + 1; }
        const chips = allEx.filter((e) => seriesOf(e).length > 0);
        return (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                <button type="button" onClick={() => onOpenEx(null)} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>‹ Todos os exercícios</button>
                <div style={{ margin: "4px -20px 0", padding: "0 20px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                    {chips.map((e) => { const on = e.id === ex.id; return <button key={e.id} type="button" onClick={() => onOpenEx(e.id)} style={{ flex: "none", minHeight: 44, padding: "0 12px", borderRadius: 999, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}`, fontFamily: F.body, fontSize: 13, fontWeight: on ? 700 : 400, cursor: "pointer" }}>{e.name}</button>; })}
                </div>
                <span style={{ marginTop: 20, fontSize: 15, color: C.text3 }}>{ex.name}</span>
                <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: F.display, fontSize: 40, fontWeight: 900, fontStretch: "125%", lineHeight: 1, ...num }}>{last ? br(last.load) + " kg" : "—"}</span>
                    {d !== 0 && <span style={{ fontSize: 15, fontWeight: 700, color: d > 0 ? C.text : C.accent, ...num }}>{(d > 0 ? "+" : "") + d + "%"}</span>}
                </div>
                <Chart points={weeks} />
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                    {[["INÍCIO", first ? br(first.load) + " kg" : "—"], ["MELHOR SÉRIE", best ? br(best.load) + " × " + (best.reps ?? "—") : "—"], ["VOLUME", last ? Math.round(last.volume).toLocaleString("pt-BR") + " kg" : "—"]].map(([l, v]) => (
                        <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={colLabel}>{l}</span><span style={{ fontSize: 15, fontWeight: 700, ...num }}>{v}</span></div>
                    ))}
                </div>
                {stalled >= 3 && (
                    <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 16, background: C.panel, display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ flex: 1, fontSize: 15, lineHeight: 1.35 }}>Carga parada há {stalled} semanas.</span>
                        <button type="button" onClick={() => onEditDay(ex._day)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Editar ficha</button>
                    </div>
                )}
                <div style={{ ...kicker, marginTop: 24 }}>Últimas sessões · séries válidas</div>
                {[...ss].reverse().slice(0, 5).map((x) => (
                    <div key={x.date} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "11px 0", ...divider }}>
                        <span style={{ width: 52, fontSize: 13, color: C.text3, ...num }}>{fmtDate(x.date)}</span>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, fontStretch: "75%", ...num }}>{x.work.length ? x.work.map((e) => br(e.load) + "×" + (e.reps ?? "—")).join("  ") : br(x.load) + " kg"}</span>
                    </div>
                ))}
                <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: C.panel }}>
                    <div style={{ ...kicker, marginBottom: 6 }}>Nota do professor</div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => onSaveNote(ex, note.trim())} placeholder="Escreva uma orientação pra próxima vez…" aria-label="Nota do professor sobre o exercício"
                        style={{ width: "100%", boxSizing: "border-box", minHeight: 56, background: "transparent", border: "none", outline: "none", resize: "vertical", color: C.text, fontFamily: F.body, fontSize: 15, lineHeight: 1.4 }} />
                </div>
            </div>
        );
    }

    // ---------- Rendimento (18a) ----------
    const vols = rend.vols || [];
    const vmax = Math.max(1, ...vols);
    const days = DAYS.filter((d) => (week[d.key] || []).length);
    const eff = { facil: 0, medida: 0, destruidor: 0 }; (sessions || []).forEach((x) => { if (eff[x.effort] != null) eff[x.effort]++; });
    const effN = eff.facil + eff.medida + eff.destruidor;
    return (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                {[[rend.volDelta != null ? (rend.volDelta > 0 ? "+" : "") + rend.volDelta + "%" : "–", "volume semanal"], [rend.freqPct != null ? rend.freqPct + "%" : "–", "frequência · " + rend.freqWeeks + " sem"], [rend.prTotal + " ★", "recordes"]].map(([v, l]) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, fontStretch: "110%", ...num }}>{v}</span><span style={{ fontSize: 11, color: C.text3 }}>{l}</span></div>
                ))}
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: 6, alignItems: "end", height: 80 }}>
                {vols.map((v, i) => <span key={i} title={Math.round(v).toLocaleString("pt-BR") + " kg"} style={{ height: Math.max(3, Math.round((v / vmax) * 80)), borderRadius: 4, background: i === 7 ? C.text : C.dim }} />)}
            </div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.text3 }}><span>8 sem atrás</span><span>volume semanal</span><span>esta</span></div>

            {days.map((d) => (
                <div key={d.key}>
                    <div style={{ ...kicker, marginTop: 24 }}>{d.full} · {nameOf(d.key)}</div>
                    <div style={{ marginTop: 4, display: "flex", flexDirection: "column" }}>
                        {(week[d.key] || []).map((e) => {
                            const ss = seriesOf(e).slice(-8); const a = ss[0], b = ss[ss.length - 1]; const p = a && b ? pct(a.load, b.load) : 0;
                            return (
                                <button key={e.id} type="button" disabled={!ss.length} onClick={() => onOpenEx(e.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", border: "none", ...divider, color: C.text, textAlign: "left", cursor: ss.length ? "pointer" : "default" }}>
                                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                        <span style={{ fontSize: 15, fontWeight: 600, color: ss.length ? C.text : C.text4 }}>{e.name}</span>
                                        <span style={{ fontSize: 15, fontWeight: 600, fontStretch: "75%", color: C.text3, ...num }}>{!ss.length ? "sem registro" : ss.length === 1 || a.load === b.load ? br(b.load) + " kg" : br(a.load) + " → " + br(b.load) + " kg"}</span>
                                    </span>
                                    {ss.length > 1 && <span style={{ fontSize: 15, fontWeight: 700, color: p > 0 ? C.text : p < 0 ? C.accent : C.text4, ...num }}>{p === 0 ? "estável" : (p > 0 ? "+" : "") + p + "%"}</span>}
                                    {ss.length > 0 && <span aria-hidden="true" style={{ color: C.text4 }}>›</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            <span style={{ display: "block", marginTop: 16, fontSize: 13, color: C.text3 }}>Toque num exercício para ver o gráfico.</span>

            {effN > 0 && (
                <>
                    <div style={{ ...kicker, marginTop: 24 }}>Esforço relatado · {effN} {effN === 1 ? "treino" : "treinos"}</div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginTop: 10 }}>
                        {eff.facil > 0 && <span style={{ flex: eff.facil, background: C.dim }} />}
                        {eff.medida > 0 && <span style={{ flex: eff.medida, background: C.text2 }} />}
                        {eff.destruidor > 0 && <span style={{ flex: eff.destruidor, background: C.accent }} />}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.text3, marginTop: 6 }}><span>fácil {eff.facil}</span><span>na medida {eff.medida}</span><span>destruidor {eff.destruidor}</span></div>
                </>
            )}
            <div style={{ ...kicker, marginTop: 24 }}>Sessões ({(sessions || []).length})</div>
            {(sessions || []).length === 0 && <div style={{ fontSize: 13, color: C.text3, padding: "12px 0" }}>Nenhuma sessão registrada ainda.</div>}
            {[...(sessions || [])].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12).map((x) => {
                const realKey = JS2KEY[new Date(x.date + "T00:00:00").getDay()];
                const real = DAYS.find((d) => d.key === realKey) || {};
                const ficha = DAYS.find((d) => d.key === x.day);
                return (
                    <div key={x.id} style={{ padding: "11px 0", ...divider }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                            <span>{fmtDate(x.date) + " · " + (real.short || "") + (ficha && x.day !== realKey ? " · ficha de " + ficha.full : "")}</span>
                            <span style={{ color: C.text4 }}>{[x.durationSec ? Math.max(1, Math.round(x.durationSec / 60)) + " min" : "", EFF[x.effort] || ""].filter(Boolean).join(" · ")}</span>
                        </div>
                        {x.feedback && <div style={{ fontSize: 13, lineHeight: 1.4, color: C.text2, marginTop: 4 }}>“{x.feedback}”</div>}
                    </div>
                );
            })}
        </div>
    );
}

export { RendimentoV3 };
