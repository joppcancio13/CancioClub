import { daySummary, sortedHistory } from "./workout";
import { trainingWds } from "./streak";

// Os 3 números do topo do Rendimento (volume semanal, frequência, recordes), com a MESMA conta da aba
// Rendimento do professor (App.jsx · fichaTab "rend"). Usado no resumo da ficha (FichaV3) pra os
// números baterem entre as duas telas.
function rendSummary({ exercises, checkins, startDate, week, cardio, now = new Date() }) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const weekIdx = (iso) => Math.floor((today - new Date(iso + "T00:00:00")) / (7 * 86400000));
    const vols = Array(8).fill(0);
    (exercises || []).forEach((e) => (e.history || []).forEach((x) => { const w = weekIdx(x.date); if (w >= 0 && w < 8) vols[7 - w] += daySummary(x).volume || 0; }));
    const firstV = vols.find((v) => v > 0) || 0, lastV = vols[7] || vols[6] || 0;
    const volDelta = firstV && lastV ? Math.round(((lastV - firstV) / firstV) * 100) : null;
    const ch = checkins || [];
    const firstDay = [startDate, ...ch].filter(Boolean).sort()[0];
    const freqWeeks = firstDay ? Math.max(1, Math.min(8, weekIdx(String(firstDay).slice(0, 10)) + 1)) : 8;
    const planned = trainingWds(week || {}, cardio).size * freqWeeks;
    const done = ch.filter((d) => weekIdx(d) >= 0 && weekIdx(d) < freqWeeks).length;
    const freqPct = planned ? Math.min(100, Math.round((done / planned) * 100)) : null;
    let prTotal = 0;
    (exercises || []).forEach((e) => {
        const hs = sortedHistory(e.history || []).map((x) => daySummary(x).load).filter((l) => l > 0);
        if (hs.length < 2) return;
        let best = hs[0]; hs.slice(1).forEach((l) => { if (l > best) { prTotal++; best = l; } });
    });
    return { volDelta, freqPct, freqWeeks, prTotal, vols };
}

export { rendSummary };
