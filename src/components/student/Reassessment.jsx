import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

const FIELDS = [["peso", "Peso (kg)", "decimal"], ["cintura", "Cintura (cm)", "decimal"], ["quadril", "Quadril (cm)", "decimal"], ["braco", "Bra\u00E7o (cm)", "decimal"], ["coxa", "Coxa (cm)", "decimal"]];
const readPhoto = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const S = 480, c = document.createElement("canvas"); const k = Math.min(1, S / Math.max(img.width, img.height)); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.8)); }; img.src = r.result; }; r.readAsDataURL(file); });
// quando vence a reavaliação: a cada N semanas (padrão 6) desde a última ou desde a anamnese
function reassessDue(student) {
    if (!student || !student.assessmentAt) return false;
    const list = student.reassessments || [];
    const last = list.length ? list[list.length - 1].date : student.assessmentAt;
    const weeks = Number(student.reassessEvery) || 6;
    return Date.now() - new Date(last).getTime() >= weeks * 7 * 864e5;
}
function Reassessment({ onSubmit, onClose }) {
    const [f, setF] = useState({});
    const [busy, setBusy] = useState(false);
    const ok = !!String(f.peso || "").trim();
    const input = { width: "100%", boxSizing: "border-box", minHeight: 48, padding: "12px 14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, boxShadow: "inset 0 0 0 1px #2A2E37", color: C.text, fontFamily: F.body, fontSize: 15 };
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 96, background: C.ink, overflowY: "auto" } },
        React.createElement("div", { style: { maxWidth: 540, margin: "0 auto", padding: "calc(env(safe-area-inset-top) + 28px) 22px calc(env(safe-area-inset-bottom) + 24px)", display: "flex", flexDirection: "column", gap: 18 } },
            React.createElement("button", { onClick: onClose, style: { alignSelf: "flex-start", minHeight: 44, background: "none", border: "none", color: C.muted, fontFamily: F.body, fontSize: 13, cursor: "pointer", padding: 0 } }, "\u2190 Agora n\u00E3o"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1.05, color: C.text } }, "REAVALIA\u00C7\u00C3O"),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: C.muted, marginTop: 8 } }, "Leva 2 minutos. Seu professor compara com a anamnese e ajusta o treino. S\u00F3 o peso \u00E9 obrigat\u00F3rio.")),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, FIELDS.map(([k, l, m]) => React.createElement("label", { key: k, style: { display: "flex", flexDirection: "column", gap: 6, gridColumn: k === "peso" ? "1 / -1" : undefined } },
                React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.muted } }, l),
                React.createElement("input", { inputMode: m, value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value.replace(/[^0-9.,]/g, "") }), style: input })))),
            React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "0 14px", borderRadius: 16, boxShadow: "inset 0 0 0 1px #2A2E37", cursor: "pointer" } },
                f.foto ? React.createElement("img", { src: f.foto, alt: "", style: { width: 40, height: 40, objectFit: "cover", borderRadius: 10 } }) : React.createElement("span", { style: { fontFamily: F.body, fontSize: 18, color: C.silver } }, "+"),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 15, color: C.text } }, f.foto ? "Trocar foto" : "Foto de corpo (opcional)"),
                React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: async (e) => { const file = e.target.files[0]; if (file) setF({ ...f, foto: await readPhoto(file) }); } })),
            React.createElement("button", { className: "cc-tap", disabled: !ok || busy, onClick: () => { setBusy(true); const num = (v) => (v ? Number(String(v).replace(",", ".")) || undefined : undefined); onSubmit({ date: new Date().toISOString(), peso: num(f.peso), cintura: num(f.cintura), quadril: num(f.quadril), braco: num(f.braco), coxa: num(f.coxa), foto: f.foto || undefined }); }, style: { height: 54, borderRadius: 16, border: "none", background: ok ? C.text : "#1E222A", color: ok ? C.ink : "#5A6273", fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: ok ? "pointer" : "default" } }, "Enviar pro professor")));
}
// histórico pro professor: linha de base (anamnese) + cada reavaliação, com a diferença pra anterior
function ReassessmentHistory({ student, onSave }) {
    const list = student.reassessments || [];
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
        list.some((r) => r.foto) && React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", marginTop: 12 } }, list.filter((r) => r.foto).map((r, i) => React.createElement("img", { key: i, src: r.foto, alt: "Foto " + new Date(r.date).toLocaleDateString("pt-BR"), style: { height: 120, borderRadius: 10, flexShrink: 0 } }))));
}
export { Reassessment, ReassessmentHistory, reassessDue };
