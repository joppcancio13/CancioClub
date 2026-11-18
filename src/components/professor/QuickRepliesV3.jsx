import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Respostas rápidas do professor — design v4 (50c): dois jogos, "Quando o recado é sobre uma série"
// (carga e técnica) e "Recado geral". Cada resposta se edita, sai ou muda de lugar; "Nova resposta"
// pede o grupo. Na conversa aparece o jogo certo para o contexto do último recado do aluno.

const DEFAULT_REPLIES = {
    serie: ["Tira 2,5 kg", "Sobe 2,5 kg", "Capricha na técnica, sem pressa", "Para e me chama"],
    geral: ["Boa, segue assim", "Amanhã a gente ajusta", "Me chama quando chegar"],
};
const GROUPS = [["serie", "Quando o recado é sobre uma série"], ["geral", "Recado geral"]];
const repliesOf = (data) => { const q = data && data.quickReplies; return { serie: (q && Array.isArray(q.serie)) ? q.serie : DEFAULT_REPLIES.serie, geral: (q && Array.isArray(q.geral)) ? q.geral : DEFAULT_REPLIES.geral }; };

function QuickRepliesV3({ replies, onChange, onBack }) {
    const [edit, setEdit] = useState(null); // { g, i (null = nova), text }
    const set = (g, list) => onChange({ ...replies, [g]: list });
    const move = (g, i, d) => { const l = [...replies[g]]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; haptic("tick"); set(g, l); };
    const save = () => { const t = (edit.text || "").trim(); if (!t) { setEdit(null); return; } const l = [...replies[edit.g]]; if (edit.i == null) l.push(t); else l[edit.i] = t; set(edit.g, l); haptic("confirm"); setEdit(null); };
    const small = { width: 40, height: 44, flex: "none", border: "none", background: "none", color: C.text3, fontSize: 16, cursor: "pointer" };
    return (
        <div style={{ display: "flex", flexDirection: "column", color: C.text, fontFamily: F.body }}>
            <button type="button" onClick={onBack} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>‹ Mais</button>
            <span style={{ fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>RESPOSTAS RÁPIDAS</span>
            <span style={{ marginTop: 8, fontSize: 15, color: C.text3, lineHeight: 1.45 }}>Aparecem na conversa com o aluno. Quando o último recado dele é sobre uma série, entram as do primeiro grupo.</span>
            {GROUPS.map(([g, label]) => (
                <div key={g} style={{ marginTop: 22, display: "flex", flexDirection: "column" }}>
                    <span style={KICKER}>{label}</span>
                    {replies[g].map((t, i) => (
                        <div key={g + i} style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 52, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                            {edit && edit.g === g && edit.i === i ? (
                                <input autoFocus value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} onBlur={save} onKeyDown={(e) => e.key === "Enter" && save()} aria-label="Texto da resposta"
                                    style={{ flex: 1, minWidth: 0, minHeight: 44, padding: "0 12px", borderRadius: 10, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15 }} />
                            ) : (
                                <button type="button" onClick={() => setEdit({ g, i, text: t })} aria-label={"Editar: " + t} style={{ flex: 1, minWidth: 0, minHeight: 44, padding: 0, border: "none", background: "none", color: C.text, textAlign: "left", fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>{t}</button>
                            )}
                            <button type="button" onClick={() => move(g, i, -1)} disabled={i === 0} aria-label={"Subir " + t} style={{ ...small, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                            <button type="button" onClick={() => move(g, i, 1)} disabled={i === replies[g].length - 1} aria-label={"Descer " + t} style={{ ...small, opacity: i === replies[g].length - 1 ? 0.3 : 1 }}>↓</button>
                            <button type="button" onClick={() => set(g, replies[g].filter((_, k) => k !== i))} aria-label={"Apagar " + t} style={small}>×</button>
                        </div>
                    ))}
                    {edit && edit.g === g && edit.i == null && (
                        <input autoFocus value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} onBlur={save} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="Escreva a resposta" aria-label="Nova resposta"
                            style={{ marginTop: 8, minHeight: 48, padding: "0 12px", borderRadius: 10, border: "none", outline: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15 }} />
                    )}
                    <button type="button" onClick={() => setEdit({ g, i: null, text: "" })} style={{ marginTop: 8, alignSelf: "flex-start", minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nova resposta</button>
                </div>
            ))}
        </div>
    );
}

export { QuickRepliesV3, DEFAULT_REPLIES, repliesOf };
