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

// ordem de exibição de desempate — a lista final é sempre reordenada do maior pro menor total
// (redesign estético 4, item 7); isso só decide a ordem entre grupos empatados ou com volume zero
const GROUP_ORDER = ["Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Isquiotibiais", "Glúteos", "Adutores", "Panturrilha", "Abdômen"];

// mesmo critério de "série que conta de verdade" já usado no resto do app (NON_COUNTING_KINDS em
// utils/workout.js) — aquecimento/reconhecimento não entram no volume de treino
const NON_COUNTING_KINDS = new Set(["warmup", "recon"]);

// semana segunda-domingo (mesma convenção de DAYS/JS2KEY no resto do app), com offset em semanas:
// 0 = semana atual, -1 = semana passada
function getWeekRange(weekOffset = 0, today = new Date()) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay(); // 0=dom..6=sáb
    const mondayDelta = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayDelta + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const iso = (x) => x.toISOString().slice(0, 10);
    return { startISO: iso(monday), endISO: iso(sunday) };
}

// conta séries de trabalho REGISTRADAS (histórico, não o plano) de um exercício dentro de um
// intervalo de datas — cobre tanto o formato atual (h.entries, uma série por item) quanto um
// formato antigo mais raro (um valor de carga direto em h.load, sem array de entries: conta como 1)
function countLoggedWorkingSetsInRange(ex, startISO, endISO) {
    let n = 0;
    (ex.history || []).forEach((h) => {
        if (!h || h.date < startISO || h.date > endISO) return;
        if (Array.isArray(h.entries)) {
            n += h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && e.load !== undefined && e.load !== null && e.load !== "").length;
        } else if (h.load !== undefined && h.load !== null && h.load !== "") {
            n += 1;
        }
    });
    return n;
}

// Função pura: recebe TODOS os exercícios da semana de um aluno (qualquer formato com `_day`
// opcional, como allEx já montado em App.jsx) e devolve o volume em pastilhas — uma pastilha por
// série de trabalho REGISTRADA. Sem peso de fração e sem separar direto/indireto: "é só a
// contagem" (redesign estético 4, item 7) — um exercício sem `catalogId` (ou com um catalogId
// fora do catálogo) não derruba o cálculo, só é listado em `unmatched` quando tem um plano de
// séries de trabalho.
//
// Duas contagens propositalmente diferentes (ver buildWeeklyVolumeReport):
// - `totals` (por músculo FINO): quantas séries tocaram cada cabeça/porção específica — útil pra
//   ver onde o volume realmente foi, mas NÃO dá pra somar pra achar o total do grupo.
// - `groupTotals` (por GRUPO amplo): quantas séries tocaram o grupo, contando CADA SÉRIE UMA VEZ
//   SÓ por grupo, mesmo quando o exercício ativa várias cabeças do mesmo grupo ao mesmo tempo —
//   um agachamento ativa vasto lateral + medial + intermédio + reto femoral juntos, mas é uma
//   série só de Quadríceps, não quatro. Sem isso o total do grupo multiplicava pelo nº de cabeças
//   que o exercício lista, inflando o volume e tornando o contador inútil pra esse fim.
function calculateWeeklyVolume(allExercises, weekOffset = 0, catalog = exerciseCatalog) {
    const { startISO, endISO } = getWeekRange(weekOffset);
    const totals = {}; // músculo fino -> nº de pastilhas (toques)
    const groupTotals = {}; // grupo amplo -> nº de séries que tocaram o grupo (deduplicado por exercício)
    const unmatched = [];

    (allExercises || []).forEach((ex) => {
        if (!ex) return;
        const entry = ex.catalogId ? catalog[ex.catalogId] : null;
        if (!entry) {
            const hasWorkingPlan = Array.isArray(ex.setPlan) ? ex.setPlan.some((s) => !NON_COUNTING_KINDS.has(s.kind)) : !!(ex.sets && ex.sets > 0);
            if (ex.name && hasWorkingPlan && !ex.excludeFromVolume) unmatched.push({ id: ex.id, name: ex.name, day: ex._day });
            return;
        }
        const sets = countLoggedWorkingSetsInRange(ex, startISO, endISO);
        if (!sets) return;
        const musculos = Object.keys(entry.ativacao || {});
        musculos.forEach((musculo) => { totals[musculo] = (totals[musculo] || 0) + sets; });
        const gruposDoExercicio = new Set(musculos.map((m) => MUSCLE_TO_GROUP[m] || "Outros"));
        gruposDoExercicio.forEach((g) => { groupTotals[g] = (groupTotals[g] || 0) + sets; });
    });

    return { totals, groupTotals, unmatched, startISO, endISO };
}

// Monta o relatório pronto pra exibição em duas camadas: grupo muscular amplo (linha principal,
// pastilha de 12px por série — total já deduplicado, nunca multiplicado pelas cabeças do grupo) e,
// dentro dele, o detalhamento por músculo fino (pastilha de 8px, mostrando quantas dessas séries
// tocaram cada cabeça especificamente — pode não bater com o total do grupo, de propósito).
// Grupos do maior total pro menor.
function buildWeeklyVolumeReport(allExercises, weekOffset = 0, catalog = exerciseCatalog) {
    const { totals, groupTotals, unmatched, startISO, endISO } = calculateWeeklyVolume(allExercises, weekOffset, catalog);
    const muscleRows = Object.keys(totals).map((musculo) => ({ musculo, total: totals[musculo] }));

    const byGroup = {};
    muscleRows.forEach((r) => {
        const g = MUSCLE_TO_GROUP[r.musculo] || "Outros";
        (byGroup[g] = byGroup[g] || []).push(r);
    });

    const orderedLabels = [...GROUP_ORDER.filter((g) => byGroup[g]), ...Object.keys(byGroup).filter((g) => !GROUP_ORDER.includes(g))];
    const groups = orderedLabels
        .map((label) => {
            const rows = byGroup[label].slice().sort((a, b) => b.total - a.total);
            return { label, total: groupTotals[label] || 0, rows };
        })
        .sort((a, b) => b.total - a.total);

    // soma entre grupos DIFERENTES conta de propósito mais de uma vez a mesma série (ex.: supino
    // soma pra Peitoral E Tríceps) — cada grupo é uma "moeda" de volume separada; só dentro de um
    // mesmo grupo é que uma série não pode valer mais de uma pastilha (ver groupTotals acima)
    const totalSets = groups.reduce((sum, g) => sum + g.total, 0);
    return { groups, unmatched, totalSets, startISO, endISO };
}

export { calculateWeeklyVolume, buildWeeklyVolumeReport, countLoggedWorkingSetsInRange, getWeekRange, MUSCLE_TO_GROUP, GROUP_ORDER };
