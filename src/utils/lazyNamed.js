import React from "react";

// Carregamento sob demanda (frente 3 do refinamento, 18/nov). O aluno não precisa baixar as telas do
// professor, e ninguém precisa da anamnese ou da carteirinha logo na abertura. Cada componente vira
// um pedaço separado do build, embrulhado no seu próprio Suspense (fallback vazio) — assim só ele
// espera, não o app inteiro. `preload()` baixa antes, quando o aparelho estiver ocioso, pra que o
// primeiro toque abra na hora.
export function lazyNamed(loader, name) {
    let p = null;
    const load = () => (p || (p = loader()));
    const Lazy = React.lazy(() => load().then((m) => ({ default: m[name] })));
    function Wrapped(props) {
        return React.createElement(React.Suspense, { fallback: null }, React.createElement(Lazy, props));
    }
    Wrapped.displayName = name;
    Wrapped.preload = load;
    return Wrapped;
}

// baixa uma lista de componentes quando o navegador estiver livre
export function preloadWhenIdle(list) {
    const run = () => list.forEach((c) => { try { c.preload(); } catch (e) { } });
    if (typeof window !== "undefined" && "requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
    else setTimeout(run, 1500);
}
