import React from "react";
import { C, F, NON_COUNTING_KINDS } from "../../styles/tokens";
import { fmtDate } from "../../utils/date";
import { daySummary, parseReps, repsCeiling, sortedHistory } from "../../utils/workout";

// prescrito × realizado na última sessão: série por série, alvo de reps contra o que foi feito,
// e a carga contra a sessão anterior. O que ficou abaixo do alvo salta no tom de alerta.
function PlanVsDone({ ex, plan }) {
    const hist = sortedHistory(ex.history).filter((h) => Array.isArray(h.entries) && h.entries.length);
    if (!hist.length) return null;
    const lastS = hist[hist.length - 1];
    const prevS = hist.length > 1 ? hist[hist.length - 2] : null;
    const work = plan.filter((s) => !NON_COUNTING_KINDS.has(s.kind));
    const rows = work.map((s, i) => {
        const e = lastS.entries.find((x) => x.setId === s.id);
        const done = e ? parseReps(e.reps) : null;
        const floor = (() => { const m = String(s.reps).match(/(\d+)\s*-\s*(\d+)/); return m ? +m[1] : repsCeiling(s.reps); })();
        return { n: i + 1, target: s.reps, load: e && typeof e.load === "number" ? e.load : null, done, miss: !e || (done != null && floor != null && done < floor) };
    });
    const doneCount = rows.filter((r) => r.load != null).length;
    const below = rows.filter((r) => r.load != null && r.miss).length;
    const dLoad = prevS ? daySummary(lastS).load - daySummary(prevS).load : 0;
    const ok = doneCount === rows.length && below === 0;
    const sum = [doneCount + " de " + rows.length + " s\u00E9ries", below ? below + " abaixo do alvo" : null, dLoad ? (dLoad > 0 ? "+" : "") + String(dLoad).replace(".", ",") + " kg vs. anterior" : null].filter(Boolean).join(" \u00B7 ");
    return React.createElement("div", { style: { borderRadius: 16, boxShadow: `inset 0 0 0 1px ${ok ? C.line2 : "rgba(232,121,75,.35)"}`, padding: "12px 14px", marginBottom: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 } },
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, "Prescrito \u00D7 feito"),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, fmtDate(lastS.date))),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: ok ? C.silver : C.warn, marginTop: 4 } }, sum),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "6px 12px", marginTop: 10, fontFamily: F.body, fontSize: 13, alignItems: "baseline" } },
            React.createElement("span", { style: { color: C.muted, fontSize: 11 } }, "S\u00E9rie"),
            React.createElement("span", { style: { color: C.muted, fontSize: 11 } }, "Alvo"),
            React.createElement("span", { style: { color: C.muted, fontSize: 11 } }, "Feito"),
            rows.flatMap((r) => [
                React.createElement("span", { key: r.n + "a", style: { color: C.muted, fontVariantNumeric: "tabular-nums" } }, "S" + r.n),
                React.createElement("span", { key: r.n + "b", style: { color: C.silver } }, r.target + " reps"),
                React.createElement("span", { key: r.n + "c", style: { color: r.load == null ? "#5A6273" : r.miss ? C.warn : C.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" } }, r.load == null ? "n\u00E3o fez" : String(r.load).replace(".", ",") + " kg \u00D7 " + (r.done ?? "\u2014")),
            ])));
}
export { PlanVsDone };
