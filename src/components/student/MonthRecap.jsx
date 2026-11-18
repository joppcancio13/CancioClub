import React, { useEffect, useRef, useState } from "react";
import { C, F, KICKER, DAYS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { computeDayRecords, fmtKg } from "../../utils/records";
import { countLoggedWorkingSetsInRange } from "../../utils/volumeCalculator";
import { daySummary } from "../../utils/workout";

// Retrospectiva do mês (frente 4, 18/nov): nos primeiros dias do mês o Hoje oferece "Seu outubro no
// Club" — treinos, horas, séries, toneladas, recordes e o calendário do mês, com card pra compartilhar
// no mesmo formato do Resumo da semana (1080×1920).

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WD_FULL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const pad = (n) => String(n).padStart(2, "0");
const thousands = (v) => Math.round(v).toLocaleString("pt-BR");

// números do mês `year`/`month` (month 0–11)
function monthSummary({ week, sessions, year, month }) {
    const dim = new Date(year, month + 1, 0).getDate();
    const start = `${year}-${pad(month + 1)}-01`, end = `${year}-${pad(month + 1)}-${pad(dim)}`;
    const sess = (sessions || []).filter((x) => x.date >= start && x.date <= end && x.effort !== "descanso");
    const days = new Set(sess.map((x) => x.date));
    const seconds = sess.reduce((n, x) => n + (Number(x.durationSec) || 0), 0);
    const all = []; DAYS.forEach((d) => (week[d.key] || []).forEach((e) => all.push(e)));
    const sets = all.reduce((n, e) => n + countLoggedWorkingSetsInRange(e, start, end), 0);
    let volume = 0; all.forEach((e) => (e.history || []).forEach((h) => { if (h && h.date >= start && h.date <= end) volume += daySummary(h).volume || 0; }));
    // um recorde por exercício: o melhor do mês (o último a ser batido)
    const records = []; [...days].sort().forEach((dt) => computeDayRecords(all, dt).forEach((r) => { const i = records.findIndex((x) => x.name === r.name); if (i < 0) records.push(r); else if ((Number(r.load) || 0) >= (Number(records[i].load) || 0)) records[i] = r; }));
    const wd = {}; days.forEach((dt) => { const k = new Date(dt + "T12:00:00").getDay(); wd[k] = (wd[k] || 0) + 1; });
    const fav = Object.entries(wd).sort((a, b) => b[1] - a[1])[0];
    return { year, month, dim, days, count: days.size, hours: seconds / 3600, sets, volume, records, favDay: fav && fav[1] > 1 ? WD_FULL[fav[0]] : null, label: MONTHS[month] };
}
// o mês anterior a `ref`
function lastMonthOf(ref = new Date()) { const d = new Date(ref.getFullYear(), ref.getMonth() - 1, 15); return { year: d.getFullYear(), month: d.getMonth() }; }
const fmtHours = (h) => (h >= 10 ? String(Math.round(h)) : String(Math.round(h * 10) / 10).replace(".", ","));

function drawCard(canvas, s, name) {
    const W = 1080, H = 1920; canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#05060A"; ctx.fillRect(0, 0, W, H);
    const silver = ctx.createLinearGradient(0, 0, W, H); silver.addColorStop(0, "#FFFFFF"); silver.addColorStop(0.55, "#AEB9CB"); silver.addColorStop(1, "#6E7889");
    const font = (w, px) => w + " " + px + "px Archivo, system-ui, sans-serif";
    const L = 96, R = W - 96;
    let y = 330;
    ctx.fillStyle = "#AEB7C6"; ctx.font = font(800, 40); ctx.fillText(("Retrospectiva · " + s.label + " " + s.year).toUpperCase(), L, y);
    y += 190; ctx.fillStyle = silver; ctx.font = font(900, 210); ctx.fillText(String(s.count), L - 6, y);
    const cw0 = ctx.measureText(String(s.count)).width; ctx.fillStyle = "#F2F5FA"; ctx.font = font(800, 60); ctx.fillText(s.count === 1 ? "TREINO" : "TREINOS", L + cw0 + 24, y);
    // calendário do mês: 7 colunas, prata nos dias treinados
    y += 70; const first = (new Date(s.year, s.month, 1).getDay() + 6) % 7, cell = 108, gap = 14;
    for (let d = 1; d <= s.dim; d++) {
        const i = first + d - 1, x = L + (i % 7) * (cell + gap), yy = y + Math.floor(i / 7) * (cell * 0.56 + gap);
        const on = s.days.has(`${s.year}-${pad(s.month + 1)}-${pad(d)}`);
        ctx.fillStyle = on ? silver : "#11141A"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, yy, cell, cell * 0.56, 12) : ctx.rect(x, yy, cell, cell * 0.56); ctx.fill();
    }
    const rows = Math.ceil((first + s.dim) / 7); y += rows * (cell * 0.56 + gap) + 90;
    const cells = [[fmtHours(s.hours) + " h", "de treino"], [String(s.sets), "séries"], [s.volume >= 1000 ? (Math.round(s.volume / 100) / 10).toString().replace(".", ",") + " t" : thousands(s.volume) + " kg", "levantados"]];
    const cw = (R - L) / 3;
    ctx.fillStyle = "#1E222A"; ctx.fillRect(L, y - 70, R - L, 2);
    cells.forEach(([v, l], i) => { const cx = L + i * cw; ctx.fillStyle = "#F2F5FA"; ctx.font = font(900, 72); ctx.fillText(v, cx, y + 20); ctx.fillStyle = "#7D8698"; ctx.font = font(500, 32); ctx.fillText(l, cx, y + 66); });
    y += 170;
    const line = (k, v) => { ctx.fillStyle = "#AEB7C6"; ctx.font = font(800, 32); ctx.fillText(k.toUpperCase(), L, y); ctx.fillStyle = "#F2F5FA"; ctx.font = font(700, 50); ctx.fillText(v, L, y + 62); y += 140; };
    if (s.records.length) line(s.records.length === 1 ? "Recorde" : s.records.length + " recordes", s.records.slice(0, 2).map((r) => r.name).join(" · "));
    if (s.favDay && y < H - 420) line("Dia favorito", s.favDay);
    ctx.fillStyle = "#7D8698"; ctx.font = font(800, 34); ctx.fillText("CANCIO CLUB" + (name ? " · " + name.toUpperCase() : ""), L, H - 300);
}

function MonthRecap({ studentName, week, sessions, year, month, onClose }) {
    const s = monthSummary({ week, sessions, year, month });
    const canvasRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const first = String(studentName || "").split(" ")[0];
    useEffect(() => { if (canvasRef.current) drawCard(canvasRef.current, s, first); });
    const share = async () => {
        if (busy) return; setBusy(true); haptic("confirm");
        try {
            const cv = canvasRef.current; drawCard(cv, s, first);
            const blob = await new Promise((res) => cv.toBlob(res, "image/png"));
            const file = new File([blob], "cancio-" + s.label + ".png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
            else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
        } catch (e) { /* compartilhamento cancelado */ }
        setBusy(false);
    };
    const silverBox = { backgroundImage: "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)" };
    const firstWd = (new Date(year, month, 1).getDay() + 6) % 7;
    const stats = [[fmtHours(s.hours) + " h", "de treino"], [String(s.sets), "séries"], [s.volume >= 1000 ? (Math.round(s.volume / 100) / 10).toString().replace(".", ",") + " t" : thousands(s.volume) + " kg", "levantados"]];
    return (
        <div role="dialog" aria-modal="true" aria-label={"Retrospectiva de " + s.label} style={{ position: "fixed", inset: 0, zIndex: 130, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", boxSizing: "border-box", minHeight: "100%", padding: "calc(28px + env(safe-area-inset-top, 0px)) 24px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 18 }}>
                <span style={KICKER}>{"Retrospectiva · " + s.label + " " + year}</span>
                <span style={{ fontFamily: F.display, fontSize: 64, fontWeight: 900, fontStretch: "125%", lineHeight: 0.95 }}>{s.count}<span style={{ fontSize: 26 }}>{s.count === 1 ? " TREINO" : " TREINOS"}</span></span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5 }} aria-label={s.count + " dias treinados em " + s.label}>
                    {Array.from({ length: firstWd }, (_, i) => <span key={"v" + i} />)}
                    {Array.from({ length: s.dim }, (_, i) => { const on = s.days.has(`${year}-${pad(month + 1)}-${pad(i + 1)}`); return <span key={i} style={{ height: 18, borderRadius: 4, ...(on ? silverBox : { background: "#11141A" }) }} />; })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "14px 0", boxShadow: `inset 0 1px 0 ${C.line}, inset 0 -1px 0 ${C.line}` }}>
                    {stats.map(([v, l]) => (
                        <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums" }}>{v}</span>
                            <span style={{ fontSize: 13, color: C.text3 }}>{l}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {s.records.slice(0, 4).map((r) => (
                        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                            <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}><span style={KICKER}>Recorde</span><span style={{ fontSize: 17, fontWeight: 700 }}>{r.name}</span></span>
                            <span style={{ alignSelf: "flex-end", fontFamily: F.display, fontSize: 22, fontWeight: 900, fontStretch: "75%", whiteSpace: "nowrap" }}>{fmtKg(r.load) + " kg"}</span>
                        </div>
                    ))}
                    {s.favDay && <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "12px 0", boxShadow: `inset 0 -1px 0 ${C.line}` }}><span style={KICKER}>Dia favorito</span><span style={{ fontSize: 17, fontWeight: 700 }}>{s.favDay}</span></div>}
                    {s.count === 0 && <span style={{ padding: "12px 0", fontSize: 15, color: C.text3 }}>Mês sem treino registrado. Este é o seu.</span>}
                </div>
                <canvas ref={canvasRef} aria-hidden="true" style={{ display: "none" }} />
                <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                    <button type="button" onClick={onClose} style={{ height: 56, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                    <button type="button" onClick={share} disabled={busy || s.count === 0} style={{ height: 56, borderRadius: 16, border: "none", background: s.count ? C.text : C.raised, color: s.count ? C.bg : C.text4, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: s.count ? "pointer" : "default" }}>Compartilhar</button>
                </div>
            </div>
        </div>
    );
}

export { MonthRecap, monthSummary, lastMonthOf };
