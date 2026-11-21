import React, { useEffect, useMemo, useRef, useState } from "react";
import { C, F, PILL_V3, PROGRESS, KICKER, COL_LABEL, SILVER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { parseReps } from "../../utils/workout";
import { describe, VideoPreview, lastTech, SaveMark, IconCheck, IconPin, IconChat, IconCloudOff, QUICK_REPLIES, REST_KEY, NON_WORKING_REST } from "./WorkoutV3";

// Treino com registro na própria série (20/nov, feedback de aluna: "ficou confuso"). Antes a série
// era LIDA na lista e REGISTRADA na barra de baixo, que mudava de forma (cheia, uma linha, descanso,
// "corrigindo"). Agora cada série é uma linha com KG e REPS já preenchidos com a sugestão e um ✓:
// tocou, registrou. Corrigir é só mudar o número de uma série feita. A barra de baixo aparece só pro
// descanso e pro "Finalizar". Sem coluna de "última" (o professor achou confuso): a sugestão já está
// no campo. Mesmas props e mesmos dados gravados que o WorkoutV3.

const WEEKDAYS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const mmss = (sec) => { const s = Math.max(0, Math.ceil(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const num = { fontVariantNumeric: "tabular-nums" };
const pillStyle = (kind, done) => (done ? (kind === "warmup" ? PILL_V3.warmup : kind === "recon" ? PILL_V3.recon : PILL_V3.working) : PILL_V3.off);
const btnMain = { height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" };
const btnSecondary = { height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" };
const btnText = { background: "none", border: "none", padding: 0, minHeight: 44, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const chipBtn = { minHeight: 40, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const toNum = (t) => { const v = parseFloat(String(t).replace(",", ".")); return isNaN(v) ? null : v; };
const GRID = "34px minmax(0,1fr) minmax(0,1fr) 52px";

// campo de número da série: mostra o valor como texto e, ao tocar, seleciona tudo pra digitar por cima
function NumBox({ value, onCommit, decimal, label, active, done, onEnter, inputRef }) {
    const [txt, setTxt] = useState(value == null ? "" : br(value));
    const [focus, setFocus] = useState(false);
    useEffect(() => { if (!focus) setTxt(value == null ? "" : br(value)); }, [value, focus]);
    const commit = () => { setFocus(false); const v = toNum(txt); if (v == null || v < 0) { setTxt(value == null ? "" : br(value)); return; } if (v !== value) onCommit(decimal ? Math.round(v * 10) / 10 : Math.max(1, Math.round(v))); };
    return (
        <input ref={inputRef} value={txt} inputMode={decimal ? "decimal" : "numeric"} enterKeyHint={onEnter ? "next" : "done"} aria-label={label}
            onFocus={(e) => { setFocus(true); const el = e.target; setTimeout(() => { try { el.select(); } catch (err) { } }, 0); }}
            onChange={(e) => setTxt(e.target.value.replace(/[^\d.,]/g, "").slice(0, 6))}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); if (onEnter) onEnter(); else e.target.blur(); } }}
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box", height: 48, textAlign: "center", border: "none", outline: "none", borderRadius: 12, fontFamily: F.display, fontSize: 20, fontWeight: 800, fontStretch: "110%", ...num,
                background: focus ? C.bg : active ? C.raised : "transparent", color: done || active || focus ? C.text : C.text4,
                boxShadow: focus ? `inset 0 0 0 1.5px ${C.text2}` : active ? `inset 0 0 0 1px ${C.outline}` : "none" }} />
    );
}

function WorkoutInline({ list, dayDate, title, workoutStart, save, dayDone, canFinalize, onFinalize, onAddLoad, onSkipSet, onMessage, restrictionOf, bottomOffset = 0, onPickDay }) {
    const rows = useMemo(() => list.map((ex) => describe(ex, dayDate)), [list, dayDate]);
    const [openId, setOpenId] = useState(() => { const r = rows.find((x) => !x.allDone); return r ? r.ex.id : null; });
    const [skipped, setSkipped] = useState(() => new Set());
    const [drafts, setDrafts] = useState({}); // "exId|setId" -> { load, reps } digitado numa série ainda não feita
    const [vidId, setVidId] = useState(null);
    const [sheet, setSheet] = useState(null);
    const [sheetText, setSheetText] = useState("");
    const [rest, setRest] = useState(() => { try { const r = JSON.parse(sessionStorage.getItem(REST_KEY) || "null"); return r && r.end > Date.now() ? r : null; } catch (e) { return null; } });
    const [now, setNow] = useState(Date.now());
    const [collapsed, setCollapsed] = useState(false);
    const topRef = useRef(null);
    const repsRefs = useRef({});

    // salvamento (35b): igual ao WorkoutV3
    const [, setTick] = useState(0);
    const saveStateOf = (s) => { const at = s.log && s.log.at; if (!save || typeof at !== "number" || at <= save.syncedAt) return "saved"; if (save.online && (save.syncing || Date.now() - at < 4000)) return "saving"; return "pending"; };
    const lastAt = rows.reduce((m, r) => Math.max(m, ...r.sets.map((x) => (x.log && typeof x.log.at === "number" ? x.log.at : 0))), 0);
    useEffect(() => { const wait = lastAt + 4100 - Date.now(); if (wait <= 0) return; const t = setTimeout(() => setTick((n) => n + 1), wait); return () => clearTimeout(t); }, [lastAt]);
    const pendingN = save ? rows.reduce((n, r) => n + r.sets.filter((x) => x.done && saveStateOf(x) === "pending").length, 0) : 0;

    // relógio: descanso e tempo de treino
    useEffect(() => {
        if (!rest && !(workoutStart && workoutStart.date === dayDate)) return;
        const id = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(id);
    }, [rest, workoutStart, dayDate]);
    useEffect(() => { if (rest && now >= rest.end) { setRest(null); haptic("confirm"); } }, [now, rest]);
    useEffect(() => { try { if (rest) sessionStorage.setItem(REST_KEY, JSON.stringify(rest)); else sessionStorage.removeItem(REST_KEY); } catch (e) { } }, [rest]);
    useEffect(() => {
        const onScroll = () => { const el = topRef.current; if (!el) return; const v = el.getBoundingClientRect().bottom < 0; setCollapsed((c) => (c === v ? c : v)); };
        window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const pendingOf = (r) => (skipped.has(r.ex.id) ? null : r.sets.find((s) => !s.done && !s.skip));
    const allSets = rows.reduce((n, r) => n + r.sets.length, 0);
    const doneSets = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);
    const resolved = rows.reduce((n, r) => n + r.sets.filter((s) => s.done || s.skip).length, 0);
    const pct = allSets ? Math.round((resolved / allSets) * 100) : 0;
    const anyLeft = rows.some((r) => pendingOf(r));
    const startedAt = workoutStart && workoutStart.date === dayDate ? workoutStart.startedAt : null;
    const clock = startedAt ? mmss((now - startedAt) / 1000) : "0:00";
    const weekday = WEEKDAYS[new Date(dayDate + "T00:00:00").getDay()];

    const valueOf = (r, s) => { const d = drafts[r.ex.id + "|" + s.id]; if (s.done) return { load: s.log.load, reps: parseReps(s.log.reps) || s.suggest.reps }; return { load: d && d.load != null ? d.load : s.suggest.load, reps: d && d.reps != null ? d.reps : s.suggest.reps }; };
    const setDraft = (r, s, patch) => setDrafts((p) => { const k = r.ex.id + "|" + s.id; return { ...p, [k]: { ...(p[k] || {}), ...patch } }; });
    const openNext = (r, exceptSetId) => {
        const moreHere = r.sets.some((y) => !y.done && !y.skip && y.id !== exceptSetId);
        if (moreHere) return;
        const next = rows.find((x) => x.ex.id !== r.ex.id && !skipped.has(x.ex.id) && x.sets.some((y) => !y.done && !y.skip));
        setOpenId(next ? next.ex.id : null);
    };

    // ✓ numa série: registra com o que está nos campos e começa o descanso
    const check = (r, s) => {
        if (s.done) return;
        const v = valueOf(r, s);
        onAddLoad(r.ex.id, { date: dayDate, setId: s.id, kind: s.kind, targetReps: s.target, load: v.load, reps: v.reps, checkPR: true });
        haptic("confirm"); setVidId(null);
        const left = rows.reduce((n, x) => n + (skipped.has(x.ex.id) ? 0 : x.sets.filter((y) => !y.done && !y.skip && !(x.ex.id === r.ex.id && y.id === s.id)).length), 0);
        if (left > 0) { const total = s.working ? r.rest : NON_WORKING_REST; setRest({ end: Date.now() + total * 1000, total }); }
        openNext(r, s.id);
    };
    // mudar o número de uma série já feita = corrigir (sem descanso)
    const fix = (r, s, patch) => {
        const v = { ...valueOf(r, s), ...patch };
        onAddLoad(r.ex.id, { date: dayDate, setId: s.id, kind: s.kind, targetReps: s.target, load: v.load, reps: v.reps, checkPR: true });
        haptic("tick");
    };
    const skipSet = (r) => {
        const s = pendingOf(r); if (!s || !onSkipSet) return;
        onSkipSet(r.ex.id, s.id, dayDate); haptic("tick"); openNext(r, s.id);
    };
    const sendSheet = (text) => { const t = String(text || "").trim(); if (!t) return; onMessage(sheet.context + " — " + t); setSheet(null); setSheetText(""); };

    const showBar = !anyLeft; // a folha de baixo agora é só o "Finalizar"; o descanso virou uma pílula
    const barH = (showBar ? 110 : rest ? 76 : 0) + bottomOffset;

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div ref={topRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={KICKER}>{weekday} · {doneSets} DE {allSets} SÉRIES</span>
                <span style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span style={{ fontSize: 13, color: C.text3, ...num }}>{clock}</span>
                    {canFinalize && <button type="button" onClick={onFinalize} style={{ ...btnText, fontWeight: 700, color: C.text2 }}>{dayDone ? "Compartilhar" : "Finalizar"}</button>}
                </span>
            </div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                <span style={{ fontFamily: F.display, fontSize: String(title).length > 14 ? 26 : 34, fontWeight: 900, fontStretch: "125%", lineHeight: 1, overflowWrap: "anywhere" }}>{title}</span>
                {onPickDay && <button type="button" onClick={onPickDay} style={{ ...btnText, flex: "none", color: C.text3 }}>Trocar ›</button>}
            </div>
            <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: C.raised, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", backgroundImage: PROGRESS, transition: "width .3s" }} /></div>

            <div style={{ marginTop: 8, display: "flex", flexDirection: "column" }}>
                {rows.map((r, ei) => {
                    const isOpen = r.ex.id === openId;
                    const isSkipped = skipped.has(r.ex.id);
                    const restr = restrictionOf(r.ex.name);
                    const cur = pendingOf(r);
                    return (
                        <div key={r.ex.id} style={{ background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` }}>
                            <button type="button" onClick={() => setOpenId(isOpen ? null : r.ex.id)} aria-expanded={isOpen}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: isOpen ? "16px 0 10px" : "12px 0", minHeight: 52, background: "none", border: "none", color: "inherit", textAlign: "left", cursor: "pointer" }}>
                                <span style={{ width: 22, flex: "none", fontSize: 13, fontWeight: 700, color: r.allDone ? C.text2 : isOpen ? C.text : C.text4, ...num }}>
                                    {r.allDone ? <IconCheck /> : isSkipped ? "–" : String(ei + 1).padStart(2, "0")}
                                </span>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                                    <span style={{ fontFamily: F.display, fontSize: isOpen ? 20 : 16, fontWeight: isOpen ? 800 : 700, fontStretch: "110%", lineHeight: 1.15, color: r.allDone || isSkipped ? C.text4 : C.text }}>{r.ex.name}</span>
                                    <span style={{ fontSize: 13, color: C.text3, ...num }}>
                                        {isSkipped ? "Pulado" : r.workCount + (r.workCount === 1 ? " série" : " séries") + (r.planReps ? " · " + r.planReps.replace("-", "–") + " reps" : "") + " · descanso " + mmss(r.rest)}
                                        {restr && <span style={{ marginLeft: 8, color: C.accent, fontWeight: 700 }}>● {restr.region}</span>}
                                    </span>
                                </span>
                                {!isOpen && <span style={{ display: "flex", gap: 3, flex: "none" }}>{r.sets.map((s) => <span key={s.id} style={{ width: 12, height: 12, borderRadius: 3, ...pillStyle(s.kind, s.done) }} />)}</span>}
                            </button>
                            {isOpen && (
                                <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                                    {r.ex.note && <div style={{ padding: "10px 12px", borderRadius: 10, background: C.panel, display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4, color: C.text2 }}><IconPin /><span>Prof.: {r.ex.note}</span></div>}
                                    {(() => { const t = lastTech(r.ex, dayDate); return t && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                            <span style={{ ...COL_LABEL, marginRight: 2 }}>{t.when.toUpperCase()}</span>
                                            {t.notes.map((n) => <span key={n} style={{ padding: "5px 10px", borderRadius: 999, boxShadow: "inset 0 0 0 1px " + (n === "Ótima execução" ? C.outline : C.accentLine), color: n === "Ótima execução" ? C.text2 : C.text, fontSize: 13 }}>{n}</span>)}
                                        </div>
                                    ); })()}
                                    {restr && <div style={{ fontSize: 13, color: C.accent }}>● {restr.text}</div>}
                                    {r.ex.url && (
                                        <button type="button" onClick={() => setVidId(vidId === r.ex.id ? null : r.ex.id)} aria-expanded={vidId === r.ex.id}
                                            style={{ alignSelf: "flex-start", minHeight: 40, borderRadius: 999, border: "none", background: C.panel, color: C.text, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                            <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16" />{vidId === r.ex.id ? <path d="M96 96l64 64M160 96l-64 64" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" /> : <path d="M112 92l56 36-56 36z" fill="currentColor" />}</svg>
                                            {vidId === r.ex.id ? "Fechar execução" : "Ver execução"}
                                        </button>
                                    )}
                                    {r.ex.url && vidId === r.ex.id && <VideoPreview url={r.ex.url} />}

                                    {/* de onde vêm os números (20/nov): o mesmo que o aluno fez em cada série no último treino */}
                                    {!r.allDone && <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>{r.ultima !== "—" ? "Já preenchido com o que você fez no último treino. Mudou? Toque no número." : "Primeira vez aqui: ajuste a carga e toque no ✓."}</div>}
                                    {/* a tabela das séries: cada linha registra a si mesma */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 8, padding: "0 4px" }}>
                                            <span style={COL_LABEL}>SÉRIE</span><span style={{ ...COL_LABEL, textAlign: "center" }}>KG</span><span style={{ ...COL_LABEL, textAlign: "center" }}>REPS</span><span />
                                        </div>
                                        {r.sets.map((s) => {
                                            const isCur = cur && cur.id === s.id;
                                            const v = valueOf(r, s);
                                            const key = r.ex.id + "|" + s.id;
                                            return (
                                                <div key={s.id} style={{ display: "grid", gridTemplateColumns: GRID, gap: 8, alignItems: "center", padding: "4px", borderRadius: 14, background: isCur ? C.panel : "transparent", opacity: s.skip ? 0.55 : 1 }}>
                                                    <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                        <span style={{ fontSize: s.working ? 16 : 12, fontWeight: 800, color: isCur || s.done ? C.text : C.text4, ...num }}>{s.n}</span>
                                                        {s.skip && <span style={{ fontSize: 10, color: C.text3 }}>pulada</span>}
                                                    </span>
                                                    <NumBox label={s.label.toLowerCase() + " · carga em kg"} value={v.load} decimal active={isCur} done={s.done}
                                                        onCommit={(x) => (s.done ? fix(r, s, { load: x }) : setDraft(r, s, { load: x }))}
                                                        onEnter={() => { const el = repsRefs.current[key]; if (el) el.focus(); }} />
                                                    <NumBox label={s.label.toLowerCase() + " · repetições"} value={v.reps} active={isCur} done={s.done} inputRef={(el) => { repsRefs.current[key] = el; }}
                                                        onCommit={(x) => (s.done ? fix(r, s, { reps: x }) : setDraft(r, s, { reps: x }))} />
                                                    {s.done ? (
                                                        <span style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                                            <span aria-label={s.label + " feita"} style={{ width: 44, height: 44, borderRadius: 12, backgroundImage: SILVER, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><IconCheck size={18} /></span>
                                                            {saveStateOf(s) !== "saved" && <span style={{ position: "absolute", right: -4, bottom: -2 }}><SaveMark state={saveStateOf(s)} /></span>}
                                                        </span>
                                                    ) : (
                                                        <button type="button" disabled={s.skip} onClick={() => check(r, s)} aria-label={"Registrar " + s.label.toLowerCase()}
                                                            style={{ width: 52, height: 48, borderRadius: 12, border: "none", cursor: s.skip ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                                background: isCur ? C.text : "transparent", color: isCur ? C.bg : C.text4, boxShadow: isCur ? "none" : `inset 0 0 0 1px ${C.outline}` }}>
                                                            <IconCheck size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button type="button" style={{ ...chipBtn, color: C.text }} onClick={() => {
                                            const s = cur || [...r.sets].reverse().find((y) => y.done) || r.sets[0]; const v = valueOf(r, s);
                                            setSheet({ context: r.ex.name + " · " + s.label.charAt(0) + s.label.slice(1).toLowerCase() + " · " + br(v.load) + " kg × " + v.reps });
                                        }}><IconChat />Recado</button>
                                        {cur && onSkipSet && <button type="button" style={chipBtn} onClick={() => skipSet(r)}>Pular série {cur.n}</button>}
                                        {!r.allDone && !isSkipped && <button type="button" style={chipBtn} onClick={() => { setSkipped((p) => new Set(p).add(r.ex.id)); setRest(null); openNext({ ...r, sets: [] }, null); }}>Pular exercício</button>}
                                        {isSkipped && <button type="button" style={{ ...chipBtn, color: C.text }} onClick={() => setSkipped((p) => { const n = new Set(p); n.delete(r.ex.id); return n; })}>Voltar a fazer</button>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ height: barH + 32 }} aria-hidden="true" />

            {collapsed && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: C.bg, boxShadow: `inset 0 -1px 0 ${C.line}`, paddingTop: "calc(12px + env(safe-area-inset-top, 0px))", paddingBottom: 12, paddingLeft: 20, paddingRight: 20 }}>
                    <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 900, fontStretch: "125%" }}>{title}</span>
                            <span style={{ fontSize: 13, color: C.text3, ...num }}>{doneSets}/{allSets}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: C.raised, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", backgroundImage: PROGRESS, transition: "width .3s" }} /></div>
                    </div>
                </div>
            )}

            {/* descanso (20/nov, "barra muito grande"): uma linha só, flutuando acima das abas */}
            {rest && anyLeft && (
                <div style={{ position: "fixed", left: 12, right: 12, bottom: `calc(${12 + bottomOffset}px + env(safe-area-inset-bottom, 0px))`, zIndex: 41, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                    <div role="timer" aria-label="Descanso" style={{ pointerEvents: "auto", position: "relative", overflow: "hidden", width: "100%", maxWidth: 520, height: 56, borderRadius: 999, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}, 0 8px 24px rgba(0,0,0,.45)`, display: "flex", alignItems: "center", gap: 10, padding: "0 6px 0 18px", animation: "cc-fadein .2s ease-out" }}>
                        <span style={{ fontSize: 13, color: C.text3 }}>Descanso</span>
                        <span style={{ flex: 1, fontFamily: F.display, fontSize: 24, fontWeight: 900, fontStretch: "110%", ...num }}>{mmss((rest.end - now) / 1000)}</span>
                        <button type="button" onClick={() => setRest((x) => x && { end: x.end + 15000, total: x.total + 15 })} style={{ height: 44, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+15s</button>
                        <button type="button" onClick={() => setRest(null)} style={{ height: 44, padding: "0 16px", borderRadius: 999, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Pular</button>
                        <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: Math.max(0, Math.min(100, ((rest.end - now) / (rest.total * 1000)) * 100)) + "%", backgroundImage: PROGRESS }} />
                    </div>
                </div>
            )}

            {/* folha de baixo: no fim, o Finalizar (e o aviso de séries só no aparelho) */}
            {(showBar || pendingN > 0) && (
                <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                    <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 660, background: C.panel, borderRadius: "24px 24px 0 0", padding: `14px 12px calc(${14 + bottomOffset}px + env(safe-area-inset-bottom, 0px))`, display: "flex", flexDirection: "column", gap: 10, boxShadow: `inset 0 1px 0 ${C.line}`, animation: "cc-fadein .2s ease-out" }}>
                        {pendingN > 0 && <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px", fontSize: 13, color: C.text3 }}><IconCloudOff /><span>{(save && save.online ? "Ainda não chegou na nuvem. " : "Sem internet. ") + pendingN + (pendingN === 1 ? " série salva quando voltar." : " séries salvam quando voltar.")}</span></div>}
                        {!anyLeft ? (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
                                    <span style={{ ...COL_LABEL, color: C.text2 }}>{dayDone ? "TREINO DE HOJE FEITO" : skipped.size ? "PRONTO PRA FINALIZAR · " + skipped.size + (skipped.size === 1 ? " PULADO" : " PULADOS") : "TODAS AS SÉRIES FEITAS"}</span>
                                    <span style={COL_LABEL}>{doneSets}/{allSets}</span>
                                </div>
                                <button type="button" style={{ ...btnMain, opacity: canFinalize ? 1 : 0.5 }} disabled={!canFinalize} onClick={onFinalize}>{dayDone ? "Ver e compartilhar" : "Finalizar treino"}</button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {sheet && (
                <div onClick={() => setSheet(null)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(5,6,10,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Recado sobre a série"
                        style={{ width: "100%", maxWidth: 660, background: C.panel, borderRadius: "24px 24px 0 0", padding: "18px 16px calc(26px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                            <span style={{ ...KICKER, color: C.text2 }}>Recado pro professor</span>
                            <button type="button" onClick={() => setSheet(null)} style={{ ...btnText, fontSize: 15, color: C.text4 }}>Fechar</button>
                        </div>
                        <div style={{ fontSize: 13, color: C.text3, ...num }}>{sheet.context}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {QUICK_REPLIES.map((q) => (
                                <button key={q} type="button" onClick={() => sendSheet(q)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${q === "Senti dor" ? C.accentLine : C.outline}`, color: q === "Senti dor" ? C.accent : C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>{q}</button>
                            ))}
                        </div>
                        <textarea value={sheetText} onChange={(e) => setSheetText(e.target.value)} placeholder="Ou escreva um recado…" rows={2}
                            style={{ width: "100%", boxSizing: "border-box", resize: "none", borderRadius: 10, border: "none", boxShadow: `inset 0 0 0 1px ${C.border}`, background: C.bg, color: C.text, fontFamily: F.body, fontSize: 16, padding: "10px 12px" }} />
                        <button type="button" style={{ ...btnMain, opacity: sheetText.trim() ? 1 : 0.5 }} disabled={!sheetText.trim()} onClick={() => sendSheet(sheetText)}>Enviar recado</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export { WorkoutInline };
