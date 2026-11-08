import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { SECTIONS } from "./AssessmentInicial";

// anamnese completa pro professor: todas as respostas, agrupadas pelas mesmas seções que o aluno
// preencheu. Respostas "sim" na triagem de saúde ficam no tom de alerta.
const fmt = (st, v) => { if (v == null || String(v).trim() === "") return null; const o = (st.options || []).find((x) => x.value === v); return o ? o.label : String(v); };
function AssessmentSummary({ assessment: a, assessmentAt, onRequestNew }) {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const groups = SECTIONS.filter((s) => s.key !== "enviar").map((s) => {
        const rows = [];
        s.steps.forEach((st) => {
            if (st.showIf && !st.showIf(a)) return;
            if (st.type === "photo") return;
            if (st.type === "fields") { st.fields.forEach((fd) => { const v = fmt(fd, a[fd.key]); if (v) rows.push({ q: fd.label, v }); }); if (s.key === "voce" && a.idade) rows.splice(1, 0, { q: "Idade", v: a.idade + " anos" }); return; }
            if (st.type === "yn") { const yes = a[st.key] === "sim"; if (a[st.key] == null) return; rows.push({ q: st.q, v: yes ? "Sim" + (a[st.key + "Detalhe"] ? " \u2014 " + a[st.key + "Detalhe"] : "") : "N\u00E3o", alert: yes }); return; }
            const v = fmt(st, a[st.key]); rows.push({ q: st.q, v: v || "\u2014", empty: !v });
        });
        return { title: s.title, rows };
    });
    const flags = (a.saudeAlertas || []).length;
    const quick = [["Idade", a.idade && a.idade + " anos"], ["Peso", a.peso && a.peso + " kg"], ["Altura", a.altura && a.altura + " cm"], ["Objetivo", a.objetivo]].filter((x) => x[1]);
    const btn = { minHeight: 44, fontFamily: F.body, fontSize: 13, fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer" };
    return React.createElement("div", { style: { borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line2}`, padding: "14px 16px", marginBottom: 16 } },
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 } },
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, "Anamnese"),
            assessmentAt && React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, "respondida em " + new Date(assessmentAt).toLocaleDateString("pt-BR"))),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px 16px", marginTop: 12 } }, quick.map(([l, v]) => React.createElement("div", { key: l, style: { flex: "1 1 80px" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, l),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 15, color: C.text, marginTop: 2 } }, v)))),
        flags > 0 && React.createElement("div", { style: { marginTop: 12, fontFamily: F.body, fontSize: 13, lineHeight: 1.45, color: C.warn } }, (a.saudeAlertas || []).join(" \u00B7 ")),
        React.createElement("button", { onClick: () => setOpen((v) => !v), style: { ...btn, color: C.silver, marginTop: 6 } }, open ? "Recolher respostas" : "Ver todas as respostas \u203A"),
        open && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18, marginTop: 6 } }, groups.map((g) => React.createElement("div", { key: g.title },
            React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 13, color: C.muted, marginBottom: 8 } }, g.title),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, g.rows.map((r, i) => React.createElement("div", { key: i },
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.35 } }, r.q),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 15, lineHeight: 1.4, marginTop: 2, whiteSpace: "pre-wrap", color: r.alert ? C.warn : r.empty ? "#5A6273" : C.text } }, r.v))))))),
        onRequestNew && React.createElement("div", { style: { marginTop: 12, paddingTop: 4, borderTop: `1px solid ${C.line}` } },
            !confirming
                ? React.createElement("button", { onClick: () => setConfirming(true), style: { ...btn, color: C.muted, textDecoration: "underline" } }, "Solicitar nova anamnese")
                : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } },
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.text } }, "O aluno preenche de novo no pr\u00F3ximo acesso. Confirma?"),
                    React.createElement("button", { onClick: () => { onRequestNew(); setConfirming(false); }, style: { ...btn, fontWeight: 700, color: C.text } }, "Confirmar"),
                    React.createElement("button", { onClick: () => setConfirming(false), style: { ...btn, color: C.muted } }, "Cancelar"))));
}
export { AssessmentSummary };
