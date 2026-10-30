import React, { useState } from "react";
import { C, EASE, F, assessmentLabelStyle, glassPanel } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

function AssessmentField({ label, value, onChange, error, type, ...rest }) {
    const [focused, setFocused] = useState(false);
    return (React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 5 } },
        React.createElement("span", { style: assessmentLabelStyle }, label),
        React.createElement("input", { ...rest, type: type || "text", value: value, className: "cc-assess-input", onChange: (e) => onChange(e.target.value), onFocus: () => setFocused(true), onBlur: () => setFocused(false), style: {
                fontFamily: F.body, fontSize: 15, color: C.text, background: "rgba(255,255,255,0.03)",
                border: `1px solid ${error ? C.warn : (focused ? C.amber : "#2a2a2a")}`, borderRadius: 14,
                padding: "12px 14px", outline: "none", width: "100%", boxSizing: "border-box", colorScheme: "dark",
                boxShadow: focused ? `0 0 0 3px ${C.amber}1f` : "none", transition: "border-color .18s ease, box-shadow .18s ease",
            } }),
        error && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.warn } }, error)));
}
function AssessmentTextArea({ label, value, onChange, error, ...rest }) {
    const [focused, setFocused] = useState(false);
    return (React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 5 } },
        React.createElement("span", { style: assessmentLabelStyle }, label),
        React.createElement("textarea", { ...rest, value: value, className: "cc-assess-input", onChange: (e) => onChange(e.target.value), onFocus: () => setFocused(true), onBlur: () => setFocused(false), style: {
                fontFamily: F.body, fontSize: 14, color: C.text, background: "rgba(255,255,255,0.03)",
                border: `1px solid ${error ? C.warn : (focused ? C.amber : "#2a2a2a")}`, borderRadius: 14,
                padding: "12px 14px", outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5,
                boxShadow: focused ? `0 0 0 3px ${C.amber}1f` : "none", transition: "border-color .18s ease, box-shadow .18s ease",
            } }),
        error && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.warn } }, error)));
}
function AssessmentSelect({ label, value, onChange, options, placeholder, error }) {
    const [focused, setFocused] = useState(false);
    return (React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 5 } },
        React.createElement("span", { style: assessmentLabelStyle }, label),
        React.createElement("div", { style: { position: "relative" } },
            React.createElement("select", { value: value || "", className: "cc-assess-input", onChange: (e) => onChange(e.target.value), onFocus: () => setFocused(true), onBlur: () => setFocused(false), style: {
                    fontFamily: F.body, fontSize: 15, color: value ? C.text : C.muted, background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${error ? C.warn : (focused ? C.amber : "#2a2a2a")}`, borderRadius: 14,
                    padding: "12px 38px 12px 14px", outline: "none", width: "100%", boxSizing: "border-box",
                    appearance: "none", WebkitAppearance: "none", colorScheme: "dark", cursor: "pointer",
                    boxShadow: focused ? `0 0 0 3px ${C.amber}1f` : "none", transition: "border-color .18s ease, box-shadow .18s ease",
                } },
                React.createElement("option", { value: "", disabled: true }, placeholder || "Selecione..."),
                options.map((opt) => React.createElement("option", { key: opt, value: opt }, opt))),
            React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted, fontSize: 11 } }, "▾")),
        error && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 10.5, color: C.warn } }, error)));
}
function AssessmentChoiceGroup({ label, value, onChange, options, error }) {
    return (React.createElement("div", null,
        React.createElement("span", { style: assessmentLabelStyle }, label),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 } }, options.map((opt) => {
            const active = value === opt.value;
            return React.createElement("button", { key: opt.value, type: "button", onClick: () => { haptic("tick"); onChange(opt.value); }, className: "cc-assess-choice" + (active ? " cc-assess-choice--active" : ""), style: {
                    flex: "0 1 84px", minWidth: 74, fontFamily: F.mono, fontSize: 13, fontWeight: active ? 700 : 500,
                    letterSpacing: "0.03em", padding: "13px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                    color: active ? C.ink : C.text, background: active ? C.amber : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? C.amber : "#2a2a2a"}`,
                    transition: `background .18s ease, border-color .18s ease, transform .18s ${EASE.spring}`,
                } }, opt.label);
        })),
        error && React.createElement("span", { style: { display: "block", fontFamily: F.mono, fontSize: 10.5, color: C.warn, marginTop: 6 } }, error)));
}
function AssessmentSection({ index, title, children }) {
    return (React.createElement("section", { style: { ...glassPanel, padding: "22px 18px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("span", { style: { fontFamily: F.mono, fontSize: 11, fontWeight: 800, color: C.ink, background: C.amber, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, index),
            React.createElement("h2", { style: { margin: 0, fontFamily: F.display, fontSize: 12.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.text } }, title)),
        children));
}
export { AssessmentField, AssessmentTextArea, AssessmentSelect, AssessmentChoiceGroup, AssessmentSection };
