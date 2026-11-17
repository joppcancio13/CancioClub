import React, { useEffect, useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Desfazer — design v4 (33b): depois de cada ação grande a pílula das abas vira o Desfazer por 8 s,
// com um anel dos segundos que faltam, o que mudou e o botão "Desfazer". Some sozinha (a mudança
// fica) ou ao trocar de tela — quem controla isso é quem renderiza (App).

const DURATION = 8000;

function UndoPill({ label, startedAt, onUndo, onExpire }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 200);
        return () => clearInterval(t);
    }, []);
    const left = Math.max(0, DURATION - (now - startedAt));
    useEffect(() => { if (left <= 0) onExpire(); }, [left <= 0]);
    const r = 11, c = 2 * Math.PI * r;
    return (
        <div role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "6px 6px 6px 12px", borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}, 0 -16px 40px rgba(5,6,10,.9)`, color: C.text, fontFamily: F.body }}>
            <span style={{ position: "relative", width: 28, height: 28, flex: "none" }} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                    <circle cx="14" cy="14" r={r} fill="none" stroke={C.raised} strokeWidth="2.5" />
                    <circle cx="14" cy="14" r={r} fill="none" stroke={C.text2} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / DURATION)} />
                </svg>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.ceil(left / 1000)}</span>
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
            <button type="button" onClick={() => { haptic("confirm"); onUndo(); }} style={{ flex: "none", minHeight: 44, padding: "0 16px", borderRadius: 12, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Desfazer</button>
        </div>
    );
}

export { UndoPill, DURATION as UNDO_MS };
