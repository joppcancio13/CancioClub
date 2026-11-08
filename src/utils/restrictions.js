// cruza o que o aluno relatou (anamnese) e o alerta clínico do professor com o nome do exercício.
// Mapa simples por região do corpo → palavras que aparecem no nome dos exercícios que a carregam.
const REGIONS = [
    { k: "ombro", label: "ombro", hit: /ombro|manguito|deltoide|escápula|escapula/i, ex: /supino|desenvolvimento|militar|arnold|crucifixo|eleva[çc][ãa]o (lateral|frontal)|crossover|voador|paralela|mergulho|flex[ãa]o de bra[çc]o|puxada (atr[áa]s|nuca)|face pull|remada alta/i },
    { k: "joelho", label: "joelho", hit: /joelho|patela|menisco|ligamento cruzado|lca|condromal/i, ex: /agachamento|leg ?press|extensora|afundo|avan[çc]o|passada|b[úu]lgaro|hack|salto|pistol|sissy|step/i },
    { k: "lombar", label: "lombar/coluna", hit: /lombar|coluna|h[ée]rnia|disco|ci[áa]tico|lombalgia/i, ex: /terra|stiff|levantamento|remada curvada|good ?morning|bom dia|agachamento livre|hiperextens|supra|abdominal/i },
    { k: "cotovelo", label: "cotovelo", hit: /cotovelo|epicondil|tendinite.*bra[çc]o/i, ex: /rosca|tr[íi]ceps|testa|franc[êe]s|coice|paralela|mergulho|supino fechado/i },
    { k: "punho", label: "punho", hit: /punho|t[úu]nel do carpo|carpo/i, ex: /rosca|supino|flex[ãa]o de bra[çc]o|desenvolvimento|terra/i },
    { k: "quadril", label: "quadril", hit: /quadril|bursite|piriforme/i, ex: /agachamento|afundo|abdutora|adutora|stiff|eleva[çc][ãa]o p[ée]lvica|hip thrust|terra|passada/i },
    { k: "tornozelo", label: "tornozelo", hit: /tornozelo|tend[ãa]o de aquiles|aquiles|fasci[íi]te/i, ex: /panturrilha|g[êe]meos|salto|agachamento|passada|corrida/i },
    { k: "cervical", label: "cervical", hit: /cervical|pesco[çc]o/i, ex: /encolhimento|desenvolvimento|militar|puxada (atr[áa]s|nuca)|abdominal/i },
];
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// role "aluno" nunca usa clinicalAlert (é privado do professor) — só o que o próprio aluno contou
function restrictionFor(exName, student, role) {
    if (!student || !exName) return null;
    const a = student.assessment || {};
    const told = [a.lesoes, a.naoPode, ...(a.saudeAlertas || [])].filter((t) => t && !/^nenhu/i.test(String(t).trim())).join(" \n ");
    const source = role === "prof" ? told + " \n " + (student.clinicalAlert || "") : told;
    if (!source.trim()) return null;
    // "não pode fazer X": se uma palavra forte do nome do exercício aparece no texto, avisa direto
    const words = norm(exName).split(/[^a-z]+/).filter((w) => w.length >= 5);
    if (a.naoPode && words.some((w) => norm(a.naoPode).includes(w))) return { region: "exercício", text: "Relatou que não pode fazer este exercício" };
    const r = REGIONS.find((g) => g.hit.test(source) && g.ex.test(exName));
    return r ? { region: r.label, text: "Relatou restrição no " + r.label } : null;
}
export { restrictionFor };
