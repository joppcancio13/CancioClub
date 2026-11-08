import React, { useEffect } from "react";
import { C, F, BALL_URL, PILL_ON } from "../../styles/tokens";

// 14b — fim de treino calmo: disco parado, três números, uma pastilha por série, semana e próximo treino.
// Não fecha sozinho: Compartilhar (then) ou Fechar.
function Celebration({ title, subtitle, stats, sets, weekDone, weekTarget, nextLabel, sound, onDone, onClose }) {
    useEffect(() => { if (typeof sound === "function") sound(); }, []);
    const label = { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted };
    const tile = (on, s) => React.createElement("span", { style: { width: s, height: s, borderRadius: 2, ...(on ? { background: PILL_ON } : { boxShadow: "inset 0 0 0 1px #2A2E37" }) } });
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 50, background: C.ink, display: "flex", flexDirection: "column", animation: "cc-fade .3s ease" } },
        React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", inset: 0, background: "radial-gradient(60% 40% at 50% 22%, rgba(198,210,228,.12), transparent 70%)", pointerEvents: "none" } }),
        React.createElement("div", { style: { position: "relative", flex: 1, overflowY: "auto", width: "100%", maxWidth: 540, margin: "0 auto", boxSizing: "border-box", padding: "calc(env(safe-area-inset-top) + 56px) 20px 20px", display: "flex", flexDirection: "column", gap: 22 } },
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" } },
                React.createElement("img", { src: BALL_URL, alt: "", width: 110, height: 110, style: { display: "block", animation: "cc-reveal .7s cubic-bezier(.2,.8,.2,1) both" } }),
                React.createElement("span", { style: { ...label, color: C.silver } }, subtitle || "TREINO CONCLUÍDO"),
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 32, lineHeight: 1, color: C.text } }, title)),
            stats && stats.length > 0 && React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))`, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` } },
                stats.map(([v, l], i) => React.createElement("div", { key: i, style: { padding: "14px 0", display: "flex", flexDirection: "column", gap: 2, ...(i ? { paddingLeft: 14, borderLeft: `1px solid ${C.line}` } : {}) } },
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 30, color: C.text } }, v),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, l)))),
            sets > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
                React.createElement("span", { style: label }, "SÉRIES DE HOJE"),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } }, Array.from({ length: sets }).map((_, i) => React.createElement(React.Fragment, { key: i }, tile(true, 14))))),
            weekTarget > 0 && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line}` } },
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } },
                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, `${weekDone} de ${weekTarget} nesta semana`),
                    nextLabel && React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, "próximo: " + nextLabel)),
                React.createElement("div", { style: { display: "flex", gap: 3 } }, Array.from({ length: weekTarget }).map((_, i) => React.createElement(React.Fragment, { key: i }, tile(i < weekDone, 12)))))),
        React.createElement("div", { style: { position: "relative", width: "100%", maxWidth: 540, margin: "0 auto", boxSizing: "border-box", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 6 } },
            React.createElement("button", { className: "cc-tap", onClick: onDone, style: { height: 54, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Compartilhar"),
            React.createElement("button", { className: "cc-tap", onClick: onClose || onDone, style: { height: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Fechar")));
}
export { Celebration };
