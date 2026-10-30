import { create } from "zustand";

// Store central do "data" do app (alunos, treinos, templates, biblioteca, mensagens...) —
// antes vivia como useState dentro do componente CancioClub inteiro. A migração pra cá tira
// esse estado de dentro da árvore de componentes do React (agora é um módulo externo, não
// re-criado a cada montagem, inspecionável fora do ciclo de render), sem mudar nenhuma regra
// de negócio: toda a lógica de leitura/escrita continua exatamente onde estava (em App.jsx),
// só trocando a origem do estado de "useState local" pra "seletor deste store".
//
// setData aceita tanto um valor direto quanto uma função atualizadora (p => ({...p, ...})),
// igual ao setState do React — preserva os ~40 call sites existentes sem precisar tocar neles.
const useDataStore = create((set) => ({
    data: null,
    ready: false,
    cloudSynced: true,
    localFull: false,
    setData: (updaterOrValue) => set((state) => ({
        data: typeof updaterOrValue === "function" ? updaterOrValue(state.data) : updaterOrValue,
    })),
    setReady: (v) => set({ ready: v }),
    setCloudSynced: (v) => set({ cloudSynced: v }),
    setLocalFull: (v) => set({ localFull: v }),
}));

export { useDataStore };
