import React, { useState, useEffect, useRef } from "react";
import { C, F, SIL_URL, SIL_SMALL_URL, NON_COUNTING_KINDS, SHARE_PHRASES } from "../../styles/tokens";
import { computeDayRecords } from "../../utils/records";

/* Rodada 13 — card de compartilhamento do treino do dia (story 1080×1920):
   "card" = Pastilhas em fundo preto · "numeros" e "pastilhas" = figurinhas PNG transparentes
   (estilo Strava) que podem ir sobre a foto do próprio aluno. Exporta sempre PNG em tamanho cheio. */

const W = 1080, H = 1920;
const INK = "#05060A", TEXT = "#F2F5FA", MUTED = "#7D8698", LINE = "#1E222A";
const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const kg = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10).replace(".", ","));
const thousands = (v) => Math.round(v).toLocaleString("pt-BR");
const WD = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"], MO = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const dateTag = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return `${WD[new Date(y, m - 1, d).getDay()]} · ${d} ${MO[m - 1]}`; };

function summarize(data) {
    const date = data.targetDate;
    const recs = data.records || computeDayRecords(data.exercises || [], date);
    const recIds = new Set(recs.map((r) => r.id));
    let sets = 0, volume = 0;
    const rows = [];
    (data.exercises || []).forEach((ex) => {
        const h = (ex.history || []).find((x) => x.date === date);
        const es = h && h.entries ? h.entries.filter((e) => !NON_COUNTING_KINDS.has(e.kind)) : [];
        if (!es.length) return;
        let best = null;
        es.forEach((e) => { const l = num(e.load), r = num(e.reps) || 0; if (l != null) { volume += l * r; if (best == null || l > best) best = l; } });
        sets += es.length;
        rows.push({ id: ex.id, name: ex.name, load: best, sets: es.length, pr: recIds.has(ex.id) });
    });
    return { rows, sets, volume, records: recs.length, title: (data.workoutName || "Treino").toUpperCase(), duration: data.durationLabel && data.durationLabel !== "—" ? data.durationLabel : null, date: dateTag(date) };
}

// reduz em etapas (metade por vez) — evita o serrilhado de desenhar o PNG grande direto pequeno
function hq(img, size) {
    if (!img) return null;
    let src = img, w = img.naturalWidth || img.width;
    while (w / 2 >= size) { const c = document.createElement("canvas"); c.width = c.height = Math.round(w / 2); const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(src, 0, 0, c.width, c.height); src = c; w = c.width; }
    return src;
}
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function font(ctx, weight, size, stretch) { try { ctx.fontStretch = stretch || "normal"; } catch (e) { } ctx.font = `${weight} ${size}px 'Archivo', system-ui, sans-serif`; }
function spaced(ctx, text, x, y, sp, align) { try { ctx.letterSpacing = sp + "px"; } catch (e) { } const w = ctx.measureText(text).width; const sx = align === "center" ? x - w / 2 : align === "right" ? x - w : x; ctx.textAlign = "left"; ctx.fillText(text, sx, y); try { ctx.letterSpacing = "0px"; } catch (e) { } return w; }
function tile(ctx, x, y, w, h, r) { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.55, "#AEB9CB"); g.addColorStop(1, "#6E7889"); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }

function drawCard(ctx, s, ball, phrase) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const L = 72, R = W - 72;
    // 17e — silhueta grande e quase apagada no canto, como marca d'água
    ctx.globalAlpha = 0.09; ctx.drawImage(hq(ball.big, 1100), W - 640, -520, 1100, 1100); ctx.globalAlpha = 1;
    // marca
    ctx.drawImage(hq(ball.small, 64), L, 110, 64, 64);
    ctx.fillStyle = TEXT; font(ctx, 900, 30, "expanded"); spaced(ctx, "CANCIO CLUB", L + 84, 154, 5);
    ctx.fillStyle = MUTED; font(ctx, 500, 26); spaced(ctx, s.date, R, 154, 2, "right");
    // título
    ctx.fillStyle = "#C6D2E4"; font(ctx, 700, 24); spaced(ctx, "TREINO CONCLUÍDO", L, 520, 6);
    ctx.fillStyle = TEXT; font(ctx, 900, s.title.length > 14 ? 84 : 100, "expanded");
    const words = s.title.split(" "); let line = "", y = 620; const lines = [];
    words.forEach((w) => { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > R - L && line) { lines.push(line); line = w; } else line = t; }); lines.push(line);
    lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, L, y + i * 96)); y += (Math.min(lines.length, 2) - 1) * 96 + 60;
    // faixa de 3 números
    ctx.fillStyle = LINE; ctx.fillRect(L, y, R - L, 2); ctx.fillRect(L, y + 150, R - L, 2);
    const cells = [[s.duration || String(s.rows.length), s.duration ? "tempo" : "exercícios"], [String(s.sets), "séries"], [s.records ? `${s.records} ★` : thousands(s.volume), s.records ? (s.records > 1 ? "recordes" : "recorde") : "kg levantados"]];
    const cw = (R - L) / 3;
    cells.forEach(([v, l], i) => { const cx = L + i * cw + (i ? 28 : 0); if (i) { ctx.fillStyle = LINE; ctx.fillRect(L + i * cw, y + 2, 2, 148); } ctx.fillStyle = TEXT; font(ctx, 900, 66, "condensed"); ctx.textAlign = "left"; ctx.fillText(v, cx, y + 90); ctx.fillStyle = MUTED; font(ctx, 400, 24); ctx.fillText(l, cx, y + 128); });
    y += 230;
    // exercícios
    const maxRows = 7, rows = s.rows.slice(0, maxRows);
    rows.forEach((r) => {
        ctx.fillStyle = TEXT; font(ctx, 600, 34); ctx.textAlign = "left";
        let name = r.name + (r.pr ? " ★" : ""); while (ctx.measureText(name).width > R - L - 220 && name.length > 4) name = name.slice(0, -2);
        if (name !== r.name + (r.pr ? " ★" : "")) name = name.trimEnd() + "…";
        ctx.fillText(name, L, y);
        if (r.load != null) { font(ctx, 800, 40, "condensed"); ctx.textAlign = "right"; const kw = (() => { ctx.save(); font(ctx, 600, 24); const w = ctx.measureText(" kg").width; ctx.restore(); return w; })(); ctx.fillText(kg(r.load), R - kw, y); ctx.fillStyle = MUTED; font(ctx, 600, 24); ctx.fillText(" kg", R, y); }
        for (let k = 0; k < r.sets; k++) tile(ctx, L + k * 52, y + 20, 46, 20, 4);
        y += 112;
    });
    if (s.rows.length > maxRows) { ctx.fillStyle = MUTED; font(ctx, 500, 26); ctx.textAlign = "left"; ctx.fillText(`+${s.rows.length - maxRows} exercícios`, L, y); }
    ctx.fillStyle = "#5A6273"; font(ctx, 400, 26); ctx.textAlign = "center"; ctx.fillText(phrase, W / 2, H - 110);
}

// 14c — card de descanso: "Pista fechada" + frase de recuperação + sequência
function drawRest(ctx, data, ball) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const L = 72, R = W - 72;
    ctx.globalAlpha = 0.09; ctx.drawImage(hq(ball.big, 1100), W - 640, -520, 1100, 1100); ctx.globalAlpha = 1;
    ctx.drawImage(hq(ball.small, 64), L, 110, 64, 64);
    ctx.fillStyle = TEXT; font(ctx, 900, 30, "expanded"); spaced(ctx, "CANCIO CLUB", L + 84, 154, 5);
    ctx.fillStyle = MUTED; font(ctx, 500, 26); spaced(ctx, dateTag(data.targetDate), R, 154, 2, "right");
    ctx.fillStyle = "#C6D2E4"; font(ctx, 700, 24); spaced(ctx, "DIA DE RECUPERAÇÃO", L, 620, 6);
    ctx.fillStyle = TEXT; font(ctx, 900, 124, "expanded"); ctx.textAlign = "left"; ctx.fillText("PISTA", L, 760); ctx.fillText("FECHADA", L, 880);
    ctx.fillStyle = "#AEB7C6"; font(ctx, 400, 34); ctx.fillText("O corpo cresce na recuperação.", L, 980); ctx.fillText("Amanhã a pista continua aqui.", L, 1030);
    const st = Number(data.streak) || 0;
    ctx.fillStyle = LINE; ctx.fillRect(L, 1480, R - L, 2);
    ctx.fillStyle = TEXT; font(ctx, 900, 120, "condensed"); ctx.fillText(String(st), L, 1640);
    const w = ctx.measureText(String(st)).width; ctx.fillStyle = MUTED; font(ctx, 400, 30); ctx.fillText(st === 1 ? "dia seguido" : "dias seguidos", L + w + 24, 1636);
    for (let k = 0; k < Math.min(st, 14); k++) tile(ctx, L + k * 62, 1700, 54, 24, 4);
}

// 14d — resumo semanal: "N DE M" + três números + cada dia com as pastilhas das séries
function drawWeekly(ctx, data, ball) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const L = 72, R = W - 72;
    ctx.drawImage(hq(ball.small, 64), L, 110, 64, 64);
    ctx.fillStyle = TEXT; font(ctx, 900, 30, "expanded"); spaced(ctx, "CANCIO CLUB", L + 84, 154, 5);
    ctx.fillStyle = MUTED; font(ctx, 500, 26); spaced(ctx, "ÚLTIMOS 7 DIAS", R, 154, 2, "right");
    const done = Number(data.freqWeek) || 0, tgt = Number(data.weeklyTarget) || 0;
    ctx.fillStyle = "#C6D2E4"; font(ctx, 700, 24); spaced(ctx, tgt && done >= tgt ? "SEMANA FECHADA" : "SUA SEMANA", L, 330, 6);
    ctx.fillStyle = TEXT; font(ctx, 900, 128, "expanded"); ctx.textAlign = "left"; ctx.fillText(tgt ? `${done} DE ${tgt}` : `${done} TREINO${done === 1 ? "" : "S"}`, L, 460);
    let y = 530; ctx.fillStyle = LINE; ctx.fillRect(L, y, R - L, 2); ctx.fillRect(L, y + 150, R - L, 2);
    const sets = (data.weekDays || []).reduce((n, d) => n + d.sets, 0);
    const cells = [[String(sets), "séries"], [data.weeklyTime || "—", "de treino"], [String(data.streak || 0), "dias seguidos"]];
    const cw = (R - L) / 3;
    cells.forEach(([v, l], i) => { const cx = L + i * cw + (i ? 28 : 0); if (i) { ctx.fillStyle = LINE; ctx.fillRect(L + i * cw, y + 2, 2, 148); } ctx.fillStyle = TEXT; font(ctx, 900, 62, "condensed"); ctx.textAlign = "left"; ctx.fillText(v, cx, y + 90); ctx.fillStyle = MUTED; font(ctx, 400, 24); ctx.fillText(l, cx, y + 128); });
    y += 250;
    (data.weekDays || []).forEach((d) => {
        ctx.globalAlpha = d.name ? 1 : 0.35;
        ctx.fillStyle = MUTED; font(ctx, 700, 22); spaced(ctx, d.short, L, y + 4, 3);
        ctx.fillStyle = TEXT; font(ctx, 600, 32); ctx.textAlign = "left"; ctx.fillText(d.name || "descanso", L + 110, y + 4);
        for (let k = 0; k < Math.min(d.sets, 24); k++) tile(ctx, L + 110 + k * 30, y + 22, 26, 14, 3);
        ctx.globalAlpha = 1; y += d.sets ? 118 : 84;
    });
    ctx.fillStyle = "#5A6273"; font(ctx, 400, 26); ctx.textAlign = "center"; ctx.fillText("A constância é o único atalho.", W / 2, H - 110);
}

function shadowOn(ctx) { ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 3; }
function shadowOff(ctx) { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

function drawNumbers(ctx, s, ball) {
    const cx = W / 2; let y = 470;
    shadowOn(ctx); ctx.drawImage(hq(ball.big, 170), cx - 85, y, 170, 170); y += 250;
    ctx.fillStyle = "#FFFFFF"; font(ctx, 900, s.title.length > 14 ? 60 : 72, "expanded"); ctx.textAlign = "center"; ctx.fillText(s.title, cx, y); y += 110;
    const items = [s.duration && [s.duration, "TEMPO"], [String(s.sets), "SÉRIES"], s.volume > 0 && [`${thousands(s.volume)} kg`, "LEVANTADOS"], s.records > 0 && [`${s.records} ★`, s.records > 1 ? "RECORDES" : "RECORDE"]].filter(Boolean);
    items.forEach(([v, l]) => { font(ctx, 700, 24); spaced(ctx, l, cx, y, 6, "center"); font(ctx, 900, 92, "condensed"); ctx.textAlign = "center"; ctx.fillText(v, cx, y + 92); y += 170; });
    font(ctx, 900, 26, "expanded"); spaced(ctx, "CANCIO CLUB", cx, y + 20, 8, "center");
    shadowOff(ctx);
}

function drawTiles(ctx, s, ball) {
    const L = 80, R = W - 80; const rows = s.rows.slice(0, 8);
    const blockH = 40 + rows.length * 46 + 200;
    let y = H - 220 - blockH;
    shadowOn(ctx); ctx.fillStyle = "#FFFFFF";
    font(ctx, 700, 26); spaced(ctx, s.date, L, y, 6);
    font(ctx, 900, 64, "expanded"); ctx.textAlign = "left"; ctx.fillText(s.title.length > 18 ? s.title.slice(0, 17) + "…" : s.title, L, y + 74);
    ctx.drawImage(hq(ball.big, 120), R - 120, y - 30, 120, 120);
    y += 120;
    rows.forEach((r) => { for (let k = 0; k < r.sets; k++) tile(ctx, L + k * 62, y, 54, 30, 5); ctx.fillStyle = "#FFFFFF"; font(ctx, 600, 26); ctx.textAlign = "left"; ctx.fillText(r.name + (r.pr ? " ★" : ""), L + Math.max(r.sets, 1) * 62 + 14, y + 25); y += 46; });
    y += 24; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(L, y, R - L, 2); y += 70;
    const items = [s.duration && [s.duration, "tempo"], [String(s.sets), "séries"], s.records > 0 && [`${s.records} ★`, s.records > 1 ? "recordes" : "recorde"]].filter(Boolean);
    let x = L; ctx.fillStyle = "#FFFFFF";
    items.forEach(([v, l]) => { font(ctx, 900, 60, "condensed"); ctx.textAlign = "left"; ctx.fillText(v, x, y); const w = ctx.measureText(v).width; font(ctx, 500, 22); ctx.fillText(l, x, y + 34); x += Math.max(w, 120) + 56; });
    font(ctx, 900, 22, "expanded"); spaced(ctx, "CANCIO CLUB", R, y + 34, 6, "right");
    shadowOff(ctx);
}

function drawPhoto(ctx, img) {
    const k = Math.max(W / img.width, H / img.height); const w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.35)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

const MODES = [["card", "Card"], ["numeros", "Números"], ["pastilhas", "Pastilhas"]];

function ShareStudio({ data, onClose }) {
    const canvasRef = useRef(null), ballRef = useRef(null);
    const [mode, setMode] = useState("card");
    const [photo, setPhoto] = useState(null);
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState(null);
    const [phrase] = useState(() => SHARE_PHRASES[Math.floor(Math.random() * SHARE_PHRASES.length)]);
    const s = React.useMemo(() => summarize(data), [data]);
    useEffect(() => { let off = false; (async () => { try { if (document.fonts) { await document.fonts.load("900 40px Archivo"); await document.fonts.ready; } } catch (e) { } const [big, small] = await Promise.all([loadImg(SIL_URL), loadImg(SIL_SMALL_URL)]); ballRef.current = { big, small: small || big }; if (!off) setReady(true); })(); return () => { off = true; }; }, []);
    useEffect(() => {
        if (!ready || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, W, H);
        if (data.isWeeklySummary) drawWeekly(ctx, data, ballRef.current);
        else if (data.isRestDay) drawRest(ctx, data, ballRef.current);
        else if (mode === "card") drawCard(ctx, s, ballRef.current, phrase);
        else { if (photo) drawPhoto(ctx, photo); if (mode === "numeros") drawNumbers(ctx, s, ballRef.current); else drawTiles(ctx, s, ballRef.current); }
    }, [ready, mode, photo, s, phrase]);
    const blob = () => new Promise((r) => canvasRef.current.toBlob(r, "image/png"));
    const fname = () => `cancio-${mode}${photo && mode !== "card" ? "-foto" : ""}.png`;
    const flash = (t) => { setToast(t); setTimeout(() => setToast(null), 2200); };
    const download = async () => { setBusy(true); try { const b = await blob(); const url = URL.createObjectURL(b); const a = document.createElement("a"); a.href = url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); flash("PNG salvo"); } finally { setBusy(false); } };
    const share = async () => { setBusy(true); try { const b = await blob(); const file = new File([b], fname(), { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch (e) { if (e && e.name !== "AbortError") throw e; } } else { await download(); } } catch (e) { flash("Não deu pra compartilhar. Tente Baixar."); } finally { setBusy(false); } };
    const pickPhoto = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f); loadImg(url).then((img) => { setPhoto(img); if (mode === "card") setMode("numeros"); }); e.target.value = ""; };
    const transparent = mode !== "card" && !photo;
    const checker = "repeating-conic-gradient(#2A2E37 0 25%, #1A1D24 0 50%) 0 0 / 16px 16px";
    const thumbBox = (on) => ({ width: 60, height: 106, borderRadius: 8, overflow: "hidden", boxShadow: on ? `0 0 0 2px ${INK}, 0 0 0 3.5px ${TEXT}` : "inset 0 0 0 1px #2A2E37", display: "flex", alignItems: "center", justifyContent: "center" });
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 100, background: INK, display: "flex", flexDirection: "column", animation: "cc-fade .25s ease" } },
        React.createElement("div", { style: { padding: "calc(env(safe-area-inset-top) + 20px) 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 20, color: TEXT } }, "COMPARTILHAR"),
            React.createElement("button", { className: "cc-tap", onClick: onClose, style: { minHeight: 44, padding: "0 4px 0 12px", border: "none", background: "transparent", color: MUTED, fontFamily: F.body, fontSize: 14, cursor: "pointer" } }, "Fechar")),
        React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 20px" } },
            React.createElement("canvas", { ref: canvasRef, width: W, height: H, style: { height: "100%", maxHeight: "100%", maxWidth: "100%", aspectRatio: "9 / 16", borderRadius: 14, background: transparent ? checker : INK, boxShadow: `inset 0 0 0 1px ${LINE}` } })),
        React.createElement("div", { style: { padding: "14px 20px calc(env(safe-area-inset-bottom) + 18px)", borderTop: `1px solid ${LINE}`, display: "flex", flexDirection: "column", gap: 14 } },
            !data.isRestDay && !data.isWeeklySummary && React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
                MODES.map(([k, l]) => React.createElement("button", { key: k, className: "cc-tap", onClick: () => setMode(k), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0 } },
                    React.createElement("span", { style: { ...thumbBox(mode === k), background: k === "card" ? INK : photo ? "#3B3530" : checker } }, React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", color: TEXT } }, k === "card" ? "▮▮▮" : k === "numeros" ? "123" : "▪▪▪")),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: mode === k ? TEXT : MUTED, fontWeight: mode === k ? 700 : 400 } }, l))),
                React.createElement("label", { className: "cc-tap", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" } },
                    React.createElement("span", { style: { ...thumbBox(!!photo), color: MUTED, fontSize: 20, background: "transparent" } }, photo ? "✓" : "＋"),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: photo ? TEXT : MUTED } }, photo ? "Trocar foto" : "Sua foto"),
                    React.createElement("input", { type: "file", accept: "image/*", onChange: pickPhoto, style: { display: "none" } }))),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                React.createElement("button", { className: "cc-tap", disabled: busy || !ready, onClick: download, style: { flex: 1, height: 52, borderRadius: 16, border: "none", background: "transparent", boxShadow: "inset 0 0 0 1px #2E333D", color: "#C6D2E4", fontFamily: F.body, fontWeight: 600, fontSize: 14, cursor: "pointer" } }, "Baixar PNG"),
                React.createElement("button", { className: "cc-tap", disabled: busy || !ready, onClick: share, style: { flex: 2, height: 52, borderRadius: 16, border: "none", background: TEXT, color: INK, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: busy ? 0.7 : 1 } }, busy ? "Gerando…" : "Compartilhar")),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 11.5, color: "#5A6273", textAlign: "center" } }, toast || (mode === "card" ? "Card em fundo preto, pronto pro story." : photo ? "Figurinha aplicada sobre a sua foto." : "PNG transparente: cole como figurinha sobre a sua foto no Instagram."))));
}
export { ShareStudio };
