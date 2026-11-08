import React, { useState, useEffect } from "react";
import { Pill } from "../shared/Pill";
import { BALL_URL, C, DAYS, F, NON_COUNTING_KINDS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { shareOrDownloadBlob } from "../../utils/share";
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
            const bodyFont = (w, px) => { ctx.font = w + " " + px + "px " + F.body; try { ctx.fontStretch = "normal"; } catch (e) { } };
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
            // s\u00F3 mostra "tamb\u00E9m em: X, Y" quando a mesma ficha nomeada vale pra mais de um dia \u2014
            // repetir a abrevia\u00E7\u00E3o do pr\u00F3prio dia (ex. "seg") na TREINO DE SEGUNDA \u00E9 s\u00F3 ru\u00EDdo.
            const sameDays = DAYS.filter((d) => dayNames && dayNames[d.key] && dName && dayNames[d.key] === dName).map((d) => d.short.toLowerCase());
            if (sameDays.length > 1) { ctx.textAlign = "right"; setFont(500, 33); ctx.fillStyle = "#7D8698"; ctx.fillText("tamb\u00E9m " + sameDays.join(" e "), rx, hh + 52); }
            // legenda \u00FAnica explicando a marca\u00E7\u00E3o em pastilha \u2014 aparece antes do 1\u00BA exerc\u00EDcio,
            // que \u00E9 quando o aluno v\u00EA o s\u00EDmbolo pela 1\u00AA vez (sem isso virava "o que s\u00E3o essas caixinhas?").
            ctx.textAlign = "left"; ctx.font = "italic 400 30px " + F.body; ctx.fillStyle = "#5A6273";
            ctx.fillText("Marque \u25A2 conforme for completando cada s\u00E9rie", lx, hh + 108);
            const list = week[dayKey] || [];
            const top = hh + 160, limit = 1620;
            const rowH = Math.min(185, (limit - top) / Math.max(1, list.length));
            const k = Math.max(0.6, rowH / 185);
            const fmtK = (v) => String(v).replace(".", ",");
            const wrapLines = (text, maxW, px, max) => { bodyFont(400, px); const words = String(text).split(/\s+/); const lines = []; let cur = ""; words.forEach((w) => { const test = cur ? cur + " " + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }); if (cur) lines.push(cur); if (lines.length > max) { lines.length = max; let last = lines[max - 1]; while (ctx.measureText(last + "\u2026").width > maxW && last.length > 4) last = last.slice(0, -2); lines[max - 1] = last.trim() + "\u2026"; } return lines; };
            list.forEach((ex, i) => {
                const y = top + i * rowH;
                const plan = Array.isArray(ex.setPlan) && ex.setPlan.length ? ex.setPlan : null;
                const work = plan ? plan.filter((p) => !NON_COUNTING_KINDS.has(p.kind)) : Array.from({ length: parseInt(ex.sets) || 1 }, () => ({ reps: ex.reps }));
                const warm = plan ? plan.filter((p) => p.kind === "warmup").length : 0, recon = plan ? plan.filter((p) => p.kind === "recon").length : 0;
                const repsSet = Array.from(new Set(work.map((w) => String(w.reps || ex.reps || ""))));
                const planTxt = work.length + "\u00D7" + (repsSet.length === 1 ? repsSet[0] : repsSet.join("/"));
                let ly = y;
                ctx.textAlign = "left"; setFont(600, Math.round(36 * k)); ctx.fillStyle = "#F2F5FA";
                let nm = ex.name; const maxW = rx - lx - 240; while (ctx.measureText(nm).width > maxW && nm.length > 4) nm = nm.slice(0, -2); if (nm !== ex.name) nm = nm.trim() + "\u2026";
                ctx.fillText(nm, lx, ly + 36 * k);
                ctx.textAlign = "right"; setFont(800, Math.round(42 * k), "condensed"); ctx.fillText(planTxt, rx, ly + 36 * k);
                ly += 36 * k + 14 * k;
                const pre = [warm ? "+" + warm + " aquec." : "", recon ? "+" + recon + " reconhec." : ""].filter(Boolean).join(" \u00B7 ");
                if (pre) { ctx.textAlign = "left"; setFont(700, Math.round(24 * k)); ctx.fillStyle = "#8D97A9"; if ("letterSpacing" in ctx) ctx.letterSpacing = "1px"; ctx.fillText((pre + " antes").toUpperCase(), lx, ly + 20 * k); if ("letterSpacing" in ctx) ctx.letterSpacing = "0px"; ly += 34 * k; }
                const tw = 48 * k, th = 21 * k;
                ctx.strokeStyle = "#6E7889"; ctx.lineWidth = 3;
                work.forEach((_, j) => ctx.strokeRect(lx + j * (tw + 9) + 1.5, ly + 1.5, tw - 3, th - 3));
                const lastL = currentLoad(ex);
                const meta = [ex.rest ? ex.rest + "s descanso" : "", showLoad && lastL ? fmtK(lastL) + " kg" : ""].filter(Boolean).join(" \u00B7 ");
                ctx.textAlign = "right"; setFont(500, Math.round(28 * k)); ctx.fillStyle = "#7D8698"; ctx.fillText(meta, rx, ly + th - 2);
                ly += th + 14 * k;
                if (showTips && ex.note) {
                    ctx.textAlign = "left"; ctx.fillStyle = "#8D97A9";
                    const lines = wrapLines(ex.note, rx - lx, Math.round(27 * k), 2);
                    bodyFont(400, Math.round(27 * k));
                    lines.forEach((line) => { ctx.fillText(line, lx, ly + 24 * k); ly += 32 * k; });
                }
                if (i < list.length - 1) { ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, y + rowH - 14 * k); ctx.lineTo(rx, y + rowH - 14 * k); ctx.stroke(); }
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
    const download = async () => {
        setBusy(true);
        await shareOrDownloadBlob(await toBlob(), fname(), "S\u00E9rie Cancio Club");
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
