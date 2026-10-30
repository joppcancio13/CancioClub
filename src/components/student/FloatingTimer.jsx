import React, { useState, useEffect } from "react";
import { MirrorGlobe } from "../shared/MirrorGlobe";
import { useActiveRest } from "./RestTimer";
import { C, F } from "../../styles/tokens";
import { mmss } from "../../utils/date";
import { haptic } from "../../utils/misc";

// barra de descanso: ocupa o lugar da barra da série enquanto o tempo corre
function FloatingTimer() {
    const active = useActiveRest();
    const [, force] = useState(0);
    useEffect(() => { if (!active) return; const id = setInterval(() => force((n) => n + 1), 250); return () => clearInterval(id); }, [active && active.key]);
    if (!active) return null;
    const remaining = Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
    const p = active.total > 0 ? Math.min(100, Math.max(0, (1 - remaining / active.total) * 100)) : 0;
    const exKey = active.key.slice("cancio:rt:".length);
    const act = (action) => {
        haptic("tick");
        try {
            if (action === "skip") sessionStorage.removeItem(active.key);
            else { const raw = JSON.parse(sessionStorage.getItem(active.key) || "null"); if (raw) sessionStorage.setItem(active.key, JSON.stringify({ ...raw, endTime: raw.endTime + 15000, total: raw.total + 15 })); }
        } catch (e) { }
        window.dispatchEvent(new CustomEvent("cancio:rt", { detail: { key: exKey, action } }));
    };
    const btn = { height: 46, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: F.display, fontSize: 14 };
    return React.createElement("div", { className: "cc-bar-in", style: { position: "fixed", left: 12, right: 12, bottom: "calc(98px + env(safe-area-inset-bottom))", zIndex: 92, maxWidth: 636, margin: "0 auto", padding: 10, borderRadius: 20, background: C.panel, boxShadow: "inset 0 0 0 1px #2E333D, 0 -16px 40px rgba(5,6,10,.9)", display: "flex", alignItems: "center", gap: 12 } },
        React.createElement(MirrorGlobe, { size: 52, tile: 6, mask: `conic-gradient(from 0deg,transparent 0 ${p}%,#000 ${p}% 100%)` }),
        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 24, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: C.text } }, mmss(remaining)),
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 11.5, color: C.muted, marginTop: 3 } }, "descanso")),
        React.createElement("button", { className: "cc-tap", onClick: () => act("add"), style: { ...btn, padding: "0 14px", background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", color: C.silver, fontWeight: 600 } }, "+15"),
        React.createElement("button", { className: "cc-tap", onClick: () => act("skip"), style: { ...btn, padding: "0 16px", background: C.text, color: C.ink, fontWeight: 800 } }, "Pular"));
}
export { FloatingTimer };
