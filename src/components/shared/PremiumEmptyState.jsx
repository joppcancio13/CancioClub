import React from "react";
import { C, F } from "../../styles/tokens";

// 16d — estado vazio: três pastilhas apagadas + frase + ação opcional
function PremiumEmptyState({ title, sub, compact = true, action, onAction }) {
    return React.createElement("div", { style: { padding: compact ? "26px 18px" : "40px 22px", borderRadius: 16, boxShadow: compact ? "none" : `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" } },
        React.createElement("div", { "aria-hidden": "true", style: { display: "flex", gap: 3 } }, [0, 1, 2].map((i) => React.createElement("span", { key: i, style: { width: 18, height: 8, borderRadius: 1.5, boxShadow: "inset 0 0 0 1px #2A2E37" } }))),
        React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, title),
        sub && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: C.muted, maxWidth: 300 } }, sub),
        action && React.createElement("button", { className: "cc-tap", onClick: onAction, style: { minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 13, cursor: "pointer" } }, action));
}
export { PremiumEmptyState };
