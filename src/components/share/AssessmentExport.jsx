import React, { useEffect, useState } from "react";
import { ASSESSMENT_TEMPO_SESSAO_LABELS, BALL_URL, C, F } from "../../styles/tokens";

// "Baixar anamnese": story 1080x1920 só com a transcrição das respostas do aluno na anamnese
// inicial — documento próprio, separado da ficha/série (SerieExport), porque é outro tipo de
// informação (o que o aluno relatou sobre si, não o treino planejado).
function AssessmentExport({ student, onClose }) {
    const canvasRef = React.useRef(null);
    const ballRef = React.useRef(null);
    const [busy, setBusy] = useState(false);
    const a = student.assessment || {};
    const W = 1080, H = 1920, S = 3;
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
            if (!ballRef.current) ballRef.current = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = BALL_URL; });
            if (cancelled || !canvasRef.current) return;
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
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#F2F5FA";
            setFont(900, 76, "expanded"); ctx.fillText("ANAMNESE", lx, hh - 6 * S - 8);
            setFont(500, 39); ctx.fillStyle = "#C6D2E4"; ctx.fillText(String(student.name || ""), lx, hh + 52);

            // grade de respostas curtas (idade/peso/altura/tempo de treino/sono) — 2 colunas
            let y = hh + 150;
            const stats = [["IDADE", a.idade && a.idade + " anos"], ["PESO", a.peso && a.peso + " kg"], ["ALTURA", a.altura && a.altura + " cm"], ["TREINA HÁ", a.tempoTreino], ["SONO / ESTRESSE", a.estresseSono]].filter(([, v]) => v);
            const colW = (rx - lx - 36) / 2;
            stats.forEach(([label, value], i) => {
                const col = i % 2, row = Math.floor(i / 2);
                const x = lx + col * (colW + 36), sy = y + row * 150;
                setFont(700, 26, "expanded"); ctx.fillStyle = "#7D8698"; if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
                ctx.fillText(label, x, sy);
                if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
                setFont(800, 54, "condensed"); ctx.fillStyle = "#F2F5FA";
                ctx.fillText(String(value), x, sy + 56);
            });
            y += Math.ceil(stats.length / 2) * 150 + 30;

            ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y); ctx.stroke();
            y += 56;

            // blocos de texto longo (objetivo, frequência, lesões, medicamentos, grupos de ênfase)
            const freq = a.diasSemana ? `${a.diasSemana}x na semana` + (a.tempoSessao ? ` · ${ASSESSMENT_TEMPO_SESSAO_LABELS[a.tempoSessao] || a.tempoSessao} por sessão` : "") : "";
            const blocks = [["OBJETIVO", a.objetivo], ["FREQUÊNCIA DESEJADA", freq], ["LESÕES / RESTRIÇÕES RELATADAS", a.lesoes], ["MEDICAMENTO CONTÍNUO", a.medicamentos], ["GRUPOS COM ÊNFASE PEDIDOS", a.gruposEnfase]].filter(([, v]) => v);
            const wrap = (text, maxW, px) => { bodyFont(500, px); const words = String(text).split(/\s+/); const lines = []; let cur = ""; words.forEach((w) => { const test = cur ? cur + " " + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }); if (cur) lines.push(cur); return lines; };
            blocks.forEach(([label, value]) => {
                setFont(700, 26, "expanded"); ctx.fillStyle = "#7D8698"; if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
                ctx.fillText(label, lx, y);
                if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
                y += 44;
                const lines = wrap(value, rx - lx, 34);
                ctx.fillStyle = "#F2F5FA"; bodyFont(500, 34);
                lines.slice(0, 4).forEach((line) => { ctx.fillText(line, lx, y); y += 44; });
                y += 36;
            });

            const fy = 1830;
            setFont(800, 30, "expanded"); ctx.fillStyle = "#C6D2E4"; ctx.textAlign = "left";
            if ("letterSpacing" in ctx) ctx.letterSpacing = "9px";
            const label = "CANCIO CLUB", lw = ctx.measureText(label).width, ball = 54, sx = W / 2 - (ball + 27 + lw) / 2;
            if (ballRef.current) ctx.drawImage(ballRef.current, sx, fy - 11 - ball / 2, ball, ball);
            ctx.fillText(label, sx + ball + 27, fy);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
            try { ctx.fontStretch = "normal"; } catch (e) { }
        })();
        return () => { cancelled = true; };
    }, [student]);
    const toBlob = () => new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
    const fname = () => "anamnese-" + String(student.name || "aluno").split(" ")[0].toLowerCase() + ".png";
    const downloadNow = (blob) => { const url = URL.createObjectURL(blob); const el = document.createElement("a"); el.href = url; el.download = fname(); document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); };
    const download = async () => {
        setBusy(true);
        let blob;
        try {
            blob = await toBlob();
            const file = new File([blob], fname(), { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Anamnese Cancio Club" });
            else downloadNow(blob);
        } catch (e) {
            if (e && e.name === "AbortError") { /* usuário cancelou a folha de compartilhar — não faz nada */ }
            else if (blob) downloadNow(blob);
        }
        setBusy(false);
    };
    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,.6)" }, onClick: onClose },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 0, right: 0, bottom: 0, top: "calc(24px + env(safe-area-inset-top))", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", overflowY: "auto" } },
            React.createElement("div", { style: { width: 36, height: 4, borderRadius: 2, background: "#2E333D", margin: "0 auto 16px", flexShrink: 0 } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18 } }, "BAIXAR ANAMNESE"),
                React.createElement("button", { onClick: onClose, style: { fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } }, "Fechar")),
            React.createElement("canvas", { ref: canvasRef, width: W, height: H, style: { width: 190, height: "auto", aspectRatio: "9 / 16", margin: "18px auto 0", display: "block", borderRadius: 10, boxShadow: "0 0 0 1px #2A2E37, 0 16px 40px rgba(0,0,0,.6)", background: C.ink, flexShrink: 0 } }),
            React.createElement("div", { style: { marginTop: "auto", paddingTop: 16 } },
                React.createElement("button", { className: "cc-tap", onClick: download, disabled: busy, style: { width: "100%", fontFamily: F.display, fontWeight: 800, fontSize: 15, padding: 18, borderRadius: 16, border: "none", background: C.text, color: C.ink, cursor: "pointer" } }, "Salvar imagem"))));
}
export { AssessmentExport };
