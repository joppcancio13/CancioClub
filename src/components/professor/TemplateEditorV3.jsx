import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { planSummary } from "../../utils/workout";
import { ExerciseSheet } from "./ExerciseSheet";
import { CreateExercise } from "./CreateExercise";

// Editor de modelo — design v4 (41d): nome, Para quem (Iniciante / Intermediário / Avançado), o aviso
// "Aplicado em N alunos. Mudar aqui não muda as fichas deles.", a lista com o tempo estimado e
// "Salvar modelo". Adicionar usa a mesma gaveta do Editar ficha (biblioteca + catálogo + criar do zero).

const LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const estimate = (exs) => { const sec = exs.reduce((n, e) => n + (parseInt(e.sets) || 3) * (45 + (parseInt(e.rest) || 90)), 0); return sec ? "~" + Math.round(sec / 60) + " min" : ""; };

function TemplateEditorV3({ initial, inUse = 0, library, isNew, onSave, onCancel }) {
    const [name, setName] = useState((initial && initial.name) || "");
    const [level, setLevel] = useState((initial && initial.level) || "Intermediário");
    const [exs, setExs] = useState((initial && initial.exercises) || []);
    const [sheet, setSheet] = useState(false);
    const [creating, setCreating] = useState(null);
    const can = name.trim() && exs.length;
    const add = (o) => { setExs((l) => [...l, { name: o.name, sets: o.sets, reps: o.reps, rest: o.rest, note: o.note, url: o.url, catalogId: o.catalogId, setPlan: o.setPlan || undefined }]); setSheet(false); setCreating(null); };
    const move = (i, d) => setExs((l) => { const a = [...l]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
    const inp = { boxSizing: "border-box", width: "100%", minHeight: 52, padding: "0 14px", borderRadius: 12, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 16 };
    const small = { width: 36, height: 44, flex: "none", border: "none", background: "none", color: C.text3, fontSize: 16, cursor: "pointer" };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 110, color: C.text, fontFamily: F.body }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={onCancel} aria-label="Voltar" style={{ minHeight: 44, padding: "0 10px 0 0", border: "none", background: "none", color: C.text3, fontSize: 20, cursor: "pointer" }}>‹</button>
                <span style={KICKER}>{"Biblioteca · " + (isNew ? "novo modelo" : "editar modelo")}</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "125%", overflowWrap: "anywhere" }}>{(name.trim() || "Modelo").toUpperCase()}</span>
            <span style={KICKER}>Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Inferiores A" aria-label="Nome do modelo" style={inp} />
            <span style={{ ...KICKER, marginTop: 6 }}>Para quem</span>
            <div style={{ display: "flex", gap: 6 }}>
                {LEVELS.map((l) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} style={{ flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: level === l ? C.text : C.panel, color: level === l ? C.bg : C.text, fontFamily: F.body, fontSize: 13, fontWeight: level === l ? 800 : 600, cursor: "pointer" }}>{l}</button>)}
            </div>
            {inUse > 0 && <span style={{ marginTop: 4, padding: "10px 12px", borderRadius: 12, background: C.panel, fontSize: 13, color: C.text2 }}>{"Aplicado em " + inUse + (inUse === 1 ? " aluno" : " alunos") + ". Mudar aqui não muda as fichas deles."}</span>}
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={KICKER}>{"Exercícios · " + exs.length}</span>
                <span style={{ fontSize: 13, color: C.text3 }}>{estimate(exs)}</span>
            </div>
            {exs.length === 0 && <span style={{ fontSize: 15, color: C.text3 }}>Modelo vazio. Adicione exercícios da biblioteca ou do catálogo.</span>}
            <div style={{ display: "flex", flexDirection: "column" }}>
                {exs.map((e, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 56, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                        <span style={{ width: 22, flex: "none", fontSize: 13, color: C.text3, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, fontStretch: "110%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</span>
                            <span style={{ fontSize: 13, color: C.text3 }}>{planSummary(e) + (e.catalogId ? "" : " · fora do volume")}</span>
                        </span>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={"Subir " + e.name} style={{ ...small, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === exs.length - 1} aria-label={"Descer " + e.name} style={{ ...small, opacity: i === exs.length - 1 ? 0.3 : 1 }}>↓</button>
                        <button type="button" onClick={() => setExs((l) => l.filter((_, k) => k !== i))} aria-label={"Tirar " + e.name} style={small}>×</button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => setSheet(true)} style={{ marginTop: 6, minHeight: 52, borderRadius: 12, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ Adicionar exercício</button>
            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 96, padding: "12px 20px calc(16px + env(safe-area-inset-bottom, 0px))", background: `linear-gradient(to top, ${C.bg} 70%, transparent)`, display: "flex", justifyContent: "center" }}>
                <button type="button" disabled={!can} onClick={() => { haptic("confirm"); onSave(name.trim(), exs, level); }} style={{ width: "100%", maxWidth: 580, height: 56, borderRadius: 16, border: "none", background: can ? C.text : C.raised, color: can ? C.bg : C.text4, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: can ? "pointer" : "default" }}>Salvar modelo</button>
            </div>
            {sheet && <ExerciseSheet mode="add" dayList={exs} week={{}} library={library} dayLabel={name.trim() || "modelo"} onAdd={add} onManual={(q) => { setSheet(false); setCreating({ name: q }); }} onClose={() => setSheet(false)} />}
            {creating && <CreateExercise initialName={creating.name} dayLabel="Modelo" onCancel={() => setCreating(null)} onAdd={add} />}
        </div>
    );
}

// "+ Novo modelo" (41d): começa de um dia da ficha de um aluno, de outro modelo ou de uma página em branco
function NewTemplateSheet({ students, workouts, dayNames, templates, onPick, onClose }) {
    const [step, setStep] = useState(null); // null · "aluno" · "modelo"
    const [sid, setSid] = useState(null);
    const DK = [["seg", "Segunda"], ["ter", "Terça"], ["qua", "Quarta"], ["qui", "Quinta"], ["sex", "Sexta"], ["sab", "Sábado"], ["dom", "Domingo"]];
    const clean = (e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, note: e.note, url: e.url, catalogId: e.catalogId, setPlan: e.setPlan }); // sem cargas nem histórico
    const row = (t, sub, onClick, key) => (
        <button key={key || t} type="button" onClick={onClick} style={{ minHeight: 60, display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderRadius: 14, border: "none", background: C.bg, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{t}</span>{sub && <span style={{ fontSize: 13, color: C.text3 }}>{sub}</span>}</span>
            <span aria-hidden="true" style={{ color: C.text3 }}>›</span>
        </button>
    );
    return (
        <div role="dialog" aria-modal="true" aria-label="Novo modelo" style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, padding: "12px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 8, maxHeight: "86vh", overflowY: "auto" }}>
                <span aria-hidden="true" style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, background: C.raised }} />
                <span style={{ marginTop: 8, fontFamily: F.display, fontSize: 20, fontWeight: 800, fontStretch: "110%" }}>{step === "aluno" ? (sid ? "Qual dia?" : "De qual aluno?") : step === "modelo" ? "Qual modelo?" : "Novo modelo"}</span>
                {step === null && (
                    <>
                        {row("Um dia da ficha de um aluno", "Escolhe o aluno e o dia", () => setStep("aluno"))}
                        {templates.length > 0 && row("Outro modelo", "Duplica e ajusta", () => setStep("modelo"))}
                        {row("Página em branco", "Começa do zero", () => onPick({ name: "", exercises: [] }))}
                    </>
                )}
                {step === "aluno" && !sid && students.map((s) => row(s.name, null, () => setSid(s.id), s.id))}
                {step === "aluno" && sid && DK.filter(([k]) => ((workouts[sid] || {})[k] || []).length).map(([k, l]) => row(l + " · " + (((dayNames[sid] || {})[k]) || "Treino"), ((workouts[sid] || {})[k] || []).length + " exercícios · sem as cargas do aluno", () => onPick({ name: ((dayNames[sid] || {})[k]) || "", exercises: ((workouts[sid] || {})[k] || []).map(clean) }), k))}
                {step === "modelo" && templates.map((t) => row(t.name, t.exercises.length + " exercícios", () => onPick({ name: t.name + " (cópia)", level: t.level, exercises: t.exercises.map(clean) }), t.id))}
                {step !== null && <button type="button" onClick={() => (sid ? setSid(null) : setStep(null))} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>‹ Voltar</button>}
            </div>
        </div>
    );
}

export { TemplateEditorV3, NewTemplateSheet, LEVELS };
