import React from "react";

// Carregando — design v4 (55a): blocos #11141A, raio 8, no formato do conteúdo. Nada de spinner;
// o título da tela continua visível (quem usa só troca o conteúdo por estes blocos).
const BLOCK = "#11141A";

function SkeletonCard() {
    return (
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
            <span style={{ width: 36, height: 36, flex: "none", borderRadius: 8, background: BLOCK }} />
            <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ width: "55%", height: 14, borderRadius: 8, background: BLOCK }} />
                <span style={{ width: "35%", height: 10, borderRadius: 8, background: BLOCK }} />
            </span>
            <span style={{ width: 36, height: 14, borderRadius: 8, background: BLOCK }} />
        </div>
    );
}
export { SkeletonCard };
