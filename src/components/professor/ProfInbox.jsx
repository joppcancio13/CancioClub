import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { PremiumEmptyState } from "../shared/PremiumEmptyState";
import { StudentMessages } from "../student/StudentMessages";

const when = (iso) => { const d = new Date(iso); const t = new Date(); return d.toDateString() === t.toDateString() ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(/\./g, ""); };

// Recados do professor: lista de conversas por aluno → abre a conversa com campo de resposta
function ProfInbox({ messages, students, onReply, onOpen, initialOpen }) {
    const [openId, setOpenId] = useState(initialOpen || null);
    const by = {};
    messages.forEach((m) => { (by[m.studentId] = by[m.studentId] || []).push(m); });
    const threads = Object.keys(by).map((sid) => { const ms = by[sid]; const last = ms.reduce((a, b) => (a.date > b.date ? a : b)); return { sid, ms, last, unread: ms.filter((m) => !m.read && !m.fromProf).length, st: students.find((x) => x.id === sid) }; }).sort((a, b) => (a.last.date < b.last.date ? 1 : -1));
    const open = threads.find((t) => t.sid === openId);
    const name = (t) => (t.st ? t.st.name : "Aluno removido");
    if (open) return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("button", { className: "cc-tap", onClick: () => setOpenId(null), "aria-label": "Voltar", style: { width: 44, height: 44, flexShrink: 0, borderRadius: 10, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.text, fontSize: 18, cursor: "pointer" } }, "\u2190"),
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, name(open))),
        React.createElement(StudentMessages, { messages: open.ms, side: "prof", onSend: (t) => onReply(t, open.sid), placeholder: "Responder " + name(open).split(" ")[0], emptyText: "" }));
    if (threads.length === 0) return React.createElement(PremiumEmptyState, { icon: "message", title: "Nenhum recado por aqui.", sub: "Os alunos mandam recado direto da \u00E1rea deles \u2014 vai aparecer aqui." });
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, threads.map((t) => React.createElement("button", { key: t.sid, className: "cc-tap", onClick: () => { setOpenId(t.sid); if (t.unread) onOpen(t.sid); }, style: { display: "flex", alignItems: "center", gap: 12, minHeight: 64, textAlign: "left", padding: "12px 14px", borderRadius: 16, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${t.unread ? "#B9C6D9" : C.line}`, cursor: "pointer" } },
        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
            React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } },
                React.createElement("div", { style: { flex: 1, fontFamily: F.body, fontWeight: t.unread ? 700 : 600, fontSize: 15, color: C.text } }, name(t)),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, when(t.last.date))),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: t.unread ? C.text : C.muted, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, (t.last.fromProf ? "Voc\u00EA: " : "") + t.last.text)),
        t.unread > 0 && React.createElement("span", { style: { minWidth: 22, height: 22, padding: "0 7px", boxSizing: "border-box", borderRadius: 10, background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center" } }, t.unread))));
}
export { ProfInbox };
