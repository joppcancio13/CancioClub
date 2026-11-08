import React, { useEffect, useState } from "react";
import { BALL_URL, C, F } from "../../styles/tokens";
import { fmtDate } from "../../utils/date";
import { shareOrDownloadBlob } from "../../utils/share";

// Carteirinha do aluno — cartão de identidade/pertencimento, não um crachá de acesso (o app não
// tem controle de catraca). Reaproveita o mesmo W/H de story (1080x1920) que SerieExport e
// AssessmentExport usam, pra caber no mesmo fluxo de compartilhar que o aluno já conhece.
function StudentCard({ student, memberSince, onClose }) {
    const canvasRef = React.useRef(null);
    const ballRef = React.useRef(null);
    const [busy, setBusy] = useState(false);
    const W = 1080, H = 1920, S = 3;
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
            if (!ballRef.current) ballRef.current = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = BALL_URL; });
            if (cancelled || !canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            const setFont = (w, px, st) => { ctx.font = w + " " + px + "px " + F.display; try { ctx.fontStretch = st || "normal"; } catch (e) { } };
            ctx.fillStyle = "#05060A"; ctx.fillRect(0, 0, W, H);

            // moldura do cartão (retângulo com cantos arredondados, metade superior da tela)
            const cardTop = 300, cardH = 1180, cardX = 60, cardW = W - cardX * 2, r = 36;
            const rr = (x, y, w, h, rad) => { ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); };
            const grad = ctx.createLinearGradient(cardX, cardTop, cardX, cardTop + cardH);
            [[0, "#1E222B"], [0.22, "#8D97A9"], [0.4, "#E9EEF6"], [0.55, "#5B6373"], [0.72, "#2B3039"], [0.88, "#B8C3D4"], [1, "#3A404C"]].forEach(([o, c]) => grad.addColorStop(o, c));
            rr(cardX, cardTop, cardW, cardH, r); ctx.fillStyle = grad; ctx.fill();
            // textura de grade igual aos outros cartões, recortada só dentro do cartão
            ctx.save(); rr(cardX, cardTop, cardW, cardH, r); ctx.clip();
            const cell = 16 * S, joint = 2 * S;
            ctx.fillStyle = "#05060A";
            for (let x = cardX; x < cardX + cardW; x += cell) ctx.fillRect(x, cardTop, joint, cardH);
            for (let y = cardTop; y < cardTop + cardH; y += cell) ctx.fillRect(cardX, y, cardW, joint);
            const fade = ctx.createLinearGradient(cardX, cardTop + cardH * 0.45, cardX, cardTop + cardH);
            fade.addColorStop(0, "rgba(5,6,10,0)"); fade.addColorStop(1, "rgba(5,6,10,.97)");
            ctx.fillStyle = fade; ctx.fillRect(cardX, cardTop, cardW, cardH);
            ctx.restore();
            ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2; rr(cardX, cardTop, cardW, cardH, r); ctx.stroke();

            // topo do cartão: selo + CANCIO CLUB
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
            if (ballRef.current) ctx.drawImage(ballRef.current, cardX + 44, cardTop + 54, 64, 64);
            setFont(900, 34, "expanded"); ctx.fillStyle = "#05060A"; if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
            ctx.fillText("CANCIO CLUB", cardX + 124, cardTop + 98);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
            setFont(700, 24, "condensed"); ctx.fillStyle = "rgba(5,6,10,.6)"; if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
            ctx.fillText("MEMBRO", cardX + 124, cardTop + 128);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

            // nome do aluno — cresce até ocupar a largura do cartão, quebrando se precisar
            ctx.fillStyle = "#05060A";
            const name = String(student.name || "").toUpperCase();
            const maxNameW = cardW - 88;
            let fp = 92; setFont(900, fp, "expanded"); while (ctx.measureText(name).width > maxNameW && fp > 56) { fp -= 4; setFont(900, fp, "expanded"); }
            if (ctx.measureText(name).width <= maxNameW) {
                ctx.fillText(name, cardX + 44, cardTop + cardH * 0.56);
            } else {
                // nome não coube numa linha nem no tamanho mínimo (ex. nome composto longo) —
                // sem isso o texto vazava pra fora do cartão dos dois lados. Quebra em 2 linhas por
                // palavra em vez de encolher sem limite ou deixar vazar.
                fp = 60; setFont(900, fp, "expanded");
                const words = name.split(" ");
                let line1 = words[0] || "";
                let i = 1;
                while (i < words.length && ctx.measureText(line1 + " " + words[i]).width <= maxNameW) { line1 += " " + words[i]; i++; }
                let line2 = words.slice(i).join(" ");
                while (ctx.measureText(line2 + "…").width > maxNameW && line2.length > 4) line2 = line2.slice(0, -1);
                if (words.slice(i).join(" ") !== line2) line2 = line2.trim() + "…";
                const baseY = cardTop + cardH * 0.56;
                ctx.fillText(line1, cardX + 44, baseY - fp * 0.55);
                ctx.fillText(line2, cardX + 44, baseY + fp * 0.55);
            }

            // nº do sócio + membro desde, estilo cartão — ficam sobre a faixa escurecida embaixo
            // (o "fade" acima), por isso usam texto claro em vez do escuro usado no resto do cartão
            setFont(700, 26, "condensed"); ctx.fillStyle = "#C6D2E4"; if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
            ctx.fillText("Nº " + String(student.code || "—").toUpperCase(), cardX + 44, cardTop + cardH - 108);
            if (memberSince) ctx.fillText("MEMBRO DESDE " + fmtDate(memberSince).toUpperCase(), cardX + 44, cardTop + cardH - 64);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

            // rodapé da tela (fora do cartão), mesmo padrão dos outros cartões exportáveis
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
    }, [student, memberSince]);
    const toBlob = () => new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
    const fname = () => "carteirinha-" + String(student.name || "aluno").split(" ")[0].toLowerCase() + ".png";
    const download = async () => {
        setBusy(true);
        await shareOrDownloadBlob(await toBlob(), fname(), "Carteirinha Cancio Club");
        setBusy(false);
    };
    return React.createElement("div", { className: "cc-fade-in", style: { position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,.6)" }, onClick: onClose },
        React.createElement("div", { className: "cc-sheet-in", onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 0, right: 0, bottom: 0, top: "calc(24px + env(safe-area-inset-top))", maxWidth: 560, margin: "0 auto", background: C.panel, borderRadius: "28px 28px 0 0", padding: "12px 20px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", overflowY: "auto" } },
            React.createElement("div", { style: { width: 36, height: 4, borderRadius: 2, background: "#2E333D", margin: "0 auto 16px", flexShrink: 0 } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18 } }, "SUA CARTEIRINHA"),
                React.createElement("button", { onClick: onClose, style: { fontFamily: F.body, fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 } }, "Fechar")),
            React.createElement("canvas", { ref: canvasRef, width: W, height: H, style: { width: 230, height: "auto", aspectRatio: "9 / 16", margin: "18px auto 0", display: "block", borderRadius: 10, boxShadow: "0 0 0 1px #2A2E37, 0 16px 40px rgba(0,0,0,.6)", background: C.ink, flexShrink: 0 } }),
            React.createElement("div", { style: { marginTop: "auto", paddingTop: 16 } },
                React.createElement("button", { className: "cc-tap", onClick: download, disabled: busy, style: { width: "100%", fontFamily: F.display, fontWeight: 800, fontSize: 15, padding: 18, borderRadius: 16, border: "none", background: C.text, color: C.ink, cursor: "pointer" } }, "Salvar imagem"))));
}
export { StudentCard };
