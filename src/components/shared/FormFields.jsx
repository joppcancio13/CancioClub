import React from "react";
import { C, F } from "../../styles/tokens";

function Field({ label, flex, ...props }) {
    const isDate = props.type === "date";
    return (React.createElement("label", { style: { minHeight: 44, display: "flex", flexDirection: "column", gap: 5, flex: flex || "1 1 auto" } },
        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.muted } }, label),
        React.createElement("div", { style: { position: "relative" } },
            isDate && React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: C.amber, pointerEvents: "none" } }),
            React.createElement("input", { ...props, style: { fontFamily: props.type === "text" ? F.body : F.mono, fontSize: 15, color: C.text, background: "rgba(255,255,255,0.04)", boxShadow: isDate ? `inset 0 0 0 1px ${C.amber}2a` : "none", border: "none", borderRadius: 16, padding: isDate ? "12px 14px 12px 26px" : "12px 14px", outline: "none", width: "100%", boxSizing: "border-box", colorScheme: "dark" } }))));
}
function TextArea({ label, ...props }) {
    return (React.createElement("label", { style: { minHeight: 44, display: "block", marginTop: 12 } },
        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 13, color: C.muted } }, label),
        React.createElement("textarea", { ...props, style: { marginTop: 5, width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 15, color: C.text, background: "rgba(255,255,255,0.04)", border: "none", borderRadius: 16, padding: "12px 14px", outline: "none", resize: "vertical", lineHeight: 1.5 } })));
}
export { Field, TextArea };
