import React, { useState, useEffect } from "react";
import { MediaEmbed } from "../shared/MediaEmbed";
import { C, F } from "../../styles/tokens";

// 16c — linha da biblioteca: nome, grupo e vídeo; toque abre a edição no lugar
function LibItem({ item, onUpdate, onRemove }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(item.name || "");
    const [url, setUrl] = useState(item.url || "");
    const [tag, setTag] = useState(item.tag || "");
    const [show, setShow] = useState(false);
    useEffect(() => { setName(item.name || ""); setUrl(item.url || ""); setTag(item.tag || ""); setShow(false); }, [item.id]);
    const inp = { width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: "none", outline: "none", background: C.ink, boxShadow: "inset 0 0 0 1px #2A2E37", color: C.text, fontFamily: F.body, fontSize: 15 };
    const lbl = { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted };
    return React.createElement("div", { style: { borderBottom: "1px solid #15181F" } },
        React.createElement("button", { className: "cc-tap", onClick: () => setOpen(!open), style: { minHeight: 44, width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: "3px 10px", padding: "12px 0", border: "none", background: "transparent", textAlign: "left", cursor: "pointer" } },
            React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.text } }, item.name),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: item.url ? C.silver : "#3A404C" } }, item.url ? "\u25B6 vídeo" : "sem vídeo"),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, item.tag || "sem grupo")),
        open && React.createElement("div", { className: "cc-view", style: { padding: "2px 0 14px", display: "flex", flexDirection: "column", gap: 10 } },
            React.createElement("label", { style: { minHeight: 44, display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: lbl }, "NOME"), React.createElement("input", { value: name, onChange: (e) => setName(e.target.value), onBlur: () => name.trim() && onUpdate(item.id, { name: name.trim() }), style: inp })),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 } },
                React.createElement("label", { style: { minHeight: 44, display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: lbl }, "VÍDEO"), React.createElement("input", { value: url, placeholder: "cole o link", onChange: (e) => setUrl(e.target.value), onBlur: () => onUpdate(item.id, { url: url.trim() }), style: inp })),
                React.createElement("label", { style: { minHeight: 44, display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: lbl }, "GRUPO"), React.createElement("input", { value: tag, placeholder: "Peito", onChange: (e) => setTag(e.target.value), onBlur: () => onUpdate(item.id, { tag: tag.trim() }), style: inp }))),
            item.url && show && React.createElement(MediaEmbed, { url: item.url }),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                item.url && React.createElement("button", { className: "cc-tap", onClick: () => setShow(!show), style: { flex: 1, height: 44, borderRadius: 10, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2A2E37", color: C.silver, fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, show ? "Ocultar vídeo" : "Ver vídeo"),
                React.createElement("button", { className: "cc-tap", onClick: onRemove, style: { flex: 1, height: 44, borderRadius: 10, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px rgba(232,121,75,.4)", color: C.warn, fontFamily: F.body, fontSize: 13, cursor: "pointer" } }, "Remover"))));
}
export { LibItem };
