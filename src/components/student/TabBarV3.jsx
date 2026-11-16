import React from "react";
import { C, F } from "../../styles/tokens";

// Barra de abas do aluno — design v3 (decisão 14c: pílula flutuante) com Hoje / Treino / Recados / Perfil.
// Ícones desenhados aqui (traço do Phosphor) pra irem dentro do build: o app precisa funcionar offline.
const ICONS = {
    hoje: "M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm0 176H48V88h160Zm0-136H48V48h24v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24Z",
    treino: "M248 120h-8V88a16 16 0 0 0-16-16h-16v-8a16 16 0 0 0-16-16h-24a16 16 0 0 0-16 16v56h-48V64a16 16 0 0 0-16-16H64a16 16 0 0 0-16 16v8H32a16 16 0 0 0-16 16v32H8a8 8 0 0 0 0 16h8v32a16 16 0 0 0 16 16h16v8a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16v-56h48v56a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16v-8h16a16 16 0 0 0 16-16v-32h8a8 8 0 0 0 0-16ZM32 168V88h16v80Zm56 24H64V64h24Zm104 0h-24V64h24Zm32-24h-16V88h16Z",
    recados: "M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24Zm0 192a87.87 87.87 0 0 1-44.06-11.81 8 8 0 0 0-6.54-.67L40 216l12.47-37.4a8 8 0 0 0-.66-6.54A88 88 0 1 1 128 216Z",
    perfil: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24ZM74.08 197.5a64 64 0 0 1 107.84 0 87.83 87.83 0 0 1-107.84 0ZM96 120a32 32 0 1 1 32 32 32 32 0 0 1-32-32Zm97.76 66.41a79.66 79.66 0 0 0-36.06-28.75 48 48 0 1 0-59.4 0 79.66 79.66 0 0 0-36.06 28.75 88 88 0 1 1 131.52 0Z",
};
const TABS = [["hoje", "Hoje"], ["treino", "Treino"], ["recados", "Recados"], ["perfil", "Perfil"]];

function TabBarV3({ active, onChange, badge, hidden }) {
    return (
        <nav aria-label="Seções" style={{ position: "fixed", left: 0, right: 0, bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", zIndex: 98, display: "flex", justifyContent: "center", pointerEvents: "none", transform: hidden ? "translateY(140%)" : "none", opacity: hidden ? 0 : 1, transition: "transform .25s ease, opacity .2s ease" }}>
            <div style={{ pointerEvents: hidden ? "none" : "auto", display: "flex", gap: 4, padding: 5, borderRadius: 999, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                {TABS.map(([k, label]) => {
                    const on = k === active;
                    return (
                        <button key={k} type="button" onClick={() => onChange(k)} aria-label={label} aria-current={on ? "page" : undefined}
                            style={{ position: "relative", height: 48, minWidth: 56, padding: on ? "0 18px" : "0 14px", borderRadius: 999, border: "none", background: on ? C.text : "transparent", color: on ? C.bg : C.text2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: F.body, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "background .15s ease, padding .15s ease" }}>
                            <svg width="22" height="22" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d={ICONS[k]} /></svg>
                            {on && <span>{label}</span>}
                            {k === "recados" && badge > 0 && !on && <span aria-hidden="true" style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: "50%", background: C.text }} />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export { TabBarV3 };
