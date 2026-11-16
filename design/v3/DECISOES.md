# Cancio Club v3 — decisões antes de implementar (15/nov/2026)

O handoff (`README.md` desta pasta) vale como especificação, **com as decisões abaixo por cima**.
Onde este arquivo e o README discordarem, vale este arquivo.

## Decididas com o João

### 1. Volume por grupo muscular: pela ativação
- Cada série soma a **ativação** do exercício em cada grupo (supino: peito +1,0, tríceps +0,6, ombro +0,4), usando as frações de `src/data/exerciseCatalog.js`.
- Ativação do grupo = **maior** valor entre os músculos daquele grupo (regra do README).
- Números com **uma casa e vírgula** ("12,4"; delta "−0,6").
- Eretores da espinha não entram em nenhum grupo.
- O número grande "séries de trabalho na semana" continua contando **cada série uma vez** (v52).
- Atenção: o README dizia que essa era "a mesma regra do app". Não era: até a v52 o app contava a série inteira em cada músculo com qualquer ativação (`utils/volumeCalculator.js`). Mudar o cálculo faz parte da implementação.

### 2. "Na pista" / Ao vivo: atualizar a cada 30 s
- Enquanto a tela de Alunos ou Ao vivo do professor está aberta e visível, busca os alunos de novo a cada 30 s.
- Para quando a aba fica em segundo plano (`visibilitychange`) e volta ao reabrir.
- Sem mudar o banco nem a Edge Function. Atraso de até meio minuto.
- "Na pista" = aluno com série registrada hoje e treino ainda não finalizado.

### 3. Volume: 11 grupos em todo lugar
- Ficha e edição usam os mesmos 11 grupos: Costas, Peitoral, Ombros, Bíceps, Tríceps, Quadríceps, Isquiotibiais, Glúteos, Adutores, Panturrilha, Abdômen.
- Os 5 grupos amplos do protótipo da ficha (Pernas, Costas, Peito, Braços, Ombros) **não** são usados.

### 4. Abas escondidas durante o treino
- Com o treino em andamento, a barra de abas some; a barra de registro/descanso fica sozinha embaixo.
- As abas voltam ao finalizar o treino ou ao rolar a lista para cima.

## Padrões adotados (sem pergunta, dá pra mudar)
- **Descanso:** séries válidas usam o descanso do exercício; aquecimento e reconhecimento usam 1:00. (No protótipo, o aquecimento deu 1:00 com a coluna dizendo 2:00.)
- **Ficha do professor "página única":** os chips Semana / Rendimento / Volume / Ficha viram atalhos que rolam até a seção, não abas.
- **Tela Hoje:** o espaço vazio entre o card e "Começar treino" recebe a lista curta dos exercícios do dia.
- **Ícones Phosphor** vão dentro do build (pacote npm), não por CDN: o app precisa funcionar offline.
- **Ordem de implementação:** tokens → Treino → Hoje → Compartilhar → Professor (Ao vivo junto com Alunos). Cada fase publicada separada, para testar no celular antes da próxima.

## Fora do escopo por enquanto (precisam de dado novo)
- "Reavaliação vencida há N dias" (precisa de data da próxima reavaliação).
- Nota fixada do professor e recado com contexto da série (campos novos em `messages`).
- Cards "Números" e "Pastilhas" em PNG transparente sobre foto escolhida.
- Carteirinha que vira em 3D.

Entram em fases próprias depois das telas principais.
