import React, { useState, useEffect } from "react";
import { AssessmentInicial } from "./components/assessment/AssessmentInicial";
import { CardioSection } from "./components/professor/CardioSection";
import { FichaEditor } from "./components/professor/FichaEditor";
import { LibraryManager } from "./components/professor/LibraryManager";
import { PSEModal } from "./components/professor/PSEModal";
import { RecoverySection } from "./components/professor/RecoverySection";
import { TemplateBuilder } from "./components/professor/TemplateBuilder";
import { TemplateCard } from "./components/professor/TemplateCard";
import { BulkLinkSheet } from "./components/professor/BulkLinkSheet";
import { VolumeDashboard } from "./components/professor/VolumeDashboard";
import { AssessmentExport } from "./components/share/AssessmentExport";
import { LogoCard } from "./components/share/LogoCard";
import { SerieExport } from "./components/share/SerieExport";
import { AddButton } from "./components/shared/AddButton";
import { CatalogPicker } from "./components/shared/CatalogPicker";
import { Celebration } from "./components/shared/Celebration";
import { Disclaimer } from "./components/shared/Disclaimer";
import { DiscoBall } from "./components/shared/DiscoBall";
import { FeedbackModal } from "./components/shared/FeedbackModal";
import { Field } from "./components/shared/FormFields";
import { MirrorGlobe } from "./components/shared/MirrorGlobe";
import { Pill } from "./components/shared/Pill";
import { PremiumEmptyState } from "./components/shared/PremiumEmptyState";
import { SkeletonCard } from "./components/shared/SkeletonCard";
import { Sparkles } from "./components/shared/Sparkles";
import { AlunoProfile } from "./components/student/AlunoProfile";
import { BottomActionBar } from "./components/student/BottomActionBar";
import { DayEntryScreen } from "./components/student/DayEntryScreen";
import { DayTabs } from "./components/student/DayTabs";
import { DiaryCalendar } from "./components/student/DiaryCalendar";
import { ExerciseCard } from "./components/student/ExerciseCard";
import { StudentMessages } from "./components/student/StudentMessages";
import { setActiveSet } from "./hooks/useActiveSet";
import { LS_KEY, flushAllPendingSaves, loadData, saveLocal, throttle } from "./hooks/useLocalData";
import { callStudentApi, deleteStudentFromCloud, saveGlobalToCloud, saveStudentToCloud, sb } from "./lib/supabaseClient";
import { useDataStore } from "./stores/useDataStore";
import { BALL_URL, C, DAYS, EASE, F, JS2KEY, MIRROR_GRID, NON_COUNTING_KINDS, PILL_ON, REST_PHRASES, SESS_KEY, TRAIN_PHRASES, flatPanel, glassPanel } from "./styles/tokens";
import { mapAnamneseToFicha } from "./utils/assessment";
import { playDisco, playFinishChime } from "./utils/audio";
import { fmtDate, fmtDateTime, fmtDur, fmtVolume, isWithin7, isoOf, parseWeeklyTarget, todayISO } from "./utils/date";
import { mergeCloudRows, mergeWorkoutsForStudent, splitGlobalForCloud, splitStudentForCloud } from "./utils/merge";
import { genCode, greeting, haptic, noop, pickDailyPhrase, uid, uidShort } from "./utils/misc";
import { seed } from "./utils/seedData";
import { computeStreak, lastCheckinLabel, streakTier, trainingWds } from "./utils/streak";
import { buildDiary, computeRecords, daySummary, defaultSetPlan, emptyWeek, sortedHistory, workingProgress } from "./utils/workout";
import { buildWeeklyVolumeReport } from "./utils/volumeCalculator";

// 652 linhas de desenho em canvas, só usadas quando o aluno termina um treino e vê a tela de
// compartilhar — React.lazy adia esse download pro momento real de uso, não pro boot do app.
const ShareCard = React.lazy(() => import("./components/share/ShareCard").then((m) => ({ default: m.ShareCard })));

/* ------------------------------ app ------------------------------ */
function CancioClub() {
    const data = useDataStore((s) => s.data);
    const setData = useDataStore((s) => s.setData);
    const ready = useDataStore((s) => s.ready);
    const setReady = useDataStore((s) => s.setReady);
    const [role, setRole] = useState(() => { try { return localStorage.getItem("cancio:lastRole") === "prof" ? "prof" : "aluno"; } catch (e) { return "aluno"; } });
    const [profTab, setProfTab] = useState("alunos");
    const [profView, setProfView] = useState("home");
    const [fichaTab, setFichaTab] = useState("treino");
    const [rendEx, setRendEx] = useState(null);
    const [noteDraft, setNoteDraft] = useState("");
    const [serieOpen, setSerieOpen] = useState(false);
    const [assessOpen, setAssessOpen] = useState(false);
    const [profUnlocked, setProfUnlocked] = useState(false);
    const [profKeyInput, setProfKeyInput] = useState("");
    const [profKeyErr, setProfKeyErr] = useState("");
    const [fichaOpen, setFichaOpen] = useState(false);
    const [histOpen, setHistOpen] = useState(false);
    const [archLabel, setArchLabel] = useState("");
    const [alunoId, setAlunoId] = useState(null);
    const [codeInput, setCodeInput] = useState("");
    const [codeErr, setCodeErr] = useState(false);
    const [day, setDay] = useState(JS2KEY[new Date().getDay()]);
    const [expanded, setExpanded] = useState(null);
    const toggleExpanded = React.useCallback((id) => setExpanded((p) => (p === id ? null : id)), []);
    const [adding, setAdding] = useState(false);
    // swipe horizontal troca o dia — só dispara se o gesto for bem mais horizontal que vertical,
    // pra não atrapalhar a rolagem normal da lista
    const swipeStart = React.useRef(null);
    const onDaySwipeStart = (e) => { swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onDaySwipeEnd = (e) => {
        if (!swipeStart.current)
            return;
        const dx = e.changedTouches[0].clientX - swipeStart.current.x;
        const dy = e.changedTouches[0].clientY - swipeStart.current.y;
        swipeStart.current = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            const idx = DAYS.findIndex((d) => d.key === day);
            if (dx < 0 && idx < DAYS.length - 1) {
                setDay(DAYS[idx + 1].key);
                setExpanded(null);
            }
            else if (dx > 0 && idx > 0) {
                setDay(DAYS[idx - 1].key);
                setExpanded(null);
            }
        }
    };
    const [profViewMode, setProfViewMode] = useState("edit"); // "edit" | "aula" — modo edição de ficha vs. modo aula (personal registra pelo próprio celular)
    const [pickTpl, setPickTpl] = useState(false);
    const [savingTpl, setSavingTpl] = useState(false);
    const [tplName, setTplName] = useState("");
    const [nStudent, setNStudent] = useState("");
    const [addStudentOpen, setAddStudentOpen] = useState(false);
    const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [form, setForm] = useState({ name: "", sets: "3", reps: "10", load: "", rest: "", note: "", url: "", catalogId: "" });
    const [pickLib, setPickLib] = useState(false);
    const [libFilter, setLibFilter] = useState("");
    const [celebration, setCelebration] = useState(null);
    // Trava da comemoração de recorde: o campo de carga salva sozinho a cada toque no +/- e a cada
    // 800ms de digitação (auto-save), sempre comparando com o melhor histórico. Sem essa trava, ajustar
    // o peso aos poucos (20 -> 21 -> 22 -> 23) reabre a animação em TELA CHEIA a cada toque, porque cada
    // valor novo já é "recorde" em relação ao histórico — o que trava o aluno numa sequência infinita de
    // comemorações e nunca deixa alcançar o botão "Finalizar Treino" embaixo. Só comemora uma vez por
    // exercício por dia; some sozinha quando o dia muda (é só um Set em memória, não precisa persistir).
    const celebratedRef = React.useRef(new Set());
    // trava contra ressurreição: se um removeStudent já rodou pra esse id, nenhum sync em voo (que
    // capturou um `next` de ANTES da remoção, num closure antigo) pode mais recriar a linha dele na
    // nuvem — sem isso, deletar e a nuvem "trazer de volta" segundos depois é uma corrida real, não
    // acidente raro: syncStudentToCloud e o merge de fetchAllStudentsAfterAuth checam este Set.
    const deletedStudentIdsRef = React.useRef(new Set());
    const [workoutStart, setWorkoutStart] = useState(null); // marcado sozinho na 1ª série do dia — sem botão, sem cronômetro visível
    const [pseModal, setPseModal] = useState(null);
    const [cardioForm, setCardioForm] = useState({ activity: "", minutes: "" });
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [shareCard, setShareCard] = useState(null);
    const [logoCard, setLogoCard] = useState(false);
    const [assessmentJustDone, setAssessmentJustDone] = useState(false);
    const [alunoTab, setAlunoTab] = useState("treino");
    const [dayEntryOpen, setDayEntryOpen] = useState(false);
    const [diaryMonth, setDiaryMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
    const changeDiaryMonth = (dir) => setDiaryMonth((m) => { let month = m.month + dir, year = m.year; if (month < 0) {
        month = 11;
        year -= 1;
    }
    else if (month > 11) {
        month = 0;
        year += 1;
    } return { year, month }; });
    const [loadingRoster, setLoadingRoster] = useState(false);
    const cloudSynced = useDataStore((s) => s.cloudSynced); // true = última gravação chegou na nuvem; false = só ficou salva localmente por enquanto
    const setCloudSynced = useDataStore((s) => s.setCloudSynced);
    const localFull = useDataStore((s) => s.localFull); // true = localStorage estourou a cota (ver saveLocal) — rede de segurança offline caiu
    const setLocalFull = useDataStore((s) => s.setLocalFull);
    const [isStandalone, setIsStandalone] = useState(true); // assume true até checar, pra não piscar o banner em quem já instalou
    const [typingActive, setTypingActive] = useState(false);
    useEffect(() => {
        const isField = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
        const onFocusIn = (e) => { if (isField(e.target)) setTypingActive(true); };
        const onFocusOut = (e) => { if (isField(e.target)) setTimeout(() => { const a = document.activeElement; if (!isField(a)) setTypingActive(false); }, 60); };
        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => { document.removeEventListener("focusin", onFocusIn); document.removeEventListener("focusout", onFocusOut); };
    }, []);
    useEffect(() => {
        try {
            setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
        }
        catch (e) { }
    }, []);
    const [loadTick, setLoadTick] = useState(0);
    useEffect(() => {
        (async () => {
            setReady(false);
            // se a nuvem responder depois (em segundo plano) com algo mais novo que o local, atualiza a tela sozinho
            window.__cancioCloudNewer = (cloud) => setData(cloud);
            const d = await loadData(); // sempre volta na hora — é o localStorage, nunca espera rede
            setData(d || seed());
            setReady(true);
        })();
    }, [loadTick]);
    // O salvamento local continua automático (rede de segurança offline-first do Sprint 7 — nada
    // a ver com o problema de race condition, que era especificamente sobre a NUVEM ser um único
    // registro compartilhado). A nuvem agora é 100% imperativa: cada função que muda algo já chama
    // syncGlobalToCloud/syncStudentToCloud sozinha, no momento exato da mudança — não existe mais
    // um efeito genérico observando `data` inteiro pra decidir o que sincronizar.
    // throttle real (não debounce) no salvamento local: teto de 1 escrita/1.2s mesmo sob mutação
    // contínua (ex.: auto-save de carga/reps a cada 800ms), sem atrasar indefinidamente o pior caso
    const throttledSaveLocalRef = React.useRef(null);
    if (!throttledSaveLocalRef.current) {
        throttledSaveLocalRef.current = throttle((d) => { const r = saveLocal(d); setLocalFull(!r.ok); }, 1200);
    }
    useEffect(() => {
        if (!ready || !data)
            return;
        if (data.isSeed)
            return; // Trava Mestra: dado de exemplo nunca é persistido, nem local nem na nuvem
        throttledSaveLocalRef.current(data);
    }, [data, ready]);
    const students = data?.students || [];
    const templates = data?.templates || [];
    const messages = data?.messages || [];
    const library = data?.library || [];
    const soundOn = data ? data.soundOn !== false : true;
    const profId = data?.activeStudentId;
    // salvamento agora é imperativo e granular — cada função avisa explicitamente o que mudou,
    // em vez de um efeito genérico observar `data` inteiro e decidir sozinho o que sincronizar
    // useCallback aqui não é só micro-otimização: são a base de que addLoad/updateExercise/etc.
    // dependem — sem serem estáveis, nenhum React.memo nos cards de exercício segura nada.
    const syncGlobalToCloud = React.useCallback((next) => { saveGlobalToCloud(splitGlobalForCloud(next)).then((ok) => setCloudSynced(ok !== false)); }, []);
    const syncStudentToCloud = React.useCallback((next, sid) => {
        if (deletedStudentIdsRef.current.has(sid))
            return; // aluno removido — não deixa um sync atrasado (snapshot de antes da remoção) recriar a linha
        const student = (next.students || []).find((s) => s.id === sid);
        if (!student)
            return;
        const payload = splitStudentForCloud(next, student);
        // aluno nunca autentica -> grava só através da Edge Function, que confere o código antes de
        // tocar no banco. professor autentica de verdade -> continua indo direto pra tabela (RLS cobre).
        const p = role === "aluno"
            ? callStudentApi("sync", { code: student.code, data: payload }).then(() => true).catch((e) => { console.error("Cancio: falha ao sincronizar aluno (edge function):", e); return false; })
            : saveStudentToCloud(payload, next.isSeed);
        p.then((ok) => setCloudSynced(ok !== false));
    }, [role]);
    // Auto-Sync Agressivo: se o aluno anotou carga e fechou o app / perdeu sinal antes do
    // syncStudentToCloud imperativo terminar, o dado fica só no localStorage (cloudSynced=false).
    // Aqui a gente fica de olho pra reagir assim que a rede ou a tela voltarem, sem esperar o
    // aluno mexer em mais nada — sem isso, a pendência só sairia do aparelho na próxima vez
    // que algo mudasse de novo, o que pode nunca acontecer se ele não voltar a treinar.
    useEffect(() => {
        const forceSync = () => { if (!cloudSynced && role === "aluno" && alunoId && data)
            syncStudentToCloud(data, alunoId); };
        const onVisible = () => { if (document.visibilityState === "visible")
            forceSync(); };
        window.addEventListener("online", forceSync);
        document.addEventListener("visibilitychange", onVisible);
        return () => { window.removeEventListener("online", forceSync); document.removeEventListener("visibilitychange", onVisible); };
    }, [cloudSynced, role, alunoId, data]);
    // se o app for fechado/recarregado com uma edição de carga/reps ainda só local (dentro da
    // janela do debounce), descarrega tudo imediatamente antes de sair
    useEffect(() => {
        const onUnload = () => flushAllPendingSaves();
        window.addEventListener("beforeunload", onUnload);
        window.addEventListener("pagehide", onUnload);
        return () => { window.removeEventListener("beforeunload", onUnload); window.removeEventListener("pagehide", onUnload); };
    }, []);
    // sessão do professor persistida: se já tiver uma sessão válida do login anterior, pula a
    // tela de senha direto (evita digitar de novo toda vez que reabrir o app)
    useEffect(() => {
        if (!sb)
            return;
        (async () => {
            try {
                const { data: sessionData } = await sb.auth.getSession();
                if (sessionData && sessionData.session) {
                    setProfUnlocked(true);
                    fetchAllStudentsAfterAuth();
                }
            }
            catch (e) {
                console.error("Cancio: falha ao restaurar sessão do professor:", e);
            }
        })();
    }, []);
    // REMOVIDO: efeito de sincronização automática no boot (disparava toda vez que alunoId mudava,
    // inclusive só abrindo o app pra espiar o treino do dia, criando sessões fantasmas vazias no
    // painel do professor). Os únicos gatilhos de envio pra nuvem agora são ações reais do aluno:
    // registrar carga/reps (addLoad, chamado pelo PressStep) e finalizar o treino (finalizeWorkout).
    // O reengate de conexão (useEffect logo acima, "online") continua — esse só tenta de novo uma
    // sincronização que já tinha sido de fato disparada por uma ação e falhou por falta de internet.
    const setActive = (id) => setData((p) => { const next = { ...p, activeStudentId: id }; syncGlobalToCloud(next); return next; });
    const toggleSound = () => setData((p) => { const next = { ...p, soundOn: !(p.soundOn !== false) }; syncGlobalToCloud(next); return next; });
    const addStudent = () => { const name = nStudent.trim(); if (!name)
        return; const id = uid(); let code = genCode(); const taken = new Set(students.map((s) => s.code)); while (taken.has(code))
        code = genCode(); setData((p) => { const next = { ...p, activeStudentId: id, students: [...p.students, { id, name, code }], workouts: { ...p.workouts, [id]: emptyWeek() }, checkins: { ...(p.checkins || {}), [id]: [] } }; syncGlobalToCloud(next); syncStudentToCloud(next, id); return next; }); setNStudent(""); };
    const removeStudent = (id) => { deletedStudentIdsRef.current.add(id); setData((p) => { const st = p.students.filter((s) => s.id !== id); const w = { ...p.workouts }; delete w[id]; const ch = { ...(p.checkins || {}) }; delete ch[id]; const ar = { ...(p.archives || {}) }; delete ar[id]; const msgs = (p.messages || []).filter((m) => m.studentId !== id); const active = p.activeStudentId === id ? (st[0]?.id ?? null) : p.activeStudentId; const next = { ...p, students: st, workouts: w, checkins: ch, archives: ar, messages: msgs, activeStudentId: active }; syncGlobalToCloud(next); deleteStudentFromCloud(id); return next; }); };
    const updateStudent = (id, patch) => setData((p) => { const next = { ...p, students: p.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }; syncStudentToCloud(next, id); return next; });
    const updateDayName = (sid, dk, name) => setData((p) => { const dn = { ...(p.dayNames || {}) }; const sd = { ...(dn[sid] || {}) }; if (name)
        sd[dk] = name;
    else
        delete sd[dk]; dn[sid] = sd; const next = { ...p, dayNames: dn }; syncStudentToCloud(next, sid); return next; });
    const toggleCardio = (sid, dk) => setData((p) => { const cd = { ...(p.cardio || {}) }; const sc = { ...(cd[sid] || {}) }; if (sc[dk])
        delete sc[dk];
    else
        sc[dk] = true; cd[sid] = sc; const next = { ...p, cardio: cd }; syncStudentToCloud(next, sid); return next; });
    const addLibrary = (name, url, tag) => setData((p) => { const next = { ...p, library: [...(p.library || []), { id: uid(), name, url: url || "", tag: tag || "" }] }; syncGlobalToCloud(next); return next; });
    const updateLibrary = (id, patch) => setData((p) => { const next = { ...p, library: (p.library || []).map((e) => (e.id === id ? { ...e, ...patch } : e)) }; syncGlobalToCloud(next); return next; });
    const removeLibrary = (id) => setData((p) => { const next = { ...p, library: (p.library || []).filter((e) => e.id !== id) }; syncGlobalToCloud(next); return next; });
    const focusId = role === "prof" ? profId : alunoId;
    // antes recalculavam em TODO render (inclusive digitação num campo sem relação nenhuma com
    // treino) — computeRecords/buildDiary varrem o histórico inteiro do aluno, então memoizar por
    // [data, focusId] evita esse custo sempre que a causa do render não foi uma mudança de dado
    const week = React.useMemo(() => (data?.workouts && data.workouts[focusId]) || emptyWeek(), [data, focusId]);
    const records = React.useMemo(() => computeRecords(week), [week]);
    const diary = React.useMemo(() => buildDiary(data, focusId), [data, focusId]);
    const list = week[day] || [];
    // `day` escolhe QUAL lista de exercícios usar (o treino sugerido pro dia, definido pelo
    // professor) — mas o registro em si (série, check-in, volume, sessão) sempre cai na data real
    // de hoje, não numa data "teórica" do dia da semana escolhido. Se o treino de terça acaba sendo
    // feito numa quinta, grava na quinta mesmo. Por isso dayDate é sempre todayISO(), não
    // dateForWeekday(day) — o nome ficou do jeito que já é usado em cascata (ExerciseCard,
    // finalizeWorkout, checkInTodayFor, addCardio, toggleRecovery, hasSetOnDay/...).
    const dayDate = todayISO();
    const dayFull = DAYS.find((d) => d.key === day).full;
    const cardioFocus = (data?.cardio && data.cardio[focusId]) || {};
    const dayName = (data?.dayNames && data.dayNames[focusId] && data.dayNames[focusId][day]) || "";
    const cardioOn = !!cardioFocus[day];
    const focusCheckins = (data?.checkins && data.checkins[focusId]) || [];
    const checkinSet = new Set(focusCheckins);
    const trainingWeekdays = trainingWds(week, data?.cardio && data.cardio[focusId]);
    const streak = computeStreak(trainingWeekdays, checkinSet);
    const freqTotal = focusCheckins.length;
    const freqWeek = focusCheckins.filter(isWithin7).length;
    const bestStreak = Math.max((data?.bestStreak && data.bestStreak[focusId]) || 0, streak);
    // a cor/"patente" das celebrações e do ShareCard vem do total de treinos (freqTotal), não mais
    // da sequência de dias seguidos — um número que só sobe, nunca "quebra" (ver streakTier)
    const tier = streakTier(freqTotal);
    const todayKey = JS2KEY[new Date().getDay()];
    const todayIsTraining = (week[todayKey] || []).length > 0;
    const focusSessions = (data?.sessions && data.sessions[focusId]) || [];
    // checkinSet.has(dayDate) sozinho não serve mais: dayDate é sempre hoje, então isso ficaria
    // true pra TODOS os dias assim que qualquer um fosse finalizado hoje — escolher outro treino
    // pra fazer em seguida no mesmo dia já aparecia como "concluído" sem nada registrado nele.
    // sessions guarda {date, day} por registro — confere se ESSE slot específico (o `day` da aba
    // aberta) já foi finalizado hoje, não só se algum foi.
    const dayDone = focusSessions.some((s) => s.date === dayDate && s.day === day);
    const todayDayName = (data?.dayNames && data.dayNames[focusId] && data.dayNames[focusId][todayKey]) || "";
    const todayCardioOn = !!cardioFocus[todayKey];
    const greetWord = greeting(focusId, todayIsTraining);
    const greetLine = pickDailyPhrase(todayIsTraining ? TRAIN_PHRASES : REST_PHRASES, todayISO() + focusId);
    // mapa de calor da semana atual (segunda a domingo) — visão rápida do esforço da semana
    const weekHeatDates = (() => {
        const now = new Date();
        const dow = now.getDay();
        const mondayOffset = dow === 0 ? -6 : 1 - dow;
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() + mondayOffset);
        return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return isoOf(d); });
    })();
    const heatDayStatus = (dt) => {
        const hasActivity = checkinSet.has(dt) || focusCardioLog.some((c) => c.date === dt) || !!(focusRecoveryLog[dt] && (focusRecoveryLog[dt].hydration || focusRecoveryLog[dt].sleep || focusRecoveryLog[dt].mobility));
        if (hasActivity)
            return "done";
        if (dt > todayISO())
            return "future";
        if (dt === todayISO())
            return "today";
        return "missed";
    };
    // Salva-Vidas: 3 por mês, pra "perdoar" um dia perdido sem zerar a sequência de verdade
    const curMonth = new Date().toISOString().slice(0, 7);
    const freezeInfo = (data?.freezes && data.freezes[focusId] && data.freezes[focusId].month === curMonth) ? data.freezes[focusId] : { month: curMonth, used: 0 };
    const freezesLeft = Math.max(0, 3 - freezeInfo.used);
    const studentStats = (sid) => { const wk = (data.workouts && data.workouts[sid]) || emptyWeek(); const ch = (data.checkins && data.checkins[sid]) || []; const twd = trainingWds(wk, data.cardio && data.cardio[sid]); return { streak: computeStreak(twd, new Set(ch)), week: ch.filter(isWithin7).length, total: ch.length, last: lastCheckinLabel(ch) }; };
    const lastEffortFor = (sid) => { const sess = (data.sessions && data.sessions[sid]) || []; const withEffort = sess.filter((x) => x.effort); return withEffort.length ? withEffort[withEffort.length - 1].effort : null; };
    const todayKeyGlobal = JS2KEY[new Date().getDay()];
    const todayRoster = students.map((s) => {
        const wk = (data.workouts && data.workouts[s.id]) || emptyWeek();
        const todaysList = wk[todayKeyGlobal] || [];
        const cardioMarked = !!(data.cardio && data.cardio[s.id] && data.cardio[s.id][todayKeyGlobal]);
        if (todaysList.length === 0 && !cardioMarked)
            return null;
        const dn = (data.dayNames && data.dayNames[s.id] && data.dayNames[s.id][todayKeyGlobal]) || (todaysList.length ? `${todaysList.length} exercício${todaysList.length > 1 ? "s" : ""}` : "Cardio");
        const done = ((data.checkins && data.checkins[s.id]) || []).includes(todayISO());
        return { id: s.id, name: s.name, workoutName: dn, done, effort: lastEffortFor(s.id), clinicalAlert: s.clinicalAlert };
    }).filter(Boolean);
    const unread = messages.filter((m) => !m.read).length;
    const archives = (data?.archives && data.archives[profId]) || [];
    // mesma lógica do dayDone: casa por (date, day) pra achar a sessão DESSE slot hoje, não a
    // última sessão de qualquer slot hoje
    const daySession = focusSessions.filter((s) => s.date === dayDate && s.day === day).slice(-1)[0];
    const lastProfSession = (((data?.sessions && data.sessions[profId]) || [])).slice(-1)[0];
    const profSessions = (data?.sessions && data.sessions[profId]) || [];
    const focusCardioLog = (data?.cardioLog && data.cardioLog[focusId]) || [];
    // os quatro abaixo eram todos `=== todayISO()`: certo pra aba de hoje, mas isso é o que fazia o
    // app "não contar" nada registrado numa aba de outro dia (ver dayDate) — sets ficavam gravados
    // certinho, só não apareciam pra ninguém, inclusive pro próprio botão de finalizar.
    const dayCardioEntries = focusCardioLog.filter((c) => c.date === dayDate);
    const hasCardioOnDay = dayCardioEntries.length > 0;
    const hasSetOnDay = list.some((ex) => sortedHistory(ex.history).some((h) => h.date === dayDate));
    const focusRecoveryLog = (data?.recoveryLog && data.recoveryLog[focusId]) || {};
    const dayRecovery = focusRecoveryLog[dayDate] || { hydration: false, sleep: false, mobility: false };
    const hasRecoveryOnDay = !!(dayRecovery.hydration || dayRecovery.sleep || dayRecovery.mobility);
    const hasLoggedSomething = hasSetOnDay || hasCardioOnDay || hasRecoveryOnDay;
    const isRestDay = list.length === 0 && !hasCardioOnDay && hasRecoveryOnDay;
    const buildWeeklySummary = () => {
        let weeklyVolume = 0;
        DAYS.forEach((d) => {
            (week[d.key] || []).forEach((ex) => {
                ex.history.forEach((h) => {
                    if (isWithin7(h.date))
                        weeklyVolume += daySummary(h).volume;
                });
            });
        });
        const weeklyTimeSec = focusSessions.filter((s) => isWithin7(s.date) && s.durationSec).reduce((acc, s) => acc + s.durationSec, 0);
        const hours = Math.floor(weeklyTimeSec / 3600);
        const mins = Math.round((weeklyTimeSec % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
        setShareCard({ isWeeklySummary: true, name: focusStudent.name, freqWeek, streak, tint: tier.tint, dateLabel: "Nesta semana", weeklyVolume, weeklyTime: timeStr });
    };
    const addExercise = () => { const name = form.name.trim(); if (!name || !focusId)
        return; const loadN = parseFloat(String(form.load).replace(",", ".")); const restN = parseInt(form.rest); const ex = { id: uid(), name, sets: parseInt(form.sets) || 1, reps: form.reps || "1", rest: isNaN(restN) ? undefined : restN, note: form.note.trim() || undefined, url: form.url.trim() || undefined, catalogId: form.catalogId || undefined, setPlan: defaultSetPlan(form.sets, form.reps), history: isNaN(loadN) ? [] : [{ date: dayDate, load: loadN }] }; setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; w[day] = [...(w[day] || []), ex]; const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }); setForm({ name: "", sets: "3", reps: "10", load: "", rest: "", note: "", url: "", catalogId: "" }); setAdding(false); setPickLib(false); setExpanded(ex.id); };
    // marca o início do treino sozinho, na 1ª série do dia — sem botão, sem cronômetro visível (só guarda o horário pra calcular a duração depois)
    const markWorkoutStarted = React.useCallback(() => {
        if (workoutStart && workoutStart.studentId === focusId && workoutStart.date === todayISO())
            return;
        const s = { studentId: focusId, date: todayISO(), startedAt: Date.now() };
        setWorkoutStart(s);
        try {
            localStorage.setItem(SESS_KEY, JSON.stringify(s));
        }
        catch (e) { }
    }, [workoutStart, focusId]);
    const addLoad = React.useCallback((exId, entry) => {
        if (role === "aluno")
            markWorkoutStarted();
        let cel = null;
        setData((p) => {
            const w = { ...p.workouts[focusId] };
            w[day] = w[day].map((e) => {
                if (e.id !== exId)
                    return e;
                const hist = e.history.map((h) => ({ ...h, entries: h.entries ? [...h.entries] : h.entries }));
                const idx = hist.findIndex((h) => h.date === entry.date && Array.isArray(h.entries));
                const priorSummaries = hist.filter((_, k) => k !== idx).map(daySummary);
                const priorLoads = priorSummaries.map((s) => s.load).filter((v) => typeof v === "number");
                const maxLoad = priorLoads.length ? Math.max(...priorLoads) : null;
                const priorReps = priorSummaries.map((s) => s.reps).filter((v) => typeof v === "number");
                const maxReps = priorReps.length ? Math.max(...priorReps) : null;
                const todayEntry = idx >= 0 ? hist[idx] : { date: entry.date, entries: [] };
                const setIdx = todayEntry.entries.findIndex((se) => se.setId === entry.setId);
                const newSetEntry = { setId: entry.setId, kind: entry.kind, targetReps: entry.targetReps, load: entry.load, reps: entry.reps };
                if (setIdx >= 0)
                    todayEntry.entries[setIdx] = newSetEntry;
                else
                    todayEntry.entries.push(newSetEntry);
                if (idx >= 0)
                    hist[idx] = todayEntry;
                else
                    hist.push(todayEntry);
                const celKey = `${exId}|${entry.date}`;
                if (entry.checkPR && !NON_COUNTING_KINDS.has(entry.kind) && !celebratedRef.current.has(celKey)) {
                    if (maxLoad != null && entry.load > maxLoad) {
                        cel = { kind: "load", name: e.name, value: `${entry.load} kg` };
                        celebratedRef.current.add(celKey);
                    }
                    else if (typeof entry.reps === "number" && maxReps != null && entry.reps > maxReps) {
                        cel = { kind: "reps", name: e.name, value: `${entry.reps} reps` };
                        celebratedRef.current.add(celKey);
                    }
                }
                return { ...e, history: sortedHistory(hist) };
            });
            const next = { ...p, workouts: { ...p.workouts, [focusId]: w } };
            syncStudentToCloud(next, focusId);
            return next;
        });
        if (cel) {
            haptic("record");
            if (cel.kind === "load")
                setCelebration({ title: "NOVO RECORDE", subtitle: cel.name, value: cel.value, accent: "#FFFFFF", tint: "#FFFFFF", sound: soundOn ? playDisco : null });
            else
                setCelebration({ title: "RECORDE DE REPS", subtitle: cel.name, value: cel.value, accent: "#C7C7CC", tint: "#C7C7CC", sound: soundOn ? playDisco : null });
        }
    }, [role, focusId, day, syncStudentToCloud, soundOn, markWorkoutStarted]);
    // nota do aluno específica daquele exercício naquele dia — some junto com o registro de séries, o professor vê no histórico
    const updateExerciseNote = React.useCallback((exId, dateStr, note) => {
        setData((p) => {
            const w = { ...p.workouts[focusId] };
            w[day] = w[day].map((e) => {
                if (e.id !== exId)
                    return e;
                const hist = e.history.map((h) => ({ ...h }));
                const idx = hist.findIndex((h) => h.date === dateStr && Array.isArray(h.entries));
                if (idx >= 0)
                    hist[idx] = { ...hist[idx], studentNote: note };
                else
                    hist.push({ date: dateStr, entries: [], studentNote: note });
                return { ...e, history: sortedHistory(hist) };
            });
            const next = { ...p, workouts: { ...p.workouts, [focusId]: w } };
            syncStudentToCloud(next, focusId);
            return next;
        });
    }, [focusId, day, syncStudentToCloud]);
    const removeExercise = React.useCallback((exId) => setData((p) => { const w = { ...p.workouts[focusId] }; w[day] = w[day].filter((e) => e.id !== exId); const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }), [focusId, day, syncStudentToCloud]);
    const updateExercise = React.useCallback((exId, patch) => setData((p) => { const w = { ...p.workouts[focusId] }; w[day] = w[day].map((e) => (e.id === exId ? { ...e, ...patch } : e)); const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }), [focusId, day, syncStudentToCloud]);
    // vínculo em lote da aba Volume (redesign estético 4, item 9): mexe num exercício de QUALQUER
    // dia da semana do aluno que o professor está vendo, não só no dia aberto no momento — por
    // isso recebe o `day` por parâmetro em vez de usar o `day` do estado (que é só o dia na tela).
    const patchExerciseInDay = React.useCallback((studentId, exDay, exId, patch) => setData((p) => { const w = { ...p.workouts[studentId] }; w[exDay] = (w[exDay] || []).map((e) => (e.id === exId ? { ...e, ...patch } : e)); const next = { ...p, workouts: { ...p.workouts, [studentId]: w } }; syncStudentToCloud(next, studentId); return next; }), [syncStudentToCloud]);
    const applyBulkCatalogLinks = React.useCallback((studentId, links) => setData((p) => {
        const w = { ...p.workouts[studentId] };
        const byDay = {};
        links.forEach((l) => { (byDay[l.day] = byDay[l.day] || []).push(l); });
        Object.keys(byDay).forEach((d) => { w[d] = (w[d] || []).map((e) => { const l = byDay[d].find((x) => x.id === e.id); return l ? { ...e, catalogId: l.catalogId } : e; }); });
        const next = { ...p, workouts: { ...p.workouts, [studentId]: w } };
        syncStudentToCloud(next, studentId);
        return next;
    }), [syncStudentToCloud]);
    const deleteRecord = React.useCallback((exId, historyItem) => setData((p) => { const w = { ...p.workouts[focusId] }; w[day] = w[day].map((e) => (e.id === exId ? { ...e, history: e.history.filter((x) => x !== historyItem) } : e)); const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }), [focusId, day, syncStudentToCloud]);
    const moveExercise = React.useCallback((exId, dir) => setData((p) => { const w = { ...p.workouts[focusId] }; const arr = [...(w[day] || [])]; const i = arr.findIndex((e) => e.id === exId); const j = i + dir; if (i < 0 || j < 0 || j >= arr.length)
        return p; [arr[i], arr[j]] = [arr[j], arr[i]]; w[day] = arr; const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }), [focusId, day, syncStudentToCloud]);
    const applyTemplate = (tpl, targetDay) => { setData((p) => { const w = { ...(p.workouts[profId] || emptyWeek()) }; const adds = tpl.exercises.map((e) => ({ id: uid(), name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, setPlan: (e.setPlan && e.setPlan.length ? e.setPlan : defaultSetPlan(e.sets, e.reps)).map((s) => ({ ...s, id: uidShort() })), history: [] })); w[targetDay] = [...(w[targetDay] || []), ...adds]; const dn = { ...(p.dayNames || {}) }; const sd = { ...(dn[profId] || {}) }; sd[targetDay] = tpl.name; dn[profId] = sd; const next = { ...p, workouts: { ...p.workouts, [profId]: w }, dayNames: dn }; syncStudentToCloud(next, profId); return next; }); };
    const saveDayAsTemplate = () => { const name = tplName.trim(); const exs = (week[day] || []).map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, setPlan: e.setPlan })); if (!name || !exs.length)
        return; setData((p) => { const next = { ...p, templates: [...(p.templates || []), { id: uid(), name, exercises: exs }] }; syncGlobalToCloud(next); return next; }); setTplName(""); setSavingTpl(false); };
    const addTemplate = (name, exs) => setData((p) => { const next = { ...p, templates: [...(p.templates || []), { id: uid(), name, exercises: exs }] }; syncGlobalToCloud(next); return next; });
    const deleteTemplate = (id) => setData((p) => { const next = { ...p, templates: (p.templates || []).filter((t) => t.id !== id) }; syncGlobalToCloud(next); return next; });
    const archiveWorkout = () => { const label = archLabel.trim() || `Treino ${fmtDate(todayISO())}`; const snap = JSON.parse(JSON.stringify((data.workouts && data.workouts[profId]) || emptyWeek())); setData((p) => { const next = { ...p, archives: { ...(p.archives || {}), [profId]: [...(((p.archives || {})[profId]) || []), { id: uid(), label, date: new Date().toISOString(), week: snap }] } }; syncStudentToCloud(next, profId); return next; }); setArchLabel(""); };
    const restoreArchive = (arc) => { const wk = JSON.parse(JSON.stringify(arc.week)); DAYS.forEach((d) => (wk[d.key] || []).forEach((e) => { e.id = uid(); })); setData((p) => { const next = { ...p, workouts: { ...p.workouts, [profId]: wk } }; syncStudentToCloud(next, profId); return next; }); };
    const deleteArchive = (id) => setData((p) => { const next = { ...p, archives: { ...(p.archives || {}), [profId]: (((p.archives || {})[profId]) || []).filter((a) => a.id !== id) } }; syncStudentToCloud(next, profId); return next; });
    // nome ficou de antes de aceitar uma data explícita — hoje também cobre o check-in de um dia
    // atrasado (ver dayDate), não só "hoje" no sentido literal
    const checkInTodayFor = (p, sid, dt) => {
        const t = dt || todayISO();
        const cur = (p.checkins && p.checkins[sid]) || [];
        const checkins = cur.includes(t) ? cur : [...cur, t];
        const wk = (p.workouts && p.workouts[sid]) || emptyWeek();
        const twd = trainingWds(wk, p.cardio && p.cardio[sid]);
        const ns = computeStreak(twd, new Set(checkins));
        const nb = Math.max((p.bestStreak && p.bestStreak[sid]) || 0, ns);
        return { checkins: { ...(p.checkins || {}), [sid]: checkins }, bestStreak: { ...(p.bestStreak || {}), [sid]: nb } };
    };
    const addCardio = (activity, minutes) => {
        const act = activity.trim();
        const min = parseInt(minutes);
        if (!act || isNaN(min) || min <= 0)
            return;
        markWorkoutStarted();
        setData((p) => { const cl = { ...(p.cardioLog || {}) }; const list = [...(cl[focusId] || [])]; list.push({ id: uid(), date: dayDate, activity: act, minutes: min }); cl[focusId] = list; const next = { ...p, cardioLog: cl }; syncStudentToCloud(next, focusId); return next; });
        setCardioForm({ activity: "", minutes: "" });
    };
    // recuperação ativa (dias sem treino de força): 3 marcações simples do dia, guardadas por data — igual ao espírito do cardioLog
    const toggleRecovery = (key) => {
        markWorkoutStarted();
        setData((p) => {
            const rl = { ...(p.recoveryLog || {}) };
            const forId = { ...(rl[focusId] || {}) };
            const today = { ...(forId[dayDate] || { hydration: false, sleep: false, mobility: false }) };
            today[key] = !today[key];
            forId[dayDate] = today;
            rl[focusId] = forId;
            const next = { ...p, recoveryLog: rl };
            syncStudentToCloud(next, focusId);
            return next;
        });
    };
    // Salva-Vidas: "perdoa" o dia perdido injetando o check-in de ontem, sem exceder 3 por mês
    const useFreeze = () => {
        if (freezesLeft <= 0)
            return;
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yIso = isoOf(y);
        setData((p) => {
            const fz = { ...(p.freezes || {}) };
            const cur = (fz[focusId] && fz[focusId].month === curMonth) ? fz[focusId] : { month: curMonth, used: 0 };
            fz[focusId] = { month: curMonth, used: cur.used + 1 };
            const ch = { ...(p.checkins || {}) };
            const list = ch[focusId] || [];
            if (!list.includes(yIso))
                ch[focusId] = [...list, yIso];
            const next = { ...p, freezes: fz, checkins: ch };
            syncStudentToCloud(next, focusId);
            return next;
        });
    };
    const finalizeWorkout = (effort) => {
        try { Object.keys(sessionStorage).filter((k) => k.indexOf("cancio:rt:") === 0).forEach((k) => sessionStorage.removeItem(k)); } catch (e) { }
        setActiveSet(null);
        const sid = uid();
        const isRest = effort === "descanso";
        // o cronômetro de sessão (workoutStart) mede tempo real de telefone na mão — só faz sentido
        // como "duração do treino" quando o dia sendo finalizado é hoje mesmo. Registrando um treino
        // atrasado (dayDate de outro dia), o tempo decorrido é só "quanto levei digitando agora", e
        // mostrar isso como duração do treino é o que parecia "bugado, tipo em segundos".
        const isToday = dayDate === todayISO();
        const durationSec = isToday && workoutStart && workoutStart.studentId === focusId && workoutStart.date === todayISO() ? Math.max(1, Math.round((Date.now() - workoutStart.startedAt) / 1000)) : null;
        const sWorkoutName = dayName || dayFull;
        const sStreak = computeStreak(trainingWeekdays, new Set([...focusCheckins, dayDate]));
        // daySummary já lida com os dois formatos de histórico (achatado antigo / entries novo) —
        // acessar h.entries direto quebra em qualquer registro que ainda esteja no formato antigo.
        // Filtra por dayDate (o dia sendo finalizado), não por hoje — senão um treino atrasado fecha
        // mostrando 0kg porque procurou o volume na data errada.
        const totalVolume = list.reduce((sum, e) => {
            const h = (e.history || []).find((hh) => hh.date === dayDate);
            if (!h)
                return sum;
            return sum + daySummary(h).volume;
        }, 0);
        setData((p) => {
            const sess = { ...(p.sessions || {}) };
            sess[focusId] = [...(sess[focusId] || []), { id: sid, date: dayDate, day, durationSec, effort }];
            const next = { ...p, sessions: sess, ...checkInTodayFor(p, focusId, dayDate) };
            syncStudentToCloud(next, focusId);
            return next;
        });
        setWorkoutStart(null);
        try {
            localStorage.removeItem(SESS_KEY);
        }
        catch (e) { }
        setPseModal(null);
        const shareData = { name: focusStudent.name, workoutName: sWorkoutName, durationLabel: durationSec ? fmtDur(durationSec) : "—", dateLabel: fmtDate(dayDate), targetDate: dayDate, streak: sStreak, tint: tier.tint, isRestDay: isRest, exercises: list.map((e) => ({ id: e.id, name: e.name, history: e.history, sets: e.sets, setPlan: e.setPlan })) };
        if (isRest) {
            setCelebration({ title: "RITMO MANTIDO", subtitle: `Descanso também é treino, ${focusStudent.name}!`, value: "", accent: C.amber, tint: C.amber, seal: true, sound: soundOn ? playFinishChime : null, then: () => setShareCard(shareData) });
        }
        else {
            setCelebration({ title: "PISTA DOMINADA", subtitle: `Treino concluído, ${focusStudent.name}!`, value: durationSec ? fmtDur(durationSec) : effort, volumeLabel: totalVolume > 0 ? `${fmtVolume(totalVolume)} levantados no treino` : null, accent: C.amber, tint: C.amber, seal: true, sound: soundOn ? playFinishChime : null, then: () => setShareCard(shareData) });
        }
    };
    const submitFeedback = (sid, text) => setData((p) => { const sess = { ...(p.sessions || {}) }; sess[focusId] = (sess[focusId] || []).map((s) => (s.id === sid ? { ...s, feedback: text } : s)); const next = { ...p, sessions: sess }; syncStudentToCloud(next, focusId); return next; });
    const sendMessage = (text, sid) => setData((p) => { const next = { ...p, messages: [...(p.messages || []), { id: uid(), studentId: sid || focusId, text, date: new Date().toISOString(), read: false }] }; syncStudentToCloud(next, sid || focusId); return next; });
    const markRead = (id) => setData((p) => { const msg = (p.messages || []).find((m) => m.id === id); const next = { ...p, messages: (p.messages || []).map((m) => (m.id === id ? { ...m, read: true } : m)) }; if (msg)
        syncStudentToCloud(next, msg.studentId); return next; });
    const exportData = () => { try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cancio-backup-${todayISO()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    catch (e) { } };
    const importData = (file) => {
        if (!file)
            return;
        const r = new FileReader();
        r.onload = () => {
            try {
                const d = JSON.parse(r.result);
                const valid = d && Array.isArray(d.students) && d.students.every((s) => s && typeof s.id === "string" && typeof s.name === "string");
                if (!valid) {
                    alert("Arquivo de backup inválido — não foi possível restaurar.");
                    return;
                }
                // restaurar substitui TODOS os dados atuais (local e nuvem) — irreversível, por isso confirma antes
                if (!window.confirm(`Isso vai substituir todos os dados atuais por este backup (${d.students.length} aluno${d.students.length === 1 ? "" : "s"}). Não pode ser desfeito. Continuar?`))
                    return;
                delete d.isSeed;
                setData(d);
                saveGlobalToCloud(splitGlobalForCloud(d));
                d.students.forEach((s) => saveStudentToCloud(splitStudentForCloud(d, s)));
            }
            catch (e) {
                console.error("Cancio: falha ao importar backup:", e);
                alert("Não foi possível ler este arquivo como backup do Cancio Club.");
            }
        };
        r.readAsText(file);
    };
    // Restaurar 1 aluno específico (diferente de "Importar", que troca TUDO): lê um backup antigo,
    // mostra quem tem lá dentro, e junta só o aluno escolhido nos dados atuais — sem mexer em mais
    // ninguém. Existe porque "remover aluno" apaga na hora, sem confirmação, e é fácil de apertar
    // sem querer (o botão fica colado nos de "ficha"/"histórico").
    const [restorePicker, setRestorePicker] = useState(null); // { backup, candidates } | null
    const pickRestoreFile = (file) => {
        if (!file)
            return;
        const r = new FileReader();
        r.onload = () => {
            try {
                const d = JSON.parse(r.result);
                if (!d || !Array.isArray(d.students) || !d.students.length) {
                    alert("Esse arquivo não tem nenhum aluno pra restaurar.");
                    return;
                }
                setRestorePicker({ backup: d, candidates: d.students });
            }
            catch (e) {
                alert("Não foi possível ler este arquivo como backup do Cancio Club.");
            }
        };
        r.readAsText(file);
    };
    const restoreStudentFromBackup = (oldId) => {
        const backup = restorePicker && restorePicker.backup;
        const src = backup && (backup.students || []).find((s) => s.id === oldId);
        if (!src)
            return;
        const newId = uid();
        const taken = new Set(students.map((s) => s.code));
        let code = src.code;
        const codeChanged = !code || taken.has(code);
        if (codeChanged) {
            code = genCode();
            while (taken.has(code))
                code = genCode();
        }
        const restored = { ...src, id: newId, code };
        setData((p) => {
            const next = {
                ...p,
                students: [...p.students, restored],
                checkins: { ...(p.checkins || {}), [newId]: (backup.checkins && backup.checkins[oldId]) || [] },
                bestStreak: { ...(p.bestStreak || {}), [newId]: (backup.bestStreak && backup.bestStreak[oldId]) || 0 },
                archives: { ...(p.archives || {}), [newId]: (backup.archives && backup.archives[oldId]) || [] },
                sessions: { ...(p.sessions || {}), [newId]: (backup.sessions && backup.sessions[oldId]) || [] },
                dayNames: { ...(p.dayNames || {}), [newId]: (backup.dayNames && backup.dayNames[oldId]) || {} },
                cardio: { ...(p.cardio || {}), [newId]: (backup.cardio && backup.cardio[oldId]) || {} },
                cardioLog: { ...(p.cardioLog || {}), [newId]: (backup.cardioLog && backup.cardioLog[oldId]) || [] },
                recoveryLog: { ...(p.recoveryLog || {}), [newId]: (backup.recoveryLog && backup.recoveryLog[oldId]) || {} },
                freezes: { ...(p.freezes || {}), [newId]: (backup.freezes && backup.freezes[oldId]) || { month: "", used: 0 } },
                workouts: { ...(p.workouts || {}), [newId]: (backup.workouts && backup.workouts[oldId]) || emptyWeek() },
                messages: [...(p.messages || []), ...((backup.messages || []).filter((m) => m.studentId === oldId).map((m) => ({ ...m, studentId: newId })))],
            };
            syncGlobalToCloud(next);
            syncStudentToCloud(next, newId);
            return next;
        });
        setRestorePicker(null);
        alert(codeChanged ? `${src.name} restaurado(a) com um novo código: ${code} (o código antigo já estava em uso por outro aluno).` : `${src.name} restaurado(a) com o código original: ${code}.`);
    };
    const [loginBusy, setLoginBusy] = useState(false);
    // funde os dados de UM aluno vindos da nuvem no estado — usado tanto no login instantâneo
    // (checagem silenciosa em segundo plano) quanto no fallback de busca por código
    const mergeFoundStudentInto = (p, found) => {
        const others = (p.students || []).filter((x) => x.id !== found.id);
        // `found` é o payload completo salvo na nuvem (splitStudentForCloud): os campos "de perfil"
        // do aluno (name, goal, assessment, assessmentAt, e qualquer campo novo que a ficha ganhe no
        // futuro) espalhados no mesmo nível que as coleções agregadas (checkins, workouts...). Antes
        // isso era reconstruído com uma lista fixa de campos permitidos — que nunca foi atualizada
        // quando `assessment`/`assessmentAt` foram adicionados, então TODA vez que esse merge rodava
        // (o que é frequente: dispara no login do aluno sempre que a nuvem parece "mais nova" que o
        // registro local) a anamnese que o aluno tinha acabado de responder sumia do aparelho dele,
        // fazendo o gate reabrir. Em vez de manter essa lista à mão, espalha tudo e só tira de propósito
        // o que não pode ir pro aparelho do aluno (clinicalAlert, privado) e as coleções agregadas
        // (que já são tratadas nas linhas abaixo, com formato próprio).
        const { checkins, bestStreak, archives, sessions, dayNames, cardio, cardioLog, recoveryLog, freezes, workouts, messages, updatedAt, clinicalAlert, ...studentFields } = found;
        return {
            ...p,
            students: [...others, studentFields],
            checkins: { ...(p.checkins || {}), [found.id]: found.checkins || [] },
            bestStreak: { ...(p.bestStreak || {}), [found.id]: found.bestStreak || 0 },
            archives: { ...(p.archives || {}), [found.id]: found.archives || [] },
            sessions: { ...(p.sessions || {}), [found.id]: found.sessions || [] },
            dayNames: { ...(p.dayNames || {}), [found.id]: found.dayNames || {} },
            cardio: { ...(p.cardio || {}), [found.id]: found.cardio || {} },
            cardioLog: { ...(p.cardioLog || {}), [found.id]: found.cardioLog || [] },
            recoveryLog: { ...(p.recoveryLog || {}), [found.id]: found.recoveryLog || {} },
            freezes: { ...(p.freezes || {}), [found.id]: found.freezes || { month: "", used: 0 } },
            // mesmo raciocínio do Problema 2 (fetchAllStudentsAfterAuth): treino nunca escolhe um lado
            // só. Sem isso, um set registrado localmente segundos antes desse merge rodar podia ser
            // apagado por uma foto da nuvem que ainda não tinha recebido aquele set.
            workouts: { ...(p.workouts || {}), [found.id]: mergeWorkoutsForStudent((p.workouts && p.workouts[found.id]) || {}, found.workouts || {}) },
            messages: [...(p.messages || []).filter((m) => m.studentId !== found.id), ...(found.messages || [])],
        };
    };
    const doLogin = async () => {
        const code = codeInput.trim();
        if (!code)
            return;
        // primeiro tenta local — instantâneo e funciona offline, cobre o caso comum de "já uso esse aparelho"
        let s = students.find((x) => (x.code || "") === code);
        if (s && sb) {
            // achou local -> login não espera nada. Em paralelo, sem travar a tela, confere se a nuvem
            // tem algo mais novo desse aluno vindo de OUTRO aparelho (ex.: treinou no celular dele, e
            // este aqui é um tablet da academia usado antes) — só atualiza se a nuvem for de fato mais nova.
            (async () => {
                try {
                    const { data: found } = await callStudentApi("login", { code });
                    if (found)
                        setData((p) => ((found.updatedAt || 0) > (p.updatedAt || 0) ? mergeFoundStudentInto(p, found) : p));
                }
                catch (e) {
                    console.error("Cancio: falha ao conferir sincronização do aluno:", e);
                }
            })();
        }
        if (!s && sb) {
            // não achou local -> busca só ESSE aluno específico na nuvem pelo código (nunca baixa a lista inteira)
            setLoginBusy(true);
            try {
                const { data: found } = await callStudentApi("login", { code });
                if (found) {
                    setData((p) => mergeFoundStudentInto(p, found));
                    s = { id: found.id, code: found.code };
                }
            }
            catch (e) {
                console.error("Cancio: falha ao buscar aluno pelo código:", e);
            }
            setLoginBusy(false);
        }
        if (s) {
            setAlunoId(s.id);
            setCodeInput("");
            setCodeErr(false);
            setDay(JS2KEY[new Date().getDay()]);
            setExpanded(null);
            try {
                const raw = localStorage.getItem(SESS_KEY);
                if (raw) {
                    const sv = JSON.parse(raw);
                    if (sv && sv.studentId === s.id && sv.date === todayISO())
                        setWorkoutStart(sv);
                }
            }
            catch (e) { }
        }
        else
            setCodeErr(true);
    };
    const logout = () => { setAlunoId(null); setExpanded(null); };
    // AUTENTICAÇÃO REAL DO SUPABASE — a senha é verificada de verdade pelo Supabase Auth (nunca
    // gravada no código; só o e-mail da conta única de professor é fixo).
    const fetchAllStudentsAfterAuth = async () => {
        setLoadingRoster(true);
        try {
            const { data: allRows, error } = await sb.from("cancio").select("*").like("id", "student_%");
            if (error)
                throw error;
            // ignora qualquer linha de aluno já removido por aqui — cobre o caso raro de a busca rodar
            // antes do DELETE se propagar de verdade na nuvem (mesma trava de syncStudentToCloud)
            const rows = (allRows || []).filter((r) => !(r.data && deletedStudentIdsRef.current.has(r.data.id)));
            if (rows && rows.length > 0) {
                const cloud = mergeCloudRows(rows); // filtrado só em student_% -> profKey/soundOn/library/templates vêm com valor padrão aqui (a linha global não veio nessa busca), então preservamos os que já estavam carregados
                const cloudUpdatedById = {};
                rows.forEach((r) => { if (r.data && r.data.id)
                    cloudUpdatedById[r.data.id] = r.data.updatedAt || 0; });
                setData((p) => {
                    const localTs = p.updatedAt || 0;
                    const cloudIds = new Set(cloud.students.map((s) => s.id));
                    const localOnly = (p.students || []).filter((s) => !cloudIds.has(s.id)); // preserva aluno recém-criado que ainda não sincronizou
                    // proteção contra conflito offline: pra cada aluno que existe nos dois lados, o updatedAt maior vence.
                    // se o local vencer, mantém a versão local e agenda uma sincronização silenciosa pra atualizar a nuvem.
                    const cloudWinners = [];
                    const localWinners = [];
                    cloud.students.forEach((s) => {
                        const cloudTs = cloudUpdatedById[s.id] || 0;
                        const localCopy = (p.students || []).find((ls) => ls.id === s.id);
                        if (localCopy && localTs > cloudTs)
                            localWinners.push(localCopy);
                        else
                            cloudWinners.push(s);
                    });
                    const preserveLocal = [...localWinners, ...localOnly];
                    const merged = { ...cloud, profKey: p.profKey, soundOn: p.soundOn, library: p.library, templates: p.templates, activeStudentId: p.activeStudentId, students: [...cloudWinners, ...preserveLocal] };
                    preserveLocal.forEach((s) => {
                        merged.checkins[s.id] = (p.checkins && p.checkins[s.id]) || [];
                        merged.bestStreak[s.id] = (p.bestStreak && p.bestStreak[s.id]) || 0;
                        merged.archives[s.id] = (p.archives && p.archives[s.id]) || [];
                        merged.sessions[s.id] = (p.sessions && p.sessions[s.id]) || [];
                        merged.dayNames[s.id] = (p.dayNames && p.dayNames[s.id]) || {};
                        merged.cardio[s.id] = (p.cardio && p.cardio[s.id]) || {};
                        merged.cardioLog[s.id] = (p.cardioLog && p.cardioLog[s.id]) || [];
                        merged.recoveryLog[s.id] = (p.recoveryLog && p.recoveryLog[s.id]) || {};
                        merged.freezes[s.id] = (p.freezes && p.freezes[s.id]) || { month: "", used: 0 };
                    });
                    // treino nunca escolhe um lado só: mescla local+nuvem por dia/exercício/data/série pra
                    // TODO aluno, ganhando ou perdendo a corrida de metadado acima — dado de cadastro
                    // (nome, objetivo...) pode ser LWW sem problema, dado de treino não pode. Só reenvia
                    // pra nuvem quem de fato ganhou algo novo na mescla (evita 1 request por aluno do
                    // roster inteiro toda vez que o professor loga, quando quase sempre já está tudo igual).
                    const needsCloudSync = [];
                    merged.students.forEach((s) => {
                        const cloudWk = cloud.workouts[s.id] || {};
                        const mergedWk = mergeWorkoutsForStudent((p.workouts && p.workouts[s.id]) || {}, cloudWk);
                        merged.workouts[s.id] = mergedWk;
                        if (JSON.stringify(mergedWk) !== JSON.stringify(cloudWk))
                            needsCloudSync.push(s.id);
                    });
                    try {
                        localStorage.setItem(LS_KEY, JSON.stringify(merged));
                    }
                    catch (e) { }
                    needsCloudSync.forEach((sid) => syncStudentToCloud(merged, sid));
                    return merged;
                });
            }
        }
        catch (e) {
            console.error("Cancio: falha ao buscar todos os alunos:", e);
        }
        finally {
            setLoadingRoster(false);
        }
    };
    const unlockProf = async () => {
        if (!sb)
            return;
        setLoginBusy(true);
        setProfKeyErr("");
        const { data: authData, error: authError } = await sb.auth.signInWithPassword({
            email: "joppcancio13@gmail.com",
            password: profKeyInput,
        });
        if (authError) {
            console.error("Cancio: falha no login do professor:", authError);
            setProfKeyErr(`Erro: ${authError.message || "acesso negado"}`);
            setLoginBusy(false);
            return;
        }
        setProfUnlocked(true);
        setProfKeyInput("");
        setProfKeyErr("");
        setLoginBusy(false);
        // só busca a lista inteira de alunos agora — depois que a senha já foi validada de verdade
        fetchAllStudentsAfterAuth();
    };
    // Sair do modo professor é o momento real de handoff num tablet/celular compartilhado da
    // academia: fetchAllStudentsAfterAuth pode ter baixado a ficha de VÁRIOS alunos (nome,
    // observações, alerta clínico) pro localStorage deste aparelho enquanto o professor estava
    // logado. Se isso continuar depois que ele solta o aparelho, o próximo aluno a entrar ali
    // poderia ler dado de outros alunos abrindo o console. Por isso zera o cache multi-aluno aqui —
    // não em switchRole, que também dispara sem nenhuma sessão de professor ter existido (aluno comum
    // só trocando de aba), onde apagar quebraria o login offline do próprio aluno.
    const lockProf = () => {
        sb && sb.auth.signOut();
        setProfUnlocked(false);
        setProfKeyInput("");
        setProfKeyErr("");
        setData((p) => ({ ...p, students: [], checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {}, cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [], activeStudentId: null }));
    };
    const switchRole = (r) => { if (r === "aluno")
        setProfUnlocked(false); setRole(r); try { localStorage.setItem("cancio:lastRole", r); } catch (e) { } setExpanded(null); setAdding(false); setPickTpl(false); setSavingTpl(false); };
    const profStudent = students.find((s) => s.id === profId);
    const alunoStudent = students.find((s) => s.id === alunoId);
    // dispara sozinho no domingo, uma vez por aluno por semana — antes dependia do aluno lembrar de
    // abrir o app E apertar "Gerar Resumo da Semana"; um flag em localStorage evita repetir a cada
    // vez que ele abre o app no mesmo domingo. Só pro aluno vendo o próprio resumo (não no modo aula
    // do professor, que está no meio de uma sessão com o aluno, e não antes dele aceitar o termo).
    useEffect(() => {
        if (role !== "aluno" || !alunoStudent || !alunoStudent.ackAt)
            return;
        if (todayKey !== "dom" || freqWeek === 0)
            return;
        const flagKey = `cancio:weeklySummarySeen:${alunoId}:${todayISO()}`;
        try {
            if (localStorage.getItem(flagKey))
                return;
            localStorage.setItem(flagKey, "1");
        }
        catch (e) { }
        buildWeeklySummary();
    }, [role, alunoId, alunoStudent && alunoStudent.ackAt, todayKey, freqWeek]);
    // tela cheia de entrada do dia (redesign estético 4, item 3): mostra sozinha na primeira
    // abertura do app no dia, uma vez por aluno por dia — depois disso só reaparece por ação
    // explícita ("trocar treino ›"). Só pro aluno já com o termo aceito e a ficha inicial feita.
    useEffect(() => {
        if (role !== "aluno" || !alunoStudent || !alunoStudent.ackAt || !alunoStudent.assessmentAt)
            return;
        const flagKey = `cancio:dayEntrySeen:${alunoId}:${todayISO()}`;
        try {
            if (localStorage.getItem(flagKey)) return;
            localStorage.setItem(flagKey, "1");
        } catch (e) { }
        setDayEntryOpen(true);
    }, [role, alunoId, alunoStudent && alunoStudent.ackAt, alunoStudent && alunoStudent.assessmentAt]);
    const focusStudent = students.find((s) => s.id === focusId);
    // meta semanal (do campo "Frequência semanal" da ficha) no lugar da sequência de dias seguidos
    const weeklyTarget = parseWeeklyTarget(focusStudent && focusStudent.freqWeekly);
    const weeklyLine = weeklyTarget != null ? `${freqWeek} de ${weeklyTarget} essa semana` : `${freqWeek} ${freqWeek === 1 ? "treino" : "treinos"} essa semana`;
    // aviso suave só quando a semana já está avançada (sex/sáb/dom) e ainda falta bater a meta —
    // sem travar nada, sem Salva-Vidas
    const weeklyBehind = weeklyTarget != null && freqWeek < weeklyTarget && ["sex", "sab", "dom"].includes(todayKey);
    const lockCard = { textAlign: "center", padding: "52px 24px", ...flatPanel, borderRadius: 28, maxWidth: 360, margin: "10px auto 0" };
    useEffect(() => { if (role === "aluno" && codeInput.length === 4 && !loginBusy && !codeErr) { const t = setTimeout(() => doLogin(), 250); return () => clearTimeout(t); } }, [codeInput]);
    const keyInput = { display: "block", margin: "16px auto 0", width: 220, textAlign: "center", fontFamily: F.display, fontWeight: 700, fontSize: 22, letterSpacing: "0.28em", color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px", outline: "none", boxSizing: "border-box" };
    const keyErr = { fontFamily: F.mono, fontSize: 11, color: C.amber, marginTop: 10 };
    const keyBtn = { display: "block", width: 200, margin: "14px auto 0", fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" };
    const obsChip = (txt) => (React.createElement("div", { style: { display: "flex", gap: 9, alignItems: "baseline", borderLeft: `2px solid ${C.amberDim}`, padding: "5px 0 5px 10px", marginBottom: 14 } },
        React.createElement("span", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" } }, "observa\u00E7\u00E3o"),
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, lineHeight: 1.4 } }, txt)));
    if (!ready)
        // esqueleto do que vai aparecer, não um spinner genérico — dá a sensação de que o app já
        // sabe o formato do conteúdo e só está esperando os dados, não "pensando do zero"
        return React.createElement("div", { className: "cc-full-h", style: { background: "#000000", display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 20px 40px", boxSizing: "border-box" } },
            React.createElement(DiscoBall, { size: 40, seedN: 3 }),
            React.createElement("div", { style: { width: "100%", maxWidth: 440, marginTop: 32, display: "flex", flexDirection: "column", gap: 12 } }, [0, 1, 2, 3].map((i) => React.createElement(SkeletonCard, { key: i }))));
    return (React.createElement("div", { className: "cc-full-h", style: { background: "#000000", color: C.text, fontFamily: F.body } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap');
        body { font-variant-numeric: tabular-nums; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body, button, input, textarea { font-weight: 500; }
        button, input, textarea { -webkit-appearance: none; appearance: none; border-radius: 0; }
        body, p, div, span { line-height: 1.5; }
        * { -webkit-tap-highlight-color: transparent; }
        .cc-accordion { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .34s ${EASE.springSoft}; }
        .cc-accordion.cc-open { grid-template-rows: 1fr; }
        .cc-accordion-inner { overflow: hidden; min-height: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        input:focus, textarea:focus { border-color: ${C.silver} !important; }
        ::selection { background: ${C.amber}; color: ${C.ink}; }
        @keyframes cc-glow { 0%,100% { opacity: .18 } 50% { opacity: .34 } }
        .cc-amb { animation: cc-glow 4.5s ease-in-out infinite; }
        @keyframes cc-twinkle { 0%,100% { opacity: 0; transform: scale(.4) rotate(0deg) } 50% { opacity: .9; transform: scale(1) rotate(25deg) } }
        @keyframes cc-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cc-rays { to { transform: rotate(360deg) } }
        @keyframes cc-flash { 0% { background-color: rgba(228,228,233,.35); } 100% { background-color: transparent; } }
        .cc-flash-row { animation: cc-flash 500ms ease-out; }
        @keyframes cc-pop { 0% { transform: scale(.5); opacity: 0 } 60% { transform: scale(1.06) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes cc-particle { 0% { transform: translate(0,0) rotate(45deg); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) rotate(230deg); opacity: 0 } }
        @keyframes cc-reveal { 0% { opacity: 0; transform: scale(.4) translateY(24px); filter: blur(10px) } 55% { opacity: 1; filter: blur(0) } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0) } }
        @keyframes cc-flare { 0% { transform: translateX(-140%) skewX(-14deg) } 100% { transform: translateX(140%) skewX(-14deg) } }
        @keyframes cc-spin-slow { to { transform: rotate(360deg) } }
        button, a, [role="button"] { transition: transform .2s cubic-bezier(.16,1,.3,1), background-color .2s ease, border-color .2s ease, box-shadow .2s ease, opacity .2s ease, color .2s ease; }
        button:active:not(:disabled) { transform: scale(.97); transition: transform 50ms ease-out, background-color .2s ease, border-color .2s ease, box-shadow .2s ease, opacity .2s ease, color .2s ease; }
        @media (hover: hover) and (pointer: fine) {
          button:not(:disabled):hover { filter: brightness(1.12); }
          a:hover { opacity: .8; }
        }
        input, textarea { transition: border-color .2s ease, box-shadow .2s ease; }
        .cc-view { animation: cc-fade .38s cubic-bezier(.2,.8,.2,1); }
        @keyframes cc-up { from { transform: translateY(110%) } to { transform: none } }
        @keyframes cc-fadein { from { opacity: 0 } to { opacity: 1 } }
        .cc-bar-in { animation: cc-up .34s cubic-bezier(.22,1.12,.36,1) both; }
        .cc-sheet-in { animation: cc-up .42s cubic-bezier(.22,1.12,.36,1) both; }
        .cc-fade-in { animation: cc-fadein .2s ease both; }
        @media (prefers-reduced-motion: reduce) { .cc-bar-in, .cc-sheet-in, .cc-fade-in { animation: none } }
        @keyframes cc-sheen { 0% { transform: translateX(-60%) rotate(18deg); } 100% { transform: translateX(60%) rotate(18deg); } }
        .cc-sheen-wrap { position: relative; overflow: hidden; border-radius: 50%; }
        .cc-sheen { position: absolute; top: -40%; left: -20%; width: 40%; height: 180%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); animation: cc-sheen 4.5s ease-in-out infinite; mix-blend-mode: overlay; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) { .cc-amb { animation: none } .cc-view { animation: none } .cc-sheen { animation: none } }
      `),
        React.createElement("div", { style: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 900px 700px at 50% -10%, ${tier.tint}16, transparent 70%), radial-gradient(ellipse 700px 600px at 100% 0%, ${C.amber}0e, transparent 65%), radial-gradient(ellipse 800px 500px at -10% 100%, ${C.silver}0a, transparent 60%)` }, "aria-hidden": "true" }),
        React.createElement("div", { style: { position: "fixed", top: "-30%", left: "50%", width: 1400, height: 1400, marginLeft: -700, pointerEvents: "none", zIndex: 0, opacity: 0.05, background: `repeating-conic-gradient(from 0deg, transparent 0deg 9deg, ${C.amber} 9deg 10deg, transparent 10deg 40deg)`, animation: "cc-rays 220s linear infinite", WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 68%)", maskImage: "radial-gradient(circle, #000 0%, transparent 68%)" }, "aria-hidden": "true" }),
        role === "prof" && React.createElement("div", { className: "cc-amb", style: { position: "fixed", top: -70, right: -60, pointerEvents: "none", zIndex: 0 }, "aria-hidden": "true" },
            React.createElement("div", { className: "cc-sheen-wrap" },
                React.createElement(DiscoBall, { size: 280, cols: 17, rows: 17, seedN: 42, glow: false, tint: tier.tint }),
                React.createElement("span", { className: "cc-sheen", style: { animationDuration: "7s" } }))),
        celebration && React.createElement(Celebration, { ...celebration, onDone: () => { const t = celebration.then; setCelebration(null); if (t)
                t(); } }),
        pseModal && React.createElement(PSEModal, { onSelect: (effort) => finalizeWorkout(effort), onCancel: () => setPseModal(false) }),
        feedbackModal && React.createElement(FeedbackModal, { question: feedbackModal.question, onSend: (txt) => { submitFeedback(feedbackModal.sessionId, txt); const sd = feedbackModal.shareData; setFeedbackModal(null); if (sd)
                setShareCard(sd); }, onSkip: () => { const sd = feedbackModal.shareData; setFeedbackModal(null); if (sd)
                setShareCard(sd); } }),
        shareCard && React.createElement(React.Suspense, { fallback: React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,6,10,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 12, color: C.muted } }, "carregando…") }, React.createElement(ShareCard, { data: shareCard, onClose: () => setShareCard(null) })),
        logoCard && React.createElement(LogoCard, { onClose: () => setLogoCard(false) }),
        serieOpen && profStudent && React.createElement(SerieExport, { student: profStudent, week: (data.workouts && data.workouts[profId]) || emptyWeek(), dayNames: (data.dayNames && data.dayNames[profId]) || {}, initialDay: day, onClose: () => setSerieOpen(false) }),
        assessOpen && profStudent && React.createElement(AssessmentExport, { student: profStudent, onClose: () => setAssessOpen(false) }),
        role === "aluno" && alunoStudent && !alunoStudent.ackAt && React.createElement(Disclaimer, { onAccept: () => updateStudent(alunoId, { ackAt: new Date().toISOString() }) }),
        role === "aluno" && alunoStudent && alunoStudent.ackAt && (!alunoStudent.assessmentAt || assessmentJustDone) && (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 95, overflowY: "auto", background: C.ink, padding: "32px 16px 64px", boxSizing: "border-box" } },
            React.createElement("div", { style: { maxWidth: 540, margin: "0 auto" } },
                React.createElement(AssessmentInicial, { defaultName: alunoStudent.name, onSubmit: (formData) => {
                        updateStudent(alunoId, mapAnamneseToFicha(formData, alunoStudent));
                        setAssessmentJustDone(true);
                        setTimeout(() => setAssessmentJustDone(false), 2200);
                    } })))),
        role === "aluno" && alunoStudent && dayEntryOpen && React.createElement(DayEntryScreen, { week: week, todayKey: todayKey, dayNames: (data?.dayNames && data.dayNames[focusId]) || {}, cardio: cardioFocus, onBegin: () => { setDay(todayKey); setExpanded(null); setDayEntryOpen(false); }, onPickOther: (k) => { setDay(k); setExpanded(null); setDayEntryOpen(false); }, onClose: () => setDayEntryOpen(false) }),
        role === "aluno" && !isStandalone && (React.createElement("div", { style: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, background: C.panel2, padding: "9px 16px" } },
            React.createElement("span", { style: { flex: 1, fontFamily: F.mono, fontSize: 10.5, color: C.silver, lineHeight: 1.5 } }, "Para experi\u00EAncia VIP em tela cheia, adicione o Cancio Club \u00E0 sua Tela de In\u00EDcio (Compartilhar \u2192 Adicionar \u00E0 Tela de In\u00EDcio)"),
            React.createElement("button", { onClick: () => setIsStandalone(true), "aria-label": "Dispensar", style: { flexShrink: 0, fontFamily: F.mono, fontSize: 15, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "0 2px" } }, "\u00D7"))),
        React.createElement("div", { key: role + "-" + day, className: "cc-view", style: { position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto", padding: "calc(28px + env(safe-area-inset-top)) 20px 190px" } },
            !cloudSynced && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 999, padding: "7px 14px", marginBottom: 18, width: "fit-content" } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: C.warn, flexShrink: 0 } }),
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } }, "Salvo neste aparelho \u2014 sincronizando com a nuvem quando a internet voltar"))),
            localFull && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 999, padding: "7px 14px", marginBottom: 18, width: "fit-content" } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: C.warn, flexShrink: 0 } }),
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } }, "Armazenamento deste aparelho est\u00e1 cheio \u2014 os dados mais recentes podem n\u00e3o estar salvos aqui"))),
            role === "prof" && React.createElement("header", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 28 } },
                React.createElement("div", { style: { position: "relative", flexShrink: 0 } },
                    React.createElement("div", { className: "cc-sheen-wrap" },
                        React.createElement(DiscoBall, { size: 46, seedN: 7, tint: tier.tint }),
                        React.createElement("span", { className: "cc-sheen" })),
                    React.createElement(Sparkles, { color: tier.accent })),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 25, letterSpacing: "0.08em", lineHeight: 1, color: C.text } }, "CANCIO CLUB"))),
            role === "prof" && React.createElement("div", { style: { display: "flex", gap: 7, marginBottom: 24, alignItems: "center" } },
                React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 7 } },
                    React.createElement("button", { onClick: toggleSound, title: "Som das comemora\u00E7\u00F5es", style: { fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.06em", color: soundOn ? C.amber : C.muted, background: "none", border: `1px solid ${soundOn ? C.amberDim : C.line}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer" } },
                        "som ",
                        soundOn ? "on" : "off"),
                    React.createElement("button", { onClick: () => switchRole("aluno"), style: { fontFamily: F.body, fontWeight: 600, fontSize: 11.5, color: C.silver, background: "none", border: `1px solid ${C.line}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer" } }, "\u00C1rea do aluno"),
                    role === "prof" && profUnlocked && React.createElement("button", { onClick: lockProf, style: { fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.06em", color: C.muted, background: C.panel2, borderRadius: 999, padding: "7px 12px", cursor: "pointer" } }, "Bloquear"))),
            role === "prof" && !profUnlocked && (React.createElement("div", { style: lockCard },
                React.createElement("div", { style: { display: "inline-block", marginBottom: 20 } },
                    React.createElement(DiscoBall, { size: 96, seedN: 5 })),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: "0.04em" } }, "\u00C1rea do professor"),
                React.createElement("div", { style: { fontFamily: F.mono, fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.6 } }, "Digite sua senha de acesso."),
                React.createElement("input", { type: "password", value: profKeyInput, onChange: (e) => { setProfKeyInput(e.target.value); setProfKeyErr(""); }, onKeyDown: (e) => e.key === "Enter" && !loginBusy && unlockProf(), placeholder: "senha", style: keyInput }),
                profKeyErr && React.createElement("div", { style: keyErr }, profKeyErr),
                React.createElement("button", { onClick: unlockProf, disabled: loginBusy, style: { ...keyBtn, cursor: loginBusy ? "default" : "pointer", opacity: loginBusy ? 0.7 : 1 } }, loginBusy ? "Buscando…" : "Entrar"),
                React.createElement("button", { onClick: () => switchRole("aluno"), style: { display: "block", margin: "14px auto 0", fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", padding: 8, cursor: "pointer" } }, "\u2039 Sou aluno"))),
            role === "prof" && profUnlocked && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { position: "fixed", left: 12, right: 12, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 91, maxWidth: 636, margin: "0 auto" } },
                    React.createElement("div", { style: { display: "flex", gap: 2, padding: 6, borderRadius: 20, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}, 0 -16px 40px rgba(5,6,10,.9)` } },
                        [
                            ["alunos", "Alunos", () => { setProfTab("alunos"); setProfView("home"); setRendEx(null); setExpanded(null); }],
                            ["modelos", "Modelos", () => { setProfTab("modelos"); setExpanded(null); }],
                            ["recados", React.createElement(React.Fragment, { key: "r" }, "Recados", unread > 0 && React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 16, height: 16, marginLeft: 6, borderRadius: 999, background: profTab === "recados" ? C.ink : C.warn, color: profTab === "recados" ? "#fff" : C.ink, fontFamily: F.mono, fontSize: 9.5, fontWeight: 700, padding: "0 4px" } }, unread)), () => { setProfTab("recados"); setExpanded(null); }],
                            ["mais", "Mais", () => { setProfTab("painel"); setExpanded(null); }],
                        ].map(([key, label, onClick]) => {
                            const active = key === "mais" ? (profTab === "painel" || profTab === "biblioteca") : profTab === key;
                            return React.createElement("button", { key: key, className: "cc-tap", onClick, style: { flex: 1, fontFamily: F.display, fontWeight: active ? 700 : 600, fontSize: 13, padding: "11px 0", borderRadius: 14, border: "none", cursor: "pointer", color: active ? C.ink : C.muted, background: active ? PILL_ON : "transparent" } }, label);
                        }))),
                profTab === "alunos" && (React.createElement(React.Fragment, null,
                    (() => {
                        const fmtK = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
                        const tiny = { fontFamily: F.display, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.16em", color: C.muted };
                        if (profView === "home") {
                            const q = studentSearch.trim().toLowerCase();
                            const rosterById = {}; todayRoster.forEach((r) => { rosterById[r.id] = r; });
                            const rows = students.map((s) => {
                                const st = studentStats(s.id);
                                const wk = (data.workouts && data.workouts[s.id]) || emptyWeek();
                                const planned = trainingWds(wk, data.cardio && data.cardio[s.id]).size;
                                const r = rosterById[s.id];
                                const sess = ((data.sessions && data.sessions[s.id]) || []).filter((x) => x.date === todayISO()).slice(-1)[0];
                                const sub = r ? (r.done ? "Treinou hoje" + (sess && sess.durationSec ? " \u00B7 " + fmtDur(sess.durationSec) : "") : r.workoutName + " hoje \u00B7 ainda n\u00E3o veio") : "\u00DAltimo treino " + st.last;
                                const alert = s.clinicalAlert ? { k: "ALERTA", t: s.clinicalAlert } : lastEffortFor(s.id) === "destruidor" ? { k: "FADIGA", t: "\u00DAltimo treino veio como Destruidor" } : (st.week === 0 && planned > 0 ? { k: "SUMIDO", t: "Nenhum treino nos \u00FAltimos 7 dias" } : null);
                                return { s, st, planned, sub, done: r && r.done, wait: r && !r.done, alert, order: r ? (r.done ? 1 : 0) : 2 };
                            });
                            const open = (s) => { setActive(s.id); setProfView("aluno"); setFichaTab("treino"); setRendEx(null); setExpanded(null); setFichaOpen(false); setHistOpen(false); };
                            const alerts = rows.filter((r) => r.alert);
                            const list = rows.filter((r) => r.s.name.toLowerCase().includes(q)).sort((a, b) => a.order - b.order || a.s.name.localeCompare(b.s.name));
                            return React.createElement("section", { style: { marginBottom: 26 } },
                                alerts.length > 0 && React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", margin: "0 -20px 18px", padding: "0 20px", scrollbarWidth: "none" } }, alerts.map((r) => React.createElement("button", { key: r.s.id, className: "cc-tap", onClick: () => open(r.s), style: { flex: "none", width: 200, textAlign: "left", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: C.panel, boxShadow: "inset 0 0 0 1px rgba(232,121,75,.35)", color: C.text } },
                                    React.createElement("span", { style: { display: "block", ...tiny, color: C.warn } }, r.alert.k),
                                    React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 700, fontSize: 15, marginTop: 6 } }, r.s.name),
                                    React.createElement("span", { style: { display: "block", fontFamily: F.body, fontSize: 12, lineHeight: 1.35, color: C.muted, marginTop: 3 } }, r.alert.t)))),
                                React.createElement("div", { style: { display: "flex", gap: 8 } },
                                    React.createElement("input", { value: studentSearch, onChange: (e) => setStudentSearch(e.target.value), placeholder: "Buscar aluno", style: { flex: 1, minWidth: 0, boxSizing: "border-box", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel, border: "none", borderRadius: 12, padding: "12px 14px", outline: "none" } }),
                                    React.createElement("button", { className: "cc-tap", onClick: () => setAddStudentOpen(true), "aria-label": "Novo aluno", style: { flexShrink: 0, width: 44, height: 44, fontFamily: F.display, fontWeight: 700, fontSize: 20, color: C.text, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}`, border: "none", borderRadius: 12, cursor: "pointer" } }, "+")),
                                (() => {
                                    const trainToday = list.filter((r) => r.done || r.wait);
                                    const others = list.filter((r) => !r.done && !r.wait);
                                    const row = (r) => React.createElement("button", { key: r.s.id, onClick: () => open(r.s), style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", border: "none", borderBottom: "1px solid #15181F", background: "none", textAlign: "left", cursor: "pointer", color: C.text } },
                                        React.createElement("span", { style: { flex: 1, minWidth: 0 } },
                                            React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 600, fontSize: 15 } }, r.s.name),
                                            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, fontFamily: F.body, fontSize: 12, marginTop: 2, color: r.wait ? C.silver : C.muted } }, r.done && React.createElement("span", { style: { color: C.silver } }, "\u2713"), r.wait && React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: C.silver } }), r.sub)),
                                        React.createElement("span", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 18, fontVariantNumeric: "tabular-nums" } }, Math.min(r.st.week, 99), React.createElement("span", { style: { color: "#3A404C" } }, "/" + (r.planned || "\u2013"))));
                                    return React.createElement(React.Fragment, null,
                                        trainToday.length > 0 && React.createElement(React.Fragment, null,
                                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "16px 0 4px", ...tiny, color: "#5A6273" } }, React.createElement("span", null, "TREINAM HOJE \u00B7 " + trainToday.length), React.createElement("span", null, "SEMANA")),
                                            trainToday.map(row)),
                                        others.length > 0 && React.createElement(React.Fragment, null,
                                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "16px 0 4px", ...tiny, color: "#5A6273" } }, React.createElement("span", null, "OUTROS \u00B7 " + others.length), React.createElement("span", null, "SEMANA")),
                                            others.map(row)));
                                })(),
                                addStudentOpen && React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(5,6,10,.8)" }, onClick: () => setAddStudentOpen(false) },
                                    React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 480, margin: "0 auto", borderRadius: 28, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, padding: "20px 18px 18px" } },
                                        React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: C.muted } }, "NOVO ALUNO"),
                                        React.createElement("input", { autoFocus: true, value: nStudent, onChange: (e) => setNStudent(e.target.value), onKeyDown: (e) => e.key === "Enter" && nStudent.trim() && (addStudent(), setAddStudentOpen(false)), placeholder: "Nome do aluno", style: { display: "block", width: "100%", boxSizing: "border-box", marginTop: 12, fontFamily: F.body, fontSize: 15, color: C.text, background: C.ink, border: "none", borderRadius: 12, padding: "13px 14px", outline: "none" } }),
                                        React.createElement("button", { className: "cc-tap", disabled: !nStudent.trim(), onClick: () => { addStudent(); setAddStudentOpen(false); }, style: { width: "100%", marginTop: 12, fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.ink, background: nStudent.trim() ? PILL_ON : C.line, border: "none", borderRadius: 14, padding: "14px 0", cursor: nStudent.trim() ? "pointer" : "default" } }, "Adicionar"))));
                        }
                        if (!profStudent) return null;
                        const ps = profStudent;
                        const header = React.createElement("div", { style: { position: "relative", margin: "-12px -20px 0", height: 170, background: MIRROR_GRID(15) + ",linear-gradient(118deg,#1E222B 0%,#8D97A9 24%,#E9EEF6 34%,#5B6373 48%,#2B3039 62%,#B8C3D4 78%,#3A404C 100%)" } },
                            React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(5,6,10,.1) 0%,#05060A 100%)" } }),
                            React.createElement("button", { className: "cc-tap", onClick: () => { setProfView("home"); setRendEx(null); setExpanded(null); }, style: { position: "absolute", left: 18, top: 16, fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.ink, background: "rgba(242,245,250,.88)", padding: "7px 12px", borderRadius: 999, border: "none", cursor: "pointer" } }, "\u2039 Alunos"),
                            React.createElement("div", { style: { position: "absolute", left: 20, right: 20, bottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 } },
                                React.createElement("div", { style: { minWidth: 0 } },
                                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1, textTransform: "uppercase", color: C.text } }, ps.name),
                                    React.createElement("div", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 12.5, color: C.silver, marginTop: 6 } }, [ps.goal, ps.freqWeekly, ps.startDate ? "desde " + fmtDate(ps.startDate) : ""].filter(Boolean).join(" \u00B7 "))),
                                React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } },
                                    React.createElement("div", { style: { ...tiny, fontSize: 8.5 } }, "C\u00D3DIGO"),
                                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 20, letterSpacing: "0.16em", color: C.text } }, ps.code))));
                        const statB = (v, l) => React.createElement("span", null, React.createElement("b", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 16, color: C.text } }, v), " " + l);
                        const chips = [ps.clinicalAlert && "Alerta \u00B7 " + ps.clinicalAlert, lastEffortFor(profId) === "destruidor" && "Fadiga \u00B7 \u00FAltimo treino Destruidor", !ps.ackAt && "Termo pendente"].filter(Boolean);
                        const tabs = React.createElement("div", { style: { display: "flex", gap: 4, marginTop: 14, padding: 4, borderRadius: 12, background: C.panel } }, [["treino", "Treino"], ["rend", "Rendimento"], ["volume", "Volume"], ["ficha", "Ficha"]].map(([k, l]) => React.createElement("button", { key: k, onClick: () => { setFichaTab(k); setRendEx(null); }, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, fontWeight: fichaTab === k ? 700 : 500, background: fichaTab === k ? "#1E222A" : "transparent", color: fichaTab === k ? C.text : C.muted } }, l)));
                        let body = null;
                        const wkP = (data.workouts && data.workouts[profId]) || emptyWeek();
                        const allEx = []; DAYS.forEach((d) => (wkP[d.key] || []).forEach((e) => allEx.push({ ...e, _day: d.key })));
                        if (fichaTab === "rend" && rendEx) {
                            const ex = allEx.find((e) => e.id === rendEx);
                            if (ex) {
                                const hs = sortedHistory(ex.history || []).map((x) => ({ date: x.date, raw: x, ...daySummary(x) })).filter((x) => x.load > 0).slice(-12);
                                const mn = Math.min(...hs.map((x) => x.load)) - 2, mx = Math.max(...hs.map((x) => x.load)) + 2;
                                const pts = hs.map((x, i) => [hs.length > 1 ? (i / (hs.length - 1)) * 300 : 150, 150 - ((x.load - mn) / (mx - mn || 1)) * 140]);
                                const first = hs[0], last = hs[hs.length - 1];
                                const setsTxt = (x) => { const es = Array.isArray(x.raw.entries) ? x.raw.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && typeof e.load === "number") : []; return es.length ? fmtK(Math.max(...es.map((e) => e.load))) + " \u00D7 " + es.map((e) => e.reps).join(" \u00B7 ") : fmtK(x.load) + (x.reps ? " \u00D7 " + x.reps : ""); };
                                const saveNote = (val) => setData((p) => { const w = { ...p.workouts[profId] }; w[ex._day] = (w[ex._day] || []).map((e) => (e.id === ex.id ? { ...e, profNote: val } : e)); const next = { ...p, workouts: { ...p.workouts, [profId]: w } }; syncStudentToCloud(next, profId); return next; });
                                body = React.createElement("div", { className: "cc-view", style: { marginTop: 16 } },
                                    React.createElement("button", { onClick: () => setRendEx(null), style: { fontFamily: F.body, fontSize: 14, fontWeight: 500, color: C.silver, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "\u2039 Rendimento"),
                                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 22, lineHeight: 1.05, textTransform: "uppercase", marginTop: 14 } }, ex.name),
                                    last && React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, marginTop: 14 } },
                                        React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 48, lineHeight: 1 } }, fmtK(last.load), React.createElement("span", { style: { fontSize: 20, color: C.muted } }, " kg")),
                                        first && hs.length > 1 && React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.silver } }, (last.load > first.load ? "+" + fmtK(last.load - first.load) + " kg desde " + fmtDate(first.date) : last.load === first.load ? "est\u00E1vel desde " + fmtDate(first.date) : fmtK(last.load - first.load) + " kg desde " + fmtDate(first.date)))),
                                    hs.length > 1 ? React.createElement("svg", { viewBox: "0 0 300 160", style: { width: "100%", height: 170, marginTop: 18, overflow: "visible" } },
                                        [10, 80, 150].map((y) => React.createElement("line", { key: y, x1: 0, x2: 300, y1: y, y2: y, stroke: "#1E222A", strokeDasharray: "3 4" })),
                                        React.createElement("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: C.silver, strokeWidth: 2, strokeLinejoin: "round" }),
                                        pts.map((p, i) => React.createElement("circle", { key: i, cx: p[0], cy: p[1], r: i === pts.length - 1 ? 6 : 3, fill: i === pts.length - 1 ? C.text : C.ink, stroke: C.silver, strokeWidth: 1.5 }))) : React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 18 } }, "Ainda sem hist\u00F3rico suficiente pra um gr\u00E1fico."),
                                    React.createElement("div", { style: { ...tiny, marginTop: 20 } }, "\u00DALTIMAS SESS\u00D5ES \u00B7 S\u00C9RIES DE TRABALHO"),
                                    [...hs].reverse().slice(0, 5).map((x) => React.createElement("div", { key: x.date, style: { display: "flex", gap: 10, alignItems: "baseline", padding: "11px 0", borderBottom: "1px solid #15181F" } },
                                        React.createElement("span", { style: { width: 52, fontFamily: F.body, fontSize: 12.5, color: C.muted } }, fmtDate(x.date)),
                                        React.createElement("span", { style: { flex: 1, fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontSize: 14 } }, setsTxt(x)))),
                                    React.createElement("div", { style: { marginTop: 14, padding: "12px 14px", borderRadius: 12, background: C.panel, boxShadow: "inset 0 0 0 1px #1E222A" } },
                                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 8 } }, React.createElement("span", { style: tiny }, "NOTA DO PROFESSOR"), React.createElement("span", { style: { fontFamily: F.body, fontSize: 10.5, color: "#5A6273" } }, "opcional \u00B7 aluno v\u00EA no exerc\u00EDcio")),
                                        React.createElement("textarea", { value: noteDraft, onChange: (e) => setNoteDraft(e.target.value), onBlur: () => saveNote(noteDraft.trim()), placeholder: "Escreva uma orienta\u00E7\u00E3o pra pr\u00F3xima vez\u2026", style: { width: "100%", boxSizing: "border-box", minHeight: 56, background: "none", border: "none", outline: "none", resize: "none", padding: 0, fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: C.text } })));
                            }
                        }
                        else if (fichaTab === "rend") {
                            const now = new Date(); now.setHours(0, 0, 0, 0);
                            const weekIdx = (iso) => Math.floor((now - new Date(iso + "T00:00:00")) / (7 * 86400000));
                            const vols = Array(8).fill(0);
                            allEx.forEach((e) => (e.history || []).forEach((x) => { const w = weekIdx(x.date); if (w >= 0 && w < 8) vols[7 - w] += daySummary(x).volume || 0; }));
                            const vmax = Math.max(1, ...vols);
                            const firstV = vols.find((v) => v > 0) || 0, lastV = vols[7] || vols[6] || 0;
                            const volDelta = firstV && lastV ? Math.round(((lastV - firstV) / firstV) * 100) : null;
                            const planned = trainingWds(wkP, data.cardio && data.cardio[profId]).size * 8;
                            const ch8 = ((data.checkins && data.checkins[profId]) || []).filter((d) => weekIdx(d) >= 0 && weekIdx(d) < 8).length;
                            const freqPct = planned ? Math.min(100, Math.round((ch8 / planned) * 100)) : null;
                            const progs = allEx.map((e) => {
                                const hs = sortedHistory(e.history || []).map((x) => ({ date: x.date, ...daySummary(x) })).filter((x) => x.load > 0);
                                if (hs.length < 2) return null;
                                let best = hs[0].load, prs = 0; hs.slice(1).forEach((x) => { if (x.load > best) { prs++; best = x.load; } });
                                const tail = hs.slice(-8), a = tail[0].load, b = tail[tail.length - 1].load, lo = Math.min(...tail.map((x) => x.load)), hi = Math.max(...tail.map((x) => x.load));
                                return { e, prs, a, b, pts: tail.map((x, i) => `${(i / (tail.length - 1)) * 100},${26 - ((x.load - lo) / (hi - lo || 1)) * 24}`).join(" "), delta: b === a ? "est\u00E1vel" : (b > a ? "+" : "") + Math.round(((b - a) / a) * 100) + "%" };
                            }).filter(Boolean);
                            const prTotal = progs.reduce((n, p) => n + p.prs, 0);
                            const eff = { facil: 0, medida: 0, destruidor: 0 }; profSessions.forEach((x) => { if (eff[x.effort] != null) eff[x.effort]++; });
                            const effN = eff.facil + eff.medida + eff.destruidor;
                            const num = (v, l, first) => React.createElement("div", { style: { padding: first ? "12px 0" : "12px 0 12px 12px", borderLeft: first ? "none" : "1px solid #1E222A" } }, React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 24, lineHeight: 1 } }, v), React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 4 } }, l));
                            body = React.createElement("div", { className: "cc-view", style: { marginTop: 16 } },
                                React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid #1E222A", borderBottom: "1px solid #1E222A" } }, num(freqPct != null ? freqPct + "%" : "\u2013", "frequ\u00EAncia \u00B7 8 sem", true), num(volDelta != null ? (volDelta > 0 ? "+" : "") + volDelta + "%" : "\u2013", "volume semanal"), num(prTotal + " \u2605", "recordes")),
                                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18 } }, React.createElement("span", { style: tiny }, "VOLUME POR SEMANA"), React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontSize: 12 } }, fmtVolume(vols[7]))),
                                React.createElement("div", { style: { height: 74, display: "flex", alignItems: "flex-end", gap: 5, marginTop: 10 } }, vols.map((v, i) => React.createElement("div", { key: i, style: { flex: 1, height: Math.max(2, (v / vmax) * 74), borderRadius: 3, background: i === 7 ? "linear-gradient(180deg,#FFFFFF,#AEB9CB)" : v ? "#2A2F39" : "#1A1D24" } }))),
                                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 9.5, color: "#5A6273", marginTop: 5 } }, React.createElement("span", null, "8 semanas atr\u00E1s"), React.createElement("span", null, "esta semana")),
                                React.createElement("div", { style: { ...tiny, marginTop: 18 } }, "CARGA POR EXERC\u00CDCIO \u00B7 TOQUE PRA ABRIR"),
                                progs.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, padding: "12px 0" } }, "Os gr\u00E1ficos aparecem depois de 2 treinos registrados."),
                                progs.map((p) => React.createElement("button", { key: p.e.id, onClick: () => { setRendEx(p.e.id); setNoteDraft(p.e.profNote || ""); }, style: { width: "100%", display: "grid", gridTemplateColumns: "1fr 70px 56px", gap: 10, alignItems: "center", padding: "10px 0", border: "none", borderBottom: "1px solid #15181F", background: "none", textAlign: "left", cursor: "pointer", color: C.text } },
                                    React.createElement("span", { style: { minWidth: 0 } }, React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, p.e.name + (p.prs ? " \u2605" : "")), React.createElement("span", { style: { display: "block", fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 2 } }, p.a === p.b ? fmtK(p.b) + " kg" : fmtK(p.a) + " \u2192 " + fmtK(p.b) + " kg")),
                                    React.createElement("svg", { viewBox: "0 0 100 28", preserveAspectRatio: "none", style: { width: 70, height: 24, overflow: "visible" } }, React.createElement("polyline", { points: p.pts, fill: "none", stroke: C.silver, strokeWidth: 1.6, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" })),
                                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 14, textAlign: "right" } }, p.delta))),
                                effN > 0 && React.createElement(React.Fragment, null,
                                    React.createElement("div", { style: { ...tiny, marginTop: 18 } }, "ESFOR\u00C7O RELATADO \u00B7 " + effN + " TREINOS"),
                                    React.createElement("div", { style: { display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginTop: 10 } }, eff.facil > 0 && React.createElement("span", { style: { flex: eff.facil, background: "#3A404C" } }), eff.medida > 0 && React.createElement("span", { style: { flex: eff.medida, background: "#8D97A9" } }), eff.destruidor > 0 && React.createElement("span", { style: { flex: eff.destruidor, background: C.warn } })),
                                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 10.5, color: C.muted, marginTop: 6 } }, React.createElement("span", null, "f\u00E1cil " + eff.facil), React.createElement("span", null, "na medida " + eff.medida), React.createElement("span", { style: { color: C.warn } }, "destruidor " + eff.destruidor))),
                                React.createElement("div", { style: { ...tiny, marginTop: 20 } }, "SESS\u00D5ES (" + profSessions.length + ")"),
                                profSessions.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, padding: "12px 0" } }, "Nenhuma sess\u00E3o registrada ainda."),
                                [...profSessions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12).map((x) => React.createElement("div", { key: x.id, style: { padding: "11px 0", borderBottom: "1px solid #15181F" } },
                                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, fontFamily: F.body, fontSize: 13 } }, React.createElement("span", null, fmtDate(x.date) + " \u00B7 " + ((data.dayNames && data.dayNames[profId] && data.dayNames[profId][x.day]) || "ficha " + ((DAYS.find((d) => d.key === x.day) || {}).short || x.day || ""))), React.createElement("span", { style: { color: C.muted } }, [x.durationSec ? fmtDur(x.durationSec) : "", x.effort ? ({ facil: "f\u00E1cil", medida: "na medida", destruidor: "destruidor", descanso: "recupera\u00E7\u00E3o" }[x.effort] || x.effort) : ""].filter(Boolean).join(" \u00B7 "))),
                                    x.feedback && React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, lineHeight: 1.4, color: "#C9D0DC", marginTop: 4 } }, "\u201C" + x.feedback + "\u201D"))));
                        }
                        else if (fichaTab === "volume") {
                            const unmatched = buildWeeklyVolumeReport(allEx, 0).unmatched;
                            body = React.createElement("div", { className: "cc-view", style: { marginTop: 16 } },
                                React.createElement("div", { style: { ...tiny, marginBottom: 12 } }, "VOLUME POR MÚSCULO"),
                                React.createElement(VolumeDashboard, { allEx: allEx, onOpenBulkLink: () => setBulkLinkOpen(true) }),
                                bulkLinkOpen && React.createElement(BulkLinkSheet, {
                                    items: unmatched,
                                    onClose: () => setBulkLinkOpen(false),
                                    onConfirm: (links) => { applyBulkCatalogLinks(profId, links); setBulkLinkOpen(false); },
                                    onExclude: (item) => patchExerciseInDay(profId, item.day, item.id, { excludeFromVolume: true }),
                                }));
                        }
                        else if (fichaTab === "ficha") {
                            body = React.createElement("div", { className: "cc-view", style: { marginTop: 6 } },
                                React.createElement(FichaEditor, { student: ps, onSave: (patch) => updateStudent(profId, patch) }),
                                React.createElement("div", { style: { ...tiny, marginTop: 24 } }, "FASES ARQUIVADAS"),
                                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
                                    React.createElement("input", { value: archLabel, onChange: (e) => setArchLabel(e.target.value), placeholder: "R\u00F3tulo (ex.: Fase 1 \u00B7 Adapta\u00E7\u00E3o)", style: { flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 13.5, color: C.text, background: C.panel, border: "none", borderRadius: 10, padding: "11px 12px", outline: "none" } }),
                                    React.createElement("button", { className: "cc-tap", onClick: archiveWorkout, style: { fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer" } }, "Arquivar semana")),
                                archives.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 10 } }, "Nenhuma fase arquivada ainda."),
                                [...archives].sort((a, b) => (a.date < b.date ? 1 : -1)).map((a) => React.createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "12px 0", borderBottom: "1px solid #15181F" } },
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontFamily: F.body, fontSize: 14 } }, a.label), React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 2 } }, fmtDateTime(a.date) + " \u00B7 " + DAYS.reduce((n, d) => n + ((a.week[d.key] || []).length), 0) + " exerc\u00EDcios")),
                                    React.createElement("button", { onClick: () => restoreArchive(a), style: { fontFamily: F.body, fontSize: 12, color: C.silver, background: C.panel, border: "none", borderRadius: 8, padding: "8px 11px", cursor: "pointer" } }, "restaurar"),
                                    React.createElement("button", { onClick: () => deleteArchive(a.id), "aria-label": "Apagar", style: { fontSize: 16, color: C.muted, background: "none", border: "none", cursor: "pointer" } }, "\u00D7"))),
                                React.createElement("button", { onClick: () => { if (window.confirm(`Remover ${ps.name}? Isso apaga a ficha, hist\u00F3rico e c\u00F3digo dele(a) da nuvem. N\u00E3o pode ser desfeito por aqui \u2014 s\u00F3 restaurando de um backup exportado antes.`)) { removeStudent(profId); setProfView("home"); } }, style: { marginTop: 32, fontFamily: F.body, fontSize: 12.5, color: C.warn, background: "none", border: `1px solid ${C.warn}55`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "Remover aluno"));
                        }
                        return React.createElement("section", { style: { marginBottom: fichaTab === "treino" ? 14 : 26 } },
                            header,
                            React.createElement("div", { style: { display: "flex", gap: 18, marginTop: 12, fontFamily: F.body, fontSize: 12, color: C.muted } }, statB(streak, "seguidos"), statB(freqWeek, "semana"), statB(freqTotal, "total")),
                            chips.length > 0 && React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 } }, chips.map((c) => React.createElement("span", { key: c, style: { fontFamily: F.body, fontSize: 11, color: C.warn, background: "rgba(232,121,75,.12)", borderRadius: 999, padding: "4px 10px" } }, c))),
                            lastProfSession && lastProfSession.feedback && React.createElement("div", { style: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.panel, fontFamily: F.body, fontSize: 12.5, lineHeight: 1.45, color: "#C9D0DC" } }, "\u201C" + lastProfSession.feedback + "\u201D ", React.createElement("span", { style: { color: "#5A6273" } }, "\u00B7 " + fmtDate(lastProfSession.date))),
                            tabs,
                            body);
                    })(),
                    (profView === "home" && students.length > 0) || (profView === "aluno" && fichaTab !== "treino") ? null : students.length === 0 && loadingRoster ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, [0, 1, 2].map((i) => React.createElement(SkeletonCard, { key: i }))) : students.length === 0 ? React.createElement(PremiumEmptyState, { icon: "personPlus", compact: false, title: "Nenhum aluno na casa ainda.", sub: "Cadastre o primeiro e a pista come\u00E7a a girar." }) : (React.createElement(React.Fragment, null,
                        profStudent && profStudent.obs && obsChip(profStudent.obs),
                        profStudent && (React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } },
                            React.createElement("button", { onClick: () => setProfViewMode("edit"), style: { flex: 1, fontFamily: F.mono, fontSize: 12, letterSpacing: "0.04em", color: profViewMode === "edit" ? C.ink : C.muted, background: profViewMode === "edit" ? C.silver : C.panel2, border: "none", borderRadius: 10, padding: "10px", cursor: "pointer" } }, "Modo Edi\u00E7\u00E3o"),
                            React.createElement("button", { onClick: () => setProfViewMode("aula"), style: { flex: 1, fontFamily: F.mono, fontSize: 12, letterSpacing: "0.04em", color: profViewMode === "aula" ? C.ink : C.muted, background: profViewMode === "aula" ? C.amber : C.panel2, border: "none", borderRadius: 10, padding: "10px", cursor: "pointer" } }, "Modo Aula (Personal)"),
                            React.createElement("button", { className: "cc-tap", onClick: () => setSerieOpen(true), style: { flex: "none", fontFamily: F.body, fontWeight: 600, fontSize: 12, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Baixar s\u00E9rie"),
                            profStudent.assessment && React.createElement("button", { className: "cc-tap", onClick: () => setAssessOpen(true), style: { flex: "none", fontFamily: F.body, fontWeight: 600, fontSize: 12, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Baixar anamnese"))),
                        profStudent && profViewMode === "aula" && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 } },
                            "Registrando presencialmente em nome de ",
                            profStudent.name,
                            " \u2014 os dados v\u00E3o direto pro hist\u00F3rico dele, como se ele mesmo tivesse registrado."),
                        React.createElement(DayTabs, { week: week, day: day, onPick: (k) => { setDay(k); setExpanded(null); setPickTpl(false); setSavingTpl(false); }, cardio: cardioFocus }),
                        React.createElement("div", { style: { marginBottom: 14 } },
                            React.createElement("input", { value: dayName, onChange: (e) => updateDayName(profId, day, e.target.value), placeholder: `Nome do treino de ${dayFull} (ex.: Treino A · Superiores)`, style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", outline: "none" } })),
                        list.length === 0 && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, background: C.panel, border: `1px solid ${cardioOn ? C.amber : C.line}`, borderRadius: 12, padding: "12px 14px" } },
                            React.createElement("div", { style: { flex: 1, fontFamily: F.mono, fontSize: 11.5, color: C.muted, lineHeight: 1.4 } }, "Dia sem treino de for\u00E7a. O aluno j\u00E1 pode registrar cardio em qualquer dia \u2014 esse marcador \u00E9 s\u00F3 pra voc\u00EA planejar/lembrar que este \u00E9 um dia de cardio."),
                            React.createElement("button", { onClick: () => toggleCardio(profId, day), style: { fontFamily: F.mono, fontSize: 12, letterSpacing: "0.04em", color: cardioOn ? C.ink : C.silver, background: cardioOn ? C.amber : "transparent", border: `1px solid ${cardioOn ? C.amber : C.line}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap" } }, cardioOn ? "Marcado" : "Marcar como dia de cardio"))),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 } },
                            list.length === 0 && !adding && React.createElement(PremiumEmptyState, { icon: "dumbbell", title: `Nenhum treino em ${dayFull} \u2014 a ficha t\u00E1 em branco.`, sub: "Monte um exerc\u00EDcio do zero ou aplique um modelo salvo." }),
                            list.map((ex, i) => profViewMode === "aula"
                                ? React.createElement(ExerciseCard, { key: ex.id, ex: ex, role: "aluno", expanded: expanded === ex.id, onToggle: toggleExpanded, onAddLoad: addLoad, onNote: updateExerciseNote, onRemove: noop, onUpdate: updateExercise, onDeleteRecord: noop, onMove: noop, isFirst: true, isLast: true, tint: tier.tint, dayDate: dayDate })
                                : React.createElement(ExerciseCard, { key: ex.id, ex: ex, role: "prof", idx: i + 1, expanded: expanded === ex.id, onToggle: toggleExpanded, onAddLoad: addLoad, onNote: updateExerciseNote, onRemove: removeExercise, onUpdate: updateExercise, onDeleteRecord: deleteRecord, onMove: moveExercise, isFirst: i === 0, isLast: i === list.length - 1, tint: tier.tint, dayDate: dayDate }))),
                        profViewMode === "edit" && (React.createElement(React.Fragment, null,
                            React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 } },
                                templates.length > 0 && React.createElement("button", { onClick: () => { setPickTpl((v) => !v); setSavingTpl(false); }, style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "Aplicar modelo"),
                                list.length > 0 && React.createElement("button", { onClick: () => { setSavingTpl((v) => !v); setPickTpl(false); }, style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "Salvar dia como modelo")),
                            pickTpl && (React.createElement("div", { style: { background: C.panel, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 12, padding: 10, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 } }, templates.map((t) => (React.createElement("div", { key: t.id, style: { background: C.panel2, borderRadius: 8, padding: "10px 12px" } },
                                React.createElement("div", { style: { fontFamily: F.body, fontSize: 14, color: C.text, marginBottom: 8 } },
                                    t.name,
                                    " ",
                                    React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } },
                                        "\u00B7 ",
                                        t.exercises.length,
                                        " exerc\u00EDcios")),
                                React.createElement("div", { style: { display: "flex", gap: 4 } }, DAYS.map((d) => (React.createElement("button", { key: d.key, onClick: () => applyTemplate(t, d.key), title: `Aplicar em ${d.full}`, style: { flex: 1, fontFamily: F.mono, fontSize: 11.5, fontWeight: 700, color: d.key === day ? C.ink : C.silver, background: d.key === day ? C.amber : C.panel, border: "none", borderRadius: 6, padding: "8px 0", cursor: "pointer" } }, d.short[0]))))))))),
                            savingTpl && React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } },
                                React.createElement("input", { value: tplName, onChange: (e) => setTplName(e.target.value), onKeyDown: (e) => e.key === "Enter" && saveDayAsTemplate(), placeholder: "Nome do modelo", style: { flex: 1, fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", outline: "none" } }),
                                React.createElement("button", { onClick: saveDayAsTemplate, style: { fontFamily: F.mono, fontSize: 13, color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer" } }, "Salvar")),
                            adding ? (React.createElement("div", { style: { ...glassPanel, borderRadius: 22, padding: 20 } },
                                library.length > 0 && (React.createElement("div", { style: { marginBottom: 12 } },
                                    React.createElement("button", { onClick: () => setPickLib((v) => !v), style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, pickLib ? "Fechar biblioteca" : "Escolher da biblioteca"),
                                    pickLib && (React.createElement("div", { style: { marginTop: 10, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 12, padding: 10 } },
                                        React.createElement("input", { value: libFilter, onChange: (e) => setLibFilter(e.target.value), placeholder: "filtrar\u2026", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 13.5, color: C.text, ...glassPanel, borderRadius: 8, padding: "8px 10px", outline: "none", marginBottom: 8 } }),
                                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, maxHeight: 200, overflowY: "auto" } }, library.filter((e) => e.name.toLowerCase().includes(libFilter.trim().toLowerCase())).map((e) => (React.createElement("button", { key: e.id, onClick: () => { setForm((fm) => ({ ...fm, name: e.name, url: e.url || "" })); setPickLib(false); setLibFilter(""); }, style: { textAlign: "left", fontFamily: F.body, fontSize: 14, color: C.text, background: C.panel, border: "none", borderRadius: 8, padding: "9px 11px", cursor: "pointer" } },
                                            e.name,
                                            e.tag && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 9, letterSpacing: "0.04em", color: C.ink, background: C.silver, borderRadius: 999, padding: "2px 7px", marginLeft: 7 } }, e.tag),
                                            e.url ? React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.silver } }, " \u00B7 v\u00EDdeo") : "")))))))),
                                React.createElement(Field, { label: "Exerc\u00EDcio", type: "text", placeholder: "Ex.: Agachamento livre", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }),
                                React.createElement("div", { style: { marginTop: 12 } },
                                    React.createElement(CatalogPicker, { label: "Ligar ao cat\u00E1logo (volume por m\u00FAsculo)", value: form.catalogId, onChange: (v) => setForm({ ...form, catalogId: v }) })),
                                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
                                    React.createElement(Field, { label: "S\u00E9ries", type: "text", inputMode: "numeric", value: form.sets, onChange: (e) => setForm({ ...form, sets: e.target.value }), flex: "1 1 0" }),
                                    React.createElement(Field, { label: "Reps", type: "text", value: form.reps, onChange: (e) => setForm({ ...form, reps: e.target.value }), flex: "1 1 0" }),
                                    React.createElement(Field, { label: "Descanso (s)", type: "text", inputMode: "numeric", placeholder: "\u2014", value: form.rest, onChange: (e) => setForm({ ...form, rest: e.target.value }), flex: "1 1 0" })),
                                React.createElement(Field, { label: "Observa\u00E7\u00E3o (opcional)", type: "text", placeholder: "Dica de execu\u00E7\u00E3o para o aluno", value: form.note, onChange: (e) => setForm({ ...form, note: e.target.value }) }),
                                React.createElement("div", { style: { marginTop: 12 } },
                                    React.createElement(Field, { label: "Link do v\u00EDdeo (opcional)", type: "text", placeholder: "cole o link", value: form.url, onChange: (e) => setForm({ ...form, url: e.target.value }) })),
                                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
                                    React.createElement("button", { onClick: addExercise, style: { flex: 1, fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" } }, "Adicionar exerc\u00EDcio"),
                                    React.createElement("button", { onClick: () => { setAdding(false); setPickLib(false); }, style: { fontFamily: F.mono, fontSize: 13, color: C.muted, background: C.panel2, borderRadius: 10, padding: "12px 16px", cursor: "pointer" } }, "Cancelar")))) : React.createElement(AddButton, { onClick: () => setAdding(true), label: `+ Adicionar exercício em ${DAYS.find((d) => d.key === day).short}` }))),
                        profViewMode === "aula" && profStudent && (React.createElement(React.Fragment, null,
                            todayKey === "dom" && freqWeek > 0 && (React.createElement("button", { onClick: buildWeeklySummary, style: { width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 14.5, letterSpacing: "0.04em", color: C.amber, background: "radial-gradient(circle at 50% 0%, #2A2A2D, #0A0A0C)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", border: "none", borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 14 } }, "Gerar Resumo da Semana")),
                            React.createElement(CardioSection, { entries: dayCardioEntries, form: cardioForm, onChange: setCardioForm, onAdd: addCardio }),
                            list.length === 0 && React.createElement(RecoverySection, { state: dayRecovery, onToggle: toggleRecovery }),
                            React.createElement("button", { className: "cc-tap", onClick: () => { flushAllPendingSaves(); if (!hasLoggedSomething || dayDone)
                                    return; haptic("confirm"); if (isRestDay)
                                    finalizeWorkout("descanso");
                                else
                                    setPseModal(true); }, disabled: !hasLoggedSomething || dayDone, style: { width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 14.5, letterSpacing: "0.04em", color: hasLoggedSomething && !dayDone ? C.amber : C.muted, background: hasLoggedSomething && !dayDone ? "radial-gradient(circle at 50% 0%, #2A2A2D, #0A0A0C)" : C.panel2, boxShadow: hasLoggedSomething && !dayDone ? "inset 0 0 0 1px rgba(255,255,255,0.06)" : "none", border: "none", borderRadius: 18, padding: "17px", cursor: hasLoggedSomething && !dayDone ? "pointer" : "default", marginBottom: 6, transition: `transform .18s ${EASE.spring}` } }, dayDone ? (isRestDay ? "✓ Recuperação registrada" : "✓ Treino finalizado") : (isRestDay ? "✓ Salvar Recuperação" : "Finalizar Treino")),
                            !hasLoggedSomething && !dayDone && React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontSize: 10.5, color: C.muted, marginBottom: 14 } }, "registre ao menos 1 s\u00E9rie ou o cardio pra finalizar"),
                            React.createElement(StudentMessages, { messages: messages.filter((m) => m.studentId === profId), onSend: (text) => sendMessage(text, profId) }))))))),
                profTab === "modelos" && (React.createElement(React.Fragment, null,
                    React.createElement("p", { style: { fontFamily: F.mono, fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 0, marginBottom: 18 } }, "Dias de treino prontos. Crie aqui ou salve um dia montado, e aplique em qualquer aluno com um toque."),
                    React.createElement(TemplateBuilder, { onSave: addTemplate, library: library }),
                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
                        templates.length === 0 && React.createElement(PremiumEmptyState, { icon: "grid", title: "Nenhum modelo salvo ainda.", sub: "Crie o primeiro acima e reaproveite em qualquer aluno." }),
                        templates.map((t) => React.createElement(TemplateCard, { key: t.id, tpl: t, targetLabel: `${profStudent ? profStudent.name : "—"} · ${dayFull}`, onApply: () => applyTemplate(t, day), onRemove: () => deleteTemplate(t.id) }))))),
                profTab === "recados" && (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 12 } },
                        "Recados",
                        unread > 0 ? ` · ${unread} novo${unread > 1 ? "s" : ""}` : ""),
                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 } },
                        messages.length === 0 && React.createElement(PremiumEmptyState, { icon: "message", title: "Nenhum recado por aqui.", sub: "Os alunos mandam recado direto da \u00E1rea deles \u2014 vai aparecer aqui." }),
                        [...messages].sort((a, b) => (a.date < b.date ? 1 : -1)).map((m) => {
                            const st = students.find((x) => x.id === m.studentId);
                            return (React.createElement("div", { key: m.id, style: { background: C.panel, border: `1px solid ${m.read ? C.line : C.amber}`, borderRadius: 12, padding: "12px 14px" } },
                                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                                    React.createElement("div", { style: { flex: 1, fontFamily: F.body, fontWeight: 600, fontSize: 13.5, color: C.text } }, st ? st.name : "Aluno removido"),
                                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted } }, fmtDateTime(m.date))),
                                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.5, marginTop: 6 } }, m.text),
                                !m.read && React.createElement("button", { onClick: () => markRead(m.id), style: { marginTop: 10, fontFamily: F.mono, fontSize: 11, color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer" } }, "Marcar como lido")));
                        })))),
                profTab === "painel" && (React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: () => setProfTab("biblioteca"), style: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", marginBottom: 22, background: "none", border: "none", borderBottom: `1px solid ${C.line}`, cursor: "pointer", color: C.text, textAlign: "left" } }, React.createElement("span", null, React.createElement("span", { style: { display: "block", fontFamily: F.body, fontWeight: 500, fontSize: 15 } }, "Biblioteca de exerc\u00EDcios"), React.createElement("span", { style: { display: "block", fontFamily: F.body, fontSize: 12, color: "#5A6273", marginTop: 2 } }, library.length + " exerc\u00EDcios com v\u00EDdeo e tag")), React.createElement("span", { style: { color: "#3A404C", fontSize: 18 } }, "\u203A")),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 12 } }, "Backup"),
                    React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                        React.createElement("button", { onClick: exportData, style: { fontFamily: F.mono, fontSize: 12.5, color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "11px 16px", cursor: "pointer" } }, "Exportar dados"),
                        React.createElement("label", { style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "11px 16px", cursor: "pointer" } },
                            "Importar",
                            React.createElement("input", { type: "file", accept: "application/json", onChange: (e) => { importData(e.target.files[0]); e.target.value = ""; }, style: { display: "none" } }))),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 10, lineHeight: 1.5 } }, "Exporta tudo num arquivo .json. Importar substitui os dados atuais pelos do arquivo."),
                    React.createElement("label", { style: { display: "inline-block", marginTop: 10, fontFamily: F.mono, fontSize: 12, color: C.muted, background: "none", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px", cursor: "pointer" } },
                        "Restaurar 1 aluno de um backup antigo",
                        React.createElement("input", { type: "file", accept: "application/json", onChange: (e) => { pickRestoreFile(e.target.files[0]); e.target.value = ""; }, style: { display: "none" } })),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.5 } }, "Pra recuperar um aluno removido sem mexer nos outros — não substitui nada."),
                    restorePicker && React.createElement("div", { style: { marginTop: 10, ...glassPanel, borderRadius: 16, padding: 14 } },
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.06em", color: C.muted, marginBottom: 8 } }, "Quem restaurar deste backup?"),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, restorePicker.candidates.map((s) => React.createElement("button", { key: s.id, onClick: () => restoreStudentFromBackup(s.id), style: { textAlign: "left", fontFamily: F.body, fontSize: 13.5, color: C.text, background: C.panel2, border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, s.name))),
                        React.createElement("button", { onClick: () => setRestorePicker(null), style: { marginTop: 10, fontFamily: F.mono, fontSize: 11.5, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } }, "cancelar")),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, margin: "22px 0 10px" } }, "Marca"),
                    React.createElement("button", { onClick: () => setLogoCard(true), style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "11px 16px", cursor: "pointer" } }, "Selo Cancio Club"),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.5 } }, "Uma imagem do selo do app pra usar como perfil ou postar nas redes."))),
                profTab === "biblioteca" && (React.createElement(LibraryManager, { library: library, onAdd: addLibrary, onUpdate: updateLibrary, onRemove: removeLibrary })))),
            role === "aluno" && !alunoStudent && (() => {
                const boxes = [0, 1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: 56, height: 68, borderRadius: 14, background: C.panel, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 30, color: C.text, boxShadow: codeErr ? "inset 0 0 0 1.5px " + C.warn : codeInput[i] ? "inset 0 0 0 1px #2E333D" : i === codeInput.length ? "inset 0 0 0 1.5px " + C.silver : "inset 0 0 0 1px #1E222A" } }, codeInput[i] || ""));
                const press = (k) => { if (loginBusy) return; haptic("tick"); setCodeErr(false); if (k === "\u232B") setCodeInput((c) => c.slice(0, -1)); else setCodeInput((c) => (c.length >= 4 ? c : c + k)); };
                const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "\u232B"].map((k, i) => React.createElement("button", { key: i, className: "cc-tap", onClick: () => k && press(k), style: { visibility: k ? "visible" : "hidden", padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer", background: k === "\u232B" ? "transparent" : C.panel, color: k === "\u232B" ? C.muted : C.text, fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontSize: 24 } }, k));
                return React.createElement("div", { className: "cc-full-h", style: { display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 400, margin: "-44px auto 0", padding: "calc(40px + env(safe-area-inset-top)) 0 calc(20px + env(safe-area-inset-bottom))", boxSizing: "border-box" } },
                    React.createElement("img", { src: BALL_URL, alt: "", width: 150, height: 150, style: { width: 150, height: 150, marginTop: 24 } }),
                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, letterSpacing: "0.08em", marginTop: 6 } }, "CANCIO CLUB"),
                    React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.muted, marginTop: 8, textAlign: "center" } }, loginBusy ? "Buscando sua ficha\u2026" : codeErr ? "C\u00F3digo n\u00E3o encontrado. Confira com seu professor." : "Digite o c\u00F3digo que o professor te passou"),
                    React.createElement("div", { style: { display: "flex", gap: 10, marginTop: "auto", paddingTop: 28 } }, boxes),
                    React.createElement("div", { style: { width: "100%", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 28 } }, keys),
                    React.createElement("button", { onClick: () => switchRole("prof"), style: { marginTop: 14, fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.muted, background: "none", border: "none", padding: 10, cursor: "pointer" } }, "Sou professor \u203A"));
            })(),
            // esqueleto do que está prestes a aparecer (resumo + treino), em vez de deixar a tela
            // parada enquanto a Edge Function busca o aluno pelo código
            role === "aluno" && alunoStudent && (React.createElement(React.Fragment, null,
                (() => {
                    const prog = workingProgress(list, dayDate);
                    const parts = String(dayName || dayFull || "Treino").split("\u00B7").map((s) => s.trim()).filter(Boolean);
                    const title = (parts[0] || "Treino").toUpperCase();
                    const sub = list.length ? [parts.slice(1).join(" \u00B7 "), prog.done + " de " + prog.total + " s\u00E9ries"].filter(Boolean).join(" \u00B7 ") : "Dia de recupera\u00E7\u00E3o";
                    const sairPill = { flexShrink: 0, height: 44, padding: "0 18px", fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, background: "none", boxShadow: `inset 0 0 0 1px ${C.line2}`, borderRadius: 999, border: "none", cursor: "pointer" };
                    return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 18, marginBottom: 20 } },
                        React.createElement(MirrorGlobe, { size: 108, tile: 9, mask: `linear-gradient(0deg,#000 ${prog.pct}%,transparent ${prog.pct}%)` }),
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.muted } }, String(alunoStudent.name || "").split(" ")[0] + " \u00B7 " + weeklyLine),
                                React.createElement("button", { className: "cc-tap", onClick: logout, style: sairPill }, "Sair")),
                            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 28, lineHeight: 0.95, marginTop: 6, color: "#FFFFFF" } }, title),
                            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.silver, marginTop: 5 } }, sub),
                            weeklyBehind && React.createElement("div", { style: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 6 } }, `Faltam ${weeklyTarget - freqWeek} treino${weeklyTarget - freqWeek > 1 ? "s" : ""} pra bater a meta dessa semana.`)));
                })(),
                alunoStudent.obs && obsChip(alunoStudent.obs),
                React.createElement("div", { style: { display: "flex", gap: 7, marginBottom: 10 } },
                    React.createElement(Pill, { active: alunoTab === "treino", onClick: () => setAlunoTab("treino") }, "Treino"),
                    React.createElement(Pill, { active: alunoTab === "diario", onClick: () => setAlunoTab("diario") }, "Di\u00E1rio"),
                    React.createElement(Pill, { active: alunoTab === "perfil", onClick: () => setAlunoTab("perfil") }, "Perfil")),
                // antes eram links cinza 12px escondidos embaixo do t\u00EDtulo \u2014 f\u00E1ceis de nunca notar.
                // Bot\u00F5es com contorno (mesmo estilo do "Baixar s\u00E9rie"/"Baixar anamnese" do professor)
                // ficam claramente clic\u00E1veis sem competir visualmente com as abas Treino/Di\u00E1rio acima.
                React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" } },
                    alunoTab === "treino" && React.createElement("button", { className: "cc-tap", onClick: () => setDayEntryOpen(true), style: { fontFamily: F.body, fontWeight: 600, fontSize: 12.5, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Trocar treino \u203A"),
                    React.createElement("button", { className: "cc-tap", onClick: () => setLogoCard(true), style: { fontFamily: F.body, fontWeight: 600, fontSize: 12.5, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Selo Cancio Club \u203A")),
                alunoTab === "treino" && (React.createElement(React.Fragment, null,
                React.createElement("div", { onTouchStart: onDaySwipeStart, onTouchEnd: onDaySwipeEnd, style: { display: "flex", gap: 14, marginBottom: 14 } },
                    React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 } },
                        list.length === 0 && React.createElement(PremiumEmptyState, { icon: "rest", title: "O salão está livre hoje. Dia de recuperação ou cardio?", sub: "Sem problema \u2014 registre seu cardio abaixo, se fez." }),
                        list.map((ex) => React.createElement(ExerciseCard, { key: ex.id, ex: ex, role: "aluno", expanded: expanded === ex.id, onToggle: toggleExpanded, isNextUp: !hasLoggedSomething && ex.id === list[0].id, onAddLoad: addLoad, onNote: updateExerciseNote, onRemove: noop, onUpdate: updateExercise, onDeleteRecord: noop, onMove: noop, isFirst: true, isLast: true, tint: tier.tint, dayDate: dayDate })))),
                todayKey === "dom" && freqWeek > 0 && (React.createElement("button", { onClick: buildWeeklySummary, style: { width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 14.5, letterSpacing: "0.04em", color: C.amber, background: "radial-gradient(circle at 50% 0%, #2A2A2D, #0A0A0C)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", border: "none", borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 14 } }, "Gerar Resumo da Semana")),
                React.createElement(CardioSection, { entries: dayCardioEntries, form: cardioForm, onChange: setCardioForm, onAdd: addCardio }),
                list.length === 0 && React.createElement(RecoverySection, { state: dayRecovery, onToggle: toggleRecovery }),
                React.createElement(BottomActionBar, {
                    progress: workingProgress(list, dayDate),
                    label: dayDone ? "Partilhar Treino" : isRestDay ? "Salvar Recuperação" : "Finalizar Treino",
                    canFinalize: hasLoggedSomething || dayDone,
                    promote: hasLoggedSomething || dayDone,
                    hidden: typingActive,
                    onFinalize: () => {
                        flushAllPendingSaves();
                        if (dayDone) {
                            setShareCard({ name: focusStudent.name, workoutName: dayName || dayFull, durationLabel: daySession && daySession.durationSec ? fmtDur(daySession.durationSec) : "—", dateLabel: fmtDate(dayDate), targetDate: dayDate, streak, tint: tier.tint, isRestDay, exercises: list.map((e) => ({ id: e.id, name: e.name, history: e.history, sets: e.sets, setPlan: e.setPlan })) });
                            return;
                        }
                        if (!hasLoggedSomething)
                            return;
                        if (isRestDay)
                            finalizeWorkout("descanso");
                        else
                            setPseModal(true);
                    },
                }),
                !hasLoggedSomething && !dayDone && React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontSize: 10.5, color: C.muted, marginBottom: 100 } }, "registre ao menos 1 s\u00E9rie ou o cardio pra finalizar"),
                hasLoggedSomething && !dayDone && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontFamily: F.body, fontSize: 12, color: C.amber, marginBottom: 100, opacity: 0.9 } },
                    React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: C.amber, flexShrink: 0, animation: "cc-glow 1.6s ease-in-out infinite" } }),
                    "n\u00e3o esque\u00e7a de finalizar o treino pra guardar seu resumo e a sequ\u00eancia"),
                React.createElement(StudentMessages, { messages: messages.filter((m) => m.studentId === alunoId), onSend: sendMessage }))),
                alunoTab === "diario" && React.createElement(DiaryCalendar, { diary: diary, records: records, month: diaryMonth, onMonthChange: changeDiaryMonth }),
                alunoTab === "perfil" && React.createElement(AlunoProfile, { student: alunoStudent, streak: streak, freqWeek: freqWeek, freqTotal: freqTotal, bestStreak: bestStreak, records: records, week: week, dayNames: (data?.dayNames && data.dayNames[focusId]) || {}, assessmentAt: alunoStudent.assessmentAt, onRequestNewAssessment: () => updateStudent(alunoId, { assessmentAt: undefined }) }))),
            role === "prof" && React.createElement("footer", { style: { marginTop: 40, textAlign: "center", fontFamily: F.mono, fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.18)" } }, "CANCIO CLUB"))));
}
export { CancioClub };
