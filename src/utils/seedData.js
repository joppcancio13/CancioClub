import { daysAgo } from "./date";
import { uid, uidShort } from "./misc";
import { seedCheckins } from "./streak";
import { emptyWeek } from "./workout";

function seed() {
    const id = uid();
    const H = (arr) => arr;
    return {
        activeStudentId: id, profKey: null, soundOn: true, isSeed: true,
        students: [{ id, name: "Exemplo · Maria", code: "1234", goal: "Hipertrofia", obs: "Dor no ombro direito — evitar sobrecarga acima da cabeça. Prefere treinar de manhã." }],
        checkins: { [id]: seedCheckins([1, 3]) },
        bestStreak: { [id]: 8 },
        messages: [{ id: uid(), studentId: id, text: "Senti um leve incômodo no ombro no supino de hoje, mas nada forte.", date: new Date(Date.now() - 3600 * 1000 * 20).toISOString(), read: false }],
        archives: { [id]: [] },
        library: [
            { id: uid(), name: "Agachamento livre", url: "" },
            { id: uid(), name: "Supino reto", url: "" },
            { id: uid(), name: "Levantamento terra", url: "" },
            { id: uid(), name: "Puxada frente", url: "" },
        ],
        templates: [
            { id: uid(), name: "Inferiores A", exercises: [
                    { name: "Agachamento livre", sets: 4, reps: "8", rest: 120, note: "Desça controlado (3s). Joelhos alinhados aos pés." },
                    { name: "Leg press 45°", sets: 4, reps: "12", rest: 90 }, { name: "Cadeira extensora", sets: 3, reps: "15", rest: 60 },
                    { name: "Panturrilha em pé", sets: 4, reps: "20", rest: 45, note: "Pausa de 1s no topo." }
                ] },
            { id: uid(), name: "Superiores A", exercises: [
                    { name: "Supino reto", sets: 4, reps: "10", rest: 90 }, { name: "Puxada frente", sets: 4, reps: "12", rest: 90, note: "Puxe com os cotovelos." },
                    { name: "Desenvolvimento halteres", sets: 3, reps: "12", rest: 75 }, { name: "Rosca direta", sets: 3, reps: "12", rest: 60 }
                ] },
            { id: uid(), name: "Full body iniciante", exercises: [
                    { name: "Agachamento", sets: 3, reps: "12", rest: 90 }, { name: "Supino máquina", sets: 3, reps: "12", rest: 60 },
                    { name: "Remada sentada", sets: 3, reps: "12", rest: 60 }, { name: "Prancha", sets: 3, reps: "30s", rest: 45, note: "Abdômen firme." }
                ] },
        ],
        workouts: {
            [id]: { ...emptyWeek(),
                seg: [
                    { id: uid(), name: "Agachamento livre", sets: 4, reps: "8", rest: 120, note: "Desça controlado (3s). Joelhos alinhados aos pés.",
                        setPlan: [{ id: uidShort(), kind: "warmup", reps: "15" }, { id: uidShort(), kind: "working", reps: "12" }, { id: uidShort(), kind: "working", reps: "10" }, { id: uidShort(), kind: "working", reps: "8" }, { id: uidShort(), kind: "working", reps: "8" }],
                        history: H([{ date: daysAgo(28), load: 40, reps: 8 }, { date: daysAgo(21), load: 45, reps: 8 }, { date: daysAgo(14), load: 50, reps: 8 }, { date: daysAgo(7), load: 52.5, reps: 8 }, { date: daysAgo(0), load: 55, reps: 8 }]) },
                    { id: uid(), name: "Supino reto", sets: 4, reps: "10", rest: 90,
                        history: H([{ date: daysAgo(28), load: 30, reps: 10 }, { date: daysAgo(21), load: 32.5, reps: 10 }, { date: daysAgo(14), load: 35, reps: 11 }, { date: daysAgo(0), load: 37.5, reps: 12 }]) },
                ],
                qua: [
                    { id: uid(), name: "Levantamento terra", sets: 3, reps: "6", rest: 150, note: "Barra colada na canela. Sobe empurrando o chão.",
                        history: H([{ date: daysAgo(28), load: 60, reps: 6 }, { date: daysAgo(14), load: 70, reps: 6 }, { date: daysAgo(0), load: 80, reps: 6 }]) },
                ],
            },
        },
    };
}
export { seed };
