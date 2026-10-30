import React from "react";
import { C, DIARY_EFFORT_LABELS, F } from "../../styles/tokens";
import { fmtDate, fmtDur } from "../../utils/date";

// um dia do diário — mesmo cartão usado tanto na visão do mês (dia selecionado) quanto isolado
function DiaryEntryCard({ entry: e }) {
    return (React.createElement("div", { className: "cc-view", style: { background: C.panel, borderRadius: 18, padding: "16px 16px 14px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
            React.createElement("div", null,
                React.createElement("div", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13.5, color: C.text } },
                    fmtDate(e.date),
                    " · ",
                    e.dayLabel),
                React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 2 } },
                    DIARY_EFFORT_LABELS[e.effort] || e.effort,
                    e.durationSec ? ` · ${fmtDur(e.durationSec)}` : "")),
            e.hasRecord && React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", color: C.ink, background: C.text, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0 } }, "RECORDE ★")),
        e.exercises.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: e.cardio.length || e.recovery || e.feedback ? 8 : 0 } },
            e.exercises.map((ex, i) => React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 10, fontFamily: F.mono, fontSize: 12, color: ex.isRecord ? C.amber : C.silver } },
                React.createElement("span", { style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ex.name),
                React.createElement("span", { style: { flexShrink: 0, whiteSpace: "nowrap" } },
                    ex.load,
                    "kg",
                    ex.reps ? ` × ${ex.reps}` : "",
                    ex.isRecord ? " ★" : "")))),
        e.cardio.length > 0 && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11.5, color: C.muted, marginBottom: e.recovery || e.feedback ? 6 : 0 } }, e.cardio.map((c) => `${c.activity} · ${c.minutes}min`).join(", ")),
        e.recovery && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginBottom: e.feedback ? 6 : 0 } }, [e.recovery.hydration && "hidratação", e.recovery.sleep && "sono", e.recovery.mobility && "mobilidade"].filter(Boolean).join(" · ")),
        e.feedback && React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.text, fontStyle: "italic", marginTop: 4 } },
            "“",
            e.feedback,
            "”")));
}
DiaryEntryCard = React.memo(DiaryEntryCard);
export { DiaryEntryCard };
