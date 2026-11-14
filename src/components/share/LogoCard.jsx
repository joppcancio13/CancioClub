import React, { useState, useEffect } from "react";
import { C, F, SIL_URL } from "../../styles/tokens";

// Selo novo (2a): anel com CANCIO CLUB / TREINOS · PROGRESSÃO e a silhueta no centro.
// Desenhado na hora em canvas -> PNG transparente 2160 px (figurinha). Prata pra foto escura, preto pra foto clara.
const S = 2160, K = S / 200;
const TONES = { prata: "#C6D2E4", preto: "#05060A" };
const loadImg = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

function arcChars(ctx, text, r, top, spacingFor) {
    const ch = [...text], w = ch.map((c) => ctx.measureText(c).width);
    const gap = spacingFor(w.reduce((a, b) => a + b, 0), ch.length);
    const total = w.reduce((a, b) => a + b, 0) + gap * (ch.length - 1);
    let a = top ? -Math.PI / 2 - total / r / 2 : Math.PI / 2 + total / r / 2;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ch.forEach((c, i) => {
        const half = w[i] / 2 / r; a += top ? half : -half;
        ctx.save(); ctx.translate(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r); ctx.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2); ctx.fillText(c, 0, 0); ctx.restore();
        a += (top ? 1 : -1) * (half + gap / r);
    });
}

async function drawSeal(tone) {
    const color = TONES[tone];
    await Promise.all(["900 100px Archivo", "800 100px Archivo"].map((f) => document.fonts.load(f).catch(() => null)));
    const sil = await loadImg(SIL_URL);
    const cv = document.createElement("canvas"); cv.width = S; cv.height = S;
    const ctx = cv.getContext("2d"); ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * K; ctx.beginPath(); ctx.arc(S / 2, S / 2, 97 * K, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `900 ${23 * K}px Archivo, sans-serif`;
    arcChars(ctx, "CANCIO CLUB", 76 * K, true, (sum, n) => (186 * K - sum) / (n - 1));
    ctx.font = `800 ${11.5 * K}px Archivo, sans-serif`;
    arcChars(ctx, "TREINOS · PROGRESSÃO", 86 * K - 9 * K, false, () => 2.6 * K);
    [10, 190].forEach((x) => { ctx.beginPath(); ctx.arc(x * K, S / 2, 2.6 * K, 0, Math.PI * 2); ctx.fill(); });
    const sx = 50 * K, sw = 100 * K;
    if (tone === "preto") {
        const t = document.createElement("canvas"); t.width = sw; t.height = sw; const tc = t.getContext("2d");
        tc.drawImage(sil, 0, 0, sw, sw); tc.globalCompositeOperation = "source-in"; tc.fillStyle = color; tc.fillRect(0, 0, sw, sw);
        ctx.drawImage(t, sx, sx);
    } else ctx.drawImage(sil, sx, sx, sw, sw);
    return new Promise((ok) => cv.toBlob(ok, "image/png"));
}

function LogoCard({ onClose }) {
    const [tone, setTone] = useState("prata");
    const [img, setImg] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let alive = true, url = null;
        setImg(null);
        drawSeal(tone).then((blob) => { if (!alive || !blob) return; url = URL.createObjectURL(blob); setImg({ blob, url }); }).catch(() => {});
        return () => { alive = false; if (url) setTimeout(() => URL.revokeObjectURL(url), 1500); };
    }, [tone]);
    const name = `cancio-club-selo-${tone}.png`;
    const downloadNow = (blob) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); };
    const share = async () => { if (!img) return; setBusy(true); try {
        const file = new File([img.blob], name, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Cancio Club" });
        else downloadNow(img.blob);
    } catch (e) { } setBusy(false); };
    const checker = tone === "preto" ? "repeating-conic-gradient(#E6EAF1 0 25%, #F5F7FA 0 50%) 0 0 / 16px 16px" : "repeating-conic-gradient(#2A2E37 0 25%, #1A1D24 0 50%) 0 0 / 16px 16px";
    const seg = (k, l) => React.createElement("button", { className: "cc-tap", onClick: () => setTone(k), style: { minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 13, background: tone === k ? C.text : "transparent", color: tone === k ? C.ink : "#AEB7C6" } }, l);
    return (React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", background: "rgba(5,6,10,.7)" } },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", flexDirection: "column", gap: 14 } },
            React.createElement("span", { style: { width: 36, height: 4, borderRadius: 2, background: C.line2, margin: "0 auto 4px" } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18, color: C.text } }, "SELO CANCIO CLUB"),
                React.createElement("button", { className: "cc-tap", onClick: onClose, style: { minHeight: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Fechar")),
            React.createElement("div", { style: { width: "100%", maxWidth: 360, alignSelf: "center", aspectRatio: "1", borderRadius: 16, background: checker, display: "flex", alignItems: "center", justifyContent: "center" } },
                img && React.createElement("img", { src: img.url, alt: "Selo Cancio Club", style: { width: "88%", height: "88%", display: "block" } })),
            React.createElement("div", { style: { alignSelf: "center", display: "flex", gap: 6, padding: 4, borderRadius: 999, background: "#0E1015" } }, seg("prata", "Prata"), seg("preto", "Preto")),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted, textAlign: "center" } }, "PNG transparente · 2160 px · prata pra foto escura, preto pra foto clara"),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                React.createElement("button", { className: "cc-tap", onClick: () => img && downloadNow(img.blob), disabled: !img || busy, style: { flex: 1, height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" } }, "Baixar"),
                React.createElement("button", { className: "cc-tap", onClick: share, disabled: !img || busy, style: { flex: 2, height: 52, borderRadius: 16, border: "none", background: C.text, color: C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" } }, "Compartilhar")))));
}
export { LogoCard };
