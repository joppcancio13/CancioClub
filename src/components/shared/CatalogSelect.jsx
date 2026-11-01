import React from "react";
import { catalogByCategory } from "../../data/exerciseCatalog";
import { C, F } from "../../styles/tokens";

// <select> nativo agrupado por categoria pra vincular um exercício da ficha a uma entrada do
// catálogo biomecânico (ver src/data/exerciseCatalog.js) — o vínculo (`catalogId`) é o que
// permite o VolumeDashboard contar esse exercício no volume por músculo. Usado tanto ao criar um
// exercício novo quanto editando um já existente; sem vínculo, o exercício continua funcionando
// normalmente, só não entra na conta de volume.
function CatalogSelect({ value, onChange, label }) {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        label && React.createElement("label", { style: { fontFamily: F.mono, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted } }, label),
        React.createElement("select", {
            value: value || "",
            onChange: (e) => onChange(e.target.value),
            style: { width: "100%", boxSizing: "border-box", fontFamily: F.body, fontSize: 13.5, color: C.text, background: C.panel2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 11px", outline: "none" },
        },
            React.createElement("option", { value: "" }, "Sem vínculo — não entra no volume por músculo"),
            catalogByCategory.map((g) => React.createElement("optgroup", { key: g.categoria, label: g.categoria },
                g.entries.map((entry) => React.createElement("option", { key: entry.id, value: entry.id }, entry.nome))))));
}
export { CatalogSelect };
