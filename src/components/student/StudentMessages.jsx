import React, { useState } from "react";
import { C, F, SILVER, KICKER } from "../../styles/tokens";

// Conversa aluno ↔ professor — design v3 (README · Recados: balões, faixa de contexto da série,
// eventos de treino na linha do tempo, respostas rápidas). Usada dos dois lados (`side`).

const QUICK = { aluno: ["Senti dor", "Carga leve demais", "Carga pesada demais", "Faltei"], prof: ["Para e me chama", "Tira 2,5 kg", "Boa, segue assim"] };
const dayLabel = (iso) => { const d = new Date(iso); const t = new Date(); return d.toDateString() === t.toDateString() ? "HOJE" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "").toUpperCase(); };
const time = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
// recado mandado pelo "Recado sobre esta série" vem como "Exercício · Série 1 · 40 kg × 9 — texto"
const splitContext = (text) => { const m = String(text || "").match(/^(.+? · .+?) — ([\s\S]+)$/); return m ? { link: m[1], body: m[2] } : { link: null, body: text }; };
const kicker = KICKER;

function StudentMessages({ messages, onSend, side = "aluno", placeholder, emptyText, events = [] }) {
    const [text, setText] = useState("");
    const send = (t) => { const v = (t ?? text).trim(); if (!v) return; onSend(v); setText(""); };
    const items = [...messages.map((m) => ({ kind: "msg", date: m.date, m })), ...events.map((e) => ({ kind: "event", date: e.date, e }))].sort((a, b) => (a.date < b.date ? -1 : 1));
    let lastDay = null;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.length === 0 && <div style={{ fontFamily: F.body, fontSize: 13, color: C.text3, textAlign: "center", padding: "18px 0" }}>{emptyText ?? "Conte ao professor como foi: dor, carga, falta."}</div>}
            {items.map((it) => {
                const dl = dayLabel(it.date); const head = dl !== lastDay; lastDay = dl;
                const headEl = head && <div style={{ ...kicker, textAlign: "center", color: C.text4, paddingTop: 4 }}>{dl}</div>;
                if (it.kind === "event") return (
                    <React.Fragment key={"e" + it.e.id}>
                        {headEl}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.text3 }}>
                            <span aria-hidden="true" style={{ width: 14, height: 14, flex: "none", borderRadius: 3, backgroundImage: SILVER }} />
                            <span style={{ flex: 1, minWidth: 0 }}>{it.e.text}</span>
                            {it.e.right && <span>{it.e.right}</span>}
                        </div>
                    </React.Fragment>
                );
                const m = it.m; const mine = side === "prof" ? !!m.fromProf : !m.fromProf; const { link, body } = splitContext(m.text);
                return (
                    <React.Fragment key={m.id}>
                        {headEl}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 4 }}>
                            <div style={{ maxWidth: "84%", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", overflow: "hidden", ...(mine ? { background: C.text, color: C.bg } : { background: C.panel, color: C.text }) }}>
                                {link && <div style={{ ...kicker, padding: "8px 14px", background: "#DCE4F0", color: C.bg, fontVariantNumeric: "tabular-nums" }}>{link}</div>}
                                <div style={{ padding: "11px 14px", fontFamily: F.body, fontSize: 15, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{body}</div>
                            </div>
                            <span style={{ fontFamily: F.body, fontSize: 11, color: C.text3 }}>{time(m.date) + (mine && side === "aluno" ? (m.read ? " · lido" : " · enviado") : "")}</span>
                        </div>
                    </React.Fragment>
                );
            })}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingTop: 6 }}>
                {QUICK[side].map((q) => (
                    <button key={q} type="button" onClick={() => (side === "prof" ? send(q) : setText((t) => (t ? t + " " : "") + q + ". "))}
                        style={{ flex: "none", minHeight: 44, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${q === "Senti dor" ? C.accentLine : C.outline}`, color: q === "Senti dor" ? C.accent : C.text, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>{q}</button>
                ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1}
                    placeholder={placeholder ?? "Escreva um recado"} aria-label={placeholder ?? "Escreva um recado"}
                    style={{ flex: 1, boxSizing: "border-box", minHeight: 48, padding: 13, borderRadius: 10, border: "none", outline: "none", resize: "none", background: C.panel, color: C.text, fontFamily: F.body, fontSize: 15, lineHeight: 1.4 }} />
                <button type="button" onClick={() => send()} disabled={!text.trim()} aria-label="Enviar"
                    style={{ width: 48, height: 48, flex: "none", borderRadius: 10, border: "none", background: text.trim() ? C.text : C.raised, color: text.trim() ? C.bg : C.text4, cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" d="M128 216V40M56 112l72-72 72 72" /></svg>
                </button>
            </div>
        </div>
    );
}

export { StudentMessages, splitContext };
