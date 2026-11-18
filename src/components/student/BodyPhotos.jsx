import React, { useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { Icon } from "../shared/Icon";
import { haptic } from "../../utils/misc";

// Corpo com corpo (18/nov, pedido do professor): fotos de corpo do aluno — as da reavaliação e as que
// ele tira direto aqui — com "antes e agora" lado a lado. Ficam no registro do aluno (JPEG pequeno).

const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dShort = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return d + " " + MO[m - 1] + (y !== new Date().getFullYear() ? " " + y : ""); };
const readPhoto = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const S = 720, c = document.createElement("canvas"); const k = Math.min(1, S / Math.max(img.width, img.height)); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.78)); }; img.src = r.result; }; r.readAsDataURL(file); });

function BodyPhotos({ photos, onAdd, onRemove }) {
    const [view, setView] = useState(null);
    const [busy, setBusy] = useState(false);
    const list = [...photos].sort((a, b) => (a.date < b.date ? -1 : 1));
    const first = list[0], last = list[list.length - 1];
    const pick = async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return; setBusy(true); try { const img = await readPhoto(f); haptic("confirm"); onAdd(img); } catch (err) { } setBusy(false); };
    const frame = (p, label) => (
        <button type="button" onClick={() => setView(p)} style={{ position: "relative", flex: 1, minWidth: 0, aspectRatio: "3 / 4", borderRadius: 14, overflow: "hidden", border: "none", padding: 0, background: C.panel, cursor: "zoom-in" }}>
            <img src={p.img} alt={label + " · " + dShort(p.date)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <span style={{ position: "absolute", left: 8, bottom: 8, padding: "4px 8px", borderRadius: 999, background: "rgba(5,6,10,.72)", color: C.text, fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>{label} · {dShort(p.date)}</span>
        </button>
    );
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.length >= 2 ? (
                <div style={{ display: "flex", gap: 8 }}>{frame(first, "ANTES")}{frame(last, "AGORA")}</div>
            ) : list.length === 1 ? (
                <div style={{ display: "flex", gap: 8 }}>
                    {frame(first, "INÍCIO")}
                    <div style={{ flex: 1, aspectRatio: "3 / 4", borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.outline}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, textAlign: "center", color: C.text3, fontFamily: F.body, fontSize: 13, lineHeight: 1.4 }}>
                        <Icon name="calendar" size={22} color={C.text3} />Tire outra daqui a umas semanas pra comparar
                    </div>
                </div>
            ) : (
                <div style={{ padding: "22px 16px", borderRadius: 16, boxShadow: `inset 0 0 0 1px ${C.outline}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", fontFamily: F.body }}>
                    <Icon name="user" size={28} color={C.text3} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Sua primeira foto de corpo</span>
                    <span style={{ fontSize: 13, color: C.text3, lineHeight: 1.45, maxWidth: 300 }}>Mesma luz, mesma pose, de tempos em tempos. Daqui a um mês você compara lado a lado. Só você e seu professor veem.</span>
                </div>
            )}
            {list.length > 2 && (
                <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                    {[...list].reverse().map((p) => (
                        <button key={p.id} type="button" onClick={() => setView(p)} aria-label={"Foto de " + dShort(p.date)} style={{ flex: "none", width: 56, height: 74, borderRadius: 10, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", background: C.panel }}>
                            <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </button>
                    ))}
                </div>
            )}
            <label style={{ minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, background: list.length ? "transparent" : C.text, boxShadow: list.length ? `inset 0 0 0 1px ${C.outline}` : "none", color: list.length ? C.text : C.bg, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                <Icon name="plus" size={16} color={list.length ? C.text : C.bg} />{busy ? "Preparando…" : list.length ? "Adicionar foto de hoje" : "Tirar a primeira foto"}
                <input type="file" accept="image/*" onChange={pick} disabled={busy} style={{ display: "none" }} />
            </label>
            {view && (
                <div role="dialog" aria-modal="true" aria-label={"Foto de " + dShort(view.date)} onClick={() => setView(null)} style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(5,6,10,.94)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "calc(env(safe-area-inset-top) + 20px) 20px calc(env(safe-area-inset-bottom) + 20px)" }}>
                    <img src={view.img} alt="" style={{ maxWidth: "100%", maxHeight: "74vh", borderRadius: 16, objectFit: "contain" }} />
                    <span style={{ ...KICKER, color: C.text2 }}>{dShort(view.date)}{view.source === "reav" ? " · reavaliação" : ""}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => setView(null)} style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Fechar</button>
                        {view.source === "own" && onRemove && <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(view.id); setView(null); }} style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent, fontFamily: F.body, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apagar foto</button>}
                    </div>
                </div>
            )}
        </div>
    );
}

export { BodyPhotos };
