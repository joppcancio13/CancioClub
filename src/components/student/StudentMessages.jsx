import React, { useState } from "react";
import { C, F, flatPanel } from "../../styles/tokens";
import { fmtDateTime } from "../../utils/date";

function StudentMessages({ messages, onSend }) {
    const [text, setText] = useState("");
    const send = () => { if (!text.trim())
        return; onSend(text.trim()); setText(""); };
    return (React.createElement("div", { style: { ...flatPanel, borderRadius: 22, padding: 16, marginTop: 18 } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 12 } }, "Recado para o professor"),
        React.createElement("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 2, placeholder: "Ex.: senti dor no ombro no supino hoje.", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.5 } }),
        React.createElement("button", { onClick: send, disabled: !text.trim(), style: { marginTop: 10, width: "100%", fontFamily: F.mono, fontSize: 13, letterSpacing: "0.04em", color: C.ink, background: text.trim() ? C.silver : C.line, border: "none", borderRadius: 10, padding: "11px", cursor: text.trim() ? "pointer" : "default" } }, "Enviar recado"),
        messages.length > 0 && React.createElement("div", { style: { marginTop: 14, display: "flex", flexDirection: "column", gap: 8 } }, [...messages].sort((a, b) => (a.date < b.date ? 1 : -1)).map((m) => React.createElement("div", { key: m.id, style: { background: C.ink, borderRadius: 10, padding: "10px 12px" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.5 } }, m.text),
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 6 } },
                fmtDateTime(m.date),
                " \u00B7 ",
                m.read ? "lido" : "enviado"))))));
}
export { StudentMessages };
