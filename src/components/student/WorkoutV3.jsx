import React, { useEffect, useMemo, useRef, useState } from "react";
import { C, F, NON_COUNTING_KINDS, PILL_V3, PROGRESS, KICKER, COL_LABEL } from "../../styles/tokens";
import { haptic, ytId } from "../../utils/misc";
import { daySummary, parseReps, repsCeiling, sortedHistory } from "../../utils/workout";

// Tela de treino do aluno — design v3 (design/v3/README.md · "Treino"; decisões em design/v3/DECISOES.md).
// Lista corrida de exercícios (sem card), um aberto por vez com nota do professor, colunas
// ALVO / ÚLTIMA / DESCANSO e as séries. Registro SÓ na barra de baixo: −/+ de carga e reps e "Feito";
// ao marcar "Feito" a barra vira o cronômetro de descanso. Primeiro arquivo do projeto em JSX de verdade.

const WEEKDAYS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
const QUICK_REPLIES = ["Senti dor", "Carga leve demais", "Carga pesada demais", "Máquina ocupada"];
const REST_KEY = "cancio:v3rest";
const NON_WORKING_REST = 60; // aquecimento e reconhecimento: 1:00 (DECISOES.md · padrões adotados)

const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const r25 = (v) => Math.round(v / 2.5) * 2.5;
const mmss = (sec) => { const s = Math.max(0, Math.ceil(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const isWorking = (kind) => !NON_COUNTING_KINDS.has(kind);
const pillStyle = (kind, done) => (done ? (kind === "warmup" ? PILL_V3.warmup : kind === "recon" ? PILL_V3.recon : PILL_V3.working) : PILL_V3.off);

// plano de séries estável: exercício antigo sem setPlan ganha ids fixos ("s0", "s1"...) pra casar com o histórico
function planOf(ex) {
    if (Array.isArray(ex.setPlan) && ex.setPlan.length) return ex.setPlan;
    const n = Math.max(1, parseInt(ex.sets) || 1);
    return Array.from({ length: n }, (_, i) => ({ id: "s" + i, kind: "working", reps: ex.reps || "10" }));
}

// tudo que a tela precisa de um exercício, já derivado do histórico
function describe(ex, dayDate) {
    const plan = planOf(ex);
    const hist = sortedHistory(ex.history || []);
    const today = hist.find((h) => h.date === dayDate && Array.isArray(h.entries));
    const logged = new Map((today ? today.entries : []).filter((e) => typeof e.load === "number").map((e) => [e.setId, e]));
    const skippedIds = new Set((today && Array.isArray(today.skipped)) ? today.skipped : []);
    const before = hist.filter((h) => h.date < dayDate);
    const lastH = before[before.length - 1] || null;
    const lastEntries = [...before].reverse().find((h) => Array.isArray(h.entries) && h.entries.length);
    const lastBySet = new Map(((lastEntries && lastEntries.entries) || []).map((e) => [e.setId, e]));
    const lastSum = lastH ? daySummary(lastH) : null;
    const baseLoad = lastSum && lastSum.load ? lastSum.load : 0;
    let workN = 0;
    const sets = plan.map((p, i) => {
        const working = isWorking(p.kind);
        if (working) workN += 1;
        const prev = lastBySet.get(p.id) || (lastEntries && lastEntries.entries[i]);
        const ceil = repsCeiling(p.reps);
        const suggest = prev && typeof prev.load === "number"
            ? { load: prev.load, reps: parseReps(prev.reps) || ceil || 10 }
            : { load: p.kind === "warmup" ? r25(baseLoad * 0.5) : p.kind === "recon" ? r25(baseLoad * 0.85) : baseLoad, reps: ceil || (p.kind === "warmup" ? 12 : p.kind === "recon" ? 5 : 10) };
        const log = logged.get(p.id);
        return {
            id: p.id, kind: p.kind, target: p.reps, working, suggest, log, done: !!log, skip: !log && skippedIds.has(p.id),
            n: p.kind === "warmup" ? "AQ" : p.kind === "recon" ? "RC" : String(workN),
            label: p.kind === "warmup" ? "AQUECIMENTO" : p.kind === "recon" ? "RECONHECIMENTO" : "SÉRIE " + workN,
        };
    });
    const targets = [...new Set(sets.filter((s) => s.working).map((s) => String(s.target || "").replace("-", "–")).filter(Boolean))];
    const firstWork = sets.find((s) => s.working);
    return {
        ex, sets,
        workCount: sets.filter((s) => s.working).length,
        alvo: targets.length ? targets.join(" · ") + " reps" : "—",
        ultima: lastSum && lastSum.load ? br(lastSum.load) + " × " + (lastSum.reps != null ? lastSum.reps : "—") : "—",
        rest: ex.rest || 90,
        planLoad: firstWork ? firstWork.suggest.load : 0,
        planReps: targets[0] || "",
        allDone: sets.every((s) => s.done || s.skip) && sets.some((s) => s.done),
        evo: evolutionOf(hist, dayDate),
    };
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
// evolução (v4 · 45c): carga da série válida ao longo das sessões anteriores
function evolutionOf(hist, dayDate) {
    const pts = hist.filter((h) => h.date < dayDate).map((h) => ({ date: h.date, v: daySummary(h).load })).filter((x) => typeof x.v === "number" && x.v > 0);
    if (pts.length < 2) return null;
    const d = Math.round((pts[pts.length - 1].v - pts[0].v) * 10) / 10;
    const month = MONTHS[Number(pts[0].date.slice(5, 7)) - 1];
    return { pts: pts.slice(-8).map((x) => x.v), num: d === 0 ? "Mesma carga" : (d > 0 ? "+" : "−") + br(Math.abs(d)) + " kg", text: "desde " + month + ", em " + pts.length + " treinos" };
}
function Spark({ pts }) {
    const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
    const xy = pts.map((v, i) => ((i / (pts.length - 1)) * 54 + 1).toFixed(1) + "," + (17 - ((v - min) / span) * 14).toFixed(1)).join(" ");
    return <svg width="56" height="20" viewBox="0 0 56 20" aria-hidden="true" style={{ flex: "none" }}><polyline points={xy} fill="none" stroke={C.text2} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
// vídeo (v4 · 45c): prévia dentro do exercício, em loop e sem som quando o link permite (YouTube, mp4, gif)
function VideoPreview({ url }) {
    const yt = ytId(url);
    const box = { position: "relative", borderRadius: 14, overflow: "hidden", background: C.panel };
    if (yt) return <div style={{ ...box, paddingBottom: "56.25%", height: 0 }}><iframe title="Execução do exercício" src={"https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&mute=1&loop=1&playlist=" + yt + "&controls=0&playsinline=1&rel=0&modestbranding=1"} allow="autoplay; encrypted-media; picture-in-picture" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} /></div>;
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return <div style={box}><video src={url} autoPlay muted loop playsInline style={{ display: "block", width: "100%" }} /></div>;
    if (/\.(gif|png|jpe?g|webp)(\?|$)/i.test(url)) return <div style={box}><img src={url} alt="Execução do exercício" style={{ display: "block", width: "100%" }} /></div>;
    return <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.text2 }}>Abrir o vídeo fora do app ↗</a>;
}

function IconCheck({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true" style={{ display: "block" }}><path d="M40 144l56 56L216 80" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
// notas de técnica que o professor marcou no Modo aula (design v3 · AulaV3): a mais recente até hoje
function lastTech(ex, dayDate) {
    const h = (ex.history || []).filter((x) => x.date <= dayDate && Array.isArray(x.techNotes) && x.techNotes.length).sort((x, y) => (x.date < y.date ? 1 : -1))[0];
    if (!h) return null;
    const when = h.date === dayDate ? "Hoje na aula" : "Na aula de " + new Date(h.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(/\./g, "");
    return { when, notes: h.techNotes };
}

function IconCloudOff() {
    return <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true" style={{ flex: "none", color: C.accent }}><path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M48 40l160 176M96 72a72 72 0 0 1 104 46M188 200H76a52 52 0 0 1-8-103.4" /></svg>;
}
// marca de cada série feita: ✓ salvo · girando enquanto envia · nuvem cortada (só no aparelho)
function SaveMark({ state }) {
    if (state === "saving") return (
        <span role="img" aria-label="salvando" style={{ display: "inline-flex", color: C.text3 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke={C.raised} strokeWidth="2.5" /><path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" /></path></svg>
        </span>
    );
    if (state === "pending") return <span role="img" aria-label="salvo só no aparelho, sobe quando a internet voltar" style={{ display: "inline-flex" }}><IconCloudOff /></span>;
    return <span role="img" aria-label="salvo" style={{ color: C.text2 }}><IconCheck /></span>;
}

function IconPin() {
    return <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}><path fill="currentColor" d="M235.33 104l-53.47 53.65c4.56 18.57 1.61 39.73-12.23 58.63a8 8 0 0 1-12 .87L101.72 161.25l-45.06 45.07a8 8 0 0 1-11.32-11.32l45.07-45.06L35.06 94.53a8 8 0 0 1 .87-12c19.07-13.94 40.13-16.81 58.6-12.27L148 16.69a16 16 0 0 1 22.63 0L235.31 81.4a16 16 0 0 1 0 22.6Z" /></svg>;
}
function IconChat() {
    return <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="16" strokeLinejoin="round" d="M79.93 211.11a96 96 0 1 0-35-35L32.42 213.46a8 8 0 0 0 10.12 10.12Z" /></svg>;
}

const kicker = KICKER;
const colLabel = COL_LABEL;
const num = { fontVariantNumeric: "tabular-nums" };
const btnMain = { height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" };
const btnSecondary = { height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" };
const btnText = { background: "none", border: "none", padding: 0, minHeight: 44, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };

function Stepper({ value, unit, onMinus, onPlus, onType, label }) {
    const [typing, setTyping] = useState(false);
    const [txt, setTxt] = useState("");
    const commit = () => { const v = parseFloat(String(txt).replace(",", ".")); if (!isNaN(v)) onType(v); setTyping(false); };
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, borderRadius: 10, background: C.raised }}>
            <button type="button" aria-label={"Diminuir " + label} onClick={() => { haptic("tick"); onMinus(); }} style={{ width: 48, height: 56, border: "none", background: "none", fontSize: 22, color: C.text3, cursor: "pointer" }}>−</button>
            {typing ? (
                <input autoFocus inputMode="decimal" value={txt} onChange={(e) => setTxt(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
                    aria-label={label} style={{ width: 70, textAlign: "center", fontFamily: F.display, fontSize: 24, fontWeight: 900, color: C.text, background: C.bg, border: "none", borderRadius: 8, padding: "6px 0", outline: `1px solid ${C.outline}` }} />
            ) : (
                <button type="button" onClick={() => { setTxt(String(value).replace(".", ",")); setTyping(true); }} aria-label={"Digitar " + label}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", color: C.text, cursor: "pointer", padding: "4px 8px" }}>
                    <span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, fontStretch: "110%", lineHeight: 1, ...num }}>{br(value)}</span>
                    <span style={{ fontSize: 11, color: C.text3 }}>{unit}</span>
                </button>
            )}
            <button type="button" aria-label={"Aumentar " + label} onClick={() => { haptic("tick"); onPlus(); }} style={{ width: 48, height: 56, border: "none", background: "none", fontSize: 22, color: C.text3, cursor: "pointer" }}>+</button>
        </div>
    );
}

function WorkoutV3({ list, dayDate, title, workoutStart, save, dayDone, canFinalize, onFinalize, onAddLoad, onSkipSet, onMessage, restrictionOf, bottomOffset = 0, onPickDay }) {
    const [vidId, setVidId] = useState(null); // exercício com a prévia de execução aberta
    const [moreId, setMoreId] = useState(null); // ⋯ aberto: ações secundárias do exercício
    // correção 18/nov: a barra de registro cobria os últimos exercícios (o espaço no fim da lista era de
    // 40 px). Agora o espaço acompanha a altura real da barra, e ao rolar pra baixo ela encolhe numa linha
    // (série + Feito); volta inteira ao rolar pra cima ou ao tocar nela.
    const barRef = useRef(null);
    const [barH, setBarH] = useState(240);
    const [compact, setCompact] = useState(false);
    useEffect(() => {
        const el = barRef.current; if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => setBarH(el.getBoundingClientRect().height)); ro.observe(el);
        return () => ro.disconnect();
    }, []);
    useEffect(() => {
        let last = window.scrollY;
        // correção 20/nov: ao tocar na carga pra digitar, o teclado sobe e o celular rola a tela sozinho —
        // isso encolhia a barra e o campo sumia no meio da edição. Enquanto houver um campo da barra em
        // foco (ou o teclado estiver mexendo na tela), a rolagem não encolhe a barra.
        const editing = () => { const a = document.activeElement; return !!(a && barRef.current && barRef.current.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)); };
        const onScroll = () => { const y = window.scrollY; if (editing()) { last = y; return; } if (y > last + 30) { setCompact(true); last = y; } else if (y < last - 30) { setCompact(false); last = y; } };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    // salvamento (design v4 · 35b): a série é sempre gravada no aparelho; ✓ quando já chegou na nuvem,
    // girando enquanto envia, nuvem cortada em laranja quando ficou só no aparelho
    // (o envio sai com um pequeno atraso depois do toque: nos primeiros 4 s com rede conta como "salvando")
    const [, setTick] = useState(0);
    const saveStateOf = (s) => { const at = s.log && s.log.at; if (!save || typeof at !== "number" || at <= save.syncedAt) return "saved"; if (save.online && (save.syncing || Date.now() - at < 4000)) return "saving"; return "pending"; };
    const rows = useMemo(() => list.map((ex) => describe(ex, dayDate)), [list, dayDate]);
    const lastAt = rows.reduce((m, r) => Math.max(m, ...r.sets.map((x) => (x.log && typeof x.log.at === "number" ? x.log.at : 0))), 0);
    useEffect(() => { const wait = lastAt + 4100 - Date.now(); if (wait <= 0) return; const t = setTimeout(() => setTick((n) => n + 1), wait); return () => clearTimeout(t); }, [lastAt]);
    const pendingN = save ? rows.reduce((n, r) => n + r.sets.filter((x) => x.done && saveStateOf(x) === "pending").length, 0) : 0;
    const [openId, setOpenId] = useState(() => { const r = rows.find((x) => !x.allDone); return r ? r.ex.id : null; });
    const [skipped, setSkipped] = useState(() => new Set());
    const [override, setOverride] = useState(null); // { exId, setId } — tocar numa série já feita pra corrigir
    const [draft, setDraft] = useState(null);
    const [rest, setRest] = useState(() => { try { const r = JSON.parse(sessionStorage.getItem(REST_KEY) || "null"); return r && r.end > Date.now() ? r : null; } catch (e) { return null; } });
    const [now, setNow] = useState(Date.now());
    const [collapsed, setCollapsed] = useState(false);
    const [sheet, setSheet] = useState(null); // { context } — recado sobre a série
    const [sheetText, setSheetText] = useState("");
    const topRef = useRef(null);

    // série da vez: a corrigida (override) > a 1ª pendente do exercício aberto > a 1ª pendente da lista
    const cur = useMemo(() => {
        if (override) {
            const r = rows.find((x) => x.ex.id === override.exId);
            const s = r && r.sets.find((y) => y.id === override.setId);
            if (s) return { r, s, fixing: true };
        }
        const pending = (r) => (skipped.has(r.ex.id) ? null : r.sets.find((s) => !s.done && !s.skip));
        const open = rows.find((x) => x.ex.id === openId);
        if (open && pending(open)) return { r: open, s: pending(open) };
        for (const r of rows) { const s = pending(r); if (s) return { r, s }; }
        return null;
    }, [rows, openId, skipped, override]);

    // rascunho da barra nasce da sugestão (sessão passada) ou do valor já registrado, quando corrigindo
    const curKey = cur ? cur.r.ex.id + "|" + cur.s.id + (cur.fixing ? "|fix" : "") : "";
    useEffect(() => {
        if (!cur) { setDraft(null); return; }
        const base = cur.s.log ? { load: cur.s.log.load, reps: parseReps(cur.s.log.reps) || cur.s.suggest.reps } : cur.s.suggest;
        setDraft({ load: base.load, reps: base.reps });
    }, [curKey]);

    // relógio: descanso e tempo de treino
    useEffect(() => {
        if (!rest && !(workoutStart && workoutStart.date === dayDate)) return;
        const id = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(id);
    }, [rest, workoutStart, dayDate]);
    useEffect(() => {
        if (rest && now >= rest.end) { setRest(null); haptic("confirm"); }
    }, [now, rest]);
    useEffect(() => { try { if (rest) sessionStorage.setItem(REST_KEY, JSON.stringify(rest)); else sessionStorage.removeItem(REST_KEY); } catch (e) { } }, [rest]);

    // topo encolhe ao rolar (21c): nome + barra de progresso prata
    useEffect(() => {
        const onScroll = () => { const el = topRef.current; if (!el) return; const v = el.getBoundingClientRect().bottom < 0; setCollapsed((c) => (c === v ? c : v)); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const allSets = rows.reduce((n, r) => n + r.sets.length, 0);
    const doneSets = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);
    const resolvedSets = rows.reduce((n, r) => n + r.sets.filter((s) => s.done || s.skip).length, 0);
    const pct = allSets ? Math.round((resolvedSets / allSets) * 100) : 0;
    const startedAt = workoutStart && workoutStart.date === dayDate ? workoutStart.startedAt : null;
    const clock = startedAt ? mmss((now - startedAt) / 1000) : "0:00";
    const weekday = WEEKDAYS[new Date(dayDate + "T00:00:00").getDay()];

    const step = (v) => (v < 10 ? 1 : 2.5);
    const setLoad = (v) => setDraft((d) => ({ ...d, load: Math.max(0, Math.round(v * 10) / 10) }));
    const setReps = (v) => setDraft((d) => ({ ...d, reps: Math.max(1, Math.round(v)) }));

    const registerSet = () => {
        if (!cur || !draft) return;
        const { r, s, fixing } = cur;
        onAddLoad(r.ex.id, { date: dayDate, setId: s.id, kind: s.kind, targetReps: s.target, load: draft.load, reps: draft.reps, checkPR: true });
        haptic("confirm");
        setOverride(null);
        setVidId(null); // o vídeo recolhe sozinho ao registrar a série (45c)
        if (fixing) return; // correção não reinicia descanso
        const left = rows.reduce((n, x) => n + (skipped.has(x.ex.id) ? 0 : x.sets.filter((y) => !y.done && !y.skip && !(x.ex.id === r.ex.id && y.id === s.id)).length), 0);
        if (left > 0) { const total = s.working ? r.rest : NON_WORKING_REST; setRest({ end: Date.now() + total * 1000, total }); }
        const moreHere = r.sets.some((y) => !y.done && !y.skip && y.id !== s.id);
        if (!moreHere) { const next = rows.find((x) => x.ex.id !== r.ex.id && !skipped.has(x.ex.id) && x.sets.some((y) => !y.done && !y.skip)); setOpenId(next ? next.ex.id : null); }
    };
    // pular a série da vez (36b): não conta no volume e não trava o fim do exercício; sem descanso
    const skipSet = () => {
        if (!cur || cur.fixing || !onSkipSet) return;
        const { r, s } = cur;
        onSkipSet(r.ex.id, s.id, dayDate);
        haptic("tick"); setVidId(null);
        const moreHere = r.sets.some((y) => !y.done && !y.skip && y.id !== s.id);
        if (!moreHere) { const next = rows.find((x) => x.ex.id !== r.ex.id && !skipped.has(x.ex.id) && x.sets.some((y) => !y.done && !y.skip)); setOpenId(next ? next.ex.id : null); }
    };

    const nextLabel = (() => {
        if (!cur) return "";
        return "DEPOIS: " + (cur.r.ex.id !== openId ? cur.r.ex.name.toUpperCase() + " · " : "") + cur.s.label + " · " + br(cur.s.suggest.load) + " × " + cur.s.suggest.reps;
    })();

    const sendSheet = (text) => {
        const t = String(text || "").trim();
        if (!t) return;
        onMessage(sheet.context + " — " + t);
        setSheet(null); setSheetText("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div ref={topRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ ...kicker }}>{weekday} · {doneSets} DE {allSets} SÉRIES</span>
                <span style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span style={{ fontSize: 13, color: C.text3, ...num }}>{clock}</span>
                    {canFinalize && <button type="button" onClick={onFinalize} style={{ ...btnText, minHeight: 44, fontWeight: 700, color: C.text2 }}>{dayDone ? "Compartilhar" : "Finalizar"}</button>}
                </span>
            </div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                <span style={{ fontFamily: F.display, fontSize: String(title).length > 14 ? 26 : 34, fontWeight: 900, fontStretch: "125%", lineHeight: 1, overflowWrap: "anywhere" }}>{title}</span>
                {onPickDay && <button type="button" onClick={onPickDay} style={{ ...btnText, flex: "none", color: C.text3 }}>Trocar ›</button>}
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
                {rows.map((r, ei) => {
                    const isOpen = r.ex.id === openId;
                    const isSkipped = skipped.has(r.ex.id);
                    const restr = restrictionOf(r.ex.name);
                    const curSetId = cur && cur.r.ex.id === r.ex.id ? cur.s.id : null;
                    return (
                        <div key={r.ex.id} style={{ background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` }}>
                            <button type="button" onClick={() => { setOpenId(isOpen ? null : r.ex.id); setOverride(null); }} aria-expanded={isOpen}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: isOpen ? "16px 0 12px" : "12px 0", minHeight: 48, background: "none", border: "none", color: "inherit", textAlign: "left", cursor: "pointer" }}>
                                <span style={{ width: 22, flex: "none", fontSize: 13, fontWeight: 700, color: r.allDone ? C.text2 : isOpen ? C.text : C.text4, ...num }}>
                                    {r.allDone ? <IconCheck /> : isSkipped ? "–" : String(ei + 1).padStart(2, "0")}
                                </span>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                                    <span style={{ fontFamily: F.display, fontSize: isOpen ? 20 : 16, fontWeight: isOpen ? 800 : 700, fontStretch: "110%", lineHeight: 1.15, color: r.allDone || isSkipped ? C.text4 : C.text }}>{r.ex.name}</span>
                                    {!isOpen && (
                                        <span style={{ fontSize: 15, fontWeight: 600, fontStretch: "75%", color: C.text3, ...num }}>
                                            {isSkipped ? "Pulado" : r.workCount + "×" + (r.planReps || "—") + (r.planLoad ? " · " + br(r.planLoad) + " kg" : "")}
                                            {restr && <span style={{ marginLeft: 8, color: C.accent, fontSize: 13, fontWeight: 700, fontStretch: "100%" }}>● {restr.region}</span>}
                                        </span>
                                    )}
                                </span>
                                {isOpen
                                    ? <span style={{ fontSize: 13, color: C.text2, ...num }}>{r.sets.filter((s) => s.done).length}/{r.sets.length}</span>
                                    : <span style={{ display: "flex", gap: 3, flex: "none" }}>{r.sets.map((s) => <span key={s.id} style={{ width: 12, height: 12, borderRadius: 3, ...pillStyle(s.kind, s.done) }} />)}</span>}
                            </button>
                            {isOpen && (
                                <div style={{ padding: "0 0 18px 36px", display: "flex", flexDirection: "column", gap: 14 }}>
                                    {r.ex.note && <div style={{ padding: "10px 12px", borderRadius: 10, background: C.panel, display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4, color: C.text2 }}><IconPin /><span>Prof.: {r.ex.note}</span></div>}
                                    {(() => { const t = lastTech(r.ex, dayDate); return t && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <span style={colLabel}>{t.when.toUpperCase() + " · TÉCNICA"}</span>
                                            <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{t.notes.map((n) => <span key={n} style={{ padding: "5px 10px", borderRadius: 999, boxShadow: "inset 0 0 0 1px " + (n === "Ótima execução" ? C.outline : C.accentLine), color: n === "Ótima execução" ? C.text2 : C.text, fontSize: 13 }}>{n}</span>)}</span>
                                        </div>
                                    ); })()}
                                    {restr && <div style={{ fontSize: 13, color: C.accent }}>● {restr.text}</div>}
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                                        {[["ALVO", r.alvo], ["ÚLTIMA", r.ultima], ["DESCANSO", mmss(r.rest)]].map(([l, v]) => (
                                            <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={colLabel}>{l}</span><span style={{ fontSize: 15, fontWeight: 700, ...num }}>{v}</span></div>
                                        ))}
                                    </div>
                                    {r.evo && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Spark pts={r.evo.pts} /><span style={{ fontSize: 13, color: C.text2 }}><b style={{ color: C.text }}>{r.evo.num}</b> {r.evo.text}</span></div>}
                                    {r.ex.url && (
                                        <button type="button" onClick={() => setVidId(vidId === r.ex.id ? null : r.ex.id)} aria-expanded={vidId === r.ex.id}
                                            style={{ height: 48, borderRadius: 12, border: "none", background: C.panel, color: C.text, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                                            <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16" />{vidId === r.ex.id ? <path d="M96 96l64 64M160 96l-64 64" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" /> : <path d="M112 92l56 36-56 36z" fill="currentColor" />}</svg>
                                            {vidId === r.ex.id ? "Fechar execução" : "Ver execução"}
                                        </button>
                                    )}
                                    {r.ex.url && vidId === r.ex.id && <VideoPreview url={r.ex.url} />}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {r.sets.map((s) => {
                                            const isCur = s.id === curSetId;
                                            const v = s.log ? { load: s.log.load, reps: s.log.reps } : s.suggest;
                                            return (
                                                <button key={s.id} type="button" disabled={!s.done && !isCur}
                                                    onClick={() => { if (s.done) setOverride({ exId: r.ex.id, setId: s.id }); }}
                                                    aria-label={s.done ? "Corrigir " + s.label.toLowerCase() : undefined}
                                                    style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: 0, background: "none", border: "none", textAlign: "left", cursor: s.done ? "pointer" : "default", fontFamily: F.body, fontSize: 15, color: isCur ? C.text : s.done ? C.text3 : C.text4 }}>
                                                    <span style={{ width: 22, fontSize: s.working ? 15 : 11, fontWeight: 800, letterSpacing: "0.04em" }}>{s.n}</span>
                                                    <span style={{ flex: 1, fontWeight: isCur ? 700 : 400, textDecoration: s.skip ? "line-through" : "none", color: s.skip ? C.text3 : s.done || isCur ? undefined : C.text4, ...num }}>{s.done || s.skip || isCur ? br(v.load) + " kg × " + v.reps : (s.target ? "alvo " + String(s.target).replace("-", "–") + " reps" : "—")}</span>
                                                    {s.skip && <span style={{ fontSize: 13, color: C.text3 }}>pulada</span>}
                                                    {s.skip && <span aria-hidden="true" style={{ width: 12, height: 2, borderRadius: 1, background: C.text3 }} />}
                                                    {isCur && !rest && <span style={{ ...colLabel, color: C.text2 }}>{cur.fixing ? "CORRIGINDO" : "AGORA ↓"}</span>}
                                                    {s.done && !isCur && <SaveMark state={saveStateOf(s)} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button type="button" onClick={() => setMoreId(moreId === r.ex.id ? null : r.ex.id)} aria-expanded={moreId === r.ex.id} aria-label="Mais ações deste exercício" style={{ ...btnText, alignSelf: "flex-start", color: C.text3, fontSize: 20, letterSpacing: "0.1em" }}>⋯</button>
                                    {moreId === r.ex.id && <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                        <button type="button" style={{ ...btnText, color: C.text3 }} onClick={() => { setMoreId(null);
                                            const s = (cur && cur.r.ex.id === r.ex.id ? cur.s : null) || [...r.sets].reverse().find((y) => y.done) || r.sets[0];
                                            const v = s.log ? s.log : s.suggest;
                                            setSheet({ context: r.ex.name + " · " + s.label.charAt(0) + s.label.slice(1).toLowerCase() + " · " + br(v.load) + " kg × " + v.reps });
                                        }}><IconChat />Recado sobre esta série</button>
                                        {!r.allDone && !isSkipped && <button type="button" style={{ ...btnText, color: C.text4 }} onClick={() => { setSkipped((p) => new Set(p).add(r.ex.id)); setOpenId(null); setRest(null); }}>Pular exercício</button>}
                                        {isSkipped && <button type="button" style={{ ...btnText, color: C.text4 }} onClick={() => setSkipped((p) => { const n = new Set(p); n.delete(r.ex.id); return n; })}>Voltar a fazer</button>}
                                    </div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ height: barH + 24 }} aria-hidden="true" />

            {collapsed && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: C.bg, boxShadow: `inset 0 -1px 0 ${C.line}`, paddingTop: "calc(12px + env(safe-area-inset-top, 0px))", paddingBottom: 12, paddingLeft: "max(20px, env(safe-area-inset-left, 0px))", paddingRight: "max(20px, env(safe-area-inset-right, 0px))" }}>
                    <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 900, fontStretch: "125%" }}>{title}</span>
                            <span style={{ fontSize: 13, color: C.text3, ...num }}>{doneSets}/{allSets}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: C.raised, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", backgroundImage: PROGRESS, transition: "width .3s" }} /></div>
                    </div>
                </div>
            )}

            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                {/* bottomOffset: com as abas à mostra, a barra ganha esse espaço embaixo pra elas caberem por cima (DECISOES.md · 4) */}
                <div ref={barRef} style={{ pointerEvents: "auto", width: "100%", maxWidth: 660, background: C.panel, borderRadius: "24px 24px 0 0", padding: `14px 12px calc(${14 + bottomOffset}px + env(safe-area-inset-bottom, 0px))`, transition: "padding .25s ease", display: "flex", flexDirection: "column", gap: 10, boxShadow: `inset 0 1px 0 ${C.line}` }}>
                    {pendingN > 0 && <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px", fontSize: 13, color: C.text3 }}><IconCloudOff /><span>{(save && save.online ? "Ainda não chegou na nuvem. " : "Sem internet. ") + pendingN + (pendingN === 1 ? " série salva quando voltar." : " séries salvam quando voltar.")}</span></div>}
                    {compact && (rest || (cur && draft)) ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => setCompact(false)} aria-label="Abrir a barra de registro" style={{ flex: 1, minWidth: 0, minHeight: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 4px", border: "none", background: "none", color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                                <span aria-hidden="true" style={{ color: C.text3, fontSize: 18 }}>⌃</span>
                                {rest
                                    ? <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ ...colLabel, color: C.text2 }}>DESCANSO</span><span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, ...num }}>{mmss((rest.end - now) / 1000)}</span></span>
                                    : <span style={{ minWidth: 0, display: "flex", flexDirection: "column" }}><span style={{ ...colLabel, color: C.text2, overflow: "hidden", textOverflow: "ellipsis" }}>{cur.r.ex.name.toUpperCase() + " · " + cur.s.label}</span><span style={{ fontSize: 15, fontWeight: 700, ...num }}>{br(draft.load) + " kg × " + draft.reps}</span></span>}
                            </button>
                            {rest
                                ? <button type="button" style={{ ...btnSecondary, width: "auto", flex: "none", padding: "0 16px" }} onClick={() => setRest(null)}>Pular</button>
                                : <button type="button" style={{ ...btnMain, width: "auto", flex: "none", padding: "0 22px" }} onClick={registerSet}>{cur.fixing ? "Salvar" : "Feito"}</button>}
                        </div>
                    ) : rest ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "0 4px" }}>
                                <span style={{ ...colLabel, color: C.text2 }}>DESCANSO</span>
                                <span style={{ ...colLabel, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nextLabel}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 4px" }}>
                                <span style={{ fontFamily: F.display, fontSize: 56, fontWeight: 900, fontStretch: "125%", lineHeight: 1, ...num }}>{mmss((rest.end - now) / 1000)}</span>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.raised, overflow: "hidden" }}><div style={{ width: Math.max(0, Math.min(100, ((rest.end - now) / (rest.total * 1000)) * 100)) + "%", height: "100%", backgroundImage: PROGRESS }} /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                                <button type="button" style={btnSecondary} onClick={() => setRest((x) => x && { end: x.end + 15000, total: x.total + 15 })}>+15s</button>
                                <button type="button" style={btnMain} onClick={() => setRest(null)}>Pular descanso</button>
                            </div>
                        </>
                    ) : cur && draft ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "0 4px" }}>
                                <span style={{ ...colLabel, color: C.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(cur.fixing ? "CORRIGIR · " : "") + cur.r.ex.name.toUpperCase() + " · " + cur.s.label}</span>
                                <span style={{ ...colLabel, flex: "none" }}>{cur.r.sets.indexOf(cur.s) + 1} DE {cur.r.sets.length}</span>
                                {!cur.fixing && onSkipSet && <button type="button" onClick={skipSet} style={{ ...colLabel, flex: "none", margin: "-12px -4px -12px 0", minHeight: 44, padding: "0 4px 0 10px", border: "none", background: "none", display: "flex", alignItems: "center", gap: 5, color: C.text, cursor: "pointer" }}><svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true"><path d="M56 56l112 72-112 72zM200 56v144" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" /></svg>PULAR</button>}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
                                <Stepper label="carga" value={draft.load} unit="kg" onMinus={() => setLoad(draft.load - step(draft.load))} onPlus={() => setLoad(draft.load + step(draft.load))} onType={setLoad} />
                                <Stepper label="repetições" value={draft.reps} unit="reps" onMinus={() => setReps(draft.reps - 1)} onPlus={() => setReps(draft.reps + 1)} onType={setReps} />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {cur.fixing && <button type="button" style={{ ...btnSecondary, flex: 1 }} onClick={() => setOverride(null)}>Cancelar</button>}
                                <button type="button" style={{ ...btnMain, flex: 2 }} onClick={registerSet}>{cur.fixing ? "Salvar correção" : "Feito"}</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
                                <span style={{ ...colLabel, color: C.text2 }}>{dayDone ? "TREINO DE HOJE FEITO" : skipped.size ? "PRONTO PRA FINALIZAR · " + skipped.size + (skipped.size === 1 ? " PULADO" : " PULADOS") : "TODAS AS SÉRIES FEITAS"}</span>
                                <span style={colLabel}>{doneSets}/{allSets}</span>
                            </div>
                            <button type="button" style={{ ...btnMain, opacity: canFinalize ? 1 : 0.5 }} disabled={!canFinalize} onClick={onFinalize}>{dayDone ? "Ver e compartilhar" : "Finalizar treino"}</button>
                        </>
                    )}
                </div>
            </div>

            {sheet && (
                <div onClick={() => setSheet(null)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(5,6,10,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Recado sobre esta série"
                        style={{ width: "100%", maxWidth: 660, background: C.panel, borderRadius: "24px 24px 0 0", padding: "18px 16px calc(26px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                            <span style={{ ...kicker, color: C.text2 }}>Recado pro professor</span>
                            <button type="button" onClick={() => setSheet(null)} style={{ ...btnText, fontSize: 15, color: C.text4 }}>Fechar</button>
                        </div>
                        <div style={{ fontSize: 13, color: C.text3, ...num }}>{sheet.context}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {QUICK_REPLIES.map((q) => (
                                <button key={q} type="button" onClick={() => sendSheet(q)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${q === "Senti dor" ? C.accentLine : C.outline}`, color: q === "Senti dor" ? C.accent : C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>{q}</button>
                            ))}
                        </div>
                        <textarea value={sheetText} onChange={(e) => setSheetText(e.target.value)} placeholder="Ou escreva um recado…" rows={2}
                            style={{ width: "100%", boxSizing: "border-box", resize: "none", borderRadius: 10, border: "none", boxShadow: `inset 0 0 0 1px ${C.border}`, background: C.bg, color: C.text, fontFamily: F.body, fontSize: 15, padding: "10px 12px" }} />
                        <button type="button" style={{ ...btnMain, opacity: sheetText.trim() ? 1 : 0.5 }} disabled={!sheetText.trim()} onClick={() => sendSheet(sheetText)}>Enviar recado</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export { WorkoutV3, describe, VideoPreview, lastTech, SaveMark, IconCheck, IconPin, IconChat, IconCloudOff, QUICK_REPLIES, REST_KEY, NON_WORKING_REST };
