import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { C, F, SILVER, KICKER } from "../../styles/tokens";
import { Face } from "../shared/Face";

// Conversa aluno ↔ professor — design v3 (README · Recados: balões, faixa de contexto da série,
// eventos de treino na linha do tempo, respostas rápidas). Usada dos dois lados (`side`).

const QUICK = { aluno: ["Senti dor", "Carga leve demais", "Carga pesada demais", "Faltei"], prof: ["Para e me chama", "Tira 2,5 kg", "Boa, segue assim"] };
const dayLabel = (iso) => { const d = new Date(iso); const t = new Date(); return d.toDateString() === t.toDateString() ? "HOJE" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "").toUpperCase(); };
const time = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
// recado mandado pelo "Recado sobre esta série" vem como "Exercício · Série 1 · 40 kg × 9 — texto"
const splitContext = (text) => { const m = String(text || "").match(/^(.+? · .+?) — ([\s\S]+)$/); return m ? { link: m[1], body: m[2] } : { link: null, body: text }; };
const kicker = KICKER;

// a caixa de escrever fica sempre embaixo (logo acima das abas), com 1 ou 100 recados: a conversa
// ocupa a altura da tela e a caixa gruda no rodapé ao rolar. Abre já no recado mais novo.
const COMPOSER_BOTTOM = "calc(env(safe-area-inset-bottom, 0px) + 92px)";

function StudentMessages({ messages, onSend, side = "aluno", placeholder, emptyText, events = [], quick, pinned, onEditPin, otherPhoto, otherName, docked = false }) {
    const [text, setText] = useState("");
    const boxRef = useRef(null);
    const [minH, setMinH] = useState(0);
    useLayoutEffect(() => {
        const fit = () => { const el = boxRef.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY; setMinH(Math.max(0, window.innerHeight - top - 100)); };
        if (!docked) return undefined;
        fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
    }, [docked]);
    const count = messages.length;
    const seen = useRef(0);
    useEffect(() => { if (docked && count > seen.current) { const first = seen.current === 0; seen.current = count; requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: first ? "auto" : "smooth" })); } }, [count]);
    const send = (t) => { const v = (t ?? text).trim(); if (!v) return; onSend(v); setText(""); };
    const items = [...messages.map((m) => ({ kind: "msg", date: m.date, m })), ...events.map((e) => ({ kind: "event", date: e.date, e }))].sort((a, b) => (a.date < b.date ? -1 : 1));
    let lastDay = null;
    return (
        <div ref={boxRef} style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: docked && minH ? minH : undefined, marginBottom: docked ? -98 : undefined }}>
            {/* recado fixado (v4): o combinado do professor fica no topo da conversa, dos dois lados */}
            {pinned ? (
                <button type="button" onClick={onEditPin || undefined} disabled={!onEditPin} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 14, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.text, textAlign: "left", cursor: onEditPin ? "pointer" : "default", fontFamily: F.body }}>
                    <span style={{ ...kicker, color: C.text3 }}>Combinado · fixado pelo professor</span>
                    <span style={{ fontSize: 15, lineHeight: 1.4, color: C.text, whiteSpace: "pre-wrap" }}>{pinned}</span>
                </button>
            ) : onEditPin ? (
                // sem combinado: só um atalho de uma linha (a caixa grande vazia ocupava o topo da conversa)
                <button type="button" onClick={onEditPin} style={{ alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Fixar um combinado</button>
            ) : null}
            {items.length === 0 && <div style={{ fontFamily: F.body, fontSize: 13, color: C.text3, textAlign: "center", padding: "18px 0" }}>{emptyText ?? "Conte ao professor como foi: dor, carga, falta."}</div>}
            {items.map((it, idx) => {
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
                // foto só no último balão de uma sequência do outro lado (como nos apps de conversa)
                const nx = items[idx + 1]; const nxOther = nx && nx.kind === "msg" && (side === "prof" ? !nx.m.fromProf : !!nx.m.fromProf) && dayLabel(nx.date) === dayLabel(it.date);
                const showFace = !mine && (otherPhoto || otherName) && !nxOther;
                const face = !mine && (otherPhoto || otherName);
                return (
                    <React.Fragment key={m.id}>
                        {headEl}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, justifyContent: mine ? "flex-end" : "flex-start" }}>
                        {face && <span style={{ marginBottom: 22, width: 28, flex: "none" }}>{showFace && <Face src={otherPhoto} name={otherName} size={28} />}</span>}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 4 }}>
                            <div style={{ maxWidth: face ? "90%" : "84%", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", overflow: "hidden", ...(mine ? { background: C.text, color: C.bg } : { background: C.panel, color: C.text }) }}>
                                {link && <div style={{ ...kicker, padding: "8px 14px", background: "#DCE4F0", color: C.bg, fontVariantNumeric: "tabular-nums" }}>{link}</div>}
                                <div style={{ padding: "11px 14px", fontFamily: F.body, fontSize: 15, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{body}</div>
                            </div>
                            <span style={{ fontFamily: F.body, fontSize: 11, color: C.text3 }}>{time(m.date) + (mine && side === "aluno" ? (m.read ? " · lido" : " · enviado") : "")}</span>
                        </div>
                        </div>
                    </React.Fragment>
                );
            })}
            {docked && <div style={{ flex: 1 }} />}
            <div style={docked ? { position: "sticky", bottom: COMPOSER_BOTTOM, zIndex: 5, margin: "0 -20px", padding: "10px 20px 8px", background: `linear-gradient(to bottom, rgba(5,6,10,0), ${C.bg} 14px)`, display: "flex", flexDirection: "column", gap: 8 } : { display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                {(quick || QUICK[side]).map((q) => (
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
        </div>
    );
}

export { StudentMessages, splitContext };
