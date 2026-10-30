import React from "react";
import { C, F } from "../../styles/tokens";

function AddButton({ onClick, label }) { return React.createElement("button", { onClick: onClick, style: { width: "100%", fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.silver, background: "radial-gradient(circle at 50% 0%, #2A2A2D, #0A0A0C)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", border: "none", borderRadius: 18, padding: "16px", cursor: "pointer" } }, label); }
export { AddButton };
