import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

const FIELDS = [["peso", "Peso (kg)", "decimal"], ["cintura", "Cintura (cm)", "decimal"], ["quadril", "Quadril (cm)", "decimal"], ["braco", "Bra\u00E7o (cm)", "decimal"], ["coxa", "Coxa (cm)", "decimal"]];
import { readBodyPhoto } from "../shared/Face";
// fotos de corpo de uma reavaliação: `fotos` [{ pose, src }] (frente / lado / costas) ou a `foto` única antiga
const POSES = [["frente", "Frente"], ["lado", "Lado"], ["costas", "Costas"]];
const photosOf = (r) => (r && Array.isArray(r.fotos) && r.fotos.length ? r.fotos : r && r.foto ? [{ pose: "frente", src: r.foto }] : []);
// quando vence a reavaliação: a cada N semanas (padrão 6) desde a última ou desde a anamnese
// próxima reavaliação: N semanas depois da última (a do aluno, ou a que o professor marcou como feita —
// design v4 · 53a "Feita hoje"); "Adiar 1 semana" empurra pelo reassessSnoozeUntil
function nextReassess(student) {
    if (!student || !student.assessmentAt) return null;
    // entrada só de foto (Corpo › Adicionar fotos) não conta como reavaliação
    const list = (student.reassessments || []).filter((r) => !r.onlyPhoto);
    const dates = [student.assessmentAt, list.length ? list[list.length - 1].date : null, student.reassessDoneAt].filter(Boolean).map((d) => new Date(d).getTime());
    const weeks = Number(student.reassessEvery) || 6;
    let next = Math.max(...dates) + weeks * 7 * 864e5;
    if (student.reassessSnoozeUntil) next = Math.max(next, new Date(student.reassessSnoozeUntil).getTime());
    return next;
}
function reassessDue(student) {
    const next = nextReassess(student);
    return next != null && Date.now() >= next;
}
// três fotos opcionais (frente, lado, costas) — mesma luz e mesma roupa ajudam a comparar depois
function PosePicker({ value, onChange }) {
    const get = (k) => (value.find((x) => x.pose === k) || {}).src;
    const set = (k, src) => onChange([...value.filter((x) => x.pose !== k), ...(src ? [{ pose: k, src }] : [])].sort((a, b) => POSES.findIndex(([p]) => p === a.pose) - POSES.findIndex(([p]) => p === b.pose)));
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.muted } }, "Fotos de corpo (opcional)"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 } }, POSES.map(([k, l]) => { const src = get(k); return React.createElement("label", { key: k, style: { position: "relative", aspectRatio: "3 / 4", borderRadius: 14, overflow: "hidden", background: C.panel, boxShadow: src ? "none" : "inset 0 0 0 1px #2A2E37", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" } },
            src ? React.createElement("img", { src, alt: l, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }) : React.createElement("span", { style: { fontFamily: F.body, fontSize: 22, color: C.silver } }, "+"),
            React.createElement("span", { style: { position: "relative", fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, padding: src ? "2px 8px" : 0, borderRadius: 999, background: src ? "rgba(5,6,10,.7)" : "none", marginTop: src ? "auto" : 0, marginBottom: src ? 8 : 0 } }, src ? "Trocar · " + l : l),
            React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: async (e) => { const file = e.target.files[0]; e.target.value = ""; if (file) set(k, await readBodyPhoto(file)); } })); })),
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, lineHeight: 1.4 } }, "Mesma luz, mesma roupa e mesma distância: fica fácil comparar. Só você e o professor veem."));
}
function Reassessment({ onSubmit, onClose }) {
    const [f, setF] = useState({});
    const [busy, setBusy] = useState(false);
    const ok = !!String(f.peso || "").trim();
    const input = { width: "100%", boxSizing: "border-box", minHeight: 48, padding: "12px 14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, boxShadow: "inset 0 0 0 1px #2A2E37", color: C.text, fontFamily: F.body, fontSize: 15 };
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 98, background: C.ink, overflowY: "auto" } },
        React.createElement("div", { style: { maxWidth: 540, margin: "0 auto", padding: "calc(env(safe-area-inset-top) + 28px) 22px calc(env(safe-area-inset-bottom) + 24px)", display: "flex", flexDirection: "column", gap: 18 } },
            React.createElement("button", { onClick: onClose, style: { alignSelf: "flex-start", minHeight: 44, background: "none", border: "none", color: C.muted, fontFamily: F.body, fontSize: 13, cursor: "pointer", padding: 0 } }, "\u2190 Agora n\u00E3o"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1.05, color: C.text } }, "REAVALIA\u00C7\u00C3O"),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: C.muted, marginTop: 8 } }, "Leva 2 minutos. Seu professor compara com a anamnese e ajusta o treino. S\u00F3 o peso \u00E9 obrigat\u00F3rio.")),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, FIELDS.map(([k, l, m]) => React.createElement("label", { key: k, style: { display: "flex", flexDirection: "column", gap: 6, gridColumn: k === "peso" ? "1 / -1" : undefined } },
                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.muted } }, l),
                React.createElement("input", { inputMode: m, value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value.replace(/[^0-9.,]/g, "") }), style: input })))),
            React.createElement(PosePicker, { value: f.fotos || [], onChange: (fotos) => setF({ ...f, fotos }) }),
            React.createElement("button", { className: "cc-tap", disabled: !ok || busy, onClick: () => { setBusy(true); const num = (v) => (v ? Number(String(v).replace(",", ".")) || undefined : undefined); onSubmit({ date: new Date().toISOString(), peso: num(f.peso), cintura: num(f.cintura), quadril: num(f.quadril), braco: num(f.braco), coxa: num(f.coxa), fotos: f.fotos && f.fotos.length ? f.fotos : undefined }); }, style: { height: 54, borderRadius: 16, border: "none", background: ok ? C.text : "#1E222A", color: ok ? C.ink : "#5A6273", fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: ok ? "pointer" : "default" } }, "Enviar pro professor")));
}
// histórico pro professor: linha de base (anamnese) + cada reavaliação, com a diferença pra anterior
function ReassessmentHistory({ student, onSave }) {
    const all0 = student.reassessments || [];
    const list = all0.filter((r) => !r.onlyPhoto);
    const base = { date: student.assessmentAt, peso: Number(String((student.assessment || {}).peso || "").replace(",", ".")) || undefined, base: true };
    const all = [base, ...list].filter((x) => x.date);
    const cols = FIELDS.filter(([k]) => all.some((r) => r[k] != null));
    const d = (a, b) => (a == null || b == null ? "" : (a - b > 0 ? " +" : " ") + String(Math.round((a - b) * 10) / 10).replace(".", ","));
    return React.createElement("div", { style: { borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line2}`, padding: "14px 16px", marginBottom: 16 } },
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 } },
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, "Reavalia\u00E7\u00F5es"),
            React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontFamily: F.body, fontSize: 13, color: C.muted } }, "a cada",
                React.createElement("select", { value: String(student.reassessEvery || 6), onChange: (e) => onSave({ reassessEvery: Number(e.target.value) }), style: { minHeight: 36, background: C.panel2, color: C.text, border: "none", borderRadius: 10, padding: "0 8px", fontFamily: F.body, fontSize: 13 } }, [4, 6, 8, 12].map((n) => React.createElement("option", { key: n, value: String(n) }, n + " sem."))))),
        list.length === 0 ? React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.5 } }, "O aluno recebe o pedido quando vencer o prazo. A primeira compara\u00E7\u00E3o \u00E9 com a anamnese.")
            : React.createElement("div", { style: { overflowX: "auto", marginTop: 10 } }, React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", fontFamily: F.body, fontSize: 13, color: C.text } },
                React.createElement("thead", null, React.createElement("tr", null, [["d", "Data"], ...cols.map(([k, l]) => [k, l.replace(/ \(.*\)/, "")])].map(([k, l]) => React.createElement("th", { key: k, style: { textAlign: "left", fontWeight: 600, fontSize: 11, color: C.muted, padding: "0 10px 6px 0", whiteSpace: "nowrap" } }, l)))),
                React.createElement("tbody", null, all.map((r, i) => React.createElement("tr", { key: i, style: { borderTop: `1px solid ${C.line}` } },
                    React.createElement("td", { style: { padding: "8px 10px 8px 0", whiteSpace: "nowrap", color: C.muted } }, new Date(r.date).toLocaleDateString("pt-BR") + (r.base ? " \u00B7 anamnese" : "")),
                    cols.map(([k]) => { const prev = all.slice(0, i).reverse().find((x) => x[k] != null); return React.createElement("td", { key: k, style: { padding: "8px 10px 8px 0", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, r[k] != null ? String(r[k]).replace(".", ",") : "\u2014", r[k] != null && prev && React.createElement("span", { style: { color: C.muted, fontSize: 11 } }, d(r[k], prev[k]))); })))))),
        all0.some((r) => photosOf(r).length) && React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", marginTop: 12 } }, all0.flatMap((r, i) => photosOf(r).map((ph, j) => React.createElement("figure", { key: i + "-" + j, style: { margin: 0, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 } },
            React.createElement("img", { src: ph.src, alt: "Foto " + ph.pose + " " + new Date(r.date).toLocaleDateString("pt-BR"), style: { height: 140, borderRadius: 10 } }),
            React.createElement("figcaption", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(/\./g, "") + " · " + ph.pose))))));
}
export { Reassessment, ReassessmentHistory, reassessDue, nextReassess, photosOf, PosePicker };
