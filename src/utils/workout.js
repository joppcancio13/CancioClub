import { DAYS, NON_COUNTING_KINDS } from "../styles/tokens";
import { uidShort } from "./misc";

const sortedHistory = (h) => [...h].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
function defaultSetPlan(n, reps) { const c = Math.max(1, parseInt(n) || 1); return Array.from({ length: c }).map(() => ({ id: uidShort(), kind: "working", reps: reps || "10" })); }
function planSummary(ex) {
    if (!ex.setPlan || !ex.setPlan.length)
        return `${ex.sets}×${ex.reps}`;
    const warm = ex.setPlan.filter((s) => s.kind === "warmup").length;
    const work = ex.setPlan.filter((s) => s.kind !== "warmup");
    const seq = work.map((s) => s.reps).join("·");
    return (warm ? `${warm} aquec. + ` : "") + (work.length ? `${work.length}×(${seq})` : "");
}
// interpreta a meta de reps de uma série: "8-12" (zona) -> teto 12; "10" (fixo) -> 10
function repsCeiling(targetReps) {
    if (targetReps == null)
        return null;
    const s = String(targetReps).trim();
    const range = s.match(/(\d+)\s*-\s*(\d+)/);
    if (range)
        return parseInt(range[2], 10);
    const n = parseInt(s, 10);
    return isNaN(n) ? null : n;
}
// interpreta reps que podem vir como número puro OU como string de técnica avançada ("12+4+3", "4/4/4") -> soma as parcelas
function parseReps(val) {
    if (typeof val === "number")
        return val;
    if (val == null)
        return null;
    const parts = String(val).split(/[+/]/).map((p) => parseInt(p.trim(), 10)).filter((n) => !isNaN(n));
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null;
}
// Um "entry" de histórico pode ser antigo (achatado: {date,load,reps}) ou novo ({date, entries:[{setId,kind,load,reps}]}).
// daySummary deriva um par {load,reps} representativo do dia = a série de TRABALHO mais pesada (ignora aquecimento).
function daySummary(h) {
    if (Array.isArray(h.entries) && h.entries.length) {
        const working = h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && typeof e.load === "number");
        // sem série de trabalho registrada nesse dia (só aquecimento) -> não vira referência de
        // recorde nem de tonelagem; cair pro aquecimento aqui contaminaria maxLoad em addLoad
        if (!working.length)
            return { load: 0, reps: null, volume: 0 };
        const top = working.reduce((a, b) => (b.load > a.load ? b : a));
        const volume = working.reduce((sum, e) => { const r = parseReps(e.reps); return sum + (r != null ? e.load * r : 0); }, 0);
        return { load: top.load, reps: parseReps(top.reps), volume };
    }
    const flatReps = parseReps(h.reps);
    const flatVolume = (h.load || 0) * (flatReps || 0);
    return { load: h.load || 0, reps: flatReps, volume: flatVolume };
}
// melhor carga já registrada por exercício (agrupado por nome, já que o mesmo exercício pode
// aparecer em mais de um dia da semana como registros separados) — só olha a semana atual do
// aluno, não os arquivos antigos, pra manter simples e sempre em dia com o plano vigente
function computeRecords(week) {
    const groups = {};
    DAYS.forEach((d) => {
        (week[d.key] || []).forEach((ex) => {
            const key = ex.name.trim().toLowerCase();
            if (!groups[key])
                groups[key] = { name: ex.name, best: null, date: null };
            sortedHistory(ex.history).forEach((h) => {
                const { load } = daySummary(h);
                if (typeof load === "number" && load > 0 && (groups[key].best == null || load > groups[key].best)) {
                    groups[key].best = load;
                    groups[key].date = h.date;
                }
            });
        });
    });
    return Object.values(groups).filter((g) => g.best != null).sort((a, b) => (a.date < b.date ? 1 : -1));
}
// diário de treino: um "feed" por data, montado em cima do que já existe espalhado (sessions marca
// os dias finalizados; workouts/cardioLog/recoveryLog dão o detalhe de cada um). isRecord olha se
// aquela carga bateu tudo que veio ANTES daquela data — é o mesmo espírito do checkPR do addLoad,
// só que revisitando o passado em vez de checar na hora.
function buildDiary(data, studentId) {
    const sessions = (data && data.sessions && data.sessions[studentId]) || [];
    const workouts = (data && data.workouts && data.workouts[studentId]) || emptyWeek();
    const cardioLog = (data && data.cardioLog && data.cardioLog[studentId]) || [];
    const recoveryLog = (data && data.recoveryLog && data.recoveryLog[studentId]) || {};
    const dayNames = (data && data.dayNames && data.dayNames[studentId]) || {};
    return [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1)).map((s) => {
        const dayInfo = DAYS.find((d) => d.key === s.day);
        // sem nome próprio pro dia, o rótulo cai no nome do dia da semana ("Segunda") — mas isso é
        // só o SLOT/ficha, não quando o treino de fato aconteceu (dá pra treinar a ficha de
        // Segunda numa Quarta, trocando o dia). "Ficha de Segunda" deixa isso claro ao lado da
        // data real (fmtDate(s.date)) em vez de parecer uma afirmação de que foi feito na segunda.
        const dayLabel = (dayNames && dayNames[s.day]) || (dayInfo ? `Ficha de ${dayInfo.full}` : s.day);
        const exercises = (workouts[s.day] || []).map((ex) => {
            const h = (ex.history || []).find((hh) => hh.date === s.date);
            if (!h)
                return null;
            const { load, reps } = daySummary(h);
            if (!load)
                return null;
            const priorBest = (ex.history || [])
                .filter((hh) => hh.date < s.date)
                .map((hh) => daySummary(hh).load)
                .filter((v) => typeof v === "number")
                .reduce((m, v) => (m == null || v > m ? v : m), null);
            return { name: ex.name, load, reps, isRecord: priorBest != null && load > priorBest };
        }).filter(Boolean);
        const cardio = cardioLog.filter((c) => c.date === s.date);
        const recovery = recoveryLog[s.date];
        const hasRecovery = !!(recovery && (recovery.hydration || recovery.sleep || recovery.mobility));
        return { ...s, dayLabel, exercises, cardio, recovery: hasRecovery ? recovery : null, hasRecord: exercises.some((e) => e.isRecord) };
    });
}
const currentLoad = (ex) => { const h = sortedHistory(ex.history); return h.length ? daySummary(h[h.length - 1]).load : 0; };
const lastReps = (ex) => { const h = sortedHistory(ex.history); for (let i = h.length - 1; i >= 0; i--) {
    const r = daySummary(h[i]).reps;
    if (r != null)
        return r;
} return null; };
function emptyWeek() { const w = {}; DAYS.forEach((d) => (w[d.key] = [])); return w; }
// séries de TRABALHO previstas x feitas no dia (aquecimento/reconhecimento não contam)
function workingProgress(list, dayDate) {
    let total = 0, done = 0;
    (list || []).forEach((ex) => {
        const planned = Array.isArray(ex.setPlan) && ex.setPlan.length ? ex.setPlan.filter((p) => !NON_COUNTING_KINDS.has(p.kind)).length : (parseInt(ex.sets) || 0);
        const h = (ex.history || []).find((x) => x.date === dayDate);
        const d = h ? (Array.isArray(h.entries) && h.entries.length ? h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && typeof e.load === "number").length : (typeof h.load === "number" ? 1 : 0)) : 0;
        total += Math.max(planned, d); done += d;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
export { sortedHistory, defaultSetPlan, planSummary, repsCeiling, parseReps, daySummary, computeRecords, buildDiary, currentLoad, lastReps, emptyWeek, workingProgress };
