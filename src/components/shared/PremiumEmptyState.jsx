import React from "react";
import { C, F } from "../../styles/tokens";

// Estados — design v4 (55a), um padrão para todas as telas:
// · vazio: título 20/800/110% dizendo o que vai aparecer ali, uma frase de apoio 15 #AEB7C6 e um
//   botão secundário com o próximo passo;
// · erro (kind="error"): mesmo layout, "Não deu para carregar" e o botão claro "Tentar de novo".
// O nome antigo (PremiumEmptyState) ficou para não mexer em todos os lugares que já o usam.
function PremiumEmptyState({ title, sub, action, onAction, kind = "empty", onRetry }) {
    const isErr = kind === "error";
    const t = isErr ? (title || "Não deu para carregar") : title;
    const s = isErr ? (sub || "Sem internet ou o servidor não respondeu. O que você já viu continua salvo.") : sub;
    return (
        <div role={isErr ? "alert" : undefined} style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, color: C.text, fontFamily: F.body }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 800, fontStretch: "110%", lineHeight: 1.15 }}>{t}</div>
            {s && <div style={{ fontSize: 15, lineHeight: 1.45, color: C.text3, maxWidth: 360 }}>{s}</div>}
            {isErr && onRetry && (
                <button type="button" onClick={onRetry} style={{ marginTop: 8, minHeight: 48, padding: "0 18px", borderRadius: 12, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Tentar de novo</button>
            )}
            {!isErr && action && onAction && (
                <button type="button" onClick={onAction} style={{ marginTop: 8, minHeight: 44, padding: "0 16px", borderRadius: 12, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{action}</button>
            )}
        </div>
    );
}
export { PremiumEmptyState };
