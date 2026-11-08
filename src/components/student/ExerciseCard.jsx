import React, { useState, useEffect } from "react";
import { CatalogPicker } from "../shared/CatalogPicker";
import { Field, TextArea } from "../shared/FormFields";
import { MediaEmbed } from "../shared/MediaEmbed";
import { PressStep } from "../shared/PressStep";
import { Stat } from "../shared/Stat";
import { RestTimer, useActiveRest } from "./RestTimer";
import { activeSet, setActiveSet } from "../../hooks/useActiveSet";
import { pendingFlushes } from "../../hooks/useLocalData";
import { C, EASE, F, KIND_CYCLE, KIND_LABELS, NON_COUNTING_KINDS, PILL_OFF_SHADOW, PILL_ON, flatPanel, glassPanel } from "../../styles/tokens";
import { fmtDate, mmss, todayISO } from "../../utils/date";
import { haptic, uidShort } from "../../utils/misc";
import { currentLoad, daySummary, defaultSetPlan, lastReps, parseReps, planSummary, repsCeiling, sortedHistory } from "../../utils/workout";

// Recharts (usada só aqui) é a maior dependência do bundle (~5MB de fonte, d3 incluso) — mas só
// é realmente necessária quando um card é expandido e o gráfico de progressão é olhado de fato.
// React.lazy adia o download/parse dela pra esse momento, em vez de pagar o custo em todo boot
// do app (inclusive pra quem nunca abre um gráfico numa sessão). Adaptador .then(m => ({default}))
// porque ProgressChart.jsx usa export nomeado, não default — padrão exigido pelo React.lazy.
const ProgressChart = React.lazy(() => import("./ProgressChart").then((m) => ({ default: m.ProgressChart })));
const chartFallback = React.createElement("div", { style: { height: 170, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 11, color: C.muted } }, "carregando gráfico…");

function ExerciseCard({ ex, role, expanded, onToggle, onAddLoad, onRemove, onUpdate, onDeleteRecord, onMove, isFirst, isLast, sessionDone, onToggleDone, tint, onNote, isNextUp, dayDate, idx }) {
    const [date, setDate] = useState(dayDate || todayISO());
    // se a aba do dia mudar enquanto o card já está montado, realinha a data-alvo do auto-save —
    // sem isso, um toque na aba de Segunda numa Terça gravaria o treino como se fosse de terça
    useEffect(() => { setDate(dayDate || todayISO()); }, [dayDate]);
    const [metric, setMetric] = useState("volume");
    const [showVideo, setShowVideo] = useState(false);
    const [f, setF] = useState({ name: ex.name, rest: ex.rest ?? "", note: ex.note ?? "", url: ex.url ?? "" });
    useEffect(() => { setF({ name: ex.name, rest: ex.rest ?? "", note: ex.note ?? "", url: ex.url ?? "" }); setShowVideo(false); }, [ex.id]);
    const plan = (ex.setPlan && ex.setPlan.length) ? ex.setPlan : defaultSetPlan(ex.sets, ex.reps);
    const [planReps, setPlanReps] = useState(plan.map((s) => s.reps));
    useEffect(() => { setPlanReps(plan.map((s) => s.reps)); }, [ex.id, plan.length]);
    const hist = sortedHistory(ex.history);
    const cur = currentLoad(ex);
    const lr = lastReps(ex);
    const first = hist.length ? daySummary(hist[0]).load : 0;
    const delta = cur - first;
    // Progressão dupla: olha as séries de trabalho registradas no dia sendo editado (ignora
    // aquecimento) e vê se todas bateram o teto da meta de reps. Usa `date` (o dia da aba atual),
    // não todayISO() — senão essa checagem nunca via nada ao registrar um treino atrasado.
    const todayHistEntry = hist.find((h) => h.date === date && Array.isArray(h.entries));
    const hasAnySetToday = !!todayHistEntry;
    const workingToday = todayHistEntry ? todayHistEntry.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind) && parseReps(e.reps) != null) : [];
    const ceilingHit = workingToday.length > 0 && workingToday.every((e) => { const c = repsCeiling(e.targetReps); return c != null && parseReps(e.reps) >= c; });
    // sessão anterior de VERDADE: a última registrada ANTES do dia que está sendo preenchido agora
    // (não simplesmente a última do array — com treino atrasado registrado fora de ordem, a entrada
    // mais recente do histórico pode ser de um dia posterior ao que está na tela)
    const lastEntries = (() => { for (let i = hist.length - 1; i >= 0; i--) {
        if (hist[i].date >= date)
            continue;
        if (Array.isArray(hist[i].entries))
            return hist[i].entries;
    } return null; })();
    // casa pelo setId (identidade estável da série), nunca pela posição no array — a ordem em que as
    // séries foram SALVAS na sessão anterior pode não bater com a ordem do plano atual (ex.: aluno
    // corrigiu a série 1 depois da 2), e casar por índice mostrava "o que fiz na sessão passada" da
    // série errada — isso é o que estava deixando as séries bagunçadas entre sessões
    // Os campos de carga/reps nascem VAZIOS de propósito — a sessão anterior nunca fica dentro do
    // campo editável. Ela aparece como uma dica à parte ("última vez: Xkg × Y") perto do campo, e
    // some assim que o aluno de fato registra algo. Antes (rowsFromLast pré-preenchendo load/reps
    // com o número da sessão passada) um toque exploratório no +/- ou nos atalhos de carga já
    // confirmava e SALVAVA aquele número como se fosse o treino de hoje — foi assim que uma conta
    // de teste acabou com toda a semana marcada como "feita" no mesmo dia sem o aluno ter treinado
    // de verdade. Ver também os atalhos de carga mais abaixo, que agora buscam a sessão anterior
    // direto (não mais a partir do valor do campo, que não existe mais até o aluno tocar).
    const rowsFromLast = () => plan.map((s) => ({ setId: s.id, kind: s.kind, targetReps: s.reps, load: "", reps: "" }));
    const [rows, setRows] = useState(rowsFromLast);
    // Auto-Save (ver efeito mais abaixo) só pode disparar numa mudança FEITA PELO ALUNO. `sigOf`
    // registra o que já é "conhecido" assim que as linhas nascem (aqui) ou são repostas (efeito do
    // ex.id logo abaixo), pra o auto-save só reagir ao que vier depois disso.
    const sigOf = (r) => `${r.load}|${r.reps}`;
    const lastAutoSaveSigRef = React.useRef({});
    if (!lastAutoSaveSigRef.current.__seeded) {
        rows.forEach((r) => { lastAutoSaveSigRef.current[r.setId] = sigOf(r); });
        lastAutoSaveSigRef.current.__seeded = true;
    }
    useEffect(() => {
        const fresh = rowsFromLast();
        setRows(fresh);
        const seeded = { __seeded: true };
        fresh.forEach((r) => { seeded[r.setId] = sigOf(r); });
        lastAutoSaveSigRef.current = seeded;
    }, [ex.id]);
    const [restTrigger, setRestTrigger] = useState(0);
    // Descanso no card (redesign estético 4, item 5): o cronômetro em si ainda mora no RestTimer
    // (mantido montado, só sem UI própria — ver abaixo), mas o canto do card onde a carga normalmente
    // fica vira o anel de contagem regressiva enquanto o descanso DESTE exercício está rodando.
    const activeRest = useActiveRest();
    const isResting = role === "aluno" && !!activeRest && activeRest.key === "cancio:rt:" + ex.id;
    const [, forceRestTick] = useState(0);
    useEffect(() => { if (!isResting) return; const id = setInterval(() => forceRestTick((n) => n + 1), 250); return () => clearInterval(id); }, [isResting, activeRest && activeRest.key]);
    // Modo Foco: em vez de exigir bater a contagem EXATA do plano (rígido demais pra treino fora de
    // ordem ou séries ajustadas na hora), considera concluído se a última série de trabalho da lista
    // já foi registrada hoje, OU se o aluno confirmou manualmente pelo botão "Concluir Exercício"
    const workingPlanCount = plan.filter((s) => !NON_COUNTING_KINDS.has(s.kind)).length;
    const workingRows = rows.filter((r) => !NON_COUNTING_KINDS.has(r.kind));
    const lastWorkingRow = workingRows[workingRows.length - 1];
    const lastRowLogged = !!lastWorkingRow && workingToday.some((e) => e.setId === lastWorkingRow.setId);
    const [manuallyCompleted, setManuallyCompleted] = useState(false);
    useEffect(() => { setManuallyCompleted(false); }, [date, ex.id]);
    const isFullyLogged = (workingPlanCount > 0 && lastRowLogged) || manuallyCompleted;
    const prevFullyLoggedRef = React.useRef(isFullyLogged);
    // esmaece suavemente antes de trocar pro resumo fino (Modo Foco / pulado), em vez de saltar de uma vez
    const [settling, setSettling] = useState(false);
    const settleTimeoutRef = React.useRef(null);
    const startSettle = () => {
        setSettling(true);
        if (settleTimeoutRef.current)
            clearTimeout(settleTimeoutRef.current);
        settleTimeoutRef.current = setTimeout(() => setSettling(false), 400);
    };
    useEffect(() => () => { if (settleTimeoutRef.current)
        clearTimeout(settleTimeoutRef.current); }, []);
    useEffect(() => {
        if (role === "aluno" && isFullyLogged && !prevFullyLoggedRef.current) {
            // NÃO recolhe o cartão aqui: fechar no instante em que a última série é salva tira o
            // exercício da tela no meio do ajuste (ex.: corrigir as reps da última série logo depois).
            // O cartão só passa pro resumo fino quando o próprio aluno o recolhe.
            startSettle();
        }
        prevFullyLoggedRef.current = isFullyLogged;
    }, [isFullyLogged]);
    // Pulso do Recorde: compara a melhor carga do dia sendo editado contra o histórico anterior —
    // no instante em que ultrapassa, acende um brilho âmbar efêmero no cartão (reforço visual
    // imediato e local, separado da comemoração de tela cheia que já existe pra recordes)
    const priorSummaries = hist.filter((h) => h.date !== date).map(daySummary);
    const priorBestLoad = priorSummaries.map((s) => s.load).filter((v) => typeof v === "number").reduce((m, v) => (m == null || v > m ? v : m), null);
    const todaySummary = todayHistEntry ? daySummary(todayHistEntry) : null;
    const isNewPR = priorBestLoad != null && todaySummary && typeof todaySummary.load === "number" && todaySummary.load > priorBestLoad;
    const prevIsNewPRRef = React.useRef(isNewPR);
    const [prGlow, setPrGlow] = useState(false);
    useEffect(() => {
        if (isNewPR && !prevIsNewPRRef.current) {
            setPrGlow(true);
            const t = setTimeout(() => setPrGlow(false), 1600);
            prevIsNewPRRef.current = isNewPR;
            return () => clearTimeout(t);
        }
        prevIsNewPRRef.current = isNewPR;
    }, [isNewPR]);
    const updateRow = (i, patch) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
    const [flashId, setFlashId] = useState(null);
    const [lastSavedKind, setLastSavedKind] = useState(null);
    // salva a série assim que o campo perde o foco — não espera um botão final, pra não perder dados se o app fechar no meio do treino
    const saveRow = (i, checkPR, overrides) => {
        const r = { ...rows[i], ...(overrides || {}) };
        const ln = parseFloat(String(r.load).replace(",", "."));
        if (isNaN(ln))
            return;
        const repsRaw = String(r.reps).trim();
        const repsVal = repsRaw === "" ? undefined : (/^\d+$/.test(repsRaw) ? parseInt(repsRaw, 10) : repsRaw); // número puro vira número; "12+4+3"/"4/4/4" fica como string (o parseReps soma na hora de calcular)
        onAddLoad(ex.id, { date, setId: r.setId, kind: r.kind, targetReps: r.targetReps, load: ln, reps: repsVal, checkPR });
        if (isSkipped)
            setIsSkipped(false); // registrou de verdade -> não está mais "pulado"
        if (repsVal !== undefined) {
            setLastSavedKind(r.kind);
            setRestTrigger((t) => t + 1);
        } // série completa (carga + reps) — dispara o descanso automaticamente, já sabendo que tipo de série foi
        // feedback tátil já sai do próprio PressStep (no gesto de confirmar), não daqui — evita vibrar 2x por toque
        setFlashId(r.setId);
        setTimeout(() => setFlashId((f) => (f === r.setId ? null : f)), 500); // pisca a linha por 500ms como feedback visual
    };
    const todayEntry = hist.find((h) => h.date === date && Array.isArray(h.entries));
    // Auto-Save à prova de bloqueio de tela: além do onBlur, salva sozinho 800ms depois de
    // qualquer mudança em carga/reps, pra não perder o que foi digitado se a tela travar antes
    // do campo perder o foco. Usa o setId (estável) pra achar a linha certa na hora de salvar,
    // já que a posição dela no array pode mudar durante a espera do debounce.
    const rowsRef = React.useRef(rows);
    rowsRef.current = rows;
    const autoSaveTimersRef = React.useRef({});
    useEffect(() => {
        rows.forEach((r) => {
            const key = r.setId;
            const sig = sigOf(r);
            if (lastAutoSaveSigRef.current[key] === sig)
                return; // não mudou desde o último agendamento
            lastAutoSaveSigRef.current[key] = sig;
            if (autoSaveTimersRef.current[key])
                clearTimeout(autoSaveTimersRef.current[key]);
            autoSaveTimersRef.current[key] = setTimeout(() => {
                const idx = rowsRef.current.findIndex((rr) => rr.setId === key);
                if (idx !== -1)
                    saveRow(idx, true);
            }, 800);
        });
    }, [rows]);
    // cleanup único: no unmount (troca de dia/aba, não só fechar o app), PRECISA salvar o que
    // ainda estava no debounce antes de cancelar os timers — senão a última série digitada
    // evapora silenciosamente. flushMine já faz isso; o cleanup só precisa chamá-la também.
    useEffect(() => {
        const flushMine = () => {
            Object.keys(autoSaveTimersRef.current).forEach((key) => {
                if (!autoSaveTimersRef.current[key])
                    return;
                clearTimeout(autoSaveTimersRef.current[key]);
                autoSaveTimersRef.current[key] = null;
                const idx = rowsRef.current.findIndex((rr) => rr.setId === key);
                if (idx !== -1)
                    saveRow(idx, true);
            });
        };
        pendingFlushes.add(flushMine);
        return () => {
            flushMine();
            pendingFlushes.delete(flushMine);
        };
    }, []);
    const [showNote, setShowNote] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);
    const [noteText, setNoteText] = useState((todayEntry && todayEntry.studentNote) || "");
    useEffect(() => { setNoteText((todayEntry && todayEntry.studentNote) || ""); setShowNote(false); }, [ex.id]);
    const isRowSaved = (r) => { if (!todayEntry)
        return false; const se = todayEntry.entries.find((e) => e.setId === r.setId); if (!se)
        return false; const ln = parseFloat(String(r.load).replace(",", ".")); return se.load === ln; };
    const commit = (patch) => onUpdate(ex.id, patch);
    const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? undefined : n; };
    const commitPlan = (np) => { const workingReps = (np.filter((s) => !NON_COUNTING_KINDS.has(s.kind))[0] || {}).reps || "10"; onUpdate(ex.id, { setPlan: np, sets: np.length, reps: workingReps }); };
    const setRowKind = (i, kind) => {
        setRows((rs) => rs.map((r, k) => (k === i ? { ...r, kind } : r)));
        commitPlan(plan.map((s, k) => (k === i ? { ...s, kind } : s)));
    };
    const commitRowReps = (i) => commitPlan(plan.map((s, k) => (k === i ? { ...s, reps: planReps[i] || "10" } : s)));
    const addSetRow = (kind) => {
        const id = uidShort();
        const reps = kind === "warmup" ? "15" : kind === "recon" ? "5" : (plan.length ? plan[plan.length - 1].reps : "10");
        setRows((rs) => [...rs, { setId: id, kind, targetReps: reps, load: "", reps: "" }]);
        commitPlan([...plan, { id, kind, reps }]);
    };
    const removeSetRow = (i) => {
        const np = plan.filter((_, k) => k !== i);
        setRows((rs) => rs.filter((_, k) => k !== i));
        commitPlan(np.length ? np : [{ id: uidShort(), kind: "working", reps: "10" }]);
    };
    // publica a próxima série pendente deste exercício pra faixa fixa do rodapé
    const pendingIdx = rows.findIndex((r) => r.kind !== "warmup" && !isRowSaved(r));
    const pendingRow = pendingIdx >= 0 ? rows[pendingIdx] : null;
    useEffect(() => {
        const clear = () => { if (activeSet.current && activeSet.current.exId === ex.id) setActiveSet(null); };
        if (role !== "aluno" || !expanded || !pendingRow) { clear(); return clear; }
        const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 2) / 2));
        const warmupsBefore = rows.slice(0, pendingIdx + 1).filter((r) => r.kind === "warmup").length;
        setActiveSet({
            exId: ex.id, exName: ex.name, setLabel: "Série " + (pendingIdx + 1 - warmupsBefore),
            targetReps: pendingRow.targetReps, reps: pendingRow.reps, load: pendingRow.load,
            saveLoad: (v) => { updateRow(pendingIdx, { load: fmt(v) }); saveRow(pendingIdx, true, { load: fmt(v) }); },
            saveReps: (v) => { updateRow(pendingIdx, { reps: String(v) }); saveRow(pendingIdx, false, { reps: String(v) }); },
            saveBoth: (l, r) => { updateRow(pendingIdx, { load: fmt(l), reps: String(r) }); saveRow(pendingIdx, true, { load: fmt(l), reps: String(r) }); },
            lastLoad: currentLoad(ex), restSec: ex.rest,
        });
        return clear;
    }, [role, expanded, pendingIdx, ex.id, ex.name, pendingRow && pendingRow.load, pendingRow && pendingRow.reps]);
    // Modo Foco: exercício concluído hoje + recolhido -> cartão fino, só nome + check, pra limpar a rolagem
    if (!expanded && role === "aluno" && isFullyLogged && !settling) {
        return (React.createElement("div", { onTouchStart: (e) => e.stopPropagation(), style: { ...flatPanel, borderRadius: 22, overflow: "hidden" } },
            React.createElement("button", { onClick: () => onToggle(ex.id), style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" } },
                React.createElement("span", { style: { flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ex.name),
                cur > 0 && React.createElement("span", { style: { flexShrink: 0, fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 15, color: C.silver } }, cur + " kg"),
                React.createElement("div", { style: { flexShrink: 0, display: "flex", gap: 2.5 } }, workingPlanCount > 0 && Array.from({ length: workingPlanCount }).map((_, i) => React.createElement("span", { key: i, style: { width: 10, height: 6, borderRadius: 2, backgroundImage: PILL_ON, boxShadow: "none" } }))))));
    }
    // exercício "pulado" (aluno decidiu não fazer hoje) + recolhido -> cartão apagado, nome riscado, sem poluir a lista mental
    if (!expanded && role === "aluno" && isSkipped && !hasAnySetToday && !settling) {
        return (React.createElement("div", { onTouchStart: (e) => e.stopPropagation(), style: { ...flatPanel, borderRadius: 22, overflow: "hidden", opacity: 0.55, transition: "opacity .4s ease" } },
            React.createElement("button", { onClick: () => onToggle(ex.id), style: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" } },
                React.createElement("span", { style: { flex: 1, fontFamily: F.body, fontSize: 13.5, color: C.muted, textDecoration: "line-through" } }, ex.name),
                React.createElement("span", { style: { fontFamily: F.mono, fontSize: 9.5, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" } }, "pulado"))));
    }
    const shell = role === "aluno" ? flatPanel : glassPanel;
    const nextSetLabel = (() => { if (!pendingRow) return null; const warmupsBefore = rows.slice(0, pendingIdx + 1).filter((r) => r.kind === "warmup").length; return "S" + (pendingIdx + 1 - warmupsBefore); })();
    return (React.createElement("div", { onTouchStart: (e) => e.stopPropagation(), style: { position: "relative", ...shell, borderRadius: 26, overflow: "hidden", opacity: settling ? 0.55 : 1, boxShadow: prGlow ? `0 0 0 1.5px ${C.amber}, 0 0 28px ${C.amber}88, 0 8px 32px rgba(0,0,0,0.4)` : isNextUp ? `0 0 0 1.5px ${tint || C.amber}, 0 0 22px ${(tint || C.amber)}55, 0 8px 32px rgba(0,0,0,0.4)` : shell.boxShadow, transition: "opacity .4s ease, box-shadow .5s ease" } },
        isNextUp && React.createElement("div", { style: { position: "absolute", top: 10, left: 18, zIndex: 2, fontFamily: F.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink, background: tint || C.amber, borderRadius: 999, padding: "3px 9px", animation: "cc-glow 2.2s ease-in-out infinite" } }, "Comece aqui"),
        React.createElement("div", { style: { position: "absolute", top: 16, right: 16, width: 7, height: 7, borderRadius: "50%", background: tint || C.line, zIndex: 1, boxShadow: tint ? `0 0 10px 2px ${tint}88` : "none" } }),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: isNextUp ? "34px 18px 16px" : "16px 18px" } },
            React.createElement("button", { onClick: () => onToggle(ex.id), style: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: 0 } },
                role === "prof" && React.createElement("div", { style: { flexShrink: 0, width: 38, height: 38, borderRadius: 12, background: `linear-gradient(145deg, ${(tint || C.amber)}30, ${(tint || C.amber)}0a)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body, fontWeight: 700, fontSize: 15, color: tint || C.amber } }, idx ? String(idx) : ex.name.charAt(0).toUpperCase()),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { fontFamily: F.display, fontSize: 17, color: C.text, fontWeight: 700, letterSpacing: "-0.015em" } }, ex.name),
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 12, color: C.muted, marginTop: 3 } },
                        isResting && activeRest ? (React.createElement("span", null, React.createElement("span", { style: { color: C.silver, fontWeight: 700 } }, "DESCANSO"), " \u00B7 pr\u00F3xima: " + (nextSetLabel || "\u2014") + (cur ? " \u00B7 " + cur + " kg" : ""))) : React.createElement(React.Fragment, null,
                            planSummary(ex),
                            ex.rest ? ` · desc ${ex.rest}s` : "",
                            ex.url ? React.createElement("span", { style: { color: C.silver } }, " \u00B7 v\u00EDdeo") : "",
                            ex.note ? React.createElement("span", { style: { color: C.amber } }, " \u00B7 obs") : ""))),
                isResting && activeRest ? (() => {
                    const remaining = Math.max(0, Math.ceil((activeRest.endTime - Date.now()) / 1000));
                    const p = activeRest.total > 0 ? Math.min(100, Math.max(0, (1 - remaining / activeRest.total) * 100)) : 0;
                    const ringR = 32, ringC = 2 * Math.PI * ringR;
                    return React.createElement("div", { style: { position: "relative", flexShrink: 0, width: 76, height: 76 } },
                        React.createElement("svg", { width: 76, height: 76, viewBox: "0 0 76 76" },
                            React.createElement("circle", { cx: 38, cy: 38, r: ringR, fill: "none", stroke: C.line2, strokeWidth: 4 }),
                            React.createElement("circle", { cx: 38, cy: 38, r: ringR, fill: "none", stroke: C.silver, strokeWidth: 4, strokeLinecap: "round", strokeDasharray: ringC, strokeDashoffset: ringC * (1 - p / 100), transform: "rotate(-90 38 38)", style: { transition: "stroke-dashoffset .3s linear" } })),
                        React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" } },
                            React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 19, color: C.text, fontVariantNumeric: "tabular-nums" } }, mmss(remaining))));
                })() : React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 22 } },
                        ceilingHit && React.createElement("span", { title: "Teto de reps atingido \u2014 hora de subir a carga", style: { color: C.amber, marginRight: 5 } }, "\u2191"),
                        React.createElement("span", { style: { fontFamily: F.display, fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", fontSize: 27 } }, cur),
                        React.createElement("span", { style: { fontSize: 12, fontWeight: 500, color: C.muted } }, " kg")),
                    role === "aluno"
                        ? (delta !== 0 && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, fontWeight: 600, color: C.muted, marginTop: 5, textAlign: "right" } }, (delta >= 0 ? "+" : "") + delta + " kg"))
                        : React.createElement("div", { style: { display: "inline-flex", fontFamily: F.mono, fontSize: 10.5, fontWeight: 600, color: delta >= 0 ? C.ink : C.muted, background: delta >= 0 ? C.amber : "rgba(255,255,255,0.08)", borderRadius: 999, padding: "2px 8px", marginTop: 5 } },
                            delta >= 0 ? "+" : "",
                            delta,
                            " kg")),
                React.createElement("span", { style: { color: C.muted, fontFamily: F.mono, fontSize: 13, transform: expanded ? "rotate(90deg)" : "none", transition: "transform .2s" } }, "\u203A")),
            role === "aluno" && !hasAnySetToday && (React.createElement("button", { onClick: () => { if (expanded)
                    onToggle(ex.id); if (!isSkipped)
                    startSettle(); setIsSkipped((v) => !v); }, style: { flexShrink: 0, fontFamily: F.mono, fontSize: 10.5, color: isSkipped ? C.silver : C.muted, background: C.panel2, border: "none", borderRadius: 999, padding: "7px 11px", cursor: "pointer" } }, isSkipped ? "Desfazer" : "Pular exerc\u00EDcio"))),
        role === "aluno" && workingPlanCount > 0 && React.createElement("div", { style: { display: "flex", gap: 2.5, padding: "0 18px 14px" } },
            Array.from({ length: workingPlanCount }).map((_, i) => React.createElement("span", { key: i, style: { width: 22, height: 8, borderRadius: 3, backgroundImage: i < workingToday.length ? PILL_ON : undefined, boxShadow: i < workingToday.length ? "none" : PILL_OFF_SHADOW, animation: (i === workingToday.length) ? "cc-glow 1.4s ease-in-out infinite" : "none" } }))),
        React.createElement("div", { className: `cc-accordion${expanded ? " cc-open" : ""}` },
            React.createElement("div", { className: "cc-accordion-inner" },
                React.createElement("div", { style: { borderTop: `1px solid ${C.line}`, padding: 16 } },
                    role === "aluno" && !isFullyLogged && (React.createElement("button", { className: "cc-tap", onClick: () => { haptic("confirm"); setManuallyCompleted(true); }, style: { width: "100%", fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.04em", color: C.silver, background: C.panel2, border: "none", borderRadius: 12, padding: "10px", cursor: "pointer", marginBottom: 14, transition: `transform .18s ${EASE.spring}` } }, "Concluir Exerc\u00EDcio")),
                    ceilingHit && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: "rgba(228,228,233,.10)", borderRadius: 10, padding: "11px 14px", marginBottom: 14 } },
                        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.amber } }, "\u2191 Teto atingido! Hora de subir a carga"))),
                    role === "aluno" && ex.profNote && React.createElement("div", { style: { background: C.panel2, borderRadius: 10, padding: "10px 12px", marginBottom: 10 } }, React.createElement("div", { style: { fontFamily: F.display, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", color: C.muted } }, "NOTA DO PROFESSOR"), React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: C.text, marginTop: 4 } }, ex.profNote)),
                    ex.note && (React.createElement("div", { style: { borderLeft: `2px solid ${C.amber}`, background: C.panel2, borderRadius: "0 8px 8px 0", padding: "10px 12px", marginBottom: 14 } },
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber, marginBottom: 4 } }, "Observa\u00E7\u00E3o"),
                        React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.5 } }, ex.note))),
                    ex.url && (React.createElement("div", { style: { marginBottom: 14 } },
                        React.createElement("button", { onClick: () => setShowVideo((v) => !v), style: { fontFamily: F.mono, fontSize: 12, letterSpacing: "0.03em", color: C.silver, background: C.panel2, borderRadius: 10, padding: "9px 14px", cursor: "pointer" } }, showVideo ? "Ocultar demonstração" : "Ver demonstração"),
                        showVideo && React.createElement(MediaEmbed, { url: ex.url }))),
                    role === "aluno" && React.createElement(RestTimer, { seconds: ex.rest, autoStart: restTrigger, overrideSeconds: lastSavedKind === "warmup" ? 60 : undefined, timerKey: ex.id, hidden: true }),
                    role === "prof" ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } },
                            React.createElement(Stat, { value: `${cur}`, label: "carga (kg)", accent: C.silver }),
                            React.createElement(Stat, { value: lr != null ? lr : "—", label: "reps", accent: "#E4E4E9" }),
                            React.createElement(Stat, { value: hist.length, label: "sess\u00F5es" })),
                        React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } },
                            React.createElement("button", { onClick: () => setMetric("load"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "load" ? C.ink : C.muted, background: metric === "load" ? C.silver : "transparent", border: `1px solid ${metric === "load" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Carga"),
                            React.createElement("button", { onClick: () => setMetric("reps"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "reps" ? C.ink : C.muted, background: metric === "reps" ? C.silver : "transparent", border: `1px solid ${metric === "reps" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Reps"),
                            React.createElement("button", { onClick: () => setMetric("volume"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "volume" ? C.ink : C.muted, background: metric === "volume" ? C.silver : "transparent", border: `1px solid ${metric === "volume" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Tonelagem")),
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: -4, marginBottom: 10 } }, metric === "volume" ? "tonelagem = soma de carga × reps de todas as séries de trabalho do dia" : "gráfico considera a série de trabalho mais pesada do dia"),
                        React.createElement(React.Suspense, { fallback: chartFallback }, React.createElement(ProgressChart, { ex: ex, metric: metric })))) : (React.createElement("div", { style: { marginBottom: 14 } },
                        React.createElement("button", { onClick: () => setShowHistory((v) => !v), style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.03em", color: C.muted, background: "rgba(255,255,255,0.03)", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" } },
                            showHistory ? "Ocultar histórico e progressão" : "Ver histórico e progressão",
                            " ",
                            React.createElement("span", { style: { transform: showHistory ? "rotate(90deg)" : "none", transition: "transform .2s" } }, "\u203A")),
                        showHistory && (React.createElement("div", { style: { marginTop: 12 } },
                            React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } },
                                React.createElement(Stat, { value: `${cur}`, label: "carga (kg)", accent: C.silver }),
                                React.createElement(Stat, { value: lr != null ? lr : "—", label: "reps", accent: "#E4E4E9" }),
                                React.createElement(Stat, { value: hist.length, label: "sess\u00F5es" })),
                            React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } },
                                React.createElement("button", { onClick: () => setMetric("load"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "load" ? C.ink : C.muted, background: metric === "load" ? C.silver : "transparent", border: `1px solid ${metric === "load" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Carga"),
                                React.createElement("button", { onClick: () => setMetric("reps"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "reps" ? C.ink : C.muted, background: metric === "reps" ? C.silver : "transparent", border: `1px solid ${metric === "reps" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Reps"),
                                React.createElement("button", { onClick: () => setMetric("volume"), style: { fontFamily: F.mono, fontSize: 11.5, color: metric === "volume" ? C.ink : C.muted, background: metric === "volume" ? C.silver : "transparent", border: `1px solid ${metric === "volume" ? C.silver : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" } }, "Tonelagem")),
                            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: -4, marginBottom: 10 } }, metric === "volume" ? "tonelagem = soma de carga × reps de todas as séries de trabalho do dia" : "gráfico considera a série de trabalho mais pesada do dia"),
                            React.createElement(React.Suspense, { fallback: chartFallback }, React.createElement(ProgressChart, { ex: ex, metric: metric })))))),
                    role === "aluno" && (React.createElement(React.Fragment, null,
                        React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
                            React.createElement(Field, { label: "Data", type: "date", value: date, onChange: (e) => setDate(e.target.value), flex: "0 1 140px" }),
                            React.createElement("button", { onClick: () => setShowNote((v) => !v), style: { fontFamily: F.mono, fontSize: 11.5, color: (todayEntry && todayEntry.studentNote) ? C.amber : C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } },
                                "Anota\u00E7\u00E3o",
                                (todayEntry && todayEntry.studentNote) ? " ✓" : "")),
                        showNote && (React.createElement(TextArea, { label: "Nota sobre este exerc\u00EDcio hoje", rows: 2, placeholder: "Ex.: senti dor no ombro, m\u00E1quina nova, aumentei a amplitude\u2026", value: noteText, onChange: (e) => setNoteText(e.target.value), onBlur: () => onNote(ex.id, date, noteText.trim()) })),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 10 } }, rows.map((r, i) => {
                            const isChild = (r.kind === "rest-pause" || r.kind === "cluster") && i > 0; // série filha: mesma carga da série mãe, só reps extras importam
                            const effLoad = isChild ? (rows[i - 1] ? rows[i - 1].load : r.load) : r.load;
                            const saved = isRowSaved(isChild ? { ...r, load: effLoad } : r);
                            const last = lastEntries && lastEntries.find((e) => e.setId === r.setId); // sessão anterior desta série — só referência, nunca pré-preenche o campo
                            const isWork = r.kind !== "warmup";
                            const repsIsComposite = /[+/]/.test(String(r.reps));
                            const formatLoad = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 2) / 2));
                            const isPending = role === "aluno" && i === pendingIdx;
                            const kindLabel = isChild ? null
                                : isPending ? "AGORA"
                                    : r.kind === "warmup" ? `Aquec. · alvo ${r.targetReps}`
                                        : r.kind === "recon" ? `Reconhec. · alvo ${r.targetReps}`
                                            : `S${i + 1 - plan.slice(0, i + 1).filter((s) => NON_COUNTING_KINDS.has(s.kind)).length} · alvo ${r.targetReps}`;
                            return (React.createElement("div", { key: r.setId, className: flashId === r.setId ? "cc-flash-row" : "", style: { background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: "10px 10px", marginLeft: isChild ? 24 : 0, opacity: isWork ? 1 : 0.6, boxShadow: saved ? `inset 0 0 0 1.5px ${C.amber}55` : isPending ? `inset 0 0 0 1.5px ${C.line2}` : "none" } },
                                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } },
                                    React.createElement("button", { onClick: () => setRowKind(i, KIND_CYCLE[(KIND_CYCLE.indexOf(r.kind) + 1) % KIND_CYCLE.length]), style: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
                                        React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: r.kind === "warmup" ? C.muted : r.kind === "recon" ? C.amber : C.text } }, isChild ? React.createElement(React.Fragment, null,
                                            "\u21B3 ",
                                            React.createElement("span", { style: { color: C.warn } }, KIND_LABELS[r.kind])) : kindLabel),
                                        !isChild && (r.kind === "rest-pause" || r.kind === "cluster" || r.kind === "back-off") && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 7.5, letterSpacing: "0.02em", textTransform: "uppercase", color: C.warn, background: "rgba(232,121,75,.14)", borderRadius: 4, padding: "1px 4px" } }, KIND_LABELS[r.kind])),
                                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                                        saved && React.createElement("span", { style: { color: C.amber, fontFamily: F.mono, fontSize: 13 } }, "\u2713"),
                                        React.createElement("button", { onClick: () => removeSetRow(i), title: "Remover", style: { color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.mono, fontSize: 15, lineHeight: 1, padding: 0 } }, "\u00D7"))),
                                React.createElement("div", { style: { display: "flex", alignItems: "stretch" } },
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                                        isChild ? (React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontWeight: 800, fontSize: 24, color: C.muted, padding: "6px 0" } },
                                            effLoad || "—",
                                            React.createElement("span", { style: { fontSize: 12, fontWeight: 500 } }, " kg"))) : (React.createElement(PressStep, { value: r.load, onStep: (v) => updateRow(i, { load: formatLoad(v) }), onCommit: (v) => saveRow(i, true, { load: formatLoad(v) }), onTypeCommit: (v) => { updateRow(i, { load: v }); saveRow(i, true, { load: v }); }, step: 1, color: C.text, suffix: " kg", size: 22 })),
                                        React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontSize: 8.5, letterSpacing: "0.08em", color: C.muted, marginTop: 2 } }, "CARGA")),
                                    React.createElement("div", { style: { width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", margin: "2px 6px", flexShrink: 0 } }),
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                                        React.createElement(PressStep, { value: r.reps, onStep: (v) => { if (repsIsComposite)
                                                return; updateRow(i, { reps: String(Math.round(v)) }); }, onCommit: (v) => { if (repsIsComposite)
                                                return; saveRow(i, false, isChild ? { reps: String(Math.round(v)), load: effLoad } : { reps: String(Math.round(v)) }); }, onTypeCommit: (v) => { updateRow(i, { reps: v }); saveRow(i, false, isChild ? { reps: v, load: effLoad } : { reps: v }); }, step: 1, color: C.text, suffix: "", size: 22, disabled: repsIsComposite }),
                                        React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontSize: 8.5, letterSpacing: "0.08em", color: C.muted, marginTop: 2 } }, isChild ? "EXTRAS" : "REPS"))),
                                !isChild && last && typeof last.load === "number" && !r.load && !r.reps && React.createElement("div", { style: { textAlign: "center", fontFamily: F.mono, fontSize: 10.5, color: C.muted, marginTop: 6 } },
                                    "última vez: ",
                                    React.createElement("span", { style: { color: C.silver } }, `${last.load} kg`),
                                    (typeof last.reps === "number" || (typeof last.reps === "string" && last.reps)) ? ` × ${last.reps}` : ""),
                                (!saved && isWork && !isChild) && (() => {
                                    // atalhos de um toque: repete a carga digitada agora (se já tiver algo) ou a da sessão
                                    // anterior, e sobe 2,5 / 5 kg em cima dela — salva na hora
                                    const typedLoad = Number(String(r.load).replace(",", ".")) || 0;
                                    const base = typedLoad || (typeof last?.load === "number" ? last.load : 0);
                                    if (!base) return null;
                                    const opts = [{ l: formatLoad(base) + " kg", v: base }, { l: "+2,5", v: base + 2.5 }, { l: "+5", v: base + 5 }];
                                    return React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 9 } }, opts.map((o, k) => React.createElement("button", { key: k, className: "cc-tap", onClick: () => { haptic("confirm"); updateRow(i, { load: formatLoad(o.v) }); saveRow(i, true, { load: formatLoad(o.v) }); }, style: { flex: 1, minWidth: 0, fontFamily: F.display, fontWeight: 700, fontSize: 13.5, color: k === 0 ? "#05060A" : C.silver, background: k === 0 ? "linear-gradient(150deg,#EEF3FB,#B9C6D9)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: "12px 0", cursor: "pointer", transition: "transform .18s " + EASE.spring } }, o.l)));
                                })()));
                        })),
                        React.createElement("div", { style: { marginTop: 10, fontFamily: F.mono, fontSize: 10, color: C.muted, textAlign: "center" } }, "cada s\u00E9rie \u00E9 salva sozinha assim que voc\u00EA registra carga e reps"),
                        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12, justifyContent: "center" } },
                            React.createElement("button", { onClick: () => addSetRow("warmup"), style: { fontFamily: F.mono, fontSize: 11.5, color: C.silver, background: "transparent", border: `1px dashed ${C.line}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer" } }, "+ Aquec"),
                            React.createElement("button", { onClick: () => addSetRow("working"), style: { fontFamily: F.mono, fontSize: 11.5, color: C.silver, background: "transparent", border: `1px dashed ${C.line}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer" } }, "+ S\u00E9rie")))),
                    role === "prof" && (React.createElement(React.Fragment, null,
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "4px 0 8px" } }, "Editar exerc\u00EDcio"),
                        React.createElement(Field, { label: "Nome", type: "text", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), onBlur: () => f.name.trim() && commit({ name: f.name.trim() }) }),
                        React.createElement("div", { style: { marginTop: 10 } },
                            React.createElement(CatalogPicker, { label: "Conta no volume como", exerciseName: ex.name, value: ex.catalogId, onChange: (v) => commit({ catalogId: v || undefined }) })),
                        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
                            React.createElement(Field, { label: "Descanso (s)", type: "text", inputMode: "numeric", placeholder: "\u2014", value: f.rest, onChange: (e) => setF({ ...f, rest: e.target.value }), onBlur: () => commit({ rest: num(f.rest) }), flex: "1 1 0" })),
                        React.createElement(TextArea, { label: "Observa\u00E7\u00E3o para o aluno", rows: 2, placeholder: "Ex.: des\u00E7a controlado, 3s na fase exc\u00EAntrica.", value: f.note, onChange: (e) => setF({ ...f, note: e.target.value }), onBlur: () => commit({ note: f.note.trim() || undefined }) }),
                        React.createElement("div", { style: { marginTop: 12 } },
                            React.createElement(Field, { label: "Link do v\u00EDdeo (YouTube, gif...)", type: "text", placeholder: "cole o link", value: f.url, onChange: (e) => setF({ ...f, url: e.target.value }), onBlur: () => commit({ url: f.url.trim() || undefined }) })),
                        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "16px 0 8px" } }, "S\u00E9ries"),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, plan.map((s, i) => (React.createElement("div", { key: s.id, style: { display: "flex", alignItems: "center", gap: 8 } },
                            React.createElement("button", { onClick: () => setRowKind(i, KIND_CYCLE[(KIND_CYCLE.indexOf(s.kind) + 1) % KIND_CYCLE.length]), style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.02em", color: s.kind === "warmup" ? C.ink : s.kind === "recon" ? C.ink : s.kind === "working" ? C.silver : C.warn, background: s.kind === "warmup" ? C.silver : s.kind === "recon" ? C.amber : C.panel2, border: "none", borderRadius: 8, padding: "8px 6px", cursor: "pointer", width: 92, flexShrink: 0, textAlign: "center" } }, KIND_LABELS[s.kind] || s.kind),
                            React.createElement("input", { value: planReps[i] ?? s.reps, onChange: (e) => setPlanReps((pr) => pr.map((v, k) => (k === i ? e.target.value : v))), onBlur: () => commitRowReps(i), placeholder: "reps", style: { flex: 1, fontFamily: F.mono, fontSize: 14, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 8, padding: "9px 11px", outline: "none" } }),
                            React.createElement("button", { onClick: () => removeSetRow(i), style: { color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.mono, fontSize: 16, flexShrink: 0 } }, "\u00D7"))))),
                        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
                            React.createElement("button", { onClick: () => addSetRow("warmup"), style: { fontFamily: F.mono, fontSize: 12, color: C.silver, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: "pointer" } }, "+ Aquecimento"),
                            React.createElement("button", { onClick: () => addSetRow("recon"), style: { fontFamily: F.mono, fontSize: 12, color: C.silver, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: "pointer" } }, "+ Reconhecimento"),
                            React.createElement("button", { onClick: () => addSetRow("working"), style: { fontFamily: F.mono, fontSize: 12, color: C.silver, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: "pointer" } }, "+ S\u00E9rie")),
                        hist.length > 0 && (React.createElement("div", { style: { marginTop: 16 } },
                            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 8 } }, "Registros"),
                            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 170, overflowY: "auto" } }, hist.map((h, i) => {
                                let wc = 0;
                                const line = Array.isArray(h.entries)
                                    ? h.entries.map((e) => `${e.kind === "warmup" ? "Aquec." : e.kind === "recon" ? "Reconhec." : `S${++wc}`} ${e.load}kg${e.reps != null && e.reps !== "" ? `×${e.reps}` : ""}`).join(" · ")
                                    : `${h.load} kg${h.reps != null && h.reps !== "" ? ` · ${h.reps} reps` : ""}`;
                                return (React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 3, fontFamily: F.mono, fontSize: 12, color: C.text, background: C.ink, borderRadius: 8, padding: "7px 10px" } },
                                    React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 8 } },
                                        React.createElement("span", { style: { color: C.muted, minWidth: 40, flexShrink: 0, paddingTop: 1 } }, fmtDate(h.date)),
                                        React.createElement("span", { style: { flex: 1, lineHeight: 1.5 } }, line),
                                        React.createElement("button", { onClick: () => onDeleteRecord(ex.id, h), title: "Apagar", style: { color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: F.mono, fontSize: 15, flexShrink: 0 } }, "\u00D7")),
                                    role === "prof" && h.studentNote && React.createElement("div", { style: { fontFamily: F.body, fontSize: 12.5, color: C.amber, fontStyle: "italic", paddingLeft: 48 } },
                                        "\u201C",
                                        h.studentNote,
                                        "\u201D")));
                            })))),
                        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" } },
                            React.createElement("button", { onClick: () => onMove(ex.id, -1), disabled: isFirst, style: { fontFamily: F.mono, fontSize: 12, color: isFirst ? C.line : C.muted, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: isFirst ? "default" : "pointer" } }, "\u2191 Subir"),
                            React.createElement("button", { onClick: () => onMove(ex.id, 1), disabled: isLast, style: { fontFamily: F.mono, fontSize: 12, color: isLast ? C.line : C.muted, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: isLast ? "default" : "pointer" } }, "\u2193 Descer"),
                            React.createElement("button", { onClick: () => onRemove(ex.id), style: { marginLeft: "auto", fontFamily: F.mono, fontSize: 12, color: C.muted, background: C.panel2, borderRadius: 10, padding: "9px 12px", cursor: "pointer" } }, "Remover")))))))));
}
ExerciseCard = React.memo(ExerciseCard);
export { ExerciseCard };
