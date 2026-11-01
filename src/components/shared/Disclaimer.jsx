import React from "react";
import { DiscoBall } from "./DiscoBall";
import { C, F, flatPanel } from "../../styles/tokens";

/* ----------------------- termo de responsabilidade --------------- */
function Disclaimer({ onAccept }) {
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(8,9,12,.86)", padding: 18 } },
        React.createElement("div", { style: { ...flatPanel, borderRadius: 26, maxWidth: 420, width: "100%", padding: "26px 22px", maxHeight: "88vh", overflowY: "auto" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 } },
                React.createElement(DiscoBall, { size: 30, seedN: 5 }),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontSize: 16, letterSpacing: "0.04em" } }, "Antes de come\u00E7ar")),
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.text, lineHeight: 1.65 } },
                React.createElement("p", { style: { marginTop: 0 } },
                    "O Cancio Club \u00E9 uma ferramenta de apoio ao seu treino. Ele ",
                    React.createElement("b", null, "n\u00E3o substitui"),
                    " a avalia\u00E7\u00E3o presencial de um profissional de Educa\u00E7\u00E3o F\u00EDsica nem a orienta\u00E7\u00E3o m\u00E9dica."),
                React.createElement("p", null, "Antes de iniciar qualquer programa de exerc\u00EDcios, consulte um m\u00E9dico \u2014 especialmente se voc\u00EA tem alguma condi\u00E7\u00E3o de sa\u00FAde, les\u00E3o, ou est\u00E1 h\u00E1 muito tempo sem treinar."),
                React.createElement("p", { style: { color: C.warn } },
                    "Durante o treino, respeite seus limites. Se sentir dor, tontura, falta de ar ou qualquer desconforto, ",
                    React.createElement("b", null, "pare imediatamente"),
                    " e avise seu professor."),
                React.createElement("p", { style: { marginBottom: 0 } }, "Ao continuar, voc\u00EA confirma que leu e entendeu estas orienta\u00E7\u00F5es e que treina dentro das suas condi\u00E7\u00F5es e por sua conta e risco.")),
            React.createElement("button", { onClick: onAccept, style: { marginTop: 20, width: "100%", fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer" } }, "Li e concordo"))));
}
export { Disclaimer };
