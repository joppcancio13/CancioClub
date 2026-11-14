import React from "react";
import { MIRROR_GRID } from "../../styles/tokens";

function MirrorGlobe({ size = 108, mask, tile }) {
    const t = tile || Math.max(5, Math.round(size / 12));
    return React.createElement("div", { "aria-hidden": "true", style: { position: "relative", width: size, height: size, flexShrink: 0 } },
        React.createElement("div", { style: { position: "absolute", inset: 0, borderRadius: "50%", // base (0% de progresso): já com um reflexo prata suave, pra não parecer um círculo vazio/quebrado
            background: MIRROR_GRID(t) + ",radial-gradient(circle at 34% 28%,#6B7383 0%,#3A404C 30%,#22262E 62%,#14171D 92%)" } }),
        React.createElement("div", { style: { position: "absolute", inset: 0, borderRadius: "50%", background: MIRROR_GRID(t) + ",radial-gradient(circle at 34% 28%,#FFFFFF 0%,#DCE3EE 22%,#AEB7C6 55%,#4A5160 88%)", WebkitMaskImage: mask, maskImage: mask, transition: "-webkit-mask-image .5s ease, mask-image .5s ease" } }));
}
export { MirrorGlobe };
