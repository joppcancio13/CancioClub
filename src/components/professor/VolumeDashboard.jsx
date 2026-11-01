import React from "react";
import { C, F, glassPanel } from "../../styles/tokens";
import { buildVolumeReport } from "../../utils/volumeCalculator";

function Bar({ pct, overloaded }) {
    return React.createElement("div", { style: { height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", width: `${Math.max(4, Math.round(pct * 100))}%`, borderRadius: 999, background: overloaded ? C.warn : C.amber, transition: "width .3s ease" } }));
}

function fmtSets(n) {
    return n % 1 === 0 ? String(n) : n.toFixed(1);
}

// Dashboard de volume muscular real do dia aberto na ficha — lê `list` (os exercícios do dia
// atual, mesmo formato já usado em App.jsx pra montar o ExerciseCard) e, pra cada um que tem
// `catalogId` ligado ao catálogo, soma as séries equivalentes por músculo ativado. Puramente
// derivado de `list`: não guarda estado próprio, então acompanha sozinho qualquer mudança na
// ficha (adicionar/remover exercício, mudar número de séries) assim que o componente re-renderiza
// com a `list` nova — não precisa de nenhum recálculo manual.
function VolumeDashboard({ list }) {
    const { groups, unmatched } = React.useMemo(() => buildVolumeReport(list), [list]);

    if (!groups.length) {
        return React.createElement("div", { style: { ...glassPanel, borderRadius: 20, padding: "28px 18px", textAlign: "center" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.5 } }, "Nenhum exercício desse dia está ligado ao catálogo ainda.", React.createElement("br"), "Vincule um exercício a uma entrada do catálogo pra ver o volume por músculo aqui."));
    }

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
        groups.map((g) => React.createElement("div", { key: g.label, style: { ...glassPanel, borderRadius: 20, padding: "16px 18px" } },
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 14 } }, g.label),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 13 } },
                g.rows.map((r) => React.createElement("div", { key: r.musculo },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 5 } },
                        React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 7, minWidth: 0, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: r.overloaded ? C.warn : C.text, textTransform: "capitalize" } },
                            r.musculo.replace(/_/g, " "),
                            r.overloaded && React.createElement("span", { title: "Quase todo o volume desse músculo vem de sobreposição com outros exercícios, não de trabalho direto", style: { flexShrink: 0, fontFamily: F.mono, fontSize: 8, letterSpacing: "0.05em", textTransform: "uppercase", color: C.ink, background: C.warn, borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" } }, "sobrecarga indireta")),
                        React.createElement("span", { style: { flexShrink: 0, fontFamily: F.mono, fontSize: 12.5, color: C.silver } }, `${fmtSets(r.total)} séries`)),
                    React.createElement(Bar, { pct: r.pct, overloaded: r.overloaded })))))),
        unmatched.length > 0 && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.muted, textAlign: "center", lineHeight: 1.5 } },
            `${unmatched.length} exercício${unmatched.length > 1 ? "s" : ""} desse dia não está${unmatched.length > 1 ? "o" : ""} ligado${unmatched.length > 1 ? "s" : ""} ao catálogo — não entr${unmatched.length > 1 ? "aram" : "ou"} na conta.`));
}
export { VolumeDashboard };
