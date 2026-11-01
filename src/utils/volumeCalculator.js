import { exerciseCatalog } from "../data/exerciseCatalog";

// Agrupamento de exibição — "Outros" recebe qualquer músculo do catálogo que apareça no treino
// mas não esteja mapeado aqui (defensivo: o catálogo pode crescer com músculos novos sem quebrar
// o dashboard, só cai num grupo genérico em vez de sumir).
const MUSCLE_GROUPS = {
    "Membros Superiores": ["peitoral", "dorsais", "trapezio", "romboides", "deltoide_anterior", "deltoide_posterior", "biceps", "triceps", "triceps_cabeça_longa", "braquial", "braquiorradial", "antebraco"],
    "Membros Inferiores": ["quadriceps", "isquiotibiais", "gluteos", "gluteo_medio", "gluteo_minimo", "adutores", "panturrilhas", "reto_femoral", "iliopsoas"],
    "Core": ["eretores_espinha"],
};

// mesmo critério de "série que conta de verdade" já usado no resto do app (NON_COUNTING_KINDS em
// utils/workout.js) — aquecimento/reconhecimento não entram no volume de treino
const NON_COUNTING_KINDS = new Set(["warmup", "recon"]);

function countValidSets(ex) {
    if (Array.isArray(ex.setPlan) && ex.setPlan.length) {
        return ex.setPlan.filter((s) => !NON_COUNTING_KINDS.has(s.kind)).length;
    }
    const n = typeof ex.sets === "number" ? ex.sets : parseInt(ex.sets, 10);
    return Number.isFinite(n) ? n : 0;
}

// Função pura: recebe a lista de exercícios de UM dia da ficha (o formato real de
// data.workouts[studentId][day] — cada item com `catalogId` opcional, `sets`/`setPlan`) e devolve
// o volume agregado por músculo em "séries equivalentes". Um exercício sem `catalogId` (ou com um
// catalogId que não existe no catálogo) não derruba o cálculo — só é listado em `unmatched`.
function calculateWorkoutVolume(exercisesList, catalog = exerciseCatalog) {
    const totals = {}; // músculo -> séries equivalentes (soma de todas as frações)
    const directTotals = {}; // músculo -> só a parcela onde a fração é 1.0 (motor primário de verdade)
    const unmatched = [];

    (exercisesList || []).forEach((ex) => {
        const entry = ex && ex.catalogId ? catalog[ex.catalogId] : null;
        if (!entry) {
            if (ex && ex.name) unmatched.push(ex.name);
            return;
        }
        const validSets = countValidSets(ex);
        if (!validSets) return;
        Object.entries(entry.ativacao || {}).forEach(([musculo, fracao]) => {
            const add = validSets * fracao;
            totals[musculo] = (totals[musculo] || 0) + add;
            if (fracao >= 1) directTotals[musculo] = (directTotals[musculo] || 0) + add;
        });
    });

    return { totals, directTotals, unmatched };
}

// Monta o relatório pronto pra exibição: agrupado por bloco corporal, ordenado por volume, com a
// flag de "sobrecarga indireta" — músculo que nunca é motor primário em nada desse treino (fração
// nunca chega a 1.0) mas mesmo assim já acumulou volume comparável a um grupamento treinado de
// propósito (limiar de 6 séries-equivalentes é um ponto de partida razoável, não uma lei física —
// ajustável conforme a realidade de cada ficha).
const SYNERGIST_OVERLOAD_THRESHOLD = 6;

function buildVolumeReport(exercisesList, catalog = exerciseCatalog) {
    const { totals, directTotals, unmatched } = calculateWorkoutVolume(exercisesList, catalog);
    const muscles = Object.keys(totals);
    const maxTotal = Math.max(1, ...muscles.map((m) => totals[m]));

    const rows = muscles
        .map((musculo) => {
            const total = totals[musculo];
            const direct = directTotals[musculo] || 0;
            const indirect = total - direct;
            const overloaded = direct === 0 && indirect >= SYNERGIST_OVERLOAD_THRESHOLD;
            return { musculo, total, direct, indirect, overloaded, pct: total / maxTotal };
        })
        .sort((a, b) => b.total - a.total);

    const grouped = new Set(Object.values(MUSCLE_GROUPS).flat());
    const groups = Object.entries(MUSCLE_GROUPS)
        .map(([label, list]) => ({ label, rows: rows.filter((r) => list.includes(r.musculo)) }))
        .filter((g) => g.rows.length);
    const leftover = rows.filter((r) => !grouped.has(r.musculo));
    if (leftover.length) groups.push({ label: "Outros", rows: leftover });

    return { groups, unmatched, maxTotal };
}

export { calculateWorkoutVolume, buildVolumeReport, countValidSets, MUSCLE_GROUPS, SYNERGIST_OVERLOAD_THRESHOLD };
