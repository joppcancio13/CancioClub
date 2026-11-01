import React from "react";
import { catalogByGroup, exerciseCatalog } from "../../data/exerciseCatalog";
import { C, F } from "../../styles/tokens";
import { suggestCatalogMatch } from "../../utils/catalogMatch";
import { haptic } from "../../utils/misc";

const chip = (txt, key) => React.createElement("span", { key: key || txt, style: { fontFamily: F.mono, fontSize: 10.5, color: C.silver, background: "rgba(255,255,255,0.06)", borderRadius: 999, padding: "4px 9px", textTransform: "capitalize" } }, String(txt).replace(/_/g, " "));

// Vínculo de um exercício da ficha a uma entrada do catálogo biomecânico (redesign estético 4,
// item 8: "CONTA NO VOLUME COMO"). Primeiro tenta sugerir pelo NOME do exercício — um toque em
// "Usar" resolve o caso comum. "Outro exercício do catálogo ›" abre a busca antiga em duas etapas
// (grupo muscular -> exercício) pra quando a sugestão erra ou não existe. Sem vínculo, o
// exercício continua funcionando normal, só não entra na conta de volume por músculo.
function CatalogPicker({ value, onChange, label, exerciseName }) {
    const [browseOpen, setBrowseOpen] = React.useState(false);
    const [step, setStep] = React.useState("groups"); // "groups" | "exercises"
    const [activeGroup, setActiveGroup] = React.useState(null);
    const current = value ? exerciseCatalog[value] : null;
    const suggestion = !current && exerciseName ? suggestCatalogMatch(exerciseName, exerciseCatalog) : null;

    const openBrowse = () => { setStep("groups"); setActiveGroup(null); setBrowseOpen(true); };
    const pickGroup = (grupo) => { haptic("tick"); setActiveGroup(grupo); setStep("exercises"); };
    const pickExercise = (id) => { haptic("confirm"); onChange(id); setBrowseOpen(false); };
    const clear = () => { haptic("tick"); onChange(""); setBrowseOpen(false); };
    const useSuggestion = () => { haptic("confirm"); onChange(suggestion.id); };

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

    const browseModal = browseOpen && React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(5,6,10,.8)" }, onClick: () => setBrowseOpen(false) },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto", maxHeight: "76vh", overflowY: "auto", borderRadius: 28, background: C.panel, boxShadow: "inset 0 0 0 1px #23262E", padding: "20px 16px 16px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } },
                step === "exercises"
                    ? React.createElement("button", { onClick: () => setStep("groups"), style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.silver } }, "‹ " + activeGroup)
                    : React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: C.muted } }, "OUTRO EXERCÍCIO DO CATÁLOGO"),
                React.createElement("button", { onClick: () => setBrowseOpen(false), style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 12, color: C.muted } }, "fechar")),
            current && React.createElement("button", { onClick: clear, style: { width: "100%", marginBottom: 12, fontFamily: F.mono, fontSize: 11.5, color: C.warn, background: "rgba(232,121,75,.1)", border: "none", borderRadius: 10, padding: "9px", cursor: "pointer" } }, "Remover vínculo atual"),
            step === "groups" ? groupRows : exerciseRows));

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
        label && React.createElement("label", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted } }, label),
        current && React.createElement("div", { style: { background: C.panel2, borderRadius: 12, padding: "10px 12px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, current.nome),
                React.createElement("button", { onClick: openBrowse, style: { flexShrink: 0, fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.silver, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Trocar ›")),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 } }, Object.keys(current.ativacao || {}).map((m) => chip(m)))),
        !current && suggestion && React.createElement("div", { style: { background: C.panel2, borderRadius: 12, padding: "10px 12px" } },
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 4 } }, "sugestão pelo nome"),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, suggestion.nome),
                React.createElement("button", { className: "cc-tap", onClick: useSuggestion, style: { flexShrink: 0, fontFamily: F.display, fontWeight: 700, fontSize: 12.5, color: C.ink, background: C.silver, border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer" } }, "Usar")),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 } }, Object.keys(suggestion.ativacao || {}).map((m) => chip(m))),
            React.createElement("button", { onClick: openBrowse, style: { marginTop: 8, fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Outro exercício do catálogo ›")),
        !current && !suggestion && React.createElement("button", { onClick: openBrowse, style: { width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontFamily: F.body, fontSize: 13.5, color: C.muted, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 11px", border: "none", cursor: "pointer", textAlign: "left" } },
            React.createElement("span", null, "Sem vínculo — toque pra ligar ao catálogo"),
            React.createElement("span", { style: { flexShrink: 0, color: C.muted, fontFamily: F.mono, fontSize: 13 } }, "›")),
        browseModal);
}
export { CatalogPicker };
