import React from "react";
import { C, F } from "../../styles/tokens";

function Stat({ value, label, accent }) { return React.createElement("div", { style: { flex: 1 } },
    React.createElement("div", { style: { fontFamily: F.display, fontSize: 27, fontWeight: 800, letterSpacing: "-0.03em", color: accent || "#FFFFFF", lineHeight: 1 } }, value),
    React.createElement("div", { style: { fontFamily: F.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginTop: 7 } }, label)); }
export { Stat };
