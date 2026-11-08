import React from "react";
import { Field } from "../shared/FormFields";
import { C, F, glassPanel } from "../../styles/tokens";

function CardioSection({ entries, form, onChange, onAdd }) {
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 24, padding: 20, marginBottom: 14 } },
        React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 } }, "Cardio"),
        entries.length > 0 && (React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 } }, entries.map((c) => (React.createElement("div", { key: c.id, style: { display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 10, padding: "9px 11px" } },
            React.createElement("span", { style: { color: C.amber, fontFamily: F.mono, fontSize: 13 } }, "\u2713"),
            React.createElement("span", { style: { flex: 1, fontFamily: F.body, fontSize: 13, color: C.text } }, c.activity),
            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 13, color: C.muted } },
                c.minutes,
                " min")))))),
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
            React.createElement(Field, { label: "Atividade", type: "text", placeholder: "Esteira, bike, escada...", value: form.activity, onChange: (e) => onChange({ ...form, activity: e.target.value }), flex: "2 1 140px" }),
            React.createElement(Field, { label: "Tempo (min)", type: "text", inputMode: "numeric", placeholder: "30", value: form.minutes, onChange: (e) => onChange({ ...form, minutes: e.target.value }), flex: "1 1 80px" })),
        React.createElement("button", { onClick: () => onAdd(form.activity, form.minutes), disabled: !form.activity.trim() || !form.minutes, style: { minHeight: 44, marginTop: 10, width: "100%", fontFamily: F.mono, fontSize: 13, letterSpacing: "0.04em", color: C.ink, background: form.activity.trim() && form.minutes ? C.amber : C.line, border: "none", borderRadius: 10, padding: "12px", cursor: form.activity.trim() && form.minutes ? "pointer" : "default" } }, "Registrar cardio")));
}
export { CardioSection };
