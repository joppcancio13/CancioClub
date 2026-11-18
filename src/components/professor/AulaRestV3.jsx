import React from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { CardioV3 } from "../student/CardioV3";

// Modo aula em dia sem musculação — design v4 (README · "cardio e recuperação no Modo aula"):
// no dia de cardio o professor usa o mesmo cronômetro e o "como foi" do aluno (39b); no descanso,
// marca os itens da recuperação e fecha o dia. Nada muda no layout do Modo aula.

const REC = [["hydration", "Hidratação", "2 litros de água"], ["sleep", "Sono", "7 horas ou mais"], ["mobility", "Mobilidade", "10 min, sem pressa"]];

function AulaRestV3({ studentName, weekday, cardioPlan, lastCardio, recovery, onToggleRecovery, onCloseRest, onCardioDone, onExit }) {
    const first = String(studentName || "").split(" ")[0];
    return (
        <div role="dialog" aria-modal="true" aria-label={"Modo aula · " + studentName} style={{ position: "fixed", inset: 0, zIndex: 99, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", boxSizing: "border-box", padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 40px" }}>
                <span style={{ ...KICKER, display: "block", marginBottom: 10 }}>{"Modo aula · registrando por " + first}</span>
                {cardioPlan ? (
                    <CardioV3 weekday={weekday} plan={cardioPlan} last={lastCardio} onExit={onExit} onDone={onCardioDone} />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 120 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={KICKER}>{weekday + " · Descanso"}</span>
                            <button type="button" onClick={onExit} style={{ minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Sair</button>
                        </div>
                        <span style={{ fontFamily: F.display, fontSize: 38, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>RECUPERAÇÃO</span>
                        <span style={{ fontSize: 15, color: C.text2 }}>{"Marque o que " + first + " fez hoje."}</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {REC.map(([key, t, d]) => { const on = !!(recovery && recovery[key]); return (
                                <button key={key} type="button" aria-pressed={on} onClick={() => { haptic("tick"); onToggleRecovery(key); }}
                                    style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 60, padding: 0, border: "none", background: "none", boxShadow: `inset 0 -1px 0 ${C.line}`, color: on ? C.text3 : C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                                    <span aria-hidden="true" style={{ flex: "none", width: 28, height: 28, borderRadius: 8, background: on ? C.text : "transparent", boxShadow: on ? "none" : "inset 0 0 0 1.5px #3A404C", color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{on ? "✓" : ""}</span>
                                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{t}</span>
                                    <span style={{ fontSize: 13, color: C.text3 }}>{d}</span>
                                </button>
                            ); })}
                        </div>
                        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "12px 20px calc(16px + env(safe-area-inset-bottom, 0px))", background: `linear-gradient(to top, ${C.bg} 70%, transparent)`, display: "flex", justifyContent: "center" }}>
                            <button type="button" onClick={() => { haptic("confirm"); onCloseRest(); }} style={{ width: "100%", maxWidth: 580, height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{"Fechar o dia · " + REC.filter(([k]) => recovery && recovery[k]).length + " de " + REC.length}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { AulaRestV3 };
