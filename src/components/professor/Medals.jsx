import React from "react";
import { C, F, MILESTONES } from "../../styles/tokens";
import { streakTier } from "../../utils/streak";

/* --------------------------- medalhas ---------------------------- */
function Medals({ best }) {
    return (React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 14, flexWrap: "wrap" } }, MILESTONES.map((m) => {
        const e = best >= m;
        const tier = streakTier(m);
        return (React.createElement("div", { key: m, title: `${m} treinos seguidos`, style: { display: "flex", alignItems: "center", gap: 6, opacity: e ? 1 : 0.32, fontFamily: F.mono, fontSize: 11, color: e ? tier.accent : C.muted, border: `1px solid ${e ? tier.accent : C.line}`, borderRadius: 999, padding: "5px 10px" } },
            React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: e ? tier.accent : C.line, display: "inline-block" } }),
            m));
    })));
}
export { Medals };
