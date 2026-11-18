# Cancio Club v4 — decisões de implementação (17/nov/2026)

O handoff v4 (`README.md` desta pasta) vale como especificação, com as notas abaixo por cima.
O v3 (`design/v3/README.md` e `design/v3/DECISOES.md`) continua valendo onde a v4 não muda nada.

## O mapa "tela → arquivo" do README está desatualizado
Ele foi escrito sobre arquivos que a v55–v58 já trocou. Vale o que existe hoje:

| Tela | Arquivo de verdade |
|---|---|
| Login · Esqueci o código | `src/App.jsx` (tela de código do aluno) |
| Hoje | `src/components/student/HojeV3.jsx` |
| Treino | `src/components/student/WorkoutV3.jsx` |
| Perfil | `src/components/student/StudentProfile.jsx` |
| Prof · Alunos | `src/components/professor/AlunosV3.jsx` |
| Prof · Ficha | `src/components/professor/FichaV3.jsx` |
| Prof · Editar ficha · Trocar treino | `src/components/professor/DayToolsV3.jsx`, `ExerciseSheet.jsx` e o trecho de edição em `src/App.jsx` |
| Prof · Biblioteca · Modelos | `src/components/professor/BibliotecaV3.jsx`, `TemplateBuilder.jsx` |
| Prof · Dados · Fases | `src/components/professor/DadosV3.jsx` e o trecho de fases em `src/App.jsx` |
| Desfazer | `src/components/shared/UndoPill.jsx` |
| Estados | `src/components/shared/PremiumEmptyState.jsx` (vazio e erro), `SkeletonCard.jsx` (carregando) |

`FichaEditor`, `LibItem`, `TemplateCard`, `LibraryManager` e `DayEntryScreen` (como Hoje) não são mais usados.

## Fases de implementação
1. Rótulos (55a), Desfazer (33b), estados (55a) e salvamento no treino (35b).
2. Treino do aluno: pular série, evolução, vídeo.
3. Hoje: Trocar, recuperação, Esqueci o código, cardio como tela.
4. Professor 1: demonstração, Semana, lote, reavaliação vencida.
5. Professor 2: ficha com volume feito × prescrito, Editar ficha com ⋯, exercício em página própria, criar do zero.
6. Professor 3: editor de modelo, fases em linha do tempo, respostas rápidas, Mais.
7. Resumo da semana, recado fixado, cards com foto.
8. Avisos no celular (precisa de servidor: inscrição por aparelho, envio e horários).

## Notas da fase 1
- **Rótulos:** `KICKER` e `COL_LABEL` em `src/styles/tokens.js`; as telas v3 usam esses dois. Texto de apoio de 11–13 px que estava em `text4` (#7D8698) passou para `text3` (#AEB7C6). Alvos de toque abaixo de 44 px nas telas v3 subiram para 44.
- **Desfazer:** guarda o estado de antes e, ao desfazer, devolve só o que a ação mexeu (o aluno afetado, ou modelos e biblioteca), para não apagar o que chegou da nuvem nesses 8 s. Cobre: as cinco opções de Trocar treino, trocar exercício, tirar da ficha, remover exercício, aplicar modelo pela Biblioteca, apagar modelo e tirar exercício da biblioteca. Duplicar, lote, reavaliação e fases entram junto com as telas delas (fases 4–6).
- **Estados:** o vazio e o erro seguem o padrão novo em todas as telas que usam `PremiumEmptyState`. O erro está ligado na lista de Alunos (quando a busca na nuvem falha e não há nada para mostrar).
- **Salvamento:** cada série feita mostra ✓ (chegou na nuvem), girando (enviando; também nos primeiros 4 s depois do toque, porque o envio sai com um pequeno atraso) ou a nuvem cortada em laranja (só no aparelho). Com séries pendentes, a barra de registro mostra "Sem internet. N séries salvam quando voltar." O selo "Salvo neste aparelho" do topo saiu.
- **Limite conhecido:** o "girando/salvo" é por envio da ficha inteira, não por série: quando um envio termina, todas as séries feitas até o começo dele viram ✓.

## Notas da fase 2
- **Pular série (36b):** a série pulada vai numa lista à parte no dia do histórico (`skipped`, ids das séries), fora de `entries`. Assim volume, recordes, cards e rendimento continuam contando só o que foi feito, sem mexer em cada cálculo. A mescla do aparelho soma os pulos dos dois lados; a Edge Function já guarda o que o aluno manda (sem nova versão).
- **Evolução (45c):** carga da série válida (a mesma do "ÚLTIMA") nas sessões antes de hoje: diferença entre a primeira e a última, o mês da primeira e quantos treinos. Só aparece com 2 ou mais sessões.
- **Vídeo (45c):** "Ver execução" abre a prévia dentro do exercício e recolhe ao registrar a série. YouTube abre embutido, mudo e em loop (sem a duração "6 s", que o link não informa); mp4/webm em loop sem som; gif/imagem como imagem; outros links abrem fora do app.

## Notas da fase 3 (parte 1: Hoje e login)
- **Trocar (43a):** o botão "Trocar" fica ao lado de "Começar treino" só antes de começar. A escolha vale para hoje (guardada no aparelho) e muda o título no Hoje e no Treino. "O professor fica sabendo" pelo próprio treino: a lista de Alunos, o Ao vivo e a sessão registram o dia da ficha que foi feito. Não há recado automático.
- **Recuperação (39):** usa os 3 itens que o app já guarda por dia (hidratação, sono, mobilidade), não itens prescritos pelo professor como no protótipo. "Fechar o dia · N de 3" fecha mesmo sem todos. Saiu "Treinar mesmo assim".
- **Fundo (44b):** reflexos prata em losango; o selo grande saiu.
- **Esqueci o código (46a):** "Abrir WhatsApp" usa o link do WhatsApp sem número (o aluno escolhe a conversa do professor), porque o app não tem o número do professor guardado num lugar que o aluno sem login possa ler. Dá para fixar o número depois.
- **Domingo (47b):** fica para a fase 7, junto com o Resumo da semana.

## Notas da fase 3 (parte 2: cardio)
- **Dia de cardio (39b):** o dia marcado como cardio na ficha passa a guardar o plano `{ activity, target, effort, note }` (antes era só `true`; `true` continua valendo, sem plano). O professor preenche atividade, alvo em minutos, esforço e nota no Editar ficha, logo abaixo do nome do dia.
- **Tela do aluno:** "Começar cardio" no Hoje já liga o cronômetro; o cronômetro fica guardado no aparelho se a página recarregar. "Terminar" vai para o registro (minutos já preenchidos, km opcional, Leve / Moderado / Forte). Quem usou o relógio da esteira toca "Já fiz" e vai direto ao registro (o protótipo fazia isso pelo Terminar).
- **Feito:** grava no `cardioLog` (com km e esforço) e fecha o dia, com o esforço convertido para a escala do treino (Leve → Fácil, Moderado → Na medida, Forte → Destruidor). Volta para o Hoje.
- **Cardio no Modo aula:** fica para a fase 5, junto com as telas do professor.

## Notas da fase 4
- **Demonstração (32b):** "Ver demonstração" no Mais troca os dados por 6 alunos fictícios montados na hora (`src/utils/demoData.js`: treinando agora, feito hoje, recado sem resposta, sumido, reavaliação vencida, normal). Os dados reais ficam guardados na memória e voltam no "Sair". Os fictícios são `isSeed`: nunca vão para o aparelho nem para a nuvem, e a busca na nuvem (inclusive a de 30 s) fica parada. Sair do professor também sai da demonstração.
- **Semana (51a):** vista da lista (Lista | Semana), não substitui a lista. Feito = sessão na data; treinando = na pista hoje; faltou = dia de treino que já passou sem sessão; ainda vai = dia de treino de hoje em diante. Contagem feitos/planejados à direita.
- **Lote (49a):** "Selecionar" liga as caixas; com alguém marcado, uma barra com "Aplicar modelo" e "Copiar ficha de…" cobre as abas. "Novo dia" põe o modelo no primeiro dia vazio de cada ficha; "Substitui [dia]" troca o dia escolhido. "Copiar ficha" troca a ficha inteira (sem cargas nem histórico), com nomes dos dias e cardio. O que sai com registros vai pras fases arquivadas; Desfazer "N fichas mudaram".
- **Reavaliação vencida (53a):** entra em "Precisa de atenção" quando passa da data (N semanas depois da última avaliação). "Feita hoje" grava `reassessDoneAt`; "Adiar 1 semana" grava `reassessSnoozeUntil`; os dois mostram "Próxima em …" no Desfazer. O Desfazer agora também devolve o cadastro do aluno.

## Notas da fase 5 (parte 1)
- **Ficha (52a, 37a):** card "Aula hoje? · Modo aula" no topo, "Essa semana · N de M", Rendimento numa linha que abre a tela e o Volume com o feito na semana (barra prata) sobre o prescrito (contorno) nos 11 grupos, "feito / prescrito" e o aviso "N exercícios fora da conta · Vincular" logo acima. O "feito" é o mesmo cálculo da tela Volume feito (séries registradas na semana, pela ativação).
- **Editar ficha (54a):** "Trocar treino" fica com as 5 opções (modelo, copiar, trocar com outro dia, cardio, limpar). O ⋯ ao lado reúne Salvar como modelo · Baixar PDF da ficha · Baixar a série (imagem, que o app já tinha) · Arquivar e começar nova fase (guarda a ficha de agora como fase, com Desfazer). Nome do dia maior.
- **Criar do zero (40b):** substitui o formulário antigo. Passo 1 com parecidos do catálogo e "Nenhum desses"; passo 2 com steppers, observação e link do vídeo.

## Notas da fase 5 (parte 2)
- **Lista do Editar ficha:** linhas compactas (número, nome, prescrição, "Trocar"). Tocar abre o exercício; reordenar é arrastando pela alça à esquerda (com teclado: seta pra cima/baixo na alça). O cartão antigo continua só no Modo aula.
- **Exercício aberto (42b):** página própria com "SEG · 01 DE 04", nome (toque para renomear), ativações por grupo (toque para trocar o vínculo com o catálogo), abas Prescrição | Histórico. Prescrição: tocar no tipo alterna Aquec. → Reconh. → Válida, reps editáveis, carga sugerida (a da última sessão), descanso das válidas em passos de 15 s, + Série / − Série, observação. Histórico: carga da série válida, ganho desde o início, gráfico e as sessões (com apagar registro). Pé: Trocar · Vídeo (link) · Duplicar · Tirar, com Desfazer em Duplicar e Tirar.
- **Modo aula em dia sem musculação:** o card "Aula hoje?" aparece também em dia de cardio e de descanso. No cardio, o professor usa o mesmo cronômetro e registro do aluno; no descanso, marca a recuperação e fecha o dia.

## Notas da fase 6
- **Editor de modelo (41d):** nome, Para quem (Iniciante / Intermediário / Avançado, guardado em `level`), o aviso "Aplicado em N alunos. Mudar aqui não muda as fichas deles." (contado pelo nome do dia, como o "em uso" da Biblioteca), a lista com tempo estimado e Salvar modelo. Adicionar usa a mesma gaveta do Editar ficha e o Criar do zero. Reordenar no modelo é com ↑ ↓. "+ Novo modelo" começa de um dia da ficha de um aluno, de outro modelo ou da página em branco — nos dois primeiros, sem cargas nem histórico. O ⋯ › Salvar como modelo da ficha ganhou o Para quem. Sai o TemplateBuilder antigo.
- **Fases (38b):** linha do tempo em Dados do aluno: "Fase atual" no topo (desde a última fase guardada ou o início da ficha) com "Arquivar e começar nova fase"; tocar numa fase antiga abre Restaurar e Apagar. As três ações têm Desfazer e não pedem mais confirmação (Restaurar continua guardando a ficha de antes como fase).
- **Respostas rápidas (50c):** guardadas na linha global (`quickReplies`, dois jogos). Mais › Respostas rápidas edita, apaga, cria (no grupo escolhido) e reordena com ↑ ↓ (o protótipo arrasta). Na conversa entra o jogo "série" quando o último recado do aluno veio de uma série, senão o "geral".
- **Mais:** Respostas rápidas · Ver demonstração; Selo e Backup; "Sair da conta" separado. Os Avisos entram na fase 8.
