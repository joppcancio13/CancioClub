import React, { useState } from "react";
import { C, F, PILL_ON } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// 14a — folha de esforço ao finalizar: três opções com barrinhas de intensidade
function PSEModal({ onSelect, onCancel, summary }) {
    const [sel, setSel] = useState(null);
    const opts = [
        { key: "facil", label: "Fácil", sub: "sobrou energia", n: 1 },
        { key: "medida", label: "Na medida", sub: "cansou, mas deu conta", n: 2 },
        { key: "destruidor", label: "Destruidor", sub: "no limite", n: 3 },
    ];
    return React.createElement("div", { className: "cc-fade-in", onClick: onCancel, style: { position: "fixed", inset: 0, zIndex: 90, background: "rgba(5,6,10,.7)", display: "flex", alignItems: "flex-end" } },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 12 } },
            React.createElement("span", { style: { width: 36, height: 4, borderRadius: 2, background: C.line2, margin: "0 auto 6px" } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 } },
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                    summary && React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted } }, summary.toUpperCase()),
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1.05, color: C.text } }, "COMO FOI O", React.createElement("br"), "TREINO?")),
                onCancel && React.createElement("button", { className: "cc-tap", onClick: onCancel, style: { minHeight: 44, padding: "0 4px 0 12px", border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Voltar")),
            opts.map((o) => { const on = sel === o.key;
                return React.createElement("button", { key: o.key, className: "cc-tap", onClick: () => { haptic("tick"); setSel(o.key); }, style: { minHeight: 44, display: "grid", gridTemplateColumns: "1fr auto", gap: "4px 12px", alignItems: "center", padding: 16, borderRadius: 16, border: "none", textAlign: "left", cursor: "pointer", ...(on ? { background: C.text, color: C.ink } : { background: "transparent", color: C.text, boxShadow: "inset 0 0 0 1px #2A2E37" }) } },
                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 800, fontSize: 18 } }, o.label),
                    React.createElement("span", { style: { gridRow: "span 2", display: "flex", gap: 3, alignItems: "flex-end" } }, [1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: 10, height: 8 + i * 8, borderRadius: 2, ...(i <= o.n ? { background: on ? C.ink : PILL_ON } : { boxShadow: `inset 0 0 0 1px ${on ? "#8D97A9" : "#2A2E37"}` }) } }))),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: on ? "#3A404C" : C.muted } }, o.sub)); }),
            React.createElement("button", { className: "cc-tap", disabled: !sel, onClick: () => sel && onSelect(sel), style: { marginTop: 6, height: 54, borderRadius: 16, border: "none", background: sel ? C.text : "#1E222A", color: sel ? C.ink : "#5A6273", fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: sel ? "pointer" : "default" } }, "Finalizar")));
}
export { PSEModal };
