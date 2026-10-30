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
    const selectedEntry = selectedDate ? byDate[selectedDate] : null;
    useEffect(() => { setSelectedDate(null); }, [month.year, month.month]);
    return (React.createElement("div", null,
        records.length > 0 && React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" } }, records.map((r) => React.createElement("div", { key: r.name, style: { flexShrink: 0, background: C.panel, borderRadius: 12, padding: "10px 12px", minWidth: 96, maxWidth: 150 } },
            React.createElement("div", { style: { fontFamily: F.body, fontSize: 11, color: C.muted, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, "★ " + r.name),
            React.createElement("div", { style: { fontFamily: F.display, fontStretch: "75%", fontSize: 20, fontWeight: 900, color: C.text, marginTop: 3 } },
                String(r.best).replace(".", ","),
                React.createElement("span", { style: { fontSize: 10, color: C.muted, fontWeight: 500 } }, " kg"))))),
        React.createElement("div", { style: { padding: "4px 0 6px", marginBottom: 14 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } },
                React.createElement("button", { onClick: () => onMonthChange(-1), style: { fontFamily: F.mono, fontSize: 16, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "4px 12px" } }, "‹"),
                React.createElement("div", { style: { fontFamily: F.display, fontWeight: 800, fontStretch: "115%", fontSize: 15, color: C.text } }, monthLabel),
                React.createElement("button", { onClick: () => onMonthChange(1), style: { fontFamily: F.mono, fontSize: 16, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "4px 12px" } }, "›")),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6, maxWidth: 420, marginLeft: "auto", marginRight: "auto" } }, CALENDAR_WEEKDAY_SHORT.map((w, i) => React.createElement("div", { key: i, style: { textAlign: "center", fontFamily: F.mono, fontSize: 9, color: C.muted } }, w))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, maxWidth: 420, margin: "0 auto" } }, cells.map((d, i) => {
                if (d == null)
                    return React.createElement("div", { key: i });
                const iso = isoFor(d);
                const entry = byDate[iso];
                const isToday = iso === todayISO();
                const isSelected = iso === selectedDate;
                return React.createElement("button", { key: i, className: entry ? "cc-tap" : undefined, onClick: () => entry && setSelectedDate(isSelected ? null : iso), disabled: !entry, style: { aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, borderRadius: 6, border: "none", background: entry ? "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)" : "transparent", boxShadow: isSelected ? "0 0 0 2px #05060A, 0 0 0 3.5px #F2F5FA" : entry ? "none" : isToday ? "inset 0 0 0 1.5px " + C.silver : "inset 0 0 0 1px #15181F", color: entry ? C.ink : isToday ? C.text : "#3A404C", fontFamily: F.display, fontWeight: entry ? 800 : 500, fontStretch: entry ? "75%" : "100%", fontSize: 13, cursor: entry ? "pointer" : "default", padding: 0, transition: "box-shadow .2s ease" } },
                    d,
                    entry && entry.hasRecord && React.createElement("span", { style: { fontSize: 8, lineHeight: 1 } }, "★"));
            }))),
        selectedEntry
            ? React.createElement(DiaryEntryCard, { entry: selectedEntry })
            : !monthHasEntries && React.createElement(PremiumEmptyState, { icon: "calendar", title: "Nenhum treino registrado neste mês.", sub: "Toque num dia com marcação pra ver os detalhes." })));
}
export { DiaryCalendar };
