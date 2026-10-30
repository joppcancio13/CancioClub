import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { C, F, glassPanel } from "../../styles/tokens";
import { fmtDate } from "../../utils/date";
import { daySummary, sortedHistory } from "../../utils/workout";

const FacetDot = (props) => { const { cx, cy } = props; if (cx == null || cy == null)
    return null; return React.createElement("rect", { x: cx - 3.4, y: cy - 3.4, width: 6.8, height: 6.8, transform: `rotate(45 ${cx} ${cy})`, fill: C.amber, stroke: C.ink, strokeWidth: 1.4 }); };
function ChartTip({ active, payload, label, unit, formatValue }) { if (!active || !payload || !payload.length)
    return null; return React.createElement("div", { style: { ...glassPanel, borderRadius: 8, padding: "7px 10px", fontFamily: F.mono, fontSize: 12 } },
    React.createElement("div", { style: { color: C.muted } }, label),
    React.createElement("div", { style: { color: C.amber } },
        formatValue ? formatValue(payload[0].value) : payload[0].value,
        " ",
        unit)); }
function ProgressChart({ ex, metric }) {
    const summarized = sortedHistory(ex.history).map((h) => ({ date: h.date, ...daySummary(h) }));
    const hist = summarized.filter((h) => (metric === "reps" ? typeof h.reps === "number" : metric === "volume" ? h.volume > 0 : typeof h.load === "number"));
    const rawData = hist.map((h) => ({ date: fmtDate(h.date), v: metric === "reps" ? h.reps : metric === "volume" ? h.volume : h.load }));
    if (rawData.length < 2)
        return React.createElement("div", { style: { fontFamily: F.mono, fontSize: 12.5, color: C.muted, padding: "22px 0", textAlign: "center", lineHeight: 1.6 } }, metric === "reps" ? "Registre reps em 2+ sessões para ver a evolução." : metric === "volume" ? "Registre séries de trabalho em 2+ sessões para ver a tonelagem." : "Registre a carga em 2+ sessões para acender o gráfico.");
    // tonelagem alta fica mais legível em toneladas — decidido pela série inteira (não ponto a ponto),
    // senão o eixo mistura "0,8" com "1200" quando um dia foge muito da média
    const useTons = metric === "volume" && Math.max(...rawData.map((d) => d.v)) >= 1000;
    const data = useTons ? rawData.map((d) => ({ ...d, v: Math.round((d.v / 1000) * 10) / 10 })) : rawData;
    const unit = metric === "reps" ? "reps" : metric === "volume" ? (useTons ? "TON" : "kg") : "kg";
    const fmtTon = (v) => v.toFixed(1).replace(".", ",");
    const vals = data.map((d) => d.v), dmin = Math.min(...vals), dmax = Math.max(...vals);
    const pad = useTons ? Math.max(0.2, (dmax - dmin) * 0.25) : Math.max(2, (dmax - dmin) * 0.25);
    const domain = useTons ? [+(dmin - pad).toFixed(1), +(dmax + pad).toFixed(1)] : [Math.floor(dmin - pad), Math.ceil(dmax + pad)];
    return (React.createElement("div", { style: { height: 176, margin: "0 -6px 14px" } },
        React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
            React.createElement(LineChart, { data: data, margin: { top: 8, right: 12, bottom: 0, left: -18 } },
                React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4", vertical: false }),
                React.createElement(XAxis, { dataKey: "date", tick: { fill: C.muted, fontFamily: F.mono, fontSize: 11 }, tickLine: false, axisLine: { stroke: C.line } }),
                React.createElement(YAxis, { domain: domain, tick: { fill: C.muted, fontFamily: F.mono, fontSize: 11 }, tickLine: false, axisLine: false, width: 40, tickFormatter: useTons ? fmtTon : undefined }),
                React.createElement(Tooltip, { content: React.createElement(ChartTip, { unit: unit, formatValue: useTons ? fmtTon : undefined }), cursor: { stroke: C.amberDim, strokeDasharray: "3 3" } }),
                React.createElement(Line, { type: "monotone", dataKey: "v", stroke: C.amber, strokeWidth: 2, dot: React.createElement(FacetDot, null), activeDot: React.createElement(FacetDot, null) })))));
}
export { FacetDot, ChartTip, ProgressChart };
