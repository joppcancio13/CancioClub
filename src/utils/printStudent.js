import { DAYS } from "../styles/tokens";
import { SECTIONS } from "../components/assessment/AssessmentInicial";
import { planSummary } from "./workout";

// ficha + anamnese em página imprimível — o aluno/professor salva como PDF pelo "Imprimir" do celular.
// Usa um iframe escondido (window.open é bloqueado em PWA no iOS).
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function printStudent({ student, week, dayNames, includeAnamnese = true, includePrivate = false }) {
    const a = student.assessment || {};
    const days = DAYS.filter((d) => (week[d.key] || []).length).map((d) => `<h3>${esc((dayNames || {})[d.key] || d.full)}</h3><table>${(week[d.key] || []).map((ex) => `<tr><td>${esc(ex.name)}${ex.note ? `<div class="n">${esc(ex.note)}</div>` : ""}</td><td class="r">${esc(planSummary(ex))}${ex.rest ? " · " + esc(ex.rest) + "s" : ""}</td></tr>`).join("")}</table>`).join("");
    const anam = includeAnamnese && student.assessment ? SECTIONS.filter((s) => s.key !== "enviar").map((s) => {
        const rows = [];
        s.steps.forEach((st) => {
            if (st.type === "photo" || (st.showIf && !st.showIf(a))) return;
            if (st.type === "fields") return st.fields.forEach((fd) => a[fd.key] && rows.push([fd.label, a[fd.key]]));
            if (st.type === "yn") return a[st.key] != null && rows.push([st.q, a[st.key] === "sim" ? "Sim" + (a[st.key + "Detalhe"] ? " — " + a[st.key + "Detalhe"] : "") : "Não"]);
            const o = (st.options || []).find((x) => x.value === a[st.key]); if (a[st.key]) rows.push([st.q, o ? o.label : a[st.key]]);
        });
        return rows.length ? `<h3>${esc(s.title)}</h3><table>${rows.map(([q, v]) => `<tr><td class="q">${esc(q)}</td><td>${esc(v)}</td></tr>`).join("")}</table>` : "";
    }).join("") : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(student.name)} · Cancio Club</title><style>
    @page{margin:16mm}body{font:11pt/1.45 -apple-system,system-ui,sans-serif;color:#111;margin:0}h1{font-size:20pt;margin:0}h2{font-size:13pt;margin:22px 0 4px;border-bottom:1px solid #999;padding-bottom:4px}h3{font-size:11pt;margin:14px 0 4px}
    table{width:100%;border-collapse:collapse}td{padding:5px 0;border-bottom:1px solid #ddd;vertical-align:top}td.r{text-align:right;white-space:nowrap;padding-left:12px}td.q{color:#555;width:48%;padding-right:12px}.n{color:#555;font-size:10pt}.m{color:#555}</style></head><body>
    <h1>${esc(student.name)}</h1><div class="m">Cancio Club · ${new Date().toLocaleDateString("pt-BR")}${student.goal ? " · Objetivo: " + esc(student.goal) : ""}${student.freqWeekly ? " · " + esc(student.freqWeekly) : ""}</div>
    ${includePrivate && student.clinicalAlert ? `<h2>Alertas clínicos (privado)</h2><div>${esc(student.clinicalAlert).replace(/\n/g, "<br>")}</div>` : ""}
    <h2>Ficha de treino</h2>${days || "<p>Sem exercícios.</p>"}${anam ? "<h2>Anamnese</h2>" + anam : ""}</body></html>`;
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(f);
    f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } finally { setTimeout(() => f.remove(), 2000); } }, 250);
}
export { printStudent };
