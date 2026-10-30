import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

function PSEModal({ onSelect, onCancel }) {
    const [sel, setSel] = useState(null);
    const opts = [
        { key: "facil", label: "F\u00E1cil", sub: "Tranquilo, sobrou g\u00E1s", n: 1 },
        { key: "medida", label: "Na medida", sub: "Desafiador, do jeito certo", n: 2 },
        { key: "destruidor", label: "Destruidor", sub: "Dei tudo, no limite", n: 3 },
    ];
    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,6,10,.8)" }, onClick: onCancel },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto", borderRadius: 28, background: C.panel, boxShadow: "inset 0 0 0 1px #23262E", padding: "22px 18px 16px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: C.muted } }, "FINALIZAR TREINO"),
                onCancel && React.createElement("button", { onClick: onCancel, style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 12, color: C.muted } }, "voltar")),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 26, lineHeight: 1, marginTop: 8 } }, "COMO FOI", React.createElement("br"), "O ESFOR\u00C7O?"),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 8 } }, "Ajuda seu professor a ajustar a carga."),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 18 } }, opts.map((o) => {
                const on = sel === o.key;
                return React.createElement("button", { key: o.key, className: "cc-tap", onClick: () => { haptic("tick"); setSel(o.key); }, style: { display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, border: "none", textAlign: "left", cursor: "pointer", background: on ? C.text : "#15181F", color: on ? C.ink : C.text } },
                    React.createElement("span", { style: { display: "flex", gap: 3, width: 44, flexShrink: 0 } }, [0, 1, 2].map((j) => React.createElement("span", { key: j, style: { width: 12, height: 12, borderRadius: 2, background: j < o.n ? (on ? C.ink : "linear-gradient(135deg,#fff,#9AA4B5)") : "transparent", boxShadow: j < o.n ? "none" : `inset 0 0 0 1px ${on ? "#9AA4B5" : "#2E333D"}` } }))),
                    React.createElement("span", null,
                        React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 700, fontSize: 16 } }, o.label),
                        React.createElement("span", { style: { display: "block", fontFamily: F.body, fontSize: 12.5, marginTop: 2, color: on ? "#5A6273" : C.muted } }, o.sub)));
            })),
            React.createElement("button", { className: "cc-tap", disabled: !sel, onClick: () => sel && onSelect(sel), style: { width: "100%", marginTop: 12, padding: 18, borderRadius: 18, border: "none", cursor: sel ? "pointer" : "default", fontFamily: F.display, fontWeight: 800, fontSize: 16, background: sel ? C.text : "#1A1D24", color: sel ? C.ink : "#5A6273" } }, "Finalizar treino")));
}
export { PSEModal };
