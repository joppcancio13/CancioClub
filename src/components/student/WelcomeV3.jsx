import React, { useEffect } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { Seal } from "./MemberCard";
import { fmtMemberNo, fmtSince } from "../../utils/members";
import { haptic } from "../../utils/misc";

// Boas-vindas (frente 4, 18/nov): logo depois da anamnese, o aluno "ganha" a carteirinha. O selo surge,
// o número de membro aparece e dá pra compartilhar a entrada no Club — o primeiro post já é do app.
function WelcomeV3({ student, onShare, onStart }) {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useEffect(() => { haptic("record"); }, []);
    const hasNo = Number.isInteger(student.memberNo);
    const since = fmtSince(student.memberSince || student.startDate || new Date().toISOString());
    const first = String(student.name || "").trim().split(" ")[0];
    const anim = (name, delay) => (reduce ? {} : { animation: `${name} .8s cubic-bezier(.2,.8,.2,1) ${delay}s both` });
    return (
        <div role="dialog" aria-modal="true" aria-label="Boas-vindas ao Cancio Club" style={{ position: "fixed", inset: 0, zIndex: 120, background: C.bg, color: C.text, fontFamily: F.body, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 42% at 50% 34%, rgba(198,210,228,.16), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", flex: 1, minHeight: 0, overflowY: "auto", padding: "calc(env(safe-area-inset-top) + 48px) 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <span style={{ ...KICKER, ...anim("cc-fade", 0.05) }}>{hasNo ? "Membro nº " + fmtMemberNo(student.memberNo) : "Novo membro"}</span>
                <div style={{ marginTop: 28, ...anim("cc-reveal", 0.15) }}><Seal size={220} color="#C6D2E4" /></div>
                <div style={{ marginTop: 30, fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 34, lineHeight: 1, textTransform: "uppercase", textWrap: "balance", ...anim("cc-fade", 0.55) }}>{first ? first + ", você está no Club" : "Você está no Club"}</div>
                <div style={{ marginTop: 12, maxWidth: 340, fontSize: 15, lineHeight: 1.5, color: C.text3, ...anim("cc-fade", 0.7) }}>
                    Seu professor recebeu a anamnese e vai montar o seu treino. Membro desde {since}.
                </div>
            </div>
            <div style={{ position: "relative", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 6, ...anim("cc-fade", 0.85) }}>
                <button type="button" className="cc-tap" onClick={onShare} style={{ height: 54, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Compartilhar minha entrada</button>
                <button type="button" className="cc-tap" onClick={onStart} style={{ height: 48, border: "none", background: "transparent", color: C.text3, fontFamily: F.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Entrar no app</button>
            </div>
        </div>
    );
}
export { WelcomeV3 };
