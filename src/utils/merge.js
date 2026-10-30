import { sortedHistory } from "./workout";

function splitGlobalForCloud(d) {
    return {
        profKey: d.profKey != null ? d.profKey : null,
        soundOn: d.soundOn !== undefined ? d.soundOn : true,
        library: d.library || [],
        templates: d.templates || [],
        activeStudentId: d.activeStudentId,
    };
}
function splitStudentForCloud(d, student) {
    const sid = student.id;
    return {
        ...student,
        checkins: (d.checkins && d.checkins[sid]) || [],
        bestStreak: (d.bestStreak && d.bestStreak[sid]) || 0,
        archives: (d.archives && d.archives[sid]) || [],
        sessions: (d.sessions && d.sessions[sid]) || [],
        dayNames: (d.dayNames && d.dayNames[sid]) || {},
        cardio: (d.cardio && d.cardio[sid]) || {},
        cardioLog: (d.cardioLog && d.cardioLog[sid]) || [],
        recoveryLog: (d.recoveryLog && d.recoveryLog[sid]) || {},
        freezes: (d.freezes && d.freezes[sid]) || { month: "", used: 0 },
        workouts: (d.workouts && d.workouts[sid]) || {},
        messages: (d.messages || []).filter((m) => m.studentId === sid),
    };
}
function mergeCloudRows(rows) {
    const out = {
        profKey: null, soundOn: true, library: [], templates: [], students: [],
        checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {},
        cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [],
    };
    let maxUpdated = 0;
    rows.forEach((r) => {
        const rd = r.data || {};
        if (rd.updatedAt && rd.updatedAt > maxUpdated)
            maxUpdated = rd.updatedAt;
        if (r.id === "global") {
            out.profKey = rd.profKey != null ? rd.profKey : null;
            out.soundOn = rd.soundOn !== undefined ? rd.soundOn : true;
            out.library = rd.library || [];
            out.templates = rd.templates || [];
            out.activeStudentId = rd.activeStudentId;
        }
        else if (String(r.id).indexOf("student_") === 0) {
            const sid = rd.id;
            if (!sid)
                return;
            out.students.push({ id: rd.id, name: rd.name, code: rd.code, goal: rd.goal, obs: rd.obs, ackAt: rd.ackAt, freqWeekly: rd.freqWeekly, targetDuration: rd.targetDuration, startDate: rd.startDate, clinicalAlert: rd.clinicalAlert, assessment: rd.assessment, assessmentAt: rd.assessmentAt });
            out.checkins[sid] = rd.checkins || [];
            out.bestStreak[sid] = rd.bestStreak || 0;
            out.archives[sid] = rd.archives || [];
            out.sessions[sid] = rd.sessions || [];
            out.dayNames[sid] = rd.dayNames || {};
            out.cardio[sid] = rd.cardio || {};
            out.cardioLog[sid] = rd.cardioLog || [];
            out.recoveryLog[sid] = rd.recoveryLog || {};
            out.freezes[sid] = rd.freezes || { month: "", used: 0 };
            out.workouts[sid] = rd.workouts || {};
            out.messages.push(...(rd.messages || []));
        }
    });
    out.updatedAt = maxUpdated;
    return out;
}
// ===================== deep merge de treino (nuvem + local) =====================
// fetchAllStudentsAfterAuth decidia, por aluno, se ficava com o objeto INTEIRO local ou o INTEIRO
// da nuvem, comparando um updatedAt GLOBAL do app (de qualquer mudança, tipo o professor editando
// o nome de OUTRO aluno) contra o updatedAt daquele aluno na nuvem. Isso podia fazer uma ficha
// local desatualizada "vencer" e se sobrescrever por cima de um treino que o aluno tinha acabado
// de registrar em outro aparelho — dado de treino apagado por causa de uma edição de cadastro sem
// nenhuma relação. As funções abaixo mesclam `workouts` estruturalmente (por dia -> por exercício
// -> por data -> por série), então o treino nunca depende de quem "ganhou" a corrida de timestamp.
function mergeEntriesBySetId(localEntries, cloudEntries) {
    const bySetId = new Map();
    (cloudEntries || []).forEach((e) => bySetId.set(e.setId, e));
    (localEntries || []).forEach((e) => {
        const c = bySetId.get(e.setId);
        if (!c) {
            bySetId.set(e.setId, e); // série nova (registrada só de um lado) -> mantém
            return;
        }
        // mesmo setId nos dois lados -> fica com a maior carga, nunca com "o mais recente"
        const eLoad = typeof e.load === "number" ? e.load : -Infinity;
        const cLoad = typeof c.load === "number" ? c.load : -Infinity;
        bySetId.set(e.setId, eLoad >= cLoad ? e : c);
    });
    return Array.from(bySetId.values());
}
function mergeHistoryDay(localH, cloudH) {
    if (!localH)
        return cloudH;
    if (!cloudH)
        return localH;
    const localEntries = Array.isArray(localH.entries) && localH.entries.length ? localH.entries
        : (typeof localH.load === "number" ? [{ setId: "_flat_local", kind: "working", load: localH.load, reps: localH.reps }] : []);
    const cloudEntries = Array.isArray(cloudH.entries) && cloudH.entries.length ? cloudH.entries
        : (typeof cloudH.load === "number" ? [{ setId: "_flat_cloud", kind: "working", load: cloudH.load, reps: cloudH.reps }] : []);
    if (!localEntries.length && !cloudEntries.length)
        return cloudH;
    return { date: cloudH.date, entries: mergeEntriesBySetId(localEntries, cloudEntries) };
}
function mergeHistoryArrays(localHist, cloudHist) {
    const byDate = new Map();
    (cloudHist || []).forEach((h) => byDate.set(h.date, h));
    (localHist || []).forEach((h) => byDate.set(h.date, mergeHistoryDay(h, byDate.get(h.date) || null)));
    return sortedHistory(Array.from(byDate.values()));
}
function mergeExerciseArray(localList, cloudList) {
    const byId = new Map();
    (cloudList || []).forEach((ex) => byId.set(ex.id, ex));
    const order = (cloudList || []).map((ex) => ex.id);
    (localList || []).forEach((ex) => {
        const c = byId.get(ex.id);
        if (!c) {
            byId.set(ex.id, ex); // exercício que só existe localmente (ex.: adicionado offline) -> mantém
            order.push(ex.id);
            return;
        }
        // exercício existe nos dois -> metadados (nome, descanso, plano...) ficam com a nuvem, que é a
        // base de "verdade" pra edição de ficha; só o histórico de séries é mesclado de verdade
        byId.set(ex.id, { ...c, history: mergeHistoryArrays(ex.history, c.history) });
    });
    return order.map((id) => byId.get(id)).filter(Boolean);
}
function mergeWorkoutsForStudent(localWorkouts, cloudWorkouts) {
    const dayKeys = new Set([...Object.keys(localWorkouts || {}), ...Object.keys(cloudWorkouts || {})]);
    const merged = {};
    dayKeys.forEach((day) => {
        merged[day] = mergeExerciseArray((localWorkouts || {})[day], (cloudWorkouts || {})[day]);
    });
    return merged;
}
function applyGlobalToLocal(local, globalData) {
    const base = local || { students: [], checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {}, cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [] };
    return {
        ...base,
        profKey: globalData.profKey != null ? globalData.profKey : null,
        soundOn: globalData.soundOn !== undefined ? globalData.soundOn : true,
        library: globalData.library || [],
        templates: globalData.templates || [],
        activeStudentId: globalData.activeStudentId !== undefined ? globalData.activeStudentId : base.activeStudentId,
    };
}
export { splitGlobalForCloud, splitStudentForCloud, mergeCloudRows, mergeEntriesBySetId, mergeHistoryDay, mergeHistoryArrays, mergeExerciseArray, mergeWorkoutsForStudent, applyGlobalToLocal };
