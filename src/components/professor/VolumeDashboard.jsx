import React from "react";
import { C, F, PILL_ON, flatPanel } from "../../styles/tokens";
import { buildWeeklyVolumeReport } from "../../utils/volumeCalculator";

function Pills({ count, size }) {
    return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 2.5 } },
        Array.from({ length: count }).map((_, i) => React.createElement("span", { key: i, style: { width: size, height: Math.max(6, Math.round(size * 0.36)), borderRadius: 2, backgroundImage: PILL_ON } })));
}

// Dashboard de volume muscular semanal (redesign estético 4, item 7) — soma séries de trabalho
// REGISTRADAS (não planejadas) de toda a semana do aluno, lê `allEx` (todos os dias já achatados,
// formato já usado pra montar a aba Rendimento em App.jsx). Puramente derivado: sem estado
// próprio de dado, acompanha sozinho qualquer mudança (vincular um catalogId, registrar uma
// série nova). Cada pastilha = 1 série de trabalho que tocou aquele músculo; sem limite, sem
// separar direto de indireto — é só a contagem.
function VolumeDashboard({ allEx, onOpenBulkLink }) {
    const [weekOffset, setWeekOffset] = React.useState(0);
    const [weekMenuOpen, setWeekMenuOpen] = React.useState(false);
    const [openGroups, setOpenGroups] = React.useState(() => new Set());
    const toggleGroup = (label) => setOpenGroups((s) => { const n = new Set(); if (!s.has(label)) n.add(label); return n; }); // só um grupo aberto por vez

    const { groups, unmatched, totalSets } = React.useMemo(() => buildWeeklyVolumeReport(allEx, weekOffset), [allEx, weekOffset]);
    const weekLabel = weekOffset === 0 ? "esta semana" : "semana passada";

    const weekSelector = React.createElement("div", { style: { position: "relative", display: "inline-block" } },
        React.createElement("button", { className: "cc-tap", onClick: () => setWeekMenuOpen((v) => !v), style: { fontFamily: F.body, fontWeight: 600, fontSize: 12.5, color: C.silver, background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 } },
            weekLabel, React.createElement("span", { style: { fontSize: 10, color: C.muted } }, "▾")),
        weekMenuOpen && React.createElement(React.Fragment, null,
            React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 9 }, onClick: () => setWeekMenuOpen(false) }),
            React.createElement("div", { style: { position: "absolute", top: "100%", left: 0, marginTop: 6, zIndex: 10, ...flatPanel, borderRadius: 12, padding: 4, minWidth: 140 } },
                [[0, "Esta semana"], [-1, "Semana passada"]].map(([v, l]) => React.createElement("button", { key: v, className: "cc-tap", onClick: () => { setWeekOffset(v); setWeekMenuOpen(false); }, style: { display: "block", width: "100%", textAlign: "left", fontFamily: F.body, fontSize: 13, fontWeight: weekOffset === v ? 700 : 500, color: weekOffset === v ? C.text : C.muted, background: "none", border: "none", borderRadius: 8, padding: "9px 10px", cursor: "pointer" } }, l)))));

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 } },
            React.createElement("div", null,
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 38, lineHeight: 1, color: C.text } }, totalSets),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 4 } }, "séries de trabalho na semana")),
            weekSelector),
        !groups.length && React.createElement("div", { style: { ...flatPanel, borderRadius: 20, padding: "28px 18px", textAlign: "center" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.5 } }, "Nenhuma série registrada ligada ao catálogo ", weekLabel, ".", React.createElement("br"), "Vincule um exercício a uma entrada do catálogo pra ver o volume por músculo aqui.")),
        groups.map((g) => {
            const isOpen = openGroups.has(g.label);
            return React.createElement("div", { key: g.label, style: { ...flatPanel, borderRadius: 18, overflow: "hidden" } },
                React.createElement("button", { onClick: () => toggleGroup(g.label), style: { width: "100%", display: "flex", flexDirection: "column", gap: 9, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } },
                        React.createElement("span", { style: { fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.text } }, g.label),
                        React.createElement("span", { style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8 } },
                            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver } }, g.total),
                            React.createElement("span", { style: { color: C.muted, fontFamily: F.mono, fontSize: 12, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" } }, "›"))),
                    React.createElement(Pills, { count: g.total, size: 12 })),
                isOpen && React.createElement("div", { style: { padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 11 } },
                    g.rows.map((r) => React.createElement("div", { key: r.musculo },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 5 } },
                            React.createElement("span", { style: { fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: C.silver, textTransform: "capitalize" } }, r.musculo.replace(/_/g, " ")),
                            React.createElement("span", { style: { flexShrink: 0, fontFamily: F.mono, fontSize: 11, color: C.muted } }, r.total)),
                        React.createElement(Pills, { count: r.total, size: 8 })))));
        }),
        unmatched.length > 0 && React.createElement("button", { className: "cc-tap", onClick: onOpenBulkLink, style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontFamily: F.body, fontSize: 13, color: C.text, background: "none", boxShadow: `inset 0 0 0 1px ${C.line2}`, border: "none", borderRadius: 14, padding: "13px 16px", cursor: "pointer", marginTop: 4 } },
            React.createElement("span", null, unmatched.length + " exercício" + (unmatched.length > 1 ? "s" : "") + " fora da conta"),
            React.createElement("span", { style: { color: C.silver, fontWeight: 700 } }, "Vincular ›")));
}
export { VolumeDashboard };
