import React, { useState } from "react";
import { C, DAYS, F, NON_COUNTING_KINDS, KICKER, COL_LABEL } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { describe } from "./WorkoutV3";

// Tela "Hoje" do aluno — design v3 (design/v3/README.md · "Hoje"; decisões em design/v3/DECISOES.md).
// Saudação + nome, semana e sequência, card do dia em 4 estados (treino do dia, já feito, descanso,
// sem ficha), lista curta dos exercícios (DECISOES: preenche o espaço vazio do protótipo), último
// recado do professor e o botão principal fixo acima das abas.

const WEEKDAYS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
const kicker = KICKER;
const colLabel = COL_LABEL;
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat top/100% 1px` };
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const mondayOf = (iso) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
// recuperação ativa (39): os 3 itens que o app já guarda por dia
const REC = [["hydration", "Hidratação", "2 litros de água"], ["sleep", "Sono", "7 horas ou mais"], ["mobility", "Mobilidade", "10 min, sem pressa"]];
// reflexos prata em losango no fundo (44b) — o selo grande saiu
const SPARKS = [[8, 40, 10, 0.5], [18, 22, 6, 0.35], [80, 60, 12, 0.45], [64, 30, 5, 0.3], [88, 140, 7, 0.35], [44, 96, 4, 0.25]];

function estimateMinutes(rows, targetDuration) {
    const m = String(targetDuration || "").match(/\d+/);
    if (m) return "~" + m[0] + " min";
    // sem duração na ficha: ~1 min por série + o descanso de cada uma
    const sec = rows.reduce((n, r) => n + r.sets.reduce((k, s) => k + 60 + (NON_COUNTING_KINDS.has(s.kind) ? 60 : r.rest), 0), 0);
    return sec ? "~" + Math.round(sec / 60) + " min" : "—";
}

function HojeV3({ student, greetWord, weekLine, streak, todayKey, dayKey, dayDate, week, dayNames, cardio, dayDone, inProgress, lastProfMsg, unreadFromProf,
    sessions, recovery, onToggleRecovery, onCloseRest, onSwapDay, onStart, onShare, onOpenRecados, banners }) {
    // dayKey: o dia da ficha que o aluno vai treinar hoje (o da semana, ou o que ele trocou em "Treinar outro dia")
    const k = dayKey || todayKey;
    const [swapOpen, setSwapOpen] = useState(false);
    const list = (week && week[k]) || [];
    const rows = list.map((ex) => describe(ex, dayDate));
    const dayName = (dayNames && dayNames[k]) || "";
    const title = String(dayName || (list.length ? "Treino" : "")).split("·")[0].trim().toUpperCase();
    const weekday = WEEKDAYS[new Date(dayDate + "T00:00:00").getDay()];
    const hasAnyWorkout = Object.values(week || {}).some((l) => Array.isArray(l) && l.length);
    const fichaDays = DAYS.filter((d) => (week[d.key] || []).length || (cardio && cardio[d.key]));
    const state = !hasAnyWorkout ? "empty" : dayDone ? "done" : list.length ? "train" : cardio && cardio[k] ? "train" : "rest";
    const recN = recovery ? REC.filter(([key]) => recovery[key]).length : 0;
    const nameOf = (key) => String((dayNames && dayNames[key]) || ((week[key] || []).length ? "Treino" : "Cardio")).split("·")[0].trim();
    const mon = mondayOf(dayDate);
    const statusOf = (key) => { const ss = (sessions || []).filter((x) => x.day === key && x.date >= mon && x.date <= dayDate).sort((a, b) => (a.date < b.date ? 1 : -1)); if (!ss.length) return "ainda não fez essa semana"; const d = new Date(ss[0].date + "T12:00:00"); return "feito " + WD[d.getDay()] + " " + d.getDate() + "/" + MO[d.getMonth()]; };
    const firstName = String(student.name || "").split(" ")[0].toUpperCase();
    const totalSets = rows.reduce((n, r) => n + r.sets.length, 0);
    const doneSets = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);

    const cta = state === "train" ? { label: inProgress ? "Continuar treino" : list.length ? "Começar treino" : "Começar cardio", onClick: onStart }
        : state === "done" ? { label: "Ver e compartilhar", onClick: onShare }
        : state === "rest" && onCloseRest ? { label: "Fechar o dia · " + recN + " de " + REC.length, onClick: () => { haptic("confirm"); onCloseRest(); } } : null;
    const canSwap = state === "train" && !inProgress && fichaDays.length > 1 && onSwapDay;

    return (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", paddingBottom: cta ? 150 : 110 }}>
            {SPARKS.map(([x, y, sz, op], i) => <span key={i} aria-hidden="true" style={{ position: "absolute", left: x + "%", top: y, width: sz, height: sz, borderRadius: 2, transform: "rotate(45deg)", background: "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)", opacity: op, boxShadow: "0 0 " + sz * 2 + "px rgba(198,210,228," + op + ")", pointerEvents: "none" }} />)}
            <span style={{ position: "relative", fontSize: 15, color: C.text3 }}>{greetWord}</span>
            <span style={{ position: "relative", marginTop: 2, fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1, overflowWrap: "anywhere" }}>{firstName}</span>
            <div style={{ position: "relative", marginTop: 14, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontSize: 13, color: C.text2 }}>
                <span>{weekLine}</span>
                {streak > 0 && <><span style={{ color: C.dim }}>·</span><span>{streak} {streak === 1 ? "dia" : "dias"} de sequência</span></>}
            </div>

            {banners}

            <div style={{ marginTop: 28, padding: "18px 16px", borderRadius: 24, background: C.panel, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ ...kicker, color: state === "done" ? C.text2 : C.text4 }}>
                        {state === "done" ? weekday + " · TREINO FEITO" : state === "rest" ? weekday + " · DESCANSO" : state === "empty" ? "SUA FICHA" : weekday + " · HOJE É DIA DE"}
                    </span>
                    {state === "done" && <span aria-hidden="true" style={{ color: C.text2, fontWeight: 800 }}>✓</span>}
                </div>
                {(() => {
                    const t = state === "rest" ? "RECUPERAÇÃO" : state === "empty" ? "AINDA SEM FICHA" : title || "TREINO";
                    // palavra longa não pode quebrar no meio: diminui o corpo em vez de quebrar
                    const longest = Math.max(...t.split(/\s+/).map((w) => w.length));
                    const size = longest > 11 ? 24 : longest > 8 ? 28 : 36;
                    return <span style={{ fontFamily: F.display, fontSize: size, fontWeight: 900, fontStretch: "125%", lineHeight: 1, textWrap: "balance" }}>{t}</span>;
                })()}
                {state === "rest" && <span style={{ fontSize: 15, lineHeight: 1.45, color: C.text2 }}>Dia de descanso ativo. Marque o que fez.</span>}
                {state === "rest" && recovery && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {REC.map(([key, t, d]) => { const on = !!recovery[key]; return (
                            <button key={key} type="button" aria-pressed={on} onClick={() => { haptic("tick"); onToggleRecovery(key); }}
                                style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 60, padding: 0, border: "none", background: "none", boxShadow: `inset 0 -1px 0 ${C.line}`, color: on ? C.text3 : C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                                <span aria-hidden="true" style={{ flex: "none", width: 28, height: 28, borderRadius: 8, background: on ? C.text : "transparent", boxShadow: on ? "none" : "inset 0 0 0 1.5px #3A404C", color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{on ? "✓" : ""}</span>
                                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{t}</span>
                                <span style={{ fontSize: 13, color: C.text3 }}>{d}</span>
                            </button>
                        ); })}
                    </div>
                )}
                {state === "empty" && <span style={{ fontSize: 15, lineHeight: 1.45, color: C.text2 }}>Seu professor ainda está montando o seu treino. Assim que ficar pronto, ele aparece aqui.</span>}

                {(state === "train" || state === "done") && rows.length > 0 && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                            {[["EXERCÍCIOS", String(rows.length)], ["SÉRIES", state === "done" || inProgress ? doneSets + "/" + totalSets : String(totalSets)], ["DURAÇÃO", estimateMinutes(rows, student.targetDuration)]].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={colLabel}>{l}</span><span style={{ fontSize: 15, fontWeight: 700, ...num }}>{v}</span></div>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {rows.map((r, i) => (
                                <div key={r.ex.id} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "9px 0", ...divider }}>
                                    <span style={{ width: 20, fontSize: 13, color: C.text3, ...num }}>{String(i + 1).padStart(2, "0")}</span>
                                    <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, fontStretch: "110%", color: r.allDone ? C.text4 : C.text }}>{r.ex.name}</span>
                                    <span style={{ flex: "none", fontSize: 15, fontWeight: 600, fontStretch: "75%", color: C.text3, ...num }}>{r.workCount}×{r.planReps || "—"}{r.planLoad ? " · " + br(r.planLoad) + " kg" : ""}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {state === "train" && list.length === 0 && <span style={{ fontSize: 15, color: C.text2 }}>Hoje é dia de cardio.</span>}
            </div>

            {lastProfMsg && (
                <button type="button" onClick={onOpenRecados} style={{ marginTop: 12, width: "100%", padding: "12px 14px", borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", gap: 12, textAlign: "left", cursor: "pointer", color: C.text }}>
                    <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>PROF</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{unreadFromProf ? "Recado novo do professor" : "Prof. · último recado"}</span>
                        <span style={{ fontSize: 15, lineHeight: 1.4, color: C.text2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{lastProfMsg.text}</span>
                    </span>
                </button>
            )}

            {cta && (
                <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(96px + env(safe-area-inset-bottom, 0px))", zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none", paddingLeft: "max(12px, env(safe-area-inset-left, 0px))", paddingRight: "max(12px, env(safe-area-inset-right, 0px))" }}>
                    <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 636, display: "flex", gap: 8 }}>
                    {canSwap && <button type="button" onClick={() => { haptic("tick"); setSwapOpen(true); }} style={{ flex: "none", width: 120, height: 56, borderRadius: 16, border: "none", background: C.bg, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Trocar</button>}
                    <button type="button" onClick={cta.onClick} style={{ flex: 1, minWidth: 0, height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{cta.label}</button>
                    </div>
                </div>
            )}

            {swapOpen && (
                <div role="dialog" aria-modal="true" aria-label="Treinar outro dia" style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
                    <div onClick={() => setSwapOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, padding: "12px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 8, maxHeight: "86vh", overflowY: "auto" }}>
                        <span aria-hidden="true" style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, background: C.raised }} />
                        <span style={{ marginTop: 8, fontFamily: F.display, fontSize: 20, fontWeight: 800, fontStretch: "110%" }}>Treinar outro dia</span>
                        <span style={{ fontSize: 15, color: C.text3 }}>{"Hoje seria " + nameOf(todayKey) + ". Os outros dias da sua ficha:"}</span>
                        {fichaDays.map((dd) => { const cur = dd.key === k; const st = dd.key === todayKey && !cur ? "o de hoje" : cur ? "escolhido" : statusOf(dd.key); const hl = st.indexOf("ainda") === 0; return (
                            <button key={dd.key} type="button" onClick={() => { haptic("confirm"); setSwapOpen(false); if (!cur) onSwapDay(dd.key); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 60, padding: "0 14px", borderRadius: 14, border: "none", background: cur ? C.raised : C.bg, boxShadow: cur ? `inset 0 0 0 1.5px ${C.text}` : hl ? "inset 0 0 0 1px #3A404C" : "none", color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                                <span style={{ ...colLabel, width: 34 }}>{dd.short.toUpperCase()}</span>
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontSize: 15, fontWeight: 700 }}>{nameOf(dd.key)}</span>
                                    <span style={{ fontSize: 13, color: hl ? C.text : C.text3 }}>{st}</span>
                                </span>
                                <span aria-hidden="true" style={{ color: C.text3 }}>›</span>
                            </button>
                        ); })}
                        <span style={{ fontSize: 13, color: C.text3 }}>O professor fica sabendo da troca.</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export { HojeV3 };
