// Sugestão de vínculo ao catálogo pelo NOME do exercício da ficha (redesign estético 4, item 8:
// "CONTA NO VOLUME COMO" com sugestão de um toque, em vez de navegar grupo -> exercício sempre).
// Comparação simples por sobreposição de palavras — sem dependência externa, dá conta dos nomes
// do catálogo ("Supino inclinado com halteres") baterem com variações como o aluno/professor
// escreve na ficha ("Supino inclinado halter").
function normalize(str) {
    return String(str || "")
        .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ");
}

// palavras curtas (de, com, e, a...) não ajudam a desambiguar e só introduzem ruído
const STOPWORDS = new Set(["de", "da", "do", "com", "e", "a", "o", "em", "na", "no", "pra", "para"]);

function tokenize(str) {
    return normalize(str).split(/\s+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach((t) => { if (b.has(t)) inter++; });
    const union = a.size + b.size - inter;
    return union ? inter / union : 0;
}

// Retorna a entrada do catálogo com nome mais parecido, ou null se nada bate o suficiente pra
// sugerir com confiança (melhor deixar sem sugestão do que vincular errado).
function suggestCatalogMatch(exerciseName, catalog) {
    const nameTokens = new Set(tokenize(exerciseName));
    if (!nameTokens.size) return null;
    let best = null;
    let bestScore = 0;
    Object.values(catalog || {}).forEach((entry) => {
        const entryTokens = new Set(tokenize(entry.nome));
        const score = jaccard(nameTokens, entryTokens);
        if (score > bestScore) { bestScore = score; best = entry; }
    });
    if (!best || bestScore < 0.3) return null;
    return best;
}

export { suggestCatalogMatch, tokenize, normalize };
