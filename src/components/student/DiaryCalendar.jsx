import React, { useState, useEffect } from "react";
import { PremiumEmptyState } from "../shared/PremiumEmptyState";
import { DiaryEntryCard } from "./DiaryEntryCard";
import { C, CALENDAR_WEEKDAY_SHORT, F } from "../../styles/tokens";
import { todayISO } from "../../utils/date";

// diário em forma de calendário, separado por mês — cada dia com marcação vira um cartão ao tocar.
// os recordes ficam junto, como uma fileira de chips acima do mês, em vez de uma tela à parte.
function DiaryCalendar({ diary, records, month, onMonthChange }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const byDate = {};
    diary.forEach((e) => { byDate[e.date] = e; });
    const first = new Date(month.year, month.month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // semana começa segunda, como o resto do app
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(d);
    const isoFor = (d) => `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const monthKey = `${month.year}-${String(month.month + 1).padStart(2, "0")}`;
    const monthLabelRaw = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const monthLabel = monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1);
    const monthHasEntries = diary.some((e) => e.date.slice(0, 7) === monthKey);
    const monthEntries = diary.filter((e) => e.date.slice(0, 7) === monthKey && e.effort !== "descanso");
    const monthRecords = monthEntries.filter((e) => e.hasRecord).length;
    const latestIso = monthEntries.map((e) => e.date).sort().pop() || null;
    const selectedEntry = selectedDate ? byDate[selectedDate] : null;
    // 7a: abre já no treino mais recente do mês, em vez de um calendário "vazio" de detalhes
    useEffect(() => { setSelectedDate(latestIso); }, [month.year, month.month, latestIso]);
    const monthName = first.toLocaleDateString("pt-BR", { month: "long" }).toUpperCase();
    const navName = (delta) => new Date(month.year, month.month + delta, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return (React.createElement("div", null,
        React.createElement("div", { style: { padding: "4px 0 6px", marginBottom: 14 } },
            React.createElement("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 } },
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                    React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 24, lineHeight: 1, color: C.text } }, monthName),
                    React.createElement("div", { style: { display: "flex", gap: 4, marginLeft: -10 } },
                        React.createElement("button", { className: "cc-tap", onClick: () => onMonthChange(-1), style: { minHeight: 44, fontFamily: F.body, fontSize: 13, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "0 10px" } }, "\u2039 " + navName(-1)),
                        React.createElement("button", { className: "cc-tap", onClick: () => onMonthChange(1), style: { minHeight: 44, fontFamily: F.body, fontSize: 13, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "0 10px" } }, navName(1) + " \u203A"))),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", paddingBottom: 10 } },
                    React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "75%", fontSize: 40, lineHeight: 0.9, color: C.text } }, monthEntries.length),
                    React.createElement("span", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 4 } }, (monthEntries.length === 1 ? "treino" : "treinos") + (monthRecords ? ` · ${monthRecords} \u2605` : "")))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 6, maxWidth: 420, marginLeft: "auto", marginRight: "auto" } }, CALENDAR_WEEKDAY_SHORT.map((w, i) => React.createElement("div", { key: i, style: { textAlign: "center", fontFamily: F.body, fontSize: 11, color: "#5A6273" } }, w))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, maxWidth: 420, margin: "0 auto 18px" } }, cells.map((d, i) => {
                if (d == null)
                    return React.createElement("div", { key: i });
                const iso = isoFor(d);
                const entry = byDate[iso];
                const isToday = iso === todayISO();
                const isSelected = iso === selectedDate;
                return React.createElement("button", { key: i, className: entry ? "cc-tap" : undefined, onClick: () => entry && setSelectedDate(isSelected ? null : iso), disabled: !entry, style: { minHeight: 44, aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, borderRadius: 6, border: "none", background: entry ? "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)" : "transparent", boxShadow: isSelected ? "0 0 0 2px #05060A, 0 0 0 3.5px #F2F5FA" : entry ? "none" : isToday ? "inset 0 0 0 1.5px " + C.silver : "none", color: entry ? C.ink : isToday ? C.text : "#5A6273", position: "relative", fontFamily: F.display, fontWeight: entry ? 800 : 500, fontStretch: entry ? "75%" : "100%", fontSize: 13, cursor: entry ? "pointer" : "default", padding: 0, transition: "box-shadow .2s ease" } },
                    d,
                    entry && entry.hasRecord && React.createElement("span", { style: { position: "absolute", top: 1, right: 3, fontSize: 11, lineHeight: 1 } }, "★"));
            }))),
        selectedEntry
            ? React.createElement("div", { style: { borderTop: `1px solid ${C.line}`, paddingTop: 14 } }, React.createElement(DiaryEntryCard, { entry: selectedEntry, bare: true }))
            : !monthHasEntries && React.createElement(PremiumEmptyState, { icon: "calendar", title: "Nenhum treino registrado neste mês.", sub: "Toque num dia com marcação pra ver os detalhes." })));
}
export { DiaryCalendar };
