import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";

// Esqueci o código — design v4 (46a): link fixo sob as pastilhas do login; abre a gaveta "Pedir o
// código ao professor" com a mensagem pronta e editável. "Abrir WhatsApp" abre o WhatsApp com o texto
// (sem número fixo no app: o aluno escolhe a conversa do professor).

const DEFAULT_TEXT = "Oi, Cancio! Esqueci meu código do Cancio Club. Pode me mandar?";

function ForgotCode() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(DEFAULT_TEXT);
    const send = () => {
        haptic("confirm");
        window.open("https://wa.me/?text=" + encodeURIComponent(text.trim() || DEFAULT_TEXT), "_blank", "noopener");
        setOpen(false);
    };
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} style={{ marginTop: "clamp(4px, 1.5vh, 14px)", minHeight: 44, padding: "0 12px", border: "none", background: "none", color: C.text, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Esqueci o código</button>
            {open && (
                <div role="dialog" aria-modal="true" aria-label="Pedir o código ao professor" style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
                    <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, padding: "12px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}>
                        <span aria-hidden="true" style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, background: C.raised }} />
                        <span style={{ marginTop: 8, fontFamily: F.display, fontSize: 20, fontWeight: 800, fontStretch: "110%" }}>Pedir o código ao professor</span>
                        <span style={{ fontSize: 15, lineHeight: 1.45, color: C.text3 }}>Abre o WhatsApp com esta mensagem. Você pode mudar antes de enviar.</span>
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Mensagem para o professor"
                            style={{ boxSizing: "border-box", width: "100%", padding: "12px 14px", borderRadius: 14, border: "none", outline: "none", resize: "none", background: C.raised, color: C.text, fontFamily: F.body, fontSize: 15, lineHeight: 1.4 }} />
                        <button type="button" onClick={send} style={{ marginTop: 4, height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M128 24a104 104 0 0 0-91 154.4L24.4 216a8 8 0 0 0 10 10l37.6-12.6A104 104 0 1 0 128 24Zm46.6 129.5c-2 5.6-11.4 10.7-15.8 11.3-4 .6-9.1.8-14.7-.9-3.4-1.1-7.7-2.5-13.3-4.9-23.4-10.1-38.6-33.6-39.8-35.2s-9.5-12.6-9.5-24.1 6-17.1 8.2-19.4a8.6 8.6 0 0 1 6.2-2.9h4.5c1.4 0 3.4-.5 5.3 4.1 2 4.7 6.7 16.2 7.3 17.4a4.4 4.4 0 0 1 .2 4.1c-.8 1.6-1.2 2.6-2.3 4s-2.5 3.1-3.5 4.1c-1.2 1.2-2.4 2.4-1 4.8a71.6 71.6 0 0 0 13.2 16.5 65 65 0 0 0 19.1 11.8c2.4 1.2 3.8 1 5.2-.6s6-7 7.6-9.4 3.2-2 5.3-1.2 13.6 6.4 15.9 7.6 3.9 1.8 4.4 2.8.5 5.5-1.6 11.1Z" /></svg>
                            Abrir WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export { ForgotCode };
