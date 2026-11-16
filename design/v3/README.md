# Handoff: Cancio Club v3 (app da aluna + app do professor)

Repositório alvo: `joppcancio13/CancioClub` (branch `main`).

## Visão geral
Redesenho do Cancio Club, app fechado de treino de academia. A aluna entra com um código de 4 dígitos, vê o treino do dia, registra séries, descansa com cronômetro, termina e compartilha o resultado em cards para Instagram. O professor acompanha alunos ao vivo, monta e ajusta fichas usando a biblioteca e o catálogo de exercícios (com cálculo de volume por grupo muscular), vê rendimento e conversa por recados.

## Sobre os arquivos
Os arquivos `.dc.html` deste pacote são **referências de design feitas em HTML**: protótipos que mostram aparência e comportamento, **não código de produção para copiar**. A tarefa é **recriar estas telas no ambiente existente do repositório** (React + os componentes em `src/components/...`), seguindo os padrões e bibliotecas que o projeto já usa. Para abrir um protótipo, sirva a pasta por HTTP (ex.: `npx serve .`) e abra o arquivo no navegador; `support.js` é só o runtime dos protótipos.

## Fidelidade
**Alta fidelidade.** Cores, tipografia, espaçamentos, raios e interações são finais. Recriar pixel a pixel. Dados (alunos, cargas, recados, catálogo parcial) são de exemplo.

## Design tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| bg | `#05060A` | fundo das telas |
| panel | `#0E1015` | cards, gavetas, barra do treino |
| raised | `#171B22` | item dentro de painel, trilho de barras, fundo fora do celular |
| pending | `#1A1D24` | pastilha não feita |
| line | `#1E222A` | divisórias |
| border | `#2A2E37` | borda de campo, fio da pastilha não feita |
| outline | `#2E333D` | contorno de botão secundário/chip |
| dim | `#3A404C` | separador "·", inativo, **pastilha de aquecimento** |
| text | `#F2F5FA` | principal, botão claro |
| text-2 | `#C6D2E4` | corpo em painel, links, ícones ativos |
| text-3 | `#AEB7C6` | apoio, plano, metadados |
| text-4 | `#7D8698` | kickers, rótulos, feito/pulado, **pastilha de reconhecimento** |
| accent | `#E8794B` | **só** alerta: restrição, alerta clínico privado, erro de código, "senti dor". Contorno de alerta: `rgba(232,121,75,.35)` |
| silver | `linear-gradient(135deg,#FFFFFF,#AEB9CB 55%,#6E7889)` | conquista: série válida feita, código digitado |
| progress | `linear-gradient(90deg,#6E7889,#AEB9CB 55%,#FFFFFF)` | barra de progresso do treino |
| overlay | `rgba(5,6,10,.55)`–`.6` | véu atrás de gaveta |

### Pastilhas (uma por série; o tom sobe com o esforço)
- Aquecimento feito: `#3A404C` chapado
- Reconhecimento feito: `#7D8698` chapado
- Válida feita: gradiente `silver`
- Não feita: `#1A1D24` + `box-shadow: inset 0 0 0 1px #2A2E37`
- Tamanhos: lista 12×12 raio 3, gap 3 · código de acesso 48×20 raio 5, gap 12. Mesmo tamanho para todos os tipos; nunca contorno extra no aquecimento.

### Tipografia — Archivo variável (`wght 100..900`, `wdth 62.5..125`)
| Papel | Tamanho / peso / largura | Extras |
|---|---|---|
| Display | 36 / 900 / 125% | line-height 1, CAIXA ALTA |
| Título de tela | 24–30 / 900 / 125% | CAIXA ALTA |
| Título de overlay | 18 / 900 / 125% | CAIXA ALTA |
| Exercício aberto | 20 / 800 / 110% | |
| Exercício na lista | 16 / 700 / 110% | |
| Números grandes (resumo) | 30–40 / 900 / 75% | tabular-nums |
| Números de apoio (carga, reps, tempo) | 15 / 600 / 75% | tabular-nums, cor `#AEB7C6` |
| Kicker | 11 / 800 / 125% | letter-spacing 0.14em, CAIXA ALTA |
| Rótulo de coluna (ALVO, ÚLTIMA…) | 10 / 800 / 125% | letter-spacing 0.1em |
| Corpo | 15 / 400 / 100% | line-height 1.45 |
| Texto de apoio | 13 / 400 / 100% | |

Regra das linhas mistas: em textos como "da última vez: 3×12 · 1:00 · vídeo", só o dado (com ×, :, vírgula, kg, min) vai para 15/600/75%; o resto fica 13/400. Número solto dentro de frase ("em 4 fichas") fica no texto normal. Valores de ativação sempre com uma casa ("1,0", "0,6"). Vírgula decimal sempre.

### Forma e espaço
- Raios: 5 (pastilha do código) · 10 (campo, botão secundário, nota fixada) · 16 (botão principal, painel) · 24 (card do Hoje, gaveta só no topo `24px 24px 0 0`) · 999 (chip, filtro, aviso)
- Margem lateral 20; dentro de painel/gaveta 12–16. Gaps usados: 2, 6, 8, 12, 14, 18, 28.
- Alvo de toque ≥ 44; botão principal 52 de altura; linha de lista ≥ 48.
- **Sem sombra projetada.** Hierarquia por tom de superfície e fios de 1px internos (`box-shadow: inset`).
- Divisória de lista: 1px `#1E222A` que some nos últimos 48px (`linear-gradient(to right,#1E222A,#1E222A calc(100% - 48px),transparent)`).

### Ícones
Phosphor 2.1.1. Regular por padrão; Bold só no ✓ e dentro do botão principal; Fill na aba ativa e na nota fixada.

## Componentes base
- **Botão principal**: h52, raio 16, fundo `#F2F5FA`, texto `#05060A` 15/800. No máximo um por tela.
- **Botão secundário**: h44, raio 10, `inset 0 0 0 1px #2E333D`, texto `#C6D2E4` 13/600.
- **Ação terciária**: só texto 13/600 `#AEB7C6` (ou `#7D8698`), min-height 36.
- **Chip/escolha**: min-h 36, raio 999, contorno `#2E333D`; selecionado = fundo `#F2F5FA`, texto `#05060A` 700. Escolhas prontas (3x/4x/5x, 45/60/75 min) no lugar de campo livre sempre que possível.
- **Linha de lista**: sem card; índice 2 dígitos (13/700 `#7D8698`) que vira ✓ quando feito; nome 16/700/110%; plano em números de apoio; pastilhas à direita; restrição como "● ombro D" 13/700 `#E8794B`.
- **Colunas de números**: grid 3 colunas, rótulo de coluna em cima, valor 15/700 embaixo.
- **Gaveta**: fundo `#0E1015`, raio 24 só no topo, padding 18/16/26, véu `rgba(5,6,10,.55)`, título em kicker `#C6D2E4` + "Fechar" 15 `#7D8698`.
- **Aviso privado**: raio 16, contorno laranja .35, ícone cadeado, kicker "ALERTA · SÓ VOCÊ VÊ".
- **Toast**: pílula `#171B22`, 13, ícone ✓, some em ~2 s.
- **Barra de abas**: pílula flutuante (decisão 14c) com Hoje / Treino / Recados / Perfil.

## Telas — app da aluna (`Cancio Club App v3.dc.html`)
Frame 390×844. Tweak `telaInicial` abre direto em qualquer tela; `semInternet` simula offline.
1. **Login** (`DayEntryScreen`/index): selo 150px, "CANCIO / CLUB", teclado numérico 3×4 (teclas h60 raio 16, dígitos 28/700), 4 pastilhas do código. Erro: pastilhas e mensagem em laranja, "Código não encontrado. Confira com o professor." Botão "Professor" no teclado leva ao app do professor.
2. **Hoje**: saudação + nome 30/900/125%, semana e sequência, card raio 24 `#0E1015` com kicker, título do treino 36, colunas (exercícios/séries/tempo), lista dos exercícios, recorde e próximo treino. 4 estados (8a–8d): treino do dia, já feito, descanso ("Recovery ativado…" + "Treinar mesmo assim"), sem ficha. CTA "Começar treino" fixo acima das abas.
3. **Treino** (`ExerciseCard`, `RestTimer`): lista corrida (3a); exercício aberto mostra nota técnica fixada, colunas ALVO / ÚLTIMA / DESCANSO e as séries (AQ, RC, 1, 2…). Registro tudo na barra de baixo (4b); ao marcar "Feito" a barra vira cronômetro de descanso (5a) com "Pular descanso". Topo encolhe ao rolar (21c) para nome + barra de progresso prata 3px. "Recado sobre esta série" abre gaveta com respostas rápidas e manda para Recados com o contexto "Exercício · Série · carga × reps". Aviso "Sem internet · salvando no celular".
4. **Fim do treino**: resumo primeiro (6a) — tempo, séries, recorde — depois os cards de compartilhar.
5. **Compartilhar** (`ShareStudio`, `ShareCard`): deslizar entre 3 cards (22b) — Card (fundo preto), Números e Pastilhas (PNG transparente sobre foto). Saída 1080×1920 com topo/base livres. Faixa "Números e Pastilhas vão sobre a sua foto · Escolher foto". Botão ícone baixar + "Compartilhar". Exercícios/séries não feitos ficam **fora** do card por padrão; chave "Mostrar o que ficou de fora" desligada (24c).
6. **Recados** (`StudentMessages`): cabeçalho do professor, nota fixada, balões (professor `#0E1015` à esquerda, aluna `#F2F5FA` à direita, raio 16 com canto 4), faixa de contexto da série em `#DCE4F0` sobre o balão, respostas rápidas "Senti dor / Carga leve demais / Faltei".
7. **Perfil** (`StudentProfile`): ordem de importância (9a); acesso à Carteirinha e ao Selo.
8. **Carteirinha** (`MemberCard`): um cartão que vira em 3D ao tocar (12b).
9. **Selo**: selo para baixar em versão Prata ou Preto.

## Telas — app do professor (`Cancio Club Professor v3.dc.html`)
Tweak `telaInicial` abre em: alunos, ficha, editar, rendimento, aula, recados, biblioteca, dados.
1. **Alunos** (16b): "Precisa de atenção" no topo, "Na pista" em faixa com anel de progresso, hoje e demais alunos.
2. **Ao vivo**: série por série do treino que a aluna está fazendo, com pastilhas e legenda (Aquecimento / Reconhecimento / Válida).
3. **Ficha** (17b, página única): semana, exercícios com status prescrito × feito na própria linha (27b, abre detalhe série a série), menu ⋯ (Dados e anamnese, Editar ficha…).
4. **Editar ficha** (28a+28b+28c): bloco "SÉRIES NA SEMANA" com os 11 grupos (Costas, Peitoral, Ombros, Bíceps, Tríceps, Quadríceps, Isquiotibiais, Glúteos, Adutores, Panturrilha, Abdômen) em 2 colunas, barras 4px; grupos trabalhados pela ficha acesos, os outros apagados; delta ao lado (+3, −0,6). **Sem alvo de volume.** "Adicionar exercício" abre gaveta com filtro por grupo + busca: primeiro "NA SUA BIBLIOTECA" (séries/reps/descanso/vídeo da última vez), depois "DO CATÁLOGO" (3 músculos com maior ativação). "Trocar" lista primeiro o mesmo padrão de movimento, depois o mesmo grupo, mostrando a mudança de volume; "Tirar da ficha" no fim. Séries, reps e descanso se mantêm na troca; histórico do antigo continua.
   - Cálculo usado no protótipo: para cada exercício, ativação do grupo = **maior** valor de ativação entre os músculos daquele grupo (`exerciseCatalog.js`); volume do grupo = Σ ativação × séries, somando todas as fichas da semana. Eretores da espinha não entram em nenhum grupo. Regra confirmada pelo professor: é a mesma do app.
5. **Rendimento** (18a → 18b): por dia de treino; tocar no exercício abre gráfico com escala, carga inicial no primeiro ponto e melhor série acima do último ponto.
6. **Modo aula** (20b): passada no topo + observações técnicas; mostra carga e reps da sessão passada.
7. **Recados** e **Conversa**: caixa de entrada com não lidos; conversa no mesmo padrão de balões do app da aluna.
8. **Biblioteca** (25b): abas Modelos (primeiro) e Exercícios; busca que permite criar exercício novo.
9. **Dados do aluno** (26c): resumo de leitura com alerta clínico privado fixo no topo; tocar num bloco abre gaveta com escolhas prontas; exclusão (LGPD) só aparece quando a aluna pede.

## Interações e estado
- Navegação por pilha (`push`/`back`) + abas. Overlays (carteirinha, selo, gavetas) por cima com véu; toque no véu fecha.
- Transições: largura das barras e cor das pastilhas com `transition .15s–.3s`; sem animações longas.
- Estado principal (aluna): `screen`, `overlay`, `code`/`codeErr`, exercícios com séries `{kind: warmup|recon|working, load, reps, done}`, exercício aberto, cronômetro de descanso, `finished`, recados, rascunho, card de compartilhar escolhido, foto, chave "mostrar o que ficou de fora".
- Estado principal (professor): aluno atual, ficha em edição `[{id, name, sets, reps, rest}]`, gaveta ativa (`add`/`swap`), filtro/busca, recados não lidos, dados do aluno.
- Offline: recados e séries ficam "salvo neste aparelho" até sincronizar.

## Escrita
Tom do professor no salão: curto, direto, "você". Números com vírgula decimal, "×" entre carga e reps, tempo em m:ss, datas curtas ("sáb · 14 nov"). Caixa alta só em títulos largos e kickers.

## Assets
- `public/selo-silhueta.png` — selo da marca (do repositório). Inteiro no login (150px) e nos cards; como marca d'água no canto superior direito com opacidade .22 no app e .09 nos cards.
- Fonte Archivo (Google Fonts) e ícones Phosphor 2.1.1 via CDN.

## Arquivos
- `Cancio Club App v3.dc.html` — protótipo da aluna
- `Cancio Club Professor v3.dc.html` — protótipo do professor
- `Cancio Club Sistema Visual.dc.html` — documento do sistema visual (tokens e componentes)
- `support.js` — runtime dos protótipos (não usar em produção)
- `public/selo-silhueta.png`

### Mapa tela → arquivo do repositório
| Tela | Arquivos |
|---|---|
| Login | `index.html`, `ALTERACOES.md` (Marca) |
| Hoje | `src/components/student/DayEntryScreen.jsx`, `src/styles/tokens.js` |
| Treino + descanso | `src/components/student/ExerciseCard.jsx`, `src/components/student/RestTimer.jsx` |
| Compartilhar | `src/components/share/ShareStudio.jsx`, `src/components/share/ShareCard.jsx` |
| Perfil | `src/components/student/StudentProfile.jsx` |
| Recados | `src/components/student/StudentMessages.jsx` |
| Carteirinha | `src/components/student/MemberCard.jsx` |
| Prof · Dados do aluno | `src/components/professor/FichaEditor.jsx` |
| Prof · Prescrito × feito | `src/components/professor/PlanVsDone.jsx` |
| Prof · Montar ficha | `src/data/exerciseCatalog.js`, `src/components/professor/BulkLinkSheet.jsx`, `src/components/professor/LibItem.jsx` |
| Prof · Biblioteca | `src/components/professor/LibraryManager.jsx`, `src/components/professor/TemplateCard.jsx`, `src/components/professor/TemplateBuilder.jsx` |

Comece atualizando `src/styles/tokens.js` com os tokens acima; depois as telas na ordem Treino → Hoje → Compartilhar → Professor.
