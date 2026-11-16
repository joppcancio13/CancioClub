import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Fim do treino — design v3 (design/v3/README.md · "Fim do treino", 6a): resumo primeiro (tempo, séries
// válidas, kg levantados, recorde), "Como foi o treino de hoje?" e daí os cards de compartilhar.
// Substitui, pro aluno, a janela de esforço (PSEModal) + a comemoração em tela cheia.

const EFFORTS = [["facil", "Fácil"], ["medida", "Na medida"], ["destruidor", "Destruidor"]];
const colLabel = { fontFamily: F.display, fontSize: 10, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.1em", color: C.text4 };
const divider = `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat`;

function FimV3({ title, durationLabel, validSets, volume, records, onBack, onDone }) {
    const [effort, setEffort] = useState(null);
    const [busy, setBusy] = useState(false);
    const done = (share) => { if (busy) return; setBusy(true); haptic("confirm"); onDone(effort, share); };
    const stats = [[durationLabel || "—", "TEMPO"], [String(validSets), "SÉRIES VÁLIDAS"], [volume > 0 ? Math.round(volume).toLocaleString("pt-BR") : "—", "KG LEVANTADOS"]];
    return (
        <div role="dialog" aria-modal="true" aria-label="Treino feito" style={{ position: "fixed", inset: 0, zIndex: 99, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", minHeight: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", paddingTop: "calc(16px + env(safe-area-inset-top, 0px))", paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))", paddingLeft: "max(20px, env(safe-area-inset-left, 0px))", paddingRight: "max(20px, env(safe-area-inset-right, 0px))" }}>
                <button type="button" onClick={onBack} disabled={busy} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text4, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>‹ Voltar ao treino</button>
                <span style={{ marginTop: 12, fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", color: C.text2 }}>TREINO DE HOJE FEITO</span>
                <span style={{ marginTop: 8, fontFamily: F.display, fontSize: String(title).length > 12 ? 30 : 38, fontWeight: 900, fontStretch: "125%", lineHeight: 1, overflowWrap: "anywhere" }}>{title}</span>
                <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                    {stats.map(([v, l]) => (
                        <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "110%", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{v}</span>
                            <span style={colLabel}>{l}</span>
                        </div>
                    ))}
                </div>
                {records.length > 0 && (
                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", background: `${divider} top/100% 1px, ${divider} bottom/100% 1px` }}>
                        {records.map((r) => (
                            <div key={r.id + r.kind} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0" }}>
                                <span aria-hidden="true">★</span>
                                <span style={{ flex: 1, minWidth: 0, fontSize: 15 }}>{r.name}</span>
                                <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{r.kind === "load" ? String(r.load).replace(".", ",") + " kg" : r.reps + " reps"}</span>
                            </div>
                        ))}
                    </div>
                )}
                <span style={{ marginTop: 22, fontSize: 15, fontWeight: 600 }}>Como foi o treino de hoje?</span>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                    {EFFORTS.map(([k, l]) => {
                        const on = effort === k;
                        return <button key={k} type="button" aria-pressed={on} onClick={() => { haptic("tick"); setEffort(on ? null : k); }}
                            style={{ height: 44, borderRadius: 10, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}`, fontFamily: F.body, fontSize: 13, fontWeight: on ? 700 : 400, cursor: "pointer" }}>{l}</button>;
                    })}
                </div>
                <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
                    <button type="button" onClick={() => done(true)} disabled={busy} style={{ height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Compartilhar treino</button>
                    <button type="button" onClick={() => done(false)} disabled={busy} style={{ height: 44, border: "none", background: "none", color: C.text4, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                </div>
            </div>
        </div>
    );
}

export { FimV3 };
