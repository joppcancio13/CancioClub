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
    const q = filter.trim();
    const createFromSearch = () => { if (!q) return; onAdd(q, "", tagFilter !== "Todos" ? tagFilter : ""); setFilter(""); };
    const chip = (t) => React.createElement("button", { key: t, className: "cc-tap", onClick: () => setTagFilter(t), style: { minHeight: 36, padding: "0 12px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(tagFilter === t ? { background: C.text, color: C.ink, fontWeight: 700 } : { background: "transparent", color: "#AEB7C6", boxShadow: "inset 0 0 0 1px #2A2E37" }) } }, t);
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
            React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, color: C.text } }, "BIBLIOTECA"),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, `${library.length} exercício${library.length === 1 ? "" : "s"}`)),
        React.createElement("input", { value: filter, onChange: (e) => setFilter(e.target.value), onKeyDown: (e) => e.key === "Enter" && items.length === 0 && createFromSearch(), placeholder: "Buscar ou criar exercício", style: { width: "100%", boxSizing: "border-box", padding: 14, borderRadius: 10, border: "none", outline: "none", background: C.panel, boxShadow: "inset 0 0 0 1.5px " + C.silver, color: C.text, fontFamily: F.body, fontSize: 15 } }),
        allTags.length > 1 && React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, allTags.map(chip)),
        React.createElement("div", null, items.map((it) => React.createElement(LibItem, { key: it.id, item: it, onUpdate: onUpdate, onRemove: () => onRemove(it.id) }))),
        q && items.length === 0 && React.createElement("button", { className: "cc-tap", onClick: createFromSearch, style: { minHeight: 48, borderRadius: 10, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2A2E37", color: C.silver, fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, `+ Criar "${q}" na biblioteca`),
        !q && library.length === 0 && React.createElement(PremiumEmptyState, { title: "A biblioteca está vazia", sub: "Digite o nome de um exercício acima pra criar o primeiro." }));
}
export { LibraryManager };
