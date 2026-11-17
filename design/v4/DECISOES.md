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
