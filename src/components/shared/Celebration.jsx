import React, { useEffect } from "react";
import { DiscoBall } from "./DiscoBall";
import { C, F, SEAL_MARK_URL } from "../../styles/tokens";

/* ------------------------- comemoração ------------------------ */
function Celebration({ title, subtitle, value, volumeLabel, accent, tint, sound, seal, onDone }) {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useEffect(() => { if (typeof sound === "function")
        sound(); const t = setTimeout(onDone, 2900); return () => clearTimeout(t); }, []);
    const cols = [tint, accent, "#FFFFFF"];
    const parts = reduce ? [] : Array.from({ length: 36 }).map((_, i) => { const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 230; return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, c: cols[i % 3], delay: Math.random() * 0.25, size: 6 + Math.random() * 7 }; });
    return (React.createElement("div", { onClick: onDone, role: "status", "aria-live": "polite", style: { position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", overflow: "hidden", background: "rgba(5,6,9,.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "cc-fade .3s ease" } },
        !reduce && React.createElement("div", { style: { position: "absolute", width: 560, height: 560, borderRadius: "50%", background: `repeating-conic-gradient(from 0deg, transparent 0 10deg, ${accent}12 10deg 12deg)`, animation: "cc-rays 9s linear infinite" } }),
        // varredura de brilho metálico, esquerda -> direita, uma vez só — o "flare" do momento catártico
        !reduce && React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" } },
            React.createElement("div", { style: { position: "absolute", top: "-20%", bottom: "-20%", width: "55%", background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,.45) 45%, rgba(255,255,255,.9) 50%, rgba(255,255,255,.45) 55%, transparent 100%)", mixBlendMode: "overlay", animation: "cc-flare 1.6s cubic-bezier(.2,.7,.2,1) .35s both" } })),
        React.createElement("div", { style: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: 20 } },
            React.createElement("div", { style: { marginBottom: 18, animation: reduce ? "none" : "cc-reveal .7s cubic-bezier(.2,.8,.2,1) both" } },
                seal
                    ? React.createElement("img", { src: SEAL_MARK_URL, alt: "", width: 118, height: 118, style: { width: 118, height: 118, display: "block", filter: `drop-shadow(0 0 30px ${accent}70)` } })
                    : React.createElement(DiscoBall, { size: 118, cols: 13, rows: 13, seedN: 99, tint: tint })),
            parts.map((p, i) => React.createElement("span", { key: i, style: { position: "absolute", top: "34%", left: "50%", width: p.size, height: p.size, background: p.c, transform: "rotate(45deg)", "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animation: `cc-particle 1.7s ${p.delay}s ease-out forwards` } })),
            React.createElement("div", { style: { animation: reduce ? "none" : "cc-pop .5s ease .1s both" } },
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 27, letterSpacing: "0.14em", color: "#FFFFFF", textShadow: `0 0 18px ${C.amber}99, 0 0 44px ${C.amber}44` } }, title),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 16, color: C.text, marginTop: 8 } }, subtitle),
                value && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 28, color: C.silver, marginTop: 4 } }, value),
                volumeLabel && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 13, color: accent, marginTop: 10, letterSpacing: "0.04em" } }, volumeLabel),
                React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginTop: 16, letterSpacing: "0.1em" } }, "toque para fechar")))));
}
export { Celebration };
