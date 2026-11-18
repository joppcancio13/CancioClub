import React, { useMemo, useState } from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { exerciseCatalog, catalogByGroup } from "../../data/exerciseCatalog";
import { suggestCatalogMatch } from "../../utils/catalogMatch";
import { CatalogPicker } from "../shared/CatalogPicker";
import { MediaEmbed } from "../shared/MediaEmbed";
import { Icon } from "../shared/Icon";
import { haptic } from "../../utils/misc";

// Biblioteca · Exercícios (18/nov): uma lista só com o catálogo do volume (por grupo muscular) e os
// exercícios que o professor criou. O que está nas fichas e ainda não conta no volume aparece em
// "Sem vínculo" — ligar ao catálogo vale pra todas as fichas que usam aquele nome.

const norm = (s) => String(s || "").trim().toLowerCase();
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
const divider = { background: `linear-gradient(to right,${C.line},${C.line} calc(100% - 48px),transparent) no-repeat bottom/100% 1px` };
const ghost = { border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text2, fontFamily: F.body, fontSize: 13, cursor: "pointer" };
const chip = (on) => ({ flex: "none", minHeight: 40, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, ...(on ? { background: C.text, color: C.bg, fontWeight: 700 } : { background: "transparent", color: C.text2, boxShadow: `inset 0 0 0 1px ${C.outline}` }) });
const MUSCLE = (k) => String(k).replace(/_/g, " ");
const SEM = "Sem vínculo";

function Row({ row, uses, unlinked, onLink, onUpdateLib, onAddLib, onRemoveLib }) {
    const [open, setOpen] = useState(false);
    const [video, setVideo] = useState(row.lib ? row.lib.url || "" : "");
    const [showVideo, setShowVideo] = useState(false);
    const entry = row.catalogId ? exerciseCatalog[row.catalogId] : null;
    const top = entry ? Object.entries(entry.ativacao || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => MUSCLE(k)) : [];
    const warn = !entry || unlinked > 0;
    const sub = [entry ? entry.grupo : "não conta no volume", unlinked > 0 && entry ? plural(unlinked, "ficha", "fichas") + " sem contar no volume" : uses ? "em " + plural(uses, "ficha", "fichas") : "sem uso", row.lib && row.lib.url ? "vídeo" : null].filter(Boolean).join(" · ");
    const saveVideo = () => {
        const v = video.trim();
        if (row.lib) { if (v !== (row.lib.url || "")) onUpdateLib(row.lib.id, { url: v }); }
        else if (v) onAddLib(row.name, v, "", row.catalogId);
    };
    return (
        <div style={divider}>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
                style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 10, padding: "12px 0", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: uses ? C.text : C.text3 }}>{row.name}</span>
                    <span style={{ fontFamily: F.body, fontSize: 13, color: warn ? C.accent : C.text3 }}>{sub}</span>
                </span>
                <Icon name="caretRight" size={16} color={C.text4} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s ease" }} />
            </button>
            {open && (
                <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {entry && top.length > 0 && <span style={{ fontSize: 13, color: C.text3 }}>Trabalha mais: {top.join(", ")}</span>}
                    {entry && unlinked > 0 && (
                        <button type="button" onClick={() => { haptic("confirm"); onLink(row.name, row.catalogId, row.lib); }} style={{ minHeight: 48, borderRadius: 12, border: "none", background: C.text, color: C.bg, fontFamily: F.body, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                            Contar no volume {unlinked === 1 ? "na ficha" : "nas " + unlinked + " fichas"}
                        </button>
                    )}
                    {/* nome de ficha/biblioteca: escolher (ou trocar) o exercício do catálogo que conta no volume */}
                    {(row.kind !== "catalog") && (
                        <CatalogPicker label="Conta no volume como" value={row.catalogId || ""} exerciseName={row.name}
                            onChange={(v) => { haptic("confirm"); onLink(row.name, v || undefined, row.lib); }} />
                    )}
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={KICKER}>Vídeo</span>
                        <input value={video} onChange={(e) => setVideo(e.target.value)} onBlur={saveVideo} placeholder="Cole o link do vídeo"
                            style={{ width: "100%", boxSizing: "border-box", minHeight: 48, padding: "0 12px", borderRadius: 12, border: "none", outline: "none", background: C.bg, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 16 }} />
                    </label>
                    {row.lib && row.lib.url && showVideo && <MediaEmbed url={row.lib.url} />}
                    <div style={{ display: "flex", gap: 8 }}>
                        {row.lib && row.lib.url && <button type="button" onClick={() => setShowVideo(!showVideo)} style={{ ...ghost, flex: 1, minHeight: 44, borderRadius: 10 }}>{showVideo ? "Ocultar vídeo" : "Ver vídeo"}</button>}
                        {row.lib && row.kind === "lib" && <button type="button" onClick={() => onRemoveLib(row.lib.id)} style={{ ...ghost, flex: 1, minHeight: 44, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.accent }}>Remover da biblioteca</button>}
                    </div>
                    {uses > 0 && row.kind !== "catalog" && <span style={{ fontSize: 13, color: C.text3 }}>Ligar ao catálogo vale pras {plural(uses, "ficha", "fichas")} que usam “{row.name}”.</span>}
                </div>
            )}
        </div>
    );
}

function LibraryExercises({ library, students, workouts, onAddLib, onUpdateLib, onRemoveLib, onLinkCatalog }) {
    const [q, setQ] = useState("");
    const [group, setGroup] = useState(null);

    // nomes nas fichas: quantos alunos usam e qual vínculo eles têm
    const used = useMemo(() => {
        const byName = {};
        students.forEach((s) => {
            const seen = new Set();
            Object.values((workouts || {})[s.id] || {}).forEach((list) => (list || []).forEach((e) => {
                const n = norm(e.name); if (!n) return;
                const o = (byName[n] = byName[n] || { name: e.name, uses: 0, catalogId: null });
                if (e.catalogId && !o.catalogId) o.catalogId = e.catalogId;
                if (!seen.has(n)) { seen.add(n); o.uses++; }
            }));
        });
        return byName;
    }, [students, workouts]);

    // linhas: catálogo + biblioteca + nomes das fichas, sem repetir
    const rows = useMemo(() => {
        const out = []; const taken = new Set();
        const libByCat = {}; library.forEach((l) => { if (l.catalogId) libByCat[l.catalogId] = l; });
        Object.values(exerciseCatalog).forEach((c) => {
            const lib = libByCat[c.id] || library.find((l) => norm(l.name) === norm(c.nome));
            out.push({ key: "c:" + c.id, kind: "catalog", name: c.nome, catalogId: c.id, group: c.grupo, lib });
            taken.add(norm(c.nome)); if (lib) taken.add(norm(lib.name));
        });
        library.forEach((l) => {
            if (taken.has(norm(l.name))) return;
            const u = used[norm(l.name)]; const cid = l.catalogId || (u && u.catalogId) || null;
            out.push({ key: "l:" + l.id, kind: "lib", name: l.name, catalogId: cid, group: cid && exerciseCatalog[cid] ? exerciseCatalog[cid].grupo : SEM, lib: l });
            taken.add(norm(l.name));
        });
        Object.entries(used).forEach(([n, u]) => {
            if (taken.has(n)) return;
            out.push({ key: "f:" + n, kind: "ficha", name: u.name, catalogId: u.catalogId, group: u.catalogId && exerciseCatalog[u.catalogId] ? exerciseCatalog[u.catalogId].grupo : SEM, lib: null });
        });
        return out;
    }, [library, used]);

    const unlinkedOf = (r) => {
        if (!r.catalogId) return usesOf(r);
        let n = 0; students.forEach((st) => { const has = Object.values((workouts || {})[st.id] || {}).some((list) => (list || []).some((e) => norm(e.name) === norm(r.name) && !e.catalogId)); if (has) n++; }); return n;
    };
    const inSem = (r) => r.group === SEM || unlinkedOf(r) > 0;
    const usesOf = (r) => {
        if (r.kind === "catalog") { let n = 0; students.forEach((s) => { const has = Object.values((workouts || {})[s.id] || {}).some((list) => (list || []).some((e) => e.catalogId === r.catalogId || norm(e.name) === norm(r.name))); if (has) n++; }); return n; }
        return (used[norm(r.name)] || {}).uses || 0;
    };
    const semCount = rows.filter(inSem).length;
    const groups = [...(semCount ? [SEM] : []), ...catalogByGroup.map((g) => g.grupo)];
    const qq = norm(q);
    const visible = rows.filter((r) => (!qq || norm(r.name).includes(qq)) && (qq || !group || (group === SEM ? inSem(r) : r.group === group)))
        .sort((a, b) => (unlinkedOf(b) > 0) - (unlinkedOf(a) > 0) || (usesOf(b) > 0) - (usesOf(a) > 0) || a.name.localeCompare(b.name, "pt-BR"));
    const canCreate = qq && !rows.some((r) => norm(r.name) === qq);
    const create = () => { if (!canCreate) return; haptic("confirm"); const m = suggestCatalogMatch(q.trim(), exerciseCatalog); onAddLib(q.trim(), "", "", m && m.id); setQ(""); };

    return (
        <>
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Buscar ou criar exercício" aria-label="Buscar ou criar exercício"
                style={{ marginTop: 16, width: "100%", boxSizing: "border-box", height: 48, padding: "0 14px", borderRadius: 12, border: "none", outline: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.outline}`, color: C.text, fontFamily: F.body, fontSize: 16 }} />
            {!qq && (
                <div style={{ margin: "12px -20px 0", padding: "0 20px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                    <button type="button" onClick={() => setGroup(null)} style={chip(!group)}>Todos</button>
                    {groups.map((g) => <button key={g} type="button" onClick={() => setGroup(g)} style={{ ...chip(group === g), ...(g === SEM && group !== g ? { color: C.accent, boxShadow: `inset 0 0 0 1px ${C.accentLine}` } : null) }}>{g === SEM ? SEM + " · " + semCount : g}</button>)}
                </div>
            )}
            {semCount > 0 && !qq && !group && (
                <button type="button" onClick={() => setGroup(SEM)} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: "none", background: C.panel, boxShadow: `inset 0 0 0 1px ${C.accentLine}`, color: C.text, textAlign: "left", cursor: "pointer", fontFamily: F.body }}>
                    <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{plural(semCount, "exercício não conta", "exercícios não contam")} no volume</span>
                        <span style={{ fontSize: 13, color: C.text3 }}>Ligue cada um ao catálogo uma vez: vale pra todas as fichas.</span>
                    </span>
                    <Icon name="caretRight" size={16} color={C.text3} />
                </button>
            )}
            <span style={{ ...KICKER, marginTop: 16 }}>{qq ? plural(visible.length, "resultado", "resultados") : (group || "Todos") + " · " + visible.length}</span>
            <div style={{ marginTop: 2, display: "flex", flexDirection: "column" }}>
                {visible.map((r) => <Row key={r.key + (r.catalogId || "")} row={r} uses={usesOf(r)} unlinked={unlinkedOf(r)} onLink={onLinkCatalog} onUpdateLib={onUpdateLib} onAddLib={onAddLib} onRemoveLib={onRemoveLib} />)}
            </div>
            {canCreate && <button type="button" onClick={create} style={{ ...ghost, marginTop: 12, minHeight: 48, borderRadius: 10 }}>{"+ Criar “" + q.trim() + "” na biblioteca"}</button>}
        </>
    );
}

export { LibraryExercises };
