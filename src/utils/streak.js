import { DAYS } from "../styles/tokens";
import { isoOf } from "./date";

function trainingWds(wk, cardio) { return new Set(DAYS.filter((d) => (wk[d.key] || []).length > 0 || (cardio && cardio[d.key])).map((d) => d.wd)); }
function computeStreak(twd, set) {
    if (!twd.size)
        return 0;
    let s = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (twd.has(d.getDay()) && !set.has(isoOf(d)))
        d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
        if (twd.has(d.getDay())) {
            if (set.has(isoOf(d)))
                s++;
            else
                break;
        }
        d.setDate(d.getDate() - 1);
    }
    return s;
}
function lastCheckinLabel(ch) {
    if (!ch.length)
        return "sem registro";
    const last = [...ch].sort().slice(-1)[0];
    const d = new Date(last + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((now - d) / 86400000);
    if (diff <= 0)
        return "hoje";
    if (diff === 1)
        return "ontem";
    return `há ${diff} dias`;
}
function seedCheckins(wds) { const out = []; const d = new Date(); d.setHours(0, 0, 0, 0); for (let i = 0; i < 24; i++) {
    if (wds.includes(d.getDay()))
        out.push(isoOf(d));
    d.setDate(d.getDate() - 1);
} return out; }
// limiares em TOTAL de treinos feitos (não mais sequência de dias seguidos — ver freqTotal em
// CancioClub) — recalibrados pra uma contagem que só cresce, nunca "quebra"
function streakTier(s) {
    if (s >= 120)
        return { name: "Lendário", tint: "#FFFFFF", accent: "#FFFFFF" };
    if (s >= 60)
        return { name: "Diamante", tint: "#F2F2F5", accent: "#F2F2F5" };
    if (s >= 30)
        return { name: "Ouro", tint: "#DDDDE2", accent: "#DDDDE2" };
    if (s >= 10)
        return { name: "Platina", tint: "#CACACF", accent: "#CACACF" };
    return { name: "Prata", tint: "#B8B8C0", accent: "#B8B8C0" };
}
export { trainingWds, computeStreak, lastCheckinLabel, seedCheckins, streakTier };
