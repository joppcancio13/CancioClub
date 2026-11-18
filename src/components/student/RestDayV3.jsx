import React from "react";
import { C, F, KICKER } from "../../styles/tokens";
import { Icon } from "../shared/Icon";
import { haptic } from "../../utils/misc";

// Dia sem exercício na ficha (frente 2, 18/nov). Substitui a pilha antiga do Treino (empty state +
// CardioSection + RecoverySection + BottomActionBar) por uma tela só, no padrão v3: título, cardio
// que o aluno fez por conta, o que cuidou na recuperação e um botão de fechar o dia no fim.
const RECOVERY = [["hydration", "Hidratação"], ["sleep", "Sono 7h+"], ["mobility", "Mobilidade"]];
const block = { padding: 16, borderRadius: 16, background: C.panel, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", flexDirection: "column", gap: 12 };
const field = { width: "100%", boxSizing: "border-box", minHeight: 48, fontFamily: F.body, fontSize: 16, color: C.text, background: C.raised, boxShadow: `inset 0 0 0 1px ${C.outline}`, border: "none", borderRadius: 12, padding: "12px 14px", outline: "none" };
const btn = { minHeight: 52, borderRadius: 16, border: "none", fontFamily: F.body, fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" };

function RestDayV3({ weekday, entries, form, onFormChange, onAddCardio, recovery, onToggleRecovery, canFinalize, dayDone, label, onFinalize }) {
    const canAdd = !!(form.activity || "").trim() && !!form.minutes;
    const cared = RECOVERY.filter(([k]) => recovery[k]).length;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 130 }}>
            <div>
                {weekday && <div style={KICKER}>{weekday}</div>}
                <div style={{ marginTop: 6, fontFamily: F.display, fontWeight: 900, fontStretch: "125%", fontSize: 30, lineHeight: 1, color: C.text }}>DESCANSO</div>
                <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 15, lineHeight: 1.45, color: C.text3 }}>Sem musculação hoje. O músculo cresce agora, enquanto você recupera.</div>
            </div>

            <div style={block}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={KICKER}>Fez cardio?</span>
                    {entries.length > 0 && <span style={{ fontFamily: F.body, fontSize: 13, color: C.text3 }}>{entries.reduce((s, c) => s + (Number(c.minutes) || 0), 0)} min hoje</span>}
                </div>
                {entries.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40 }}>
                        <Icon name="check" size={16} stroke={22} color={C.text2} />
                        <span style={{ flex: 1, fontFamily: F.body, fontSize: 15, color: C.text }}>{c.activity}</span>
                        <span style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{c.minutes} min</span>
                    </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                    <input aria-label="Atividade" placeholder="Esteira, bike, escada…" value={form.activity} onChange={(e) => onFormChange({ ...form, activity: e.target.value })} style={{ ...field, flex: "2 1 0", minWidth: 0 }} />
                    <input aria-label="Minutos" placeholder="min" inputMode="numeric" value={form.minutes} onChange={(e) => onFormChange({ ...form, minutes: e.target.value.replace(/\D/g, "").slice(0, 3) })} style={{ ...field, flex: "1 1 0", minWidth: 0, textAlign: "center" }} />
                </div>
                <button type="button" className="cc-tap" disabled={!canAdd} onClick={() => { haptic("tap"); onAddCardio(form.activity, form.minutes); }}
                    style={{ ...btn, minHeight: 48, background: canAdd ? C.raised : "transparent", color: canAdd ? C.text : C.text4, boxShadow: `inset 0 0 0 1px ${canAdd ? C.outline : C.line}`, cursor: canAdd ? "pointer" : "default" }}>
                    Registrar cardio
                </button>
            </div>

            <div style={block}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={KICKER}>O que você cuidou</span>
                    <span style={{ fontFamily: F.body, fontSize: 13, color: C.text3, fontVariantNumeric: "tabular-nums" }}>{cared} de {RECOVERY.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {RECOVERY.map(([k, l]) => {
                        const on = !!recovery[k];
                        return (
                            <button key={k} type="button" className="cc-tap" aria-pressed={on} onClick={() => { haptic("tap"); onToggleRecovery(k); }}
                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, padding: "0 6px", minWidth: 0, whiteSpace: "nowrap", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: F.body, fontWeight: 600, fontSize: 15, background: on ? C.text : C.raised, color: on ? C.ink : C.text, boxShadow: on ? "none" : `inset 0 0 0 1px ${C.outline}` }}>
                                {l}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button type="button" className="cc-tap" disabled={!canFinalize} onClick={onFinalize}
                style={{ ...btn, marginTop: 4, background: canFinalize ? C.text : C.raised, color: canFinalize ? C.ink : C.text4, cursor: canFinalize ? "pointer" : "default" }}>
                {label}
            </button>
            {!canFinalize && !dayDone && <div style={{ textAlign: "center", fontFamily: F.body, fontSize: 13, color: C.text4, marginTop: -4 }}>Registre o cardio ou marque a recuperação pra fechar o dia.</div>}
        </div>
    );
}
export { RestDayV3 };
