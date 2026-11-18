import { sortedHistory } from "./workout";

function splitGlobalForCloud(d) {
    return {
        profKey: d.profKey != null ? d.profKey : null,
        soundOn: d.soundOn !== undefined ? d.soundOn : true,
        library: d.library || [],
        templates: d.templates || [],
        quickReplies: d.quickReplies, // design v4 (50c): respostas rápidas do professor
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
            out.quickReplies = rd.quickReplies;
            out.activeStudentId = rd.activeStudentId;
        }
        else if (String(r.id).indexOf("student_") === 0) {
            const sid = rd.id;
            if (!sid)
                return;
            out.students.push({ id: rd.id, name: rd.name, code: rd.code, goal: rd.goal, obs: rd.obs, ackAt: rd.ackAt, freqWeekly: rd.freqWeekly, targetDuration: rd.targetDuration, startDate: rd.startDate, clinicalAlert: rd.clinicalAlert, assessment: rd.assessment, assessmentAt: rd.assessmentAt, photo: rd.photo, reassessments: rd.reassessments, reassessEvery: rd.reassessEvery, consentAt: rd.consentAt, deletionRequestedAt: rd.deletionRequestedAt, memberNo: rd.memberNo, memberSince: rd.memberSince, goals: rd.goals, contactPhone: rd.contactPhone, contactEmail: rd.contactEmail });
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
        // mesmo setId nos dois lados -> fica a edição mais NOVA (campo `at`, gravado pelo addLoad).
        // Antes ficava a maior carga, então corrigir um erro de digitação pra baixo (100 -> 10 kg)
        // podia ser desfeito na próxima mescla. Série antiga sem `at` dos dois lados: fica a da nuvem.
        const eAt = typeof e.at === "number" ? e.at : 0;
        const cAt = typeof c.at === "number" ? c.at : 0;
        bySetId.set(e.setId, eAt > cAt ? e : c);
    });
    return Array.from(bySetId.values());
}
function mergeHistoryDay(localH, cloudH) {
    if (!localH)
        return cloudH;
    if (!cloudH)
        return localH;
    // formato antigo (achatado, sem entries) dos dois lados: é o MESMO registro -> fica o da nuvem.
    // Antes cada lado virava uma série com setId diferente ("_flat_local"/"_flat_cloud") e o dia
    // passava a ter a série duplicada (volume em dobro).
    const localHasEntries = Array.isArray(localH.entries) && localH.entries.length > 0;
    const cloudHasEntries = Array.isArray(cloudH.entries) && cloudH.entries.length > 0;
    if (!localHasEntries && !cloudHasEntries)
        return typeof cloudH.load === "number" ? cloudH : localH;
    const flat = (h) => (typeof h.load === "number" ? [{ setId: "_flat", kind: "working", load: h.load, reps: h.reps }] : []);
    const localEntries = localHasEntries ? localH.entries : flat(localH);
    const cloudEntries = cloudHasEntries ? cloudH.entries : flat(cloudH);
    const merged = { date: cloudH.date, entries: mergeEntriesBySetId(localEntries, cloudEntries) };
    // a nota do aluno daquele dia sumia na mescla (o dia era remontado só com date + entries)
    const note = localH.studentNote !== undefined ? localH.studentNote : cloudH.studentNote;
    if (note !== undefined)
        merged.studentNote = note;
    // notas de técnica do Modo aula: só o professor escreve -> vale a da nuvem; sem ela, a local
    // séries puladas (design v4 · 36b): soma dos dois lados — pular é do aluno e não volta atrás
    const skipped = Array.from(new Set([...(localH.skipped || []), ...(cloudH.skipped || [])]));
    if (skipped.length)
        merged.skipped = skipped;
    const tech = cloudH.techNotes !== undefined ? cloudH.techNotes : localH.techNotes;
    if (tech !== undefined)
        merged.techNotes = tech;
    return merged;
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
// Soma (nunca escolhe um lado) os registros de ATIVIDADE de um aluno que existem neste aparelho
// mas ainda não chegaram na nuvem: check-ins, sessões, cardio, recuperação e recados. `merged` já
// tem a versão da nuvem e é alterado no lugar. Devolve true se algo local foi acrescentado (aí a
// nuvem precisa receber a versão somada).
function unionById(cloudList, localList) {
    const ids = new Set((cloudList || []).map((x) => x && x.id));
    const add = (localList || []).filter((x) => x && x.id != null && !ids.has(x.id));
    return add.length ? [...(cloudList || []), ...add] : null;
}
function mergeLocalActivityInto(merged, local, sid) {
    let changed = false;
    const lc = (local.checkins && local.checkins[sid]) || [];
    const cc = merged.checkins[sid] || [];
    const addC = lc.filter((d) => !cc.includes(d));
    if (addC.length) { merged.checkins[sid] = [...cc, ...addC].sort(); changed = true; }
    const sess = unionById(merged.sessions[sid], local.sessions && local.sessions[sid]);
    if (sess) { merged.sessions[sid] = sess.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)); changed = true; }
    const cl = unionById(merged.cardioLog[sid], local.cardioLog && local.cardioLog[sid]);
    if (cl) { merged.cardioLog[sid] = cl; changed = true; }
    const lr = (local.recoveryLog && local.recoveryLog[sid]) || {};
    const cr = merged.recoveryLog[sid] || {};
    const missingDates = Object.keys(lr).filter((dt) => !(dt in cr));
    if (missingDates.length) { const r = { ...cr }; missingDates.forEach((dt) => { r[dt] = lr[dt]; }); merged.recoveryLog[sid] = r; changed = true; }
    const lb = (local.bestStreak && local.bestStreak[sid]) || 0;
    if (lb > (merged.bestStreak[sid] || 0)) { merged.bestStreak[sid] = lb; changed = true; }
    const msgs = unionById(merged.messages, (local.messages || []).filter((m) => m.studentId === sid));
    if (msgs) { merged.messages = msgs; changed = true; }
    return changed;
}
function applyGlobalToLocal(local, globalData) {
    const base = local || { students: [], checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {}, cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [] };
    return {
        ...base,
        profKey: globalData.profKey != null ? globalData.profKey : null,
        soundOn: globalData.soundOn !== undefined ? globalData.soundOn : true,
        library: globalData.library || [],
        templates: globalData.templates || [],
        quickReplies: globalData.quickReplies !== undefined ? globalData.quickReplies : base.quickReplies,
        activeStudentId: globalData.activeStudentId !== undefined ? globalData.activeStudentId : base.activeStudentId,
    };
}
export { splitGlobalForCloud, splitStudentForCloud, mergeCloudRows, mergeEntriesBySetId, mergeHistoryDay, mergeHistoryArrays, mergeExerciseArray, mergeWorkoutsForStudent, mergeLocalActivityInto, applyGlobalToLocal };
