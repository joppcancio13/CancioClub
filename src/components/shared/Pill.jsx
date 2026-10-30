import React from "react";
import { C, EASE, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

/* ------------------------- UI primitives ------------------------- */
function Pill({ active, children, onClick, title }) { return React.createElement("button", { className: "cc-pill", onClick: (e) => { haptic("tick"); onClick && onClick(e); }, title: title, style: { fontFamily: F.display, fontWeight: active ? 700 : 600, fontSize: 13, letterSpacing: "0.02em", padding: "9px 15px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap", color: active ? "#05060A" : C.muted, background: active ? "linear-gradient(150deg,#EEF3FB,#B9C6D9)" : "rgba(255,255,255,0.045)", border: "none", transition: `transform .18s ${EASE.spring}, background .15s ease, color .15s ease` } }, children); }
export { Pill };
