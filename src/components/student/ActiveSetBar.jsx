import React, { useState, useEffect } from "react";
import { useActiveRest } from "./RestTimer";
import { useActiveSet } from "../../hooks/useActiveSet";
import { flushAllPendingSaves } from "../../hooks/useLocalData";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { repsCeiling } from "../../utils/workout";

// faixa fixa da série atual — sempre na zona do polegar, um toque salva
function ActiveSetBar() {
    const a = useActiveSet();
    const resting = useActiveRest();
    const [mode, setMode] = useState(null); // null | "panel" | "keypad"
    const [typed, setTyped] = useState("");
    const [draft, setDraft] = useState(null);
    useEffect(() => {
        if (!a) { setDraft(null); setMode(null); return; }
        const l = parseFloat(String(a.load || "").replace(",", ".")) || a.lastLoad || 0;
        const r = parseInt(a.reps) || repsCeiling(a.targetReps) || 10;
        setDraft({ load: l, reps: r });
    }, [a && a.exId, a && a.setLabel]);
    if (!a || !draft) return null;
    if (resting && !mode) return null;
    const fmtK = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
    const step = draft.load < 15 ? 1 : 2.5;
    const setLoad = (v) => setDraft((d) => ({ ...d, load: Math.max(0, Math.round(v * 10) / 10) }));
    const target = repsCeiling(a.targetReps);
    const repOpts = target ? [target - 2, target - 1, target, target + 1, target + 2].filter((n) => n > 0) : [6, 8, 10, 12, 15];
    const label = (a.exName + " · " + a.setLabel).toUpperCase();
    const val = fmtK(draft.load) + " kg × " + draft.reps;
    const done = () => { flushAllPendingSaves(); haptic("record"); if (a.saveBoth) a.saveBoth(draft.load, draft.reps); else { a.saveReps(draft.reps); a.saveLoad(draft.load); } setMode(null); };
    const sq = (txt, onClick, big) => React.createElement("button", { className: "cc-tap", onClick, style: { width: big ? 64 : 46, height: big ? 64 : 46, flexShrink: 0, borderRadius: big ? 18 : 12, border: "none", background: "#DCE3EE", color: C.ink, fontFamily: F.display, fontSize: big ? 30 : 22, fontWeight: 400, cursor: "pointer" } }, txt);
    const chip = (txt, onClick, sel) => React.createElement("button", { key: txt, className: "cc-tap", onClick, style: { flex: 1, minWidth: 0, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 700, fontSize: 13, background: sel ? C.ink : "transparent", color: sel ? C.text : C.ink, boxShadow: sel ? "none" : "inset 0 0 0 1px #C6D2E4" } }, txt);
    const panelWrap = (children) => React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 120, background: "rgba(5,6,10,.72)" }, onClick: () => setMode(null), className: "cc-fade-in" },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 640, margin: "0 auto", borderRadius: 28, background: C.text, color: C.ink, padding: "16px 16px 14px" } }, children));
    const kicker = (t) => React.createElement("div", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.16em", color: "#5A6273" } }, t);
    const feito = React.createElement("button", { className: "cc-tap", onClick: done, style: { width: "100%", marginTop: 14, padding: 19, borderRadius: 18, border: "none", background: C.ink, color: C.text, fontFamily: F.display, fontWeight: 800, fontSize: 17, cursor: "pointer" } }, "Feito · " + val);
    if (mode === "keypad") {
        const shown = typed === "" ? "0" : typed;
        const key = (k) => React.createElement("button", { key: k, className: "cc-tap", onClick: () => { haptic("tick"); if (k === "⌫") setTyped((t) => t.slice(0, -1)); else if (k === "," && typed.includes(",")) return; else if (typed.length < 5) setTyped((t) => t + k); }, style: { padding: "15px 0", borderRadius: 14, border: "none", background: "#DCE3EE", color: C.ink, fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontSize: 24, cursor: "pointer" } }, k);
        return panelWrap([
            React.createElement("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, kicker("CARGA · " + a.exName.toUpperCase()), React.createElement("button", { onClick: () => setMode("panel"), style: { background: "none", border: "none", fontFamily: F.body, fontSize: 12, fontWeight: 600, color: "#5A6273", cursor: "pointer" } }, "cancelar")),
            React.createElement("div", { key: "v", style: { textAlign: "center", marginTop: 16 } }, React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 60, lineHeight: 1 } }, shown), React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 18, color: "#5A6273" } }, " kg")),
            React.createElement("div", { key: "hint", style: { textAlign: "center", fontFamily: F.body, fontSize: 12, color: "#5A6273", marginTop: 6 } }, a.lastLoad ? "última vez " + fmtK(a.lastLoad) + " kg" : ""),
            React.createElement("div", { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 16 } }, ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"].map(key)),
            React.createElement("button", { key: "ok", className: "cc-tap", onClick: () => { const v = parseFloat(shown.replace(",", ".")); if (!isNaN(v)) setLoad(v); setMode("panel"); }, style: { width: "100%", marginTop: 10, padding: 19, borderRadius: 18, border: "none", background: C.ink, color: C.text, fontFamily: F.display, fontWeight: 800, fontSize: 17, cursor: "pointer" } }, "Usar " + shown + " kg"),
        ]);
    }
    if (mode === "panel") {
        return panelWrap([
            React.createElement("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, kicker(label), React.createElement("button", { onClick: () => setMode(null), style: { background: "none", border: "none", fontFamily: F.body, fontSize: 12, fontWeight: 600, color: "#5A6273", cursor: "pointer" } }, "fechar")),
            React.createElement("div", { key: "k", style: { marginTop: 14 } }, kicker("CARGA")),
            React.createElement("div", { key: "kg", style: { display: "flex", alignItems: "center", gap: 10, marginTop: 6 } },
                sq("−", () => { haptic("tick"); setLoad(draft.load - step); }, true),
                React.createElement("button", { onClick: () => { setTyped(""); setMode("keypad"); }, style: { flex: 1, background: "none", border: "none", cursor: "pointer", color: C.ink } },
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 48, lineHeight: 1, borderBottom: "2px dashed #9AA4B5" } }, fmtK(draft.load)),
                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 16, color: "#5A6273" } }, " kg")),
                sq("+", () => { haptic("tick"); setLoad(draft.load + step); }, true)),
            React.createElement("div", { key: "c", style: { display: "flex", gap: 6, marginTop: 10 } },
                a.lastLoad ? chip("última: " + fmtK(a.lastLoad), () => setLoad(a.lastLoad)) : null,
                chip("+2,5", () => setLoad((a.lastLoad || draft.load) + 2.5)),
                chip("+5", () => setLoad((a.lastLoad || draft.load) + 5))),
            React.createElement("div", { key: "r", style: { marginTop: 18 } }, kicker("REPETIÇÕES" + (target ? " · ALVO " + target : ""))),
            React.createElement("div", { key: "rc", style: { display: "flex", gap: 6, marginTop: 8 } }, repOpts.map((n) => React.createElement("button", { key: n, className: "cc-tap", onClick: () => { haptic("tick"); setDraft((d) => ({ ...d, reps: n })); }, style: { flex: 1, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 18, background: draft.reps === n ? C.ink : "#DCE3EE", color: draft.reps === n ? C.text : C.ink } }, n))),
            React.cloneElement(feito, { key: "f" }),
        ]);
    }
    return React.createElement("div", { className: "cc-bar-in", style: { position: "fixed", left: 12, right: 12, bottom: "calc(98px + env(safe-area-inset-bottom))", zIndex: 91, maxWidth: 636, margin: "0 auto", padding: "10px 10px 10px 16px", borderRadius: 20, background: C.text, color: C.ink, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 -16px 40px rgba(5,6,10,.9)" } },
        React.createElement("button", { onClick: () => setMode("panel"), style: { flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", color: C.ink } },
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", color: "#5A6273", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, label),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 22, lineHeight: 1.05 } }, React.createElement("span", { style: { borderBottom: "1.5px dashed #9AA4B5" } }, val))),
        sq("−", () => { haptic("tick"); setLoad(draft.load - step); }),
        sq("+", () => { haptic("tick"); setLoad(draft.load + step); }),
        React.createElement("button", { className: "cc-tap", onClick: done, style: { height: 46, padding: "0 18px", borderRadius: 12, border: "none", background: C.ink, color: C.text, fontFamily: F.display, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Feito"));
}
export { ActiveSetBar };
