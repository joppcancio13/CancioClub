// Cancio Club — mescla, no servidor, a ficha que o aluno enviou com a que já está na nuvem.
//
// Por que existe: o `sync` gravava o payload do aluno por cima da linha inteira. O celular do aluno
// quase sempre tem uma cópia um pouco velha da ficha, então cada série registrada:
//   - apagava o alerta clínico (o app do aluno remove `clinicalAlert` de propósito, pra não mostrar);
//   - desfazia o que o professor tinha mudado na ficha nesse meio tempo (exercícios, nomes, obs...);
//   - apagava recados do professor que ainda não tinham chegado no celular do aluno.
//
// Regra geral: a NUVEM é a base. Do aluno só entra o que o aluno de fato produz (séries, check-ins,
// sessões, cardio, recuperação, recados, e os campos de perfil que ele mesmo edita). Arquivo em JS
// puro (sem tipos) pra rodar igual no Deno da Edge Function e num teste no navegador.

// campos do cadastro que o PRÓPRIO aluno edita no app — o resto do cadastro é do professor
const STUDENT_PROFILE_FIELDS = ["ackAt", "consentAt", "photo", "goals", "contactPhone", "contactEmail", "reassessments", "deletionRequestedAt"];
// campos que a anamnese inicial (respondida pelo aluno) preenche — só entram quando chega uma anamnese NOVA
const ASSESSMENT_FIELDS = ["assessment", "assessmentAt", "goal", "freqWeekly", "targetDuration", "obs"];

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

function unionById(base, extra, combine) {
    const out = (base || []).map((x) => x);
    const idx = new Map();
    out.forEach((x, i) => { if (x && x.id != null) idx.set(x.id, i); });
    (extra || []).forEach((x) => {
        if (!x || x.id == null) return;
        if (idx.has(x.id)) { if (combine) out[idx.get(x.id)] = combine(out[idx.get(x.id)], x); }
        else { idx.set(x.id, out.length); out.push(x); }
    });
    return out;
}

// um dia de histórico de UM exercício. Formato novo: {date, entries:[{setId,...}], studentNote?}.
// Formato antigo (achatado): {date, load, reps}. Mesma série dos dois lados -> fica a do aluno, que
// é quem acabou de mexer (corrigir 100 kg pra 10 kg tem que valer, não "a maior carga").
function mergeHistoryDay(cloudH, incH) {
    if (!cloudH) return incH;
    if (!incH) return cloudH;
    const cE = Array.isArray(cloudH.entries) ? cloudH.entries : null;
    const iE = Array.isArray(incH.entries) ? incH.entries : null;
    let out;
    if (cE && iE) {
        const bySet = new Map();
        cE.forEach((e) => bySet.set(e.setId, e));
        iE.forEach((e) => bySet.set(e.setId, e));
        out = { ...cloudH, ...incH, entries: Array.from(bySet.values()) };
    } else if (iE && iE.length) out = { ...cloudH, ...incH };
    else if (cE && cE.length) out = { ...incH, ...cloudH };
    else out = { ...cloudH, ...incH };
    const note = has(incH, "studentNote") ? incH.studentNote : cloudH.studentNote;
    if (note !== undefined) out.studentNote = note;
    return out;
}

function mergeHistory(cloudHist, incHist) {
    const m = new Map();
    (cloudHist || []).forEach((h) => m.set(h.date, h));
    (incHist || []).forEach((h) => m.set(h.date, mergeHistoryDay(m.get(h.date), h)));
    return Array.from(m.values()).sort(byDate);
}

// lista de exercícios de um dia: a ficha (quais exercícios, ordem, séries planejadas, nome...) é do
// professor -> vem da nuvem. Exercício que só existe no celular do aluno foi removido pelo
// professor (o aluno não cria exercício) -> não volta. Do aluno entram o histórico e a troca do dia.
function mergeDay(cloudList, incList) {
    const inc = new Map((incList || []).map((e) => [e.id, e]));
    return (cloudList || []).map((ex) => {
        const ie = inc.get(ex.id);
        if (!ie) return ex;
        const merged = { ...ex, history: mergeHistory(ex.history, ie.history) };
        if (has(ie, "swap")) merged.swap = ie.swap;
        // o aluno também pode mexer nas séries planejadas durante o treino (tipo da série, +/- série).
        // O app carimba planAt em toda mudança de plano (dos dois lados) — o mais novo vence.
        if ((ie.planAt || 0) > (ex.planAt || 0)) {
            merged.setPlan = ie.setPlan; merged.sets = ie.sets; merged.reps = ie.reps; merged.planAt = ie.planAt;
        }
        return merged;
    });
}

function mergeWorkouts(cloudW, incW) {
    const out = { ...(cloudW || {}) };
    Object.keys(cloudW || {}).forEach((day) => { out[day] = mergeDay(cloudW[day], (incW || {})[day]); });
    return out;
}

function mergeClinicalAlert(cloudAlert, incAlert) {
    if (!incAlert) return cloudAlert;
    if (!cloudAlert) return incAlert;
    return cloudAlert.includes(incAlert) ? cloudAlert : cloudAlert + "\n\n" + incAlert;
}

function mergeStudentRow(cloud, incoming) {
    const c = cloud || {};
    const i = incoming || {};
    const out = { ...c };

    STUDENT_PROFILE_FIELDS.forEach((k) => { if (has(i, k)) out[k] = i[k]; });
    // anamnese nova (assessmentAt diferente do da nuvem): os campos que ela preenche entram, e o
    // alerta clínico que o aluno relatou é SOMADO ao do professor — o celular do aluno não tem o
    // alerta antigo, então o que vem dele é só a parte nova
    const newAssessment = i.assessmentAt && i.assessmentAt !== c.assessmentAt;
    if (newAssessment) {
        ASSESSMENT_FIELDS.forEach((k) => { if (has(i, k)) out[k] = i[k]; });
        out.clinicalAlert = mergeClinicalAlert(c.clinicalAlert, i.clinicalAlert);
    }

    out.workouts = mergeWorkouts(c.workouts, i.workouts);
    out.checkins = Array.from(new Set([...(c.checkins || []), ...(i.checkins || [])])).sort();
    out.sessions = unionById(c.sessions, i.sessions, (a, b) => ({ ...a, ...b })).sort(byDate); // b pode trazer o feedback
    out.cardioLog = unionById(c.cardioLog, i.cardioLog);
    out.recoveryLog = { ...(c.recoveryLog || {}), ...(i.recoveryLog || {}) }; // por data; o aluno marca/desmarca
    out.bestStreak = Math.max(c.bestStreak || 0, i.bestStreak || 0);
    const cf = c.freezes || { month: "", used: 0 }, inf = i.freezes || { month: "", used: 0 };
    out.freezes = cf.month === inf.month ? { month: cf.month, used: Math.max(cf.used || 0, inf.used || 0) } : (inf.month > cf.month ? inf : cf);
    // recado: lido de qualquer lado = lido
    out.messages = unionById(c.messages, (i.messages || []).filter((m) => !m.studentId || m.studentId === c.id), (a, b) => ({ ...a, read: !!(a.read || b.read) }));
    // archives, dayNames, cardio, nome, código, objetivo, obs, alerta clínico...: ficam com a nuvem
    out.id = c.id;
    out.code = c.code;
    return out;
}

// o que vai pro celular do aluno no login: tudo, menos o que é só do professor
function publicStudentView(row) {
    const { clinicalAlert, ...rest } = row || {};
    return rest;
}

export { mergeStudentRow, publicStudentView, mergeHistoryDay, mergeWorkouts };
