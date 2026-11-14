import React, { useState } from "react";
import { C, F, SIL_URL } from "../../styles/tokens";
import { fmtMemberNo, fmtSince } from "../../utils/members";

// Carteirinha do membro — só para mostrar (não é acesso à academia).
// Frente: crachá vertical com selo e frequência do mês. Verso: cartão prata.
const MONTHS = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
const TILE_ON = "linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)";
let sealSeq = 0;

function Seal({ size, color, dark }) {
    const [id] = useState(() => "cc-seal-" + (++sealSeq));
    const k = size / 200;
    return React.createElement("div", { style: { position: "relative", width: size, height: size, flexShrink: 0 } },
        React.createElement("img", { src: SIL_URL, alt: "", style: { position: "absolute", left: 55 * k, top: 55 * k, width: 90 * k, height: 90 * k, filter: dark ? "brightness(0.07)" : "none" } }),
        React.createElement("svg", { viewBox: "0 0 200 200", width: size, height: size, style: { position: "absolute", inset: 0 }, "aria-hidden": "true" },
            React.createElement("defs", null,
                React.createElement("path", { id: id + "t", d: "M 100 100 m -76 0 a 76 76 0 1 1 152 0" }),
                React.createElement("path", { id: id + "b", d: "M 100 100 m -86 0 a 86 86 0 0 0 172 0" })),
            React.createElement("circle", { cx: 100, cy: 100, r: 97, fill: "none", stroke: color, strokeWidth: size < 120 ? 2.5 : 1.5 }),
            React.createElement("text", { fontFamily: "Archivo", fontWeight: 900, fontSize: 24, letterSpacing: 1, fill: color },
                React.createElement("textPath", { href: "#" + id + "t", startOffset: "50%", textAnchor: "middle", textLength: 186, lengthAdjust: "spacing" }, "CANCIO CLUB")),
            React.createElement("text", { fontFamily: "Archivo", fontWeight: 800, fontSize: 11, letterSpacing: 2.6, fill: color },
                React.createElement("textPath", { href: "#" + id + "b", startOffset: "50%", textAnchor: "middle" }, "TREINOS · PROGRESSÃO"))));
}

function MemberCard({ student, trainedDays, onClose }) {
    const [side, setSide] = useState("front");
    const now = new Date();
    const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const on = trainedDays || new Set();
    const count = [...on].length;
    const no = fmtMemberNo(student.memberNo), since = fmtSince(student.memberSince || student.startDate);
    const tab = (k, l) => React.createElement("button", { className: "cc-tap", onClick: () => setSide(k), style: { minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 13, background: side === k ? C.text : "transparent", color: side === k ? C.ink : "#AEB7C6" } }, l);
    const label = { fontFamily: F.body, fontSize: 11, letterSpacing: "0.16em", color: "#3A404C" };
    const val = { fontFamily: F.body, fontWeight: 800, fontSize: 15 };
    return React.createElement("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", inset: 0, zIndex: 100, background: C.ink, display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(env(safe-area-inset-top) + 20px) 20px calc(env(safe-area-inset-bottom) + 20px)", boxSizing: "border-box", animation: "cc-fade .25s ease" } },
        React.createElement("div", { style: { alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 18, color: C.text } }, "CARTEIRINHA"),
            React.createElement("button", { className: "cc-tap", onClick: onClose, style: { minHeight: 44, padding: "0 4px 0 12px", border: "none", background: "transparent", color: C.muted, fontFamily: F.body, fontSize: 15, cursor: "pointer" } }, "Fechar")),
        React.createElement("div", { style: { marginTop: 14, display: "flex", gap: 6, padding: 4, borderRadius: 999, background: "#0E1015" } }, tab("front", "Crachá"), tab("back", "Cartão")),
        React.createElement("div", { style: { flex: 1, minHeight: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" } },
            side === "front"
                ? React.createElement("div", { key: "f", className: "cc-fade-in", style: { width: 316, height: 500, maxHeight: "100%", borderRadius: 24, background: "#0E1015", boxShadow: "inset 0 0 0 1px #2A2E37, 0 20px 50px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 26px 26px", boxSizing: "border-box", color: C.text } },
                    React.createElement("div", { style: { alignSelf: "stretch", display: "flex", justifyContent: "space-between", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", color: C.muted } }, React.createElement("span", null, "MEMBRO"), React.createElement("span", null, "Nº " + no)),
                    React.createElement("div", { style: { marginTop: 28 } }, React.createElement(Seal, { size: 170, color: "#C6D2E4" })),
                    React.createElement("div", { style: { marginTop: 26, fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 28, lineHeight: 0.95, textAlign: "center", textTransform: "uppercase", textWrap: "balance" } }, student.name),
                    React.createElement("div", { style: { marginTop: 8, fontFamily: F.body, fontSize: 13, color: "#AEB7C6" } }, "Membro desde " + since + " · Prof. Cancio"),
                    React.createElement("div", { style: { marginTop: "auto", alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 8 } },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.14em", color: C.muted } }, React.createElement("span", null, MONTHS[now.getMonth()]), React.createElement("span", null, count + (count === 1 ? " TREINO" : " TREINOS"))),
                        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(16,1fr)", gap: 4 } },
                            Array.from({ length: dim }, (_, i) => React.createElement("span", { key: i, style: { height: 10, borderRadius: 2, background: on.has(i + 1) ? TILE_ON : "#1A1D24", boxShadow: on.has(i + 1) ? "none" : "inset 0 0 0 1px #2A2E37" } })))))
                : React.createElement("div", { key: "b", className: "cc-fade-in", style: { width: 316, height: 500, display: "flex", alignItems: "center", justifyContent: "center" } },
                    React.createElement("div", { style: { position: "relative", width: 456, height: 288, flexShrink: 0, transform: "rotate(90deg) scale(1.08)", borderRadius: 24, background: "linear-gradient(125deg,#E9EEF6 0%,#B8C3D4 38%,#F2F5FA 52%,#8D97A9 100%)", boxShadow: "0 20px 50px rgba(0,0,0,.5)", overflow: "hidden", color: C.ink } },
                        React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(5,6,10,.06) 1px,transparent 1px) 0 0/12px 12px,linear-gradient(180deg,rgba(5,6,10,.06) 1px,transparent 1px) 0 0/12px 12px" } }),
                        React.createElement("div", { style: { position: "absolute", left: 28, top: 26, display: "flex", flexDirection: "column", fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 15, lineHeight: 0.92 } }, React.createElement("span", null, "CANCIO"), React.createElement("span", { style: { color: "#3A404C" } }, "CLUB")),
                        React.createElement("div", { style: { position: "absolute", right: 24, top: 22 } }, React.createElement(Seal, { size: 96, color: C.ink, dark: true })),
                        React.createElement("div", { style: { position: "absolute", left: 28, right: 28, bottom: 26, display: "flex", flexDirection: "column", gap: 14 } },
                            React.createElement("div", { style: { fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 28, lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, student.name),
                            React.createElement("div", { style: { display: "flex", gap: 32 } },
                                [["Nº", no], ["DESDE", since.toUpperCase()], ["PROFESSOR", "CANCIO"]].map(([l, v]) => React.createElement("div", { key: l, style: { display: "flex", flexDirection: "column", gap: 3 } }, React.createElement("span", { style: label }, l), React.createElement("span", { style: val }, v)))))))),
        React.createElement("span", { style: { fontFamily: F.body, fontSize: 13, color: "#7D8698", textAlign: "center" } }, "Só pra mostrar. Não serve de acesso à academia."));
}
export { MemberCard };
