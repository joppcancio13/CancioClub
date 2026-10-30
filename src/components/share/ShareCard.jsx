import React, { useState, useEffect } from "react";
import { Pill } from "../shared/Pill";
import { C, F, NON_COUNTING_KINDS, SEAL_MARK_URL, SHARE_PHRASES, glassPanel } from "../../styles/tokens";
import { fmtDate, todayISO } from "../../utils/date";
import { drawCentered } from "../../utils/misc";
import { daySummary, sortedHistory } from "../../utils/workout";

/* --------------------- cartão de compartilhamento --------------------- */
// Dois temas só: "Selo" (o cartão aprovado — bola sangrando no canto, manchete em degradê) e
// "Placar" (pôster centralizado, bola no eixo, duração gigante). Os temas antigos (Tech,
// Editorial, Brutal) foram removidos junto com todo o código morto deles.
function ShareCard({ data, onClose }) {
    const canvasRef = React.useRef(null);
    const sealImgRef = React.useRef(null);
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);
    const W = 1080, H = 1920;
    const exercisesWithData = (data.exercises || []).filter((e) => sortedHistory(e.history || []).length >= 2);
    const [kind, setKind] = useState("tempo");
    const [exId, setExId] = useState(exercisesWithData[0] ? exercisesWithData[0].id : null);
    const [theme, setTheme] = useState(data.isRestDay ? "selo" : "pastilhas");
    const [sharePhrase] = useState(() => SHARE_PHRASES[Math.floor(Math.random() * SHARE_PHRASES.length)]);
    const isDayCard = !data.isWeeklySummary && kind === "tempo";
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (document.fonts && document.fonts.ready)
                    await document.fonts.ready;
            }
            catch (e) { }
            if (!sealImgRef.current) {
                sealImgRef.current = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                    img.src = SEAL_MARK_URL;
                });
            }
            if (cancelled)
                return;
            const cv = canvasRef.current;
            if (!cv)
                return;
            const ctx = cv.getContext("2d");
            // Story do Instagram: o cartão ocupa os 1080x1920 inteiros. Painel flutuante com
            // margem transparente ficava com cara de captura de tela colada no story — agora é
            // full bleed e o enquadramento vem da grade abaixo (G), não de uma moldura.
            ctx.clearRect(0, 0, W, H);
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            if (data.isWeeklySummary)
                drawWeeklyCard(ctx);
            else if (kind === "progressao")
                drawProgressCard(ctx);
            else if (theme === "pastilhas" && !data.isRestDay)
                drawPastilhaCard(ctx);
            else if (theme === "placar")
                drawScoreCard(ctx);
            else
                drawSignatureCard(ctx);
        })();
        return () => { cancelled = true; };
    }, [kind, exId, theme]);
    // o selo tem que sair cru: zera toda sombra antes de desenhar, senão o alpha da borda do PNG
    // borra e ganha halo cinza
    function drawSeal(ctx, cx, cy, r) {
        if (!sealImgRef.current)
            return;
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.drawImage(sealImgRef.current, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
    }
    // Grade do story. As zonas mortas do Instagram (barra de perfil em cima, campo de resposta
    // embaixo) comem cerca de 250px de cada ponta: nada legível entra em G.top/G.bottom.
    const G = { m: 96, top: 250, bottom: 1665, get lx() { return this.m; }, get rx() { return W - this.m; } };
    function drawStage(ctx) {
        ctx.fillStyle = "#05060A";
        ctx.fillRect(0, 0, W, H);
        const vign = ctx.createRadialGradient(W / 2, 780, 200, W / 2, 1100, 1250);
        vign.addColorStop(0, "rgba(255,255,255,0.035)");
        vign.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = vign;
        ctx.fillRect(0, 0, W, H);
    }
    function drawPanelBg(ctx, x0, y0, x1, y1) {
        ctx.fillStyle = "#05060A";
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // rótulo miúdo em caixa alta com entreletra — o tipo de apoio de todos os cartões
    function kicker(ctx, text, x, y, size, alpha, spacing, align) {
        ctx.textAlign = align || "left";
        ctx.fillStyle = "rgba(255,255,255," + (alpha == null ? 0.5 : alpha) + ")";
        ctx.font = "600 " + (size || 24) + "px Archivo, Inter, sans-serif";
        if ("letterSpacing" in ctx) ctx.letterSpacing = (spacing == null ? 7 : spacing) + "px";
        ctx.fillText(String(text || "").toUpperCase(), x, y);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    }
    function metalFill(ctx, x, y, w, h) {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, "#FFFFFF");
        g.addColorStop(0.44, "#DEE6F2");
        g.addColorStop(1, "#8E9BB0");
        return g;
    }
    function rule(ctx, x0, x1, y, alpha) {
        ctx.strokeStyle = "rgba(255,255,255," + (alpha || 0.12) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    }
    // assinatura do rodapé, na mesma altura nos dois temas
    function signature(ctx, align) {
        const y = 1620;
        rule(ctx, G.lx, G.rx, y - 52, 0.14);
        if (align === "center") {
            kicker(ctx, data.name, W / 2, y - 4, 24, 0.5, 6, "center");
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "800 30px Archivo, Inter, sans-serif";
            if ("letterSpacing" in ctx) ctx.letterSpacing = "10px";
            ctx.fillText("CANCIO CLUB", W / 2, y + 48);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
        }
        else {
            ctx.textAlign = "left";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "800 30px Archivo, Inter, sans-serif";
            if ("letterSpacing" in ctx) ctx.letterSpacing = "10px";
            ctx.fillText("CANCIO CLUB", G.lx, y);
            if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
            kicker(ctx, data.name, G.rx, y, 26, 0.5, 6, "right");
        }
        ctx.textAlign = "left";
    }
    // marcas de canto estilo registro de impressão — usadas nos cartões de semana e progressão
    function drawCornerMarks(ctx, x0, y0, x1, y1, len) {
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.5;
        const L = (x, y, dx, dy) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y); ctx.moveTo(x, y); ctx.lineTo(x, y + dy); ctx.stroke(); };
        L(x0 + 28, y0 + 28, len, len);
        L(x1 - 28, y0 + 28, -len, len);
        L(x0 + 28, y1 - 28, len, -len);
        L(x1 - 28, y1 - 28, -len, -len);
    }
    // exercícios do dia com o ganho de carga em relação à sessão anterior
    function dayExRows(limit) {
        const rows = (data.exercises || []).map((e) => {
            const hs = sortedHistory(e.history || []).map((h) => ({ date: h.date, ...daySummary(h) })).filter((h) => typeof h.load === "number" && h.load > 0);
            if (!hs.length)
                return null;
            const last = hs[hs.length - 1], prev = hs.length > 1 ? hs[hs.length - 2] : null;
            return { name: e.name, load: last.load, delta: prev ? last.load - prev.load : 0 };
        }).filter(Boolean);
        return typeof limit === "number" ? rows.slice(0, limit) : rows;
    }
    const fmtLoad = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 2) / 2).replace(".", ","));
    // linha "nome ......... carga (+ganho)" — compartilhada pelos dois temas do cartão do dia
    function drawExRow(ctx, r, lx, rx, ry) {
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, ry - 40); ctx.lineTo(rx, ry - 40); ctx.stroke();
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.font = "500 32px 'Inter', sans-serif";
        const nm = r.name.length > 26 ? r.name.slice(0, 25) + "…" : r.name;
        ctx.fillText(nm, lx, ry);
        ctx.textAlign = "right";
        if (r.delta > 0) {
            const badge = "+" + fmtLoad(r.delta);
            ctx.font = "700 26px Archivo, Inter, sans-serif";
            const bw = ctx.measureText(badge).width + 32;
            const bh = 40, bx = rx - bw, by = ry - 30;
            const bg = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
            bg.addColorStop(0, "#EEF3FB"); bg.addColorStop(1, "#B9C6D9");
            ctx.fillStyle = bg;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 20); else ctx.rect(bx, by, bw, bh);
            ctx.fill();
            ctx.fillStyle = "#05060A";
            ctx.textAlign = "center";
            ctx.fillText(badge, bx + bw / 2, by + 28);
            ctx.textAlign = "right";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "700 34px Archivo, Inter, sans-serif";
            ctx.fillText(fmtLoad(r.load) + " kg", bx - 24, ry);
        }
        else {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "700 34px Archivo, Inter, sans-serif";
            ctx.fillText(fmtLoad(r.load) + " kg", rx, ry);
        }
    }
    // Layout "Selo" — bola sangrando no canto superior direito, manchete em degradê metálico,
    // números grandes e os ganhos do dia como selinhos. Reenquadrado para story: tudo pendurado
    // na coluna esquerda (G.lx) e contido entre G.top e o rodapé.
    // Card "Pastilhas" (padrão): topo espelhado + cada exercício feito com uma pastilha acesa por
    // série de TRABALHO (aquecimento/reconhecimento não contam, igual tonelagem e recorde). ★ = PR do dia.
    function drawPastilhaCard(ctx) {
        const S = 3, lx = 24 * S, rx = W - 24 * S, today = data.targetDate || todayISO();
        ctx.fillStyle = "#05060A";
        ctx.fillRect(0, 0, W, H);
        const hh = 195 * S, cell = 15 * S, joint = 2 * S;
        const lg = ctx.createLinearGradient(0, 0, W, hh * 1.1);
        [[0, "#1E222B"], [0.24, "#8D97A9"], [0.34, "#E9EEF6"], [0.48, "#5B6373"], [0.62, "#2B3039"], [0.78, "#B8C3D4"], [1, "#3A404C"]].forEach(([o, c]) => lg.addColorStop(o, c));
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, W, hh);
        ctx.fillStyle = "#05060A";
        for (let x = 0; x < W; x += cell) ctx.fillRect(x, 0, joint, hh);
        for (let y = 0; y < hh; y += cell) ctx.fillRect(0, y, W, joint);
        const fade = ctx.createLinearGradient(0, hh * 0.3, 0, hh);
        fade.addColorStop(0, "rgba(5,6,10,0)"); fade.addColorStop(1, "#05060A");
        ctx.fillStyle = fade; ctx.fillRect(0, 0, W, hh + 2);
        const setFont = (w, px, stretch) => { ctx.font = w + " " + px + "px " + F.display; try { ctx.fontStretch = stretch || "normal"; } catch (e) { } };
        const parts = String(data.workoutName || "Treino").split("·").map((s) => s.trim()).filter(Boolean);
        const title = (parts[0] || "Treino").toUpperCase();
        const sub = [parts.slice(1).join(" · "), String(data.name || "").split(" ")[0]].filter(Boolean).join(" · ");
        ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
        setFont(900, 90, "expanded"); ctx.fillStyle = "#F2F5FA";
        let tpx = 90; while (ctx.measureText(title).width > rx - lx && tpx > 50) { tpx -= 4; setFont(900, tpx, "expanded"); }
        ctx.fillText(title, lx, hh - 6 * S - 8);
        setFont(500, 39); ctx.fillStyle = "#C6D2E4"; ctx.fillText(sub, lx, hh + 52);
        ctx.textAlign = "right"; setFont(500, 33); ctx.fillStyle = "#7D8698";
        ctx.fillText([data.dateLabel, data.durationLabel && data.durationLabel !== "—" ? data.durationLabel : ""].filter(Boolean).join(" · "), rx, hh + 52);
        const rows = (data.exercises || []).map((e) => {
            const hs = sortedHistory(e.history || []);
            const todayH = hs.find((x) => x.date === today);
            if (!todayH) return null;
            const work = Array.isArray(todayH.entries) && todayH.entries.length
                ? todayH.entries.filter((x) => !NON_COUNTING_KINDS.has(x.kind) && typeof x.load === "number")
                : (typeof todayH.load === "number" ? [{ load: todayH.load }] : []);
            if (!work.length) return null;
            const planned = Array.isArray(e.setPlan) && e.setPlan.length ? e.setPlan.filter((p) => !NON_COUNTING_KINDS.has(p.kind)).length : (parseInt(e.sets) || work.length);
            const best = work.reduce((m, x) => Math.max(m, x.load), 0);
            const prev = hs.filter((x) => x.date < today).map((x) => daySummary(x).load || 0);
            return { name: e.name, best, done: work.length, planned: Math.max(planned, work.length), pr: prev.length > 0 && best > Math.max(...prev) };
        }).filter(Boolean);
        const top = hh + 120, bottomLimit = 1560;
        const rowH = rows.length ? Math.min(117, (bottomLimit - top) / rows.length) : 117;
        const k = rowH / 117;
        rows.forEach((r, i) => {
            const y = top + i * rowH;
            ctx.textAlign = "left"; setFont(500, Math.round(34.5 * Math.max(k, 0.8))); ctx.fillStyle = "#E6EBF3";
            let nm = r.name; const maxW = rx - lx - 200;
            while (ctx.measureText(nm).width > maxW && nm.length > 4) nm = nm.slice(0, -2);
            if (nm !== r.name) nm = nm.trim() + "…";
            ctx.fillText(nm, lx, y + 34);
            if (r.pr) { ctx.fillStyle = "#F2F5FA"; ctx.fillText("★", lx + ctx.measureText(nm).width + 16, y + 34); }
            ctx.textAlign = "right";
            const kgTxt = (Number.isInteger(r.best) ? String(r.best) : String(r.best).replace(".", ","));
            setFont(500, 30); ctx.fillStyle = "#7D8698"; ctx.fillText(" kg", rx, y + 34);
            const kgW = ctx.measureText(" kg").width;
            setFont(700, 39, "condensed"); ctx.fillStyle = "#F2F5FA"; ctx.fillText(kgTxt, rx - kgW, y + 34);
            const ty = y + 34 + 18 * Math.max(k, 0.7), tw = 66, th = 27 * Math.max(k, 0.7), gap = 9;
            for (let j = 0; j < r.planned; j++) {
                const x = lx + j * (tw + gap);
                if (x + tw > rx) break;
                if (j < r.done) {
                    const tg = ctx.createLinearGradient(x, ty, x + tw, ty + th);
                    tg.addColorStop(0, "#FFFFFF"); tg.addColorStop(0.55, "#AEB9CB"); tg.addColorStop(1, "#6E7889");
                    ctx.fillStyle = tg; ctx.fillRect(x, ty, tw, th);
                } else {
                    ctx.fillStyle = "#1A1D24"; ctx.fillRect(x, ty, tw, th);
                    ctx.strokeStyle = "#2A2E37"; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, ty + 1.5, tw - 3, th - 3);
                }
            }
        });
        const fy = 1610;
        setFont(800, 30, "expanded"); ctx.fillStyle = "#C6D2E4"; ctx.textAlign = "left";
        if ("letterSpacing" in ctx) ctx.letterSpacing = "9px";
        const label = "CANCIO CLUB", lw = ctx.measureText(label).width, ball = 54, gapB = 27;
        const sx = W / 2 - (ball + gapB + lw) / 2;
        if (sealImgRef.current) drawSeal(ctx, sx + ball / 2, fy - 11, ball / 2);
        ctx.fillText(label, sx + ball + gapB, fy);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
        try { ctx.fontStretch = "normal"; } catch (e) { }
    }
    function drawSignatureCard(ctx) {
        const lx = G.lx, rx = G.rx, isRest = !!data.isRestDay;
        drawStage(ctx);
        const glow = ctx.createRadialGradient(W - 70, 210, 30, W - 70, 210, 620);
        glow.addColorStop(0, "rgba(198,210,228,0.26)");
        glow.addColorStop(0.5, "rgba(198,210,228,0.06)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, 900);
        drawSeal(ctx, W - 66, 214, 268);

        kicker(ctx, data.dateLabel, lx, G.top + 82, 26, 0.62, 8);
        rule(ctx, lx, lx + 200, G.top + 120, 0.22);

        const headTop = 830;
        kicker(ctx, isRest ? "Dia de recuperação" : "Treino concluído", lx, headTop, 28, 0.55, 7);
        const headline = isRest ? "Descanso também é treino" : (data.workoutName || "Treino");
        ctx.fillStyle = metalFill(ctx, lx, headTop + 40, 780, 200);
        let headSize = 104;
        const fits = (size) => {
            ctx.font = "800 " + size + "px Archivo, Inter, sans-serif";
            const words = String(headline).split(" ");
            const lines = [];
            let cur = "";
            words.forEach((w) => {
                const test = cur ? cur + " " + w : w;
                if (ctx.measureText(test).width > rx - lx && cur) { lines.push(cur); cur = w; }
                else cur = test;
            });
            if (cur) lines.push(cur);
            return lines;
        };
        let lines = fits(headSize);
        if (lines.length > 2) { headSize = 84; lines = fits(headSize); }
        if (lines.length > 2) { headSize = 68; lines = fits(headSize); }
        const shown = lines.slice(0, 3);
        if (lines.length > 3) shown[2] = shown[2].replace(/\s*\S*$/, "") + "…";
        const lead = headSize + 10;
        shown.forEach((ln, i) => ctx.fillText(ln, lx, headTop + 108 + i * lead));
        const afterHead = headTop + 108 + (shown.length - 1) * lead;

        if (isRest) {
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.font = "500 36px 'Inter', sans-serif";
            ctx.fillText("O corpo cresce na recuperação.", lx, afterHead + 110);
            ctx.fillText("Amanhã a pista continua aqui.", lx, afterHead + 162);
        }
        else {
            const statY = Math.max(afterHead + 190, 1230);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "800 110px Archivo, Inter, sans-serif";
            ctx.fillText(String(data.durationLabel || "—"), lx, statY);
            const dw = ctx.measureText(String(data.durationLabel || "—")).width;
            kicker(ctx, "de treino", lx, statY + 46, 24, 0.45, 6);
            if (data.streak > 0) {
                const sx = lx + Math.max(dw + 120, 430);
                ctx.strokeStyle = "rgba(255,255,255,0.14)";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(sx - 62, statY - 86); ctx.lineTo(sx - 62, statY + 26); ctx.stroke();
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "800 110px Archivo, Inter, sans-serif";
                ctx.fillText(String(data.streak), sx, statY);
                kicker(ctx, data.streak === 1 ? "dia seguido" : "dias seguidos", sx, statY + 46, 24, 0.45, 6);
            }
            // correm de cima para baixo a partir de uma altura fixa: com poucos exercícios o
            // bloco usa espaçamento largo; com mais, aperta o espaçamento e nunca esconde o
            // total em silêncio — o que não cabe aparece como "+N exercícios"
            const allExRows = dayExRows();
            let exRows, exGap, exMore = 0;
            if (allExRows.length <= 3) { exRows = allExRows; exGap = 72; }
            else if (allExRows.length === 4) { exRows = allExRows; exGap = 60; }
            else { exRows = allExRows.slice(0, 3); exGap = 60; exMore = allExRows.length - exRows.length; }
            exRows.forEach((r, i) => drawExRow(ctx, r, lx, rx, 1380 + i * exGap));
            if (exMore > 0) {
                ctx.textAlign = "left";
                ctx.fillStyle = "rgba(255,255,255,0.45)";
                ctx.font = "600 28px Archivo, Inter, sans-serif";
                ctx.fillText(`+ ${exMore} exercício${exMore > 1 ? "s" : ""} no treino`, lx, 1380 + exRows.length * exGap);
            }
        }
        signature(ctx);
    }
    // Layout "Placar" — pôster simétrico: bola no eixo, duração gigante em degradê e o placar
    // do dia embaixo. Moldura fina recuada para não brigar com a borda da tela do story.
    function drawScoreCard(ctx) {
        const cx = W / 2, lx = G.lx, rx = G.rx, isRest = !!data.isRestDay;
        drawStage(ctx);
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 2;
        ctx.strokeRect(56, 190, W - 112, 1540);
        const glow = ctx.createRadialGradient(cx, 520, 30, cx, 520, 470);
        glow.addColorStop(0, "rgba(198,210,228,0.24)");
        glow.addColorStop(0.6, "rgba(198,210,228,0.05)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(58, 192, W - 116, 800);

        kicker(ctx, data.dateLabel, cx, G.top + 78, 24, 0.55, 10, "center");
        drawSeal(ctx, cx, 500, 215);

        kicker(ctx, isRest ? "Dia de recuperação" : "Treino concluído", cx, 800, 26, 0.5, 8, "center");
        ctx.textAlign = "center";
        ctx.fillStyle = metalFill(ctx, lx, 840, rx - lx, 200);
        ctx.font = "800 66px Archivo, Inter, sans-serif";
        wrapText(ctx, String(isRest ? "Descanso também é treino" : (data.workoutName || "Treino")).toUpperCase(), cx, 910, 800, 78);

        if (isRest) {
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.font = "500 34px 'Inter', sans-serif";
            wrapText(ctx, "O corpo cresce na recuperação. Amanhã a pista continua aqui.", cx, 1180, 720, 50);
        }
        else {
            ctx.textAlign = "center";
            ctx.fillStyle = metalFill(ctx, cx - 300, 1020, 600, 180);
            ctx.font = "800 176px Archivo, Inter, sans-serif";
            ctx.fillText(String(data.durationLabel || "—"), cx, 1130);
            kicker(ctx, "de treino", cx, 1182, 24, 0.45, 8, "center");
            rule(ctx, lx, rx, 1240, 0.14);
            const stats = [[String(data.streak != null ? data.streak : 0), data.streak === 1 ? "dia seguido" : "dias seguidos"], [String((data.exercises || []).length), "exercícios"]];
            const colW = (rx - lx) / stats.length;
            stats.forEach((st, i) => {
                const sx = lx + colW * i + colW / 2;
                ctx.textAlign = "center";
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "800 62px Archivo, Inter, sans-serif";
                ctx.fillText(st[0], sx, 1320);
                kicker(ctx, st[1], sx, 1358, 22, 0.45, 6, "center");
            });
            // o pôster já gastou altura na bola e na duração gigante — aperta o espaçamento
            // quando há mais exercícios e nunca esconde o total em silêncio
            const allScoreRows = dayExRows();
            let scoreRows, scoreGap, scoreMore = 0;
            if (allScoreRows.length <= 2) { scoreRows = allScoreRows; scoreGap = 70; }
            else if (allScoreRows.length === 3) { scoreRows = allScoreRows; scoreGap = 54; }
            else { scoreRows = allScoreRows.slice(0, 2); scoreGap = 54; scoreMore = allScoreRows.length - scoreRows.length; }
            scoreRows.forEach((r, i) => drawExRow(ctx, r, lx, rx, 1450 + i * scoreGap));
            if (scoreMore > 0) {
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(255,255,255,0.45)";
                ctx.font = "600 26px Archivo, Inter, sans-serif";
                ctx.fillText(`+ ${scoreMore} exercício${scoreMore > 1 ? "s" : ""} no treino`, cx, 1450 + scoreRows.length * scoreGap);
            }
        }
        signature(ctx, "center");
    }
    function drawWeeklyCard(ctx) {
        const cx = W / 2;
        const x0 = 0, x1 = W, y0 = 0, y1 = H;
        drawStage(ctx);
        drawCornerMarks(ctx, 56, 190, W - 56, 1730, 34);
        drawSeal(ctx, cx, 430, 232);
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "600 26px Archivo, Inter, sans-serif";
        drawCentered(ctx, "CANCIO CLUB", cx, 700, 8);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 180, 740);
        ctx.lineTo(cx + 180, 740);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "800 34px Archivo, Inter, sans-serif";
        ctx.fillText("STATUS DA SEMANA", cx, 780);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "800 100px Archivo, Inter, sans-serif";
        ctx.fillText(`${data.freqWeek} TREINOS`, cx, 910);
        ctx.fillStyle = data.tint || C.amber;
        ctx.font = "800 60px Archivo, Inter, sans-serif";
        ctx.fillText(`${data.weeklyTime}`, cx, 1050);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "600 30px Archivo, Inter, sans-serif";
        ctx.fillText("NA PISTA", cx, 1100);
        if (data.weeklyVolume > 0) {
            const volStr = data.weeklyVolume >= 1000 ? (data.weeklyVolume / 1000).toFixed(1).replace(".", ",") + " TON" : data.weeklyVolume + " KG";
            ctx.fillStyle = data.tint || C.amber;
            ctx.font = "800 60px Archivo, Inter, sans-serif";
            ctx.fillText(volStr, cx, 1230);
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.font = "600 30px Archivo, Inter, sans-serif";
            ctx.fillText("LEVANTADAS", cx, 1280);
        }
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "italic 600 32px Archivo, Inter, sans-serif";
        ctx.fillText("A constância é o único atalho.", cx, 1470);
        drawFooter(ctx);
    }
    function drawProgressCard(ctx) {
        const ex = exercisesWithData.find((e) => e.id === exId) || exercisesWithData[0];
        const cx = W / 2;
        const x0 = 40, x1 = W - 40, y0 = 60, y1 = 1860;
        drawStage(ctx);
        drawCornerMarks(ctx, 56, 190, W - 56, 1730, 34);
        drawSeal(ctx, x1 - 140, 300, 82);
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "600 22px Archivo, Inter, sans-serif";
        if ("letterSpacing" in ctx)
            ctx.letterSpacing = "6px";
        ctx.fillText("CANCIO CLUB", G.lx, 296);
        if ("letterSpacing" in ctx)
            ctx.letterSpacing = "0px";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "500 20px 'Inter', sans-serif";
        ctx.fillText("PROGRESSÃO", G.lx, 330);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(G.lx, 380);
        ctx.lineTo(G.rx, 380);
        ctx.stroke();
        if (!ex) {
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "500 32px Archivo, Inter, sans-serif";
            ctx.fillText("Sem histórico suficiente ainda.", cx, H / 2);
            drawFooter(ctx);
            return;
        }
        const hist = sortedHistory(ex.history).map((h) => ({ date: h.date, ...daySummary(h) })).filter((h) => typeof h.load === "number");
        const cur = hist[hist.length - 1].load, first = hist[0].load, delta = cur - first;
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "800 50px Archivo, Inter, sans-serif";
        wrapText(ctx, ex.name, cx, 520, 860, 62);
        ctx.fillStyle = data.tint || C.amber;
        ctx.font = "800 190px 'Inter', sans-serif";
        ctx.fillText(`${cur} kg`, cx, 760);
        ctx.fillStyle = delta >= 0 ? (data.tint || C.amber) : "rgba(255,255,255,0.5)";
        ctx.font = "700 32px 'Inter', sans-serif";
        ctx.fillText(`${delta >= 0 ? "+" : ""}${delta} kg desde o início`, cx, 830);
        drawMiniChart(ctx, hist, G.lx, 920, G.rx - G.lx, 500, data.tint || C.amber);
        drawFooter(ctx);
    }
    function drawMiniChart(ctx, hist, x0, y0, w, h, color) {
        const vals = hist.map((p) => p.load);
        const vmin = Math.min(...vals), vmax = Math.max(...vals);
        const pad = Math.max(1.5, (vmax - vmin) * 0.2) || 3;
        const lo = vmin - pad, hi = vmax + pad;
        const n = hist.length;
        const toXY = (i, v) => [x0 + (n === 1 ? w / 2 : (i / (n - 1)) * w), y0 + h - ((v - lo) / (hi - lo)) * h];
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 2;
        for (let g = 0; g <= 3; g++) {
            const gy = y0 + (h / 3) * g;
            ctx.beginPath();
            ctx.moveTo(x0, gy);
            ctx.lineTo(x0 + w, gy);
            ctx.stroke();
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 7;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        hist.forEach((p, i) => { const [x, y] = toXY(i, p.load); if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y); });
        ctx.stroke();
        hist.forEach((p, i) => {
            const [x, y] = toXY(i, p.load);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = color;
            ctx.fillRect(-9, -9, 18, 18);
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 3;
            ctx.strokeRect(-9, -9, 18, 18);
            ctx.restore();
        });
        ctx.textAlign = "left";
        ctx.fillStyle = C.muted;
        ctx.font = "500 26px 'Inter', sans-serif";
        ctx.fillText(fmtDate(hist[0].date), x0, y0 + h + 44);
        ctx.textAlign = "right";
        ctx.fillText(fmtDate(hist[n - 1].date), x0 + w, y0 + h + 44);
    }
    function drawFooter(ctx) {
        const cx = W / 2;
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 200, 1568);
        ctx.lineTo(cx + 200, 1568);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 38px Archivo, Inter, sans-serif";
        ctx.fillText(data.name, cx, 1634);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "500 26px Archivo, Inter, sans-serif";
        ctx.fillText(`sequência de ${data.streak} · ${data.dateLabel}`, cx, 1676);
    }
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = String(text).split(" ");
        let line = "";
        const lines = [];
        for (const w of words) {
            const test = line ? line + " " + w : w;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = w;
            }
            else
                line = test;
        }
        lines.push(line);
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
    }
    const getBlob = () => new Promise((resolve) => canvasRef.current.toBlob((b) => resolve(b), "image/png", 0.95));
    const share = async () => {
        setBusy(true);
        let blob;
        try {
            blob = await getBlob();
            const file = new File([blob], "cancio-treino.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "Cancio Club", text: `Treino concluído — ${data.durationLabel}!` });
            }
            else {
                downloadNow(blob);
            }
        }
        catch (e) {
            if (e && e.name === "AbortError") { /* usuário cancelou o menu de partilha de propósito — não faz nada */ }
            else if (blob) {
                setToast("Imagem guardada na galeria — partilhe direto de lá!");
                downloadNow(blob);
            }
        }
        setBusy(false);
    };
    const downloadNow = (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cancio-treino.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };
    const download = async () => { setBusy(true); try {
        const blob = await getBlob();
        downloadNow(blob);
    }
    catch (e) { } setBusy(false); };
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(8,9,12,.9)", padding: 18 }, onClick: onClose },
        React.createElement("div", { style: { ...glassPanel, borderRadius: 26, maxWidth: 360, width: "100%", padding: 22, maxHeight: "94vh", overflowY: "auto" }, onClick: (e) => e.stopPropagation() },
            toast && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: "rgba(184,180,255,0.14)", border: `1px solid ${C.amber}55`, borderRadius: 12, padding: "9px 12px", marginBottom: 12, fontFamily: F.body, fontSize: 12, color: C.text }, onClick: (e) => e.stopPropagation() },
                React.createElement("span", { style: { flex: 1, lineHeight: 1.4 } }, toast),
                React.createElement("button", { onClick: () => setToast(null), style: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, flexShrink: 0, padding: 0 } }, "\u2715")),
            React.createElement("div", { style: { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 12, textAlign: "center", lineHeight: 1.5 } }, sharePhrase),
            exercisesWithData.length > 0 && (React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
                React.createElement(Pill, { active: kind === "tempo", onClick: () => setKind("tempo") }, "Tempo"),
                React.createElement(Pill, { active: kind === "progressao", onClick: () => setKind("progressao") }, "Progress\u00E3o"))),
            kind === "progressao" && exercisesWithData.length > 1 && (React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" } }, exercisesWithData.map((e) => React.createElement(Pill, { key: e.id, active: e.id === exId, onClick: () => setExId(e.id) }, e.name)))),
            isDayCard && (React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
                !data.isRestDay && React.createElement(Pill, { active: theme === "pastilhas", onClick: () => setTheme("pastilhas") }, "Pastilhas"),
                React.createElement(Pill, { active: theme === "selo", onClick: () => setTheme("selo") }, "Selo"),
                React.createElement(Pill, { active: theme === "placar", onClick: () => setTheme("placar") }, "Placar"))),
            React.createElement("canvas", { ref: canvasRef, width: W, height: H, style: { width: "100%", height: "auto", borderRadius: 12, display: "block", background: C.ink } }),
            React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
                React.createElement("button", { onClick: onClose, style: { fontFamily: F.mono, fontSize: 13, color: C.muted, background: C.panel2, borderRadius: 10, padding: "12px 16px", cursor: "pointer" } }, "Fechar"),
                React.createElement("button", { onClick: download, disabled: busy, style: { fontFamily: F.mono, fontSize: 12.5, color: C.silver, background: C.panel2, borderRadius: 10, padding: "12px 14px", cursor: "pointer" } }, "Baixar"),
                React.createElement("button", { onClick: share, disabled: busy, style: { flex: 1, fontFamily: F.mono, fontSize: 13.5, letterSpacing: "0.04em", color: C.ink, backgroundImage: `linear-gradient(150deg, #EEF3FB, #B9C6D9)`, background: C.amber, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" } }, "Compartilhar")))));
}
export { ShareCard };
