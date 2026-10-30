import React, { useState } from "react";
import { Field } from "../shared/FormFields";
import { C, F, glassPanel } from "../../styles/tokens";
import { defaultSetPlan, planSummary } from "../../utils/workout";

function TemplateBuilder({ onSave, library }) {
    const [name, setName] = useState("");
    const [exs, setExs] = useState([]);
    const [f, setF] = useState({ name: "", sets: "3", reps: "10", rest: "", note: "", url: "" });
    const [pickLib, setPickLib] = useState(false);
    const [libFilter, setLibFilter] = useState("");
    const add = () => { if (!f.name.trim())
        return; const rs = parseInt(f.rest); setExs([...exs, { name: f.name.trim(), sets: parseInt(f.sets) || 1, reps: f.reps || "1", rest: isNaN(rs) ? undefined : rs, note: f.note.trim() || undefined, url: f.url.trim() || undefined, setPlan: defaultSetPlan(f.sets, f.reps) }]); setF({ name: "", sets: "3", reps: "10", rest: "", note: "", url: "" }); };
    const save = () => { if (!name.trim() || !exs.length)
        return; onSave(name.trim(), exs); setName(""); setExs([]); };
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 22, padding: 16, marginBottom: 20 } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 12 } }, "Novo modelo"),
        React.createElement(Field, { label: "Nome do modelo", type: "text", placeholder: "Ex.: Inferiores B", value: name, onChange: (e) => setName(e.target.value) }),
        exs.length > 0 && React.createElement("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 } }, exs.map((e, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, fontFamily: F.mono, fontSize: 12.5, color: C.text, background: C.ink, borderRadius: 8, padding: "8px 10px" } },
            React.createElement("span", { style: { flex: 1 } },
                e.name,
                " ",
                React.createElement("span", { style: { color: C.muted } },
                    "\u00B7 ",
                    planSummary(e),
                    e.rest ? ` · ${e.rest}s` : "",
                    e.note ? " · obs" : "",
                    e.url ? " · vídeo" : "")),
            React.createElement("button", { onClick: () => setExs(exs.filter((_, k) => k !== i)), style: { color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.mono, fontSize: 15 } }, "\u00D7")))),
        library && library.length > 0 && (React.createElement("div", { style: { marginTop: 12 } },
            React.createElement("button", { onClick: () => setPickLib((v) => !v), style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, pickLib ? "Fechar biblioteca" : "Escolher da biblioteca"),
            pickLib && (React.createElement("div", { style: { marginTop: 10, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 12, padding: 10 } },
                React.createElement("input", { value: libFilter, onChange: (e) => setLibFilter(e.target.value), placeholder: "filtrar\u2026", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 13.5, color: C.text, ...glassPanel, borderRadius: 8, padding: "8px 10px", outline: "none", marginBottom: 8 } }),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, maxHeight: 200, overflowY: "auto" } }, library.filter((e) => e.name.toLowerCase().includes(libFilter.trim().toLowerCase())).map((e) => (React.createElement("button", { key: e.id, onClick: () => { setF((fm) => ({ ...fm, name: e.name, url: e.url || "" })); setPickLib(false); setLibFilter(""); }, style: { textAlign: "left", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel, border: "none", borderRadius: 8, padding: "9px 11px", cursor: "pointer" } },
                    e.name,
                    e.url ? React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.silver } }, " \u00B7 v\u00EDdeo") : "")))))))),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
            React.createElement(Field, { label: "Exerc\u00EDcio", type: "text", placeholder: "Nome", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), flex: "2 1 0" }),
            React.createElement(Field, { label: "S\u00E9ries", type: "text", inputMode: "numeric", value: f.sets, onChange: (e) => setF({ ...f, sets: e.target.value }), flex: "1 1 0" }),
            React.createElement(Field, { label: "Reps", type: "text", value: f.reps, onChange: (e) => setF({ ...f, reps: e.target.value }), flex: "1 1 0" }),
            React.createElement(Field, { label: "Desc(s)", type: "text", inputMode: "numeric", placeholder: "\u2014", value: f.rest, onChange: (e) => setF({ ...f, rest: e.target.value }), flex: "1 1 0" })),
        React.createElement(Field, { label: "Observa\u00E7\u00E3o (opcional)", type: "text", placeholder: "Dica de execu\u00E7\u00E3o", value: f.note, onChange: (e) => setF({ ...f, note: e.target.value }) }),
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.5 } }, "Cria s\u00E9ries de trabalho iguais. Pra diferenciar (aquecimento, pir\u00E2mide), ajuste depois de aplicar o modelo."),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
            React.createElement("button", { onClick: add, style: { fontFamily: F.mono, fontSize: 13, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "+ Adicionar exerc\u00EDcio"),
            React.createElement("button", { onClick: save, disabled: !name.trim() || !exs.length, style: { flex: 1, fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, background: name.trim() && exs.length ? C.silver : C.line, border: "none", borderRadius: 10, padding: "11px", cursor: name.trim() && exs.length ? "pointer" : "default" } }, "Salvar modelo"))));
}
export { TemplateBuilder };
