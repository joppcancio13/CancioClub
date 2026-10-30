import React from "react";
import { Pill } from "../shared/Pill";
import { DAYS } from "../../styles/tokens";

function DayTabs({ week, day, onPick, cardio, dock }) { return React.createElement("div", { style: { display: "flex", gap: 7, overflowX: "auto", paddingBottom: dock ? 0 : 4, marginBottom: dock ? 0 : 18 } }, DAYS.map((d) => { const c = (week[d.key] || []).length; const cd = cardio && cardio[d.key]; return React.createElement(Pill, { key: d.key, active: d.key === day, onClick: () => onPick(d.key), title: d.full },
    d.short,
    c > 0 ? ` · ${c}` : (cd ? " · c" : "")); })); }
export { DayTabs };
