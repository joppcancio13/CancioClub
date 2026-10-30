import React from "react";
import { C, SPARKLE_SPOTS } from "../../styles/tokens";

function Sparkles({ color = C.silver }) {
    return (React.createElement(React.Fragment, null, SPARKLE_SPOTS.map((s, i) => (React.createElement("span", { key: i, "aria-hidden": "true", style: { position: "absolute", left: s.x, top: s.y, width: s.size, height: s.size, pointerEvents: "none", animation: `cc-twinkle 3.2s ${s.delay}s ease-in-out infinite` } },
        React.createElement("svg", { width: s.size, height: s.size, viewBox: "0 0 10 10" },
            React.createElement("path", { d: "M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z", fill: color })))))));
}
export { Sparkles };
