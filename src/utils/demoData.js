import { uid, uidShort } from "./misc";
import { isoOf } from "./date";
import { JS2KEY } from "../styles/tokens";

// Modo demonstração do professor (design v4 · 32b): alunos fictícios, montados na hora, com dados que
// mostram todas as telas — alguém treinando agora, treino feito hoje, recado sem resposta, aluno sumido,
// reavaliação vencida. Marcado `isSeed`: nada disso é salvo no aparelho nem vai para a nuvem.

const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return isoOf(d); };
const plan = (n, reps, warm) => [...(warm ? [{ id: uidShort(), kind: "warmup", reps: "12" }] : []), ...Array.from({ length: n }, () => ({ id: uidShort(), kind: "working", reps }))];

function ex(name, catalogId, sets, reps, rest, base, opts = {}) {
    const setPlan = plan(sets, reps, opts.warm);
    // histórico: as últimas semanas no mesmo dia da semana, com a carga subindo devagar
    const history = (opts.past || []).map((daysBack, i) => ({
        date: ago(daysBack),
        entries: setPlan.filter((s) => s.kind === "working").map((s) => ({ setId: s.id, kind: "working", load: base - (opts.past.length - 1 - i) * 2.5, reps: parseInt(reps) || 10, at: Date.now() - daysBack * 864e5 })),
    }));
    return { id: uid(), name, catalogId, sets, reps, rest, note: opts.note, setPlan, history };
}

function weekFor(variant) {
    const w = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
    const past = [21, 14, 7];
    w.seg = [ex("Supino reto", "peit_supino_reto", 3, "8-10", 120, 40, { past, warm: true, note: "Sobe 2,5 kg se as séries saírem limpas." }), ex("Remada aberta", "cost_remada_aberta", 3, "10", 90, 35, { past }), ex("Desenvolvimento", "omb_desenvolvimento", 3, "10", 90, 14, { past }), ex("Tríceps na polia", "tri_polia", 3, "12", 60, 20, { past })];
    w.qua = [ex("Agachamento livre", "quad_agachamento_livre", 4, "8", 120, 50, { past, warm: true, note: "Desce controlado, 3 s." }), ex("Stiff", "isq_stiff", 3, "10", 90, 40, { past }), ex("Cadeira extensora", "quad_cadeira_extensora", 3, "12", 60, 30, { past }), ex("Panturrilha em pé", "pant_em_pe", 4, "15", 45, 40, { past })];
    w.sex = [ex("Puxada aberta", "cost_puxada_aberta", 3, "10", 90, 45, { past }), ex("Supino inclinado", "peit_supino_inclinado", 3, "10", 90, 30, { past }), ex("Elevação lateral", "omb_elevacao_lateral", 3, "12", 60, 8, { past }), ex("Rosca direta", "bic_rosca_biceps", 3, "12", 60, 12, { past })];
    if (variant === "lower") { const t = w.seg; w.seg = w.qua; w.qua = t; }
    return w;
}

function buildDemo() {
    const todayKey = JS2KEY[new Date().getDay()];
    const today = isoOf(new Date());
    const names = [["Lia Moraes", "live"], ["Nina Duarte", "done"], ["Davi Rocha", "msg"], ["Carla Pinto", "gone"], ["Bruno Teles", "reav"], ["Eva Lima", "ok"]];
    const students = [], workouts = {}, sessions = {}, checkins = {}, dayNames = {}, cardio = {}, messages = [], archives = {};
    names.forEach(([name, kind], i) => {
        const id = uid();
        const w = weekFor(i % 2 ? "lower" : "upper");
        // o dia de hoje sempre tem treino na demonstração, pra Treinando agora / feito hoje aparecerem
        if (!(w[todayKey] || []).length) w[todayKey] = weekFor(i % 2 ? "upper" : "lower").seg;
        cardio[id] = { sab: { activity: "Esteira inclinada", target: 30, effort: "leve", note: "Inclinação 8, dá pra conversar." } };
        dayNames[id] = { seg: i % 2 ? "Inferiores A" : "Superiores A", qua: i % 2 ? "Superiores A" : "Inferiores A", sex: "Superiores B", sab: "Cardio" };
        if (!["seg", "qua", "sex"].includes(todayKey)) dayNames[id][todayKey] = "Treino extra";
        // sessões: as 3 semanas anteriores completas e, nesta semana, os dias de treino que já passaram
        // (o aluno sumido não tem nenhuma; o do recado faltou na segunda, pra grade Semana mostrar "faltou")
        const sess = [];
        const mon = new Date(); mon.setHours(12, 0, 0, 0); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
        const dateOf = (weeksBack, k) => { const d = new Date(mon); d.setDate(mon.getDate() - weeksBack * 7 + ["seg", "ter", "qua", "qui", "sex", "sab", "dom"].indexOf(k)); return isoOf(d); };
        const trainKeys = ["seg", "ter", "qua", "qui", "sex", "dom"].filter((k) => (w[k] || []).length);
        if (kind !== "gone") {
            [3, 2, 1].forEach((wb) => trainKeys.forEach((k, j) => sess.push({ id: uid(), date: dateOf(wb, k), day: k, durationSec: 2800 + j * 150, effort: "medida" })));
            trainKeys.forEach((k) => { const dt = dateOf(0, k); if (dt < today && !(kind === "msg" && k === "seg")) sess.push({ id: uid(), date: dt, day: k, durationSec: 3000, effort: kind === "msg" ? "destruidor" : "medida" }); });
        }
        if (kind === "live" || kind === "done") {
            const list = w[todayKey];
            const n = kind === "live" ? 4 : 99; let c = 0;
            list.forEach((e) => { const entries = []; e.setPlan.forEach((s) => { if (c < n && s.kind === "working") { entries.push({ setId: s.id, kind: "working", load: e.history.length ? e.history[e.history.length - 1].entries[0].load : 20, reps: parseInt(e.reps) || 10, at: Date.now() - (n - c) * 3 * 60000 }); c++; } }); if (entries.length) e.history.push({ date: today, entries }); });
            if (kind === "done") sess.push({ id: uid(), date: today, day: todayKey, durationSec: 3120, effort: "medida" });
        }
        workouts[id] = w; sessions[id] = sess; checkins[id] = sess.map((x) => x.date); archives[id] = [];
        const st = { id, name, code: String(1000 + i * 1111).slice(0, 4), goal: ["Hipertrofia", "Força", "Condicionamento"][i % 3], freqWeekly: "3x na semana", targetDuration: "60 min", startDate: ago(70), ackAt: ago(70), consentAt: ago(70) };
        if (kind === "reav") { st.assessment = { idade: 34 }; st.assessmentAt = new Date(Date.now() - 50 * 864e5).toISOString(); st.reassessEvery = 6; }
        if (i === 0) st.clinicalAlert = "Dor no joelho direito em agachamento profundo.";
        students.push(st);
        if (kind === "msg") messages.push({ id: uid(), studentId: id, text: "Posso trocar o leg press hoje? A máquina está ocupada.", date: new Date(Date.now() - 40 * 60000).toISOString(), read: false });
        if (kind === "live") messages.push({ id: uid(), studentId: id, fromProf: true, text: "Boa, segue assim.", date: new Date(Date.now() - 864e5).toISOString(), read: true });
    });
    return {
        isSeed: true, isDemo: true, activeStudentId: students[0].id, soundOn: false,
        students, workouts, sessions, checkins, dayNames, cardio, messages, archives,
        bestStreak: {}, cardioLog: {}, recoveryLog: {}, freezes: {},
        library: [{ id: uid(), name: "Supino reto", url: "", tag: "Peito" }, { id: uid(), name: "Agachamento livre", url: "", tag: "Quadríceps" }, { id: uid(), name: "Remada aberta", url: "", tag: "Costas" }],
        templates: [
            { id: uid(), name: "Superiores A", exercises: weekFor("upper").seg.map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, catalogId: e.catalogId, setPlan: e.setPlan })) },
            { id: uid(), name: "Inferiores A", exercises: weekFor("upper").qua.map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, catalogId: e.catalogId, setPlan: e.setPlan })) },
        ],
    };
}

export { buildDemo };
