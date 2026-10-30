import React from "react";
import { C, DAYS, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Tela de escolha do treino do dia: abre por ação explícita do aluno (botão "Trocar treino"),
// não fica fixa na tela — o app já abre direto no dia de hoje com o treino que o professor
// armazenou, essa modal só existe pra quem quiser conscientemente trocar.
function DayPickerModal({ week, day, dayNames, todayKey, onPick, onClose, cardio }) {
    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,6,10,.8)" }, onClick: onClose },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto", maxHeight: "76vh", overflowY: "auto", borderRadius: 28, background: C.panel, boxShadow: "inset 0 0 0 1px #23262E", padding: "22px 18px 16px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: C.muted } }, "ESCOLHER TREINO"),
                React.createElement("button", { onClick: onClose, style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontSize: 12, color: C.muted } }, "fechar")),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 22, lineHeight: 1.05, marginTop: 8 } }, "QUAL TREINO VOCÊ QUER FAZER?"),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 6 } }, "O que você registrar fica sempre na data de hoje, não importa qual treino escolher."),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 } }, DAYS.map((d) => {
                const c = (week[d.key] || []).length;
                const cd = cardio && cardio[d.key];
                const name = dayNames && dayNames[d.key];
                const sub = name || (c > 0 ? `${c} exercício${c > 1 ? "s" : ""}` : (cd ? "cardio" : "livre"));
                const active = d.key === day;
                const isToday = d.key === todayKey;
                return React.createElement("button", {
                    key: d.key, className: "cc-tap", onClick: () => { haptic("tick"); onPick(d.key); onClose(); },
                    style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: "none", textAlign: "left", cursor: "pointer", background: active ? C.text : "#15181F", color: active ? C.ink : C.text },
                },
                    React.createElement("span", { style: { flexShrink: 0, width: 38, fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 14 } }, d.short),
                    React.createElement("span", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 700, fontSize: 14.5 } }, sub),
                        React.createElement("span", { style: { display: "block", fontFamily: F.mono, fontSize: 10.5, marginTop: 2, color: active ? "#5A6273" : C.muted } }, d.full)),
                    isToday && React.createElement("span", { style: { flexShrink: 0, fontFamily: F.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: active ? C.ink : C.amber, background: active ? "rgba(5,6,10,.12)" : "rgba(232,166,74,.14)", borderRadius: 999, padding: "4px 9px" } }, "hoje"));
            }))));
}
export { DayPickerModal };
