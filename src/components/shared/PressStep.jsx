import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

// número herói com ajuste por toque: toque direto no + / − dá um passo; segurar repete
// continuamente até soltar. Toque longo sobre o próprio número abre um campo de texto —
// escape hatch pra valores exatos ou notação composta ("12+4+3") que os botões não cobrem.
// Cada toque interrompe a propagação pra nunca disparar a troca de dia por engano.
function PressStep({ value, onStep, onCommit, onTypeCommit, step, color, suffix, size, disabled, placeholder }) {
    const empty = value === "" || value == null;
    const holdTimer = React.useRef(null);
    const holdInterval = React.useRef(null);
    const runningRef = React.useRef(0);
    const [typing, setTyping] = useState(false);
    const [typedVal, setTypedVal] = useState("");
    const clearHold = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
    };
    const startHold = (dir) => {
        if (disabled)
            return;
        // campo vazio com alvo (ex.: reps "10"): o primeiro toque parte do alvo, não do zero
        const ph = parseFloat(String(placeholder ?? "").replace(",", "."));
        const base = empty && !isNaN(ph) ? ph - dir * step : parseFloat(String(value).replace(",", "."));
        runningRef.current = isNaN(base) ? 0 : base;
        const tick = () => { runningRef.current = Math.max(0, runningRef.current + dir * step); onStep(runningRef.current); };
        tick(); // primeiro passo imediato, sem esperar o hold
        clearHold();
        holdTimer.current = setTimeout(() => { holdInterval.current = setInterval(tick, 110); }, 450);
    };
    // clique físico sutil só no momento de CONFIRMAR um valor (soltar o +/- ou digitar) — não a cada
    // passo do hold, senão vibraria sem parar enquanto segura pra incrementar rápido
    const hapticTick = () => { try {
        navigator.vibrate && navigator.vibrate(10);
    }
    catch (e) { } };
    const endHold = () => { clearHold(); hapticTick(); onCommit(runningRef.current); };
    const openTyping = () => { setTypedVal(String(value)); setTyping(true); };
    if (typing) {
        // Enter só pede blur() de verdade no input, em vez de já desmontar ele aqui (setTyping(false)
        // direto). O onBlur abaixo é quem faz o commit de fato — assim o navegador sempre dispara um
        // blur/focusout de verdade ANTES do campo sumir da tela. Sem isso, em alguns navegadores
        // (principalmente iOS/PWA) remover um input focado sem um blur() explícito pode não disparar
        // o evento de "perdeu o foco", deixando o app achando que o aluno ainda está digitando pro
        // resto da sessão — e a barra de "Finalizar Treino" fica escondida até fechar e reabrir o app.
        return (React.createElement("input", { autoFocus: true, inputMode: "decimal", value: typedVal, onChange: (e) => setTypedVal(e.target.value), onBlur: () => { hapticTick(); onTypeCommit(typedVal); setTyping(false); }, onKeyDown: (e) => { if (e.key === "Enter")
                e.target.blur(); }, style: { width: "100%", textAlign: "center", fontFamily: F.mono, fontWeight: 800, fontSize: size || 28, color, background: "transparent", border: "none", outline: "none", boxShadow: `inset 0 -2px 0 ${color}` } }));
    }
    return (React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 2 } },
        React.createElement("button", { disabled: disabled, onTouchStart: (e) => { e.preventDefault(); e.stopPropagation(); startHold(-1); }, onTouchEnd: (e) => { e.preventDefault(); e.stopPropagation(); endHold(); }, onTouchCancel: (e) => { e.preventDefault(); e.stopPropagation(); endHold(); }, onMouseDown: (e) => { e.stopPropagation(); startHold(-1); }, onMouseUp: (e) => { e.stopPropagation(); endHold(); }, onMouseLeave: () => { if (holdInterval.current || holdTimer.current)
                endHold(); }, style: { flexShrink: 0, minWidth: 28, minHeight: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", color: C.silver, fontFamily: F.mono, fontSize: 15, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1, padding: 0, touchAction: "none" } }, "\u2212"),
        React.createElement("div", { onClick: (e) => { e.stopPropagation(); openTyping(); }, onTouchStart: (e) => e.stopPropagation(), style: { minWidth: 44, userSelect: "none", textAlign: "center", fontFamily: F.mono, fontWeight: 800, fontSize: size || 28, letterSpacing: "-0.02em", color, padding: "6px 0", cursor: "pointer", borderBottom: `1px dashed ${color}55` } },
            empty ? React.createElement("span", { style: { color: C.muted } }, placeholder || "\u2014") : value,
            empty && placeholder ? null : suffix),
        React.createElement("button", { disabled: disabled, onTouchStart: (e) => { e.preventDefault(); e.stopPropagation(); startHold(1); }, onTouchEnd: (e) => { e.preventDefault(); e.stopPropagation(); endHold(); }, onTouchCancel: (e) => { e.preventDefault(); e.stopPropagation(); endHold(); }, onMouseDown: (e) => { e.stopPropagation(); startHold(1); }, onMouseUp: (e) => { e.stopPropagation(); endHold(); }, onMouseLeave: () => { if (holdInterval.current || holdTimer.current)
                endHold(); }, style: { flexShrink: 0, minWidth: 28, minHeight: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", color: C.silver, fontFamily: F.mono, fontSize: 15, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1, padding: 0, touchAction: "none" } }, "+")));
}
export { PressStep };
