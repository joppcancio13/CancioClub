import React from "react";
import { catalogByGroup, exerciseCatalog } from "../../data/exerciseCatalog";
import { C, F } from "../../styles/tokens";
import { suggestCatalogMatch } from "../../utils/catalogMatch";
import { haptic } from "../../utils/misc";

// Sheet de vínculo em lote (redesign estético 4, item 9): abre do "N exercícios fora da conta ·
// Vincular ›" no fim da aba Volume. Cada exercício já vem com uma sugestão pelo nome quando dá;
// "Confirmar N sugestões" liga todos de uma vez. Sem sugestão, busca inline com chips de grupo.
// "Deixar fora da conta" marca excludeFromVolume e o exercício some da lista (cardio, mobilidade...).
function BulkLinkSheet({ items, onConfirm, onExclude, onClose }) {
    const [choices, setChoices] = React.useState(() => {
        const init = {};
        items.forEach((it) => { const s = suggestCatalogMatch(it.name, exerciseCatalog); if (s) init[it.id] = s.id; });
        return init;
    });
    const [searchFor, setSearchFor] = React.useState(null); // id do item com a busca aberta, ou null
    const [query, setQuery] = React.useState("");
    const [groupFilter, setGroupFilter] = React.useState("Todos");

    const confirmCount = items.filter((it) => choices[it.id]).length;

    const confirm = () => {
        haptic("confirm");
        const links = items.filter((it) => choices[it.id]).map((it) => ({ id: it.id, day: it.day, catalogId: choices[it.id] }));
        onConfirm(links);
    };

    const openSearch = (id) => { haptic("tick"); setSearchFor(id); setQuery(""); setGroupFilter("Todos"); };
    const pick = (id, catalogId) => { haptic("confirm"); setChoices((c) => ({ ...c, [id]: catalogId })); setSearchFor(null); };
    const exclude = (it) => { haptic("tick"); onExclude(it); };

    const q = query.trim().toLowerCase();
    const searchResults = React.useMemo(() => {
        if (searchFor == null) return [];
        const pool = groupFilter === "Todos" ? Object.values(exerciseCatalog) : (catalogByGroup.find((g) => g.grupo === groupFilter) || { entries: [] }).entries;
        const filtered = q ? pool.filter((e) => e.nome.toLowerCase().includes(q)) : pool;
        return filtered.slice(0, 8);
    }, [searchFor, groupFilter, q]);

    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 105, background: "rgba(5,6,10,.8)" }, onClick: onClose },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 560, margin: "0 auto", maxHeight: "82vh", overflowY: "auto", borderRadius: 28, background: C.panel, boxShadow: "inset 0 0 0 1px #23262E", padding: "20px 16px 16px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18, textTransform: "uppercase" } }, "Fora da conta · " + items.length),
                React.createElement("button", { onClick: onClose, style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 12, color: C.muted } }, "fechar")),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, items.map((it) => {
                const suggested = choices[it.id] ? exerciseCatalog[choices[it.id]] : null;
                const isSearching = searchFor === it.id;
                return React.createElement("div", { key: it.id, style: { background: C.panel2, borderRadius: 14, padding: "12px 14px" } },
                    React.createElement("div", { style: { fontFamily: F.body, fontSize: 14.5, fontWeight: 600, color: C.text } }, it.name),
                    suggested && !isSearching && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8 } },
                        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.silver, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, suggested.nome),
                        React.createElement("button", { onClick: () => openSearch(it.id), style: { flexShrink: 0, fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "outro")),
                    !suggested && !isSearching && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8 } },
                        React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11.5, color: C.muted } }, "sem sugestão"),
                        React.createElement("button", { className: "cc-tap", onClick: () => openSearch(it.id), style: { flexShrink: 0, fontFamily: F.body, fontSize: 12.5, fontWeight: 700, color: C.ink, background: C.silver, border: "none", borderRadius: 8, padding: "6px 11px", cursor: "pointer" } }, "Buscar")),
                    isSearching && React.createElement("div", { style: { marginTop: 10 } },
                        React.createElement("input", { autoFocus: true, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "nome do exercício…", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 13.5, color: C.text, background: C.ink, border: "none", borderRadius: 10, padding: "9px 11px", outline: "none" } }),
                        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 } }, ["Todos", ...catalogByGroup.map((g) => g.grupo)].map((g) => React.createElement("button", { key: g, onClick: () => setGroupFilter(g), style: { fontFamily: F.mono, fontSize: 10.5, color: groupFilter === g ? C.ink : C.muted, background: groupFilter === g ? C.silver : "transparent", boxShadow: groupFilter === g ? "none" : "inset 0 0 0 1px #2A2E37", border: "none", borderRadius: 999, padding: "4px 10px", cursor: "pointer" } }, g))),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 8 } }, searchResults.map((entry) => React.createElement("button", { key: entry.id, onClick: () => pick(it.id, entry.id), style: { textAlign: "left", fontFamily: F.body, fontSize: 13, color: C.text, background: C.ink, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer" } }, entry.nome))),
                        React.createElement("button", { onClick: () => setSearchFor(null), style: { marginTop: 6, fontFamily: F.body, fontSize: 12, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "cancelar")),
                    !isSearching && React.createElement("button", { onClick: () => exclude(it), style: { marginTop: 8, fontFamily: F.body, fontSize: 11.5, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "deixar fora da conta"));
            })),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.5 } }, "ou deixar fora de propósito (cardio, mobilidade) — ele para de aparecer aqui"),
            React.createElement("button", { className: "cc-tap", disabled: confirmCount === 0, onClick: confirm, style: { width: "100%", marginTop: 14, fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.ink, background: confirmCount ? "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)" : C.line, border: "none", borderRadius: 14, padding: "15px 0", cursor: confirmCount ? "pointer" : "default" } }, "Confirmar " + confirmCount + " sugestões")));
}
export { BulkLinkSheet };
