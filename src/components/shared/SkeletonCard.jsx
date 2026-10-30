import React from "react";
import { glassPanel } from "../../styles/tokens";

// mesmo formato do cabeçalho recolhido do ExerciseCard (avatar + 2 linhas + número), só que em
// barras cinza com um brilho passando da esquerda pra direita — usado enquanto o app ainda não
// tem certeza do que vai mostrar (só no boot hoje; fica pronto pro que mais precisar de loading)
function SkeletonCard() {
    return (React.createElement("div", { style: { position: "relative", overflow: "hidden", ...glassPanel, borderRadius: 26 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "16px 18px" } },
            React.createElement("div", { style: { flexShrink: 0, width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.06)" } }),
            React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 } },
                React.createElement("div", { style: { width: "58%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)" } }),
                React.createElement("div", { style: { width: "38%", height: 9, borderRadius: 5, background: "rgba(255,255,255,0.05)" } })),
            React.createElement("div", { style: { flexShrink: 0, width: 44, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)" } })),
        React.createElement("div", { className: "cc-shimmer", "aria-hidden": "true" })));
}
export { SkeletonCard };
