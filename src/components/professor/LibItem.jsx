import React, { useState, useEffect } from "react";
import { MediaEmbed } from "../shared/MediaEmbed";
import { C, F, glassPanel } from "../../styles/tokens";

function LibItem({ item, onUpdate, onRemove }) {
    const [name, setName] = useState(item.name || "");
    const [url, setUrl] = useState(item.url || "");
    const [show, setShow] = useState(false);
    const [tag, setTag] = useState(item.tag || "");
    useEffect(() => { setName(item.name || ""); setUrl(item.url || ""); setShow(false); setTag(item.tag || ""); }, [item.id]);
    return (React.createElement("div", { style: { ...glassPanel, borderRadius: 20, padding: 14 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("input", { value: name, onChange: (e) => setName(e.target.value), onBlur: () => name.trim() && onUpdate(item.id, { name: name.trim() }), style: { flex: 1, minWidth: 0, boxSizing: "border-box", fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.text, background: "none", border: "none", outline: "none", padding: 0 } }),
            item.tag && React.createElement("span", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.04em", color: C.ink, background: C.silver, borderRadius: 999, padding: "2px 8px", flexShrink: 0 } }, item.tag),
            item.url && React.createElement("button", { onClick: () => setShow((v) => !v), style: { fontFamily: F.mono, fontSize: 11, color: C.silver, background: C.panel2, borderRadius: 8, padding: "6px 10px", cursor: "pointer", flexShrink: 0 } }, show ? "ocultar" : "ver"),
            React.createElement("button", { onClick: onRemove, style: { fontFamily: F.mono, fontSize: 15, color: C.muted, background: "none", border: "none", cursor: "pointer", flexShrink: 0 } }, "\u00D7")),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
            React.createElement("input", { value: url, onChange: (e) => setUrl(e.target.value), onBlur: () => onUpdate(item.id, { url: url.trim() }), placeholder: "link do v\u00EDdeo (YouTube, gif...)", style: { flex: 1, boxSizing: "border-box", fontFamily: F.mono, fontSize: 12.5, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", outline: "none" } }),
            React.createElement("input", { value: tag, onChange: (e) => setTag(e.target.value), onBlur: () => onUpdate(item.id, { tag: tag.trim() }), placeholder: "tag (ex.: Peito)", style: { width: 110, boxSizing: "border-box", fontFamily: F.mono, fontSize: 12.5, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", outline: "none" } })),
        show && item.url && React.createElement(MediaEmbed, { url: item.url })));
}
export { LibItem };
