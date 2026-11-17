import React, { useState, useEffect } from "react";
import { AssessmentInicial } from "./components/assessment/AssessmentInicial";
import { CardioSection } from "./components/professor/CardioSection";
import { DadosV3 } from "./components/professor/DadosV3";
import { PSEModal } from "./components/professor/PSEModal";
import { RecoverySection } from "./components/professor/RecoverySection";
import { BibliotecaV3 } from "./components/professor/BibliotecaV3";
import { BulkLinkSheet } from "./components/professor/BulkLinkSheet";
import { VolumeDashboard } from "./components/professor/VolumeDashboard";
import { LogoCard } from "./components/share/LogoCard";
import { SerieExport } from "./components/share/SerieExport";
import { AddButton } from "./components/shared/AddButton";
import { CatalogPicker } from "./components/shared/CatalogPicker";
import { Celebration } from "./components/shared/Celebration";
import { RecordCelebration } from "./components/shared/RecordCelebration";
import { computeDayRecords } from "./utils/records";
import { Disclaimer } from "./components/shared/Disclaimer";
import { DiscoBall } from "./components/shared/DiscoBall";
import { FeedbackModal } from "./components/shared/FeedbackModal";
import { Field } from "./components/shared/FormFields";
import { MirrorGlobe } from "./components/shared/MirrorGlobe";
import { Pill } from "./components/shared/Pill";
import { PremiumEmptyState } from "./components/shared/PremiumEmptyState";
import { SkeletonCard } from "./components/shared/SkeletonCard";
import { Sparkles } from "./components/shared/Sparkles";
import { BottomActionBar } from "./components/student/BottomActionBar";
import { DayEntryScreen } from "./components/student/DayEntryScreen";
import { DayTabs } from "./components/student/DayTabs";
import { DiaryCalendar } from "./components/student/DiaryCalendar";
import { ExerciseCard } from "./components/student/ExerciseCard";
import { WorkoutV3 } from "./components/student/WorkoutV3";
import { HojeV3 } from "./components/student/HojeV3";
import { TabBarV3 } from "./components/student/TabBarV3";
import { FimV3 } from "./components/student/FimV3";
import { AlunosV3 } from "./components/professor/AlunosV3";
import { FichaV3, EditVolumeBlock } from "./components/professor/FichaV3";
import { ExerciseSheet } from "./components/professor/ExerciseSheet";
import { DayToolsV3, VolumeFold } from "./components/professor/DayToolsV3";
import { rendSummary } from "./utils/rendimento";
import { RendimentoV3 } from "./components/professor/RendimentoV3";
import { AulaV3 } from "./components/professor/AulaV3";
import { StudentMessages } from "./components/student/StudentMessages";
import { ProfInbox } from "./components/professor/ProfInbox";
import { Reassessment, reassessDue } from "./components/student/Reassessment";
import { MyData } from "./components/student/MyData";
import { MemberCard } from "./components/student/MemberCard";
import { StudentProfile, Avatar } from "./components/student/StudentProfile";
import { assignMemberNumbers } from "./utils/members";
import { ccConfirm, ccAlert } from "./utils/confirm";
import { restrictionFor } from "./utils/restrictions";
import { printStudent } from "./utils/printStudent";
import { askNotify, canNotify, notify, setBadge } from "./utils/notify";
import { setActiveSet } from "./hooks/useActiveSet";
import { LS_KEY, flushAllPendingSaves, loadData, saveLocal, throttle } from "./hooks/useLocalData";
import { callStudentApi, deleteStudentFromCloud, saveGlobalToCloud, saveStudentToCloud, sb } from "./lib/supabaseClient";
import { useDataStore } from "./stores/useDataStore";
import { BALL_URL, SIL_URL, C, DAYS, EASE, F, JS2KEY, MIRROR_GRID, NON_COUNTING_KINDS, PILL_ON, REST_PHRASES, SESS_KEY, TRAIN_PHRASES, flatPanel, glassPanel } from "./styles/tokens";
import { mapAnamneseToFicha } from "./utils/assessment";
import { playDisco, playFinishChime } from "./utils/audio";
import { fmtDate, fmtDateTime, fmtDur, fmtVolume, isThisWeek, isoOf, parseWeeklyTarget, todayISO } from "./utils/date";
import { mergeCloudRows, mergeLocalActivityInto, mergeWorkoutsForStudent, splitGlobalForCloud, splitStudentForCloud } from "./utils/merge";
import { genCode, greeting, haptic, noop, pickDailyPhrase, uid, uidShort } from "./utils/misc";
import { seed } from "./utils/seedData";
import { computeStreak, lastCheckinLabel, streakTier, trainingWds } from "./utils/streak";
import { buildDiary, computeRecords, daySummary, defaultSetPlan, emptyWeek, sortedHistory, workingProgress } from "./utils/workout";
import { buildWeeklyVolumeReport, plannedGroupVolume } from "./utils/volumeCalculator";

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
    const [inboxFocus, setInboxFocus] = useState(null);
    const [profView, setProfView] = useState("home");
    const [fichaTab, setFichaTab] = useState("treino");
    const [rendEx, setRendEx] = useState(null);
    const [noteDraft, setNoteDraft] = useState("");
    const [serieOpen, setSerieOpen] = useState(false);
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
    const [exSheet, setExSheet] = useState(null); // design v3 · gavetas do Editar ficha: { mode: "add" } | { mode: "swap", ex }
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
    const [recordCel, setRecordCel] = useState(null);
    // Trava da comemoração de recorde: o campo de carga salva sozinho a cada toque no +/- e a cada
    // 800ms de digitação (auto-save), sempre comparando com o melhor histórico. Sem essa trava, ajustar
    // o peso aos poucos (20 -> 21 -> 22 -> 23) reabre a animação em TELA CHEIA a cada toque, porque cada
    // valor novo já é "recorde" em relação ao histórico — o que trava o aluno numa sequência infinita de
    // comemorações e nunca deixa alcançar o botão "Finalizar treino" embaixo. Só comemora uma vez por
    // exercício por dia; some sozinha quando o dia muda (é só um Set em memória, não precisa persistir).
    const celebratedRef = React.useRef(new Set());
    // trava contra ressurreição: se um removeStudent já rodou pra esse id, nenhum sync em voo (que
    // capturou um `next` de ANTES da remoção, num closure antigo) pode mais recriar a linha dele na
    // nuvem — sem isso, deletar e a nuvem "trazer de volta" segundos depois é uma corrida real, não
    // acidente raro: syncStudentToCloud e o merge de fetchAllStudentsAfterAuth checam este Set.
    const deletedStudentIdsRef = React.useRef(new Set());
    const [workoutStart, setWorkoutStart] = useState(null); // marcado sozinho na 1ª série do dia — sem botão, sem cronômetro visível
    const [pseModal, setPseModal] = useState(null);
    const [fimOpen, setFimOpen] = useState(false); // tela Fim do treino (FimV3), só pro aluno
    const [cardioForm, setCardioForm] = useState({ activity: "", minutes: "" });
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [shareCard, setShareCard] = useState(null);
    const [logoCard, setLogoCard] = useState(false);
    const [myDataOpen, setMyDataOpen] = useState(false);
    const [memberCardOpen, setMemberCardOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [reassessOpen, setReassessOpen] = useState(false);
    const [advOpen, setAdvOpen] = useState(false);
    const [notifPerm, setNotifPerm] = useState(() => (canNotify() ? Notification.permission : "unsupported"));
    // recados que chegam pra quem está logado: badge no ícone + aviso do sistema se o app estiver em 2º plano
    const seenMsgRef = React.useRef(null);
    useEffect(() => {
        const all = (data && data.messages) || [];
        const incoming = all.filter((m) => (role === "aluno" ? m.studentId === alunoId && m.fromProf : !m.fromProf));
        setBadge(incoming.filter((m) => !m.read).length);
        const ids = new Set(incoming.map((m) => m.id));
        if (seenMsgRef.current) {
            const fresh = incoming.filter((m) => !seenMsgRef.current.has(m.id) && !m.read);
            if (fresh.length) { const m = fresh[fresh.length - 1]; const st = (data.students || []).find((x) => x.id === m.studentId); notify(role === "aluno" ? "Recado do professor" : "Recado de " + (st ? st.name.split(" ")[0] : "aluno"), m.text); }
        }
        seenMsgRef.current = ids;
    }, [data && data.messages, role, alunoId]);
    const notifButton = notifPerm === "default" && React.createElement("button", { onClick: async () => setNotifPerm(await askNotify()), style: { minHeight: 44, width: "100%", marginBottom: 12, borderRadius: 10, border: "none", background: C.panel2, color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 13, cursor: "pointer" } }, "Ativar avisos de recado no celular");
    const [assessmentJustDone, setAssessmentJustDone] = useState(false);
    const [alunoTab, setAlunoTab] = useState("hoje"); // design v3: "hoje" | "treino" | "recados" | "diario" (Perfil abre o StudentProfile)
    // abas escondidas com o treino em andamento (DECISOES.md · 4); voltam ao rolar pra cima
    const [tabsPeek, setTabsPeek] = useState(false);
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => { const y = window.scrollY; if (y < last - 24) { setTabsPeek(true); last = y; } else if (y > last + 24) { setTabsPeek(false); last = y; } };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
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
    const [rosterLoaded, setRosterLoaded] = useState(false); // true = fetchAllStudentsAfterAuth já trouxe a lista da nuvem nesta abertura
    // design v3 (fase 4a): aluno "ao vivo" aberto pelo professor, e o relógio que atualiza os minutos e o "na pista"
    const [liveStudentId, setLiveStudentId] = useState(null);
    const [liveNow, setLiveNow] = useState(() => Date.now());
    // volume planejado no momento em que a edição da ficha abriu — base do "+3 / −0,6" no bloco de volume
    const editBaselineRef = React.useRef(null);
    const cloudSynced = useDataStore((s) => s.cloudSynced); // true = última gravação chegou na nuvem; false = só ficou salva localmente por enquanto
    const setCloudSynced = useDataStore((s) => s.setCloudSynced);
    const localFull = useDataStore((s) => s.localFull); // true = localStorage estourou a cota (ver saveLocal) — rede de segurança offline caiu
    const setLocalFull = useDataStore((s) => s.setLocalFull);
    const [isStandalone, setIsStandalone] = useState(true);
    const [profMenuOpen, setProfMenuOpen] = useState(false); // assume true até checar, pra não piscar o banner em quem já instalou
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
            const inst = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; setIsStandalone(inst || localStorage.getItem("cancio:installHintSeen") === "1"); if (!inst) localStorage.setItem("cancio:installHintSeen", "1");
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
    // ao entrar na edição da ficha (ou trocar de aluno), guarda o volume planejado como base do "+3 / −0,6"
    useEffect(() => { editBaselineRef.current = fichaTab === "treino" && data && profId ? plannedGroupVolume((data.workouts && data.workouts[profId]) || {}).values : null; }, [fichaTab, profId]);
    // salvamento agora é imperativo e granular — cada função avisa explicitamente o que mudou,
    // em vez de um efeito genérico observar `data` inteiro e decidir sozinho o que sincronizar
    // useCallback aqui não é só micro-otimização: são a base de que addLoad/updateExercise/etc.
    // dependem — sem serem estáveis, nenhum React.memo nos cards de exercício segura nada.
    // Trava dos dados de exemplo: a checagem de isSeed em saveGlobalToCloud nunca disparava, porque
    // splitGlobalForCloud não leva o isSeed adiante — e a biblioteca e os modelos de exemplo foram
    // parar na linha global da nuvem. A checagem agora é aqui, antes de montar o payload.
    const syncGlobalToCloud = React.useCallback((next) => { if (next && next.isSeed) return; saveGlobalToCloud(splitGlobalForCloud(next)).then((ok) => setCloudSynced(ok !== false)); }, []);
    const syncStudentToCloud = React.useCallback((next, sid) => {
        if (next && next.isSeed)
            return; // dados de exemplo nunca vão pra nuvem (o caminho do aluno, pela Edge Function, não checava)
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
    const freqWeek = focusCheckins.filter(isThisWeek).length;
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
    const curMonth = todayISO().slice(0, 7); // mês no fuso do aparelho (toISOString é UTC: virava o mês às 21h no último dia)
    const freezeInfo = (data?.freezes && data.freezes[focusId] && data.freezes[focusId].month === curMonth) ? data.freezes[focusId] : { month: curMonth, used: 0 };
    const freezesLeft = Math.max(0, 3 - freezeInfo.used);
    const studentStats = (sid) => { const wk = (data.workouts && data.workouts[sid]) || emptyWeek(); const ch = (data.checkins && data.checkins[sid]) || []; const twd = trainingWds(wk, data.cardio && data.cardio[sid]); return { streak: computeStreak(twd, new Set(ch)), week: ch.filter(isThisWeek).length, total: ch.length, last: lastCheckinLabel(ch) }; };
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
    const unread = messages.filter((m) => !m.read && !m.fromProf).length;
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
    // treino em andamento na aba Treino -> abas escondidas, a não ser que o aluno role pra cima (tabsPeek)
    const tabsHidden = role === "aluno" && alunoTab === "treino" && list.length > 0 && hasSetOnDay && !dayDone && !tabsPeek;
    const isRestDay = list.length === 0 && !hasCardioOnDay && hasRecoveryOnDay;
    const buildWeeklySummary = () => {
        let weeklyVolume = 0;
        DAYS.forEach((d) => {
            (week[d.key] || []).forEach((ex) => {
                ex.history.forEach((h) => {
                    if (isThisWeek(h.date))
                        weeklyVolume += daySummary(h).volume;
                });
            });
        });
        const weeklyTimeSec = focusSessions.filter((s) => isThisWeek(s.date) && s.durationSec).reduce((acc, s) => acc + s.durationSec, 0);
        const hours = Math.floor(weeklyTimeSec / 3600);
        const mins = Math.round((weeklyTimeSec % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
        const sess7 = ((data.sessions && data.sessions[focusId]) || []).filter((x) => isThisWeek(x.date));
        const dnW = (data.dayNames && data.dayNames[focusId]) || {};
        const weekDays = DAYS.map((d) => { const se = sess7.find((x) => x.day === d.key); const sets = se ? (week[d.key] || []).reduce((n, e) => { const h = (e.history || []).find((hh) => hh.date === se.date); return n + (h && h.entries ? h.entries.filter((en) => !NON_COUNTING_KINDS.has(en.kind)).length : 0); }, 0) : 0; return { short: d.short.toUpperCase(), name: se ? (dnW[d.key] || d.full) : null, sets }; });
        setShareCard({ isWeeklySummary: true, name: focusStudent.name, freqWeek, streak, tint: tier.tint, dateLabel: "Nesta semana", weeklyVolume, weeklyTime: timeStr, weekDays, weeklyTarget: parseWeeklyTarget(focusStudent && focusStudent.freqWeekly) });
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
                // at: quando a série foi gravada — nas mesclas (app e Edge Function) a edição mais nova vence
                const newSetEntry = { setId: entry.setId, kind: entry.kind, targetReps: entry.targetReps, load: entry.load, reps: entry.reps, at: Date.now() };
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
        // 9c: recorde não é mais celebrado no meio do treino (um toque errado na carga virava "recorde").
        // A decisão acontece em finishWorkout via computeDayRecords.
        void cel;
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
    // Modo aula (design v3): anotações de técnica do professor no dia do exercício — vão pro histórico
    // do aluno (campo techNotes, separado da nota do próprio aluno)
    const updateTechNotes = React.useCallback((exId, dateStr, notes) => {
        setData((p) => {
            const w = { ...p.workouts[focusId] };
            w[day] = (w[day] || []).map((e) => {
                if (e.id !== exId) return e;
                const hist = (e.history || []).map((h) => ({ ...h }));
                const idx = hist.findIndex((h) => h.date === dateStr && Array.isArray(h.entries));
                if (idx >= 0) hist[idx] = { ...hist[idx], techNotes: notes };
                else hist.push({ date: dateStr, entries: [], techNotes: notes });
                return { ...e, history: sortedHistory(hist) };
            });
            const next = { ...p, workouts: { ...p.workouts, [focusId]: w } };
            syncStudentToCloud(next, focusId);
            return next;
        });
    }, [focusId, day, syncStudentToCloud]);
    // gavetas do Editar ficha (design v3): pôr da biblioteca/catálogo, trocar mantendo a prescrição e
    // tirar — o exercício que sai com histórico vai pras fases arquivadas, pra não perder os registros
    const archiveRetired = (p, sid, exDay, old, label) => (old.history || []).length ? { ...(p.archives || {}), [sid]: [...(((p.archives || {})[sid]) || []), { id: uid(), label, date: new Date().toISOString(), week: { [exDay]: [JSON.parse(JSON.stringify(old))] } }] } : p.archives;
    const addExerciseFrom = (o) => { if (!focusId) return; const ex = { id: uid(), name: o.name, sets: parseInt(o.sets) || 3, reps: o.reps || "10", rest: o.rest, url: o.url, catalogId: o.catalogId, setPlan: (o.setPlan && o.setPlan.length ? o.setPlan : defaultSetPlan(o.sets || 3, o.reps || "10")).map((x) => ({ ...x, id: uidShort() })), history: [] }; setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; w[day] = [...(w[day] || []), ex]; const next = { ...p, workouts: { ...p.workouts, [focusId]: w } }; syncStudentToCloud(next, focusId); return next; }); setExSheet(null); };
    const swapExercise = (old, entry) => { if (!focusId) return; const lib = (data.library || []).find((l) => l.name.trim().toLowerCase() === entry.nome.trim().toLowerCase()); const nu = { id: uid(), name: entry.nome, sets: old.sets, reps: old.reps, rest: old.rest, catalogId: entry.id, url: lib && lib.url ? lib.url : undefined, setPlan: (old.setPlan || []).map((x) => ({ ...x, id: uidShort() })), history: [] }; setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; w[day] = (w[day] || []).map((e) => (e.id === old.id ? nu : e)); const next = { ...p, workouts: { ...p.workouts, [focusId]: w }, archives: archiveRetired(p, focusId, day, old, "Trocado: " + old.name + " → " + entry.nome) }; syncStudentToCloud(next, focusId); return next; }); setExSheet(null); setExpanded(null); };
    const retireExercise = (old) => { if (!focusId) return; setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; w[day] = (w[day] || []).filter((e) => e.id !== old.id); const next = { ...p, workouts: { ...p.workouts, [focusId]: w }, archives: archiveRetired(p, focusId, day, old, "Saiu da ficha: " + old.name) }; syncStudentToCloud(next, focusId); return next; }); setExSheet(null); setExpanded(null); };
    // "Trocar treino" do dia (Editar ficha): troca a lista inteira; o que sai com registros vai pras fases arquivadas
    const replaceDayWith = (exs, name) => { if (!focusId) return; const fresh = (exs || []).map((e) => ({ id: uid(), name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, catalogId: e.catalogId, setPlan: (e.setPlan && e.setPlan.length ? e.setPlan : defaultSetPlan(e.sets, e.reps)).map((x) => ({ ...x, id: uidShort() })), history: [] })); setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; const old = (w[day] || []).filter((e) => (e.history || []).length); w[day] = fresh; const dn = { ...(p.dayNames || {}) }; const sd = { ...(dn[focusId] || {}) }; if (name) sd[day] = name; else if (name === null) delete sd[day]; dn[focusId] = sd; const arch = old.length ? { ...(p.archives || {}), [focusId]: [...(((p.archives || {})[focusId]) || []), { id: uid(), label: "Antes da troca: " + ((DAYS.find((d) => d.key === day) || {}).full || day), date: new Date().toISOString(), week: { [day]: JSON.parse(JSON.stringify(old)) } }] } : p.archives; const next = { ...p, workouts: { ...p.workouts, [focusId]: w }, dayNames: dn, archives: arch }; syncStudentToCloud(next, focusId); return next; }); setExpanded(null); };
    const swapDayWith = (k) => { if (!focusId || k === day) return; setData((p) => { const w = { ...(p.workouts[focusId] || emptyWeek()) }; const a = w[day] || [], b = w[k] || []; w[day] = b; w[k] = a; const dn = { ...(p.dayNames || {}) }; const sd = { ...(dn[focusId] || {}) }; const na = sd[day], nb = sd[k]; if (nb) sd[day] = nb; else delete sd[day]; if (na) sd[k] = na; else delete sd[k]; dn[focusId] = sd; const cd = { ...(p.cardio || {}) }; const sc = { ...(cd[focusId] || {}) }; const ca = sc[day], cb = sc[k]; if (cb) sc[day] = cb; else delete sc[day]; if (ca) sc[k] = ca; else delete sc[k]; cd[focusId] = sc; const next = { ...p, workouts: { ...p.workouts, [focusId]: w }, dayNames: dn, cardio: cd }; syncStudentToCloud(next, focusId); return next; }); setExpanded(null); };
    const saveDayTemplateNamed = (name) => { const exs = (week[day] || []).map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, catalogId: e.catalogId, setPlan: e.setPlan })); if (!name || !exs.length) return; setData((p) => { const next = { ...p, templates: [...(p.templates || []), { id: uid(), name, exercises: exs }] }; syncGlobalToCloud(next); return next; }); };
    const openSwap = React.useCallback((ex) => setExSheet({ mode: "swap", ex }), []);
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
    const applyTemplate = (tpl, targetDay, sid = profId) => { setData((p) => { const w = { ...(p.workouts[sid] || emptyWeek()) }; const adds = tpl.exercises.map((e) => ({ id: uid(), name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, setPlan: (e.setPlan && e.setPlan.length ? e.setPlan : defaultSetPlan(e.sets, e.reps)).map((s) => ({ ...s, id: uidShort() })), history: [] })); w[targetDay] = [...(w[targetDay] || []), ...adds]; const dn = { ...(p.dayNames || {}) }; const sd = { ...(dn[sid] || {}) }; sd[targetDay] = tpl.name; dn[sid] = sd; const next = { ...p, workouts: { ...p.workouts, [sid]: w }, dayNames: dn }; syncStudentToCloud(next, sid); return next; }); };
    const addTemplate = (name, exs) => setData((p) => { const next = { ...p, templates: [...(p.templates || []), { id: uid(), name, exercises: exs }] }; syncGlobalToCloud(next); return next; });
    const updateTemplate = (id, name, exs) => setData((p) => { const next = { ...p, templates: (p.templates || []).map((t) => (t.id === id ? { ...t, name, exercises: exs } : t)) }; syncGlobalToCloud(next); return next; });
    const deleteTemplate = (id) => setData((p) => { const next = { ...p, templates: (p.templates || []).filter((t) => t.id !== id) }; syncGlobalToCloud(next); return next; });
    const archiveWorkout = () => { const label = archLabel.trim() || `Treino ${fmtDate(todayISO())}`; const snap = JSON.parse(JSON.stringify((data.workouts && data.workouts[profId]) || emptyWeek())); setData((p) => { const next = { ...p, archives: { ...(p.archives || {}), [profId]: [...(((p.archives || {})[profId]) || []), { id: uid(), label, date: new Date().toISOString(), week: snap }] } }; syncStudentToCloud(next, profId); return next; }); setArchLabel(""); };
    // Restaurar troca a semana inteira do aluno (com o histórico atual). Antes era um toque só, sem
    // confirmação, colado no "×". Agora confirma E arquiva a ficha atual antes de trocar — assim
    // restaurar por engano dá pra desfazer restaurando o arquivo "Antes de restaurar…".
    const restoreArchive = async (arc) => {
        if (!(await ccConfirm(`A ficha atual vai ser trocada por "${arc.label}". Ela fica guardada como uma fase arquivada, pra você poder voltar.`, { title: "Restaurar esta fase?", ok: "Restaurar" })))
            return;
        const wk = JSON.parse(JSON.stringify(arc.week)); DAYS.forEach((d) => (wk[d.key] || []).forEach((e) => { e.id = uid(); }));
        setData((p) => {
            const current = JSON.parse(JSON.stringify((p.workouts && p.workouts[profId]) || emptyWeek()));
            const backup = { id: uid(), label: `Antes de restaurar "${arc.label}" (${fmtDate(todayISO())})`, date: new Date().toISOString(), week: current };
            const next = { ...p, workouts: { ...p.workouts, [profId]: wk }, archives: { ...(p.archives || {}), [profId]: [...(((p.archives || {})[profId]) || []), backup] } };
            syncStudentToCloud(next, profId); return next;
        });
    };
    const deleteArchive = async (id) => {
        const arc = ((data.archives || {})[profId] || []).find((a) => a.id === id);
        if (!(await ccConfirm(`"${arc ? arc.label : "Esta fase"}" vai ser apagada. Não pode ser desfeito.`, { title: "Apagar esta fase?", ok: "Apagar", danger: true })))
            return;
        setData((p) => { const next = { ...p, archives: { ...(p.archives || {}), [profId]: (((p.archives || {})[profId]) || []).filter((a) => a.id !== id) } }; syncStudentToCloud(next, profId); return next; });
    };
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
    const finalizeWorkout = (effort, opts = {}) => {
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
        const setsDone = list.reduce((n, e) => { const h = (e.history || []).find((hh) => hh.date === dayDate); return n + (h && h.entries ? h.entries.filter((en) => !NON_COUNTING_KINDS.has(en.kind)).length : 0); }, 0);
        const weeklyTargetF = parseWeeklyTarget(focusStudent && focusStudent.freqWeekly);
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
        // design v3: a tela Fim (FimV3) já mostrou o resumo — salva e devolve os dados do card, sem comemoração
        if (opts.silent) return shareData;
        if (isRest) {
            setCelebration({ title: "PISTA FECHADA", subtitle: "DIA DE RECUPERAÇÃO", stats: [[String(freqWeek + 1), "treinos na semana"], [String(sStreak || 0), "dias seguidos"]], weekDone: Math.min(freqWeek + 1, weeklyTargetF || 0), weekTarget: weeklyTargetF || 0, sound: soundOn ? playFinishChime : null, then: () => setShareCard(shareData) });
        }
        else {
            const records = computeDayRecords(list, dayDate);
            if (records.length) {
                haptic("record");
                setRecordCel({ records, sound: soundOn ? playDisco : null, shareData: { ...shareData, records } });
                return;
            }
            setCelebration({ title: (sWorkoutName || "Treino").toUpperCase(), subtitle: "TREINO CONCLUÍDO", stats: [durationSec ? [fmtDur(durationSec), "tempo"] : null, [String(setsDone), "séries"], totalVolume > 0 ? [Math.round(totalVolume).toLocaleString("pt-BR"), "kg levantados"] : null].filter(Boolean), sets: setsDone, weekDone: Math.min(freqWeek + 1, weeklyTargetF || 0), weekTarget: weeklyTargetF || 0, sound: soundOn ? playFinishChime : null, then: () => setShareCard(shareData) });
        }
    };
    const submitFeedback = (sid, text) => setData((p) => { const sess = { ...(p.sessions || {}) }; sess[focusId] = (sess[focusId] || []).map((s) => (s.id === sid ? { ...s, feedback: text } : s)); const next = { ...p, sessions: sess }; syncStudentToCloud(next, focusId); return next; });
    const sendMessage = (text, sid) => setData((p) => { const next = { ...p, messages: [...(p.messages || []), { id: uid(), studentId: sid || focusId, text, date: new Date().toISOString(), read: false }] }; syncStudentToCloud(next, sid || focusId); return next; });
    const replyMessage = (text, sid) => setData((p) => { const next = { ...p, messages: [...(p.messages || []), { id: uid(), studentId: sid, fromProf: true, text, date: new Date().toISOString(), read: false }] }; syncStudentToCloud(next, sid); return next; });
    const markThreadRead = (sid) => setData((p) => { const next = { ...p, messages: (p.messages || []).map((m) => (m.studentId === sid && !m.fromProf ? { ...m, read: true } : m)) }; syncStudentToCloud(next, sid); return next; });
    const markProfRead = (sid) => setData((p) => { const next = { ...p, messages: (p.messages || []).map((m) => (m.studentId === sid && m.fromProf && !m.read ? { ...m, read: true } : m)) }; syncStudentToCloud(next, sid); return next; });
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
        r.onload = async () => {
            try {
                const d = JSON.parse(r.result);
                const valid = d && Array.isArray(d.students) && d.students.every((s) => s && typeof s.id === "string" && typeof s.name === "string");
                if (!valid) {
                    ccAlert("Arquivo de backup inválido — não foi possível restaurar.");
                    return;
                }
                // alunos que estão na nuvem mas não no backup: antes ficavam lá e voltavam no próximo
                // login do professor. Agora entram na confirmação e são apagados junto.
                const keepIds = new Set(d.students.map((s) => "student_" + s.id));
                let extraIds = [];
                if (sb) {
                    try {
                        const { data: rows, error } = await sb.from("cancio").select("id").like("id", "student_%");
                        if (error) throw error;
                        extraIds = (rows || []).map((row) => row.id).filter((id) => !keepIds.has(id)).map((id) => id.slice("student_".length));
                    }
                    catch (e) {
                        console.error("Cancio: não deu pra listar os alunos da nuvem antes de restaurar:", e);
                    }
                }
                const extraMsg = extraIds.length ? ` ${extraIds.length} aluno${extraIds.length === 1 ? "" : "s"} que não ${extraIds.length === 1 ? "está" : "estão"} no backup ${extraIds.length === 1 ? "será apagado" : "serão apagados"} da nuvem.` : "";
                // restaurar substitui TODOS os dados atuais (local e nuvem) — irreversível, por isso confirma antes
                if (!(await ccConfirm(`Isso vai substituir todos os dados atuais por este backup (${d.students.length} aluno${d.students.length === 1 ? "" : "s"}).${extraMsg} Não pode ser desfeito.`, { title: "Restaurar backup?", ok: "Substituir dados", danger: true })))
                    return;
                delete d.isSeed;
                setData(d);
                saveGlobalToCloud(splitGlobalForCloud(d));
                d.students.forEach((s) => saveStudentToCloud(splitStudentForCloud(d, s)));
                extraIds.forEach((id) => { deletedStudentIdsRef.current.add(id); deleteStudentFromCloud(id); });
            }
            catch (e) {
                console.error("Cancio: falha ao importar backup:", e);
                ccAlert("Não foi possível ler este arquivo como backup do Cancio Club.");
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
        r.onload = async () => {
            try {
                const d = JSON.parse(r.result);
                if (!d || !Array.isArray(d.students) || !d.students.length) {
                    ccAlert("Esse arquivo não tem nenhum aluno pra restaurar.");
                    return;
                }
                setRestorePicker({ backup: d, candidates: d.students });
            }
            catch (e) {
                ccAlert("Não foi possível ler este arquivo como backup do Cancio Club.");
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
        ccAlert(codeChanged ? `${src.name} restaurado(a) com um novo código: ${code} (o código antigo já estava em uso por outro aluno).` : `${src.name} restaurado(a) com o código original: ${code}.`);
    };
    const [loginBusy, setLoginBusy] = useState(false);
    // funde os dados de UM aluno vindos da nuvem no estado — usado tanto no login instantâneo
    // (checagem silenciosa em segundo plano) quanto no fallback de busca por código
    const mergeFoundStudentInto = (prev, found) => {
        // aparelho que só tinha os dados de EXEMPLO: o aluno real entra numa base vazia. Antes ele
        // entrava junto com a "Exemplo · Maria" e o dado inteiro continuava marcado isSeed — por isso
        // nada do aluno era salvo no aparelho (sem rede de segurança offline).
        const p = prev && prev.isSeed ? { students: [], checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {}, cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [], library: [], templates: [], soundOn: prev.soundOn !== false, activeStudentId: found.id } : prev;
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
                    // só se for o MESMO aluno (mesmo id): a aluna de exemplo usa o código 1234, que pode
                    // coincidir com o de um aluno real na nuvem — aí não é atualização, é outra pessoa
                    if (found && found.id === s.id)
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
    const logout = () => { setAlunoId(null); setExpanded(null); setAlunoTab("hoje"); setProfileOpen(false); };
    // AUTENTICAÇÃO REAL DO SUPABASE — a senha é verificada de verdade pelo Supabase Auth (nunca
    // gravada no código; só o e-mail da conta única de professor é fixo).
    const fetchAllStudentsAfterAuth = async (quiet) => {
        if (!quiet) setLoadingRoster(true); // quiet: a atualização de 30 s do "na pista" não mostra carregando
        try {
            // a linha "global" (biblioteca, modelos...) vem junto: num aparelho que só tinha os dados de
            // exemplo, é ela que substitui a biblioteca/modelos de exemplo (ver `local` logo abaixo)
            const { data: allRows, error } = await sb.from("cancio").select("*").or("id.eq.global,id.like.student_%");
            if (error)
                throw error;
            // ignora qualquer linha de aluno já removido por aqui — cobre o caso raro de a busca rodar
            // antes do DELETE se propagar de verdade na nuvem (mesma trava de syncStudentToCloud)
            const rows = (allRows || []).filter((r) => !(r.data && deletedStudentIdsRef.current.has(r.data.id)));
            if (rows && rows.length > 0) {
                const cloud = mergeCloudRows(rows);
                setData((p) => {
                    // Dados de EXEMPLO (aparelho sem nada salvo: "Exemplo · Maria", biblioteca de exemplo)
                    // nunca entram na mescla. Antes a aluna de exemplo virava "aluno criado aqui e ainda
                    // não sincronizado" e era GRAVADA na nuvem, porque o objeto mesclado perdia o isSeed.
                    const local = p && !p.isSeed ? p : {};
                    const cloudIds = new Set(cloud.students.map((s) => s.id));
                    const localOnly = (local.students || []).filter((s) => !cloudIds.has(s.id)); // preserva aluno recém-criado que ainda não sincronizou
                    // Aluno que existe nos dois lados: a nuvem é a base (cadastro, fases, nomes de dia...).
                    // Antes, um updatedAt GLOBAL deste aparelho (qualquer mudança, de qualquer aluno) era
                    // comparado com o updatedAt de CADA aluno na nuvem — e a cópia local antiga "vencia",
                    // descartando check-ins/sessões que o aluno registrou no celular dele. O que é registro
                    // de atividade (check-ins, sessões, cardio, recuperação, recados) agora é somado dos
                    // dois lados em mergeLocalActivityInto, nunca escolhido por timestamp.
                    // biblioteca/modelos/som: os deste aparelho continuam valendo (é onde o professor edita);
                    // só num aparelho com dados de exemplo é que vêm da linha global da nuvem
                    const g = p && !p.isSeed ? p : cloud;
                    const merged = { ...cloud, profKey: g.profKey, soundOn: g.soundOn, library: g.library, templates: g.templates, activeStudentId: local.activeStudentId || (cloud.students[0] && cloud.students[0].id), students: [...cloud.students, ...localOnly] };
                    const activityAdded = new Set();
                    cloud.students.forEach((s) => { if (mergeLocalActivityInto(merged, local, s.id)) activityAdded.add(s.id); });
                    localOnly.forEach((s) => {
                        merged.checkins[s.id] = (local.checkins && local.checkins[s.id]) || [];
                        merged.bestStreak[s.id] = (local.bestStreak && local.bestStreak[s.id]) || 0;
                        merged.archives[s.id] = (local.archives && local.archives[s.id]) || [];
                        merged.sessions[s.id] = (local.sessions && local.sessions[s.id]) || [];
                        merged.dayNames[s.id] = (local.dayNames && local.dayNames[s.id]) || {};
                        merged.cardio[s.id] = (local.cardio && local.cardio[s.id]) || {};
                        merged.cardioLog[s.id] = (local.cardioLog && local.cardioLog[s.id]) || [];
                        merged.recoveryLog[s.id] = (local.recoveryLog && local.recoveryLog[s.id]) || {};
                        merged.freezes[s.id] = (local.freezes && local.freezes[s.id]) || { month: "", used: 0 };
                        mergeLocalActivityInto(merged, local, s.id); // traz os recados locais desse aluno também
                    });
                    // treino nunca escolhe um lado só: mescla local+nuvem por dia/exercício/data/série pra
                    // TODO aluno, ganhando ou perdendo a corrida de metadado acima — dado de cadastro
                    // (nome, objetivo...) pode ser LWW sem problema, dado de treino não pode. Só reenvia
                    // pra nuvem quem de fato ganhou algo novo na mescla (evita 1 request por aluno do
                    // roster inteiro toda vez que o professor loga, quando quase sempre já está tudo igual).
                    const needsCloudSync = [];
                    merged.students.forEach((s) => {
                        const cloudWk = cloud.workouts[s.id] || {};
                        const mergedWk = mergeWorkoutsForStudent((local.workouts && local.workouts[s.id]) || {}, cloudWk);
                        merged.workouts[s.id] = mergedWk;
                        if (activityAdded.has(s.id) || JSON.stringify(mergedWk) !== JSON.stringify(cloudWk))
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
            setRosterLoaded(true); // só agora a lista local reflete a nuvem — libera a numeração de membros
        }
        catch (e) {
            console.error("Cancio: falha ao buscar todos os alunos:", e);
        }
        finally {
            setLoadingRoster(false);
        }
    };
    // "Na pista" a cada 30 s (DECISOES.md · 2): com o professor na tela de Alunos (ou Ao vivo) e o app
    // visível, busca os alunos de novo em silêncio; parado em segundo plano. Só leitura na nuvem.
    const fetchRosterRef = React.useRef(null);
    fetchRosterRef.current = fetchAllStudentsAfterAuth;
    useEffect(() => {
        if (role !== "prof" || !profUnlocked || !rosterLoaded || profTab !== "alunos" || profView !== "home") return;
        const tick = () => { if (document.visibilityState !== "visible") return; setLiveNow(Date.now()); fetchRosterRef.current && fetchRosterRef.current(true); };
        const id = setInterval(tick, 30000);
        const onVis = () => { if (document.visibilityState === "visible") tick(); };
        document.addEventListener("visibilitychange", onVis);
        return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
    }, [role, profUnlocked, rosterLoaded, profTab, profView]);
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
        setRosterLoaded(false);
        setProfKeyInput("");
        setProfKeyErr("");
        setData((p) => ({ ...p, students: [], checkins: {}, bestStreak: {}, archives: {}, sessions: {}, dayNames: {}, cardio: {}, cardioLog: {}, recoveryLog: {}, freezes: {}, workouts: {}, messages: [], activeStudentId: null }));
    };
    const switchRole = (r) => { if (r === "aluno")
        setProfUnlocked(false); setRole(r); try { localStorage.setItem("cancio:lastRole", r); } catch (e) { } setExpanded(null); setAdding(false); setPickTpl(false); setSavingTpl(false); };
    const profStudent = students.find((s) => s.id === profId);
    const alunoStudent = students.find((s) => s.id === alunoId);
    const alunoObs = alunoStudent && alunoStudent.obs ? alunoStudent.obs.split(/\n{2,}/).filter((p) => !/\(relatado pelo aluno\)/i.test(p)).join("\n\n").trim() : "";
    // número de membro por ordem de entrada: o professor numera quem ainda não tem e sincroniza com a ficha do aluno
    const numberedRef = React.useRef(false);
    // Só depois de rosterLoaded: profUnlocked vira true ANTES da lista da nuvem chegar (sessão
    // restaurada), e numerar com a lista antiga deste aparelho enviava a ficha velha inteira de cada
    // aluno pra nuvem, apagando treinos/check-ins registrados depois.
    useEffect(() => {
        if (role !== "prof" || !ready || !profUnlocked || !rosterLoaded || !students.length || numberedRef.current) return;
        let nums = {};
        try { nums = assignMemberNumbers(students); } catch (e) { console.error("Cancio: numeração", e); }
        numberedRef.current = true;
        const ids = Object.keys(nums);
        if (!ids.length) return;
        setData((p) => { const next = { ...p, students: p.students.map((st) => (nums[st.id] != null ? { ...st, memberNo: nums[st.id], memberSince: st.memberSince || st.startDate || todayISO() } : st)) }; ids.forEach((id) => syncStudentToCloud(next, id)); return next; });
    }, [role, ready, profUnlocked, rosterLoaded, students]);
    const memberTrainedDays = React.useMemo(() => {
        const out = new Set(); if (!alunoId) return out;
        const ym = todayISO().slice(0, 7), wk = (data && data.workouts && data.workouts[alunoId]) || {};
        Object.values(wk).forEach((list) => (Array.isArray(list) ? list : []).forEach((ex) => (ex.history || []).forEach((h) => { if (h && typeof h.date === "string" && h.date.startsWith(ym) && (h.entries ? h.entries.length : true)) out.add(Number(h.date.slice(8, 10))); })));
        return out;
    }, [data, alunoId]);
    // dispara sozinho no domingo, uma vez por aluno por semana — antes dependia do aluno lembrar de
    // abrir o app E apertar "Gerar resumo da semana"; um flag em localStorage evita repetir a cada
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
    // design v3: a tela "Hoje" substituiu as duas aberturas automáticas que existiam aqui (a tela
    // cheia de entrada do dia e o perfil quando já treinou). A entrada do dia continua no "Trocar treino".
    const todaySessionAluno = role === "aluno" && alunoId ? ((data && data.sessions && data.sessions[alunoId]) || []).filter((x) => x.date === todayISO()).slice(-1)[0] : null;
    // compartilhar o treino feito hoje a partir da tela Hoje (mesmo card do fim do treino)
    const shareTodaySession = () => {
        const s = todaySessionAluno; if (!s || !alunoStudent) return;
        const wk = (data.workouts && data.workouts[alunoId]) || {}; const lst = wk[s.day] || [];
        const dn = ((data.dayNames || {})[alunoId] || {})[s.day] || (DAYS.find((d) => d.key === s.day) || {}).full || "Treino";
        setShareCard({ name: alunoStudent.name, workoutName: dn, durationLabel: s.durationSec ? fmtDur(s.durationSec) : "—", dateLabel: fmtDate(s.date), targetDate: s.date, streak, tint: tier.tint, isRestDay: s.effort === "descanso", exercises: lst.map((e) => ({ id: e.id, name: e.name, history: e.history, sets: e.sets, setPlan: e.setPlan })) });
    };
    // abrir a aba Recados conta como ler os recados do professor
    useEffect(() => { if (role === "aluno" && alunoId && alunoTab === "recados") markProfRead(alunoId); }, [role, alunoId, alunoTab]);
    const focusStudent = students.find((s) => s.id === focusId);
    // meta semanal (do campo "Frequência semanal" da ficha) no lugar da sequência de dias seguidos
    const weeklyTarget = parseWeeklyTarget(focusStudent && focusStudent.freqWeekly);
    const weeklyLine = weeklyTarget != null ? `${freqWeek} de ${weeklyTarget} essa semana` : `${freqWeek} ${freqWeek === 1 ? "treino" : "treinos"} essa semana`;
    // aviso suave só quando a semana já está avançada (sex/sáb/dom) e ainda falta bater a meta —
    // sem travar nada, sem Salva-Vidas
    const weeklyBehind = weeklyTarget != null && freqWeek < weeklyTarget && ["sex", "sab", "dom"].includes(todayKey);
    const lockCard = { textAlign: "center", padding: "52px 24px", ...flatPanel, borderRadius: 24, maxWidth: 360, margin: "10px auto 0" };
    useEffect(() => { if (role === "aluno" && codeInput.length === 4 && !loginBusy && !codeErr) { const t = setTimeout(() => doLogin(), 250); return () => clearTimeout(t); } }, [codeInput]);
    const keyInput = { display: "block", margin: "24px auto 0", width: "100%", maxWidth: 320, fontFamily: F.body, fontSize: 15, color: C.text, background: C.panel, border: "none", boxShadow: "inset 0 0 0 1.5px " + C.silver, borderRadius: 10, padding: "14px", outline: "none", boxSizing: "border-box" };
    const keyErr = { fontFamily: F.body, fontSize: 13, color: C.warn, marginTop: 8 };
    const keyBtn = { display: "block", width: "100%", maxWidth: 320, height: 54, margin: "16px auto 0", fontFamily: F.body, fontWeight: 800, fontSize: 15, color: C.ink, background: C.text, border: "none", borderRadius: 16, cursor: "pointer" };
    const obsChip = (txt) => (React.createElement("div", { style: { display: "flex", gap: 9, alignItems: "baseline", borderLeft: `2px solid ${C.amberDim}`, padding: "5px 0 5px 10px", marginBottom: 14 } },
        React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" } }, "observa\u00E7\u00E3o"),
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.4 } }, txt)));
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
        .cc-amb { opacity: .18; }
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
        .cc-sheen { position: absolute; top: -40%; left: -20%; width: 40%; height: 180%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); display: none; mix-blend-mode: overlay; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) { .cc-amb { animation: none } .cc-view { animation: none } .cc-sheen { animation: none } }
      `),
        null,
        null,
        null,
        recordCel && React.createElement(RecordCelebration, { records: recordCel.records, sound: recordCel.sound, onShare: () => { const s = recordCel.shareData; setRecordCel(null); setShareCard(s); }, onClose: () => setRecordCel(null) }),
        celebration && React.createElement(Celebration, { ...celebration, onClose: () => setCelebration(null), onDone: () => { const t = celebration.then; setCelebration(null); if (t)
                t(); } }),
        // Modo aula (design v3 · 4c): tela cheia, um exercício por vez, sobre a ficha do professor
        role === "prof" && profUnlocked && profView === "aluno" && fichaTab === "treino" && profViewMode === "aula" && profStudent && list.length > 0 && React.createElement(AulaV3, {
            key: profId + "|" + day, list, dayDate, studentName: profStudent.name,
            restrictionOf: (n) => restrictionFor(n, profStudent, "prof"),
            onAddLoad: addLoad, onTech: updateTechNotes, onStart: markWorkoutStarted,
            onEnd: () => { finalizeWorkout(null, { silent: true }); setProfViewMode("edit"); setFichaTab("resumo"); window.scrollTo(0, 0); },
            onExit: () => setProfViewMode("edit"),
        }),
        role === "aluno" && alunoStudent && fimOpen && (() => {
            // mesmas contas do finalizeWorkout (séries válidas e kg levantados no dia que está sendo finalizado)
            // por exercício, o registro do dia COM séries (entries); só cai no formato antigo se não houver
            const hs = list.map((e) => { const day = (e.history || []).filter((h) => h.date === dayDate); return day.find((h) => Array.isArray(h.entries) && h.entries.length) || day[0]; }).filter(Boolean);
            const validSets = hs.reduce((n, h) => n + (h.entries ? h.entries.filter((en) => !NON_COUNTING_KINDS.has(en.kind)).length : 0), 0);
            const volume = hs.reduce((n, h) => n + daySummary(h).volume, 0);
            const t0 = workoutStart && workoutStart.studentId === alunoId && workoutStart.date === todayISO() ? workoutStart.startedAt : null;
            return React.createElement(FimV3, {
                title: String(dayName || dayFull || "Treino").split("·")[0].trim().toUpperCase(),
                durationLabel: t0 ? fmtDur(Math.max(1, Math.round((Date.now() - t0) / 1000))) : null,
                validSets, volume, records: computeDayRecords(list, dayDate),
                onBack: () => setFimOpen(false),
                onDone: (effort, share) => { const sd = finalizeWorkout(effort, { silent: true }); setFimOpen(false); setAlunoTab("hoje"); window.scrollTo(0, 0); if (share && sd) setShareCard(sd); },
            });
        })(),
        pseModal && React.createElement(PSEModal, { summary: [dayName || dayFull, (() => { const t0 = typeof workoutStart === "number" ? workoutStart : workoutStart && workoutStart.startedAt; return Number.isFinite(t0) ? fmtDur(Math.max(1, Math.round((Date.now() - t0) / 1000))) : null; })()].filter(Boolean).join(" · "), onSelect: (effort) => finalizeWorkout(effort), onCancel: () => setPseModal(false) }),
        feedbackModal && React.createElement(FeedbackModal, { question: feedbackModal.question, onSend: (txt) => { submitFeedback(feedbackModal.sessionId, txt); const sd = feedbackModal.shareData; setFeedbackModal(null); if (sd)
                setShareCard(sd); }, onSkip: () => { const sd = feedbackModal.shareData; setFeedbackModal(null); if (sd)
                setShareCard(sd); } }),
        shareCard && React.createElement(React.Suspense, { fallback: React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,6,10,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 13, color: C.muted } }, "carregando…") }, React.createElement(ShareCard, { data: shareCard, onClose: () => setShareCard(null) })),
        role === "aluno" && alunoStudent && profileOpen && React.createElement(StudentProfile, { student: alunoStudent, week: (data.workouts || {})[alunoId] || emptyWeek(), checkins: (data.checkins || {})[alunoId] || [], freqTotal, freqWeek, weeklyTarget, bestStreak, notifPerm, onAskNotify: async () => setNotifPerm(await askNotify()), onUpdate: (patch) => updateStudent(alunoId, patch), onOpenCard: () => setMemberCardOpen(true), onOpenSelo: () => setLogoCard(true), onOpenMyData: () => setMyDataOpen(true), onOpenReassess: () => setReassessOpen(true), onMessage: () => { setProfileOpen(false); setAlunoTab("recados"); window.scrollTo(0, 0); }, onLogout: () => { setProfileOpen(false); logout(); }, onClose: () => setProfileOpen(false),
            todayDone: todaySessionAluno ? { name: ((data.dayNames || {})[alunoId] || {})[todaySessionAluno.day] || "Treino", onView: () => { setDay(todaySessionAluno.day); setAlunoTab("treino"); setProfileOpen(false); window.scrollTo(0, 0); } } : null }),
        logoCard && React.createElement(LogoCard, { onClose: () => setLogoCard(false) }),
        role === "aluno" && alunoStudent && memberCardOpen && React.createElement(MemberCard, { student: alunoStudent, trainedDays: memberTrainedDays, onClose: () => setMemberCardOpen(false) }),
        serieOpen && profStudent && React.createElement(SerieExport, { student: profStudent, week: (data.workouts && data.workouts[profId]) || emptyWeek(), dayNames: (data.dayNames && data.dayNames[profId]) || {}, initialDay: day, onClose: () => setSerieOpen(false) }),
        role === "aluno" && alunoStudent && (!alunoStudent.ackAt || !alunoStudent.consentAt) && React.createElement(Disclaimer, { onAccept: () => { const now = new Date().toISOString(); updateStudent(alunoId, { ackAt: alunoStudent.ackAt || now, consentAt: now }); } }),
        role === "aluno" && alunoStudent && myDataOpen && React.createElement(MyData, { student: alunoStudent, onClose: () => setMyDataOpen(false), onDownload: () => { const mine = { aluno: { ...alunoStudent, clinicalAlert: undefined }, treinos: (data.workouts || {})[alunoId], sessoes: (data.sessions || {})[alunoId], cardio: (data.cardioLog || {})[alunoId], recados: messages.filter((m) => m.studentId === alunoId), exportadoEm: new Date().toISOString() }; const url = URL.createObjectURL(new Blob([JSON.stringify(mine, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "meus-dados-cancio-club.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); printStudent({ student: alunoStudent, week: (data.workouts || {})[alunoId] || emptyWeek(), dayNames: (data.dayNames || {})[alunoId] || {} }); }, onRequestDelete: () => { updateStudent(alunoId, { deletionRequestedAt: new Date().toISOString() }); sendMessage("Pedido de exclus\u00E3o dos meus dados (LGPD)."); } }),
        role === "aluno" && alunoStudent && reassessOpen && React.createElement(Reassessment, { onClose: () => setReassessOpen(false), onSubmit: (entry) => { updateStudent(alunoId, { reassessments: [...(alunoStudent.reassessments || []), entry] }); setReassessOpen(false); } }),
        role === "aluno" && alunoStudent && alunoStudent.ackAt && (!alunoStudent.assessmentAt || assessmentJustDone) && (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 95, overflowY: "auto", background: C.ink } },
            React.createElement("div", { style: { maxWidth: 540, margin: "0 auto" } },
                React.createElement(AssessmentInicial, { defaultName: alunoStudent.name, onEnter: () => setAssessmentJustDone(false), onSubmit: (formData) => {
                        setAssessmentJustDone(true);
                        updateStudent(alunoId, mapAnamneseToFicha(formData, alunoStudent));
                    } })))),
        role === "aluno" && alunoStudent && dayEntryOpen && React.createElement(DayEntryScreen, { week: week, todayKey: todayKey, dayNames: (data?.dayNames && data.dayNames[focusId]) || {}, cardio: cardioFocus, onBegin: () => { setDay(todayKey); setExpanded(null); setDayEntryOpen(false); setAlunoTab("treino"); }, onPickOther: (k) => { setDay(k); setExpanded(null); setDayEntryOpen(false); setAlunoTab("treino"); }, onClose: () => setDayEntryOpen(false) }),
        role === "aluno" && !isStandalone && (React.createElement("div", { style: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, background: C.panel2, padding: "9px 16px" } },
            React.createElement("span", { style: { flex: 1, fontFamily: F.mono, fontSize: 11, color: C.silver, lineHeight: 1.5 } }, "Para experi\u00EAncia VIP em tela cheia, adicione o Cancio Club \u00E0 sua Tela de In\u00EDcio (Compartilhar \u2192 Adicionar \u00E0 Tela de In\u00EDcio)"),
            React.createElement("button", { onClick: () => { setIsStandalone(true); try { localStorage.setItem("cancio:installHintSeen", "1"); } catch (e) { } }, "aria-label": "Dispensar", style: { minHeight: 44, flexShrink: 0, fontFamily: F.mono, fontSize: 15, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "0 2px" } }, "\u00D7"))),
        React.createElement("div", { key: role + "-" + day, className: "cc-view", style: { position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto", padding: "calc(28px + env(safe-area-inset-top)) 20px 190px" } },
            !cloudSynced && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 999, padding: "7px 14px", marginBottom: 18, width: "fit-content" } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: C.warn, flexShrink: 0 } }),
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } }, "Salvo neste aparelho \u2014 sincronizando com a nuvem quando a internet voltar"))),
            localFull && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 999, padding: "7px 14px", marginBottom: 18, width: "fit-content" } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: C.warn, flexShrink: 0 } }),
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted } }, "Armazenamento deste aparelho est\u00e1 cheio \u2014 os dados mais recentes podem n\u00e3o estar salvos aqui"))),
            role === "prof" && React.createElement("header", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                React.createElement("img", { src: SIL_URL, alt: "", width: 44, height: 44, style: { width: 44, height: 44 } }),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 19, lineHeight: 0.92, color: C.text } }, React.createElement("span", null, "CANCIO"), React.createElement("span", { style: { color: C.silver } }, "CLUB"))),
            React.createElement("button", { className: "cc-tap", "aria-label": "Op\u00E7\u00F5es", "aria-expanded": profMenuOpen, onClick: () => setProfMenuOpen((v) => !v), style: { width: 44, height: 44, borderRadius: "50%", border: "none", background: profMenuOpen ? C.panel2 : "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontSize: 20, lineHeight: 1, cursor: "pointer", fontFamily: F.body } }, "\u22EF"),
            profMenuOpen && React.createElement("div", { role: "menu", style: { position: "absolute", top: 52, right: 0, zIndex: 20, minWidth: 220, padding: 6, borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}`, display: "flex", flexDirection: "column" } },
                [["Som das comemora\u00E7\u00F5es: " + (soundOn ? "ligado" : "desligado"), toggleSound], ["Ver como aluno", () => { setProfMenuOpen(false); switchRole("aluno"); }], profUnlocked && ["Bloquear \u00E1rea do professor", () => { setProfMenuOpen(false); lockProf(); }]].filter(Boolean).map(([l, fn]) => React.createElement("button", { key: l, role: "menuitem", className: "cc-tap", onClick: fn, style: { minHeight: 44, padding: "0 12px", border: "none", background: "none", borderRadius: 10, textAlign: "left", color: C.text, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, l)))),
            null,
            role === "prof" && !profUnlocked && (React.createElement("div", { style: lockCard },
                React.createElement("div", { style: { display: "inline-block", marginBottom: 20 } },
                    React.createElement("img", { src: BALL_URL, alt: "", width: 64, height: 64, style: { display: "block" } })),
                React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.silver } }, "\u00C1REA DO PROFESSOR"),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, marginTop: 6 } }, "ENTRAR"),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.5 } }, "Digite sua senha de acesso."),
                React.createElement("input", { type: "password", value: profKeyInput, onChange: (e) => { setProfKeyInput(e.target.value); setProfKeyErr(""); }, onKeyDown: (e) => e.key === "Enter" && !loginBusy && unlockProf(), placeholder: "senha", style: keyInput }),
                profKeyErr && React.createElement("div", { style: keyErr }, profKeyErr),
                React.createElement("button", { onClick: unlockProf, disabled: loginBusy, style: { minHeight: 44, ...keyBtn, cursor: loginBusy ? "default" : "pointer", opacity: loginBusy ? 0.7 : 1 } }, loginBusy ? "Buscando…" : "Entrar"),
                React.createElement("button", { onClick: () => switchRole("aluno"), style: { minHeight: 44, display: "block", margin: "14px auto 0", fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", padding: 8, cursor: "pointer" } }, "\u2039 Sou aluno"))),
            role === "prof" && profUnlocked && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { position: "fixed", left: 12, right: 12, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 91, maxWidth: 636, margin: "0 auto" } },
                    React.createElement("div", { style: { display: "flex", gap: 2, padding: 6, borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}, 0 -16px 40px rgba(5,6,10,.9)` } },
                        [
                            ["alunos", "Alunos", () => { setProfTab("alunos"); setProfView("home"); setRendEx(null); setExpanded(null); }],
                            ["modelos", "Biblioteca", () => { setProfTab("modelos"); setExpanded(null); }],
                            ["recados", React.createElement(React.Fragment, { key: "r" }, "Recados", unread > 0 && React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 16, height: 16, marginLeft: 6, borderRadius: 999, background: profTab === "recados" ? C.ink : C.warn, color: profTab === "recados" ? "#fff" : C.ink, fontFamily: F.mono, fontSize: 11, fontWeight: 700, padding: "0 4px" } }, unread)), () => { setProfTab("recados"); setExpanded(null); }],
                            ["mais", "Mais", () => { setProfTab("painel"); setExpanded(null); }],
                        ].map(([key, label, onClick]) => {
                            const active = key === "mais" ? profTab === "painel" : key === "modelos" ? (profTab === "modelos" || profTab === "biblioteca") : profTab === key;
                            return React.createElement("button", { key: key, className: "cc-tap", onClick, style: { minHeight: 44, flex: 1, fontFamily: F.display, fontWeight: active ? 700 : 600, fontSize: 13, padding: "11px 0", borderRadius: 16, border: "none", cursor: "pointer", color: active ? C.ink : C.muted, background: active ? C.text : "transparent" } }, label);
                        }))),
                profTab === "alunos" && (React.createElement(React.Fragment, null,
                    (() => {
                        const fmtK = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
                        const tiny = { fontFamily: F.display, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted };
                        if (profView === "home") {
                            const q = studentSearch.trim().toLowerCase();
                            const rosterById = {}; todayRoster.forEach((r) => { rosterById[r.id] = r; });
                            const rows = students.map((s) => {
                                const st = studentStats(s.id);
                                const wk = (data.workouts && data.workouts[s.id]) || emptyWeek();
                                const planned = parseWeeklyTarget(s.freqWeekly) || trainingWds(wk, data.cardio && data.cardio[s.id]).size;
                                const r = rosterById[s.id];
                                const sess = ((data.sessions && data.sessions[s.id]) || []).filter((x) => x.date === todayISO()).slice(-1)[0];
                                const sub = r ? (r.done ? "Treinou hoje" + (sess && sess.durationSec ? " \u00B7 " + fmtDur(sess.durationSec) : "") : r.workoutName + " hoje \u00B7 ainda n\u00E3o veio") : "\u00DAltimo treino " + st.last;
                                const unreadN = messages.filter((m) => m.studentId === s.id && !m.read && !m.fromProf).length;
                                const newAnam = s.assessmentAt && Date.now() - new Date(s.assessmentAt).getTime() < 7 * 864e5;
                                // só o que pede ação hoje — o alerta clínico é permanente e fica na ficha, senão ocupa a faixa pra sempre
                                const reasons = [
                                    s.deletionRequestedAt && { k: "LGPD", t: "Pediu exclus\u00E3o dos dados" },
                                    unreadN > 0 && { k: "RECADO", t: unreadN + (unreadN > 1 ? " recados sem resposta" : " recado sem resposta") },
                                    lastEffortFor(s.id) === "destruidor" && { k: "FADIGA", t: "\u00DAltimo treino veio como Destruidor" },
                                    st.week === 0 && planned > 0 && { k: "SUMIDO", t: "Nenhum treino nos \u00FAltimos 7 dias" },
                                    newAnam && { k: "ANAMNESE", t: "Respondeu a anamnese \u2014 vale revisar" },
                                    (() => { const rl = s.reassessments || []; const lr = rl[rl.length - 1]; return lr && Date.now() - new Date(lr.date).getTime() < 7 * 864e5 && { k: "REAVALIA\u00C7\u00C3O", t: "Mandou peso e medidas novas" }; })(),
                                ].filter(Boolean);
                                const alert = reasons[0] ? { ...reasons[0], more: reasons.length - 1 } : null;
                                return { s, st, planned, sub, done: r && r.done, wait: r && !r.done, alert, order: r ? (r.done ? 1 : 0) : 2 };
                            });
                            const open = (s) => { setActive(s.id); setProfView("aluno"); setFichaTab("resumo"); setRendEx(null); setExpanded(null); setFichaOpen(false); setHistOpen(false); };
                            const alerts = rows.filter((r) => r.alert);
                            const list = rows.filter((r) => r.s.name.toLowerCase().includes(q)).sort((a, b) => a.order - b.order || a.s.name.localeCompare(b.s.name));
                            // design v3 (fase 4a): AlunosV3 — na pista, precisa de atenção com ação na linha, treinam hoje, outros e Ao vivo
                            return React.createElement(React.Fragment, null,
                                React.createElement(AlunosV3, { rows, data, now: liveNow, search: studentSearch, onSearch: setStudentSearch, onAdd: () => setAddStudentOpen(true), onOpen: (s) => { setLiveStudentId(null); open(s); },
                                    onAttn: (r) => { if (r.alert.k === "RECADO" || r.alert.k === "SUMIDO") { setInboxFocus(r.s.id); setProfTab("recados"); markThreadRead(r.s.id); } else open(r.s); },
                                    liveId: liveStudentId, onLive: (id) => { setLiveStudentId(id); window.scrollTo(0, 0); },
                                    onMessage: (s) => { setLiveStudentId(null); setInboxFocus(s.id); setProfTab("recados"); markThreadRead(s.id); } }),
                                addStudentOpen && React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(5,6,10,.8)" }, onClick: () => setAddStudentOpen(false) },
                                    React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "cc-sheet-in", style: { position: "absolute", left: 10, right: 10, bottom: "calc(16px + env(safe-area-inset-bottom))", maxWidth: 480, margin: "0 auto", borderRadius: 24, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, padding: "20px 18px 18px" } },
                                        React.createElement("span", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", color: C.muted } }, "NOVO ALUNO"),
                                        React.createElement("input", { autoFocus: true, value: nStudent, onChange: (e) => setNStudent(e.target.value), onKeyDown: (e) => e.key === "Enter" && nStudent.trim() && (addStudent(), setAddStudentOpen(false)), placeholder: "Nome do aluno", style: { display: "block", width: "100%", boxSizing: "border-box", marginTop: 12, fontFamily: F.body, fontSize: 15, color: C.text, background: C.ink, border: "none", borderRadius: 10, padding: "13px 14px", outline: "none" } }),
                                        React.createElement("button", { className: "cc-tap", disabled: !nStudent.trim(), onClick: () => { addStudent(); setAddStudentOpen(false); }, style: { minHeight: 44, width: "100%", marginTop: 12, fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.ink, background: nStudent.trim() ? PILL_ON : C.line, border: "none", borderRadius: 16, padding: "14px 0", cursor: nStudent.trim() ? "pointer" : "default" } }, "Adicionar"))));
                        }
                        if (!profStudent) return null;
                        const ps = profStudent;
                        // 11a — carteirinha do aluno abre a ficha (foto da anamnese + dados), alerta de saúde logo abaixo
                        const psAge = ps.assessment && ps.assessment.idade;
                        const header = React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                                React.createElement("button", { className: "cc-tap", onClick: () => { setProfView("home"); setRendEx(null); setExpanded(null); }, style: { minHeight: 44, padding: "0 10px 0 0", fontFamily: F.body, fontSize: 15, color: C.silver, background: "none", border: "none", cursor: "pointer" } }, "\u2039 Alunos")),
                            React.createElement("div", { style: { position: "relative", overflow: "hidden", borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}`, padding: 16, display: "flex", gap: 14, alignItems: "center" } },
                                React.createElement("img", { src: SIL_URL, alt: "", "aria-hidden": "true", style: { position: "absolute", right: -30, top: -30, width: 130, height: 130, opacity: 0.12, pointerEvents: "none" } }),
                                React.createElement("div", { style: { width: 68, height: 68, borderRadius: "50%", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: ps.photo ? C.panel : "repeating-linear-gradient(135deg,#171B22 0 6px,#0E1015 6px 12px)", boxShadow: ps.photo ? "none" : `inset 0 0 0 1.5px ${C.line2}` } },
                                    ps.photo ? React.createElement("img", { src: ps.photo, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontSize: 24, color: C.muted } }, (ps.name || "?").trim().charAt(0).toUpperCase())),
                                React.createElement("div", { style: { position: "relative", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 } },
                                    React.createElement("span", { style: { fontFamily: F.body, fontWeight: 800, fontSize: 18, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ps.name),
                                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, [psAge && psAge + " anos", ps.goal, ps.freqWeekly].filter(Boolean).join(" \u00B7 ")),
                                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, "c\u00F3digo " + ps.code + (ps.startDate ? " \u00B7 desde " + fmtDate(ps.startDate) : "")))),
                            // arrumação (16/nov): as três ações da ficha à vista — puxar conversa, editar a ficha, ver os dados
                            React.createElement("div", { style: { display: "flex", gap: 8 } },
                                React.createElement("button", { className: "cc-tap", onClick: () => { setInboxFocus(ps.id); setProfTab("recados"); markThreadRead(ps.id); window.scrollTo(0, 0); }, style: { flex: 1, minHeight: 44, borderRadius: 10, border: "none", fontFamily: F.body, fontWeight: 600, fontSize: 13, cursor: "pointer", background: "transparent", color: C.text, boxShadow: `inset 0 0 0 1px ${C.line2}` } }, "Recado"),
                                React.createElement("button", { className: "cc-tap", onClick: () => { setDay((wk0 => (wk0[todayKey] || []).length ? todayKey : (DAYS.find((d) => (wk0[d.key] || []).length) || { key: todayKey }).key)((data.workouts && data.workouts[ps.id]) || {})); setExpanded(null); setProfViewMode("edit"); setFichaTab("treino"); window.scrollTo(0, 0); }, style: { flex: 1, minHeight: 44, borderRadius: 10, border: "none", fontFamily: F.body, fontWeight: 800, fontSize: 13, cursor: "pointer", background: C.text, color: C.ink } }, "Editar ficha"),
                                React.createElement("button", { className: "cc-tap", onClick: () => { setFichaTab("ficha"); window.scrollTo(0, 0); }, style: { flex: 1, minHeight: 44, borderRadius: 10, border: "none", fontFamily: F.body, fontWeight: 600, fontSize: 13, cursor: "pointer", background: "transparent", color: C.text, boxShadow: `inset 0 0 0 1px ${C.line2}` } }, "Dados")),
                            ps.clinicalAlert && React.createElement("button", { className: "cc-tap", onClick: () => setFichaTab("ficha"), style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", minHeight: 44, borderRadius: 10, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px rgba(232,121,75,.4)", textAlign: "left", cursor: "pointer" } },
                                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.warn, flexShrink: 0 } }, "SA\u00DADE"),
                                React.createElement("span", { style: { flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 13, color: "#C9D0DC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ps.clinicalAlert.split("\n")[0].replace(/^Triagem \(relatado pelo aluno\): /, "")),
                                React.createElement("span", { style: { color: "#7D8698" } }, "\u203A")));
                        const statB = (v, l) => React.createElement("span", null, React.createElement("b", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 15, color: C.text } }, v), " " + l);
                        const chips = [lastEffortFor(profId) === "destruidor" && "Fadiga \u00B7 \u00FAltimo treino Destruidor", !ps.ackAt && "Termo pendente"].filter(Boolean);
                        // design v3 (4b): a ficha é uma página única (FichaV3); as telas completas (Editar, Rendimento,
                        // Volume, Dados) ganham só um "‹ Resumo" em vez da fileira de abas
                        const TAB_TITLE = { treino: "Editar ficha", rend: "Rendimento", volume: "Volume feito", ficha: "Dados do aluno" };
                        const tabs = fichaTab === "resumo" ? null : React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 14 } },
                            React.createElement("button", { className: "cc-tap", onClick: () => { setFichaTab("resumo"); setRendEx(null); setProfViewMode("edit"); window.scrollTo(0, 0); }, style: { minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "‹ Resumo"),
                            React.createElement("span", { style: { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", textTransform: "uppercase", color: C.text4 } }, (TAB_TITLE[fichaTab] || "") + " · " + String(ps.name || "").split(" ")[0]));
                        let body = null;
                        const wkP = (data.workouts && data.workouts[profId]) || emptyWeek();
                        const allEx = []; DAYS.forEach((d) => (wkP[d.key] || []).forEach((e) => allEx.push({ ...e, _day: d.key })));
                        if (fichaTab === "resumo") {
                            body = React.createElement(FichaV3, {
                                student: ps, week: wkP, dayNames: (data.dayNames && data.dayNames[profId]) || {}, sessions: profSessions, todayKey,
                                rend: rendSummary({ exercises: allEx, checkins: (data.checkins && data.checkins[profId]) || [], startDate: ps.startDate, week: wkP, cardio: data.cardio && data.cardio[profId] }),
                                onAula: () => { setDay(todayKey); setExpanded(null); setProfViewMode("aula"); setFichaTab("treino"); window.scrollTo(0, 0); },
                                onEdit: (k) => { setDay(k); setExpanded(null); setProfViewMode("edit"); setFichaTab("treino"); window.scrollTo(0, 0); },
                                onOpenRend: () => { setRendEx(null); setFichaTab("rend"); window.scrollTo(0, 0); },
                                onOpenVol: () => { setFichaTab("volume"); window.scrollTo(0, 0); },
                            });
                        }
                        else if (fichaTab === "rend") {
                            // design v3 (4c · 18a/18b): RendimentoV3 — lista por dia de treino e gráfico do exercício (rendEx)
                            body = React.createElement(RendimentoV3, { allEx, week: wkP, dayNames: (data.dayNames && data.dayNames[profId]) || {}, sessions: profSessions,
                                rend: rendSummary({ exercises: allEx, checkins: (data.checkins && data.checkins[profId]) || [], startDate: ps.startDate, week: wkP, cardio: data.cardio && data.cardio[profId] }),
                                exId: rendEx, onOpenEx: (id) => { setRendEx(id); window.scrollTo(0, 0); },
                                onEditDay: (k) => { setRendEx(null); setDay(k); setExpanded(null); setProfViewMode("edit"); setFichaTab("treino"); window.scrollTo(0, 0); },
                                onSaveNote: (ex, val) => setData((p) => { const w = { ...p.workouts[profId] }; w[ex._day] = (w[ex._day] || []).map((e) => (e.id === ex.id ? { ...e, profNote: val } : e)); const next = { ...p, workouts: { ...p.workouts, [profId]: w } }; syncStudentToCloud(next, profId); return next; }),
                            });
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
                                React.createElement(DadosV3, { student: ps, onSave: (patch) => updateStudent(profId, patch), onPrint: () => printStudent({ student: ps, week: (data.workouts && data.workouts[profId]) || emptyWeek(), dayNames: (data.dayNames && data.dayNames[profId]) || {}, includePrivate: true }), onDelete: () => { removeStudent(profId); setProfView("home"); } }),
                                React.createElement("div", { style: { ...tiny, marginTop: 24 } }, "FASES ARQUIVADAS"),
                                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
                                    React.createElement("input", { value: archLabel, onChange: (e) => setArchLabel(e.target.value), placeholder: "R\u00F3tulo (ex.: Fase 1 \u00B7 Adapta\u00E7\u00E3o)", style: { flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 13, color: C.text, background: C.panel, border: "none", borderRadius: 10, padding: "11px 12px", outline: "none" } }),
                                    React.createElement("button", { className: "cc-tap", onClick: archiveWorkout, style: { minHeight: 44, fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer" } }, "Arquivar semana")),
                                archives.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 10 } }, "Nenhuma fase arquivada ainda."),
                                [...archives].sort((a, b) => (a.date < b.date ? 1 : -1)).map((a) => React.createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "12px 0", borderBottom: "1px solid #171B22" } },
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontFamily: F.body, fontSize: 15 } }, a.label), React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 2 } }, fmtDateTime(a.date) + " \u00B7 " + DAYS.reduce((n, d) => n + ((a.week[d.key] || []).length), 0) + " exerc\u00EDcios")),
                                    React.createElement("button", { onClick: () => restoreArchive(a), style: { minHeight: 44, fontFamily: F.body, fontSize: 13, color: C.silver, background: C.panel, border: "none", borderRadius: 10, padding: "8px 11px", cursor: "pointer" } }, "Restaurar"),
                                    React.createElement("button", { onClick: () => deleteArchive(a.id), "aria-label": "Apagar", style: { minHeight: 44, fontSize: 15, color: C.muted, background: "none", border: "none", cursor: "pointer" } }, "\u00D7"))),
                                React.createElement("button", { onClick: async () => { if (await ccConfirm(`Isso apaga a ficha, o hist\u00F3rico e o c\u00F3digo de acesso da nuvem. S\u00F3 d\u00E1 pra recuperar com um backup exportado antes.`, { title: `Remover ${ps.name}?`, ok: "Remover", danger: true })) { removeStudent(profId); setProfView("home"); } }, style: { minHeight: 44, marginTop: 32, fontFamily: F.body, fontSize: 13, color: C.warn, background: "none", border: `1px solid ${C.warn}55`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, "Remover aluno"));
                        }
                        return React.createElement("section", { style: { marginBottom: fichaTab === "treino" ? 14 : 26 } },
                            fichaTab === "resumo" && header,
                            fichaTab === "resumo" && React.createElement("div", { style: { display: "flex", gap: 18, marginTop: 12, fontFamily: F.body, fontSize: 13, color: C.muted } }, statB(streak, "seguidos"), statB(freqWeek, "semana"), statB(freqTotal, "total")),
                            fichaTab === "resumo" && chips.length > 0 && React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 } }, chips.map((c) => React.createElement("span", { key: c, style: { fontFamily: F.body, fontSize: 11, color: C.warn, background: "transparent", boxShadow: "inset 0 0 0 1px rgba(232,121,75,.4)", borderRadius: 999, padding: "5px 10px" } }, c))),
                            fichaTab === "resumo" && lastProfSession && lastProfSession.feedback && React.createElement("div", { style: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.panel, fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: "#C9D0DC" } }, "\u201C" + lastProfSession.feedback + "\u201D ", React.createElement("span", { style: { color: "#7D8698" } }, "\u00B7 " + fmtDate(lastProfSession.date))),
                            tabs,
                            body);
                    })(),
                    (profView === "home" && students.length > 0) || (profView === "aluno" && fichaTab !== "treino") ? null : students.length === 0 && loadingRoster ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, [0, 1, 2].map((i) => React.createElement(SkeletonCard, { key: i }))) : students.length === 0 ? React.createElement(PremiumEmptyState, { icon: "personPlus", compact: false, title: "Nenhum aluno na casa ainda.", sub: "Cadastre o primeiro e a pista come\u00E7a a girar." }) : (React.createElement(React.Fragment, null,
                        profStudent && profStudent.obs && obsChip(profStudent.obs),
                        // design v3 (4b · 28a): volume planejado da semana pela ativação, com a mudança desde que a edição abriu
                        profStudent && profViewMode === "aula" && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginBottom: 14, lineHeight: 1.5 } },
                            "Registrando presencialmente em nome de ",
                            profStudent.name,
                            " \u2014 os dados v\u00E3o direto pro hist\u00F3rico dele, como se ele mesmo tivesse registrado."),
                        // arrumação (16/nov): abas dos dias + nome do treino + "Trocar treino" (modelo, copiar/trocar dia, cardio, salvar, limpar)
                        profStudent && profViewMode === "edit" && React.createElement(DayToolsV3, { week, day, dayNames: (data.dayNames && data.dayNames[profId]) || {}, cardio: cardioFocus, templates,
                            doneDays: new Set(((data.sessions && data.sessions[profId]) || []).filter((x) => isThisWeek(x.date)).map((x) => x.day)),
                            onPick: (k) => { setDay(k); setExpanded(null); setExSheet(null); }, onRename: (v) => updateDayName(profId, day, v),
                            onApplyTemplate: (t) => replaceDayWith(t.exercises, t.name), onCopyFrom: (k) => replaceDayWith(week[k] || [], ((data.dayNames && data.dayNames[profId]) || {})[k] || ""),
                            onSwapWith: swapDayWith, onToggleCardio: () => toggleCardio(profId, day), onSaveTemplate: saveDayTemplateNamed, onClear: () => replaceDayWith([], null), onSerie: () => setSerieOpen(true) }),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 } },
                            list.length === 0 && !adding && React.createElement(PremiumEmptyState, { icon: "dumbbell", title: `Nenhum treino em ${dayFull} \u2014 a ficha t\u00E1 em branco.`, sub: "Monte um exerc\u00EDcio do zero ou aplique um modelo salvo." }),
                            list.map((ex, i) => profViewMode === "aula"
                                ? React.createElement(ExerciseCard, { key: ex.id, ex: ex, restriction: restrictionFor(ex.name, profStudent, "prof"), role: "aluno", expanded: expanded === ex.id, onToggle: toggleExpanded, onAddLoad: addLoad, onNote: updateExerciseNote, onRemove: noop, onUpdate: updateExercise, onDeleteRecord: noop, onMove: noop, isFirst: true, isLast: true, tint: tier.tint, dayDate: dayDate })
                                : React.createElement(ExerciseCard, { key: ex.id, ex: ex, restriction: restrictionFor(ex.name, profStudent, "prof"), role: "prof", idx: i + 1, expanded: expanded === ex.id, onToggle: toggleExpanded, onAddLoad: addLoad, onNote: updateExerciseNote, onRemove: removeExercise, onSwap: openSwap, onUpdate: updateExercise, onDeleteRecord: deleteRecord, onMove: moveExercise, isFirst: i === 0, isLast: i === list.length - 1, tint: tier.tint, dayDate: dayDate }))),
                        profViewMode === "edit" && (React.createElement(React.Fragment, null,
                            adding ? (React.createElement("div", { style: { ...glassPanel, borderRadius: 24, padding: 20 } },
                                library.length > 0 && (React.createElement("div", { style: { marginBottom: 12 } },
                                    React.createElement("button", { onClick: () => setPickLib((v) => !v), style: { minHeight: 44, fontFamily: F.mono, fontSize: 13, color: C.silver, background: C.panel2, borderRadius: 10, padding: "10px 14px", cursor: "pointer" } }, pickLib ? "Fechar biblioteca" : "Escolher da biblioteca"),
                                    pickLib && (React.createElement("div", { style: { marginTop: 10, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: 10 } },
                                        React.createElement("input", { value: libFilter, onChange: (e) => setLibFilter(e.target.value), placeholder: "filtrar\u2026", style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 13, color: C.text, ...glassPanel, borderRadius: 10, padding: "8px 10px", outline: "none", marginBottom: 8 } }),
                                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, maxHeight: 200, overflowY: "auto" } }, library.filter((e) => e.name.toLowerCase().includes(libFilter.trim().toLowerCase())).map((e) => (React.createElement("button", { key: e.id, onClick: () => { setForm((fm) => ({ ...fm, name: e.name, url: e.url || "" })); setPickLib(false); setLibFilter(""); }, style: { minHeight: 44, textAlign: "left", fontFamily: F.body, fontSize: 15, color: C.text, background: C.panel, border: "none", borderRadius: 10, padding: "9px 11px", cursor: "pointer" } },
                                            e.name,
                                            e.tag && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, letterSpacing: "0.04em", color: C.ink, background: C.silver, borderRadius: 999, padding: "2px 7px", marginLeft: 7 } }, e.tag),
                                            e.url ? React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, color: C.silver } }, " \u00B7 v\u00EDdeo") : "")))))))),
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
                                    React.createElement("button", { onClick: addExercise, style: { minHeight: 44, flex: 1, fontFamily: F.mono, fontSize: 13, letterSpacing: "0.04em", color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" } }, "Adicionar exerc\u00EDcio"),
                                    React.createElement("button", { onClick: () => { setAdding(false); setPickLib(false); }, style: { minHeight: 44, fontFamily: F.mono, fontSize: 13, color: C.muted, background: C.panel2, borderRadius: 10, padding: "12px 16px", cursor: "pointer" } }, "Cancelar")))) : React.createElement(AddButton, { onClick: () => setExSheet({ mode: "add" }), label: `+ Adicionar exercício em ${DAYS.find((d) => d.key === day).short}` }),
                            React.createElement(VolumeFold, { week: (data.workouts && data.workouts[profId]) || emptyWeek(), baseline: editBaselineRef.current }),
                            exSheet && profStudent && React.createElement(ExerciseSheet, { key: exSheet.mode + (exSheet.ex ? exSheet.ex.id : ""), mode: exSheet.mode, swapEx: exSheet.ex, dayList: list, week, library, dayLabel: dayFull,
                                onAdd: addExerciseFrom, onSwap: (entry) => swapExercise(exSheet.ex, entry), onRemove: () => retireExercise(exSheet.ex),
                                onManual: (q) => { setForm((f) => ({ ...f, name: q || "" })); setAdding(true); setExSheet(null); }, onClose: () => setExSheet(null) }))),
                        profViewMode === "aula" && profStudent && (React.createElement(React.Fragment, null,
                            todayKey === "dom" && freqWeek > 0 && (React.createElement("button", { onClick: buildWeeklySummary, style: { minHeight: 44, width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: C.amber, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", border: "none", borderRadius: 16, padding: "16px", cursor: "pointer", marginBottom: 14 } }, "Gerar resumo da semana")),
                            React.createElement(CardioSection, { entries: dayCardioEntries, form: cardioForm, onChange: setCardioForm, onAdd: addCardio }),
                            list.length === 0 && React.createElement(RecoverySection, { state: dayRecovery, onToggle: toggleRecovery }),
                            React.createElement("button", { className: "cc-tap", onClick: () => { flushAllPendingSaves(); if (!hasLoggedSomething || dayDone)
                                    return; haptic("confirm"); if (isRestDay)
                                    finalizeWorkout("descanso");
                                else
                                    setPseModal(true); }, disabled: !hasLoggedSomething || dayDone, style: { minHeight: 44, width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: hasLoggedSomething && !dayDone ? C.ink : C.muted, background: hasLoggedSomething && !dayDone ? C.text : C.panel2, boxShadow: hasLoggedSomething && !dayDone ? "inset 0 0 0 1px rgba(255,255,255,0.06)" : "none", border: "none", borderRadius: 16, padding: "17px", cursor: hasLoggedSomething && !dayDone ? "pointer" : "default", marginBottom: 6, transition: `transform .18s ${EASE.spring}` } }, dayDone ? (isRestDay ? "✓ Recuperação registrada" : "✓ Treino finalizado") : (isRestDay ? "✓ Salvar recuperação" : "Finalizar treino")),
                            !hasLoggedSomething && !dayDone && React.createElement("div", { style: { textAlign: "center", fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 14 } }, "Registre ao menos 1 s\u00E9rie ou o cardio pra finalizar."),
                            React.createElement(StudentMessages, { messages: messages.filter((m) => m.studentId === profId), onSend: (text) => sendMessage(text, profId) }))))))),
                (profTab === "modelos" || profTab === "biblioteca") && React.createElement(BibliotecaV3, { templates, library, students, workouts: data.workouts, dayNames: data.dayNames, defaultStudent: profId || undefined,
                    onApplyTemplate: (t, sid, dk) => applyTemplate(t, dk, sid),
                    onAddTemplate: addTemplate, onUpdateTemplate: updateTemplate, onRemoveTemplate: deleteTemplate, onAddLib: addLibrary, onUpdateLib: updateLibrary, onRemoveLib: removeLibrary }),
                profTab === "recados" && (React.createElement(React.Fragment, null,
                    // design v3: o título (não lidos + RECADOS) agora vem do próprio ProfInbox
                    React.createElement("div", { style: { marginBottom: 26 } },
                        notifButton,
                        React.createElement(ProfInbox, { key: inboxFocus || "inbox", initialOpen: inboxFocus, messages, students, onReply: replyMessage, onOpen: markThreadRead,
                            onOpenFicha: (sid) => { setActive(sid); setProfTab("alunos"); setProfView("aluno"); setFichaTab("resumo"); setRendEx(null); setExpanded(null); window.scrollTo(0, 0); } })))),
                profTab === "painel" && (React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: () => setAdvOpen((v) => !v), style: { minHeight: 44, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 8 } }, "Avan\u00E7ado \u00B7 backup e restaura\u00E7\u00E3o", React.createElement("span", { style: { color: C.muted, transform: advOpen ? "rotate(90deg)" : "none" } }, "\u203A")),
                    advOpen && React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                        React.createElement("button", { onClick: exportData, style: { minHeight: 44, fontFamily: F.mono, fontSize: 13, color: C.ink, background: C.silver, border: "none", borderRadius: 10, padding: "11px 16px", cursor: "pointer" } }, "Exportar dados"),
                        React.createElement("label", { style: { minHeight: 44, fontFamily: F.mono, fontSize: 13, color: C.silver, background: C.panel2, borderRadius: 10, padding: "11px 16px", cursor: "pointer" } },
                            "Importar",
                            React.createElement("input", { type: "file", accept: "application/json", onChange: (e) => { importData(e.target.files[0]); e.target.value = ""; }, style: { display: "none" } }))),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 } }, "Exporta tudo num arquivo .json. Importar substitui os dados atuais pelos do arquivo."),
                    React.createElement("label", { style: { minHeight: 44, display: "inline-block", marginTop: 10, fontFamily: F.mono, fontSize: 13, color: C.muted, background: "none", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px", cursor: "pointer" } },
                        "Restaurar 1 aluno de um backup antigo",
                        React.createElement("input", { type: "file", accept: "application/json", onChange: (e) => { pickRestoreFile(e.target.files[0]); e.target.value = ""; }, style: { display: "none" } })),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.5 } }, "Pra recuperar um aluno removido sem mexer nos outros — não substitui nada."),
                    restorePicker && React.createElement("div", { style: { marginTop: 10, ...glassPanel, borderRadius: 16, padding: 14 } },
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, letterSpacing: "0.06em", color: C.muted, marginBottom: 8 } }, "Quem restaurar deste backup?"),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, restorePicker.candidates.map((s) => React.createElement("button", { key: s.id, onClick: () => restoreStudentFromBackup(s.id), style: { minHeight: 44, textAlign: "left", fontFamily: F.body, fontSize: 13, color: C.text, background: C.panel2, border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, s.name))),
                        React.createElement("button", { onClick: () => setRestorePicker(null), style: { minHeight: 44, marginTop: 10, fontFamily: F.mono, fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } }, "Cancelar"))),
                    React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text, margin: "22px 0 10px" } }, "Marca"),
                    React.createElement("button", { onClick: () => setLogoCard(true), style: { minHeight: 44, fontFamily: F.mono, fontSize: 13, color: C.silver, background: C.panel2, borderRadius: 10, padding: "11px 16px", cursor: "pointer" } }, "Selo Cancio Club"),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 } }, "Uma imagem do selo do app pra usar como perfil ou postar nas redes."))))),
            role === "aluno" && !alunoStudent && (() => {
                const boxes = [0, 1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: 60, height: 72, borderRadius: 16, background: codeInput[i] && !codeErr ? C.text : "transparent", transition: "background .15s ease", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 38, color: codeInput[i] && !codeErr ? C.ink : C.text, boxShadow: codeErr ? "inset 0 0 0 1.5px " + C.warn : codeInput[i] ? "none" : i === codeInput.length ? "inset 0 0 0 1.5px " + C.silver : "inset 0 0 0 1px #2A2E37" } }, codeInput[i] || ""));
                const press = (k) => { if (loginBusy) return; haptic("tick"); setCodeErr(false); if (k === "\u232B") setCodeInput((c) => c.slice(0, -1)); else setCodeInput((c) => (c.length >= 4 ? c : c + k)); };
                const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "\u232B"].map((k, i) => React.createElement("button", { key: i, className: "cc-tap", onClick: () => k && press(k), style: { visibility: k ? "visible" : "hidden", height: 58, borderRadius: 16, border: "none", cursor: "pointer", background: "transparent", boxShadow: k === "\u232B" ? "none" : "inset 0 0 0 1px #1E222A", color: k === "\u232B" ? C.muted : C.text, fontFamily: F.display, fontWeight: 700, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: k === "\u232B" ? 20 : 26 } }, k));
                return React.createElement("div", { className: "cc-full-h", style: { display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 400, margin: "-44px auto 0", padding: "calc(40px + env(safe-area-inset-top)) 0 calc(20px + env(safe-area-inset-bottom))", boxSizing: "border-box" } },
                    React.createElement("div", { "aria-hidden": "true", style: { position: "fixed", inset: 0, background: "radial-gradient(60% 34% at 50% 22%, rgba(198,210,228,.12), transparent 70%)", pointerEvents: "none" } }),
                    React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", gap: 14, marginTop: 96 } },
                        React.createElement("img", { src: SIL_URL, alt: "", width: 84, height: 84, style: { width: 84, height: 84 } }),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 38, letterSpacing: "-0.01em" } }, React.createElement("span", { style: { lineHeight: "35px" } }, "CANCIO"), React.createElement("span", { style: { lineHeight: "35px", color: C.silver } }, "CLUB"))),
                    React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: codeErr ? C.warn : C.muted, marginTop: "auto", paddingTop: 28, textAlign: "center" } }, loginBusy ? "Buscando sua ficha\u2026" : codeErr ? "C\u00F3digo n\u00E3o encontrado. Confira com seu professor." : "Digite o c\u00F3digo que o professor te passou"),
                    React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 12 } }, boxes),
                    React.createElement("div", { style: { width: "100%", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 28, padding: "0 24px", boxSizing: "border-box" } }, keys),
                    React.createElement("button", { className: "cc-tap", onClick: () => switchRole("prof"), style: { minHeight: 44, marginTop: 10, fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.muted, background: "none", border: "none", padding: 10, cursor: "pointer" } }, "Sou professor \u203A"));
            })(),
            // esqueleto do que está prestes a aparecer (resumo + treino), em vez de deixar a tela
            // parada enquanto a Edge Function busca o aluno pelo código
            // ===== aluno · design v3 (fase 2): abas Hoje / Treino / Recados / Perfil (TabBarV3) =====
            role === "aluno" && alunoStudent && (React.createElement(React.Fragment, null,
                alunoTab === "hoje" && React.createElement(HojeV3, {
                    student: alunoStudent, greetWord, weekLine: weeklyLine, streak, todayKey, dayDate: todayISO(),
                    week, dayNames: (data.dayNames || {})[alunoId] || {}, cardio: cardioFocus,
                    dayDone: !!todaySessionAluno,
                    inProgress: (week[todayKey] || []).some((ex) => (ex.history || []).some((h) => h.date === todayISO() && Array.isArray(h.entries) && h.entries.length)),
                    lastProfMsg: messages.filter((m) => m.studentId === alunoId && m.fromProf).slice(-1)[0] || null,
                    unreadFromProf: messages.some((m) => m.studentId === alunoId && m.fromProf && !m.read),
                    onStart: () => { setDay(todayKey); setExpanded(null); setAlunoTab("treino"); window.scrollTo(0, 0); },
                    onShare: shareTodaySession,
                    onPickDay: (k) => { if (!k) { setDayEntryOpen(true); return; } setDay(k); setExpanded(null); setAlunoTab("treino"); window.scrollTo(0, 0); },
                    onOpenRecados: () => setAlunoTab("recados"),
                    onOpenDiary: () => { setAlunoTab("diario"); window.scrollTo(0, 0); },
                    banners: React.createElement(React.Fragment, null,
                        reassessDue(alunoStudent) && React.createElement("button", { className: "cc-tap", onClick: () => setReassessOpen(true), style: { position: "relative", width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px 14px", marginTop: 20, borderRadius: 16, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.text, cursor: "pointer" } },
                            React.createElement("div", { style: { flex: 1 } },
                                React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15 } }, "Hora da reavaliação"),
                                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 2 } }, "Peso e medidas, 2 minutos. Seu professor compara com o início.")),
                            React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.silver } }, "Fazer ›")),
                        // o aluno vê só a observação do professor: os trechos que a anamnese acrescenta em `obs`
                        // ("... (relatado pelo aluno): ...") são anotação pro professor, escrita na 3ª pessoa
                        alunoObs && React.createElement("div", { style: { position: "relative", marginTop: 20 } }, obsChip(alunoObs))),
                }),
                alunoTab === "diario" && React.createElement("div", { style: { paddingBottom: 110 } },
                    React.createElement("button", { className: "cc-tap", onClick: () => setAlunoTab("hoje"), style: { minHeight: 44, padding: 0, marginBottom: 8, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "‹ Hoje"),
                    React.createElement(DiaryCalendar, { diary: diary, records: records, month: diaryMonth, onMonthChange: changeDiaryMonth })),
                alunoTab === "recados" && React.createElement("div", { id: "cc-chat", style: { paddingBottom: 110 } },
                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 30, lineHeight: 1, marginBottom: 6 } }, "RECADOS"),
                    React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.text3, marginBottom: 16 } }, "Conversa com o seu professor."),
                    notifButton,
                    React.createElement(StudentMessages, { messages: messages.filter((m) => m.studentId === alunoId), onSend: (t) => { markProfRead(alunoId); sendMessage(t); } })),
                alunoTab === "treino" && (React.createElement(React.Fragment, null,
                React.createElement("div", { onTouchStart: onDaySwipeStart, onTouchEnd: onDaySwipeEnd, style: { display: "flex", gap: 14, marginBottom: 14 } },
                    React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 } },
                        list.length === 0 && React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 30, lineHeight: 1 } }, "TREINO"),
                        list.length === 0 && React.createElement(PremiumEmptyState, { icon: "rest", title: "O salão está livre hoje. Dia de recuperação ou cardio?", sub: "Sem problema — registre seu cardio abaixo, se fez." }),
                        // treino v3 (design/v3): lista corrida + registro só na barra de baixo
                        list.length > 0 && React.createElement(WorkoutV3, {
                            key: day + "|" + dayDate, list, dayDate, title: String(dayName || dayFull || "Treino").split("·")[0].trim().toUpperCase(),
                            workoutStart, offline: !cloudSynced, dayDone, canFinalize: hasLoggedSomething || dayDone,
                            bottomOffset: tabsHidden ? 0 : 84,
                            onPickDay: () => setDayEntryOpen(true),
                            onAddLoad: addLoad, onMessage: (t) => { markProfRead(alunoId); sendMessage(t); },
                            restrictionOf: (name) => restrictionFor(name, alunoStudent, "aluno"),
                            onFinalize: () => {
                                if (dayDone) {
                                    setShareCard({ name: focusStudent.name, workoutName: dayName || dayFull, durationLabel: daySession && daySession.durationSec ? fmtDur(daySession.durationSec) : "—", dateLabel: fmtDate(dayDate), targetDate: dayDate, streak, tint: tier.tint, isRestDay, exercises: list.map((e) => ({ id: e.id, name: e.name, history: e.history, sets: e.sets, setPlan: e.setPlan })) });
                                    return;
                                }
                                if (hasLoggedSomething) setFimOpen(true); // design v3: resumo do fim (FimV3) no lugar da janela de esforço
                            },
                        }))),
                todayKey === "dom" && freqWeek > 0 && (React.createElement("button", { onClick: buildWeeklySummary, style: { minHeight: 44, width: "100%", fontFamily: F.mono, fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: C.amber, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", border: "none", borderRadius: 16, padding: "16px", cursor: "pointer", marginBottom: 14 } }, "Gerar resumo da semana")),
                React.createElement(CardioSection, { entries: dayCardioEntries, form: cardioForm, onChange: setCardioForm, onAdd: addCardio }),
                list.length === 0 && React.createElement(RecoverySection, { state: dayRecovery, onToggle: toggleRecovery }),
                // dia sem exercício (cardio/recuperação) continua com a barra antiga, erguida acima das abas
                list.length === 0 && React.createElement(BottomActionBar, {
                    progress: workingProgress(list, dayDate),
                    label: dayDone ? "Compartilhar treino" : isRestDay ? "Salvar recuperação" : "Finalizar treino",
                    canFinalize: hasLoggedSomething || dayDone,
                    promote: hasLoggedSomething || dayDone,
                    hidden: typingActive,
                    lift: !tabsHidden,
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
                list.length === 0 && !hasLoggedSomething && !dayDone && React.createElement("div", { style: { textAlign: "center", fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 180 } }, "Registre o cardio ou a recuperação pra finalizar."),
                list.length > 0 && React.createElement("div", { style: { height: 200 } }))),
                // abas: só depois do termo e da anamnese (senão ficariam por cima dessas telas)
                alunoStudent.ackAt && alunoStudent.consentAt && alunoStudent.assessmentAt && !assessmentJustDone && React.createElement(TabBarV3, {
                    active: profileOpen ? "perfil" : alunoTab === "diario" ? "hoje" : alunoTab,
                    hidden: tabsHidden && !profileOpen,
                    badge: messages.filter((m) => m.studentId === alunoId && m.fromProf && !m.read).length,
                    onChange: (k) => { if (k === "perfil") { setProfileOpen(true); return; } setProfileOpen(false); setAlunoTab(k); window.scrollTo(0, 0); },
                }))),
            null)));
}
export { CancioClub };
