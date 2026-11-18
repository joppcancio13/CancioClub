import React from "react";

// Ícones do app (frente 2 do refinamento, 18/nov): traço único, mesmo peso e grade 256 em todos,
// desenhados aqui (sem pacote externo, pra não pesar o app). Substituem os símbolos de texto
// (›, ★, ×, ⌃) que deixavam cada tela com um sotaque diferente.
const PATHS = {
    caretRight: "M96 48l80 80-80 80",
    caretLeft: "M160 208l-80-80 80-80",
    caretUp: "M48 160l80-80 80 80",
    caretDown: "M208 96l-80 80-80-80",
    check: "M40 144l56 56L216 80",
    x: "M200 56L56 200M56 56l144 144",
    plus: "M40 128h176M128 40v176",
    star: "M128 24l30 68 74 6-56 49 17 72-65-39-65 39 17-72-56-49 74-6z",
    chat: "M216 48H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h40v40l48-40h88a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8Z",
    bell: "M56 104a72 72 0 0 1 144 0c0 36 8 64 16 80H40c8-16 16-44 16-80ZM96 216a32 32 0 0 0 64 0",
    lock: "M48 88h160a8 8 0 0 1 8 8v112a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8ZM88 88V56a40 40 0 0 1 80 0v32",
    share: "M176 160l40-40-40-40M216 120h-88a88 88 0 0 0-88 88",
    download: "M128 40v128M80 120l48 48 48-48M40 208h176",
    gear: "M128 88a40 40 0 1 0 0 80 40 40 0 0 0 0-80ZM128 24v24M128 208v24M24 128h24M208 128h24M54 54l17 17M185 185l17 17M54 202l17-17M185 71l17-17",
    calendar: "M40 56h176v160H40zM40 96h176M88 32v40M168 32v40",
    trophy: "M80 40h96v64a48 48 0 0 1-96 0ZM80 64H40v16a40 40 0 0 0 40 40M176 64h40v16a40 40 0 0 1-40 40M128 152v40M96 216h64",
    chart: "M40 200l56-64 40 40 80-96M40 216h176",
    user: "M128 136a48 48 0 1 0 0-96 48 48 0 0 0 0 96ZM40 216a88 88 0 0 1 176 0",
};

function Icon({ name, size = 18, stroke = 18, color = "currentColor", fill = false, style, title }) {
    const d = PATHS[name] || PATHS.caretRight;
    return (
        <svg width={size} height={size} viewBox="0 0 256 256" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : "true"} style={{ display: "block", flex: "none", ...style }}>
            <path d={d} fill={fill ? color : "none"} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// seta pequena que acompanha um texto de link ("Ver carteirinha ›"), alinhada à linha de base
function Caret({ dir = "right", size = 12, style }) {
    const name = { right: "caretRight", left: "caretLeft", up: "caretUp", down: "caretDown" }[dir];
    return <Icon name={name} size={size} stroke={30} style={{ display: "inline-block", verticalAlign: "-1px", margin: dir === "left" ? "0 5px 0 0" : "0 0 0 5px", ...style }} />;
}

export { Icon, Caret };
