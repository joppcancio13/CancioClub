import React, { useEffect, useRef, useState } from "react";
import { C, F, KICKER, DAYS } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { computeDayRecords, fmtKg } from "../../utils/records";
import { countLoggedWorkingSetsInRange, calculateWeeklyVolume, fmtVol } from "../../utils/volumeCalculator";

// Resumo da semana — design v4 (47b): tela cheia com "SEMANA 11–17 NOV", "4 DE 5 TREINOS", a grade dos
// 7 dias (feito em prata), os recordes, as séries contra a semana anterior e o grupo mais treinado.
// Fechar e Compartilhar (card 1080×1920 no formato do Compartilhar). Abre pelo aviso de domingo no
// Hoje e por Perfil › Resumo da semana.

const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

// os números da semana (segunda a domingo) que contém `ref`
function weekSummary({ week, sessions, weeklyTarget, ref = new Date() }) {
    const mon = new Date(ref); mon.setHours(12, 0, 0, 0); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
    const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return iso(d); });
    const prevMon = new Date(mon); prevMon.setDate(mon.getDate() - 7);
    const prevStart = iso(prevMon), prevEnd = iso(new Date(mon.getTime() - 864e5));
    const sess = (sessions || []).filter((x) => x.date >= dates[0] && x.date <= dates[6] && x.effort !== "descanso");
    const doneDates = new Set(sess.map((x) => x.date));
    const planned = weeklyTarget || DAYS.filter((d) => (week[d.key] || []).length).length || 0;
    const all = []; DAYS.forEach((d) => (week[d.key] || []).forEach((e) => all.push({ ...e, _day: d.key })));
    const records = []; dates.forEach((dt) => computeDayRecords(all, dt).forEach((r) => { if (!records.some((x) => x.id === r.id)) records.push(r); }));
    const sets = all.reduce((n, e) => n + countLoggedWorkingSetsInRange(e, dates[0], dates[6]), 0);
    const prevSets = all.reduce((n, e) => n + countLoggedWorkingSetsInRange(e, prevStart, prevEnd), 0);
    const vol = calculateWeeklyVolume(all, 0).groupTotals;
    const top = Object.entries(vol).sort((a, b) => b[1] - a[1])[0] || null;
    const a = new Date(dates[0] + "T12:00:00"), b = new Date(dates[6] + "T12:00:00");
    const range = a.getMonth() === b.getMonth() ? a.getDate() + "–" + b.getDate() + " " + MO[b.getMonth()] : a.getDate() + " " + MO[a.getMonth()] + "–" + b.getDate() + " " + MO[b.getMonth()];
    return { dates, doneDates, done: doneDates.size, planned, records, sets, prevSets, top, range };
}

function drawCard(canvas, s, name) {
    const W = 1080, H = 1920; canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#05060A"; ctx.fillRect(0, 0, W, H);
    const silver = ctx.createLinearGradient(0, 0, W, H); silver.addColorStop(0, "#FFFFFF"); silver.addColorStop(0.55, "#AEB9CB"); silver.addColorStop(1, "#6E7889");
    const font = (w, px) => w + " " + px + "px Archivo, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    let y = 330;
    ctx.fillStyle = "#AEB7C6"; ctx.font = font(800, 40); ctx.fillText(("Semana " + s.range).toUpperCase(), 96, y);
    y += 170; ctx.fillStyle = silver; ctx.font = font(900, 190); ctx.fillText(s.done + " DE " + (s.planned || s.done), 90, y);
    y += 80; ctx.fillStyle = "#F2F5FA"; ctx.font = font(800, 56); ctx.fillText("TREINOS", 96, y);
    y += 90; const cw = 110, gap = 18;
    ["S", "T", "Q", "Q", "S", "S", "D"].forEach((l, i) => {
        const x = 96 + i * (cw + gap);
        ctx.fillStyle = s.doneDates.has(s.dates[i]) ? silver : "#11141A";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, cw, cw, 18) : ctx.rect(x, y, cw, cw); ctx.fill();
        ctx.fillStyle = s.doneDates.has(s.dates[i]) ? "#05060A" : "#7D8698"; ctx.font = font(800, 40); ctx.textAlign = "center"; ctx.fillText(l, x + cw / 2, y + cw / 2 + 14); ctx.textAlign = "left";
    });
    y += cw + 110;
    const line = (k, v) => { ctx.fillStyle = "#AEB7C6"; ctx.font = font(800, 34); ctx.fillText(k.toUpperCase(), 96, y); ctx.fillStyle = "#F2F5FA"; ctx.font = font(700, 52); ctx.fillText(v, 96, y + 66); y += 150; };
    s.records.slice(0, 2).forEach((r) => line("Recorde", r.name + " · " + fmtKg(r.load) + " × " + r.reps));
    line("Séries", s.sets + (s.prevSets ? " · " + (s.sets - s.prevSets >= 0 ? "+" : "−") + Math.abs(s.sets - s.prevSets) + " vs. semana anterior" : ""));
    if (s.top) line("Mais treinado", s.top[0] + " · " + fmtVol(s.top[1]) + " séries");
    ctx.fillStyle = "#7D8698"; ctx.font = font(800, 34); ctx.fillText("CANCIO CLUB" + (name ? " · " + name.toUpperCase() : ""), 96, H - 300);
}

function WeekSummary({ studentName, week, sessions, weeklyTarget, onClose }) {
    const s = weekSummary({ week, sessions, weeklyTarget });
    const canvasRef = useRef(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => { if (canvasRef.current) drawCard(canvasRef.current, s, String(studentName || "").split(" ")[0]); });
    const share = async () => {
        if (busy) return; setBusy(true); haptic("confirm");
        try {
            const cv = canvasRef.current; drawCard(cv, s, String(studentName || "").split(" ")[0]);
            const blob = await new Promise((res) => cv.toBlob(res, "image/png"));
            const file = new File([blob], "cancio-semana.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
            else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "cancio-semana.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
        } catch (e) { /* compartilhamento cancelado */ }
        setBusy(false);
    };
    const silverBox = { backgroundImage: "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)" };
    const rows = [...s.records.slice(0, 3).map((r) => ["Recorde", r.name + " · " + fmtKg(r.load) + " × " + r.reps]), ["Séries", s.sets + (s.prevSets ? " · " + (s.sets - s.prevSets >= 0 ? "+" : "−") + Math.abs(s.sets - s.prevSets) + " vs. semana anterior" : "")], ...(s.top ? [["Mais treinado", s.top[0] + " · " + fmtVol(s.top[1]) + " séries"]] : [])];
    return (
        <div role="dialog" aria-modal="true" aria-label="Resumo da semana" style={{ position: "fixed", inset: 0, zIndex: 130, background: C.bg, color: C.text, fontFamily: F.body, overflowY: "auto" }}>
            <div style={{ maxWidth: 620, margin: "0 auto", boxSizing: "border-box", minHeight: "100%", padding: "calc(28px + env(safe-area-inset-top, 0px)) 24px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 18 }}>
                <span style={KICKER}>{"Semana " + s.range}</span>
                <span style={{ fontFamily: F.display, fontSize: 64, fontWeight: 900, fontStretch: "125%", lineHeight: 0.95 }}>{s.done + " DE " + (s.planned || s.done)}<br /><span style={{ fontSize: 26 }}>TREINOS</span></span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
                    {["S", "T", "Q", "Q", "S", "S", "D"].map((l, i) => { const on = s.doneDates.has(s.dates[i]); return <span key={i} aria-label={DAYS[i].full + (on ? ", treinou" : "")} style={{ aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: on ? C.bg : C.text4, ...(on ? silverBox : { background: "#11141A" }) }}>{l}</span>; })}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {rows.map(([k, v], i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "12px 0", boxShadow: `inset 0 -1px 0 ${C.line}` }}>
                            <span style={KICKER}>{k}</span><span style={{ fontSize: 17, fontWeight: 700 }}>{v}</span>
                        </div>
                    ))}
                    {s.records.length === 0 && <span style={{ padding: "12px 0", fontSize: 15, color: C.text3 }}>Sem recorde essa semana. A próxima é sua.</span>}
                </div>
                <canvas ref={canvasRef} aria-hidden="true" style={{ display: "none" }} />
                <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                    <button type="button" onClick={onClose} style={{ height: 56, borderRadius: 16, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                    <button type="button" onClick={share} disabled={busy} style={{ height: 56, borderRadius: 16, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Compartilhar</button>
                </div>
            </div>
        </div>
    );
}

export { WeekSummary, weekSummary };
