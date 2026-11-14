import React, { useState, useMemo } from "react";
import { C, F, SIL_URL } from "../../styles/tokens";
import { fmtMemberNo, fmtSince } from "../../utils/members";
import { AssessmentSummary } from "../assessment/AssessmentSummary";

// Perfil do aluno (versão 1c): topo "pôster" + blocos que abrem o detalhe.
// Aluno edita foto, contato e metas de carga. A meta de frequência vem da ficha (professor).
const TILE_ON = "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)";
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const num = (v) => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : null; };
const kgs = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const dShort = (iso) => { if (!iso) return ""; const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return `${d} ${MO[m - 1]}`; };
const label = { fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: C.muted };
const block = { padding: 16, borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", gap: 6, border: "none", textAlign: "left", cursor: "pointer", color: C.text, fontFamily: F.body };
const big = { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 36, lineHeight: 1, marginTop: "auto" };
const small = { fontSize: 13, color: "#AEB7C6" };
const unit = { fontSize: 15, color: C.muted, fontWeight: 500 };

function readPhoto(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const S = 320, c = document.createElement("canvas"); c.width = S; c.height = S; const k = Math.max(S / img.width, S / img.height); c.getContext("2d").drawImage(img, (S - img.width * k) / 2, (S - img.height * k) / 2, img.width * k, img.height * k); res(c.toDataURL("image/jpeg", 0.8)); }; img.src = r.result; }; r.readAsDataURL(file); });
}
function Avatar({ src, name, size }) {
    const ini = String(name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    return React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "#1A1D24", boxShadow: `inset 0 0 0 2px ${C.silver}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: size * 0.33, color: C.silver } },
        src ? React.createElement("img", { src, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : ini);
}
const row = (t, s, onClick, color) => React.createElement("button", { key: t, className: "cc-tap", onClick, style: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "none", borderBottom: `1px solid ${C.line}`, background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: F.body, color: color || C.text } },
    React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, t), s && React.createElement("span", { style: { fontSize: 13, color: C.muted } }, s)),
    !color && React.createElement("span", { "aria-hidden": "true", style: { fontSize: 18, color: "#7D8698" } }, "\u203A"));

// melhor carga por data, por exercício (agrupado pelo nome) — base de recordes e evolução
function loadSeries(week) {
    const g = {};
    Object.values(week || {}).forEach((list) => (Array.isArray(list) ? list : []).forEach((ex) => {
        const k = String(ex.name || "").trim().toLowerCase(); if (!k) return;
        if (!g[k]) g[k] = { name: ex.name, pts: {} };
        (ex.history || []).forEach((h) => { const best = Math.max(0, ...((h.entries || []).map((e) => num(e.load) || 0))); if (h.date && best > 0) g[k].pts[h.date] = Math.max(g[k].pts[h.date] || 0, best); });
    }));
    return Object.values(g).map((x) => ({ name: x.name, pts: Object.entries(x.pts).sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, v]) => ({ date, v })) })).filter((x) => x.pts.length);
}
function Spark({ pts, h, stroke }) {
    if (pts.length < 2) return React.createElement("div", { style: { height: h } });
    const vs = pts.map((p) => p.v), lo = Math.min(...vs), hi = Math.max(...vs), r = hi - lo || 1;
    const d = pts.map((p, i) => `${(i / (pts.length - 1)) * 300 + 10},${h - 6 - ((p.v - lo) / r) * (h - 12)}`).join(" ");
    return React.createElement("svg", { viewBox: `0 0 320 ${h}`, width: "100%", height: h, preserveAspectRatio: "none", "aria-hidden": "true" }, React.createElement("polyline", { points: d, fill: "none", stroke: C.silver, strokeWidth: stroke || 2.5, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" }));
}

function StudentProfile({ student, week, checkins, freqTotal, freqWeek, weeklyTarget, bestStreak, notifPerm, onAskNotify, onUpdate, onOpenCard, onOpenSelo, onOpenMyData, onOpenReassess, onMessage, onLogout, onClose, todayDone }) {
    const [view, setView] = useState(null);
    const [evoIdx, setEvoIdx] = useState(0);
    const [contact, setContact] = useState(null);
    const [goalForm, setGoalForm] = useState(null);
    const series = useMemo(() => loadSeries(week), [week]);
    const records = useMemo(() => series.map((s) => { const b = s.pts.reduce((m, p) => (p.v > m.v ? p : m), s.pts[0]); return { name: s.name, best: b.v, date: b.date }; }).sort((a, b) => b.best - a.best), [series]);
    const evo = useMemo(() => [...series].sort((a, b) => b.pts.length - a.pts.length), [series]);
    const now = new Date(), ym = now.toISOString().slice(0, 7), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthSet = new Set((checkins || []).filter((d) => String(d).startsWith(ym)).map((d) => Number(String(d).slice(8, 10))));
    const a = student.assessment || {};
    const measures = [{ date: student.assessmentAt, peso: num(a.peso), base: true }, ...(student.reassessments || [])].filter((x) => x.date);
    const lastM = measures[measures.length - 1], prevM = measures[measures.length - 2];
    const goals = student.goals || [];
    const goalRows = [
        weeklyTarget != null && { id: "_freq", name: `${weeklyTarget} treinos por semana`, cur: freqWeek, target: weeklyTarget, fixed: true },
        ...goals.map((g) => { const r = records.find((x) => x.name.trim().toLowerCase() === String(g.exercise).trim().toLowerCase()); return { id: g.id, name: `${g.exercise} ${kgs(g.target)} kg`, cur: r ? r.best : 0, target: g.target, unit: "kg" }; }),
    ].filter(Boolean);
    const BADGES = [["1º", "1º treino", freqTotal >= 1], ["10", "10 treinos", freqTotal >= 10], ["25", "25 treinos", freqTotal >= 25], ["50", "50 treinos", freqTotal >= 50], ["100", "100 treinos", freqTotal >= 100],
        ["★", "1º recorde", records.length >= 1], ["5★", "5 recordes", records.length >= 5], ["10★", "10 recordes", records.length >= 10],
        ["7d", "7 dias seguidos", bestStreak >= 7], ["14d", "14 dias seguidos", bestStreak >= 14], ["30d", "30 dias seguidos", bestStreak >= 30], ["4x", "4 meses no clube", (Date.now() - new Date(student.memberSince || student.startDate || student.assessmentAt || Date.now()).getTime()) / 864e5 >= 120]]
        .map(([n, l, on]) => ({ n, l, on }));
    const won = BADGES.filter((b) => b.on), next = BADGES.find((b) => !b.on);
    const badge = (b, size) => React.createElement("div", { key: b.l, style: { width: size, height: size, flexShrink: 0, borderRadius: "50%", background: C.panel, boxShadow: `inset 0 0 0 1.5px ${C.silver}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: size * 0.32, color: C.silver, opacity: b.on ? 1 : 0.3 } }, b.n);
    const phone = student.contactPhone ?? a.whatsapp ?? "", email = student.contactEmail ?? "";

    const shell = (title, body) => React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 96, background: C.ink, overflowY: "auto" } },
        React.createElement("div", { style: { maxWidth: 540, margin: "0 auto", padding: "calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 32px)", display: "flex", flexDirection: "column", gap: 20, color: C.text, fontFamily: F.body } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("button", { className: "cc-tap", onClick: () => (view ? setView(null) : onClose()), style: { minHeight: 44, padding: 0, border: "none", background: "none", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, view ? "\u2039 Perfil" : "\u2039 Treino"),
                !view && React.createElement("button", { className: "cc-tap", onClick: () => setView("editar"), style: { minHeight: 44, padding: 0, border: "none", background: "none", color: C.silver, fontWeight: 600, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Editar")),
            title && React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1 } }, title),
            body));

    if (view === "recordes") return shell("RECORDES", records.length ? React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, records.map((r) => React.createElement("div", { key: r.name, style: { minHeight: 52, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "12px 0", borderBottom: `1px solid ${C.line}` } },
        React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, r.name),
        React.createElement("span", { style: { display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 } }, React.createElement("span", { style: { fontSize: 13, color: C.muted } }, dShort(r.date)), React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 24 } }, kgs(r.best)), React.createElement("span", { style: { fontSize: 13, color: C.muted } }, "kg")))))
        : React.createElement("div", { style: small }, "Seus recordes aparecem aqui assim que você registrar carga."));

    if (view === "evolucao") {
        const s = evo[Math.min(evoIdx, evo.length - 1)];
        return shell("EVOLUÇÃO", !s ? React.createElement("div", { style: small }, "Registre carga em mais de um dia pra ver a evolução.") : React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 } }, evo.map((x, i) => React.createElement("button", { key: x.name, className: "cc-tap", onClick: () => setEvoIdx(i), style: { flexShrink: 0, minHeight: 44, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 13, background: i === evoIdx ? C.text : C.panel, color: i === evoIdx ? C.ink : "#AEB7C6", boxShadow: i === evoIdx ? "none" : `inset 0 0 0 1px ${C.line}` } }, x.name))),
            React.createElement("div", { style: { ...block, cursor: "default", padding: "16px 16px 10px" } }, React.createElement(Spark, { pts: s.pts, h: 160 }),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted } }, React.createElement("span", null, dShort(s.pts[0].date)), React.createElement("span", null, dShort(s.pts[s.pts.length - 1].date)))),
            React.createElement("div", { style: { fontSize: 15, color: "#AEB7C6" } }, "De ", React.createElement("b", { style: { color: C.text } }, kgs(s.pts[0].v) + " kg"), " pra ", React.createElement("b", { style: { color: C.text } }, kgs(s.pts[s.pts.length - 1].v) + " kg"), ` em ${s.pts.length} ${s.pts.length === 1 ? "registro" : "registros"}`)));
    }

    if (view === "metas") {
        const opts = records.map((r) => r.name);
        return shell("METAS", React.createElement(React.Fragment, null,
            goalRows.length === 0 && React.createElement("div", { style: small }, "Nenhuma meta ainda."),
            goalRows.map((g) => React.createElement("div", { key: g.id, style: { ...block, cursor: "default", gap: 8 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15 } }, React.createElement("span", { style: { fontWeight: 600 } }, g.name), React.createElement("span", { style: { color: "#AEB7C6", flexShrink: 0 } }, `${g.unit ? kgs(g.cur) : g.cur} de ${g.unit ? kgs(g.target) : g.target}`)),
                React.createElement("div", { style: { height: 6, borderRadius: 3, background: "#1A1D24" } }, React.createElement("div", { style: { height: 6, borderRadius: 3, width: Math.min(100, (g.cur / g.target) * 100) + "%", background: "linear-gradient(90deg,#6E7889,#F2F5FA)" } })),
                g.fixed ? React.createElement("span", { style: { fontSize: 13, color: C.muted } }, "Definida pelo professor na sua ficha") : React.createElement("button", { onClick: () => onUpdate({ goals: goals.filter((x) => x.id !== g.id) }), style: { alignSelf: "flex-start", minHeight: 44, padding: 0, border: "none", background: "none", color: C.warn, fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, "Remover"))),
            goalForm ? React.createElement("div", { style: { ...block, cursor: "default", gap: 10 } },
                React.createElement("span", { style: label }, "NOVA META DE CARGA"),
                React.createElement("select", { value: goalForm.exercise, onChange: (e) => setGoalForm({ ...goalForm, exercise: e.target.value }), style: { minHeight: 48, borderRadius: 10, border: "none", background: C.panel2, color: C.text, fontFamily: F.body, fontSize: 15, padding: "0 12px" } }, opts.map((o) => React.createElement("option", { key: o, value: o }, o))),
                React.createElement("input", { inputMode: "decimal", placeholder: "Carga alvo (kg)", value: goalForm.target, onChange: (e) => setGoalForm({ ...goalForm, target: e.target.value.replace(/[^0-9.,]/g, "") }), style: { minHeight: 48, borderRadius: 10, border: "none", outline: "none", background: C.panel2, color: C.text, fontFamily: F.body, fontSize: 15, padding: "0 12px" } }),
                React.createElement("div", { style: { display: "flex", gap: 8 } },
                    React.createElement("button", { className: "cc-tap", onClick: () => setGoalForm(null), style: { flex: 1, minHeight: 48, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "Cancelar"),
                    React.createElement("button", { className: "cc-tap", disabled: !num(goalForm.target) || !goalForm.exercise, onClick: () => { onUpdate({ goals: [...goals, { id: Date.now().toString(36), exercise: goalForm.exercise, target: num(goalForm.target) }] }); setGoalForm(null); }, style: { flex: 2, minHeight: 48, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: num(goalForm.target) && goalForm.exercise ? 1 : 0.4 } }, "Salvar meta")))
                : opts.length > 0 && React.createElement("button", { className: "cc-tap", onClick: () => setGoalForm({ exercise: opts[0], target: "" }), style: { minHeight: 52, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Adicionar meta de carga")));
    }

    if (view === "corpo") {
        const keys = [["peso", "Peso", "kg"], ["cintura", "Cintura", "cm"], ["quadril", "Quadril", "cm"], ["braco", "Braço", "cm"], ["coxa", "Coxa", "cm"]];
        return shell("CORPO", React.createElement(React.Fragment, null,
            lastM ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 } }, keys.filter(([k]) => lastM[k] != null).map(([k, l, u]) => { const d = prevM && prevM[k] != null ? lastM[k] - prevM[k] : null; return React.createElement("div", { key: k, style: { ...block, cursor: "default", padding: 12, gap: 2 } }, React.createElement("span", { style: { fontSize: 11, color: C.muted } }, l), React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 24 } }, kgs(lastM[k])), React.createElement("span", { style: { fontSize: 11, color: "#AEB7C6" } }, d == null ? u : `${d > 0 ? "+" : d < 0 ? "\u2212" : ""}${kgs(Math.abs(d))} ${u}`)); })) : React.createElement("div", { style: small }, "Sem medidas ainda."),
            React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, [...measures].reverse().map((m, i) => React.createElement("div", { key: i, style: { minHeight: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` } }, React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, m.base ? "Anamnese" : "Reavaliação"), React.createElement("span", { style: { fontSize: 13, color: C.muted } }, new Date(m.date).toLocaleDateString("pt-BR") + (m.peso ? ` · ${kgs(m.peso)} kg` : ""))))),
            React.createElement("button", { className: "cc-tap", onClick: onOpenReassess, style: { minHeight: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "Fazer reavaliação")));
    }

    if (view === "conquistas") return shell("CONQUISTAS", React.createElement(React.Fragment, null,
        React.createElement("div", { style: small }, `${won.length} de ${BADGES.length}` + (next ? ` · próxima: ${next.l}` : "")),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "18px 10px" } }, BADGES.map((b) => React.createElement("div", { key: b.l, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } }, badge(b, 62), React.createElement("span", { style: { fontSize: 11, lineHeight: 1.25, textAlign: "center", color: b.on ? "#AEB7C6" : "#5A6273" } }, b.l))))));

    if (view === "anamnese") return shell(null, student.assessment ? React.createElement(AssessmentSummary, { assessment: student.assessment, assessmentAt: student.assessmentAt }) : React.createElement("div", { style: small }, "Anamnese ainda não respondida."));

    if (view === "editar") {
        const c = contact || { phone, email };
        const inp = { minHeight: 48, borderRadius: 10, border: "none", outline: "none", background: C.panel2, color: C.text, fontFamily: F.body, fontSize: 15, padding: "0 12px" };
        return shell("EDITAR PERFIL", React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } }, React.createElement(Avatar, { src: student.photo, name: student.name, size: 84 }),
                React.createElement("label", { className: "cc-tap", style: { minHeight: 44, display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 999, boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "Trocar foto",
                    React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: async (e) => { const f = e.target.files[0]; if (f) onUpdate({ photo: await readPhoto(f) }); } }))),
            React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: label }, "WHATSAPP"), React.createElement("input", { inputMode: "tel", value: c.phone, onChange: (e) => setContact({ ...c, phone: e.target.value }), style: inp })),
            React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: label }, "E-MAIL"), React.createElement("input", { inputMode: "email", type: "email", value: c.email, onChange: (e) => setContact({ ...c, email: e.target.value }), style: inp })),
            React.createElement("button", { className: "cc-tap", disabled: !contact, onClick: () => { onUpdate({ contactPhone: c.phone.trim(), contactEmail: c.email.trim() }); setContact(null); setView(null); }, style: { minHeight: 52, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: contact ? 1 : 0.4 } }, "Salvar"),
            React.createElement("div", { style: small }, "Nome e dados de saúde só o professor altera.")));
    }

    // ----- perfil -----
    const first = String(student.name || "").trim().split(/\s+/);
    const nameLines = first.length > 1 ? [first[0], first.slice(1).join(" ")] : [first[0] || ""];
    const top = records[0], evo0 = evo[0];
    const g0 = goalRows[0];
    return shell(null, React.createElement(React.Fragment, null,
        todayDone && React.createElement("button", { className: "cc-tap", onClick: todayDone.onView, style: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, border: "none", cursor: "pointer", textAlign: "left", background: C.text, color: C.ink, fontFamily: F.body } },
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,14px)", gap: 3, flexShrink: 0 } }, [0, 1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: 14, height: 14, borderRadius: 3, background: "linear-gradient(135deg,#6E7889,#05060A)" } }))),
            React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 } },
                React.createElement("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#3A404C" } }, "TREINO DE HOJE FEITO"),
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18, lineHeight: 1.05, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, todayDone.name)),
            React.createElement("span", { style: { marginLeft: "auto", flexShrink: 0, fontSize: 13, fontWeight: 700 } }, "Ver e compartilhar \u203A")),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, paddingBottom: 20, borderBottom: `1px solid ${C.line}` } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, React.createElement(Avatar, { src: student.photo, name: student.name, size: 72 }),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, React.createElement("span", { style: label }, "MEMBRO Nº " + fmtMemberNo(student.memberNo)), React.createElement("span", { style: { fontSize: 13, color: "#AEB7C6" } }, "desde " + fmtSince(student.memberSince || student.startDate) + " · Prof. Cancio"))),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: nameLines.some((l) => l.length > 9) ? 40 : 52, lineHeight: 0.88, letterSpacing: "-0.02em", textTransform: "uppercase", overflowWrap: "anywhere" } },
                nameLines[0], nameLines[1] && React.createElement("br"), nameLines[1], React.createElement("img", { src: SIL_URL, alt: "", style: { width: "0.58em", height: "0.58em", marginLeft: "0.1em", verticalAlign: "baseline" } })),
            React.createElement("div", { style: { display: "flex", gap: 28 } }, [[freqTotal, freqTotal === 1 ? "TREINO" : "TREINOS"], [bestStreak, "MAIOR SEQ."], [records.length, records.length === 1 ? "RECORDE" : "RECORDES"]].map(([v, l]) => React.createElement("div", { key: l, style: { display: "flex", flexDirection: "column", gap: 2 } }, React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 40, lineHeight: 1 } }, v), React.createElement("span", { style: { fontSize: 11, letterSpacing: "0.12em", color: C.muted } }, l)))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 } },
                React.createElement("button", { className: "cc-tap", onClick: onOpenCard, style: { minHeight: 48, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" } }, "Carteirinha"),
                React.createElement("button", { className: "cc-tap", onClick: onOpenSelo, style: { minHeight: 48, borderRadius: 16, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.text, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "Selo"))),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 } },
            React.createElement("div", { style: { ...block, gridColumn: "span 2", cursor: "default", gap: 10 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, React.createElement("span", { style: label }, "FREQUÊNCIA"), React.createElement("span", { style: small }, `${MO[now.getMonth()]} · ${monthSet.size} ${monthSet.size === 1 ? "treino" : "treinos"}`)),
                React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(16,1fr)", gap: 4 } }, Array.from({ length: dim }, (_, i) => { const on = monthSet.has(i + 1), fut = i + 1 > now.getDate(); return React.createElement("span", { key: i, style: { height: 12, borderRadius: 2, background: on ? TILE_ON : fut ? C.panel : "#1A1D24", boxShadow: on ? "none" : "inset 0 0 0 1px #2A2E37" } }); }))),
            React.createElement("button", { className: "cc-tap", onClick: () => setView("recordes"), style: { ...block, minHeight: 124 } }, React.createElement("span", { style: label }, "RECORDES"),
                top ? React.createElement(React.Fragment, null, React.createElement("span", { style: big }, kgs(top.best), React.createElement("span", { style: unit }, " kg")), React.createElement("span", { style: small }, `${top.name} · o maior de ${records.length}`)) : React.createElement("span", { style: { ...small, marginTop: "auto" } }, "Ainda sem carga registrada")),
            React.createElement("button", { className: "cc-tap", onClick: () => setView("evolucao"), style: { ...block, minHeight: 124 } }, React.createElement("span", { style: label }, "EVOLUÇÃO"),
                evo0 && evo0.pts.length > 1 ? React.createElement(React.Fragment, null, React.createElement("div", { style: { marginTop: "auto" } }, React.createElement(Spark, { pts: evo0.pts, h: 44, stroke: 2.5 })), React.createElement("span", { style: small }, `${evo0.name} ${evo0.pts[evo0.pts.length - 1].v - evo0.pts[0].v >= 0 ? "+" : "\u2212"}${kgs(Math.abs(evo0.pts[evo0.pts.length - 1].v - evo0.pts[0].v))} kg`)) : React.createElement("span", { style: { ...small, marginTop: "auto" } }, "Aparece com 2 registros")),
            React.createElement("button", { className: "cc-tap", onClick: () => setView("metas"), style: { ...block, minHeight: 124 } }, React.createElement("span", { style: label }, "METAS"),
                g0 ? React.createElement(React.Fragment, null, React.createElement("span", { style: big }, g0.unit ? `${kgs(g0.cur)}/${kgs(g0.target)}` : `${g0.cur}/${g0.target}`), React.createElement("span", { style: small }, g0.fixed ? "treinos nesta semana" : g0.name)) : React.createElement("span", { style: { ...small, marginTop: "auto" } }, "Criar uma meta \u203A")),
            React.createElement("button", { className: "cc-tap", onClick: () => setView("corpo"), style: { ...block, minHeight: 124 } }, React.createElement("span", { style: label }, "CORPO"),
                lastM && lastM.peso ? React.createElement(React.Fragment, null, React.createElement("span", { style: big }, kgs(lastM.peso), React.createElement("span", { style: unit }, " kg")), React.createElement("span", { style: small }, (prevM && prevM.peso ? `${lastM.peso - prevM.peso > 0 ? "+" : lastM.peso - prevM.peso < 0 ? "\u2212" : ""}${kgs(Math.abs(lastM.peso - prevM.peso))} kg · ` : "") + dShort(String(lastM.date)))) : React.createElement("span", { style: { ...small, marginTop: "auto" } }, "Sem medidas ainda")),
            React.createElement("button", { className: "cc-tap", onClick: () => setView("conquistas"), style: { ...block, gridColumn: "span 2", flexDirection: "row", alignItems: "center", gap: 14 } },
                React.createElement("div", { style: { display: "flex" } }, (won.length ? won.slice(-3) : BADGES.slice(0, 3)).map((b) => React.createElement("div", { key: b.l, style: { marginRight: -10 } }, badge(b, 44)))),
                React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, marginLeft: 10 } }, React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "Conquistas"), React.createElement("span", { style: { fontSize: 13, color: C.muted } }, `${won.length} de ${BADGES.length}` + (next ? ` · próxima: ${next.l}` : ""))),
                React.createElement("span", { "aria-hidden": "true", style: { marginLeft: "auto", fontSize: 18, color: "#7D8698" } }, "\u203A"))),
        React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
            row("Meu professor", "Prof. Cancio · mandar recado", onMessage),
            row("Minha anamnese", student.assessmentAt ? "Respondida em " + new Date(student.assessmentAt).toLocaleDateString("pt-BR") + " · só leitura" : "Ainda não respondida", () => setView("anamnese")),
            row("Contato", [phone, email].filter(Boolean).join(" · ") || "Adicionar telefone e e-mail", () => setView("editar")),
            notifPerm !== "unsupported" && row("Notificações", notifPerm === "granted" ? "Ligadas" : notifPerm === "denied" ? "Bloqueadas nos ajustes do celular" : "Ligar recados e lembretes", notifPerm === "default" ? onAskNotify : undefined),
            row("Meus dados", "LGPD · baixar ou pedir exclusão", onOpenMyData),
            row("Sair", null, onLogout, C.warn))));
}
export { StudentProfile, Avatar };
