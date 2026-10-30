import React from "react";
import { C, EMPTY_ICON_PATHS, F, glassPanel } from "../../styles/tokens";

// substitui os antigos EmptyBox/EmptyLine (texto cinza centralizado) — ícone fino + frase com
// atitude, no lugar de um aviso burocrático de "não há dados". compact=true pra quando já está
// dentro de um painel (sem outro glassPanel aninhado); compact=false pro caso isolado (onboarding).
function PremiumEmptyState({ icon, title, sub, compact = true }) {
    const draw = EMPTY_ICON_PATHS[icon] || EMPTY_ICON_PATHS.rest;
    const strokeProps = { fill: "none", stroke: C.silver, strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round" };
    return (React.createElement("div", { style: { textAlign: "center", padding: compact ? "30px 16px" : "60px 24px", ...(compact ? {} : glassPanel), borderRadius: compact ? 0 : 26 } },
        React.createElement("svg", { width: 34, height: 34, viewBox: "0 0 32 32", "aria-hidden": "true", style: { display: "block", margin: "0 auto 14px", opacity: 0.55 } }, draw(strokeProps)),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 14.5, fontWeight: 600, color: C.text, lineHeight: 1.5, maxWidth: 280, marginLeft: "auto", marginRight: "auto" } }, title),
        sub && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11.5, color: C.muted, marginTop: 8, lineHeight: 1.6, maxWidth: 260, marginLeft: "auto", marginRight: "auto" } }, sub)));
}
export { PremiumEmptyState };
