import React from "react";
import { C, F, PILL_ON } from "../../styles/tokens";
import { fmtDate } from "../../utils/date";
import { daySummary, sortedHistory } from "../../utils/workout";

// card de evolução: a frase que motiva ("subiu 12 kg desde 3 mar"), recorde e as últimas 8 sessões
// em pastilhas — a mais alta acesa. O gráfico detalhado continua logo abaixo, pra quem quiser.
function EvolutionSummary({ ex, role }) {
    const sess = sortedHistory(ex.history).map((h) => ({ date: h.date, ...daySummary(h) })).filter((h) => h.load > 0);
    if (!sess.length) return React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, padding: "8px 0 14px" } }, "A evolução aparece depois da primeira sessão registrada.");
    const last = sess[sess.length - 1];
    const cutoff = new Date(Date.now() - 56 * 864e5).toISOString().slice(0, 10);
    const base = sess.find((s) => s.date >= cutoff) || sess[0];
    const from = base === last ? sess[0] : base;
    const delta = Math.round((last.load - from.load) * 10) / 10;
    const best = sess.reduce((a, b) => (b.load > a.load ? b : a));
    const recent = sess.slice(-8);
    const max = Math.max(...recent.map((s) => s.load)), min = Math.min(...recent.map((s) => s.load));
    const you = role === "aluno" ? "Voc\u00EA" : "O aluno";
    const kg = (v) => String(v).replace(".", ",");
    const line = sess.length < 2 ? "Primeira sess\u00E3o registrada \u2014 a compara\u00E7\u00E3o come\u00E7a na pr\u00F3xima."
        : delta > 0 ? you + " subiu " + kg(delta) + " kg desde " + fmtDate(from.date) + "."
            : delta < 0 ? "Carga " + kg(-delta) + " kg abaixo de " + fmtDate(from.date) + "."
                : "Mesma carga de " + fmtDate(from.date) + (last.reps && from.reps && last.reps > from.reps ? ", com " + (last.reps - from.reps) + " reps a mais." : ".");
    return React.createElement("div", { style: { marginBottom: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 16 } },
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, "Hoje"),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 32, lineHeight: 1, color: C.text, marginTop: 4, fontVariantNumeric: "tabular-nums" } }, kg(last.load),
                    React.createElement("span", { style: { fontSize: 15, fontWeight: 500, color: C.muted } }, " kg" + (last.reps ? " \u00D7 " + last.reps : "")))),
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, "Recorde"),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 18, color: C.silver, marginTop: 4 } }, kg(best.load) + " kg"))),
        React.createElement("div", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 15, lineHeight: 1.4, color: delta > 0 ? C.text : C.silver, marginTop: 10, textWrap: "pretty" } }, line),
        recent.length > 1 && React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 4, height: 56, marginTop: 14 } }, recent.map((s, i) => {
            const h = max === min ? 40 : 12 + ((s.load - min) / (max - min)) * 44;
            const top = s.load === max;
            return React.createElement("div", { key: i, title: fmtDate(s.date) + " \u00B7 " + kg(s.load) + " kg", style: { flex: 1, height: h, borderRadius: 3, ...(top ? { backgroundImage: PILL_ON } : { background: "#2A2F39" }) } });
        })),
        recent.length > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 6 } },
            React.createElement("span", null, fmtDate(recent[0].date)),
            React.createElement("span", null, recent.length + " sess\u00F5es"),
            React.createElement("span", null, fmtDate(last.date))));
}
export { EvolutionSummary };
