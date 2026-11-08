import React, { useState, useEffect } from "react";
import { AssessmentSummary } from "../assessment/AssessmentSummary";
import { ReassessmentHistory } from "../student/Reassessment";
import { Field, TextArea } from "../shared/FormFields";
import { glassPanel } from "../../styles/tokens";

// FichaEditor só é usado dentro da visão do Professor (único call site é no profTab "alunos") —
// por isso o campo de alerta clínico abaixo é seguro aqui: nunca é renderizado pro aluno.
function FichaEditor({ student, onSave, onPrint, onDelete }) {
    const [name, setName] = useState(student.name || "");
    const [goal, setGoal] = useState(student.goal || "");
    const [obs, setObs] = useState(student.obs || "");
    const [freqWeekly, setFreqWeekly] = useState(student.freqWeekly || "");
    const [targetDuration, setTargetDuration] = useState(student.targetDuration || "");
    const [startDate, setStartDate] = useState(student.startDate || "");
    const [clinicalAlert, setClinicalAlert] = useState(student.clinicalAlert || "");
    useEffect(() => {
        setName(student.name || "");
        setGoal(student.goal || "");
        setObs(student.obs || "");
        setFreqWeekly(student.freqWeekly || "");
        setTargetDuration(student.targetDuration || "");
        setStartDate(student.startDate || "");
        setClinicalAlert(student.clinicalAlert || "");
    }, [student.id]);
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 16, padding: 16, marginTop: 12 } },
        student.assessment && React.createElement(AssessmentSummary, { assessment: student.assessment, assessmentAt: student.assessmentAt, onRequestNew: () => onSave({ assessmentAt: undefined }) }),
        student.assessment && React.createElement(ReassessmentHistory, { student, onSave }),
        student.deletionRequestedAt && onDelete && React.createElement("div", { style: { borderRadius: 16, boxShadow: "inset 0 0 0 1px rgba(232,121,75,.35)", padding: "14px 16px", marginBottom: 16 } },
            React.createElement("div", { style: { fontFamily: "inherit", fontWeight: 700, fontSize: 15, color: "#E8794B" } }, "Pedido de exclus\u00E3o (LGPD)"),
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: "#AEB7C6", marginTop: 4 } }, "Pedido em " + new Date(student.deletionRequestedAt).toLocaleDateString("pt-BR") + ". A lei pede resposta em at\u00E9 15 dias. Se quiser guardar algo, baixe o PDF antes."),
            React.createElement("button", { onClick: () => { if (window.confirm("Apagar " + student.name + " e todos os dados? N\u00E3o d\u00E1 pra desfazer.")) onDelete(); }, style: { minHeight: 44, marginTop: 10, padding: "0 16px", borderRadius: 10, border: "none", background: "#E8794B", color: "#05060A", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Apagar aluno e dados")),
        onPrint && React.createElement("button", { onClick: onPrint, style: { minHeight: 44, width: "100%", marginBottom: 16, borderRadius: 10, border: "none", background: "#171B22", color: "#C6D2E4", fontWeight: 600, fontSize: 13, cursor: "pointer" } }, "Ficha e anamnese em PDF"),
        React.createElement(Field, { label: "Nome do aluno", type: "text", value: name, onChange: (e) => setName(e.target.value), onBlur: () => name.trim() && onSave({ name: name.trim() }) }),
        React.createElement("div", { style: { marginTop: 12 } },
            React.createElement(Field, { label: "Objetivo principal", type: "text", placeholder: "Ex.: hipertrofia, for\u00E7a, emagrecimento", value: goal, onChange: (e) => setGoal(e.target.value), onBlur: () => onSave({ goal: goal.trim() || undefined }) })),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
            React.createElement(Field, { label: "Frequ\u00EAncia semanal", type: "text", placeholder: "Ex.: 4x na semana", value: freqWeekly, onChange: (e) => setFreqWeekly(e.target.value), onBlur: () => onSave({ freqWeekly: freqWeekly.trim() || undefined }), flex: "1 1 0" }),
            React.createElement(Field, { label: "Tempo de treino alvo", type: "text", placeholder: "Ex.: 60 min", value: targetDuration, onChange: (e) => setTargetDuration(e.target.value), onBlur: () => onSave({ targetDuration: targetDuration.trim() || undefined }), flex: "1 1 0" })),
        React.createElement("div", { style: { marginTop: 12 } },
            React.createElement(Field, { label: "In\u00EDcio da ficha", type: "date", value: startDate, onChange: (e) => { setStartDate(e.target.value); onSave({ startDate: e.target.value || undefined }); }, flex: "0 1 200px" })),
        React.createElement(TextArea, { label: "Observa\u00E7\u00F5es", rows: 3, placeholder: "Anota\u00E7\u00F5es sobre o aluno: prefer\u00EAncias, hist\u00F3rico. O aluno tamb\u00E9m v\u00EA isso.", value: obs, onChange: (e) => setObs(e.target.value), onBlur: () => onSave({ obs: obs.trim() || undefined }) }),
        React.createElement("div", { style: { marginTop: 12 } },
            React.createElement(TextArea, { label: "Restri\u00E7\u00F5es / alertas cl\u00EDnicos (privado \u2014 s\u00F3 o professor v\u00EA)", rows: 2, placeholder: "Ex.: dor no manguito rotador, condromal\u00E1cia patelar\u2026", value: clinicalAlert, onChange: (e) => setClinicalAlert(e.target.value), onBlur: () => onSave({ clinicalAlert: clinicalAlert.trim() || undefined }) }))));
}
export { FichaEditor };
