import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

const QUICK = ["Senti dor", "Carga leve demais", "Carga pesada demais", "Faltei"];
const dayLabel = (iso) => { const d = new Date(iso); const t = new Date(); const same = d.toDateString() === t.toDateString(); return same ? "HOJE" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "").toUpperCase(); };
const time = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// 15d — recados como conversa, separados por dia, com atalhos prontos
function StudentMessages({ messages, onSend, side = "aluno", placeholder, emptyText }) {
    const [text, setText] = useState("");
    const send = (t) => { const v = (t ?? text).trim(); if (!v) return; onSend(v); setText(""); };
    const sorted = [...messages].sort((a, b) => (a.date < b.date ? -1 : 1));
    let lastDay = null;
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
        sorted.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, textAlign: "center", padding: "18px 0" } }, emptyText ?? "Conte ao professor como foi: dor, carga, falta."),
        sorted.map((m) => { const dl = dayLabel(m.date); const head = dl !== lastDay; lastDay = dl; const mine = side === "prof" ? !!m.fromProf : !m.fromProf;
            return React.createElement(React.Fragment, { key: m.id },
                head && React.createElement("div", { style: { textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted } }, dl),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 4 } },
                    React.createElement("span", { style: { maxWidth: "80%", padding: "11px 14px", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontFamily: F.body, fontSize: 15, lineHeight: 1.4, whiteSpace: "pre-wrap", ...(mine ? { background: C.text, color: C.ink } : { background: C.panel, color: C.text, boxShadow: `inset 0 0 0 1px ${C.line}` }) } }, m.text),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: "#5A6273" } }, time(m.date) + (mine && side === "aluno" ? (m.read ? " · lido" : " · enviado") : "")))); }),
        side === "aluno" && React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingTop: 4 } }, QUICK.map((q) => React.createElement("button", { key: q, className: "cc-tap", onClick: () => setText((t) => (t ? t + " " : "") + q + ". "), style: { flexShrink: 0, minHeight: 36, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2A2E37", color: "#C9D0DC", fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, q))),
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } },
            React.createElement("textarea", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }, rows: 1, placeholder: placeholder ?? "Escreva um recado", style: { flex: 1, boxSizing: "border-box", minHeight: 48, padding: 13, borderRadius: 10, border: "none", outline: "none", resize: "none", background: C.panel, boxShadow: "inset 0 0 0 1px #2A2E37", color: C.text, fontFamily: F.body, fontSize: 15, lineHeight: 1.4 } }),
            React.createElement("button", { className: "cc-tap", onClick: () => send(), disabled: !text.trim(), "aria-label": "Enviar", style: { width: 48, height: 48, flexShrink: 0, borderRadius: 10, border: "none", background: text.trim() ? C.text : "#1E222A", color: text.trim() ? C.ink : "#5A6273", fontFamily: F.body, fontWeight: 900, fontSize: 18, cursor: text.trim() ? "pointer" : "default" } }, "\u2191")));
}
export { StudentMessages };
