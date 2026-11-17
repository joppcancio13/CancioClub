import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { exerciseCatalog } from "../../data/exerciseCatalog";
import { tokenize } from "../../utils/catalogMatch";
import { groupActivation, fmtVol } from "../../utils/volumeCalculator";

// Criar exercício do zero — design v4 (40b), em dois passos:
// 1) o nome, com "NO CATÁLOGO, PARECIDOS" enquanto digita; escolher um já vincula ao volume e
//    "Nenhum desses" deixa fora do volume até vincular. Continuar só com nome e escolha.
// 2) "Conta como …" ou "Fora do volume", prescrição em steppers (séries, reps, descanso de 15 em 15 s),
//    observação e link do vídeo. O botão final é "Adicionar ao [dia]".

const CAT = Object.values(exerciseCatalog);
const groupsLine = (e) => Object.entries(groupActivation(e)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, v]) => g + " " + fmtVol(v)).join(" · ");
function similar(name) {
    const a = new Set(tokenize(name)); if (!a.size) return [];
    return CAT.map((e) => { const b = new Set(tokenize(e.nome)); let inter = 0; a.forEach((t) => { if (b.has(t) || [...b].some((x) => x.startsWith(t) || t.startsWith(x))) inter++; }); return { e, sc: inter / (a.size + b.size - inter || 1) }; })
        .filter((x) => x.sc > 0).sort((x, y) => y.sc - x.sc).slice(0, 3).map((x) => x.e);
}
const mmss = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

function CreateExercise({ initialName = "", dayLabel, onCancel, onAdd }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(initialName);
    const [link, setLink] = useState(undefined); // catalogId · null = "Nenhum desses" · undefined = ainda não escolheu
    const [f, setF] = useState({ sets: 3, reps: 10, rest: 90, note: "", url: "" });
    const sug = similar(name);
    const entry = link ? exerciseCatalog[link] : null;
    const canNext = step === 1 ? name.trim() && link !== undefined : true;
    const next = () => {
        if (!canNext) return; haptic("confirm");
        if (step === 1) { setStep(2); return; }
        onAdd({ name: name.trim(), catalogId: link || undefined, sets: f.sets, reps: String(f.reps), rest: f.rest, note: f.note.trim() || undefined, url: f.url.trim() || undefined });
    };
    const inp = { boxSizing: "border-box", width: "100%", minHeight: 52, padding: "0 14px", borderRadius: 12, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 16 };
    const stepper = (label, v, minus, plus) => (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: 4, borderRadius: 12, background: C.panel }}>
                <button type="button" onClick={minus} aria-label={"Diminuir " + label} style={{ width: 40, height: 44, flex: "none", borderRadius: 8, border: "none", background: C.raised, color: C.text, fontSize: 18, cursor: "pointer" }}>−</button>
                <span style={{ flex: 1, textAlign: "center", fontFamily: F.display, fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                <button type="button" onClick={plus} aria-label={"Aumentar " + label} style={{ width: 40, height: 44, flex: "none", borderRadius: 8, border: "none", background: C.raised, color: C.text, fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
            <span style={{ fontSize: 13, color: C.text3, textAlign: "center" }}>{label}</span>
        </div>
    );
    const choice = (on, t, sub, onClick, key) => (
        <button key={key} type="button" aria-pressed={on} onClick={onClick} style={{ minHeight: 60, display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderRadius: 14, border: "none", background: on ? C.raised : C.panel, boxShadow: on ? `inset 0 0 0 1.5px ${C.text}` : "none", color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{t}</span>{sub && <span style={{ fontSize: 13, color: C.text3 }}>{sub}</span>}</span>
            <span aria-hidden="true" style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", boxShadow: on ? "none" : "inset 0 0 0 1.5px #3A404C", background: on ? C.text : "transparent" }} />
        </button>
    );
    return (
        <div role="dialog" aria-modal="true" aria-label="Novo exercício" style={{ position: "fixed", inset: 0, zIndex: 110, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", boxSizing: "border-box", padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 140px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={() => (step === 2 ? setStep(1) : onCancel())} aria-label="Voltar" style={{ minHeight: 44, padding: "0 10px 0 0", border: "none", background: "none", color: C.text3, fontSize: 20, cursor: "pointer" }}>‹</button>
                    <span style={KICKER}>{"Criar do zero · passo " + step + " de 2"}</span>
                </div>
                {step === 1 ? (
                    <>
                        <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "125%" }}>NOVO EXERCÍCIO</span>
                        <span style={KICKER}>Nome</span>
                        <input autoFocus value={name} onChange={(e) => { setName(e.target.value); if (link) setLink(undefined); }} placeholder="Ex.: Remada no cabo" aria-label="Nome do exercício" style={inp} />
                        {name.trim() && (
                            <>
                                <span style={{ ...KICKER, marginTop: 8 }}>No catálogo, parecidos</span>
                                {sug.map((e) => choice(link === e.id, e.nome, groupsLine(e), () => setLink(e.id), e.id))}
                                {choice(link === null, "Nenhum desses", "Fica fora da conta de volume até você vincular", () => setLink(null), "none")}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "125%", overflowWrap: "anywhere" }}>{name.trim().toUpperCase()}</span>
                        <span style={{ fontSize: 15, color: entry ? C.text2 : C.accent }}>{entry ? "Conta como " + entry.nome + " · " + groupsLine(entry) : "Fora do volume"}</span>
                        <span style={{ ...KICKER, marginTop: 8 }}>Prescrição</span>
                        <div style={{ display: "flex", gap: 8 }}>
                            {stepper("séries", f.sets, () => setF({ ...f, sets: Math.max(1, f.sets - 1) }), () => setF({ ...f, sets: Math.min(10, f.sets + 1) }))}
                            {stepper("reps", f.reps, () => setF({ ...f, reps: Math.max(1, f.reps - 1) }), () => setF({ ...f, reps: Math.min(50, f.reps + 1) }))}
                            {stepper("descanso", mmss(f.rest), () => setF({ ...f, rest: Math.max(15, f.rest - 15) }), () => setF({ ...f, rest: Math.min(600, f.rest + 15) }))}
                        </div>
                        <span style={{ ...KICKER, marginTop: 8 }}>Observação</span>
                        <input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Ex.: cotovelo junto ao corpo" aria-label="Observação" style={inp} />
                        <span style={{ ...KICKER, marginTop: 8 }}>Vídeo</span>
                        <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="Cole o link do vídeo (opcional)" aria-label="Link do vídeo" inputMode="url" style={inp} />
                    </>
                )}
            </div>
            <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "12px 20px calc(16px + env(safe-area-inset-bottom, 0px))", background: `linear-gradient(to top, ${C.bg} 70%, transparent)`, display: "flex", justifyContent: "center" }}>
                <button type="button" disabled={!canNext} onClick={next} style={{ width: "100%", maxWidth: 580, height: 56, borderRadius: 16, border: "none", background: canNext ? C.text : C.raised, color: canNext ? C.bg : C.text4, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: canNext ? "pointer" : "default" }}>{step === 1 ? "Continuar" : "Adicionar " + (dayLabel ? (["Sábado", "Domingo"].includes(dayLabel) ? "no " : "na ") + dayLabel.toLowerCase() : "ao dia")}</button>
            </div>
        </div>
    );
}

export { CreateExercise };
