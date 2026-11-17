import React from "react";
import { C, F, SILVER } from "../../styles/tokens";

// Demonstração (design v4 · 32b): pílula prata "Demonstração · nada é salvo" com Sair, flutuando
// sobre as abas do professor em todas as telas enquanto o modo demonstração está ligado.
function DemoPill({ onExit }) {
    return (
        <div role="status" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "4px 4px 4px 14px", borderRadius: 999, backgroundImage: SILVER, color: C.bg, fontFamily: F.body, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Demonstração · nada é salvo</span>
            <button type="button" onClick={onExit} style={{ minHeight: 36, padding: "0 14px", borderRadius: 999, border: "none", background: C.bg, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Sair</button>
        </div>
    );
}

// entrada do modo demonstração no Mais
function DemoEntry({ onEnter }) {
    return (
        <button type="button" onClick={onEnter} style={{ width: "100%", minHeight: 64, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 18, borderRadius: 16, border: "none", background: C.panel, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
            <span aria-hidden="true" style={{ width: 36, height: 36, flex: "none", borderRadius: 10, backgroundImage: SILVER }} />
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Ver demonstração</span>
                <span style={{ fontSize: 13, color: C.text3 }}>Alunos fictícios pra testar ou mostrar o app. Nada é salvo.</span>
            </span>
            <span aria-hidden="true" style={{ color: C.text3 }}>›</span>
        </button>
    );
}

export { DemoPill, DemoEntry };
