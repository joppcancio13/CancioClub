import React, { useRef, useState } from "react";
import { C, F, NON_COUNTING_KINDS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { planSummary } from "../../utils/workout";

// Lista do Editar ficha — design v4 (42b/54a): uma linha por exercício (número, nome, prescrição e
// "Trocar" à vista). Tocar na linha abre o exercício em página própria; reordenar é arrastando pela
// alça à esquerda (o subir/descer do cartão antigo saiu).

const ROW = 64;

function EditExerciseList({ list, restrictionOf, onOpen, onSwap, onReorder }) {
    const [drag, setDrag] = useState(null); // { id, from, dy }
    const startRef = useRef(null);
    const to = drag ? Math.max(0, Math.min(list.length - 1, drag.from + Math.round(drag.dy / ROW))) : null;

    const down = (e, i, id) => {
        e.preventDefault(); e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
        startRef.current = e.clientY; setDrag({ id, from: i, dy: 0 }); haptic("tick");
    };
    const move = (e) => { if (!drag) return; setDrag((d) => d && { ...d, dy: e.clientY - startRef.current }); };
    const up = () => { if (!drag) return; const t = to; const f = drag.from; setDrag(null); if (t !== f) { haptic("confirm"); onReorder(f, t); } };

    return (
        <div style={{ display: "flex", flexDirection: "column", touchAction: drag ? "none" : "auto" }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            {list.map((ex, i) => {
                const isDrag = drag && drag.id === ex.id;
                // as outras linhas abrem espaço pra onde a arrastada vai cair
                const shift = drag && !isDrag ? (drag.from < i && to >= i ? -ROW : drag.from > i && to <= i ? ROW : 0) : 0;
                const restr = restrictionOf ? restrictionOf(ex.name) : null;
                const work = (ex.setPlan || []).filter((s) => !NON_COUNTING_KINDS.has(s.kind)).length;
                return (
                    <div key={ex.id} style={{ position: "relative", zIndex: isDrag ? 2 : 1, display: "flex", alignItems: "center", gap: 8, minHeight: ROW, boxSizing: "border-box", background: isDrag ? C.raised : C.bg, borderRadius: isDrag ? 12 : 0, boxShadow: isDrag ? "0 8px 24px rgba(0,0,0,.5)" : `inset 0 -1px 0 ${C.line}`, transform: "translateY(" + (isDrag ? drag.dy : shift) + "px)", transition: isDrag ? "none" : "transform .15s ease" }}>
                        <span role="button" tabIndex={0} aria-label={"Arrastar " + ex.name + " pra reordenar"} onPointerDown={(e) => down(e, i, ex.id)}
                            onKeyDown={(e) => { if (e.key === "ArrowUp" && i > 0) onReorder(i, i - 1); if (e.key === "ArrowDown" && i < list.length - 1) onReorder(i, i + 1); }}
                            style={{ width: 36, height: 48, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, cursor: "grab", touchAction: "none" }}>
                            <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><g fill="currentColor"><circle cx="92" cy="60" r="16" /><circle cx="164" cy="60" r="16" /><circle cx="92" cy="128" r="16" /><circle cx="164" cy="128" r="16" /><circle cx="92" cy="196" r="16" /><circle cx="164" cy="196" r="16" /></g></svg>
                        </span>
                        <button type="button" onClick={() => onOpen(ex)} style={{ flex: 1, minWidth: 0, minHeight: ROW - 8, display: "flex", alignItems: "center", gap: 10, padding: 0, border: "none", background: "none", color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                            <span style={{ width: 22, flex: "none", fontSize: 13, color: C.text3, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, fontStretch: "110%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</span>
                                <span style={{ fontSize: 13, color: restr ? C.accent : C.text3 }}>{restr ? "● " + restr.text : planSummary(ex) + (ex.rest ? " · " + Math.floor(ex.rest / 60) + ":" + String(ex.rest % 60).padStart(2, "0") : "") + (ex.catalogId ? "" : " · fora do volume")}</span>
                            </span>
                        </button>
                        <button type="button" onClick={() => onSwap(ex)} style={{ flex: "none", minHeight: 44, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Trocar</button>
                    </div>
                );
            })}
        </div>
    );
}

export { EditExerciseList };
