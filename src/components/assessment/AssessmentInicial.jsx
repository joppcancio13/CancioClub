import React, { useState, useEffect, useMemo } from "react";
import { C, F, PILL_ON, BALL_URL, ASSESSMENT_TEMPO_TREINO_OPTIONS, ASSESSMENT_OBJETIVO_OPTIONS, ASSESSMENT_DIAS_OPTIONS, ASSESSMENT_TEMPO_SESSAO_OPTIONS, ASSESSMENT_ESTRESSE_OPTIONS } from "../../styles/tokens";

/* 10e — anamnese: índice de seções (flexível, salva rascunho) + uma pergunta por tela dentro da
   seção (avança ao tocar) + carteirinha de membro que vai se montando e sai pronta no fim. */

const DRAFT_KEY = "cancio:anamnese-draft";
const opt = (arr) => arr.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
const YN = [{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }];

const SECTIONS = [
    { key: "voce", title: "Você", sub: "foto, nascimento, medidas, contato", steps: [
        { type: "photo", key: "foto", q: "Primeiro, uma foto sua", help: "Ela aparece na sua carteirinha e pro professor na lista de alunos." },
        { type: "fields", q: "Seus dados", fields: [
            { key: "nome", label: "Nome completo", req: true },
            { key: "nascimento", label: "Nascimento", ph: "dd/mm/aaaa", mode: "numeric", mask: "date", req: true, half: true },
            { key: "whatsapp", label: "WhatsApp", ph: "(11) 9 0000-0000", mode: "tel", half: true },
            { key: "peso", label: "Peso (kg)", mode: "decimal", req: true, half: true },
            { key: "altura", label: "Altura (cm)", mode: "numeric", req: true, half: true },
            { key: "emergencia", label: "Contato de emergência", ph: "nome e telefone" },
        ] },
        { type: "choice", key: "sexo", q: "Sexo", options: opt(["Feminino", "Masculino", "Prefiro não dizer"]) },
    ] },
    { key: "saude", title: "Saúde", sub: "coração, pressão, cirurgias, dores", steps: [
        { type: "yn", key: "coracao", q: "Algum médico já disse que você tem problema no coração?", alert: "Problema cardíaco" },
        { type: "yn", key: "dorPeito", q: "Sente dor no peito quando faz esforço?", alert: "Dor no peito com esforço" },
        { type: "yn", key: "desmaio", q: "Já desmaiou ou teve tontura forte?", alert: "Desmaio/tontura" },
        { type: "yn", key: "pressao", q: "Tem pressão alta?", alert: "Pressão alta" },
        { type: "yn", key: "diabetes", q: "Tem diabetes?", alert: "Diabetes" },
        { type: "yn", key: "cirurgia", q: "Fez alguma cirurgia nos últimos 12 meses?", alert: "Cirurgia recente" },
        { type: "yn", key: "gestacao", q: "Está grávida ou no pós-parto?", alert: "Gestação/pós-parto", showIf: (f) => f.sexo !== "Masculino" },
        { type: "text", key: "lesoes", q: "Tem lesão, dor ou restrição?", ph: "Onde, há quanto tempo, o que piora. Se não tiver, escreva \u201cNenhuma\u201d." },
        { type: "text", key: "medicamentos", q: "Usa algum medicamento contínuo?", ph: "Se não usar, escreva \u201cNenhum\u201d." },
    ] },
    { key: "historico", title: "Histórico", sub: "tempo de treino, modalidades, restrições", steps: [
        { type: "choice", key: "tempoTreino", q: "Há quanto tempo treina sem parar?", options: opt(ASSESSMENT_TEMPO_TREINO_OPTIONS), req: true },
        { type: "choice", key: "ultimaVez", q: "Quando treinou pela última vez?", options: opt(["Esta semana", "Este mês", "Há alguns meses", "Há mais de um ano", "Nunca"]) },
        { type: "text", key: "modalidades", q: "Pratica outra atividade?", ph: "Corrida, luta, futebol, pilates…" },
        { type: "text", key: "naoPode", q: "Algum exercício que você não pode fazer?", ph: "Opcional" },
        { type: "text", key: "naoGosta", q: "E algum que você não gosta?", ph: "Opcional" },
    ] },
    { key: "rotina", title: "Rotina", sub: "dias, horário, sono, trabalho, água", steps: [
        { type: "choice", key: "diasSemana", q: "Quantos dias por semana pode treinar?", options: ASSESSMENT_DIAS_OPTIONS, req: true, row: true },
        { type: "choice", key: "tempoSessao", q: "Quanto tempo por treino?", options: ASSESSMENT_TEMPO_SESSAO_OPTIONS, req: true },
        { type: "choice", key: "horario", q: "Que horário costuma treinar?", options: opt(["Manhã", "Tarde", "Noite", "Varia"]) },
        { type: "choice", key: "sono", q: "Quantas horas dorme por noite?", options: opt(["Menos de 5", "5 a 6", "7 a 8", "Mais de 8"]) },
        { type: "choice", key: "estresseSono", q: "Como estão seu estresse e seu sono?", options: ASSESSMENT_ESTRESSE_OPTIONS, req: true },
        { type: "choice", key: "trabalho", q: "Seu trabalho é mais…", options: opt(["Sentado", "Em pé", "Braçal", "Misto"]) },
        { type: "choice", key: "agua", q: "Quanta água bebe por dia?", options: opt(["Menos de 1 L", "1 a 2 L", "2 a 3 L", "Mais de 3 L"]) },
        { type: "text", key: "alimentacao", q: "Como é sua alimentação?", ph: "Em poucas palavras. Opcional." },
    ] },
    { key: "objetivos", title: "Objetivos", sub: "meta do ciclo, ênfase, prazo", steps: [
        { type: "choice", key: "objetivo", q: "Qual o objetivo principal deste ciclo?", options: opt(ASSESSMENT_OBJETIVO_OPTIONS), req: true },
        { type: "choice", key: "prazo", q: "Em quanto tempo quer ver resultado?", options: opt(["1 a 3 meses", "3 a 6 meses", "6 meses a 1 ano", "Sem pressa"]) },
        { type: "text", key: "gruposEnfase", q: "Algum grupo muscular pra dar ênfase?", ph: "Ex.: posterior de coxa, ombro…" },
        { type: "text", key: "sucesso", q: "O que faria você sentir que deu certo?", ph: "Opcional" },
    ] },
    { key: "enviar", title: "Revisar e enviar", sub: "termo de responsabilidade", steps: [{ type: "review" }] },
];

const EMPTY = { nome: "", nascimento: "", whatsapp: "", peso: "", altura: "", emergencia: "", sexo: "", foto: "", lesoes: "", medicamentos: "", tempoTreino: "", diasSemana: "", tempoSessao: "", estresseSono: "", objetivo: "", gruposEnfase: "", termo: false };
const ageFrom = (br) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || ""); if (!m) return ""; const b = new Date(+m[3], +m[2] - 1, +m[1]); const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a > 0 && a < 110 ? String(a) : ""; };
const maskDate = (v) => { const d = v.replace(/\D/g, "").slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/"); };
const stepsOf = (s, f) => s.steps.filter((st) => !st.showIf || st.showIf(f));
const isAnswered = (st, f) => { if (st.type === "photo" || st.type === "review") return st.type === "photo" ? !!f.foto : !!f.termo; if (st.type === "fields") return st.fields.filter((x) => x.req).every((x) => String(f[x.key] || "").trim()); return !!String(f[st.key] || "").trim(); };
const sectionDone = (s, f) => stepsOf(s, f).every((st) => isAnswered(st, f) || (!st.req && st.type !== "fields" && st.type !== "review" && st.type !== "yn"));

// reduz a foto a 320px JPEG (~25 KB) — cabe no registro do aluno e sincroniza sem bucket extra
function readPhoto(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const S = 320, c = document.createElement("canvas"); c.width = S; c.height = S; const x = c.getContext("2d"); const k = Math.min(img.width, img.height); x.imageSmoothingQuality = "high"; x.drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, S, S); res(c.toDataURL("image/jpeg", 0.82)); }; img.src = r.result; }; r.readAsDataURL(file); });
}

const T = {
    label: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: C.muted },
    q: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 28, lineHeight: 1.05, color: C.text, textTransform: "uppercase", margin: 0, textWrap: "balance" },
    input: (focus) => ({ width: "100%", boxSizing: "border-box", padding: "14px", borderRadius: 10, border: "none", outline: "none", background: C.panel, boxShadow: `inset 0 0 0 ${focus ? "1.5px " + C.silver : "1px #2A2E37"}`, color: C.text, fontFamily: F.body, fontSize: 15 }),
    primary: (dis) => ({ height: 54, width: "100%", borderRadius: 16, border: "none", background: dis ? "#2A2E37" : C.text, color: dis ? C.muted : C.ink, fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: dis ? "default" : "pointer" }),
    ghost: { minHeight: 44, padding: "0 16px", borderRadius: 999, border: "none", background: "transparent", boxShadow: `inset 0 0 0 1px ${C.line2}`, color: C.silver, fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" },
};

function Photo({ src, size }) {
    return React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", ...(src ? {} : { background: "repeating-linear-gradient(135deg,#15181F 0 6px,#0E1015 6px 12px)", boxShadow: `inset 0 0 0 1.5px ${C.line2}` }) } },
        src ? React.createElement("img", { src, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : React.createElement("span", { style: { fontFamily: F.body, fontWeight: 700, fontSize: Math.max(9, size / 8), letterSpacing: "0.1em", color: C.muted } }, "FOTO"));
}

function MemberCard({ f, mini }) {
    const age = ageFrom(f.nascimento);
    const line1 = [age && `${age} anos`, f.peso && `${f.peso} kg`, f.altura && `${(Number(f.altura) / 100).toFixed(2).replace(".", ",")} m`].filter(Boolean).join(" · ");
    return React.createElement("div", { style: { position: "relative", overflow: "hidden", borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line2}`, padding: mini ? 12 : 16, display: "flex", gap: 14, alignItems: "center" } },
        React.createElement("img", { src: BALL_URL, alt: "", "aria-hidden": "true", style: { position: "absolute", right: -30, top: -30, width: 130, height: 130, opacity: 0.35, pointerEvents: "none" } }),
        React.createElement(Photo, { src: f.foto, size: mini ? 56 : 72 }),
        React.createElement("div", { style: { position: "relative", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 } },
            React.createElement("span", { style: { ...T.label, color: C.silver } }, "MEMBRO CANCIO CLUB"),
            React.createElement("span", { style: { fontFamily: F.body, fontWeight: 800, fontSize: mini ? 16 : 18, color: f.nome ? C.text : "#3A404C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, f.nome || "Seu nome"),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: line1 ? C.muted : "#3A404C" } }, line1 || "idade · peso · altura"),
            React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: f.objetivo ? C.muted : "#3A404C" } }, f.objetivo || "objetivo · a preencher")));
}

async function downloadCardPNG(f) {
    const W = 1080, H = 680, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#1A1D24"); g.addColorStop(0.6, "#0B0C10"); x.fillStyle = g;
    x.beginPath(); x.roundRect(0, 0, W, H, 56); x.fill(); x.save(); x.clip();
    const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
    const ball = await load(BALL_URL); if (ball) { x.globalAlpha = 0.35; x.drawImage(ball, W - 330, -110, 440, 440); x.globalAlpha = 1; }
    const ph = f.foto ? await load(f.foto) : null; x.save(); x.beginPath(); x.arc(200, H / 2, 120, 0, Math.PI * 2); x.clip(); if (ph) x.drawImage(ph, 80, H / 2 - 120, 240, 240); else { x.fillStyle = "#15181F"; x.fillRect(80, H / 2 - 120, 240, 240); } x.restore();
    x.fillStyle = C.silver; x.font = "700 28px Archivo, sans-serif"; x.letterSpacing = "5px"; x.fillText("MEMBRO CANCIO CLUB", 380, 250); x.letterSpacing = "0px";
    x.fillStyle = C.text; x.font = "800 60px Archivo, sans-serif"; x.fillText(f.nome || "", 380, 330);
    x.fillStyle = C.muted; x.font = "400 34px Archivo, sans-serif";
    const age = ageFrom(f.nascimento); x.fillText([age && `${age} anos`, f.peso && `${f.peso} kg`, f.altura && `${(Number(f.altura) / 100).toFixed(2).replace(".", ",")} m`].filter(Boolean).join(" · "), 380, 390);
    x.fillText([f.objetivo, "desde " + new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "")].filter(Boolean).join(" · "), 380, 440);
    x.restore(); x.strokeStyle = C.line2; x.lineWidth = 3; x.beginPath(); x.roundRect(1.5, 1.5, W - 3, H - 3, 55); x.stroke();
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "carteirinha-cancio-club.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch (e) { } }
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function AssessmentInicial({ onSubmit, onEnter, defaultName }) {
    const [f, setF] = useState(() => { try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); if (d) return { ...EMPTY, ...d }; } catch (e) { } return { ...EMPTY, nome: defaultName || "" }; });
    const [sec, setSec] = useState(null); // null = índice
    const [stepIdx, setStepIdx] = useState(0);
    const [focus, setFocus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");
    const [done, setDone] = useState(false);
    useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(f)); } catch (e) { } }, [f]);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const section = sec != null ? SECTIONS[sec] : null;
    const steps = section ? stepsOf(section, f) : [];
    const step = steps[stepIdx];
    const completed = SECTIONS.filter((s) => sectionDone(s, f)).length;
    const firstOpen = SECTIONS.findIndex((s) => !sectionDone(s, f));
    const open = (i) => { setSec(i); setStepIdx(0); setErr(""); };
    const next = () => { if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1); else { setSec(null); } };
    const back = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); else setSec(null); };
    const pick = (k, v, autoAdvance) => { set(k, v); if (autoAdvance) setTimeout(next, 180); };

    async function submit() {
        const missing = SECTIONS.slice(0, 5).find((s) => !sectionDone(s, f));
        if (missing) { setErr(`Falta completar: ${missing.title}.`); return; }
        setSubmitting(true); setErr("");
        try {
            const alerts = SECTIONS[1].steps.filter((st) => st.type === "yn" && f[st.key] === "sim").map((st) => st.alert + (f[st.key + "Detalhe"] ? `: ${f[st.key + "Detalhe"]}` : ""));
            const data = { ...f, idade: ageFrom(f.nascimento), saudeAlertas: alerts };
            if (onSubmit) await onSubmit(data);
            try { localStorage.removeItem(DRAFT_KEY); } catch (e) { }
            setDone(true);
        } catch (e) { setErr((e && e.message) || "Não foi possível enviar. Tente novamente."); }
        finally { setSubmitting(false); }
    }

    const shell = (children, footer) => React.createElement("div", { style: { minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.ink } },
        React.createElement("div", { style: { flex: 1, padding: "calc(env(safe-area-inset-top) + 28px) 20px 24px", display: "flex", flexDirection: "column", gap: 18 } }, children),
        footer && React.createElement("div", { style: { position: "sticky", bottom: 0, padding: "24px 20px calc(env(safe-area-inset-bottom) + 20px)", background: `linear-gradient(180deg, rgba(5,6,10,0), ${C.ink} 40%)`, display: "flex", flexDirection: "column", gap: 6 } }, footer));
    const bars = (n, of) => React.createElement("div", { style: { display: "flex", gap: 3 } }, Array.from({ length: of }).map((_, i) => React.createElement("span", { key: i, style: { flex: 1, height: 4, borderRadius: 1, background: i < n ? PILL_ON : C.line, transition: "background .3s ease" } })));

    if (done) {
        return shell([
            React.createElement("div", { key: "glow", "aria-hidden": "true", style: { position: "fixed", inset: 0, background: "none", pointerEvents: "none" } }),
            React.createElement("div", { key: "t", style: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", marginTop: 40 } },
                React.createElement("span", { style: { ...T.label, color: C.silver } }, "ANAMNESE ENVIADA"),
                React.createElement("h1", { style: { ...T.q, fontSize: 30, textAlign: "center" } }, "Bem-vindo(a) ao Club")),
            React.createElement("div", { key: "c", className: "cc-view", style: { position: "relative", transform: "rotate(-3deg)", margin: "8px 4px" } }, React.createElement(MemberCard, { f })),
            React.createElement("p", { key: "p", style: { position: "relative", fontFamily: F.body, fontSize: 13, color: "#AEB7C6", lineHeight: 1.5, textAlign: "center", margin: 0 } }, "Seu professor recebeu tudo e vai montar seu primeiro treino."),
        ], [
            React.createElement("button", { key: "e", className: "cc-tap", onClick: onEnter, style: T.primary(false) }, "Entrar no Club"),
            React.createElement("button", { key: "d", className: "cc-tap", onClick: () => downloadCardPNG(f), style: { minHeight: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Baixar carteirinha (PNG)"),
        ]);
    }

    if (!section) {
        return shell([
            React.createElement("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, color: C.text } }, "ANAMNESE"),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, `${completed} de 6`)),
            React.createElement(MemberCard, { key: "c", f }),
            React.createElement("div", { key: "l", style: { display: "flex", flexDirection: "column" } }, SECTIONS.map((s, i) => {
                const ok = sectionDone(s, f) && i < 5; const now = i === firstOpen;
                return React.createElement("button", { key: s.key, className: "cc-tap", onClick: () => open(i), style: { display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 12, alignItems: "center", padding: "13px 0", minHeight: 56, border: "none", borderBottom: "1px solid #15181F", background: "transparent", textAlign: "left", cursor: "pointer" } },
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 18, color: ok ? C.text : "#3A404C" } }, String(i + 1).padStart(2, "0")),
                    React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } },
                        React.createElement("span", { style: { fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.text } }, s.title),
                        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, s.sub)),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, ...(now ? { color: C.ink, background: C.text, padding: "6px 10px", borderRadius: 999, fontWeight: 700 } : { color: ok ? C.silver : "#3A404C" }) } }, now ? (completed ? "Continuar" : "Começar") : ok ? "\u2713 editar" : "\u203A"));
            })),
            React.createElement("span", { key: "s", style: { fontFamily: F.body, fontSize: 13, color: "#5A6273" } }, "Pode sair e voltar depois: fica tudo salvo."),
        ]);
    }

    // dentro de uma seção — uma pergunta por tela
    const head = [
        React.createElement("div", { key: "nav", style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: F.body, fontSize: 13, color: C.muted } },
            React.createElement("button", { className: "cc-tap", onClick: back, style: { minHeight: 44, padding: "0 10px 0 0", border: "none", background: "transparent", color: C.silver, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, stepIdx ? "\u2039 Voltar" : "\u2039 Seções"),
            React.createElement("span", null, `${String(sec + 1).padStart(2, "0")} \u00b7 ${section.title}`),
            React.createElement("span", null, step.type === "review" ? "" : `${stepIdx + 1} de ${steps.length}`)),
        step.type !== "review" && React.createElement("div", { key: "bars" }, bars(stepIdx + (isAnswered(step, f) ? 1 : 0), steps.length)),
    ];
    let body = null, footer = null;
    if (step.type === "photo") {
        body = [React.createElement("h2", { key: "q", style: T.q }, step.q), React.createElement("p", { key: "h", style: { fontFamily: F.body, fontSize: 15, color: "#AEB7C6", lineHeight: 1.5, margin: "-6px 0 0" } }, step.help),
            React.createElement("div", { key: "p", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 16 } }, React.createElement(Photo, { src: f.foto, size: 168 }),
                React.createElement("div", { style: { display: "flex", gap: 8 } },
                    React.createElement("label", { className: "cc-tap", style: { ...T.ghost, display: "flex", alignItems: "center" } }, "Tirar foto", React.createElement("input", { type: "file", accept: "image/*", capture: "user", style: { display: "none" }, onChange: async (e) => { const fl = e.target.files && e.target.files[0]; if (fl) set("foto", await readPhoto(fl)); } })),
                    React.createElement("label", { className: "cc-tap", style: { ...T.ghost, display: "flex", alignItems: "center" } }, "Da galeria", React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: async (e) => { const fl = e.target.files && e.target.files[0]; if (fl) set("foto", await readPhoto(fl)); } }))))];
        footer = [React.createElement("button", { key: "n", className: "cc-tap", onClick: next, style: T.primary(false) }, f.foto ? "Continuar" : "Pular por agora")];
    } else if (step.type === "fields") {
        body = [React.createElement("h2", { key: "q", style: T.q }, step.q), React.createElement("div", { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, step.fields.map((fd) => React.createElement("label", { key: fd.key, style: { gridColumn: fd.half ? "auto" : "1 / -1", display: "flex", flexDirection: "column", gap: 6 } },
            React.createElement("span", { style: T.label }, fd.label.toUpperCase()),
            React.createElement("input", { value: f[fd.key] || "", placeholder: fd.ph || "", inputMode: fd.mode, onFocus: () => setFocus(fd.key), onBlur: () => setFocus(null), onChange: (e) => set(fd.key, fd.mask === "date" ? maskDate(e.target.value) : e.target.value), style: T.input(focus === fd.key) }))))];
        footer = [React.createElement("button", { key: "n", className: "cc-tap", disabled: !isAnswered(step, f), onClick: next, style: T.primary(!isAnswered(step, f)) }, "Próximo")];
    } else if (step.type === "choice") {
        body = [React.createElement("h2", { key: "q", style: T.q }, step.q), React.createElement("div", { key: "o", style: { display: step.row ? "grid" : "flex", gridTemplateColumns: step.row ? `repeat(${step.options.length}, 1fr)` : undefined, flexDirection: "column", gap: 8 } }, step.options.map((o) => { const on = String(f[step.key]) === String(o.value); return React.createElement("button", { key: o.value, className: "cc-tap", onClick: () => pick(step.key, o.value, true), style: { minHeight: 58, borderRadius: 16, border: "none", display: "flex", alignItems: "center", justifyContent: step.row ? "center" : "space-between", padding: step.row ? 0 : "0 18px", fontFamily: F.body, fontSize: 15, fontWeight: 600, cursor: "pointer", ...(on ? { background: C.text, color: C.ink } : { background: "transparent", color: C.text, boxShadow: "inset 0 0 0 1px #2A2E37" }) } }, o.label, on && !step.row ? React.createElement("span", { style: { fontSize: 13 } }, "\u2713") : null); }))];
        if (!step.req && !f[step.key]) footer = [React.createElement("button", { key: "s", className: "cc-tap", onClick: next, style: { minHeight: 44, border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Pular")];
    } else if (step.type === "yn") {
        const yes = f[step.key] === "sim";
        body = [React.createElement("h2", { key: "q", style: T.q }, step.q), React.createElement("div", { key: "o", style: { display: "flex", gap: 8 } }, YN.map((o) => { const on = f[step.key] === o.value; return React.createElement("button", { key: o.value, className: "cc-tap", onClick: () => pick(step.key, o.value, o.value === "nao"), style: { flex: 1, minHeight: 58, borderRadius: 16, border: "none", fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer", ...(on ? { background: C.text, color: C.ink } : { background: "transparent", color: C.text, boxShadow: "inset 0 0 0 1px #2A2E37" }) } }, o.label); })),
            yes && React.createElement("label", { key: "d", className: "cc-view", style: { display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("span", { style: T.label }, "CONTA UM POUCO MAIS"),
                React.createElement("textarea", { autoFocus: true, rows: 3, value: f[step.key + "Detalhe"] || "", onFocus: () => setFocus("d"), onBlur: () => setFocus(null), onChange: (e) => set(step.key + "Detalhe", e.target.value), style: { ...T.input(focus === "d"), resize: "none", lineHeight: 1.45 } }),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: C.muted } }, "Seu professor recebe um aviso sobre isso."))];
        if (yes) footer = [React.createElement("button", { key: "n", className: "cc-tap", onClick: next, style: T.primary(false) }, "Continuar")];
    } else if (step.type === "text") {
        body = [React.createElement("h2", { key: "q", style: T.q }, step.q), React.createElement("textarea", { key: "t", rows: 4, value: f[step.key] || "", placeholder: step.ph, onFocus: () => setFocus(step.key), onBlur: () => setFocus(null), onChange: (e) => set(step.key, e.target.value), style: { ...T.input(focus === step.key), resize: "none", lineHeight: 1.45 } })];
        footer = [React.createElement("button", { key: "n", className: "cc-tap", onClick: next, style: T.primary(false) }, String(f[step.key] || "").trim() ? "Próximo" : "Pular")];
    } else if (step.type === "review") {
        const rows = [["Nome", f.nome], ["Idade", ageFrom(f.nascimento) && `${ageFrom(f.nascimento)} anos`], ["Peso · altura", f.peso && `${f.peso} kg · ${f.altura} cm`], ["Treina há", f.tempoTreino], ["Dias · tempo", f.diasSemana && `${f.diasSemana}× · ${(ASSESSMENT_TEMPO_SESSAO_OPTIONS.find((o) => o.value === f.tempoSessao) || {}).label || ""}`], ["Objetivo", f.objetivo]];
        const alerts = SECTIONS[1].steps.filter((st) => st.type === "yn" && f[st.key] === "sim").map((st) => st.alert);
        body = [React.createElement("h2", { key: "q", style: T.q }, "Confere e envia"), React.createElement(MemberCard, { key: "c", f, mini: true }),
            React.createElement("div", { key: "r", style: { display: "flex", flexDirection: "column" } }, rows.map(([k, v]) => React.createElement("div", { key: k, style: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #15181F", fontFamily: F.body, fontSize: 15 } }, React.createElement("span", { style: { color: C.muted } }, k), React.createElement("span", { style: { color: v ? C.text : C.warn, textAlign: "right" } }, v || "faltando")))),
            alerts.length > 0 && React.createElement("div", { key: "a", style: { padding: "10px 12px", borderRadius: 10, boxShadow: "inset 0 0 0 1px rgba(232,121,75,.4)", fontFamily: F.body, fontSize: 13, color: "#C9D0DC", lineHeight: 1.45 } }, React.createElement("span", { style: { ...T.label, color: C.warn, marginRight: 8 } }, "SAÚDE"), alerts.join(" · ")),
            React.createElement("label", { key: "t", className: "cc-tap", style: { display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "6px 0" } },
                React.createElement("span", { style: { width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...(f.termo ? { background: C.text, color: C.ink } : { boxShadow: "inset 0 0 0 1.5px #2E333D" }) } }, f.termo ? "\u2713" : ""),
                React.createElement("input", { type: "checkbox", checked: !!f.termo, onChange: (e) => set("termo", e.target.checked), style: { display: "none" } }),
                React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: "#C9D0DC", lineHeight: 1.45 } }, "Declaro que as informações são verdadeiras e que vou avisar o professor sobre qualquer mudança na minha saúde.")),
            err && React.createElement("span", { key: "e", style: { fontFamily: F.body, fontSize: 13, color: C.warn } }, err)];
        footer = [React.createElement("button", { key: "n", className: "cc-tap", disabled: !f.termo || submitting, onClick: submit, style: T.primary(!f.termo || submitting) }, submitting ? "Enviando…" : "Enviar anamnese")];
    }
    return React.createElement("div", { key: `${sec}-${stepIdx}` }, shell([...head.filter(Boolean), ...(body || []).filter(Boolean).map((b, i) => React.cloneElement(b, { key: b.key || i }))], footer));
}
export { AssessmentInicial, SECTIONS };
