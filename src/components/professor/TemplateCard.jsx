import React from "react";
import { C, F, glassPanel } from "../../styles/tokens";
import { planSummary } from "../../utils/workout";

function TemplateCard({ tpl, targetLabel, onApply, onRemove }) {
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 22, padding: 20 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("div", { style: { flex: 1, fontFamily: F.body, fontWeight: 600, fontSize: 16 } }, tpl.name),
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } },
                tpl.exercises.length,
                " exerc\u00EDcios")),
        React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 3 } }, tpl.exercises.map((e, i) => React.createElement("div", { key: i, style: { fontFamily: F.mono, fontSize: 12, color: C.muted } },
            e.name,
            " ",
            React.createElement("span", { style: { color: C.line } }, "\u00B7"),
            " ",
            planSummary(e),
            e.note ? React.createElement("span", { style: { color: C.amber } }, " \u00B7 obs") : ""))),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14, alignItems: "center" } },
            React.createElement("button", { onClick: onApply, style: { fontFamily: F.mono, fontSize: 12.5, color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "Aplicar"),
            React.createElement("div", { style: { flex: 1, fontFamily: F.mono, fontSize: 10.5, color: C.muted, lineHeight: 1.4 } },
                "em ",
                targetLabel),
            React.createElement("button", { onClick: onRemove, style: { fontFamily: F.mono, fontSize: 11, color: C.muted, background: C.panel2, borderRadius: 999, padding: "8px 12px", cursor: "pointer" } }, "remover"))));
}
TemplateCard = React.memo(TemplateCard);
export { TemplateCard };
