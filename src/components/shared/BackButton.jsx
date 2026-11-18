import React from "react";
import { C, F } from "../../styles/tokens";
import { Icon } from "./Icon";

// Botão de voltar único do app (frente 2, 18/nov): ícone + rótulo, 44 px de toque.
function BackButton({ onClick, label = "Voltar", style }) {
    return (
        <button type="button" className="cc-tap" onClick={onClick} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, minHeight: 44, padding: "0 8px 0 0", marginLeft: -4, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer", ...style }}>
            <Icon name="caretLeft" size={18} stroke={20} />
            <span>{label}</span>
        </button>
    );
}
export { BackButton };
