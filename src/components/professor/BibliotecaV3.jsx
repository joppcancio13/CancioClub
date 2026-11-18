import React, { useState } from "react";
import { C, DAYS, F, KICKER } from "../../styles/tokens";
import { planSummary } from "../../utils/workout";
import { haptic } from "../../utils/misc";
import { TemplateEditorV3, NewTemplateSheet } from "./TemplateEditorV3";
import { MediaEmbed } from "../shared/MediaEmbed";
import { PremiumEmptyState } from "../shared/PremiumEmptyState";
import { BibliotecaExercicios } from "./BibliotecaExercicios";

// Biblioteca — design v3 (README · Professor 8, protótipo 25b): abas Modelos (primeiro) e Exercícios.
// Modelos: cartões que abrem a lista, "Aplicar em um aluno" (escolhe aluno e dia ali mesmo) e "Editar".
// Exercícios: busca que também cria, com quantas fichas usam cada exercício.

const kicker = KICKER;
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const ghost = { border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, cursor: "pointer" };
const norm = (s) => String(s || "").trim().toLowerCase();
const chip = (on) => ({ flex: "none", minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text2, boxShadow: `inset 0 0 0 1px ${C.outline}` }) });
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);

function TplCard({ tpl, open, onToggle, inUse, students, defaultStudent, onApply, onEdit, onRemove }) {
    const [applied, setApplied] = useState(null);
    const [picking, setPicking] = useState(false);
    const [sid, setSid] = useState(defaultStudent || (students[0] && students[0].id));
    const [dk, setDk] = useState(null);
    const [confirmDel, setConfirmDel] = useState(false);
    const st = students.find((s) => s.id === sid);
    const close = () => { setPicking(false); setDk(null); setConfirmDel(false); };
    const sub = (tpl.level && !open ? tpl.level + " · " : "") + (open ? "" : plural(tpl.exercises.length, "exercício", "exercícios") + " · ") + (inUse ? (open ? "em uso · " : "") + plural(inUse, "aluno", "alunos") : "sem uso") + (open ? "" : " ›");
    return (
        <div style={{ borderRadius: 16, background: open ? C.panel : "transparent", boxShadow: open ? "none" : `inset 0 0 0 1px ${C.line}`, overflow: "hidden" }}>
            <button type="button" onClick={() => { close(); setApplied(null); onToggle(); }} aria-expanded={open}
                style={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "14px 16px", border: "none", background: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                <span style={{ fontFamily: open ? F.display : F.body, fontSize: open ? 18 : 15, fontWeight: open ? 900 : 700, fontStretch: open ? "125%" : "100%", minWidth: 0 }}>{open ? tpl.name.toUpperCase() : tpl.name}</span>
                <span style={{ flex: "none", fontFamily: F.body, fontSize: 13, color: C.text3 }}>{sub}</span>
            </button>
            {open && (
                <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {tpl.exercises.map((e, j) => (
                            <div key={j} style={{ display: "flex", gap: 10, padding: "7px 0", boxShadow: `inset 0 1px 0 ${C.line}` }}>
                                <span style={{ width: 20, flex: "none", fontSize: 11, color: C.text3, paddingTop: 3 }}>{String(j + 1).padStart(2, "0")}</span>
                                <span style={{ flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 16, fontWeight: 700, fontStretch: "110%" }}>{e.name}</span>
                                <span style={{ flex: "none", fontSize: 15, fontWeight: 600, fontStretch: "75%", color: C.text2, fontVariantNumeric: "tabular-nums" }}>{planSummary(e)}</span>
                            </div>
                        ))}
                    </div>
                    {applied && !picking && <span role="status" style={{ fontSize: 13, color: C.text2 }}>{"✓ Aplicado em " + applied}</span>}
                    {picking ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={kicker}>ALUNO</span>
                            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                                {students.map((s) => <button key={s.id} type="button" aria-pressed={s.id === sid} onClick={() => setSid(s.id)} style={chip(s.id === sid)}>{s.name.split(" ")[0]}</button>)}
                            </div>
                            <span style={kicker}>DIA DA FICHA</span>
                            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                                {DAYS.map((d) => <button key={d.key} type="button" aria-pressed={d.key === dk} onClick={() => setDk(d.key)} style={chip(d.key === dk)}>{d.short}</button>)}
                            </div>
                            <span style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>Os exercícios entram no fim do dia escolhido — nada da ficha é apagado.</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" disabled={!st || !dk} onClick={() => { haptic("confirm"); onApply(sid, dk); setApplied(st.name.split(" ")[0] + " · " + DAYS.find((d) => d.key === dk).full); close(); }}
                                    style={{ flex: 2, minHeight: 46, borderRadius: 10, border: "none", background: st && dk ? C.text : C.raised, color: st && dk ? C.bg : C.text4, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: st && dk ? "pointer" : "default" }}>
                                    {st && dk ? "Aplicar em " + st.name.split(" ")[0] + " · " + DAYS.find((d) => d.key === dk).full : "Escolha o aluno e o dia"}
                                </button>
                                <button type="button" onClick={close} style={{ ...ghost, flex: 1, minHeight: 46, borderRadius: 10 }}>Cancelar</button>
                            </div>
                        </div>
                    ) : confirmDel ? (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" onClick={() => { haptic("confirm"); onRemove(); }} style={{ ...ghost, flex: 2, minHeight: 46, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent }}>Apagar o modelo</button>
                            <button type="button" onClick={() => setConfirmDel(false)} style={{ ...ghost, flex: 1, minHeight: 46, borderRadius: 10 }}>Manter</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" disabled={!students.length} onClick={() => setPicking(true)} style={{ flex: 2, minHeight: 46, borderRadius: 10, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Aplicar em um aluno</button>
                            <button type="button" onClick={onEdit} style={{ ...ghost, flex: 1, minHeight: 46, borderRadius: 10 }}>Editar</button>
                            <button type="button" onClick={() => setConfirmDel(true)} aria-label="Apagar modelo" style={{ ...ghost, width: 46, flex: "none", minHeight: 46, borderRadius: 10, color: C.text4 }}>
                                <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M216 56H40M104 104v64M152 104v64M200 56v152a8 8 0 0 1-8 8H64a8 8 0 0 1-8-8V56M168 56V40a16 16 0 0 0-16-16h-48a16 16 0 0 0-16 16v16" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function BibliotecaV3({ templates, library, students, workouts, dayNames, defaultStudent, onApplyTemplate, onAddTemplate, onUpdateTemplate, onRemoveTemplate, onAddLib, onUpdateLib, onRemoveLib, onLinkFichas }) {
    const [tab, setTab] = useState("modelos");
    const [openTpl, setOpenTpl] = useState(null);
    const [editing, setEditing] = useState(null); // null · { id } (editar) · { draft } (novo, já com a origem escolhida)
    const [newOpen, setNewOpen] = useState(false); // "+ Novo modelo": de onde começar (41d)

    // uso: modelo = alunos com algum dia batizado com o nome do modelo; exercício = fichas (alunos) que o têm
    const tplUse = (t) => students.filter((s) => Object.values((dayNames || {})[s.id] || {}).some((n) => norm(n) === norm(t.name))).length;

    const editTpl = editing && editing.id ? templates.find((t) => t.id === editing.id) : null;

    if (editing) return (
        <TemplateEditorV3 key={editing.id || "novo"} isNew={!editTpl} initial={editTpl || editing.draft} inUse={editTpl ? tplUse(editTpl) : 0} library={library} onCancel={() => setEditing(null)}
            onSave={(name, exs, level) => { if (editTpl) onUpdateTemplate(editTpl.id, name, exs, level); else onAddTemplate(name, exs, level); setEditing(null); }} />
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", color: C.text }}>
            <div style={{ fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>BIBLIOTECA</div>
            <div role="tablist" style={{ marginTop: 14, alignSelf: "flex-start", display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: C.panel }}>
                {[["modelos", "Modelos"], ["exercicios", "Exercícios"]].map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                        style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: tab === k ? C.text : "transparent", color: tab === k ? C.bg : C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                ))}
            </div>

            {tab === "modelos" && (
                <>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                        {templates.length === 0 && <PremiumEmptyState icon="grid" title="Nenhum modelo salvo ainda." sub="Monte um dia de treino pronto e aplique em qualquer aluno com um toque." />}
                        {templates.map((t) => (
                            <TplCard key={t.id} tpl={t} open={openTpl === t.id} onToggle={() => setOpenTpl(openTpl === t.id ? null : t.id)} inUse={tplUse(t)}
                                students={students} defaultStudent={defaultStudent}
                                onApply={(sid, dk) => onApplyTemplate(t, sid, dk)} onEdit={() => setEditing({ id: t.id })} onRemove={() => { setOpenTpl(null); onRemoveTemplate(t.id); }} />
                        ))}
                    </div>
                    <button type="button" onClick={() => setNewOpen(true)} style={{ ...ghost, marginTop: 12, minHeight: 48, borderRadius: 10, color: C.text2 }}>+ Novo modelo</button>
                    {newOpen && <NewTemplateSheet students={students} workouts={workouts || {}} dayNames={dayNames || {}} templates={templates} onClose={() => setNewOpen(false)} onPick={(draft) => { setNewOpen(false); setEditing({ draft }); }} />}
                </>
            )}

            {tab === "exercicios" && <BibliotecaExercicios library={library} students={students} workouts={workouts} onAddLib={onAddLib} onUpdateLib={onUpdateLib} onRemoveLib={onRemoveLib} onLinkFichas={onLinkFichas} />}
        </div>
    );
}

export { BibliotecaV3 };
