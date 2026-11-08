import React, { useState } from "react";
import { C, F, SELO_URL, SELO_FALLBACK_URL } from "../../styles/tokens";

function LogoCard({ onClose }) {
    const [busy, setBusy] = useState(false);
    const fetchBlob = async () => { let r = await fetch(SELO_URL); if (!r.ok) r = await fetch(SELO_FALLBACK_URL); const b = await r.blob(); return b.type === "image/png" ? b : new Blob([b], { type: "image/png" }); };
    const downloadNow = (blob) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "cancio-club-adesivo.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); };
    const share = async () => { setBusy(true); try {
        const blob = await fetchBlob();
        const file = new File([blob], "cancio-club.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] }))
            await navigator.share({ files: [file], title: "Cancio Club" });
        else
            downloadNow(blob);
    }
    catch (e) { } setBusy(false); };
    const download = async () => { setBusy(true); try {
        downloadNow(await fetchBlob());
    }
    catch (e) { } setBusy(false); };
    const checker = "repeating-conic-gradient(#2A2E37 0 25%, #1A1D24 0 50%) 0 0 / 16px 16px";
    return (React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", background: "rgba(5,6,10,.7)" } },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 14 } },
            React.createElement("span", { style: { width: 36, height: 4, borderRadius: 2, background: C.line2, margin: "0 auto 4px" } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 20, color: C.text } }, "SELO CANCIO CLUB"),
                React.createElement("button", { className: "cc-tap", onClick: onClose, style: { minHeight: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 14, cursor: "pointer" } }, "Fechar")),
            React.createElement("img", { src: SELO_URL, alt: "Selo Cancio Club", style: { width: "100%", maxWidth: 360, alignSelf: "center", aspectRatio: "1", borderRadius: 14, display: "block", background: checker } }),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 12, color: C.muted, textAlign: "center" } }, "PNG transparente · 2160 px · cole como figurinha"),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                React.createElement("button", { className: "cc-tap", onClick: download, disabled: busy, style: { flex: 1, height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 14, cursor: "pointer" } }, "Baixar"),
                React.createElement("button", { className: "cc-tap", onClick: share, disabled: busy, style: { flex: 2, height: 52, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Compartilhar")))));
}
export { LogoCard };
