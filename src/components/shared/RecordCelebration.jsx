import React, { useEffect } from "react";
import { C, F, BALL_URL } from "../../styles/tokens";
import { fmtKg } from "../../utils/records";

// 9b — celebração única no fim do treino com todos os recordes confirmados do dia
function RecordCelebration({ records, sound, onShare, onClose }) {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useEffect(() => { if (typeof sound === "function") sound(); }, []);
    const n = records.length;
    const label = { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.silver };
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 50, background: C.ink, display: "flex", flexDirection: "column", overflow: "hidden", animation: "cc-fade .3s ease" } },
        React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", inset: 0, background: "radial-gradient(60% 40% at 50% 26%, rgba(198,210,228,.16), transparent 70%)", pointerEvents: "none" } }),
        !reduce && [-28, -12, 8, 24].map((a, i) => React.createElement("div", { key: i, "aria-hidden": "true", style: { position: "absolute", left: "50%", top: -40, width: 2, height: "60%", transformOrigin: "top", transform: `rotate(${a}deg)`, background: "linear-gradient(180deg, rgba(242,245,250,.25), transparent)", pointerEvents: "none", animation: `cc-fade .8s ease ${0.15 * i}s both` } })),
        React.createElement("div", { style: { position: "relative", flex: 1, overflowY: "auto", padding: "calc(env(safe-area-inset-top) + 64px) 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 } },
            React.createElement("img", { src: BALL_URL, alt: "", width: 130, height: 130, style: { width: 130, height: 130, display: "block", animation: reduce ? "none" : "cc-reveal .7s cubic-bezier(.2,.8,.2,1) both" } }),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" } },
                React.createElement("span", { style: label }, n === 1 ? "NOVO RECORDE" : `${n} RECORDES HOJE`),
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 34, lineHeight: 1, color: C.text } }, n === 1 ? records[0].name.toUpperCase() : "NOITE DE RECORDE")),
            React.createElement("div", { style: { alignSelf: "stretch", display: "flex", flexDirection: "column", marginTop: 6 } },
                records.map((r, i) => React.createElement("div", { key: r.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 0", borderTop: `1px solid ${C.line}`, animation: reduce ? "none" : `cc-pop .45s ease ${0.25 + i * 0.12}s both` } },
                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 } },
                        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.text } }, "\u2605 " + r.name),
                        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, r.kind === "load" ? `+${fmtKg(r.delta)} kg sobre ${fmtKg(r.prevLoad)} kg` : `+${r.delta} reps com ${fmtKg(r.load)} kg`)),
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 44, lineHeight: 1, color: C.text, flexShrink: 0 } }, r.kind === "load" ? fmtKg(r.load) : String(r.reps),
                        React.createElement("span", { style: { fontSize: 15, color: C.muted, fontWeight: 600 } }, r.kind === "load" ? " kg" : " reps")))))),
        React.createElement("div", { style: { position: "relative", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 6 } },
            React.createElement("button", { className: "cc-tap", onClick: onShare, style: { height: 54, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Compartilhar card"),
            React.createElement("button", { className: "cc-tap", onClick: onClose, style: { height: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Fechar")));
}
export { RecordCelebration };
