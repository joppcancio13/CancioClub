import React, { useState } from "react";
import { ASSESSMENT_TEMPO_SESSAO_LABELS, C, F } from "../../styles/tokens";

// Anamnese completa que o aluno respondeu — mostrada por inteiro aqui, mesmo as respostas que
// mapAnamneseToFicha também copiou pros campos reais da ficha (objetivo, frequência, restrições,
// grupos de ênfase). Antes só os 5 campos sem destino na ficha apareciam aqui e os outros ficavam
// só com um texto genérico dizendo "já foi aplicado abaixo" — o professor não tinha como conferir
// a resposta de verdade do aluno sem caçar nos campos de texto da ficha (restrições, por exemplo,
// vem misturada ali dentro de "Restrições / alertas clínicos" com qualquer nota do professor).
function AssessmentSummary({ assessment, assessmentAt, onRequestNew, forStudent }) {
    const [confirming, setConfirming] = useState(false);
    const stat = (label, value) => value && React.createElement("div", { style: { flex: "1 1 84px" } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted } }, label),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 14.5, color: C.text, marginTop: 3 } }, value));
    const line = (label, value) => value && React.createElement("div", { style: { marginTop: 10 } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted } }, label),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text, marginTop: 3, lineHeight: 1.45, whiteSpace: "pre-wrap" } }, value));
    return React.createElement("div", { style: { border: "1px solid #2a2a2a", borderRadius: 16, padding: "14px 16px", marginBottom: 16 } },
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 } },
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber } }, "Anamnese Inicial"),
            assessmentAt && React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted } }, "preenchido em " + new Date(assessmentAt).toLocaleDateString("pt-BR"))),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 } },
            stat("Idade", assessment.idade && assessment.idade + " anos"),
            stat("Peso", assessment.peso && assessment.peso + " kg"),
            stat("Altura", assessment.altura && assessment.altura + " cm"),
            stat("Treina há", assessment.tempoTreino),
            stat("Sono/estresse", assessment.estresseSono)),
        line("Objetivo", assessment.objetivo),
        line("Frequência desejada", assessment.diasSemana && `${assessment.diasSemana}x na semana` + (assessment.tempoSessao ? ` · ${ASSESSMENT_TEMPO_SESSAO_LABELS[assessment.tempoSessao] || assessment.tempoSessao} por sessão` : "")),
        line("Lesões / restrições relatadas", assessment.lesoes),
        line("Medicamento contínuo", assessment.medicamentos),
        line("Grupos com ênfase pedidos pelo aluno", assessment.gruposEnfase),
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 12, lineHeight: 1.5 } }, forStudent
            ? "Essas respostas também foram usadas pra montar sua ficha (objetivo, frequência, restrições, observações) — o professor pode ajustar esses campos a qualquer momento, sem alterar o que você respondeu aqui."
            : "Essas respostas também foram copiadas pros campos da ficha abaixo (objetivo, frequência, restrições, observações) — editáveis a qualquer momento, sem afetar o que o aluno respondeu aqui."),
        onRequestNew && React.createElement("div", { style: { marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a2a2a" } },
            !confirming
                ? React.createElement("button", { onClick: () => setConfirming(true), style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.04em", color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" } }, "Solicitar nova anamnese")
                : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
                    React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.text } }, forStudent ? "Você vai preencher de novo no seu próximo acesso. Confirma?" : "O aluno vai preencher de novo no próximo acesso. Confirma?"),
                    React.createElement("button", { onClick: () => { onRequestNew(); setConfirming(false); }, style: { fontFamily: F.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: C.amber, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Confirmar"),
                    React.createElement("button", { onClick: () => setConfirming(false), style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.04em", color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Cancelar"))));
}
export { AssessmentSummary };
