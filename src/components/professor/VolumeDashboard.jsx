import React from "react";
import { C, F, glassPanel } from "../../styles/tokens";
import { buildVolumeReport } from "../../utils/volumeCalculator";

function Bar({ pct, overloaded, big }) {
    return React.createElement("div", { style: { height: big ? 8 : 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", width: `${Math.max(4, Math.round(pct * 100))}%`, borderRadius: 999, background: overloaded ? C.warn : C.amber, transition: "width .3s ease" } }));
}

function fmtSets(n) {
    return n % 1 === 0 ? String(n) : n.toFixed(1);
}

// Dashboard de volume muscular real do dia aberto na ficha — lê `list` (os exercícios do dia
// atual, mesmo formato já usado em App.jsx pra montar o ExerciseCard). Puramente derivado de
// `list`: não guarda estado próprio de dado, então acompanha sozinho qualquer mudança na ficha
// (adicionar/remover exercício, mudar número de séries, vincular um catalogId) assim que o
// componente re-renderiza com a `list` nova.
//
// Duas camadas: a linha principal é o grupo muscular amplo (Peitoral, Costas, Quadríceps...) —
// como o catálogo detalhado tem várias cabeças/porções por músculo (ex.: tríceps lateral/medial/
// longa), listar tudo liso ficaria extenso demais. Tocar num grupo abre o detalhamento fino.
function VolumeDashboard({ list }) {
    const { groups, unmatched } = React.useMemo(() => buildVolumeReport(list), [list]);
    const [openGroups, setOpenGroups] = React.useState(() => new Set());
    const toggleGroup = (label) => setOpenGroups((s) => { const n = new Set(s); if (n.has(label)) n.delete(label); else n.add(label); return n; });

    if (!groups.length) {
        return React.createElement("div", { style: { ...glassPanel, borderRadius: 20, padding: "28px 18px", textAlign: "center" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.5 } }, "Nenhum exercício desse dia está ligado ao catálogo ainda.", React.createElement("br"), "Vincule um exercício a uma entrada do catálogo pra ver o volume por músculo aqui."));
    }

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        groups.map((g) => {
            const isOpen = openGroups.has(g.label);
            return React.createElement("div", { key: g.label, style: { ...glassPanel, borderRadius: 18, overflow: "hidden" } },
                React.createElement("button", { onClick: () => toggleGroup(g.label), style: { width: "100%", display: "flex", flexDirection: "column", gap: 9, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } },
                        React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 7, minWidth: 0, fontFamily: F.body, fontSize: 14, fontWeight: 700, color: g.hasOverload ? C.warn : C.text } },
                            g.label,
                            g.hasOverload && React.createElement("span", { style: { flexShrink: 0, fontFamily: F.mono, fontSize: 8, letterSpacing: "0.05em", textTransform: "uppercase", color: C.ink, background: C.warn, borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" } }, "sobrecarga indireta")),
                        React.createElement("span", { style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8 } },
                            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver } }, `${fmtSets(g.total)} séries`),
                            React.createElement("span", { style: { color: C.muted, fontFamily: F.mono, fontSize: 12, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" } }, "›"))),
                    React.createElement(Bar, { pct: g.pct, overloaded: g.hasOverload, big: true })),
                isOpen && React.createElement("div", { style: { padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 11 } },
                    g.rows.map((r) => React.createElement("div", { key: r.musculo },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 } },
                            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: r.overloaded ? C.warn : C.silver, textTransform: "capitalize" } },
                                r.musculo.replace(/_/g, " "),
                                r.overloaded && React.createElement("span", { title: "Quase todo o volume vem de sobreposição com outros exercícios, não de trabalho direto", style: { flexShrink: 0, fontFamily: F.mono, fontSize: 7.5, letterSpacing: "0.04em", textTransform: "uppercase", color: C.ink, background: C.warn, borderRadius: 999, padding: "1.5px 6px", whiteSpace: "nowrap" } }, "indireta")),
                            React.createElement("span", { style: { flexShrink: 0, fontFamily: F.mono, fontSize: 11, color: C.muted } }, fmtSets(r.total))),
                        React.createElement(Bar, { pct: r.pct, overloaded: r.overloaded })))));
        }),
        unmatched.length > 0 && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.muted, textAlign: "center", lineHeight: 1.5 } },
            `${unmatched.length} exercício${unmatched.length > 1 ? "s" : ""} desse dia não está${unmatched.length > 1 ? "o" : ""} ligado${unmatched.length > 1 ? "s" : ""} ao catálogo — não entr${unmatched.length > 1 ? "aram" : "ou"} na conta.`));
}
export { VolumeDashboard };
