import React, { useMemo, useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { daySummary, sortedHistory } from "../../utils/workout";

// Evolução (18/nov, pedido do professor: "muito feia e nada prática"). Antes: a maior carga do dia
// (inclusive aquecimento) numa linha esticada do mínimo ao máximo — 60 → 62,5 kg virava um pico.
// Agora: a série de trabalho mais pesada de cada treino como ponto, a linha do RECORDE (só sobe) por
// cima, eixo com folga e números de verdade; embaixo, os últimos treinos com a diferença pro anterior.

const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dShort = (iso) => { const [, m, d] = String(iso).split("-").map(Number); return d + " " + MO[m - 1]; };
const kg = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10).replace(".", ","));

// por exercício (agrupado pelo nome): um ponto por treino com a série de trabalho mais pesada
function evolutionSeries(week) {
    const g = {};
    Object.values(week || {}).forEach((list) => (Array.isArray(list) ? list : []).forEach((ex) => {
        const k = String(ex.name || "").trim().toLowerCase(); if (!k) return;
        const o = (g[k] = g[k] || { name: ex.name, byDate: {} });
        sortedHistory(ex.history || []).forEach((h) => {
            const s = daySummary(h); if (!h.date || !(s.load > 0)) return;
            const cur = o.byDate[h.date];
            if (!cur || s.load > cur.load) o.byDate[h.date] = { date: h.date, load: s.load, reps: s.reps, volume: (cur ? cur.volume : 0) + (s.volume || 0) };
            else cur.volume += s.volume || 0;
        });
    }));
    return Object.values(g).map((o) => {
        const pts = Object.values(o.byDate).sort((a, b) => (a.date < b.date ? -1 : 1));
        let best = 0; pts.forEach((p) => { p.pr = p.load > best; best = Math.max(best, p.load); p.best = best; });
        return { name: o.name, pts, last: pts[pts.length - 1] };
    }).filter((x) => x.pts.length).sort((a, b) => (a.last.date < b.last.date ? 1 : a.last.date > b.last.date ? -1 : b.pts.length - a.pts.length));
}

function Chart({ pts }) {
    const W = 340, H = 190, L = 34, R = 8, T = 12, B = 22;
    const loads = pts.map((p) => p.load);
    let lo = Math.min(...loads), hi = Math.max(...loads);
    // folga: o eixo nunca é mais estreito que 20% da carga — 2,5 kg de diferença não vira montanha
    const span = Math.max(hi - lo, hi * 0.2, 5); const mid = (hi + lo) / 2;
    lo = Math.max(0, Math.floor((mid - span * 0.62) / 5) * 5); hi = Math.ceil((mid + span * 0.62) / 5) * 5;
    const x = (i) => (pts.length === 1 ? (L + W - R) / 2 : L + (i / (pts.length - 1)) * (W - L - R));
    const y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
    const ticks = [lo, Math.round((lo + hi) / 2 / 2.5) * 2.5, hi];
    const step = pts.map((p, i) => (i === 0 ? `M${x(0)},${y(p.best)}` : `H${x(i)}V${y(p.best)}`)).join("");
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gráfico de carga por treino" style={{ display: "block" }}>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.line} strokeWidth="1" />
                    <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{kg(t)}</text>
                </g>
            ))}
            <path d={step} fill="none" stroke={C.text2} strokeWidth="2.5" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={p.date} cx={x(i)} cy={y(p.load)} r={p.pr ? 4.5 : 3} fill={p.pr ? C.text : C.bg} stroke={p.pr ? C.text : C.text4} strokeWidth="1.5" />)}
            <text x={L} y={H - 4} fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{dShort(pts[0].date)}</text>
            <text x={W - R} y={H - 4} textAnchor="end" fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{dShort(pts[pts.length - 1].date)}</text>
        </svg>
    );
}

function EvolutionV3({ week }) {
    const series = useMemo(() => evolutionSeries(week), [week]);
    const [name, setName] = useState(series[0] ? series[0].name : null);
    const s = series.find((x) => x.name === name) || series[0];
    if (!s) return <div style={{ fontSize: 15, color: C.text3 }}>Registre carga em pelo menos um treino pra ver a evolução.</div>;
    const first = s.pts[0], last = s.last, best = s.pts.reduce((m, p) => (p.load > m.load ? p : m), first);
    const gain = best.load - first.load;
    const recent = s.pts.slice(-6).reverse();
    return (
        <>
            <div style={{ margin: "0 -20px", padding: "0 20px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                {series.map((x) => {
                    const on = x.name === s.name;
                    return <button key={x.name} type="button" onClick={() => setName(x.name)} aria-pressed={on} style={{ flex: "none", minHeight: 40, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, fontWeight: on ? 700 : 500, background: on ? C.text : "transparent", color: on ? C.bg : C.text2, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}` }}>{x.name}</button>;
                })}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={KICKER}>Recorde</span>
                    <span style={{ fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 56, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>{kg(best.load)}<span style={{ fontSize: 22, color: C.text3, fontWeight: 700 }}> kg</span></span>
                    <span style={{ fontSize: 13, color: C.text3 }}>{(best.reps ? "× " + best.reps + " · " : "") + dShort(best.date)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingBottom: 2 }}>
                    <span style={{ fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 28, color: gain > 0 ? C.text : C.text3, fontVariantNumeric: "tabular-nums" }}>{gain > 0 ? "+" + kg(gain) + " kg" : "="}</span>
                    <span style={{ fontSize: 13, color: C.text3 }}>{gain > 0 ? "desde " + dShort(first.date) : "mantendo desde " + dShort(first.date)}</span>
                </div>
            </div>
            <div style={{ padding: "12px 10px 6px", borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                <Chart pts={s.pts} />
                <div style={{ display: "flex", gap: 14, padding: "6px 4px 2px", fontSize: 11, color: C.text3 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2.5, background: C.text2, borderRadius: 2 }} />recorde</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: "50%", boxShadow: `inset 0 0 0 1.5px ${C.text4}` }} />carga do treino</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.text }} />recorde batido</span>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[[String(s.pts.length), s.pts.length === 1 ? "treino" : "treinos"], [kg(last.load) + " kg", "último · " + dShort(last.date)], [last.volume > 0 ? (last.volume >= 1000 ? kg(Math.round(last.volume / 100) / 10) + " t" : kg(Math.round(last.volume)) + " kg") : "—", "volume no último"]].map(([v, l]) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px", borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                        <span style={{ fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                        <span style={{ fontSize: 11, color: C.text3 }}>{l}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ ...KICKER, marginBottom: 4 }}>Últimos treinos</span>
                {recent.map((p) => {
                    const i = s.pts.indexOf(p); const prev = s.pts[i - 1]; const d = prev ? p.load - prev.load : 0;
                    return (
                        <div key={p.date} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                            <span style={{ width: 56, flex: "none", fontSize: 13, color: C.text3 }}>{dShort(p.date)}</span>
                            <span style={{ flex: 1, fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{kg(p.load)} kg{p.reps ? <span style={{ color: C.text3, fontWeight: 500 }}> × {p.reps}</span> : null}</span>
                            {p.pr && i > 0 && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: C.bg, background: C.text, borderRadius: 999, padding: "3px 8px" }}>RECORDE</span>}
                            <span style={{ width: 64, flex: "none", textAlign: "right", fontSize: 13, fontWeight: 700, color: d > 0 ? C.text : C.text4, fontVariantNumeric: "tabular-nums" }}>{prev ? (d > 0 ? "+" : d < 0 ? "−" : "") + (d ? kg(Math.abs(d)) + " kg" : "igual") : ""}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export { EvolutionV3, evolutionSeries };
