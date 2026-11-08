import React from "react";
import { C, DAYS, F, NON_COUNTING_KINDS, PILL_ON } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { currentLoad, planSummary } from "../../utils/workout";

// Tela cheia de entrada do dia (redesign estético 4, item 3): na primeira abertura do dia,
// mostra o treino previsto pra hoje (nome, exercícios, séries×reps/carga) com um único CTA
// pra começar. Trocar pra outro treino é um chip secundário, não a ação principal — substitui
// o DayPickerModal antigo (um menu de "escolher treino" solto, sem contexto do que te espera).
function DayEntryScreen({ week, todayKey, dayNames, cardio, onBegin, onPickOther, onClose }) {
    const todayFull = DAYS.find((d) => d.key === todayKey).full;
    const list = week[todayKey] || [];
    const name = (dayNames && dayNames[todayKey]) || null;
    const isCardioDay = !!(cardio && cardio[todayKey]);
    const workingSets = list.reduce((n, ex) => n + ((ex.setPlan && ex.setPlan.length ? ex.setPlan : []).filter((s) => !NON_COUNTING_KINDS.has(s.kind)).length || (ex.sets || 0)), 0);
    const estMin = list.length ? Math.max(15, Math.round(workingSets * 3.2)) : null;
    const title = name || (list.length ? todayFull : isCardioDay ? "Cardio" : "Descanso");
    const otherDays = DAYS.filter((d) => d.key !== todayKey);

    const kicker = { fontFamily: F.display, fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase" };
    const row = { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: `1px solid ${C.line}`, fontFamily: F.body, fontSize: 15 };

    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 100, background: C.ink, display: "flex", flexDirection: "column" } },
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "calc(28px + env(safe-area-inset-top)) 20px 180px", maxWidth: 560, margin: "0 auto", width: "100%", boxSizing: "border-box" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("span", { style: kicker }, todayFull.toUpperCase() + " · HOJE É DIA DE"),
                onClose && React.createElement("button", { onClick: onClose, style: { minHeight: 44, background: "none", border: "none", padding: 4, cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.muted } }, "fechar")),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 38, lineHeight: 1.02, marginTop: 10, color: C.text } }, title.toUpperCase()),
            list.length > 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.silver, marginTop: 10 } },
                list.length + " exercício" + (list.length > 1 ? "s" : "") + " · " + workingSets + " série" + (workingSets > 1 ? "s" : "") + (estMin ? " · ~" + estMin + " min" : "")),
            list.length > 0 && React.createElement("div", { style: { marginTop: 22 } }, list.map((ex) => {
                const load = currentLoad(ex);
                return React.createElement("div", { key: ex.id, style: row },
                    React.createElement("span", { style: { color: C.text } }, ex.name),
                    React.createElement("span", { style: { color: C.muted, fontFamily: F.mono, fontSize: 13, flexShrink: 0, marginLeft: 12 } }, planSummary(ex) + (load ? " · " + load + " kg" : "")));
            })),
            list.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 20, lineHeight: 1.5 } }, isCardioDay ? "Dia de cardio — registre na aba Treino." : "Nenhum treino montado pra hoje. Dia de recuperação ou cardio?"),
            React.createElement("div", { style: { marginTop: 34 } },
                React.createElement("div", { style: kicker }, "OU TREINAR OUTRO"),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 } }, otherDays.map((d) => {
                    const c = (week[d.key] || []).length;
                    if (c === 0 && !(cardio && cardio[d.key])) return null;
                    const label = (dayNames && dayNames[d.key]) || d.full;
                    return React.createElement("button", { key: d.key, className: "cc-tap", onClick: () => { haptic("tick"); onPickOther(d.key); }, style: { minHeight: 44, fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.text, background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, borderRadius: 999, padding: "10px 16px", cursor: "pointer" } }, label);
                })),
                React.createElement("button", { className: "cc-tap", onClick: () => { haptic("tick"); onClose && onClose(); }, style: { minHeight: 44, marginTop: 14, fontFamily: F.body, fontSize: 13, fontWeight: 500, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Descanso hoje"))),
        React.createElement("div", { style: { position: "fixed", left: 12, right: 12, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 536, margin: "0 auto" } },
            React.createElement("button", { className: "cc-tap", onClick: () => { haptic("confirm"); onBegin(); }, style: { minHeight: 44, width: "100%", fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.ink, backgroundImage: PILL_ON, border: "none", borderRadius: 16, padding: "17px 0", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,.4)" } }, list.length ? "Começar " + title : "Entendido")));
}
export { DayEntryScreen };
