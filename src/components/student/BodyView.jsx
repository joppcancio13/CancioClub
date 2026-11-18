import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { photosOf, PosePicker } from "./Reassessment";

// Corpo (pedido do professor, 18/nov: "não faz sentido ser corpo e não ter corpo").
// Fotos primeiro: ANTES × AGORA por pose (frente, lado, costas), depois as medidas e o histórico com
// as fotos de cada data. "Adicionar fotos" grava uma entrada só de fotos (não conta como reavaliação).

const kg = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
const dLong = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "");
const POSE_L = { frente: "Frente", lado: "Lado", costas: "Costas" };
const KEYS = [["peso", "Peso", "kg"], ["cintura", "Cintura", "cm"], ["quadril", "Quadril", "cm"], ["braco", "Braço", "cm"], ["coxa", "Coxa", "cm"]];
const btn = (primary) => ({ flex: 1, minHeight: 52, borderRadius: 16, border: "none", background: primary ? C.text : "transparent", boxShadow: primary ? "none" : `inset 0 0 0 1px ${C.line2}`, color: primary ? C.bg : C.text2, fontFamily: F.body, fontWeight: primary ? 800 : 600, fontSize: 15, cursor: "pointer" });

function Shot({ src, label, date, onOpen }) {
    return (
        <button type="button" onClick={src ? onOpen : undefined} disabled={!src} style={{ position: "relative", minWidth: 0, aspectRatio: "3 / 4", padding: 0, border: "none", borderRadius: 16, overflow: "hidden", background: C.panel, boxShadow: src ? "none" : `inset 0 0 0 1px ${C.line}`, cursor: src ? "zoom-in" : "default" }}>
            {src ? <img src={src} alt={label + " · " + date} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.text4, padding: 10, textAlign: "center" }}>sem foto</span>}
            <span style={{ position: "absolute", left: 8, bottom: 8, right: 8, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <span style={{ ...KICKER, fontSize: 10, color: C.text, padding: "3px 7px", borderRadius: 999, background: "rgba(5,6,10,.72)" }}>{label}</span>
                {date && <span style={{ fontSize: 11, color: C.text, padding: "2px 7px", borderRadius: 999, background: "rgba(5,6,10,.72)" }}>{date}</span>}
            </span>
        </button>
    );
}

function BodyView({ student, onUpdate, onOpenReassess }) {
    const [pose, setPose] = useState(null);
    const [adding, setAdding] = useState(null); // fotos novas sendo escolhidas
    const [zoom, setZoom] = useState(null);
    const a = student.assessment || {};
    const num = (v) => { const x = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(x) && x > 0 ? x : null; };
    const entries = [{ date: student.assessmentAt, peso: num(a.peso), base: true }, ...(student.reassessments || [])].filter((x) => x.date);
    const measures = entries.filter((x) => !x.onlyPhoto);
    const lastM = measures[measures.length - 1], prevM = measures[measures.length - 2];
    const shots = entries.flatMap((e) => photosOf(e).map((p) => ({ ...p, date: e.date })));
    const poses = ["frente", "lado", "costas"].filter((k) => shots.some((s) => s.pose === k));
    const pz = pose && poses.includes(pose) ? pose : poses[0];
    const ofPose = shots.filter((s) => s.pose === pz);
    const first = ofPose[0], last = ofPose[ofPose.length - 1];
    const span = first && last && first !== last ? Math.round((new Date(last.date) - new Date(first.date)) / 864e5) : 0;
    const weights = measures.filter((m) => m.peso);
    const wDiff = weights.length > 1 ? weights[weights.length - 1].peso - weights[0].peso : null;

    if (adding) return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PosePicker value={adding} onChange={setAdding} />
            <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setAdding(null)} style={btn(false)}>Cancelar</button>
                <button type="button" disabled={!adding.length} onClick={() => { onUpdate({ reassessments: [...(student.reassessments || []), { date: new Date().toISOString(), onlyPhoto: true, fotos: adding }] }); setAdding(null); }} style={{ ...btn(true), flex: 2, opacity: adding.length ? 1 : 0.4 }}>Salvar fotos</button>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {shots.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <span style={KICKER}>{first !== last ? "ANTES × AGORA" : "SUA FOTO"}</span>
                        {poses.length > 1 && (
                            <div role="radiogroup" aria-label="Pose" style={{ display: "flex", padding: 3, borderRadius: 12, background: C.panel }}>
                                {poses.map((k) => <button key={k} type="button" role="radio" aria-checked={pz === k} onClick={() => setPose(k)} style={{ minHeight: 36, padding: "0 10px", borderRadius: 9, border: "none", background: pz === k ? C.text : "transparent", color: pz === k ? C.bg : C.text3, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{POSE_L[k]}</button>)}
                            </div>
                        )}
                    </div>
                    {first !== last ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <Shot src={first.src} label="ANTES" date={dLong(first.date)} onOpen={() => setZoom(first)} />
                            <Shot src={last.src} label="AGORA" date={dLong(last.date)} onOpen={() => setZoom(last)} />
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <Shot src={last.src} label={POSE_L[pz].toUpperCase()} date={dLong(last.date)} onOpen={() => setZoom(last)} />
                            <div style={{ borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line}`, padding: 14, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, fontSize: 13, lineHeight: 1.45, color: C.text3 }}>
                                <span style={{ ...KICKER }}>PRÓXIMA</span>
                                Tire a próxima na mesma pose e mesma luz. Aqui fica o antes × agora.
                            </div>
                        </div>
                    )}
                    {(span > 0 || wDiff != null) && <span style={{ fontSize: 13, color: C.text3 }}>{[span > 0 ? (span < 14 ? span + " dias" : Math.round(span / 7) + " semanas") + " entre as fotos" : null, wDiff != null ? "peso " + (wDiff > 0 ? "+" : wDiff < 0 ? "−" : "±") + kg(Math.abs(wDiff)) + " kg desde a anamnese" : null].filter(Boolean).join(" · ")}</span>}
                </div>
            ) : (
                <div style={{ borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.line}`, padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                    <svg width="44" height="64" viewBox="0 0 44 64" aria-hidden="true" style={{ flex: "none" }}><circle cx="22" cy="9" r="7" fill="none" stroke={C.text4} strokeWidth="2" /><path d="M10 60V36c0-8 5-14 12-14s12 6 12 14v24M16 60V44M28 60V44" fill="none" stroke={C.text4} strokeWidth="2" strokeLinecap="round" /></svg>
                    <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>Sem fotos ainda</span>
                        <span style={{ fontSize: 13, lineHeight: 1.45, color: C.text3 }}>Tire frente, lado e costas hoje. Daqui a algumas semanas você compara antes × agora.</span>
                    </span>
                </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setAdding([])} style={btn(!shots.length)}>{shots.length ? "+ Fotos de hoje" : "Tirar fotos"}</button>
                <button type="button" onClick={onOpenReassess} style={btn(false)}>Medidas</button>
            </div>

            {lastM && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={KICKER}>MEDIDAS · {dLong(lastM.date).toUpperCase()}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                        {KEYS.filter(([k]) => lastM[k] != null).map(([k, l, u]) => { const d = prevM && prevM[k] != null ? lastM[k] - prevM[k] : null; return (
                            <div key={k} style={{ minWidth: 0, padding: 12, borderRadius: 14, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontSize: 11, color: C.text4 }}>{l}</span>
                                <span style={{ fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontVariantNumeric: "tabular-nums", fontSize: 24 }}>{kg(lastM[k])}<span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 500, color: C.text4 }}> {u}</span></span>
                                <span style={{ fontSize: 11, color: C.text3, fontVariantNumeric: "tabular-nums" }}>{d == null ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "±") + kg(Math.abs(d)) + " " + u}</span>
                            </div>
                        ); })}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ ...KICKER, marginBottom: 4 }}>HISTÓRICO</span>
                {[...entries].reverse().map((m, i) => { const ph = photosOf(m); return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 60, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>{m.base ? "Anamnese" : m.onlyPhoto ? "Fotos" : "Reavaliação"}</span>
                            <span style={{ fontSize: 13, color: C.text3 }}>{new Date(m.date).toLocaleDateString("pt-BR") + (m.peso ? " · " + kg(m.peso) + " kg" : "")}</span>
                        </span>
                        <span style={{ display: "flex", gap: 4, flex: "none" }}>
                            {ph.map((p) => <button key={p.pose} type="button" onClick={() => setZoom({ ...p, date: m.date })} aria-label={"Ver foto " + POSE_L[p.pose]} style={{ width: 36, height: 48, padding: 0, border: "none", borderRadius: 8, overflow: "hidden", cursor: "zoom-in", background: C.panel }}><img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></button>)}
                        </span>
                    </div>
                ); })}
            </div>

            {zoom && (
                <div role="dialog" aria-modal="true" aria-label="Foto" onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(5,6,10,.96)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px)" }}>
                    <img src={zoom.src} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 16, objectFit: "contain" }} />
                    <span style={{ fontSize: 13, color: C.text3 }}>{POSE_L[zoom.pose] + " · " + dLong(zoom.date)}</span>
                    <button type="button" onClick={() => setZoom(null)} style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", background: C.raised, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                </div>
            )}
        </div>
    );
}

export { BodyView };
