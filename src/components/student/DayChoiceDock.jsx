import React from "react";
import { C, DAYS, EASE, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Seletor da semana pro aluno: a divisão continua sendo por dia da semana (o plano do professor),
// mas em vez de só a abreviação ("Seg"), mostra o nome do treino daquele dia (se o professor deu
// um) pra escolha ficar visível de cara, sem precisar abrir aba por aba pra descobrir o que tem em
// cada dia. O dia de hoje ganha um marcador — é a sugestão do professor pra hoje, não uma trava.
function DayChoiceDock({ week, day, dayNames, todayKey, onPick, cardio }) {
    return React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto" } }, DAYS.map((d) => {
        const c = (week[d.key] || []).length;
        const cd = cardio && cardio[d.key];
        const name = dayNames && dayNames[d.key];
        const sub = name || (c > 0 ? `${c} ex.` : (cd ? "cardio" : "livre"));
        const active = d.key === day;
        const isToday = d.key === todayKey;
        return React.createElement("button", {
            key: d.key, className: "cc-pill", onClick: () => { haptic("tick"); onPick(d.key); }, title: d.full,
            style: {
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 60,
                padding: "7px 9px", borderRadius: 14, border: "none", cursor: "pointer", flexShrink: 0,
                background: active ? "linear-gradient(150deg,#EEF3FB,#B9C6D9)" : "rgba(255,255,255,0.045)",
                color: active ? "#05060A" : C.muted,
                transition: `transform .18s ${EASE.spring}, background .15s ease, color .15s ease`,
            },
        },
            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 3, fontFamily: F.display, fontWeight: 700, fontSize: 12 } },
                d.short,
                isToday && React.createElement("span", { "aria-hidden": "true", style: { width: 4, height: 4, borderRadius: "50%", background: active ? "#05060A" : C.amber, flexShrink: 0 } })),
            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 8.5, opacity: 0.85, maxWidth: 66, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, sub));
    }));
}
export { DayChoiceDock };
