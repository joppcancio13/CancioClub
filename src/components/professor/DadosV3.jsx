import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { ccConfirm } from "../../utils/confirm";
import { AssessmentSummary } from "../assessment/AssessmentSummary";
import { ReassessmentHistory } from "../student/Reassessment";

// Dados do aluno — design v3 (README · Professor 9, protótipo 26c): resumo de leitura com o alerta
// clínico privado fixo no topo; tocar num bloco abre uma gaveta com escolhas prontas; a exclusão (LGPD)
// só aparece quando o aluno pede. Substitui o antigo formulário aberto (FichaEditor).
// Só é usado na visão do professor — o alerta clínico nunca chega aqui pelo lado do aluno.

const kicker = KICKER;
const GOALS = ["Hipertrofia", "Força", "Emagrecimento", "Condicionamento"];
const FREQS = [2, 3, 4, 5, 6];
const DURS = [45, 60, 75, 90];
const num = (s) => { const m = String(s || "").match(/\d+/); return m ? Number(m[0]) : null; };
const fmtDay = (iso) => (iso ? new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "").replace(/ de /g, " ") : null);
const opt = (on) => ({ flex: 1, minHeight: 48, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 15, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text, boxShadow: `inset 0 0 0 1px ${C.outline}` }) });
const inp = { width: "100%", boxSizing: "border-box", minHeight: 48, padding: 13, borderRadius: 10, border: "none", outline: "none", background: C.bg, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 15, lineHeight: 1.4, resize: "vertical" };

function reassessLabel(st) {
    if (!st.assessmentAt) return "sem anamnese";
    const list = (st.reassessments || []).filter((r) => !r.onlyPhoto); // só foto não conta como reavaliação
    const last = list.length ? list[list.length - 1].date : st.assessmentAt;
    const due = new Date(last).getTime() + (Number(st.reassessEvery) || 6) * 7 * 864e5;
    const d = Math.ceil((due - Date.now()) / 864e5);
    return d > 1 ? "em " + d + " dias" : d === 1 ? "amanhã" : d === 0 ? "hoje" : "atrasada " + -d + (d === -1 ? " dia" : " dias");
}

function Sheet({ title, onClose, onSave, children }) {
    return (
        <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, boxShadow: `inset 0 1px 0 ${C.line}`, padding: "16px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12, maxHeight: "85vh", overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={kicker}>{title}</span>
                    <button type="button" onClick={onClose} style={{ minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                </div>
                {children}
                <button type="button" onClick={onSave} style={{ marginTop: 4, height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Salvar</button>
            </div>
        </div>
    );
}

function DadosV3({ student: st, onSave, onPrint, onDelete, archives = [], onArchive, onRestoreArchive, onDeleteArchive }) {
    const [faseOpen, setFaseOpen] = useState(null);
    const [sheet, setSheet] = useState(null); // "nome" | "alerta" | "goal" | "freq" | "inicio" | "obs"
    const [draft, setDraft] = useState({});
    const [anamOpen, setAnamOpen] = useState(false);
    const first = String(st.name || "").split(" ")[0];
    const open = (k) => { haptic("tick"); setDraft({ name: st.name || "", clinicalAlert: st.clinicalAlert || "", goal: st.goal || "", freq: num(st.freqWeekly), dur: num(st.targetDuration), startDate: st.startDate || "", obs: st.obs || "" }); setSheet(k); };
    const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
    const save = () => {
        const d = draft; const t = (v) => String(v || "").trim() || undefined;
        const patch = sheet === "nome" ? (t(d.name) ? { name: t(d.name) } : {})
            : sheet === "alerta" ? { clinicalAlert: t(d.clinicalAlert) }
            : sheet === "goal" ? { goal: t(d.goal) }
            : sheet === "freq" ? { freqWeekly: d.freq ? d.freq + "x na semana" : undefined, targetDuration: d.dur ? d.dur + " min" : undefined }
            : sheet === "inicio" ? { startDate: d.startDate || undefined }
            : { obs: t(d.obs) };
        haptic("confirm"); onSave(patch); setSheet(null);
    };
    const freqLabel = [/^\d+\s*x/i.test(st.freqWeekly || "") ? num(st.freqWeekly) + "x" : st.freqWeekly, /^\d+\s*min/i.test(st.targetDuration || "") ? num(st.targetDuration) + " min" : st.targetDuration].filter(Boolean).join(" · ");
    const cells = [
        ["OBJETIVO", st.goal || "—", "goal"],
        ["FREQUÊNCIA", freqLabel || "—", "freq"],
        ["FICHA DESDE", fmtDay(st.startDate) || "—", "inicio"],
        ["REAVALIAÇÃO", reassessLabel(st), st.assessment ? "anam" : null],
    ];
    const alertLines = String(st.clinicalAlert || "").split("\n").map((l) => l.replace(/^Triagem \(relatado pelo aluno\): /, "")).filter(Boolean);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, color: C.text }}>
            <button type="button" onClick={() => open("nome")} aria-label="Editar nome" style={{ alignSelf: "flex-start", padding: 0, border: "none", background: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "block", fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "125%", lineHeight: 1.05, overflowWrap: "anywhere" }}>{String(st.name || "").toUpperCase()}</span>
                <span style={{ display: "block", marginTop: 4, fontSize: 13, color: C.text3 }}>{"código " + st.code}</span>
            </button>

            {st.deletionRequestedAt && onDelete && (
                <div style={{ borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ ...kicker, color: C.accent }}>PEDIDO DE EXCLUSÃO · LGPD</span>
                    <span style={{ fontSize: 13, lineHeight: 1.5, color: C.text2 }}>{first + " pediu em " + new Date(st.deletionRequestedAt).toLocaleDateString("pt-BR") + ". A lei pede resposta em até 15 dias. Se quiser guardar algo, baixe o PDF antes."}</span>
                    <button type="button" onClick={async () => { if (await ccConfirm("Todos os dados serão apagados. Não dá pra desfazer.", { title: "Apagar " + st.name + "?", ok: "Apagar", danger: true })) onDelete(); }}
                        style={{ alignSelf: "flex-start", minHeight: 44, marginTop: 4, padding: "0 16px", borderRadius: 10, border: "none", background: C.accent, color: C.bg, fontFamily: F.body, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apagar aluno e dados</button>
                </div>
            )}

            <button type="button" onClick={() => open("alerta")} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 16, border: "none", background: C.panel, boxShadow: st.clinicalAlert ? `inset 0 0 0 1px ${C.accentLine}` : "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true" style={{ flex: "none", marginTop: 1, color: st.clinicalAlert ? C.accent : C.text4 }}><path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M48 88h160a8 8 0 0 1 8 8v112a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8ZM88 88V56a40 40 0 0 1 80 0v32" /></svg>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ ...kicker, color: st.clinicalAlert ? C.accent : C.text4 }}>ALERTA · SÓ VOCÊ VÊ</span>
                    {alertLines.length ? alertLines.map((l, i) => <span key={i} style={{ fontSize: 15, lineHeight: 1.4 }}>{l}</span>) : <span style={{ fontSize: 15, color: C.text4 }}>Nenhuma restrição anotada. Toque pra anotar.</span>}
                </span>
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
                {cells.map(([l, v, k]) => (
                    <button key={l} type="button" disabled={!k} onClick={() => (k === "anam" ? setAnamOpen(true) : open(k))}
                        style={{ minWidth: 0, minHeight: 72, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, padding: "12px 14px", borderRadius: 14, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.text, textAlign: "left", cursor: k ? "pointer" : "default" }}>
                        <span style={kicker}>{l}</span>
                        {/* objetivo longo ("Força/Condicionamento") passava por cima do card ao lado: quebra na barra e no fim do card */}
                        <span style={{ maxWidth: "100%", fontSize: 16, fontWeight: 700, fontStretch: "110%", fontVariantNumeric: "tabular-nums", lineHeight: 1.25, overflowWrap: "anywhere" }}>{String(v).replace(/\//g, "/​")}</span>
                    </button>
                ))}
            </div>

            <button type="button" onClick={() => open("obs")} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 0", border: "none", background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px`, color: C.text, textAlign: "left", cursor: "pointer" }}>
                <span style={{ ...kicker, display: "flex", alignItems: "center", gap: 6 }}>OBSERVAÇÕES<span style={{ fontFamily: F.body, fontWeight: 400, letterSpacing: 0, fontSize: 12, color: C.text3 }}>{"· " + (first || "o aluno") + " vê"}</span></span>
                <span style={{ fontSize: 15, lineHeight: 1.45, color: st.obs ? C.text : C.text4, whiteSpace: "pre-wrap" }}>{st.obs || "Preferências, histórico… Toque pra escrever."}</span>
            </button>

            {onArchive && (() => {
                // fases (38b): linha do tempo, fase atual no topo; tocar numa antiga abre Restaurar e Apagar
                const old = [...archives].sort((a, b) => (a.date < b.date ? 1 : -1));
                const since = old[0] ? old[0].date : st.startDate;
                const fmt = (iso) => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "");
                const info = (a) => { const days = Object.values(a.week || {}).filter((l) => Array.isArray(l) && l.length).length; const ex = Object.values(a.week || {}).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0); return days + (days === 1 ? " dia · " : " dias · ") + ex + (ex === 1 ? " exercício" : " exercícios"); };
                const items = [{ id: "cur", label: "Fase atual", sub: since ? "desde " + fmt(since) : "a ficha de agora", cur: true }, ...old.map((a) => ({ id: a.id, label: a.label, sub: "guardada em " + fmt(a.date) + " · " + info(a), a }))];
                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ ...kicker, marginBottom: 8 }}>FASES</span>
                        {items.map((it, i) => { const open = faseOpen === it.id && !it.cur; return (
                            <div key={it.id} style={{ display: "flex", gap: 12 }}>
                                <span aria-hidden="true" style={{ width: 14, flex: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span style={{ marginTop: 6, width: 12, height: 12, borderRadius: "50%", background: it.cur ? C.text : "transparent", boxShadow: it.cur ? "none" : "inset 0 0 0 2px #3A404C" }} />
                                    <span style={{ flex: 1, width: 2, background: i === items.length - 1 ? "transparent" : C.line }} />
                                </span>
                                <div style={{ flex: 1, minWidth: 0, paddingBottom: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                                    <button type="button" disabled={it.cur} onClick={() => setFaseOpen(open ? null : it.id)} aria-expanded={it.cur ? undefined : open} style={{ padding: 0, minHeight: 32, border: "none", background: "none", color: C.text, textAlign: "left", cursor: it.cur ? "default" : "pointer", fontFamily: F.body }}>
                                        <span style={{ display: "block", fontSize: 15, fontWeight: it.cur ? 800 : 600 }}>{it.label}</span>
                                        <span style={{ display: "block", fontSize: 13, color: C.text3 }}>{it.sub}</span>
                                    </button>
                                    {it.cur && <button type="button" onClick={onArchive} style={{ alignSelf: "flex-start", marginTop: 6, minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #3A404C", color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Arquivar e começar nova fase</button>}
                                    {open && (
                                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                            <button type="button" onClick={() => { setFaseOpen(null); onRestoreArchive(it.a); }} style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Restaurar</button>
                                            <button type="button" onClick={() => { setFaseOpen(null); onDeleteArchive(it.id); }} style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Apagar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ); })}
                    </div>
                );
            })()}

            {onPrint && (
                <button type="button" onClick={onPrint} style={{ minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" d="M128 40v128M80 120l48 48 48-48M40 208h176" /></svg>
                    Ficha e anamnese em PDF
                </button>
            )}

            {st.assessment && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <button type="button" onClick={() => setAnamOpen(!anamOpen)} aria-expanded={anamOpen} style={{ minHeight: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, border: "none", background: "none", color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                        Anamnese e reavaliações<span aria-hidden="true" style={{ color: C.text4, transform: anamOpen ? "rotate(90deg)" : "none" }}>›</span>
                    </button>
                    {anamOpen && <div style={{ marginTop: 8 }}>
                        <AssessmentSummary assessment={st.assessment} assessmentAt={st.assessmentAt} onRequestNew={() => onSave({ assessmentAt: undefined })} />
                        <ReassessmentHistory student={st} onSave={onSave} />
                    </div>}
                </div>
            )}

            {sheet && (
                <Sheet title={{ nome: "EDITAR · NOME", alerta: "ALERTA CLÍNICO · SÓ VOCÊ VÊ", goal: "EDITAR · OBJETIVO", freq: "EDITAR · FREQUÊNCIA", inicio: "EDITAR · INÍCIO DA FICHA", obs: "OBSERVAÇÕES · " + (first || "O ALUNO").toUpperCase() + " VÊ" }[sheet]} onClose={() => setSheet(null)} onSave={save}>
                    {sheet === "nome" && <input autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} aria-label="Nome do aluno" style={inp} />}
                    {sheet === "alerta" && <textarea autoFocus rows={3} value={draft.clinicalAlert} onChange={(e) => set({ clinicalAlert: e.target.value })} placeholder="Ex.: dor no ombro direito acima de 90°, condromalácia patelar…" aria-label="Alerta clínico" style={inp} />}
                    {sheet === "obs" && <textarea autoFocus rows={4} value={draft.obs} onChange={(e) => set({ obs: e.target.value })} placeholder="Preferências, histórico. O aluno também vê." aria-label="Observações" style={inp} />}
                    {sheet === "inicio" && <input type="date" value={draft.startDate} onChange={(e) => set({ startDate: e.target.value })} aria-label="Início da ficha" style={{ ...inp, colorScheme: "dark" }} />}
                    {sheet === "goal" && (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {GOALS.map((g) => <button key={g} type="button" aria-pressed={draft.goal === g} onClick={() => set({ goal: draft.goal === g ? "" : g })} style={{ ...opt(draft.goal === g), fontSize: 13 }}>{g}</button>)}
                            </div>
                            <input value={GOALS.includes(draft.goal) ? "" : draft.goal} onChange={(e) => set({ goal: e.target.value })} placeholder="Outro objetivo" aria-label="Outro objetivo" style={inp} />
                        </>
                    )}
                    {sheet === "freq" && (
                        <>
                            <span style={kicker}>VEZES NA SEMANA</span>
                            <div style={{ display: "flex", gap: 8 }}>{FREQS.map((n) => <button key={n} type="button" aria-pressed={draft.freq === n} onClick={() => set({ freq: draft.freq === n ? null : n })} style={opt(draft.freq === n)}>{n + "x"}</button>)}</div>
                            <span style={kicker}>TEMPO DE TREINO</span>
                            <div style={{ display: "flex", gap: 8 }}>{DURS.map((n) => <button key={n} type="button" aria-pressed={draft.dur === n} onClick={() => set({ dur: draft.dur === n ? null : n })} style={opt(draft.dur === n)}>{n + " min"}</button>)}</div>
                        </>
                    )}
                </Sheet>
            )}
        </div>
    );
}

export { DadosV3 };
