import React, { useState, useEffect } from "react";
import { C, F } from "../../styles/tokens";
import { beep } from "../../utils/audio";
import { mmss } from "../../utils/date";

/* ----------------------- cronômetro descanso --------------------- */
function RestTimer({ seconds, autoStart, overrideSeconds, timerKey }) {
    const base = seconds && seconds > 0 ? seconds : 60;
    const rtKey = timerKey ? `cancio:rt:${timerKey}` : null;
    // se esse mesmo exercício já tinha um descanso rodando (o card foi recolhido e reaberto,
    // por exemplo), recupera de onde parou — desde que o tempo ainda não tenha esgotado
    const readPersisted = () => {
        if (!rtKey)
            return null;
        try {
            const raw = sessionStorage.getItem(rtKey);
            if (!raw)
                return null;
            const p = JSON.parse(raw);
            if (p && p.endTime > Date.now())
                return p;
        }
        catch (e) { }
        return null;
    };
    const initial = readPersisted();
    const [total, setTotal] = useState(initial ? initial.total : base);
    const [endTime, setEndTime] = useState(initial ? initial.endTime : null); // null = parado/pausado; com valor = rodando de verdade
    const [remaining, setRemaining] = useState(initial ? Math.max(0, Math.round((initial.endTime - Date.now()) / 1000)) : base);
    const [running, setRunning] = useState(!!initial);
    const [done, setDone] = useState(false);
    const persist = (t, et) => { if (rtKey) {
        try {
            sessionStorage.setItem(rtKey, JSON.stringify({ total: t, endTime: et }));
        }
        catch (e) { }
    } };
    const clearPersisted = () => { if (rtKey) {
        try {
            sessionStorage.removeItem(rtKey);
        }
        catch (e) { }
    } };
    useEffect(() => { if (!running) {
        setTotal(base);
        setRemaining(base);
        setDone(false);
    } }, [base]);
    // relógio de verdade: a cada tick recalcula o restante a partir de endTime (um timestamp fixo),
    // em vez de simplesmente decrementar 1 a cada segundo — isso não derrapa nem trava quando o
    // navegador suspende o timer em segundo plano (comportamento comum em iOS/Android)
    useEffect(() => {
        if (!running || !endTime)
            return;
        const tick = () => {
            const left = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            setRemaining(left);
            if (left <= 0) {
                setRunning(false);
                setEndTime(null);
                setDone(true);
                clearPersisted();
                beep();
            }
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [running, endTime]);
    const startWith = (t) => { const et = Date.now() + t * 1000; setTotal(t); setEndTime(et); setRemaining(t); setRunning(true); setDone(false); persist(t, et); };
    const start = () => startWith(remaining > 0 ? remaining : total);
    const pause = () => { setRunning(false); setEndTime(null); clearPersisted(); }; // remaining fica como está; retomar recalcula um endTime novo a partir daqui
    const firstAuto = React.useRef(true);
    useEffect(() => {
        if (firstAuto.current) {
            firstAuto.current = false;
            return;
        }
        if (autoStart) {
            // descanso de aquecimento é sempre curto (60s cravados), ignorando o descanso longo configurado pro exercício
            const t = overrideSeconds && overrideSeconds > 0 ? overrideSeconds : total;
            startWith(t);
        }
    }, [autoStart]);
    const setPreset = (s) => { setTotal(s); setRemaining(s); setRunning(false); setEndTime(null); setDone(false); clearPersisted(); };
    const add = (s) => {
        setTotal((t) => t + s);
        if (running && endTime) {
            const net = endTime + s * 1000;
            setEndTime(net);
            setRemaining(Math.max(0, Math.round((net - Date.now()) / 1000)));
            persist(total + s, net);
        }
        else
            setRemaining((r) => Math.max(0, r) + s);
        setDone(false);
    };
    const reset = () => { setRunning(false); setEndTime(null); setRemaining(total); setDone(false); clearPersisted(); };
    // a barra fixa de descanso (FloatingTimer) manda +15 / pular por evento — sem isso o cartão e a barra divergiam
    useEffect(() => {
        if (!rtKey) return;
        const onEv = (e) => { const d = e.detail || {}; if (d.key !== rtKey) return; if (d.action === "add") add(15); else reset(); };
        window.addEventListener("cancio:rt", onEv);
        return () => window.removeEventListener("cancio:rt", onEv);
    });
    const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
    const accent = done ? C.warn : running ? C.amber : C.silver;
    const ringR = 14, ringC = 2 * Math.PI * ringR;
    return (React.createElement("div", { style: { background: "rgba(255,255,255,0.03)", border: `1px solid ${done ? C.warn : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 9, marginBottom: 10, transition: "border-color .3s" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("div", { style: { position: "relative", width: 34, height: 34, flexShrink: 0 } },
                React.createElement("svg", { width: 34, height: 34, viewBox: "0 0 34 34" },
                    React.createElement("circle", { cx: 17, cy: 17, r: ringR, fill: "none", stroke: "rgba(255,255,255,0.08)", strokeWidth: 3 }),
                    React.createElement("circle", { cx: 17, cy: 17, r: ringR, fill: "none", stroke: accent, strokeWidth: 3, strokeLinecap: "round", strokeDasharray: ringC, strokeDashoffset: ringC * (1 - pct), transform: "rotate(-90 17 17)", style: { transition: "stroke-dashoffset .3s linear" } }))),
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: accent, letterSpacing: "-0.01em", lineHeight: 1.1 } }, mmss(Math.max(0, remaining))),
                React.createElement("div", { style: { fontFamily: F.mono, fontSize: 8, color: C.muted, marginTop: 1, letterSpacing: "0.08em" } }, done ? "DESCANSO CONCLUÍDO" : "DESCANSO")),
            React.createElement("button", { onClick: running ? pause : start, style: { fontFamily: F.mono, fontSize: 11, color: C.ink, background: accent, border: "none", borderRadius: 10, padding: "7px 11px", cursor: "pointer", minWidth: 64 } }, running ? "Pausar" : done ? "Repetir" : "Iniciar"),
            React.createElement("button", { onClick: reset, title: "Reiniciar", style: { fontFamily: F.mono, fontSize: 13, color: C.muted, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 8px", cursor: "pointer" } }, "\u21BA")),
        React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" } },
            React.createElement("button", { onClick: () => setPreset(15), title: "Micro-pausa (rest-pause/cluster)", style: { fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: total === 15 ? C.ink : C.warn, background: total === 15 ? C.warn : C.amberDim, border: `1px solid ${C.warn}`, borderRadius: 999, padding: "3px 8px", cursor: "pointer" } }, "15s"),
            [45, 60, 90, 120].map((s) => React.createElement("button", { key: s, onClick: () => setPreset(s), style: { fontFamily: F.mono, fontSize: 10, color: total === s ? C.ink : C.muted, background: total === s ? C.silver : "transparent", border: `1px solid ${total === s ? C.silver : C.line}`, borderRadius: 999, padding: "3px 8px", cursor: "pointer" } },
                s,
                "s")),
            React.createElement("button", { onClick: () => add(15), style: { fontFamily: F.mono, fontSize: 10, color: C.muted, background: C.panel2, borderRadius: 999, padding: "3px 8px", cursor: "pointer" } }, "+15s"))));
}
// mini-player fixo: varre o sessionStorage a cada segundo procurando qualquer descanso em
// andamento (chave "cancio:rt:*") — assim o aluno continua vendo a contagem mesmo depois
// de recolher ou sair do ExerciseCard onde o descanso foi disparado
function useActiveRest() {
    const [active, setActive] = useState(null);
    useEffect(() => {
        const scan = () => {
            let found = null;
            try {
                for (let i = 0; i < sessionStorage.length; i++) {
                    const k = sessionStorage.key(i);
                    if (!k || k.indexOf("cancio:rt:") !== 0) continue;
                    const raw = sessionStorage.getItem(k);
                    if (!raw) continue;
                    const p = JSON.parse(raw);
                    if (p && p.endTime > Date.now() && (!found || p.endTime < found.endTime)) found = { key: k, endTime: p.endTime, total: p.total };
                }
            }
            catch (e) { }
            setActive(found);
        };
        scan();
        const id = setInterval(scan, 500);
        return () => clearInterval(id);
    }, []);
    return active;
}
export { RestTimer, useActiveRest };
