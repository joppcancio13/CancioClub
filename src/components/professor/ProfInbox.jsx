import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { PremiumEmptyState } from "../shared/PremiumEmptyState";
import { StudentMessages, splitContext } from "../student/StudentMessages";

// Recados do professor — design v3 (README · Professor 7 "Recados" e "Conversa"): contador de não
// lidos, lista de conversas por aluno e a conversa no mesmo padrão de balões do app da aluna.

const when = (iso) => { const d = new Date(iso); const t = new Date(); return d.toDateString() === t.toDateString() ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(/\./g, ""); };
const initials = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
const kicker = { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", textTransform: "uppercase", color: C.text4 };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };

function ProfInbox({ messages, students, onReply, onOpen, initialOpen, eventsFor, onOpenFicha }) {
    const [openId, setOpenId] = useState(initialOpen || null);
    const by = {};
    messages.forEach((m) => { (by[m.studentId] = by[m.studentId] || []).push(m); });
    const threads = Object.keys(by).map((sid) => { const ms = by[sid]; const last = ms.reduce((a, b) => (a.date > b.date ? a : b)); return { sid, ms, last, unread: ms.filter((m) => !m.read && !m.fromProf).length, st: students.find((x) => x.id === sid) }; }).sort((a, b) => (a.last.date < b.last.date ? 1 : -1));
    const open = threads.find((t) => t.sid === openId);
    const name = (t) => (t.st ? t.st.name : "Aluno removido");

    if (open) return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                <button type="button" onClick={() => setOpenId(null)} aria-label="Voltar" style={{ minHeight: 44, padding: "0 10px 0 0", border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>‹</button>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{initials(name(open))}</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: F.body, fontWeight: 700, fontSize: 15 }}>{name(open)}</span>
                {open.st && onOpenFicha && <button type="button" onClick={() => onOpenFicha(open.sid)} style={{ minHeight: 44, padding: 0, border: "none", background: "none", color: C.text2, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Abrir ficha ›</button>}
            </div>
            <StudentMessages messages={open.ms} side="prof" events={eventsFor ? eventsFor(open.sid) : []} onSend={(t) => onReply(t, open.sid)} placeholder={"Responder " + name(open).split(" ")[0]} emptyText="Nenhum recado ainda." />
        </div>
    );

    const unreadN = threads.reduce((n, t) => n + t.unread, 0);
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={kicker}>{unreadN ? unreadN + (unreadN === 1 ? " não lido" : " não lidos") : "Tudo lido"}</span>
            <div style={{ marginTop: 6, fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>RECADOS</div>
            {threads.length === 0 && <div style={{ marginTop: 20 }}><PremiumEmptyState icon="message" title="Nenhum recado por aqui." sub="Os alunos mandam recado direto da área deles — vai aparecer aqui." /></div>}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
                {threads.map((t) => {
                    const { link, body } = splitContext(t.last.text);
                    return (
                        <button key={t.sid} type="button" onClick={() => { setOpenId(t.sid); if (t.unread) onOpen(t.sid); }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", border: "none", ...divider, color: C.text, textAlign: "left", cursor: "pointer" }}>
                            <span style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{initials(name(t))}</span>
                            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                    <span style={{ flex: 1, minWidth: 0, fontFamily: F.body, fontSize: 15, fontWeight: t.unread ? 700 : 600 }}>{name(t)}</span>
                                    <span style={{ fontSize: 11, color: C.text4 }}>{when(t.last.date)}</span>
                                </span>
                                <span style={{ fontSize: 13, color: t.unread ? C.text : C.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {(t.last.fromProf ? "Você: " : "") + (link ? link + " — " : "") + body}
                                </span>
                            </span>
                            {t.unread > 0 && <span aria-label={t.unread + " não lidos"} style={{ width: 8, height: 8, flex: "none", borderRadius: "50%", background: C.text }} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export { ProfInbox };
