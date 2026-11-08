import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { planSummary } from "../../utils/workout";

// 16b — modelo como cartão: nome + contagem; toque abre a lista e as ações
function TemplateCard({ tpl, targetLabel, onApply, onRemove }) {
    const [open, setOpen] = useState(false);
    return React.createElement("div", { style: { borderRadius: 16, background: open ? C.panel : "transparent", boxShadow: `inset 0 0 0 1px ${open ? C.line2 : C.line}`, overflow: "hidden" } },
        React.createElement("button", { className: "cc-tap", onClick: () => setOpen(!open), style: { minHeight: 44, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "14px 16px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer" } },
            React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, tpl.name),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, flexShrink: 0 } }, `${tpl.exercises.length} exercício${tpl.exercises.length === 1 ? "" : "s"} ${open ? "\u02C4" : "\u203A"}`)),
        open && React.createElement("div", { className: "cc-view", style: { padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 12 } },
            React.createElement("div", null, tpl.exercises.map((e, i) => React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "22px 1fr", gap: 8, padding: "8px 0", borderTop: "1px solid #15181F" } },
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: "#5A6273" } }, String(i + 1).padStart(2, "0")),
                React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } },
                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.text } }, e.name),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, planSummary(e) + (e.note ? " · dica" : "")))))),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                React.createElement("button", { className: "cc-tap", onClick: onApply, style: { flex: 2, height: 46, borderRadius: 10, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 13, cursor: "pointer" } }, "Aplicar em " + targetLabel),
                React.createElement("button", { className: "cc-tap", onClick: onRemove, style: { flex: 1, height: 46, borderRadius: 10, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2A2E37", color: C.muted, fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, "Remover"))));
}
TemplateCard = React.memo(TemplateCard);
export { TemplateCard };
