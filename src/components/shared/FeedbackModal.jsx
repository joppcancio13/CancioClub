import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

/* --------------------------- medalhas ---------------------------- */
function FeedbackModal({ question, onSend, onSkip }) {
    const [text, setText] = useState("");
    const [quick, setQuick] = useState(null);
    const QUICK = ["Senti dor", "Carga leve demais", "Aparelho ocupado", "Treino top"];
    const msg = [quick, text.trim()].filter(Boolean).join(" \u00B7 ");
    const chip = (t) => { const sel = quick === t; return React.createElement("button", { key: t, className: "cc-tap", onClick: () => { haptic("tick"); setQuick(sel ? null : t); }, style: { fontFamily: F.body, fontWeight: 500, fontSize: 14, padding: "11px 15px", borderRadius: 999, border: "none", cursor: "pointer", background: sel ? C.text : "transparent", color: sel ? C.ink : "#C9D0DC", boxShadow: sel ? "none" : "inset 0 0 0 1px #2E333D" } }, t); };
    return React.createElement("div", { className: "cc-fade-in cc-full-h", style: { position: "fixed", inset: 0, zIndex: 100, background: C.ink, overflowY: "auto" } },
        React.createElement("div", { style: { maxWidth: 520, margin: "0 auto", minHeight: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", padding: "calc(28px + env(safe-area-inset-top)) 22px calc(24px + env(safe-area-inset-bottom))" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: C.muted } },
                React.createElement("span", null, "Treino salvo \u2713"),
                React.createElement("button", { onClick: onSkip, style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.silver } }, "Pular")),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 26, lineHeight: 1, marginTop: 40 } }, "QUER CONTAR", React.createElement("br"), "COMO FOI?"),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, lineHeight: 1.5, color: C.muted, marginTop: 10 } }, question || "Vai direto pro seu professor."),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 } }, QUICK.map(chip)),
            React.createElement("textarea", { value: text, onChange: (e) => setText(e.target.value), placeholder: "Escreva se quiser\u2026", style: { marginTop: 16, minHeight: 110, borderRadius: 16, background: C.panel, border: "1px solid #23262E", padding: "14px 16px", fontFamily: F.body, fontSize: 15, lineHeight: 1.5, color: C.text, outline: "none", resize: "none" } }),
            React.createElement("div", { style: { marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", gap: 6 } },
                React.createElement("button", { className: "cc-tap", onClick: () => (msg ? onSend(msg) : onSkip()), style: { fontFamily: F.display, fontWeight: 800, fontSize: 16, padding: 19, borderRadius: 18, border: "none", cursor: "pointer", background: C.text, color: C.ink } }, msg ? "Enviar e ver meu card" : "Ver meu card"),
                msg && React.createElement("button", { onClick: onSkip, style: { fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", padding: 10, cursor: "pointer" } }, "ou s\u00F3 ver o card"))));
}
export { FeedbackModal };
