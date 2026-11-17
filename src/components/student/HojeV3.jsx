import React from "react";
import { C, DAYS, F, SIL_URL, NON_COUNTING_KINDS, KICKER, COL_LABEL } from "../../styles/tokens";
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

function estimateMinutes(rows, targetDuration) {
    const m = String(targetDuration || "").match(/\d+/);
    if (m) return "~" + m[0] + " min";
    // sem duração na ficha: ~1 min por série + o descanso de cada uma
    const sec = rows.reduce((n, r) => n + r.sets.reduce((k, s) => k + 60 + (NON_COUNTING_KINDS.has(s.kind) ? 60 : r.rest), 0), 0);
    return sec ? "~" + Math.round(sec / 60) + " min" : "—";
}

function HojeV3({ student, greetWord, weekLine, streak, todayKey, dayDate, week, dayNames, cardio, dayDone, inProgress, lastProfMsg, unreadFromProf,
    onStart, onShare, onPickDay, onOpenRecados, onOpenDiary, banners }) {
    const list = (week && week[todayKey]) || [];
    const rows = list.map((ex) => describe(ex, dayDate));
    const dayName = (dayNames && dayNames[todayKey]) || "";
    const title = String(dayName || (list.length ? "Treino" : "")).split("·")[0].trim().toUpperCase();
    const weekday = WEEKDAYS[new Date(dayDate + "T00:00:00").getDay()];
    const hasAnyWorkout = Object.values(week || {}).some((l) => Array.isArray(l) && l.length);
    const otherDays = Object.keys(week || {}).filter((k) => k !== todayKey && (week[k] || []).length);
    const state = !hasAnyWorkout ? "empty" : dayDone ? "done" : list.length ? "train" : cardio && cardio[todayKey] ? "train" : "rest";
    const firstName = String(student.name || "").split(" ")[0].toUpperCase();
    const totalSets = rows.reduce((n, r) => n + r.sets.length, 0);
    const doneSets = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);

    const cta = state === "train" ? { label: inProgress ? "Continuar treino" : "Começar treino", onClick: onStart }
        : state === "done" ? { label: "Ver e compartilhar", onClick: onShare } : null;

    return (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", paddingBottom: cta ? 150 : 110 }}>
            <img src={SIL_URL} alt="" aria-hidden="true" style={{ position: "absolute", right: -30, top: -40, width: 170, height: 170, opacity: 0.22, pointerEvents: "none" }} />
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
                {state === "rest" && <span style={{ fontSize: 15, lineHeight: 1.45, color: C.text2 }}>Recovery ativado. Água, sono e zero pressa hoje.</span>}
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

            {state === "rest" && otherDays.length > 0 && (
                <>
                    <div style={{ ...kicker, marginTop: 20, color: C.text4 }}>Treinar mesmo assim</div>
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {otherDays.map((k) => (
                            <button key={k} type="button" onClick={() => onPickDay(k)} style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>
                                {String((dayNames && dayNames[k]) || (DAYS.find((d) => d.key === k) || {}).full || k).split("·")[0].trim()}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {lastProfMsg && (
                <button type="button" onClick={onOpenRecados} style={{ marginTop: 12, width: "100%", padding: "12px 14px", borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", gap: 12, textAlign: "left", cursor: "pointer", color: C.text }}>
                    <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>PROF</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{unreadFromProf ? "Recado novo do professor" : "Prof. · último recado"}</span>
                        <span style={{ fontSize: 15, lineHeight: 1.4, color: C.text2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{lastProfMsg.text}</span>
                    </span>
                </button>
            )}

            <div style={{ marginTop: 18, display: "flex", gap: 18, flexWrap: "wrap" }}>
                {state !== "rest" && otherDays.length > 0 && <button type="button" onClick={() => onPickDay(null)} style={{ background: "none", border: "none", padding: 0, minHeight: 44, color: C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Trocar treino ›</button>}
            </div>

            {cta && (
                <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(96px + env(safe-area-inset-bottom, 0px))", zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none", paddingLeft: "max(12px, env(safe-area-inset-left, 0px))", paddingRight: "max(12px, env(safe-area-inset-right, 0px))" }}>
                    <button type="button" onClick={cta.onClick} style={{ pointerEvents: "auto", width: "100%", maxWidth: 636, height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{cta.label}</button>
                </div>
            )}
        </div>
    );
}

export { HojeV3 };
