import React, { useState } from "react";
import { C, DAYS, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { ccConfirm } from "../../utils/confirm";
import { EditVolumeBlock } from "./FichaV3";

// Editar ficha — arrumação pedida pelo professor (16/nov): dias em abas no topo, nome do treino com
// o botão "Trocar treino" à vista (modelo, copiar ou trocar de dia, cardio, salvar como modelo,
// limpar) e o volume da semana recolhido no fim. Antes isso ficava espalhado em cartões e botões.

const kicker = { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", color: C.text4 };
const rowBtn = { width: "100%", minHeight: 52, display: "flex", alignItems: "center", gap: 12, padding: "10px 0", border: "none", background: "none", boxShadow: `inset 0 -1px 0 ${C.line}`, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body };
const nameOf = (dayNames, k) => String((dayNames && dayNames[k]) || "").trim();

function DayTabs({ week, day, dayNames, cardio, doneDays, onPick }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
            {DAYS.map((d) => {
                const on = d.key === day; const n = (week[d.key] || []).length; const cd = cardio && cardio[d.key];
                return (
                    <button key={d.key} type="button" aria-pressed={on} onClick={() => onPick(d.key)} aria-label={d.full + (n ? ", " + n + " exercícios" : cd ? ", cardio" : ", sem treino")}
                        style={{ minHeight: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: F.body, ...(on ? { background: C.text, color: C.bg } : { background: "transparent", color: n || cd ? C.text : C.text4, boxShadow: `inset 0 0 0 1px ${C.line}` }) }}>
                        <span style={{ fontSize: 13, fontWeight: on ? 800 : 600 }}>{d.short}</span>
                        <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 700, color: on ? C.bg : doneDays.has(d.key) ? C.text2 : C.text4 }}>{doneDays.has(d.key) ? "✓" : n ? n : cd ? "cardio" : "·"}</span>
                    </button>
                );
            })}
        </div>
    );
}

function Sheet({ title, onClose, children }) {
    return (
        <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86vh", maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, boxShadow: `inset 0 1px 0 ${C.line}`, padding: "16px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ ...kicker, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
                    <button type="button" onClick={onClose} style={{ flex: "none", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function TrocarSheet({ week, day, dayNames, cardio, templates, onClose, onApplyTemplate, onCopyFrom, onSwapWith, onToggleCardio, onSaveTemplate, onClear, onSerie }) {
    const [step, setStep] = useState(null); // null · "modelo" · "copiar" · "trocar" · "salvar"
    const [tplName, setTplName] = useState(nameOf(dayNames, day));
    const dayFull = (DAYS.find((d) => d.key === day) || {}).full;
    const list = week[day] || [];
    const others = DAYS.filter((d) => d.key !== day);
    const label = (k) => nameOf(dayNames, k) || ((week[k] || []).length ? "Treino" : cardio && cardio[k] ? "Cardio" : "Sem treino");
    const done = (fn) => { haptic("confirm"); fn(); onClose(); };
    const back = <button type="button" onClick={() => setStep(null)} style={{ alignSelf: "flex-start", minHeight: 40, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>‹ Voltar</button>;
    const option = (t, sub, onClick, color) => (
        <button key={t} type="button" onClick={onClick} style={rowBtn}>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: color || C.text }}>{t}</span>
                {sub && <span style={{ fontSize: 13, color: C.text4 }}>{sub}</span>}
            </span>
            <span aria-hidden="true" style={{ color: C.text4 }}>›</span>
        </button>
    );
    const title = "TROCAR TREINO · " + String(dayFull || "").toUpperCase();

    return (
        <Sheet title={title} onClose={onClose}>
            {step === null && (
                <>
                    {option("Aplicar um modelo", templates.length ? "Troca os exercícios de " + dayFull + " pelos do modelo" : "Nenhum modelo salvo ainda — crie na Biblioteca", templates.length ? () => setStep("modelo") : undefined)}
                    {option("Copiar de outro dia", "Repete aqui o treino de outro dia", () => setStep("copiar"))}
                    {option("Trocar com outro dia", "Os dois dias trocam de lugar, com o histórico", () => setStep("trocar"))}
                    {option(cardio && cardio[day] ? "Tirar a marca de cardio" : "Marcar como dia de cardio", "Só pra você planejar — o aluno registra cardio em qualquer dia", () => done(onToggleCardio))}
                    {list.length > 0 && option("Salvar como modelo", "Guarda este dia na Biblioteca", () => setStep("salvar"))}
                    {list.length > 0 && option("Baixar a série", "Imagem da ficha deste dia pra mandar", () => { onClose(); onSerie(); })}
                    {list.length > 0 && option("Limpar o dia", "Tira todos os exercícios; o que já foi registrado vai pras fases arquivadas", async () => { if (await ccConfirm("Os exercícios saem de " + dayFull + ". O que o aluno já registrou fica nas fases arquivadas.", { title: "Limpar " + dayFull + "?", ok: "Limpar", danger: true })) done(onClear); }, C.accent)}
                </>
            )}
            {step === "modelo" && (
                <>
                    {back}
                    {list.length > 0 && <span style={{ fontSize: 13, color: C.text4, lineHeight: 1.4 }}>{"Os " + list.length + " exercícios de hoje saem; o que o aluno já registrou neles vai pras fases arquivadas."}</span>}
                    {templates.map((t) => option(t.name, t.exercises.length + (t.exercises.length === 1 ? " exercício" : " exercícios"), () => done(() => onApplyTemplate(t))))}
                </>
            )}
            {(step === "copiar" || step === "trocar") && (
                <>
                    {back}
                    <span style={{ fontSize: 13, color: C.text4, lineHeight: 1.4 }}>{step === "copiar" ? "O treino escolhido é copiado pra " + dayFull + " (exercícios novos, sem histórico). O dia de origem não muda." : dayFull + " e o dia escolhido trocam de lugar: exercícios, nome e histórico."}</span>
                    {others.map((d) => {
                        const n = (week[d.key] || []).length;
                        const off = step === "copiar" && !n;
                        return option(d.full + " · " + label(d.key), n ? n + (n === 1 ? " exercício" : " exercícios") : "vazio", off ? undefined : () => done(() => (step === "copiar" ? onCopyFrom(d.key) : onSwapWith(d.key))), off ? C.text4 : undefined);
                    })}
                </>
            )}
            {step === "salvar" && (
                <>
                    {back}
                    <input autoFocus value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Nome do modelo" aria-label="Nome do modelo"
                        style={{ boxSizing: "border-box", width: "100%", minHeight: 48, padding: "0 14px", borderRadius: 10, border: "none", outline: "none", background: C.bg, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 15 }} />
                    <button type="button" disabled={!tplName.trim()} onClick={() => done(() => onSaveTemplate(tplName.trim()))}
                        style={{ marginTop: 6, height: 52, borderRadius: 16, border: "none", background: tplName.trim() ? C.text : C.raised, color: tplName.trim() ? C.bg : C.text4, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Salvar modelo</button>
                </>
            )}
        </Sheet>
    );
}

// topo do Editar ficha: abas dos dias + nome do treino + "Trocar treino"
function DayToolsV3(props) {
    const { week, day, dayNames, cardio, doneDays, onPick, onRename } = props;
    const [open, setOpen] = useState(false);
    const dayFull = (DAYS.find((d) => d.key === day) || {}).full;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <DayTabs week={week} day={day} dayNames={dayNames} cardio={cardio} doneDays={doneDays} onPick={onPick} />
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <input value={(dayNames && dayNames[day]) || ""} onChange={(e) => onRename(e.target.value)} placeholder={"Nome do treino de " + dayFull} aria-label={"Nome do treino de " + dayFull}
                    style={{ flex: 1, minWidth: 0, boxSizing: "border-box", minHeight: 48, padding: "0 14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 16, fontWeight: 700 }} />
                <button type="button" onClick={() => { haptic("tick"); setOpen(true); }} style={{ flex: "none", minHeight: 48, padding: "0 14px", borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Trocar treino</button>
            </div>
            {cardio && cardio[day] && <span style={{ fontSize: 13, color: C.text3 }}>Marcado como dia de cardio</span>}
            {open && <TrocarSheet {...props} onClose={() => setOpen(false)} />}
        </div>
    );
}

// volume da semana recolhido no fim do Editar ficha
function VolumeFold({ week, baseline }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ marginTop: 18 }}>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, border: "none", background: "none", color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Séries na semana por músculo<span aria-hidden="true" style={{ color: C.text4, transform: open ? "rotate(90deg)" : "none" }}>›</span>
            </button>
            {open && <EditVolumeBlock week={week} baseline={baseline} />}
        </div>
    );
}

export { DayToolsV3, VolumeFold };
