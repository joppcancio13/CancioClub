import React, { useState } from "react";
import { C, F, SELO_URL, glassPanel } from "../../styles/tokens";

function LogoCard({ onClose }) {
    const [busy, setBusy] = useState(false);
    const fetchBlob = async () => (await fetch(SELO_URL)).blob();
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
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(8,9,12,.9)", padding: 18 }, onClick: onClose },
        React.createElement("div", { style: { ...glassPanel, borderRadius: 26, maxWidth: 340, width: "100%", padding: 22 }, onClick: (e) => e.stopPropagation() },
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10, textAlign: "center" } }, "Selo Cancio Club"),
            React.createElement("img", { src: SELO_URL, alt: "Selo Cancio Club", style: { width: "100%", height: "auto", borderRadius: 12, display: "block", background: C.ink } }),
            React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
                React.createElement("button", { onClick: onClose, style: { fontFamily: F.mono, fontSize: 13, color: C.muted, background: C.panel2, borderRadius: 10, padding: "12px 16px", cursor: "pointer" } }, "Fechar"),
                React.createElement("button", { onClick: download, disabled: busy, style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "12px 14px", cursor: "pointer" } }, "Baixar"),
                React.createElement("button", { onClick: share, disabled: busy, style: { flex: 1, fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" } }, "Compartilhar")))));
}
export { LogoCard };
