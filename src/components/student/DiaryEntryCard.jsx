import React from "react";
import { C, DIARY_EFFORT_LABELS, F, PILL_ON } from "../../styles/tokens";
import { fmtDur } from "../../utils/date";

const EFFORTS = ["facil", "medida", "destruidor"];
const WD = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MO = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const dateLabel = (iso) => { const [y, m, d] = iso.split("-").map(Number); const dt = new Date(y, m - 1, d); return `${WD[dt.getDay()]} · ${d} ${MO[m - 1]}`; };
const kg = (v) => String(v).replace(".", ",");

// 7a — um dia do diário: título, esforço numa escala de três, exercícios com a melhor série e pastilhas
function DiaryEntryCard({ entry: e, bare }) {
    const label = { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted };
    return (React.createElement("div", { className: "cc-view", style: { display: "flex", flexDirection: "column", gap: 12, ...(bare ? {} : { background: C.panel, borderRadius: 16, padding: 16, boxShadow: `inset 0 0 0 1px ${C.line}` }) } },
        React.createElement("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 } },
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 } },
                React.createElement("span", { style: label }, dateLabel(e.date)),
                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 18, color: C.text } }, e.dayLabel)),
            e.durationSec ? React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, flexShrink: 0 } }, fmtDur(e.durationSec)) : null),
        EFFORTS.includes(e.effort) && React.createElement("div", { style: { display: "flex", gap: 4 } }, EFFORTS.map((k) => React.createElement("span", { key: k, style: { flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 10, fontFamily: F.body, fontSize: 13, ...(k === e.effort ? { background: C.text, color: C.ink, fontWeight: 700 } : { color: "#5A6273", boxShadow: `inset 0 0 0 1px ${C.line}` }) } }, DIARY_EFFORT_LABELS[k]))),
        e.effort === "descanso" && React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, "Dia de descanso"),
        e.exercises.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
            e.exercises.map((ex, i) => React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "5px 10px", padding: "9px 0", borderBottom: "1px solid #15181F" } },
                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 15, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ex.name + (ex.isRecord ? " \u2605" : "")),
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontSize: 15, color: C.text, whiteSpace: "nowrap" } }, `${kg(ex.load)} kg${ex.reps ? ` × ${ex.reps}` : ""}`),
                ex.sets > 0 && React.createElement("span", { style: { gridColumn: "1 / -1", display: "flex", gap: 3 } }, Array.from({ length: ex.sets }).map((_, k) => React.createElement("span", { key: k, style: { width: 14, height: 6, borderRadius: 1.5, background: PILL_ON } })))))),
        e.cardio.length > 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, e.cardio.map((c) => `${c.activity} · ${c.minutes} min`).join(" · ")),
        e.recovery && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, [e.recovery.hydration && "hidratação", e.recovery.sleep && "sono", e.recovery.mobility && "mobilidade"].filter(Boolean).join(" · ")),
        e.feedback && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: "#C9D0DC", lineHeight: 1.45 } }, "\u201C" + e.feedback + "\u201D")));
}
DiaryEntryCard = React.memo(DiaryEntryCard);
export { DiaryEntryCard };
