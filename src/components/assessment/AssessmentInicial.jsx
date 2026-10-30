import React, { useState } from "react";
import { AssessmentChoiceGroup, AssessmentField, AssessmentSection, AssessmentSelect, AssessmentTextArea } from "./AssessmentFields";
import { ASSESSMENT_CSS, ASSESSMENT_DIAS_OPTIONS, ASSESSMENT_ESTRESSE_OPTIONS, ASSESSMENT_OBJETIVO_OPTIONS, ASSESSMENT_TEMPO_SESSAO_OPTIONS, ASSESSMENT_TEMPO_TREINO_OPTIONS, C, F, glassPanel } from "../../styles/tokens";
import { validateAssessment } from "../../utils/assessment";

// formulário de anamnese em 4 seções; onSubmit(data) é opcional e pode ser assíncrono (ex.: gravar
// no Supabase) — o botão entra em estado de loading enquanto a promise não resolve.
function AssessmentInicial({ onSubmit, defaultName }) {
    const [form, setForm] = useState({
        nome: defaultName || "", idade: "", peso: "", altura: "",
        tempoTreino: "", lesoes: "", medicamentos: "",
        diasSemana: "", tempoSessao: "", estresseSono: "",
        objetivo: "", gruposEnfase: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [done, setDone] = useState(false);
    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validateAssessment(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0)
            return;
        setSubmitError("");
        setSubmitting(true);
        try {
            if (onSubmit)
                await onSubmit(form);
            setDone(true);
        }
        catch (err) {
            setSubmitError((err && err.message) || "Não foi possível enviar. Tente novamente.");
        }
        finally {
            setSubmitting(false);
        }
    }
    if (done) {
        return (React.createElement("div", { style: { ...glassPanel, padding: "48px 28px", textAlign: "center" } },
            React.createElement("div", { style: { width: 52, height: 52, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: `${C.amber}1f`, border: `1px solid ${C.amber}` } },
                React.createElement("span", { style: { fontSize: 22, color: C.amber } }, "✓")),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text } }, "Anamnese recebida"),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.muted, marginTop: 10, lineHeight: 1.6 } }, "Sua ficha inicial foi enviada. Nossa equipe vai analisar suas respostas antes do primeiro ciclo.")));
    }
    return (React.createElement("form", { onSubmit: handleSubmit, noValidate: true, style: { display: "flex", flexDirection: "column" } },
        React.createElement("style", null, ASSESSMENT_CSS),
        React.createElement("div", { style: { marginBottom: 26, textAlign: "center" } },
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.24em", color: C.amber, textTransform: "uppercase" } }, "Cancio Club"),
            React.createElement("h1", { style: { margin: "8px 0 0", fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", color: C.text } }, "Anamnese Inicial"),
            React.createElement("p", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.6 } }, "Preencha com precisão. Essas respostas definem a estrutura do seu ciclo de treino.")),
        React.createElement(AssessmentSection, { index: 1, title: "Perfil Básico" },
            React.createElement(AssessmentField, { label: "Nome completo", value: form.nome, onChange: set("nome"), error: errors.nome, placeholder: "Seu nome" }),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 14 } },
                React.createElement("div", { style: { flex: "1 1 110px" } }, React.createElement(AssessmentField, { label: "Idade", inputMode: "numeric", value: form.idade, onChange: set("idade"), error: errors.idade, placeholder: "anos" })),
                React.createElement("div", { style: { flex: "1 1 110px" } }, React.createElement(AssessmentField, { label: "Peso atual (kg)", inputMode: "decimal", value: form.peso, onChange: set("peso"), error: errors.peso, placeholder: "kg" })),
                React.createElement("div", { style: { flex: "1 1 110px" } }, React.createElement(AssessmentField, { label: "Altura (cm)", inputMode: "numeric", value: form.altura, onChange: set("altura"), error: errors.altura, placeholder: "cm" })))),
        React.createElement(AssessmentSection, { index: 2, title: "Histórico & Biomecânica" },
            React.createElement(AssessmentSelect, { label: "Tempo contínuo de musculação", value: form.tempoTreino, onChange: set("tempoTreino"), options: ASSESSMENT_TEMPO_TREINO_OPTIONS, placeholder: "Selecione...", error: errors.tempoTreino }),
            React.createElement(AssessmentTextArea, { label: "Lesão, dor articular ou restrição médica", value: form.lesoes, onChange: set("lesoes"), placeholder: "Descreva ou escreva “Nenhuma”", rows: 3 }),
            React.createElement(AssessmentField, { label: "Uso contínuo de medicamento", value: form.medicamentos, onChange: set("medicamentos"), placeholder: "Descreva ou escreva “Nenhum”" })),
        React.createElement(AssessmentSection, { index: 3, title: "Rotina & Capacidade de Treino" },
            React.createElement(AssessmentChoiceGroup, { label: "Dias por semana disponíveis", value: form.diasSemana, onChange: set("diasSemana"), options: ASSESSMENT_DIAS_OPTIONS, error: errors.diasSemana }),
            React.createElement(AssessmentChoiceGroup, { label: "Tempo médio por sessão", value: form.tempoSessao, onChange: set("tempoSessao"), options: ASSESSMENT_TEMPO_SESSAO_OPTIONS, error: errors.tempoSessao }),
            React.createElement(AssessmentChoiceGroup, { label: "Estresse e qualidade do sono", value: form.estresseSono, onChange: set("estresseSono"), options: ASSESSMENT_ESTRESSE_OPTIONS, error: errors.estresseSono })),
        React.createElement(AssessmentSection, { index: 4, title: "Objetivos" },
            React.createElement(AssessmentSelect, { label: "Objetivo principal do ciclo trimestral", value: form.objetivo, onChange: set("objetivo"), options: ASSESSMENT_OBJETIVO_OPTIONS, placeholder: "Selecione...", error: errors.objetivo }),
            React.createElement(AssessmentTextArea, { label: "Grupos musculares com dificuldade ou ênfase", value: form.gruposEnfase, onChange: set("gruposEnfase"), placeholder: "Ex: posterior de coxa, ombro...", rows: 3 })),
        submitError && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 12, color: C.warn, textAlign: "center", marginBottom: 14 } }, submitError),
        React.createElement("button", { type: "submit", disabled: submitting, className: "cc-assess-submit", style: {
                width: "100%", fontFamily: F.mono, fontSize: 13.5, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: C.ink, background: submitting ? "#9AA4B5" : `linear-gradient(150deg, #EEF3FB, #B9C6D9)`,
                border: "none", borderRadius: 14, padding: "18px", cursor: submitting ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 10px 24px rgba(184,180,255,0.22)", transition: "transform .15s ease, box-shadow .15s ease",
                opacity: submitting ? 0.85 : 1,
            } },
            submitting && React.createElement("span", { className: "cc-assess-spinner", "aria-hidden": "true" }),
            submitting ? "Enviando..." : "Enviar Anamnese")));
}
export { AssessmentInicial };
