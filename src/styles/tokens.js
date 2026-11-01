import React from "react";

/* ================================================================== */
/*  Cancio Club                                                        */
/* ================================================================== */
const C = {
    ink: "#05060A", panel: "#0F1218", panel2: "#171B22", line: "#23262E",
    text: "#F2F5FA", muted: "#7D8698", silver: "#C6D2E4", amber: "#DCE4F0", amberDim: "#2A303B", warn: "#E8794B",
};
const cardShadow = "0 1px 0 rgba(255,255,255,.05) inset, 0 22px 48px rgba(0,0,0,.42), 0 3px 10px rgba(0,0,0,.3)";
// vidro fosco — usado em todos os painéis/cartões principais no lugar do preenchimento sólido C.panel
const glassPanel = {
    borderRadius: 24,
    background: "linear-gradient(168deg, rgba(23,27,34,0.72), rgba(11,13,18,0.74))",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    border: "1px solid rgba(198,210,228,0.10)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
};
const F = {
    display: "'Archivo', system-ui, sans-serif",
    body: "'Archivo', system-ui, sans-serif",
    mono: "'Archivo', system-ui, sans-serif",
};
// física de mola compartilhada — só nos pontos de maior contato (chips, cards), não em tudo,
// senão vira ruído visual em vez de reforçar "isso respondeu ao meu toque"
const EASE = {
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    springSoft: "cubic-bezier(0.22, 1.12, 0.36, 1)",
};
const DAYS = [
    { key: "seg", short: "Seg", full: "Segunda", wd: 1 }, { key: "ter", short: "Ter", full: "Terça", wd: 2 },
    { key: "qua", short: "Qua", full: "Quarta", wd: 3 }, { key: "qui", short: "Qui", full: "Quinta", wd: 4 },
    { key: "sex", short: "Sex", full: "Sexta", wd: 5 }, { key: "sab", short: "Sáb", full: "Sábado", wd: 6 },
    { key: "dom", short: "Dom", full: "Domingo", wd: 0 },
];
const JS2KEY = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };
const MILESTONES = [5, 10, 20, 30, 50, 100];
const KIND_CYCLE = ["warmup", "recon", "working", "rest-pause", "cluster", "back-off"];
const KIND_LABELS = { warmup: "Aquec.", recon: "Reconhec.", working: "Trabalho", "rest-pause": "Rest Pause", cluster: "Cluster", "back-off": "Back-off" };
// séries de aquecimento e de reconhecimento não entram na tonelagem, no teto de progressão nem na
// referência de recorde — são calibração (testar o corpo/a carga do dia), não o trabalho prescrito.
const NON_COUNTING_KINDS = new Set(["warmup", "recon"]);
const TRAIN_PHRASES = [
    "Esquece o celular, foca na próxima série.",
    "Menos ego na carga, mais qualidade na execução.",
    "A mágica acontece quando você controla a descida.",
    "Menos papo no salão, mais técnica no treino.",
    "Volume alto no fone, técnica fina no movimento.",
    "Ajusta a postura e deixa o som ditar o ritmo.",
    "Sem pressa. Sente o músculo trabalhar.",
    "Frequência importa mais que intensidade cega.",
];
const REST_PHRASES = [
    "A pista principal fechou. Hoje é dia de lounge e sofá.",
    "Som desligado. O corpo pede pausa.",
    "Recovery ativado. Água, sono e zero pressa hoje.",
    "Hoje o VIP é ficar de boa. Pula o treino sem culpa.",
    "Músculo cresce no silêncio. Aproveita o off.",
];
const SHARE_PHRASES = [
    "O clube é fechado, mas o resultado é público.",
    "Bons treinos merecem holofotes. Inspire alguém.",
    "A pista é nossa. Mostre quem dita o ritmo.",
    "A constância é a sua assinatura. Partilhe.",
    "O trabalho feito no silêncio faz o barulho mais alto.",
    "Selo Cancio Club de qualidade. Exiba seu progresso.",
    "VIP na pista. Mostre como se faz.",
    "Menos papo, mais carga. Deixe os números falarem.",
    "Registrado, autenticado e homologado pelo Clube.",
    "A elite não se esconde. Solta o seu card.",
];
const GREET_MANHA = ["Bom dia. Pista liberada,", "Bom dia. Primeiro play,", "Bom dia. Som na caixa,", "Bom dia. Set montado,"];
const GREET_TARDE = ["Boa tarde. Ritmo de pico,", "Boa tarde. Salão on,", "Boa tarde. Fone no talo,", "Boa tarde. Ajusta o BPM,"];
const GREET_NOITE = ["Boa noite. Sessão noturna,", "Boa noite. O Club é seu,", "Boa noite. Último drop,", "Boa noite. Fechando a pista,"];
const SESS_KEY = "cancio:sess";
const FEEDBACK_QUESTIONS = [
    "Como foi o treino de hoje?", "E aí, como você se sentiu hoje?", "Curtiu o treino?",
    "Como foi o pique hoje?", "Valeu o esforço? Conta pra gente.", "Missão cumprida! Como foi?",
    "Como está se sentindo depois do treino?", "Deixa aqui como foi o seu treino.",
];
const BALL_URL = "selo-bola-transparente.png?v=13";
// pontinhos de brilho fixos (sem jitter entre renders) ao redor da bola — assinatura "disco club"
const SPARKLE_SPOTS = [
    { x: -6, y: 4, delay: 0, size: 5 },
    { x: 100, y: -8, delay: 0.9, size: 4 },
    { x: 92, y: 46, delay: 1.8, size: 6 },
    { x: 8, y: 50, delay: 2.6, size: 4 },
];
// globo espelhado desenhado em CSS: grade de pastilhas sobre gradiente; mask = quanto já acendeu
const MIRROR_GRID = (px) => `linear-gradient(90deg,#05060A ${px * 0.17}px,transparent ${px * 0.17}px) center/${px}px ${px}px,linear-gradient(180deg,#05060A ${px * 0.17}px,transparent ${px * 0.17}px) center/${px}px ${px}px`;
// Selo Cancio Club é um ativo estático (selo-cancio-club.png, 1080x1080, PNG com fundo próprio
// já incluso — a marca completa com bola + "CANCIO CLUB"), publicado junto com o index.html no
// Netlify. Não é desenhado no Canvas em tempo de execução: é mais leve e o navegador só
// baixa/exibe uma imagem, sem gastar tempo de CPU redesenhando a bola toda vez.
// (nome anterior apontava para "selo-cancio-club-transparente.png", um arquivo que nunca
// chegou a existir no projeto — por isso o selo parava de aparecer/baixar.)
const SELO_URL = "selo-cancio-club.png?v=13";
// versão só-a-bola, fundo transparente, sem o texto "CANCIO CLUB" — usada como selo decorativo
// dentro dos cards de compartilhamento (a marca com texto completo fica só no LogoCard)
const SEAL_MARK_URL = BALL_URL;
// vitrine de recordes — motivo pra voltar e conferir, não só ser surpreendido na hora da comemoração
const DIARY_EFFORT_LABELS = { facil: "Fácil", medida: "Na Medida", destruidor: "Destruidor", descanso: "Descanso" };
const CALENDAR_WEEKDAY_SHORT = ["S", "T", "Q", "Q", "S", "S", "D"];
// ícones minimalistas em linha (1px, sem preenchimento) pros empty states — nada de emoji nem
// ilustração pesada, só um traço fino que combina com o resto da UI mono/silver
const EMPTY_ICON_PATHS = {
    rest: (p) => React.createElement("path", { d: "M20 6a10 10 0 1 0 6 18 8 8 0 0 1-6-18z", ...p }),
    dumbbell: (p) => React.createElement(React.Fragment, null,
        React.createElement("rect", { x: 3, y: 12, width: 5, height: 8, rx: 1.5, ...p }),
        React.createElement("rect", { x: 24, y: 12, width: 5, height: 8, rx: 1.5, ...p }),
        React.createElement("line", { x1: 8, y1: 16, x2: 24, y2: 16, ...p })),
    personPlus: (p) => React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: 12, cy: 10, r: 5, ...p }),
        React.createElement("path", { d: "M3 27c0-6.5 4-11 9-11s9 4.5 9 11", ...p }),
        React.createElement("line", { x1: 25, y1: 8, x2: 25, y2: 16, ...p }),
        React.createElement("line", { x1: 21, y1: 12, x2: 29, y2: 12, ...p })),
    grid: (p) => React.createElement(React.Fragment, null,
        React.createElement("rect", { x: 5, y: 5, width: 9, height: 9, rx: 1.5, ...p }),
        React.createElement("rect", { x: 18, y: 5, width: 9, height: 9, rx: 1.5, ...p }),
        React.createElement("rect", { x: 5, y: 18, width: 9, height: 9, rx: 1.5, ...p }),
        React.createElement("rect", { x: 18, y: 18, width: 9, height: 9, rx: 1.5, ...p })),
    message: (p) => React.createElement("path", { d: "M6 8h20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H14l-6 5v-5H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z", ...p }),
    calendar: (p) => React.createElement(React.Fragment, null,
        React.createElement("rect", { x: 5, y: 7, width: 22, height: 20, rx: 2, ...p }),
        React.createElement("line", { x1: 5, y1: 13, x2: 27, y2: 13, ...p }),
        React.createElement("line", { x1: 10, y1: 4, x2: 10, y2: 9, ...p }),
        React.createElement("line", { x1: 22, y1: 4, x2: 22, y2: 9, ...p })),
};
/* ============================== Assessment Inicial ============================== */
// formulário de anamnese/onboarding do aluno — mesma linguagem visual do resto do app
// (glassPanel, tokens C/F), mas com bordas sutis nos inputs em vez de fundo sólido e
// glow de foco, conforme o padrão "dark luxury" pedido para essa tela específica.
const ASSESSMENT_TEMPO_TREINO_OPTIONS = ["Nunca treinou", "Menos de 6 meses", "6 meses a 1 ano", "Mais de 1 ano", "Retornando agora"];
const ASSESSMENT_OBJETIVO_OPTIONS = ["Hipertrofia", "Redução de percentual de gordura", "Força/Condicionamento"];
const ASSESSMENT_DIAS_OPTIONS = [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }));
const ASSESSMENT_TEMPO_SESSAO_OPTIONS = [{ value: "45min", label: "45 min" }, { value: "60min", label: "60 min" }, { value: "90min", label: "+1 hora" }];
const ASSESSMENT_ESTRESSE_OPTIONS = ["Ruim", "Razoável", "Boa", "Excelente"].map((v) => ({ value: v, label: v }));
const assessmentLabelStyle = { fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted };
const ASSESSMENT_CSS = `
.cc-assess-choice:hover:not(.cc-assess-choice--active) { border-color:#3a3a3a; background:rgba(255,255,255,0.06); }
.cc-assess-choice:active { transform:scale(.94); }
@media (prefers-reduced-motion: reduce) { .cc-assess-choice:active { transform:none; } }
.cc-assess-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 30px rgba(184,180,255,0.32); }
.cc-assess-submit:active:not(:disabled) { transform:translateY(0); }
.cc-assess-input:hover { border-color:#3a3a3a; }
.cc-assess-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(10,10,12,0.35); border-top-color:#0A0A0C; animation: cc-boot-spin .7s linear infinite; flex-shrink:0; }
`;
const ASSESSMENT_TEMPO_SESSAO_LABELS = { "45min": "45 min", "60min": "60 min", "90min": "+1 hora" };
export { C, cardShadow, glassPanel, F, EASE, DAYS, JS2KEY, MILESTONES, KIND_CYCLE, KIND_LABELS, NON_COUNTING_KINDS, TRAIN_PHRASES, REST_PHRASES, SHARE_PHRASES, GREET_MANHA, GREET_TARDE, GREET_NOITE, SESS_KEY, FEEDBACK_QUESTIONS, BALL_URL, SPARKLE_SPOTS, MIRROR_GRID, SELO_URL, SEAL_MARK_URL, DIARY_EFFORT_LABELS, CALENDAR_WEEKDAY_SHORT, EMPTY_ICON_PATHS, ASSESSMENT_TEMPO_TREINO_OPTIONS, ASSESSMENT_OBJETIVO_OPTIONS, ASSESSMENT_DIAS_OPTIONS, ASSESSMENT_TEMPO_SESSAO_OPTIONS, ASSESSMENT_ESTRESSE_OPTIONS, assessmentLabelStyle, ASSESSMENT_CSS, ASSESSMENT_TEMPO_SESSAO_LABELS };
