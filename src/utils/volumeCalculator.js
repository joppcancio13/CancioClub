import { exerciseCatalog } from "../data/exerciseCatalog";

// Casa de cada músculo fino (como aparece em `ativacao`) com sua porção muscular ampla — é aqui,
// não por categoria de exercício, que o volume se agrupa: gluteo_maximo sempre entra em "Glúteos"
// mesmo quando ativado por um agachamento (exercício de Quadríceps). Cobre tanto os nomes
// detalhados (vasto_lateral, biceps_cabeca_longa...) quanto os genéricos que aparecem na seção
// Ombros do catálogo (triceps, trapezio, biceps) — ver aviso sobre essa mistura na resposta.
const MUSCLE_TO_GROUP = {
    latissimo_dorso: "Costas", redondos: "Costas", trapezio_inferior: "Costas", trapezio_medio: "Costas",
    trapezio_superior: "Costas", trapezio: "Costas", romboides: "Costas",
    biceps_cabeca_longa: "Bíceps", biceps_cabeca_curta: "Bíceps", biceps: "Bíceps", braquial: "Bíceps", braquiorradial: "Bíceps",
    peitoral_esternocostal: "Peitoral", peitoral_clavicular: "Peitoral", peitoral_menor: "Peitoral",
    deltoide_anterior: "Ombros", deltoide_lateral: "Ombros", deltoide_posterior: "Ombros",
    triceps_longa: "Tríceps", triceps_lateral: "Tríceps", triceps_medial: "Tríceps", triceps: "Tríceps",
    vasto_lateral: "Quadríceps", vasto_medial: "Quadríceps", vasto_intermedio: "Quadríceps", reto_femoral: "Quadríceps", iliopsoas: "Quadríceps",
    isquiotibiais: "Isquiotibiais",
    gluteo_maximo: "Glúteos", gluteo_medio: "Glúteos", gluteo_minimo: "Glúteos",
    adutores: "Adutores",
    gastrocnemio: "Panturrilha", soleo: "Panturrilha",
    reto_abdominal: "Abdômen", transverso: "Abdômen", obliquos: "Abdômen", core: "Abdômen", eretores_espinha: "Abdômen",
};

// ordem de exibição — superior pra inferior, core por último (músculo fora do mapa acima cai num
// grupo "Outros" ao final, nunca some silenciosamente)
const GROUP_ORDER = ["Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Isquiotibiais", "Glúteos", "Adutores", "Panturrilha", "Abdômen"];

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
// o volume agregado por músculo fino em "séries equivalentes". Um exercício sem `catalogId` (ou
// com um catalogId que não existe no catálogo) não derruba o cálculo — só é listado em `unmatched`.
function calculateWorkoutVolume(exercisesList, catalog = exerciseCatalog) {
    const totals = {}; // músculo fino -> séries equivalentes (soma de todas as frações)
    const directTotals = {}; // músculo fino -> só a parcela onde a fração é 1.0 (motor primário de verdade)
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

// Monta o relatório pronto pra exibição em duas camadas: grupo muscular amplo (linha principal,
// com o total somado de todos os músculos finos dentro dele) e, dentro de cada grupo, o
// detalhamento por músculo fino. "Sobrecarga indireta" continua calculada no nível fino — um
// músculo que nunca é motor primário em nada desse treino (fração nunca chega a 1.0) mas já
// acumulou volume comparável a um grupamento treinado de propósito (limiar de 6 séries-
// equivalentes, ajustável) — e o grupo em si ganha um aviso se QUALQUER músculo dentro dele
// estiver nessa situação, convidando a abrir o detalhamento pra ver qual.
const SYNERGIST_OVERLOAD_THRESHOLD = 6;

function buildVolumeReport(exercisesList, catalog = exerciseCatalog) {
    const { totals, directTotals, unmatched } = calculateWorkoutVolume(exercisesList, catalog);
    const muscles = Object.keys(totals);
    const maxMuscleTotal = Math.max(1, ...muscles.map((m) => totals[m]));

    const muscleRows = muscles.map((musculo) => {
        const total = totals[musculo];
        const direct = directTotals[musculo] || 0;
        const indirect = total - direct;
        const overloaded = direct === 0 && indirect >= SYNERGIST_OVERLOAD_THRESHOLD;
        return { musculo, total, direct, indirect, overloaded, pct: total / maxMuscleTotal };
    });

    const byGroup = {};
    muscleRows.forEach((r) => {
        const g = MUSCLE_TO_GROUP[r.musculo] || "Outros";
        (byGroup[g] = byGroup[g] || []).push(r);
    });

    const groupTotalOf = (rows) => rows.reduce((sum, r) => sum + r.total, 0);
    const maxGroupTotal = Math.max(1, ...Object.values(byGroup).map(groupTotalOf));

    const orderedLabels = [...GROUP_ORDER.filter((g) => byGroup[g]), ...Object.keys(byGroup).filter((g) => !GROUP_ORDER.includes(g))];
    const groups = orderedLabels.map((label) => {
        const rows = byGroup[label].slice().sort((a, b) => b.total - a.total);
        const total = groupTotalOf(rows);
        return { label, total, pct: total / maxGroupTotal, hasOverload: rows.some((r) => r.overloaded), rows };
    });

    return { groups, unmatched, maxGroupTotal };
}

export { calculateWorkoutVolume, buildVolumeReport, countValidSets, MUSCLE_TO_GROUP, GROUP_ORDER, SYNERGIST_OVERLOAD_THRESHOLD };
