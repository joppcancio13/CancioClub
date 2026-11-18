import React from "react";
import { C, F, KICKER, SILVER } from "../../styles/tokens";

// Mais — design v4: Respostas rápidas · Ver demonstração (os Avisos entram com a fase de avisos),
// depois Selo e Backup, e "Sair da conta" separado no fim.
function Row({ title, sub, onClick, silver, open }) {
    return (
        <button type="button" onClick={onClick} aria-expanded={open} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 64, padding: "12px 14px", border: "none", background: C.panel, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
            {silver && <span aria-hidden="true" style={{ width: 32, height: 32, flex: "none", borderRadius: 9, backgroundImage: SILVER }} />}
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
                {sub && <span style={{ fontSize: 13, color: C.text3 }}>{sub}</span>}
            </span>
            <span aria-hidden="true" style={{ color: C.text3, transform: open ? "rotate(90deg)" : "none" }}>›</span>
        </button>
    );
}
const group = { display: "flex", flexDirection: "column", gap: 2, borderRadius: 16, overflow: "hidden" };

function MaisV3({ repliesCount, demo, advOpen, onReplies, onDemo, onSelo, onBackup, onLogout, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", color: C.text, fontFamily: F.body }}>
            <span style={{ fontFamily: F.display, fontSize: 30, fontWeight: 900, fontStretch: "125%", lineHeight: 1 }}>MAIS</span>
            <div style={{ ...group, marginTop: 18 }}>
                <Row title="Respostas rápidas" sub={repliesCount + " respostas · aparecem na conversa"} onClick={onReplies} />
                {!demo && <Row title="Ver demonstração" sub="Alunos fictícios pra testar ou mostrar o app. Nada é salvo." onClick={onDemo} silver />}
            </div>
            <span style={{ ...KICKER, marginTop: 22 }}>Marca e dados</span>
            <div style={{ ...group, marginTop: 8 }}>
                <Row title="Selo Cancio Club" sub="Imagem do selo pra perfil ou redes" onClick={onSelo} />
                <Row title="Backup e restauração" sub="Exportar, importar ou restaurar um aluno" onClick={onBackup} open={advOpen} />
            </div>
            {advOpen && <div style={{ marginTop: 12 }}>{children}</div>}
            {onLogout && (
                <div style={{ ...group, marginTop: 28 }}>
                    <button type="button" onClick={onLogout} style={{ minHeight: 56, padding: "0 14px", border: "none", background: C.panel, color: C.accent, textAlign: "left", fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Sair da conta</button>
                </div>
            )}
        </div>
    );
}

export { MaisV3 };
