import { NON_COUNTING_KINDS } from "../styles/tokens";

// 9b/9c — recorde só é decidido ao FINALIZAR o treino, comparando a melhor série de trabalho do dia
// com o melhor histórico anterior. Saltos grandes (provável erro de digitação) ficam de fora.
export const PR_MAX_JUMP_KG = 12;

const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const workEntries = (h) => (h && h.entries ? h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind)) : []);
const best = (entries) => entries.reduce((b, e) => { const l = num(e.load); if (l == null) return b; const r = num(e.reps) ?? 0; if (!b || l > b.load || (l === b.load && r > b.reps)) return { load: l, reps: r }; return b; }, null);

export function computeDayRecords(exercises, dayDate) {
    const out = [];
    (exercises || []).forEach((ex) => {
        const hist = ex.history || [];
        const today = best(workEntries(hist.find((h) => h.date === dayDate)));
        if (!today) return;
        const prior = best(hist.filter((h) => h.date < dayDate).flatMap(workEntries));
        if (!prior) return; // primeira vez não é recorde
        const jump = today.load - prior.load;
        if (jump > PR_MAX_JUMP_KG) return; // suspeito: não celebra
        if (jump > 0) out.push({ id: ex.id, name: ex.name, kind: "load", load: today.load, reps: today.reps, prevLoad: prior.load, delta: jump });
        else if (jump === 0 && today.reps > prior.reps) out.push({ id: ex.id, name: ex.name, kind: "reps", load: today.load, reps: today.reps, prevReps: prior.reps, delta: today.reps - prior.reps });
    });
    return out;
}

export const fmtKg = (v) => (Number.isInteger(v) ? String(v) : String(v).replace(".", ","));
