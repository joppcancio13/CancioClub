import { ASSESSMENT_TEMPO_SESSAO_LABELS } from "../styles/tokens";

function validateAssessment(data) {
    const errors = {};
    if (!data.nome.trim())
        errors.nome = "Informe o nome completo";
    if (!data.idade)
        errors.idade = "Obrigatório";
    else if (Number(data.idade) <= 0 || Number(data.idade) > 100)
        errors.idade = "Idade inválida";
    if (!data.peso)
        errors.peso = "Obrigatório";
    else if (Number(data.peso) <= 0)
        errors.peso = "Peso inválido";
    if (!data.altura)
        errors.altura = "Obrigatório";
    else if (Number(data.altura) <= 0)
        errors.altura = "Altura inválida";
    if (!data.tempoTreino)
        errors.tempoTreino = "Selecione uma opção";
    if (!data.diasSemana)
        errors.diasSemana = "Selecione os dias disponíveis";
    if (!data.tempoSessao)
        errors.tempoSessao = "Selecione o tempo disponível";
    if (!data.estresseSono)
        errors.estresseSono = "Selecione uma opção";
    if (!data.objetivo)
        errors.objetivo = "Selecione o objetivo";
    return errors;
}
// converte as respostas da anamnese nos campos DE VERDADE que o professor já usa em FichaEditor —
// é isso que faz a informação ser utilizável, em vez de só ficar num resumo à parte que ninguém
// mais lê. Só roda uma vez (no submit do intake), então o professor fica livre pra editar depois
// sem risco de ser pisado de novo; por isso preserva o que já existir em obs/clinicalAlert em vez
// de sobrescrever.
function mapAnamneseToFicha(formData, student) {
    const clinicalParts = [];
    if (formData.lesoes && formData.lesoes.trim())
        clinicalParts.push("Lesão/restrição (relatado pelo aluno): " + formData.lesoes.trim());
    if (formData.medicamentos && formData.medicamentos.trim() && formData.medicamentos.trim().toLowerCase() !== "nenhum")
        clinicalParts.push("Medicamento contínuo: " + formData.medicamentos.trim());
    const clinicalAlert = [student.clinicalAlert, clinicalParts.join("\n")].filter(Boolean).join("\n\n") || undefined;
    const obs = [student.obs, formData.gruposEnfase && formData.gruposEnfase.trim() ? "Grupos com ênfase (relatado pelo aluno): " + formData.gruposEnfase.trim() : ""].filter(Boolean).join("\n\n") || undefined;
    return {
        assessment: formData,
        assessmentAt: new Date().toISOString(),
        goal: formData.objetivo,
        freqWeekly: formData.diasSemana ? `${formData.diasSemana}x na semana` : undefined,
        targetDuration: ASSESSMENT_TEMPO_SESSAO_LABELS[formData.tempoSessao] || undefined,
        clinicalAlert,
        obs,
    };
}
export { validateAssessment, mapAnamneseToFicha };
