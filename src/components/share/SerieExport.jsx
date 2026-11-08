import React, { useState, useEffect } from "react";
import { Pill } from "../shared/Pill";
import { BALL_URL, C, DAYS, F, NON_COUNTING_KINDS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { currentLoad } from "../../utils/workout";

// "Baixar série": story 1080x1920 com a ficha do dia pra quem não usa o app (layout 5a).
// Aquecimento/reconhecimento entram como instrução ("+1 aquec. antes"); as pastilhas vazadas são
// as séries de TRABALHO a cumprir.
function SerieExport({ student, week, dayNames, initialDay, onClose }) {
    const canvasRef = React.useRef(null);
    const ballRef = React.useRef(null);
    const days = DAYS.filter((d) => (week[d.key] || []).length > 0);
    const [dayKey, setDayKey] = useState(days.some((d) => d.key === initialDay) ? initialDay : (days[0] && days[0].key));
    const [showLoad, setShowLoad] = useState(true);
    const [showTips, setShowTips] = useState(true);
    const [busy, setBusy] = useState(false);
    const W = 1080, H = 1920, S = 3;
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
            if (!ballRef.current) ballRef.current = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = BALL_URL; });
            if (cancelled || !canvasRef.current || !dayKey) return;
            const ctx = canvasRef.current.getContext("2d");
            const setFont = (w, px, st) => { ctx.font = w + " " + px + "px " + F.display; try { ctx.fontStretch = st || "normal"; } catch (e) { } };
            const lx = 24 * S, rx = W - 24 * S;
            ctx.fillStyle = "#05060A"; ctx.fillRect(0, 0, W, H);
            const hh = 150 * S, cell = 15 * S, joint = 2 * S;
            const lg = ctx.createLinearGradient(0, 0, W, hh * 1.2);
            [[0, "#1E222B"], [0.24, "#8D97A9"], [0.34, "#E9EEF6"], [0.48, "#5B6373"], [0.62, "#2B3039"], [0.78, "#B8C3D4"], [1, "#3A404C"]].forEach(([o, c]) => lg.addColorStop(o, c));
            ctx.fillStyle = lg; ctx.fillRect(0, 0, W, hh);
            ctx.fillStyle = "#05060A";
            for (let x = 0; x < W; x += cell) ctx.fillRect(x, 0, joint, hh);
            for (let y = 0; y < hh; y += cell) ctx.fillRect(0, y, W, joint);
            const fade = ctx.createLinearGradient(0, hh * 0.25, 0, hh); fade.addColorStop(0, "rgba(5,6,10,0)"); fade.addColorStop(1, "#05060A");
            ctx.fillStyle = fade; ctx.fillRect(0, 0, W, hh + 2);
            const dName = (dayNames && dayNames[dayKey]) || "";
            const parts = dName.split("\u00B7").map((s) => s.trim()).filter(Boolean);
            const dFull = (DAYS.find((d) => d.key === dayKey) || {}).full || "";
            const title = (parts[0] || ("Treino de " + dFull)).toUpperCase();
            const sub = [parts.slice(1).join(" \u00B7 "), String(student.name || "").split(" ")[0]].filter(Boolean).join(" \u00B7 ");
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#F2F5FA";
            let tp = 90; setFont(900, tp, "expanded"); while (ctx.measureText(title).width > rx - lx && tp > 48) { tp -= 4; setFont(900, tp, "expanded"); }
            ctx.fillText(title, lx, hh - 6 * S - 8);
            setFont(500, 39); ctx.fillStyle = "#C6D2E4"; ctx.fillText(sub, lx, hh + 52);
            const sameDays = DAYS.filter((d) => (dayNames && dayNames[d.key] && dName && dayNames[d.key] === dName) || d.key === dayKey).map((d) => d.short.toLowerCase());
            ctx.textAlign = "right"; setFont(500, 33); ctx.fillStyle = "#7D8698"; ctx.fillText(sameDays.join(" e "), rx, hh + 52);
            const list = week[dayKey] || [];
            const top = hh + 120, limit = 1580;
            const rowH = Math.min(150, (limit - top) / Math.max(1, list.length));
            const k = Math.max(0.62, rowH / 150);
            const fmtK = (v) => String(v).replace(".", ",");
            list.forEach((ex, i) => {
                const y = top + i * rowH;
                const plan = Array.isArray(ex.setPlan) && ex.setPlan.length ? ex.setPlan : null;
                const work = plan ? plan.filter((p) => !NON_COUNTING_KINDS.has(p.kind)) : Array.from({ length: parseInt(ex.sets) || 1 }, () => ({ reps: ex.reps }));
                const warm = plan ? plan.filter((p) => p.kind === "warmup").length : 0, recon = plan ? plan.filter((p) => p.kind === "recon").length : 0;
                const repsSet = Array.from(new Set(work.map((w) => String(w.reps || ex.reps || ""))));
                const planTxt = work.length + "\u00D7" + (repsSet.length === 1 ? repsSet[0] : repsSet.join("/"));
                ctx.textAlign = "left"; setFont(600, Math.round(36 * k)); ctx.fillStyle = "#F2F5FA";
                let nm = ex.name; const maxW = rx - lx - 240; while (ctx.measureText(nm).width > maxW && nm.length > 4) nm = nm.slice(0, -2); if (nm !== ex.name) nm = nm.trim() + "\u2026";
                ctx.fillText(nm, lx, y + 36 * k);
                ctx.textAlign = "right"; setFont(800, Math.round(42 * k), "condensed"); ctx.fillText(planTxt, rx, y + 36 * k);
                const ty = y + 36 * k + 18 * k, tw = 48 * k, th = 21 * k;
                ctx.strokeStyle = "#6E7889"; ctx.lineWidth = 3;
                work.forEach((_, j) => ctx.strokeRect(lx + j * (tw + 9) + 1.5, ty + 1.5, tw - 3, th - 3));
                const afterTiles = lx + work.length * (tw + 9) + 12;
                if (showTips && ex.note) { ctx.textAlign = "left"; setFont(400, Math.round(30 * k)); ctx.fillStyle = "#7D8698"; let n = ex.note; const mw = rx - afterTiles - 260; while (ctx.measureText(n).width > mw && n.length > 4) n = n.slice(0, -2); if (n !== ex.note) n = n.trim() + "\u2026"; ctx.fillText(n, afterTiles, ty + th - 2); }
                const lastL = currentLoad(ex);
                const meta = [ex.rest ? ex.rest + "s" : "", showLoad && lastL ? fmtK(lastL) + " kg" : ""].filter(Boolean).join(" \u00B7 ");
                ctx.textAlign = "right"; setFont(500, Math.round(30 * k)); ctx.fillStyle = "#7D8698"; ctx.fillText(meta, rx, ty + th - 2);
                const pre = [warm ? "+" + warm + " AQUEC." : "", recon ? "+" + recon + " RECONHEC." : ""].filter(Boolean).join(" \u00B7 ");
                if (pre) { ctx.textAlign = "left"; setFont(600, Math.round(27 * k)); ctx.fillStyle = "#C6D2E4"; if ("letterSpacing" in ctx) ctx.letterSpacing = "2px"; ctx.fillText(pre + " ANTES", lx, ty + th + 34 * k); if ("letterSpacing" in ctx) ctx.letterSpacing = "0px"; }
            });
            const fy = 1640;
            setFont(800, 30, "expanded"); ctx.fillStyle = "#C6D2E4"; ctx.textAlign = "left";
            if ("letterSpacing" in ctx) ctx.letterSpacing = "9px";
            const label = "CANCIO CLUB", lw = ctx.measureText(label).width, ball = 54, sx = W / 2 - (ball + 27 + lw) / 2;
            if (ballRef.current) ctx.drawImage(ballRef.current, sx, fy - 11 - ball / 2, ball, ball);
            ctx.fillText(label, sx + ball + 27, fy);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
            try { ctx.fontStretch = "normal"; } catch (e) { }
        })();
        return () => { cancelled = true; };
    }, [dayKey, showLoad, showTips]);
    const toBlob = () => new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
    const fname = () => "serie-" + String(student.name || "aluno").split(" ")[0].toLowerCase() + "-" + dayKey + ".png";
    // `<a download>` sozinho n\u00E3o \u00E9 confi\u00E1vel no Safari/iOS (principalmente dentro do PWA em modo
    // standalone, sem aba nova pra "cair" o download) \u2014 \u00E9 por isso que "Salvar imagem" parecia n\u00E3o
    // fazer nada no celular. navigator.share com arquivo abre a folha nativa, que tem "Salvar
    // Imagem" como op\u00E7\u00E3o de verdade; s\u00F3 cai pro <a download> em navegadores sem suporte a isso
    // (desktop, por exemplo), onde o <a download> funciona normalmente.
    const downloadNow = (blob) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); };
    const download = async () => {
        setBusy(true);
        let blob;
        try {
            blob = await toBlob();
            const file = new File([blob], fname(), { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "S\u00E9rie Cancio Club" });
            else downloadNow(blob);
        } catch (e) {
            if (e && e.name === "AbortError") { /* usu\u00E1rio cancelou a folha de compartilhar \u2014 n\u00E3o faz nada */ }
            else if (blob) downloadNow(blob);
        }
        setBusy(false);
    };
    const share = download;
    const toggle = (label, on, set) => React.createElement("button", { key: label, onClick: () => { haptic("tick"); set(!on); }, style: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", border: "none", borderTop: "1px solid #1E222A", background: "none", cursor: "pointer", color: C.text } },
        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 500, fontSize: 14 } }, label),
        React.createElement("span", { style: { width: 44, height: 26, borderRadius: 13, background: on ? C.silver : "#2A2E37", position: "relative", flexShrink: 0 } }, React.createElement("span", { style: { position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: on ? C.ink : C.muted, transition: "left .2s ease" } })));
    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,.6)" }, onClick: onClose },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 0, right: 0, bottom: 0, top: "calc(24px + env(safe-area-inset-top))", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", overflowY: "auto" } },
            React.createElement("div", { style: { width: 36, height: 4, borderRadius: 2, background: "#2E333D", margin: "0 auto 16px", flexShrink: 0 } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18 } }, "BAIXAR S\u00C9RIE"),
                React.createElement("button", { onClick: onClose, style: { fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } }, "Fechar")),
            days.length === 0 ? React.createElement("div", { style: { fontFamily: F.body, fontSize: 13.5, color: C.muted, marginTop: 24 } }, "Monte pelo menos um dia de treino pra gerar a imagem.") : React.createElement(React.Fragment, null,
                React.createElement("canvas", { ref: canvasRef, width: W, height: H, style: { width: 190, height: "auto", aspectRatio: "9 / 16", margin: "18px auto 0", display: "block", borderRadius: 10, boxShadow: "0 0 0 1px #2A2E37, 0 16px 40px rgba(0,0,0,.6)", background: C.ink, flexShrink: 0 } }),
                React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 18, justifyContent: "center", flexWrap: "wrap" } }, days.map((d) => React.createElement(Pill, { key: d.key, active: d.key === dayKey, onClick: () => setDayKey(d.key) }, (dayNames && dayNames[d.key] ? dayNames[d.key].split("\u00B7")[0].trim() : d.short)))),
                React.createElement("div", { style: { marginTop: 14 } }, toggle("Carga sugerida", showLoad, setShowLoad), toggle("Dicas de execu\u00E7\u00E3o", showTips, setShowTips)),
                React.createElement("div", { style: { marginTop: "auto", paddingTop: 16, display: "flex", gap: 10 } },
                    React.createElement("button", { className: "cc-tap", onClick: download, disabled: busy, style: { flex: 1, fontFamily: F.display, fontWeight: 800, fontSize: 15, padding: 18, borderRadius: 16, border: "none", background: C.text, color: C.ink, cursor: "pointer" } }, "Salvar imagem"),
                    React.createElement("button", { className: "cc-tap", onClick: share, disabled: busy, style: { fontFamily: F.display, fontWeight: 600, fontSize: 15, padding: "18px 20px", borderRadius: 16, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", color: C.silver, cursor: "pointer" } }, "Enviar")))));
}
export { SerieExport };
