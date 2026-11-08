import React, { useState } from "react";
import { C, F } from "../../styles/tokens";

// LGPD: o aluno vê o que é guardado, baixa uma cópia e pode pedir a exclusão.
// A exclusão em si é feita pelo professor (controlador dos dados), que recebe o pedido como alerta.
const ITEMS = [
    ["O que guardamos", "Nome, contato, foto, respostas da anamnese (inclusive sa\u00FAde), medidas, treinos registrados e recados."],
    ["Pra qu\u00EA", "S\u00F3 pra seu professor montar e acompanhar seu treino. N\u00E3o vendemos nem compartilhamos com terceiros."],
    ["Quem v\u00EA", "Voc\u00EA e seu professor. Os dados ficam num servidor protegido, acessado s\u00F3 pelo app."],
    ["Seus direitos", "Ver, corrigir, baixar uma c\u00F3pia e pedir a exclus\u00E3o a qualquer momento (Lei 13.709/2018, LGPD)."],
];
function MyData({ student, onDownload, onRequestDelete, onClose }) {
    const [confirm, setConfirm] = useState(false);
    const asked = !!student.deletionRequestedAt;
    const btn = { minHeight: 52, borderRadius: 16, border: "none", fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" };
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 96, background: C.ink, overflowY: "auto" } },
        React.createElement("div", { style: { maxWidth: 540, margin: "0 auto", padding: "calc(env(safe-area-inset-top) + 28px) 22px calc(env(safe-area-inset-bottom) + 24px)", display: "flex", flexDirection: "column", gap: 18 } },
            React.createElement("button", { onClick: onClose, style: { alignSelf: "flex-start", minHeight: 44, background: "none", border: "none", color: C.muted, fontFamily: F.body, fontSize: 13, cursor: "pointer", padding: 0 } }, "\u2190 Voltar"),
            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, color: C.text } }, "MEUS DADOS"),
            React.createElement("div", null, ITEMS.map(([t, d]) => React.createElement("div", { key: t, style: { padding: "14px 0", borderTop: `1px solid ${C.line}` } },
                React.createElement("div", { style: { fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.text } }, t),
                React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: "#AEB7C6", marginTop: 4 } }, d)))),
            student.ackAt && React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted } }, "Consentimento dado em " + new Date(student.ackAt).toLocaleDateString("pt-BR")),
            React.createElement("button", { className: "cc-tap", onClick: onDownload, style: { ...btn, background: C.text, color: C.ink } }, "Baixar uma c\u00F3pia dos meus dados"),
            asked ? React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: C.silver, padding: "14px 16px", borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line2}` } }, "Pedido de exclus\u00E3o enviado em " + new Date(student.deletionRequestedAt).toLocaleDateString("pt-BR") + ". Seu professor vai concluir e te avisar.")
                : !confirm ? React.createElement("button", { className: "cc-tap", onClick: () => setConfirm(true), style: { ...btn, background: "transparent", color: C.warn, boxShadow: "inset 0 0 0 1px rgba(232,121,75,.35)" } }, "Pedir exclus\u00E3o dos meus dados")
                    : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
                        React.createElement("div", { style: { fontFamily: F.body, fontSize: 13, lineHeight: 1.5, color: C.text } }, "Isso apaga sua ficha, hist\u00F3rico e anamnese e voc\u00EA perde o acesso ao app. Quer mesmo pedir?"),
                        React.createElement("button", { className: "cc-tap", onClick: () => { onRequestDelete(); setConfirm(false); }, style: { ...btn, background: C.warn, color: C.ink } }, "Sim, pedir exclus\u00E3o"),
                        React.createElement("button", { onClick: () => setConfirm(false), style: { ...btn, background: "transparent", color: C.muted } }, "Cancelar"))));
}
export { MyData };
