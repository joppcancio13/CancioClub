import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

// contexto complementar da anamnese que não tem campo próprio na ficha hoje (idade, peso, altura,
// tempo de treino, sono/estresse) — o resto (objetivo, restrições, grupos de ênfase) já foi
// escrito direto nos campos reais da ficha por mapAnamneseToFicha, então não repete aqui.
function AssessmentSummary({ assessment, assessmentAt, onRequestNew }) {
    const [confirming, setConfirming] = useState(false);
    const stat = (label, value) => value && React.createElement("div", { style: { flex: "1 1 84px" } },
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted } }, label),
        React.createElement("div", { style: { fontFamily: F.body, fontSize: 14.5, color: C.text, marginTop: 3 } }, value));
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
        React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 12, lineHeight: 1.5 } }, "Objetivo, frequência, restrições e grupos de ênfase já foram aplicados nos campos abaixo — editáveis a qualquer momento."),
        onRequestNew && React.createElement("div", { style: { marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a2a2a" } },
            !confirming
                ? React.createElement("button", { onClick: () => setConfirming(true), style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.04em", color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" } }, "Solicitar nova anamnese")
                : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
                    React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.text } }, "O aluno vai preencher de novo no próximo acesso. Confirma?"),
                    React.createElement("button", { onClick: () => { onRequestNew(); setConfirming(false); }, style: { fontFamily: F.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: C.amber, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Confirmar"),
                    React.createElement("button", { onClick: () => setConfirming(false), style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.04em", color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" } }, "Cancelar"))));
}
export { AssessmentSummary };
