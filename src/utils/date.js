const isoOf = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};
const todayISO = () => isoOf(new Date());
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return isoOf(d); };
const fmtDate = (iso) => { const [, m, d] = iso.split("-"); return `${d}/${m}`; };
const fmtDateTime = (iso) => { const d = new Date(iso); const p = (n) => String(n).padStart(2, "0"); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const mmss = (s) => { const m = Math.floor(s / 60); const r = s % 60; return `${m}:${String(r).padStart(2, "0")}`; };
const fmtDur = (sec) => sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} s`;
// tonelagem acima de 1000kg vira toneladas (1 casa decimal, vírgula) — mesmo padrão já usado no
// canvas do ShareCard, só que reaproveitado aqui pros textos renderizados em React (chart, celebração)
const fmtVolume = (kg) => kg >= 1000 ? `${(kg / 1000).toFixed(1).replace(".", ",")} TON` : `${Math.round(kg).toLocaleString("pt-BR")} kg`;
// extrai a meta numérica do campo livre "Frequência semanal" da ficha (ex.: "4x na semana" -> 4).
// Sem número reconhecível (campo vazio, texto sem dígito) -> null, e quem usa cai pro número cru.
const parseWeeklyTarget = (freqWeeklyText) => { const m = String(freqWeeklyText || "").match(/\d+/); return m ? parseInt(m[0], 10) : null; };
const isWithin7 = (iso) => { const d = new Date(iso + "T00:00:00"); const now = new Date(); now.setHours(0, 0, 0, 0); const diff = (now - d) / 86400000; return diff >= 0 && diff < 7; };
export { isoOf, todayISO, daysAgo, fmtDate, fmtDateTime, mmss, fmtDur, fmtVolume, parseWeeklyTarget, isWithin7 };
