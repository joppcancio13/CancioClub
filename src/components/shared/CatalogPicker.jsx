import React from "react";
import { catalogByGroup, exerciseCatalog } from "../../data/exerciseCatalog";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Vínculo de um exercício da ficha a uma entrada do catálogo biomecânico, em duas etapas (grupo
// muscular -> exercício dentro do grupo) em vez de uma lista única — mais de 60 exercícios numa
// lista só fica difícil de navegar. Sem vínculo, o exercício continua funcionando normal, só não
// entra na conta de volume por músculo (ver volumeCalculator/VolumeDashboard).
function CatalogPicker({ value, onChange, label }) {
    const [open, setOpen] = React.useState(false);
    const [step, setStep] = React.useState("groups"); // "groups" | "exercises"
    const [activeGroup, setActiveGroup] = React.useState(null);
    const current = value ? exerciseCatalog[value] : null;

    const openPicker = () => { setStep("groups"); setActiveGroup(null); setOpen(true); };
    const pickGroup = (grupo) => { haptic("tick"); setActiveGroup(grupo); setStep("exercises"); };
    const pickExercise = (id) => { haptic("confirm"); onChange(id); setOpen(false); };
    const clear = () => { haptic("tick"); onChange(""); setOpen(false); };

    const groupRows = React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
        catalogByGroup.map((g) => React.createElement("button", { key: g.grupo, className: "cc-tap", onClick: () => pickGroup(g.grupo), style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", borderRadius: 14, border: "none", textAlign: "left", cursor: "pointer", background: "#15181F", color: C.text } },
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 14, fontWeight: 600 } }, g.grupo),
            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } }, g.entries.length + " exercícios"),
                React.createElement("span", { style: { color: C.muted, fontFamily: F.mono, fontSize: 13 } }, "›")))));

    const activeEntries = activeGroup ? (catalogByGroup.find((g) => g.grupo === activeGroup) || { entries: [] }).entries : [];
    const exerciseRows = React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
        activeEntries.map((entry) => React.createElement("button", { key: entry.id, className: "cc-tap", onClick: () => pickExercise(entry.id), style: { display: "flex", flexDirection: "column", gap: 2, padding: "12px 15px", borderRadius: 14, border: "none", textAlign: "left", cursor: "pointer", background: value === entry.id ? C.text : "#15181F", color: value === entry.id ? C.ink : C.text } },
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 14, fontWeight: 600 } }, entry.nome),
            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: value === entry.id ? "#5A6273" : C.muted } }, entry.categoria))));

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        label && React.createElement("label", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted } }, label),
        React.createElement("button", { onClick: openPicker, style: { width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontFamily: F.body, fontSize: 13.5, color: current ? C.text : C.muted, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 11px", border: "none", cursor: "pointer", textAlign: "left" } },
            React.createElement("span", { style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, current ? current.nome : "Sem vínculo — toque pra ligar ao catálogo"),
            React.createElement("span", { style: { flexShrink: 0, color: C.muted, fontFamily: F.mono, fontSize: 13 } }, "›")),
        open && React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(5,6,10,.8)" }, onClick: () => setOpen(false) },
            React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto", maxHeight: "76vh", overflowY: "auto", borderRadius: 28, background: C.panel, boxShadow: "inset 0 0 0 1px #23262E", padding: "20px 16px 16px" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } },
                    step === "exercises"
                        ? React.createElement("button", { onClick: () => setStep("groups"), style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.silver } }, "‹ " + activeGroup)
                        : React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: C.muted } }, "LIGAR AO CATÁLOGO"),
                    React.createElement("button", { onClick: () => setOpen(false), style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 12, color: C.muted } }, "fechar")),
                current && React.createElement("button", { onClick: clear, style: { width: "100%", marginBottom: 12, fontFamily: F.mono, fontSize: 11.5, color: C.warn, background: "rgba(232,121,75,.1)", border: "none", borderRadius: 10, padding: "9px", cursor: "pointer" } }, "Remover vínculo atual"),
                step === "groups" ? groupRows : exerciseRows)));
}
export { CatalogPicker };
