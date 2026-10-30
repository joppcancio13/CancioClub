import React from "react";
import { AssessmentInicial } from "./AssessmentInicial";
import { C } from "../../styles/tokens";

// tela cheia só pra visualizar/testar o formulário isolado, acessível via #assessment sem tocar
// no fluxo principal do app (login por código, ficha do aluno etc.)
function AssessmentInicialScreen() {
    return (React.createElement("div", { style: { minHeight: "100vh", background: C.ink, padding: "32px 16px 64px", boxSizing: "border-box" } },
        React.createElement("div", { style: { maxWidth: 540, margin: "0 auto" } },
            React.createElement(AssessmentInicial, { onSubmit: async (data) => {
                    console.log("Assessment Inicial:", data);
                    await new Promise((r) => setTimeout(r, 900));
                } }))));
}
export { AssessmentInicialScreen };
