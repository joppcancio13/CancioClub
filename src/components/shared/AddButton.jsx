import React from "react";
import { C, F } from "../../styles/tokens";

function AddButton({ onClick, label }) { return React.createElement("button", { onClick: onClick, style: { minHeight: 44, width: "100%", fontFamily: F.mono, fontSize: 13, letterSpacing: "0.04em", color: C.silver, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", border: "none", borderRadius: 16, padding: "16px", cursor: "pointer" } }, label); }
export { AddButton };
