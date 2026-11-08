import React from "react";
import { C } from "../../styles/tokens";

// 16d — cartão fantasma no formato real (nome + pastilhas), com brilho passando
function SkeletonCard() {
    return React.createElement("div", { style: { position: "relative", overflow: "hidden", padding: "14px 16px", borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", gap: 10 } },
        React.createElement("span", { style: { width: "55%", height: 12, borderRadius: 3, background: "#15181F" } }),
        React.createElement("div", { style: { display: "flex", gap: 3 } }, [0, 1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: 22, height: 8, borderRadius: 1.5, background: "#15181F" } }))),
        React.createElement("div", { className: "cc-shimmer", "aria-hidden": "true" }));
}
export { SkeletonCard };
