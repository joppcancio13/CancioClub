import React, { useState } from "react";
import { C, DAYS, F, PILL_V3, PROGRESS, KICKER } from "../../styles/tokens";
import { describe } from "../student/WorkoutV3";

// Início do professor — design v3 (design/v3/README.md · Professor 1 "Alunos" 16b e 2 "Ao vivo";
// decisões em design/v3/DECISOES.md · 2: "na pista" atualiza a cada 30 s com a tela aberta).

const WEEKDAYS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
const kicker = KICKER;
const num = { fontVariantNumeric: "tabular-nums" };
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const initials = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
const br = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const pillOf = (kind, done) => (done ? (kind === "warmup" ? PILL_V3.warmup : kind === "recon" ? PILL_V3.recon : PILL_V3.working) : PILL_V3.off);
const agoMin = (t, now) => Math.max(0, Math.round((now - t) / 60000));

// o treino de HOJE de um aluno: o dia da ficha que tem série registrada hoje (pode não ser o dia da semana)
function liveOf(week, sessionsToday, today) {
    for (const d of DAYS) {
        const list = (week && week[d.key]) || [];
        const rows = list.map((ex) => describe(ex, today));
        const done = rows.reduce((n, r) => n + r.sets.filter((s) => s.done).length, 0);
        if (!done) continue;
        const total = rows.reduce((n, r) => n + r.sets.length, 0);
        const ats = rows.flatMap((r) => r.sets.filter((s) => s.done && s.log && typeof s.log.at === "number").map((s) => ({ at: s.log.at, r, s })));
        ats.sort((a, b) => a.at - b.at);
        return { dayKey: d.key, rows, done, total, first: ats[0] || null, last: ats[ats.length - 1] || null, finished: sessionsToday.some((x) => x.day === d.key) };
    }
    return null;
}

function Ring({ pct, label }) {
    const r = 14, c = 2 * Math.PI * r;
    return (
        <span style={{ position: "relative", width: 32, height: 32, flex: "none" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden="true">
                <circle cx="16" cy="16" r={r} fill="none" stroke={C.raised} strokeWidth="2.5" />
                <circle cx="16" cy="16" r={r} fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{label}</span>
        </span>
    );
}

function AlunosV3({ rows, data, now, search, onSearch, onAdd, onOpen, onAttn, liveId, onLive, onMessage }) {
    const [filter, setFilter] = useState("todos"); // lista única: todos · hoje · atenção
    const [attnAll, setAttnAll] = useState(false);
    const today = (() => { const d = new Date(now); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); })();
    const enriched = rows.map((r) => {
        const sid = r.s.id;
        const sess = ((data.sessions && data.sessions[sid]) || []).filter((x) => x.date === today);
        const live = liveOf((data.workouts && data.workouts[sid]) || {}, sess, today);
        return { ...r, live, onPista: !!live && !live.finished, sessToday: sess[sess.length - 1] || null };
    });

    // ---------- Ao vivo ----------
    const liveRow = liveId && enriched.find((r) => r.s.id === liveId && r.live);
    if (liveRow) {
        const { s, live } = liveRow;
        const dn = ((data.dayNames && data.dayNames[s.id]) || {})[live.dayKey] || (DAYS.find((d) => d.key === live.dayKey) || {}).full || "Treino";
        const pct = live.total ? Math.round((live.done / live.total) * 100) : 0;
        return (
            <section style={{ paddingBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={() => onLive(null)} aria-label="Voltar" style={{ minHeight: 44, padding: "0 10px 0 0", border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>‹ Alunos</button>
                    <span style={{ ...kicker, flex: 1, textAlign: "right", color: liveRow.onPista ? C.text2 : C.text4 }}>{liveRow.onPista ? "AO VIVO" : "TREINO DE HOJE FEITO"}</span>
                </div>
                <div style={{ marginTop: 6, fontFamily: F.display, fontSize: 32, fontWeight: 900, fontStretch: "125%", lineHeight: 1, overflowWrap: "anywhere" }}>{String(s.name).toUpperCase()}</div>
                <span style={{ display: "block", marginTop: 8, fontSize: 13, color: C.text3, ...num }}>{dn} · {live.done} de {live.total} séries</span>
                <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: C.raised, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", backgroundImage: PROGRESS }} /></div>
                {live.last && (
                    <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 16, background: C.panel, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ ...kicker }}>ÚLTIMA SÉRIE · {agoMin(live.last.at, now) < 1 ? "AGORA" : "HÁ " + agoMin(live.last.at, now) + " MIN"}</span>
                        <span style={{ fontSize: 15, ...num }}>{live.last.r.ex.name} · {live.last.s.label.charAt(0) + live.last.s.label.slice(1).toLowerCase()} · {br(live.last.s.log.load)} kg × {live.last.s.log.reps}</span>
                    </div>
                )}
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
                    {live.rows.map((r, i) => (
                        <div key={r.ex.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, ...divider }}>
                            <span style={{ width: 22, fontSize: 13, fontWeight: 700, color: r.allDone ? C.text2 : C.text4, ...num }}>{r.allDone ? "✓" : String(i + 1).padStart(2, "0")}</span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: r.allDone ? C.text3 : C.text }}>{r.ex.name}</span>
                            <span style={{ display: "flex", gap: 3, flex: "none" }}>{r.sets.map((x) => <span key={x.id} style={{ width: 12, height: 12, borderRadius: 3, ...pillOf(x.kind, x.done) }} />)}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: C.text3 }}>
                    {[["warmup", "Aquecimento"], ["recon", "Reconhecimento"], ["working", "Válida"]].map(([k, l]) => (
                        <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, ...pillOf(k, true) }} />{l}</span>
                    ))}
                </div>
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button type="button" onClick={() => onMessage(s)} style={{ height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Mandar recado</button>
                    <button type="button" onClick={() => onOpen(s)} style={{ height: 52, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Abrir ficha</button>
                </div>
                <span style={{ display: "block", marginTop: 12, fontSize: 11, color: C.text3, textAlign: "center" }}>Atualiza sozinho a cada 30 s.</span>
            </section>
        );
    }

    // ---------- Alunos ----------
    // arrumação (pedido do professor, 16/nov): busca no topo, "Precisa de atenção" com no máx. 3 e
    // uma lista só em ordem alfabética com filtros — sai a divisão "Treinam hoje" / "Outros"
    const d = new Date(now);
    const q = search.trim().toLowerCase();
    const pista = enriched.filter((r) => r.onPista);
    const attn = enriched.filter((r) => r.alert);
    const ACTION = { RECADO: "Responder", SUMIDO: "Chamar", LGPD: "Ver", FADIGA: "Ver", ANAMNESE: "Revisar", "REAVALIAÇÃO": "Ver" };
    const WARN = new Set(["SUMIDO", "LGPD", "FADIGA"]);
    const trainsToday = (r) => !!(r.done || r.wait || r.live);
    const FILTERS = [["todos", "Todos", enriched.length], ["hoje", "Treinam hoje", enriched.filter(trainsToday).length], ["atencao", "Atenção", attn.length]];
    const list = enriched.filter((r) => (!q || r.s.name.toLowerCase().includes(q)) && (filter === "todos" || (filter === "hoje" ? trainsToday(r) : !!r.alert)))
        .sort((a, b) => String(a.s.name).localeCompare(String(b.s.name), "pt-BR"));
    const status = (r) => {
        if (r.onPista) return { t: "treinando agora", strong: true };
        if (r.done || (r.live && r.live.finished)) return { t: "✓ feito hoje" + (r.sessToday && r.sessToday.durationSec ? " · " + Math.round(r.sessToday.durationSec / 60) + " min" : "") };
        if (r.alert) return { t: r.alert.t, warn: WARN.has(r.alert.k) };
        return { t: r.sub || "" };
    };
    const chip = (on) => ({ flex: "none", minHeight: 44, padding: "0 12px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text2, boxShadow: `inset 0 0 0 1px ${C.outline}` }) });
    const avatar = (name) => <span style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{initials(name)}</span>;

    return (
        <section style={{ paddingBottom: 20 }}>
            <span style={{ ...kicker, ...num }}>{WEEKDAYS[d.getDay()]} · {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}</span>
            <div style={{ marginTop: 6, fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>ALUNOS</div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar aluno" aria-label="Buscar aluno"
                    style={{ flex: 1, minWidth: 0, boxSizing: "border-box", fontFamily: F.body, fontSize: 15, color: C.text, background: C.panel, border: "none", borderRadius: 10, padding: "12px 14px", outline: "none" }} />
                <button type="button" onClick={onAdd} aria-label="Novo aluno" style={{ flex: "none", width: 44, height: 44, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontSize: 20, cursor: "pointer" }}>+</button>
            </div>

            {pista.length > 0 && !q && (
                <>
                    <div style={{ ...kicker, marginTop: 20, color: C.text2 }}>Treinando agora · {pista.length}</div>
                    <div style={{ margin: "8px -20px 0", padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
                        {pista.map((r) => (
                            <button key={r.s.id} type="button" onClick={() => onLive(r.s.id)} style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 8px", borderRadius: 999, border: "none", background: C.panel, color: C.text, cursor: "pointer" }}>
                                <Ring pct={r.live.total ? r.live.done / r.live.total : 0} label={initials(r.s.name)} />
                                <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                                    <span style={{ fontSize: 15, fontWeight: 700 }}>{String(r.s.name).split(" ").slice(0, 2).join(" ")}</span>
                                    <span style={{ fontSize: 13, color: C.text3, ...num }}>{r.live.done}/{r.live.total}{r.live.first ? " · " + agoMin(r.live.first.at, now) + " min" : ""}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {attn.length > 0 && !q && (
                <>
                    <div style={{ ...kicker, marginTop: 22, color: C.accent }}>Precisa de atenção · {attn.length}</div>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2, borderRadius: 16, overflow: "hidden" }}>
                        {(attnAll ? attn : attn.slice(0, 3)).map((r) => (
                            <button key={r.s.id} type="button" onClick={() => onAttn(r)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.panel, border: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                                {avatar(r.s.name)}
                                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontSize: 15, fontWeight: 700 }}>{r.s.name}</span>
                                    <span style={{ fontSize: 13, color: WARN.has(r.alert.k) ? C.accent : C.text3 }}>{r.alert.t}{r.alert.more ? " · +" + r.alert.more : ""}</span>
                                </span>
                                <span style={{ flex: "none", fontSize: 15, fontWeight: 700, color: C.text }}>{ACTION[r.alert.k] || "Ver"}</span>
                            </button>
                        ))}
                    </div>
                    {attn.length > 3 && <button type="button" onClick={() => setAttnAll(!attnAll)} style={{ marginTop: 6, minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 13, cursor: "pointer", textAlign: "left" }}>{attnAll ? "Mostrar menos" : "Ver todos · " + attn.length}</button>}
                </>
            )}

            <div style={{ marginTop: 22, display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                {FILTERS.map(([k, l, n]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} style={chip(filter === k)}>{l + " · " + n}</button>)}
            </div>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>
                {list.map((r) => {
                    const st = status(r);
                    return (
                        <button key={r.s.id} type="button" onClick={() => (r.onPista ? onLive(r.s.id) : onOpen(r.s))}
                            style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, padding: "8px 0", border: "none", ...divider, color: C.text, textAlign: "left", cursor: "pointer" }}>
                            {avatar(r.s.name)}
                            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontSize: 15, fontWeight: 600 }}>{r.s.name}</span>
                                {st.t && <span style={{ fontSize: 13, color: st.warn ? C.accent : st.strong ? C.text : C.text4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.t}</span>}
                            </span>
                            <span style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, ...num }}>{Math.min(r.st.week, 99)}<span style={{ color: C.dim }}>/{r.planned || "–"}</span></span>
                                <span style={{ fontSize: 11, color: C.text3 }}>semana</span>
                            </span>
                        </button>
                    );
                })}
                {list.length === 0 && <span style={{ padding: "16px 0", fontSize: 13, color: C.text3 }}>{q ? "Nenhum aluno com esse nome." : filter === "hoje" ? "Ninguém treina hoje." : filter === "atencao" ? "Ninguém precisa de atenção agora." : "Nenhum aluno ainda — toque em + pra cadastrar."}</span>}
            </div>
        </section>
    );
}

export { AlunosV3 };
