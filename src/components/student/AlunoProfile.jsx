import React, { useState } from "react";
import { AssessmentSummary } from "../assessment/AssessmentSummary";
import { StudentCard } from "../share/StudentCard";
import { MyData } from "./MyData";
import { Reassessment, reassessDue } from "./Reassessment";
import { C, DAYS, F } from "../../styles/tokens";
import { fmtDate } from "../../utils/date";
import { printStudent } from "../../utils/printStudent";
import { planSummary } from "../../utils/workout";

// Aba "Perfil" do aluno — autosserviço pedido pelo aluno: ver os próprios dados, a ficha
// completa da semana (não só o dia de hoje), recordes e a anamnese que ele respondeu, sem
// precisar que o professor mostre. Tudo somente leitura, exceto "solicitar nova anamnese"
// (já existia pro professor em AssessmentSummary — reaproveitado aqui tal e qual), "meus dados"
// (LGPD — baixar cópia/pedir exclusão) e "reavaliação" (peso/medidas periódicas).
function AlunoProfile({ student, streak, freqWeek, freqTotal, bestStreak, records, week, dayNames, assessmentAt, onRequestNewAssessment, onRequestDelete, onSubmitReassessment }) {
    const [cardOpen, setCardOpen] = useState(false);
    const [myDataOpen, setMyDataOpen] = useState(false);
    const [reassessOpen, setReassessOpen] = useState(false);
    const due = reassessDue(student);
    const downloadMyData = () => {
        const mine = { aluno: { ...student, clinicalAlert: undefined }, treinos: week, exportadoEm: new Date().toISOString() };
        const url = URL.createObjectURL(new Blob([JSON.stringify(mine, null, 2)], { type: "application/json" }));
        const a = document.createElement("a"); a.href = url; a.download = "meus-dados-cancio-club.json"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        printStudent({ student, week, dayNames });
    };
    const statB = (v, l) => React.createElement("div", { style: { flex: 1, textAlign: "center" } },
        React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 22, color: C.text } }, v),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 10.5, color: C.muted, marginTop: 2 } }, l));
    const section = (label, content) => React.createElement("div", { style: { marginTop: 22 } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 } }, label),
        content);
    const fieldLine = (label, value) => value && React.createElement("div", { style: { marginBottom: 10 } },
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 12, color: C.muted } }, label + ": "),
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text } }, value));
    const activeDays = DAYS.filter((d) => (week[d.key] || []).length > 0);
    return React.createElement("div", { className: "cc-view" },
        React.createElement("div", { style: { border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", display: "flex" } },
            statB(streak, "seguidos"), statB(bestStreak, "recorde"), statB(freqWeek, "semana"), statB(freqTotal, "total")),
        section("Seus dados", React.createElement("div", { style: { border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px" } },
            fieldLine("Nome", student.name),
            fieldLine("Código", student.code),
            fieldLine("Objetivo", student.goal),
            fieldLine("Frequência", [student.freqWeekly, student.targetDuration].filter(Boolean).join(" · ")),
            fieldLine("Treinando desde", student.startDate && fmtDate(student.startDate)),
            fieldLine("Observações do professor", student.obs),
            React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" } },
                React.createElement("button", { className: "cc-tap", onClick: () => setCardOpen(true), style: { fontFamily: F.body, fontWeight: 600, fontSize: 12.5, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Ver carteirinha ›"),
                React.createElement("button", { className: "cc-tap", onClick: () => setMyDataOpen(true), style: { fontFamily: F.body, fontWeight: 600, fontSize: 12.5, color: C.silver, background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Meus dados ›")))),
        section("Reavaliação", React.createElement("div", { style: { border: `1px solid ${due ? "rgba(232,121,75,.35)" : "#2a2a2a"}`, borderRadius: 16, padding: "14px 16px" } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: due ? C.text : C.muted } }, due ? "Está na hora de atualizar peso e medidas — leva 2 minutos." : "Peso e medidas periódicas, pra você e seu professor acompanharem a evolução."),
            React.createElement("button", { className: "cc-tap", onClick: () => setReassessOpen(true), style: { marginTop: 10, fontFamily: F.body, fontWeight: 700, fontSize: 12.5, color: due ? C.ink : C.silver, background: due ? C.text : "transparent", boxShadow: due ? "none" : "inset 0 0 0 1px #2E333D", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, "Fazer reavaliação"))),
        records.length > 0 && section("Recordes", React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
            records.map((r) => React.createElement("div", { key: r.name, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", border: "1px solid #2a2a2a", borderRadius: 12, padding: "10px 14px" } },
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text } }, r.name),
                React.createElement("span", { style: { display: "flex", alignItems: "baseline", gap: 8 } },
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "75%", fontSize: 16, color: C.text } }, r.best + " kg"),
                    React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted } }, fmtDate(r.date))))))),
        section("Sua ficha", React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            activeDays.length === 0 && React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, "Sua ficha ainda está em branco."),
            activeDays.map((d) => { const name = (dayNames && dayNames[d.key]) || d.full; return React.createElement("div", { key: d.key, style: { border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 14px" } },
                React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 13.5, color: C.text, marginBottom: 6 } }, name),
                (week[d.key] || []).map((ex) => React.createElement("div", { key: ex.id, style: { display: "flex", justifyContent: "space-between", gap: 8, fontFamily: F.body, fontSize: 12.5, color: C.muted, padding: "4px 0" } },
                    React.createElement("span", null, ex.name),
                    React.createElement("span", null, planSummary(ex))))); }))),
        student.assessment && React.createElement("div", { style: { marginTop: 22 } },
            React.createElement(AssessmentSummary, { assessment: student.assessment, assessmentAt: assessmentAt, onRequestNew: onRequestNewAssessment, forStudent: true })),
        cardOpen && React.createElement(StudentCard, { student: student, memberSince: student.startDate, onClose: () => setCardOpen(false) }),
        myDataOpen && React.createElement(MyData, { student: student, onDownload: downloadMyData, onRequestDelete: () => { onRequestDelete(); setMyDataOpen(false); }, onClose: () => setMyDataOpen(false) }),
        reassessOpen && React.createElement(Reassessment, { onSubmit: (data) => { onSubmitReassessment(data); setReassessOpen(false); }, onClose: () => setReassessOpen(false) }));
}
export { AlunoProfile };
