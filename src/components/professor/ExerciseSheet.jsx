import React, { useState } from "react";
import { C, F } from "../../styles/tokens";
import { haptic } from "../../utils/misc";
import { exerciseCatalog } from "../../data/exerciseCatalog";
import { suggestCatalogMatch, normalize } from "../../utils/catalogMatch";
import { GROUP_ORDER, groupActivation, plannedWorkingSets, fmtVol } from "../../utils/volumeCalculator";
import { planSummary } from "../../utils/workout";

// Gavetas do "Editar ficha" — design v3 (protótipo 27, Professor · Editar ficha):
// · Adicionar: busca + grupos; primeiro "Na sua biblioteca" (com a prescrição da última vez), depois
//   "Do catálogo" (com os grupos que o exercício trabalha). "+ Pôr" entra direto na ficha.
// · Trocar: primeiro os de mesmo padrão de movimento, depois os do mesmo grupo, com quanto o volume
//   da semana muda. Séries, reps e descanso ficam; o histórico do antigo fica guardado.

const kicker = { fontFamily: F.display, fontSize: 11, fontWeight: 800, fontStretch: "125%", letterSpacing: "0.14em", color: C.text4 };
const CAT = Object.values(exerciseCatalog);
const has = (txt, q) => normalize(txt).includes(normalize(q).trim());
const groupsLine = (entry) => Object.entries(groupActivation(entry)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, v]) => g + " " + fmtVol(v)).join(" · ");
const restTxt = (r) => (r ? (r >= 60 ? Math.floor(r / 60) + ":" + String(r % 60).padStart(2, "0") : r + "s") : null);

function Row({ name, sub, action, onClick }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", boxShadow: `inset 0 -1px 0 ${C.line}` }}>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, fontStretch: "110%" }}>{name}</span>
                {sub && <span style={{ fontSize: 13, color: C.text4, fontVariantNumeric: "tabular-nums" }}>{sub}</span>}
            </span>
            <button type="button" onClick={onClick} style={{ flex: "none", minHeight: 40, padding: "0 14px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{action}</button>
        </div>
    );
}

function ExerciseSheet({ mode, swapEx, dayList, week, library, dayLabel, onAdd, onSwap, onRemove, onManual, onClose }) {
    const [q, setQ] = useState("");
    const [group, setGroup] = useState(() => {
        const last = [...(dayList || [])].reverse().find((e) => e.catalogId && exerciseCatalog[e.catalogId]);
        return last ? exerciseCatalog[last.catalogId].grupo : "Peitoral";
    });
    const inDay = new Set((dayList || []).map((e) => e.catalogId).filter(Boolean));
    const inDayNames = new Set((dayList || []).map((e) => normalize(e.name).trim()));
    // última prescrição do exercício nesta ficha (outro dia), pra "da última vez"
    const lastPlan = (name) => { let hit = null; Object.values(week || {}).forEach((l) => (l || []).forEach((e) => { if (normalize(e.name).trim() === normalize(name).trim()) hit = e; })); return hit; };
    const libEntry = (it) => suggestCatalogMatch(it.name, exerciseCatalog);
    const query = q.trim();

    const libRows = (library || []).filter((it) => !inDayNames.has(normalize(it.name).trim())).filter((it) => {
        if (query) return has(it.name, query);
        const e = libEntry(it); return (e && e.grupo === group) || normalize(it.tag) === normalize(group);
    });
    const libNames = new Set((library || []).map((it) => normalize(it.name).trim()));
    const catRows = CAT.filter((e) => !inDay.has(e.id) && !libNames.has(normalize(e.nome).trim()) && (query ? has(e.nome, query) : e.grupo === group))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const addLib = (it) => {
        const prev = lastPlan(it.name); const e = libEntry(it);
        onAdd({ name: it.name, url: it.url || undefined, catalogId: (prev && prev.catalogId) || (e && e.id) || undefined, sets: prev ? prev.sets : 3, reps: prev ? prev.reps : "10", rest: prev ? prev.rest : 60, setPlan: prev ? prev.setPlan : null });
    };
    const addCat = (e) => onAdd({ name: e.nome, catalogId: e.id, sets: 3, reps: "10", rest: 60, setPlan: null });

    // troca
    const cur = swapEx ? (exerciseCatalog[swapEx.catalogId] || suggestCatalogMatch(swapEx.name, exerciseCatalog)) : null;
    const nSets = swapEx ? plannedWorkingSets(swapEx) : 0;
    const diff = (e) => {
        if (!cur) return null; const ga = groupActivation(cur), gb = groupActivation(e);
        const parts = Array.from(new Set([...Object.keys(ga), ...Object.keys(gb)])).sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
            .map((k) => { const d = Math.round(((gb[k] || 0) - (ga[k] || 0)) * nSets * 10) / 10; return d ? k + " " + (d > 0 ? "+" : "−") + fmtVol(Math.abs(d)) : null; }).filter(Boolean);
        return parts.length ? parts.join(" · ") + " na semana" : "volume igual";
    };
    let swapOpts = [];
    if (mode === "swap") {
        if (query) swapOpts = CAT.filter((e) => e.id !== (cur && cur.id) && !inDay.has(e.id) && has(e.nome, query)).slice(0, 8);
        else if (cur) {
            const same = CAT.filter((e) => e.id !== cur.id && !inDay.has(e.id) && e.categoria === cur.categoria);
            const near = CAT.filter((e) => e.id !== cur.id && !inDay.has(e.id) && e.grupo === cur.grupo && e.categoria !== cur.categoria);
            swapOpts = [...same, ...near].slice(0, 5);
        }
    }
    const title = mode === "swap" ? "TROCAR · " + String(swapEx.name).toUpperCase() : "ADICIONAR EXERCÍCIO" + (dayLabel ? " · " + dayLabel.toUpperCase() : "");

    return (
        <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 120, color: C.text, fontFamily: F.body }}>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,6,10,.72)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: mode === "swap" ? "18vh" : "10vh", maxWidth: 620, margin: "0 auto", boxSizing: "border-box", borderRadius: "20px 20px 0 0", background: C.panel, boxShadow: `inset 0 1px 0 ${C.line}`, padding: "16px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ ...kicker, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
                    <button type="button" onClick={onClose} style={{ flex: "none", minHeight: 44, padding: 0, border: "none", background: "none", color: C.text3, fontFamily: F.body, fontSize: 15, cursor: "pointer" }}>Fechar</button>
                </div>

                {mode === "swap" && (
                    <>
                        {swapEx && <span style={{ fontSize: 13, color: C.text3 }}>{"Hoje: " + planSummary(swapEx) + (cur ? " · " + cur.categoria.toLowerCase() : "")}</span>}
                        {!query && <span style={{ fontSize: 13, lineHeight: 1.45, color: C.text4 }}>{cur ? "Primeiro os de mesmo padrão (" + cur.categoria.toLowerCase() + "), depois os do mesmo grupo. Mostra quanto o volume muda com " + nSets + (nSets === 1 ? " série." : " séries.") : "Esse exercício não está ligado ao catálogo — busque o substituto pelo nome."}</span>}
                    </>
                )}

                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={mode === "swap" ? "Buscar outro exercício" : "Buscar na biblioteca e no catálogo"} aria-label="Buscar exercício"
                    style={{ width: "100%", boxSizing: "border-box", height: 48, padding: "0 14px", borderRadius: 10, border: "none", outline: "none", background: C.bg, boxShadow: `inset 0 0 0 1.5px ${C.text2}`, color: C.text, fontFamily: F.body, fontSize: 15 }} />

                {mode === "add" && (
                    <>
                        {!query && (
                            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", margin: "0 -20px", padding: "0 20px" }}>
                                {GROUP_ORDER.map((g) => {
                                    const on = g === group;
                                    return <button key={g} type="button" aria-pressed={on} onClick={() => setGroup(g)} style={{ flex: "none", minHeight: 40, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text2, boxShadow: `inset 0 0 0 1px ${C.outline}` }) }}>{g}</button>;
                                })}
                            </div>
                        )}
                        {libRows.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={kicker}>NA SUA BIBLIOTECA</span>
                                {libRows.map((it) => { const prev = lastPlan(it.name); const sub = [prev ? "da última vez: " + planSummary(prev) + (restTxt(prev.rest) ? " · " + restTxt(prev.rest) : "") : it.tag || null, it.url ? "vídeo" : null].filter(Boolean).join(" · "); return <Row key={it.id} name={it.name} sub={sub} action="+ Pôr" onClick={() => { haptic("confirm"); addLib(it); }} />; })}
                            </div>
                        )}
                        {catRows.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={kicker}>DO CATÁLOGO</span>
                                {catRows.map((e) => <Row key={e.id} name={e.nome} sub={groupsLine(e)} action="+ Pôr" onClick={() => { haptic("confirm"); addCat(e); }} />)}
                            </div>
                        )}
                        {!libRows.length && !catRows.length && <span style={{ fontSize: 13, color: C.text4 }}>{query ? "Nada na biblioteca nem no catálogo com esse nome." : "Nada novo nesse grupo."}</span>}
                        <button type="button" onClick={() => onManual(query)} style={{ minHeight: 48, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, cursor: "pointer" }}>
                            {query ? "Criar “" + query + "” do zero" : "Criar do zero (nome, séries, reps, vídeo)"}
                        </button>
                    </>
                )}

                {mode === "swap" && (
                    <>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {swapOpts.map((e) => { const d = diff(e); return <Row key={e.id} name={e.nome} sub={d} action="Trocar" onClick={() => { haptic("confirm"); onSwap(e); }} />; })}
                            {!swapOpts.length && <span style={{ fontSize: 13, color: C.text4 }}>{query ? "Nada no catálogo com esse nome." : cur ? "Nenhuma alternativa que já não esteja no dia." : ""}</span>}
                        </div>
                        <span style={{ fontSize: 13, lineHeight: 1.45, color: C.text4 }}>Séries, reps e descanso ficam. O que o aluno já registrou no antigo fica guardado nas fases arquivadas.</span>
                        <button type="button" onClick={onRemove} style={{ minHeight: 48, borderRadius: 10, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Tirar da ficha</button>
                    </>
                )}
            </div>
        </div>
    );
}

export { ExerciseSheet };
