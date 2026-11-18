import React, { useMemo, useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";

// Evolução (pedido do professor, 18/nov: "muito feio e nada prático").
// Antes: chips de exercício + uma linha sem eixo, que ampliava 2,5 kg de diferença até virar serra.
// Agora: lista de exercícios com o resumo de cada um (carga atual, quanto mudou, minigráfico) e, ao
// tocar, o detalhe com eixo em kg, pontos, recorte de período, Carga × Volume, números e os treinos.

const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const kg = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const dShort = (iso) => { const [, m, d] = String(iso).slice(0, 10).split("-").map(Number); return `${d} ${MO[m - 1]}`; };
const n = (v) => { const x = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(x) && x > 0 ? x : 0; };
const tab = { fontVariantNumeric: "tabular-nums" };
const signed = (v, unit) => (v > 0 ? "+" : v < 0 ? "−" : "±") + kg(Math.abs(v)) + (unit ? " " + unit : "");
const daysAgo = (iso) => Math.round((Date.now() - new Date(iso + "T12:00:00").getTime()) / 864e5);

// por exercício (agrupado pelo nome, em todos os dias da ficha): para cada data, a melhor série
// VÁLIDA (sem aquecimento, reconhecimento nem série pulada) e o volume (kg × reps somados)
function buildSeries(week) {
    const g = {};
    Object.values(week || {}).forEach((list) => (Array.isArray(list) ? list : []).forEach((ex) => {
        const key = String(ex.name || "").trim().toLowerCase(); if (!key) return;
        if (!g[key]) g[key] = { name: ex.name, days: {} };
        (ex.history || []).forEach((h) => {
            if (!h.date) return;
            const skipped = new Set(h.skipped || []);
            const entries = Array.isArray(h.entries) ? h.entries : typeof h.load === "number" ? [{ kind: "working", load: h.load, reps: h.reps }] : [];
            const work = entries.filter((e) => e && e.kind !== "warmup" && e.kind !== "recon" && !skipped.has(e.setId) && n(e.load) > 0);
            if (!work.length) return;
            const best = work.reduce((a, b) => (n(b.load) > n(a.load) || (n(b.load) === n(a.load) && n(b.reps) > n(a.reps)) ? b : a));
            const vol = work.reduce((s, e) => s + n(e.load) * (n(e.reps) || 1), 0);
            const prev = g[key].days[h.date];
            if (!prev || n(best.load) > prev.load) g[key].days[h.date] = { date: h.date, load: n(best.load), reps: n(best.reps), sets: work.length, vol: (prev ? prev.vol : 0) + vol };
            else prev.vol += vol;
        });
    }));
    return Object.values(g).map((x) => {
        const pts = Object.values(x.days).sort((a, b) => (a.date < b.date ? -1 : 1));
        let top = 0; pts.forEach((p) => { p.pr = p.load > top && top > 0; top = Math.max(top, p.load); });
        return { name: x.name, pts };
    }).filter((x) => x.pts.length).sort((a, b) => (a.pts[a.pts.length - 1].date < b.pts[b.pts.length - 1].date ? 1 : -1));
}

// eixo "bonito": passo de 1, 2,5, 5, 10, 20, 25, 50... e pelo menos ~10% de folga, pra 2,5 kg não virar montanha
function niceScale(vals) {
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const minSpan = Math.max(hi * 0.12, 5);
    if (hi - lo < minSpan) { const mid = (hi + lo) / 2; lo = mid - minSpan / 2; hi = mid + minSpan / 2; }
    const raw = (hi - lo) / 3;
    const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000].find((s) => s >= raw) || raw;
    lo = Math.max(0, Math.floor(lo / step) * step); hi = Math.ceil(hi / step) * step;
    const ticks = []; for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(t);
    return { lo, hi, ticks };
}

function Chart({ pts, metric }) {
    const W = 340, H = 200, L = 40, R = 14, T = 16, B = 26;
    const val = (p) => (metric === "vol" ? p.vol : p.load);
    const vs = pts.map(val);
    const { lo, hi, ticks } = niceScale(vs);
    const t0 = new Date(pts[0].date).getTime(), t1 = new Date(pts[pts.length - 1].date).getTime();
    const x = (p) => (pts.length === 1 || t1 === t0 ? L + (W - L - R) / 2 : L + ((new Date(p.date).getTime() - t0) / (t1 - t0)) * (W - L - R));
    const y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
    const line = pts.map((p) => `${x(p).toFixed(1)},${y(val(p)).toFixed(1)}`).join(" ");
    const area = pts.length > 1 ? `M${x(pts[0]).toFixed(1)},${H - B} L${line.split(" ").join(" L")} L${x(pts[pts.length - 1]).toFixed(1)},${H - B} Z` : null;
    const last = pts[pts.length - 1];
    const fmtTick = (t) => (metric === "vol" ? (t >= 1000 ? kg(t / 1000) + "t" : String(Math.round(t))) : kg(t));
    const mid = pts.length > 2 ? pts[Math.floor(pts.length / 2)] : null;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={(metric === "vol" ? "Volume" : "Carga") + " de " + dShort(pts[0].date) + " a " + dShort(last.date)} style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id="evoFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C6D2E4" stopOpacity="0.22" /><stop offset="1" stopColor="#C6D2E4" stopOpacity="0" /></linearGradient>
            </defs>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.line} strokeWidth="1" />
                    <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui" style={tab}>{fmtTick(t)}</text>
                </g>
            ))}
            {area && <path d={area} fill="url(#evoFill)" />}
            {pts.length > 1 && <polyline points={line} fill="none" stroke={C.text2} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {pts.map((p, i) => <circle key={p.date} cx={x(p)} cy={y(val(p))} r={i === pts.length - 1 ? 5 : p.pr && metric !== "vol" ? 4 : 3} fill={i === pts.length - 1 || (p.pr && metric !== "vol") ? C.text : C.bg} stroke={C.text2} strokeWidth="2" />)}
            <text x={Math.min(x(last), W - R)} y={y(val(last)) - 12} textAnchor={x(last) > W - 60 ? "end" : "middle"} fontSize="13" fontWeight="700" fill={C.text} fontFamily="Archivo, system-ui" style={tab}>{metric === "vol" ? fmtTick(val(last)) + " kg" : kg(val(last)) + " kg"}</text>
            <text x={L} y={H - 6} fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{dShort(pts[0].date)}</text>
            {mid && <text x={x(mid)} y={H - 6} textAnchor="middle" fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{dShort(mid.date)}</text>}
            {pts.length > 1 && <text x={W - R} y={H - 6} textAnchor="end" fontSize="11" fill={C.text4} fontFamily="Archivo, system-ui">{dShort(last.date)}</text>}
        </svg>
    );
}

function Spark({ pts }) {
    if (pts.length < 2) return <span style={{ width: 64, height: 28, flex: "none" }} />;
    const vs = pts.map((p) => p.load); const { lo, hi } = niceScale(vs);
    const d = pts.map((p, i) => `${(i / (pts.length - 1)) * 60 + 2},${26 - ((p.load - lo) / (hi - lo || 1)) * 24}`).join(" ");
    return <svg width="64" height="28" viewBox="0 0 64 28" aria-hidden="true" style={{ flex: "none" }}><polyline points={d} fill="none" stroke={C.text3} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}

const seg = (on) => ({ minHeight: 40, padding: "0 12px", borderRadius: 9, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" });

function EvolutionView({ week, open, onOpen }) {
    const series = useMemo(() => buildSeries(week), [week]);
    const [range, setRange] = useState("3m");
    const [metric, setMetric] = useState("load");
    const s = open != null ? series.find((x) => x.name === open) : null;

    if (!series.length) return <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Registre carga nos seus treinos: cada exercício ganha aqui o gráfico de como ela sobe.</div>;

    if (!s) return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ ...KICKER, marginBottom: 4 }}>{series.length + (series.length === 1 ? " EXERCÍCIO" : " EXERCÍCIOS") + " · TOQUE PRA VER"}</span>
            {series.map((x) => {
                const a = x.pts[0], z = x.pts[x.pts.length - 1], d = z.load - a.load;
                return (
                    <button key={x.name} type="button" onClick={() => onOpen(x.name)} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 64, padding: "10px 0", border: "none", borderBottom: `1px solid ${C.line}`, background: "none", color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span>
                            <span style={{ fontSize: 13, color: C.text3, ...tab }}>{x.pts.length > 1 ? (d === 0 ? "mesma carga" : signed(d, "kg")) + " desde " + dShort(a.date) : "1 registro"}</span>
                        </span>
                        <Spark pts={x.pts.slice(-10)} />
                        <span style={{ flex: "none", width: 64, textAlign: "right", fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 22, ...tab }}>{kg(z.load)}<span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 500, color: C.text4 }}> kg</span></span>
                    </button>
                );
            })}
        </div>
    );

    const cut = range === "1m" ? 31 : range === "3m" ? 92 : Infinity;
    const inRange = s.pts.filter((p) => daysAgo(p.date) <= cut);
    const pts = inRange.length ? inRange : s.pts.slice(-1);
    const a = pts[0], z = pts[pts.length - 1];
    const best = s.pts.reduce((m, p) => (p.load > m.load ? p : m), s.pts[0]);
    const diff = z.load - a.load;
    const pct = a.load ? Math.round((diff / a.load) * 100) : 0;
    const hidden = s.pts.length - pts.length;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: F.body, fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>{s.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                {[["ATUAL", kg(z.load) + " kg", z.reps ? "× " + z.reps + " · " + dShort(z.date) : dShort(z.date)], ["MELHOR", kg(best.load) + " kg", dShort(best.date)], ["NO PERÍODO", diff === 0 ? "igual" : signed(diff, "kg"), pct ? (pct > 0 ? "+" : "") + pct + "%" : pts.length + (pts.length === 1 ? " treino" : " treinos")]].map(([l, v, sub]) => (
                    <div key={l} style={{ minWidth: 0, padding: "12px", borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ ...KICKER, fontSize: 10 }}>{l}</span>
                        <span style={{ fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 22, lineHeight: 1, whiteSpace: "nowrap", ...tab }}>{v}</span>
                        <span style={{ fontSize: 11, color: C.text3, ...tab }}>{sub}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div role="radiogroup" aria-label="Medida" style={{ display: "flex", padding: 3, borderRadius: 12, background: C.panel }}>
                    {[["load", "Carga"], ["vol", "Volume"]].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={metric === k} onClick={() => setMetric(k)} style={seg(metric === k)}>{l}</button>)}
                </div>
                <div role="radiogroup" aria-label="Período" style={{ display: "flex", padding: 3, borderRadius: 12, background: C.panel }}>
                    {[["1m", "1 mês"], ["3m", "3 meses"], ["all", "Tudo"]].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={range === k} onClick={() => setRange(k)} style={seg(range === k)}>{l}</button>)}
                </div>
            </div>
            <div style={{ padding: "14px 12px 8px", borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                <Chart pts={pts} metric={metric} />
                <div style={{ marginTop: 6, display: "flex", gap: 14, fontSize: 11, color: C.text4 }}>
                    <span>{metric === "vol" ? "kg × reps somados das séries válidas" : "melhor série válida do dia"}</span>
                    {metric === "load" && s.pts.some((p) => p.pr) && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.text }} />recorde</span>}
                </div>
            </div>
            {hidden > 0 && <span style={{ fontSize: 13, color: C.text4 }}>{hidden + (hidden === 1 ? " treino mais antigo fora do período." : " treinos mais antigos fora do período.")}</span>}
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ ...KICKER, marginBottom: 4 }}>TREINOS</span>
                {[...pts].reverse().map((p, i, arr) => {
                    const prev = arr[i + 1]; const d = prev ? p.load - prev.load : 0;
                    return (
                        <div key={p.date} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, borderBottom: `1px solid ${C.line}`, ...tab }}>
                            <span style={{ width: 56, flex: "none", fontSize: 13, color: C.text3 }}>{dShort(p.date)}</span>
                            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>{kg(p.load)} kg{p.reps ? <span style={{ fontWeight: 500, color: C.text3 }}>{" × " + p.reps}</span> : null}</span>
                                <span style={{ fontSize: 11, color: p.pr ? C.text : C.text4, fontWeight: p.pr ? 700 : 400 }}>{(p.pr ? "recorde · " : "") + p.sets + (p.sets === 1 ? " série válida" : " séries válidas")}</span>
                            </span>
                            <span style={{ flex: "none", fontSize: 13, color: d > 0 ? C.text : C.text4 }}>{prev ? (d === 0 ? "= " : signed(d, "kg")) : ""}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export { EvolutionView, buildSeries };
