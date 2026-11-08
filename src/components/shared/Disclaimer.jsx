import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

// 15c — termo como tela calma: três combinados + aceite que libera "Começar"
const POINTS = [
    ["É apoio, não avaliação", "O app não substitui a avaliação presencial de um profissional de Educação Física nem a orientação médica."],
    ["Seu limite manda", "Sentiu dor, tontura, falta de ar ou qualquer desconforto: pare na hora e avise seu professor."],
    ["Seus dados ficam com a gente", "O que você registra é visto só por você e pelo seu professor."],
];
function Disclaimer({ onAccept }) {
    const [ok, setOk] = useState(false);
    // LGPD: dado de saúde é sensível — consentimento separado, específico e explícito (art. 11)
    const [health, setHealth] = useState(false);
    const box = (on) => ({ width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, ...(on ? { background: C.text, color: C.ink } : { boxShadow: "inset 0 0 0 1.5px #2E333D" }) });
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 100, background: C.ink, overflowY: "auto", display: "flex", flexDirection: "column" } },
        React.createElement("div", { style: { flex: 1, width: "100%", maxWidth: 540, margin: "0 auto", boxSizing: "border-box", padding: "calc(env(safe-area-inset-top) + 64px) 22px 24px", display: "flex", flexDirection: "column", gap: 18 } },
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.silver } }, "ANTES DE COMEÇAR"),
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 30, lineHeight: 1, color: C.text } }, "TRÊS COMBINADOS")),
            React.createElement("div", null, POINTS.map(([t, s], i) => React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "30px 1fr", gap: 12, padding: "16px 0", borderTop: `1px solid ${C.line}` } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 24, color: C.silver } }, String(i + 1).padStart(2, "0")),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, t),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: "#AEB7C6" } }, s)))))),
        React.createElement("div", { style: { position: "sticky", bottom: 0, width: "100%", maxWidth: 540, margin: "0 auto", boxSizing: "border-box", padding: "16px 22px calc(env(safe-area-inset-bottom) + 20px)", background: C.ink, display: "flex", flexDirection: "column", gap: 12 } },
            React.createElement("button", { className: "cc-tap", onClick: () => setOk(!ok), style: { display: "flex", gap: 12, alignItems: "center", minHeight: 44, border: "none", background: "transparent", textAlign: "left", cursor: "pointer", padding: 0 } },
                React.createElement("span", { style: { width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, ...(ok ? { background: C.text, color: C.ink } : { boxShadow: "inset 0 0 0 1.5px #2E333D" }) } }, ok ? "\u2713" : ""),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: "#C9D0DC" } }, "Li e concordo com os três pontos.")),
            React.createElement("button", { className: "cc-tap", onClick: () => setHealth(!health), style: { display: "flex", gap: 12, alignItems: "center", minHeight: 44, border: "none", background: "transparent", textAlign: "left", cursor: "pointer", padding: 0 } },
                React.createElement("span", { style: box(health) }, health ? "\u2713" : ""),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: "#C9D0DC" } }, "Autorizo o uso dos meus dados de sa\u00FAde (anamnese e medidas) s\u00F3 para meu professor montar e acompanhar meu treino. Posso revogar e pedir a exclus\u00E3o em \u201CMeus dados\u201D.")),
            React.createElement("button", { className: "cc-tap", disabled: !(ok && health), onClick: onAccept, style: { height: 54, borderRadius: 16, border: "none", background: ok && health ? C.text : "#1E222A", color: ok && health ? C.ink : "#5A6273", fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: ok && health ? "pointer" : "default" } }, "Começar")));
}
export { Disclaimer };
