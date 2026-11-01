import React from "react";

// Série atual: o ExerciseCard aberto publica aqui a próxima série pendente; a faixa fixa do
// rodapé (BottomActionBar) lê isso e registra carga/reps sem o aluno precisar rolar de volta.
const activeSet = { current: null, subs: new Set() };
function setActiveSet(v) { activeSet.current = v; activeSet.subs.forEach((fn) => { try { fn(v); } catch (e) { } }); }
function useActiveSet() {
    const [v, setV] = React.useState(activeSet.current);
    React.useEffect(() => { activeSet.subs.add(setV); setV(activeSet.current); return () => { activeSet.subs.delete(setV); }; }, []);
    return v;
}
export { activeSet, setActiveSet, useActiveSet };
