import React from "react";
import { DiscoBall } from "../shared/DiscoBall";
import { C, F, glassPanel } from "../../styles/tokens";

function RecoverySection({ state, onToggle }) {
    const items = [
        { key: "hydration", label: "Hidratação" },
        { key: "sleep", label: "Sono 7h+" },
        { key: "mobility", label: "Mobilidade" },
    ];
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 22, padding: 20, marginBottom: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 } },
            React.createElement(DiscoBall, { size: 34, seedN: 21 }),
            React.createElement("div", null,
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 14.5, color: "#FFFFFF" } }, "Descanso tamb\u00E9m \u00E9 treino"),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 11.5, color: C.muted, marginTop: 1 } }, "Sem carga hoje \u2014 s\u00F3 cuidado."))),
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 4 } }, "Recupera\u00E7\u00E3o Ativa"),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 } }, "Hoje \u00E9 dia de descanso \u2014 marque o que voc\u00EA cuidou."),
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, items.map((it) => (React.createElement("button", { key: it.key, onClick: () => onToggle(it.key), style: { fontFamily: F.body, fontSize: 13.5, color: state[it.key] ? C.ink : C.text, background: state[it.key] ? C.amber : C.panel2, border: "none", borderRadius: 999, padding: "10px 16px", cursor: "pointer" } },
            it.label,
            state[it.key] ? " ✓" : ""))))));
}
export { RecoverySection };
