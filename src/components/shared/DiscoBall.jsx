import React from "react";
import { BALL_URL } from "../../styles/tokens";

function DiscoBall({ size = 44, cols, rows, seedN, glow = true, tint = "#B8B8C0" }) {
    // Arte nova: a bola deixou de ser desenhada em SVG dentro do app e passou a ser o PNG
    // renderizado em 3D fora dele (selo-bola-transparente.png). As props cols/rows/seedN
    // continuam sendo aceitas só para não quebrar as chamadas antigas — não são mais usadas.
    // O glow colorido sai do filter do <img> (dois drop-shadow empilhados em cima de um PNG
    // com alpha geram uma borda quadrada fantasma no Safari/iOS) e vira um elemento à parte,
    // com blur simples — a bola em si leva só a sombra de profundidade.
    const drop = `drop-shadow(0 ${size * 0.1}px ${size * 0.14}px rgba(0,0,0,0.5))`;
    return React.createElement("div", { style: { position: "relative", width: size, height: size } },
        glow && React.createElement("div", {
            "aria-hidden": "true",
            style: {
                position: "absolute", inset: -size * 0.3, borderRadius: "50%",
                background: `radial-gradient(circle, ${tint}40 0%, ${tint}00 70%)`,
                filter: `blur(${size * 0.12}px)`, pointerEvents: "none",
            }
        }),
        React.createElement("img", {
            src: BALL_URL, alt: "", "aria-hidden": "true", width: size, height: size,
            style: { width: size, height: size, display: "block", position: "relative", filter: drop }
        })
    );
}
export { DiscoBall };
