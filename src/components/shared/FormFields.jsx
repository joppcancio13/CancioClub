import React from "react";
import { C, F, KICKER } from "../../styles/tokens";

// Campos de formulário no padrão atual (frente 2 do refinamento, 18/nov): rótulo em KICKER, campo
// chapado com fio, raio 12, 48 px de altura. Usados na anamnese, reavaliação, contato e telas do professor.
const fieldBox = { width: "100%", boxSizing: "border-box", minHeight: 48, fontFamily: F.body, fontSize: 16, color: C.text, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.outline}`, border: "none", borderRadius: 12, padding: "12px 14px", outline: "none", colorScheme: "dark" };

function Field({ label, flex, ...props }) {
    return (
        <label style={{ display: "flex", flexDirection: "column", gap: 8, flex: flex || "1 1 auto", minWidth: 0 }}>
            <span style={KICKER}>{label}</span>
            <input {...props} style={{ ...fieldBox, ...(props.style || {}) }} />
        </label>
    );
}
function TextArea({ label, ...props }) {
    return (
        <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <span style={KICKER}>{label}</span>
            <textarea {...props} style={{ ...fieldBox, resize: "vertical", lineHeight: 1.45, ...(props.style || {}) }} />
        </label>
    );
}
export { Field, TextArea };
