import React, { useMemo, useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { exerciseCatalog, catalogByGroup } from "../../data/exerciseCatalog";
import { suggestCatalogMatch, normalize } from "../../utils/catalogMatch";
import { groupActivation, fmtVol } from "../../utils/volumeCalculator";
import { haptic } from "../../utils/misc";
import { CatalogPicker } from "../shared/CatalogPicker";
import { MediaEmbed } from "../shared/MediaEmbed";

// Biblioteca › Exercícios ligada ao catálogo do cálculo de volume (pedido do professor, 18/nov).
// Antes eram duas listas que não se falavam: a biblioteca (nome + vídeo + "grupo" digitado, sempre
// "sem grupo") e o catálogo com a ativação por músculo, que é o que conta no volume. Agora a lista é
// uma só: todo o catálogo, por grupo muscular, com o que está em uso primeiro; os exercícios criados
// por você aparecem junto, ligados a uma entrada do catálogo (e aí contam no volume) ou marcados
// "não conta no volume" com a sugestão de um toque pra ligar.

const kicker = KICKER;
const norm = (s) => normalize(s).trim();
const CAT = Object.values(exerciseCatalog);
const GROUPS = catalogByGroup.map((g) => g.grupo);
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
const ghost = { border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, cursor: "pointer" };
const chip = (on) => ({ flex: "none", minHeight: 40, padding: "0 12px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text2, boxShadow: `inset 0 0 0 1px ${C.outline}` }) });
const groupsLine = (entry) => Object.entries(groupActivation(entry)).sort((a, b) => b[1] - a[1]).map(([g, v]) => g + " " + fmtVol(v)).join(" · ");

function Row({ row, uses, open, onToggle, onUpdateLib, onAddLib, onRemoveLib }) {
    const { item, entry } = row;
    const [f, setF] = useState({ name: item ? item.name : entry.nome, url: (item && item.url) || "" });
    const [show, setShow] = useState(false);
    const name = item ? item.name : entry.nome;
    const linked = !!entry;
    const sub = [linked ? entry.grupo : "não conta no volume", uses ? "em " + plural(uses, "ficha", "fichas") : null, item && item.url ? "vídeo" : null].filter(Boolean).join(" · ");
    const inp = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "0 12px", borderRadius: 10, border: "none", outline: "none", background: C.bg, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 15 };
    // exercício só do catálogo ganha um registro na biblioteca na primeira vez que recebe vídeo
    const saveUrl = () => { const v = f.url.trim(); if (item) { if (v !== (item.url || "")) onUpdateLib(item.id, { url: v }); } else if (v) onAddLib(entry.nome, v, entry.grupo, entry.id); };
    return (
        <div style={{ boxShadow: `inset 0 -1px 0 ${C.line}` }}>
            <button type="button" onClick={onToggle} aria-expanded={open}
                style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 10, padding: "10px 0", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, fontStretch: "110%", color: uses || item ? C.text : C.text2 }}>{name}</span>
                    <span style={{ fontFamily: F.body, fontSize: 13, color: linked ? C.text3 : C.accent }}>{sub}</span>
                </span>
                {item && <span title="Criado por você" style={{ flex: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.text4 }}>SEU</span>}
                <span aria-hidden="true" style={{ color: C.text4, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s ease" }}>›</span>
            </button>
            {open && (
                <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {linked && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={kicker}>CONTA NO VOLUME · SÉRIES POR SÉRIE</span>
                            <span style={{ fontSize: 15, lineHeight: 1.4, fontVariantNumeric: "tabular-nums" }}>{groupsLine(entry) || "—"}</span>
                            <span style={{ fontSize: 13, color: C.text3 }}>{entry.categoria + (item && norm(item.name) !== norm(entry.nome) ? " · no catálogo: " + entry.nome : "")}</span>
                        </div>
                    )}
                    {item && (
                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={kicker}>NOME</span>
                            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onBlur={() => { const v = f.name.trim(); if (!v) return setF({ ...f, name: item.name }); if (v !== item.name) onUpdateLib(item.id, { name: v }); }} style={inp} />
                        </label>
                    )}
                    {item && (
                        <CatalogPicker label={linked ? "Ligado ao catálogo" : "Ligar ao catálogo (pra contar no volume)"} value={item.catalogId || (entry ? entry.id : "")} exerciseName={item.name}
                            onChange={(id) => onUpdateLib(item.id, { catalogId: id || undefined, tag: id && exerciseCatalog[id] ? exerciseCatalog[id].grupo : "" })} />
                    )}
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={kicker}>VÍDEO DE EXECUÇÃO</span>
                        <input value={f.url} placeholder="cole o link" onChange={(e) => setF({ ...f, url: e.target.value })} onBlur={saveUrl} style={inp} />
                    </label>
                    {item && item.url && show && <MediaEmbed url={item.url} />}
                    <div style={{ display: "flex", gap: 8 }}>
                        {item && item.url && <button type="button" onClick={() => setShow(!show)} style={{ ...ghost, flex: 1, minHeight: 44, borderRadius: 10 }}>{show ? "Ocultar vídeo" : "Ver vídeo"}</button>}
                        {item && <button type="button" onClick={() => onRemoveLib(item.id)} style={{ ...ghost, flex: 1, minHeight: 44, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent }}>Remover da biblioteca</button>}
                    </div>
                    {item && uses > 0 && <span style={{ fontSize: 13, color: C.text3 }}>Remover daqui não tira o exercício das fichas que já usam.</span>}
                </div>
            )}
        </div>
    );
}

function BibliotecaExercicios({ library, students, workouts, onAddLib, onUpdateLib, onRemoveLib, onLinkFichas }) {
    const [q, setQ] = useState("");
    const [group, setGroup] = useState("todos");
    const [open, setOpen] = useState(null);
    const [showAll, setShowAll] = useState(false);

    // uso nas fichas: por vínculo ao catálogo (catalogId) e, sem vínculo, pelo nome
    const { useById, useByName, unlinkedInFichas } = useMemo(() => {
        const byId = {}, byName = {}, unlinked = {};
        students.forEach((s) => {
            const ids = new Set(), names = new Set();
            Object.values((workouts || {})[s.id] || {}).forEach((list) => (list || []).forEach((e) => {
                if (e.catalogId) ids.add(e.catalogId);
                names.add(norm(e.name));
                if (!e.catalogId) unlinked[norm(e.name)] = e.name; // sem catalogId não entra na conta de volume
            }));
            ids.forEach((id) => { byId[id] = (byId[id] || 0) + 1; });
            names.forEach((n) => { byName[n] = (byName[n] || 0) + 1; });
        });
        return { useById: byId, useByName: byName, unlinkedInFichas: Object.values(unlinked) };
    }, [students, workouts]);

    // linhas: cada item da biblioteca (ligado = conta no volume) + o catálogo que nenhum item cobre
    const rows = useMemo(() => {
        const covered = new Set();
        const libRows = library.map((it) => {
            const entry = (it.catalogId && exerciseCatalog[it.catalogId]) || CAT.find((e) => norm(e.nome) === norm(it.name)) || null;
            if (entry) covered.add(entry.id);
            return { key: "l" + it.id, item: it, entry };
        });
        const catRows = CAT.filter((e) => !covered.has(e.id)).map((e) => ({ key: "c" + e.id, item: null, entry: e }));
        return [...libRows, ...catRows];
    }, [library]);
    const usesOf = (r) => Math.max(r.entry ? useById[r.entry.id] || 0 : 0, useByName[norm(r.item ? r.item.name : r.entry.nome)] || 0);

    const qq = norm(q);
    const match = (r) => !qq || norm(r.item ? r.item.name : r.entry.nome).includes(qq) || (r.entry && norm(r.entry.nome).includes(qq));
    const inGroup = (r) => group === "todos" || (group === "sem" ? !r.entry : r.entry && r.entry.grupo === group);
    const sorted = rows.filter((r) => match(r) && inGroup(r)).sort((a, b) => (usesOf(b) > 0) - (usesOf(a) > 0) || (!!b.item) - (!!a.item) || String(a.item ? a.item.name : a.entry.nome).localeCompare(String(b.item ? b.item.name : b.entry.nome), "pt-BR"));
    const used = sorted.filter((r) => usesOf(r) > 0 || r.item);
    const rest = sorted.filter((r) => !(usesOf(r) > 0 || r.item));
    const unlinkedLib = rows.filter((r) => r.item && !r.entry).length;
    const canCreate = qq && !rows.some((r) => norm(r.item ? r.item.name : r.entry.nome) === qq);
    const create = () => { if (!canCreate) return; haptic("confirm"); const sug = suggestCatalogMatch(q.trim(), exerciseCatalog); onAddLib(q.trim(), "", sug ? sug.grupo : "", sug ? sug.id : undefined); setQ(""); };
    // vínculo sugerido pra um nome da ficha: o da biblioteca (mesmo nome) ou o mais parecido do catálogo
    const linkFor = (nm) => { const it = library.find((x) => norm(x.name) === norm(nm) && x.catalogId && exerciseCatalog[x.catalogId]); if (it) return exerciseCatalog[it.catalogId]; return suggestCatalogMatch(nm, exerciseCatalog); };
    const fixable = unlinkedInFichas.map((nm) => ({ nm, e: linkFor(nm) })).filter((x) => x.e);

    const row = (r) => <Row key={r.key} row={r} uses={usesOf(r)} open={open === r.key} onToggle={() => setOpen(open === r.key ? null : r.key)} onUpdateLib={onUpdateLib} onAddLib={onAddLib} onRemoveLib={(id) => { setOpen(null); onRemoveLib(id); }} />;

    return (
        <>
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder={"Buscar entre " + CAT.length + " exercícios ou criar"} aria-label="Buscar ou criar exercício"
                style={{ marginTop: 16, width: "100%", boxSizing: "border-box", height: 48, padding: "0 14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, boxShadow: `inset 0 0 0 1.5px ${C.text2}`, color: C.text, fontFamily: F.body, fontSize: 15 }} />
            <div style={{ margin: "12px -20px 0", padding: "0 20px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                <button type="button" aria-pressed={group === "todos"} onClick={() => setGroup("todos")} style={chip(group === "todos")}>Todos</button>
                {unlinkedLib > 0 && <button type="button" aria-pressed={group === "sem"} onClick={() => setGroup("sem")} style={{ ...chip(group === "sem"), ...(group === "sem" ? {} : { color: C.accent, boxShadow: `inset 0 0 0 1px ${C.accentLine}` }) }}>{"Sem vínculo · " + unlinkedLib}</button>}
                {GROUPS.map((g) => <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)} style={chip(group === g)}>{g}</button>)}
            </div>

            {unlinkedInFichas.length > 0 && group === "todos" && !qq && (
                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ ...kicker, color: C.accent }}>{plural(unlinkedInFichas.length, "EXERCÍCIO DAS FICHAS NÃO CONTA", "EXERCÍCIOS DAS FICHAS NÃO CONTAM") + " NO VOLUME"}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {unlinkedInFichas.slice(0, 8).map((nm) => { const e = linkFor(nm); return (
                            <span key={nm} style={{ fontSize: 13, lineHeight: 1.45, color: C.text2 }}>{nm}<span style={{ color: C.text4 }}>{e ? " → " + e.nome + " (" + e.grupo + ")" : " → sem sugestão"}</span></span>
                        ); })}
                        {unlinkedInFichas.length > 8 && <span style={{ fontSize: 13, color: C.text4 }}>{"e mais " + (unlinkedInFichas.length - 8)}</span>}
                    </div>
                    {onLinkFichas && fixable.length > 0 && <button type="button" onClick={() => { haptic("confirm"); const pairs = {}; fixable.forEach((x) => { pairs[norm(x.nm)] = x.e.id; }); onLinkFichas(pairs, fixable.length); }}
                        style={{ alignSelf: "flex-start", minHeight: 44, padding: "0 16px", borderRadius: 10, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{fixable.length === unlinkedInFichas.length ? "Ligar todos pela sugestão" : "Ligar " + fixable.length + " pela sugestão"}</button>}
                    {fixable.length < unlinkedInFichas.length && <span style={{ fontSize: 13, color: C.text3 }}>Os sem sugestão: crie aqui com o mesmo nome e ligue ao catálogo, ou abra no Editar ficha.</span>}
                </div>
            )}

            <span style={{ ...kicker, marginTop: 16 }}>{qq || group !== "todos" ? plural(sorted.length, "EXERCÍCIO", "EXERCÍCIOS") : "EM USO E SEUS · " + used.length}</span>
            <div style={{ marginTop: 2, display: "flex", flexDirection: "column" }}>
                {(qq || group !== "todos" ? sorted : used).map(row)}
                {!qq && group === "todos" && used.length === 0 && <span style={{ padding: "12px 0", fontSize: 13, color: C.text3 }}>Nenhum exercício nas fichas ainda.</span>}
            </div>
            {!qq && group === "todos" && rest.length > 0 && (
                <>
                    <button type="button" onClick={() => setShowAll(!showAll)} style={{ ...ghost, marginTop: 14, minHeight: 48, borderRadius: 10 }}>{showAll ? "Esconder o catálogo" : "Ver o catálogo inteiro · " + rest.length}</button>
                    {showAll && <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>{rest.map(row)}</div>}
                </>
            )}
            {canCreate && <button type="button" onClick={create} style={{ ...ghost, marginTop: 12, minHeight: 48, borderRadius: 10 }}>{"+ Criar “" + q.trim() + "”" + (suggestCatalogMatch(q.trim(), exerciseCatalog) ? " (conta como " + suggestCatalogMatch(q.trim(), exerciseCatalog).nome + ")" : "")}</button>}
        </>
    );
}

export { BibliotecaExercicios };
