import React, { useState } from "react";
import { LibItem } from "./LibItem";
import { Field } from "../shared/FormFields";
import { Pill } from "../shared/Pill";
import { PremiumEmptyState } from "../shared/PremiumEmptyState";
import { C, F, glassPanel } from "../../styles/tokens";

function LibraryManager({ library, onAdd, onUpdate, onRemove }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [tag, setTag] = useState("");
    const [filter, setFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("Todos");
    const add = () => { if (!name.trim())
        return; onAdd(name.trim(), url.trim(), tag.trim()); setName(""); setUrl(""); setTag(""); };
    const allTags = ["Todos", ...Array.from(new Set(library.map((e) => e.tag).filter(Boolean)))];
    const items = library.filter((e) => e.name.toLowerCase().includes(filter.trim().toLowerCase())).filter((e) => tagFilter === "Todos" || e.tag === tagFilter);
    return (React.createElement(React.Fragment, null,
        React.createElement("p", { style: { fontFamily: F.mono, fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 0, marginBottom: 16 } }, "Cadastre exerc\u00EDcios com o link do v\u00EDdeo (YouTube, gif...). Depois, ao montar o treino, \u00E9 s\u00F3 escolher da biblioteca \u2014 o nome e o v\u00EDdeo j\u00E1 v\u00EAm juntos."),
        React.createElement("div", { style: { ...glassPanel, borderRadius: 22, padding: 16, marginBottom: 18 } },
            React.createElement(Field, { label: "Nome do exerc\u00EDcio", type: "text", placeholder: "Ex.: Rosca direta", value: name, onChange: (e) => setName(e.target.value), onKeyDown: (e) => e.key === "Enter" && add() }),
            React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement(Field, { label: "Link do v\u00EDdeo (opcional)", type: "text", placeholder: "cole o link", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: (e) => e.key === "Enter" && add() })),
                React.createElement("div", { style: { flex: "0 1 130px" } },
                    React.createElement(Field, { label: "Tag (opcional)", type: "text", placeholder: "Ex.: Peito", value: tag, onChange: (e) => setTag(e.target.value), onKeyDown: (e) => e.key === "Enter" && add() }))),
            React.createElement("button", { onClick: add, disabled: !name.trim(), style: { marginTop: 14, width: "100%", fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, background: name.trim() ? C.silver : C.line, border: "none", borderRadius: 10, padding: "11px", cursor: name.trim() ? "pointer" : "default" } }, "Adicionar \u00E0 biblioteca")),
        allTags.length > 1 && (React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } }, allTags.map((t) => React.createElement(Pill, { key: t, active: tagFilter === t, onClick: () => setTagFilter(t) }, t)))),
        library.length > 3 && React.createElement("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "filtrar exerc\u00EDcios\u2026", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", outline: "none", marginBottom: 12 } }),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            items.length === 0 && React.createElement(PremiumEmptyState, { icon: "dumbbell", title: "A prateleira t\u00E1 vazia.", sub: "Adicione o primeiro exerc\u00EDcio a\u00ED em cima e monta seu acervo." }),
            items.map((it) => React.createElement(LibItem, { key: it.id, item: it, onUpdate: onUpdate, onRemove: () => onRemove(it.id) })))));
}
export { LibraryManager };
