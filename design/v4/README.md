# Handoff: Cancio Club v4 (rodada sobre a v58)

Repositório alvo: `joppcancio13/CancioClub` (branch `main`).

O handoff v3 (`design/v3/README.md`) e as decisões de `design/v3/DECISOES.md` **continuam valendo**. Este README lista só o que a v4 muda ou acrescenta. Onde a v4 muda uma decisão antiga, isso está escrito.

## Sobre os arquivos
Os `.dc.html` são **referências de design em HTML**: mostram aparência e comportamento e **não são código de produção**. Recriar as telas no React do repositório, com os componentes e padrões que ele já usa. Para abrir, sirva a pasta por HTTP (`npx serve .`). `support.js` é só o runtime dos protótipos.

| Arquivo | O que é |
|---|---|
| `Cancio Club App v4.dc.html` | protótipo do aluno (390×844) |
| `Cancio Club Professor v4.dc.html` | protótipo do professor (390×844) |
| `Cancio Club Decisoes v4.dc.html` | quadro com todas as opções desenhadas e a escolhida de cada item (ids 32a–55c) |
| `Cancio Club Sistema Visual.dc.html` | tokens e componentes |
| `public/selo-silhueta.png` | selo da marca |

**Fidelidade alta.** Os dados são de exemplo. Os protótipos simplificam algumas coisas para caber na demonstração, e cada simplificação está marcada com ⚠ neste README. No app de verdade, o comportamento é o descrito no texto, não o do protótipo.

### Tweaks para abrir cada estado
- **Aluno**:
  - `telaInicial`: login, hoje, treino, cardio, recados, perfil, semana.
  - `diaDeDescanso`: liga o dia de descanso.
  - `semInternet`: simula o treino sem conexão.
  - `domingo`: mostra o aviso do resumo da semana no Hoje.
- **Professor**:
  - `telaInicial`: alunos, ficha, editar, rendimento, aula, recados, biblioteca, dados, exercicio, criar, modelo.
  - `estado`: cheio, carregando, vazio ou erro (aplicado na tela Rendimento).

---

## O que mudou nos tokens
- **Rótulos pequenos (55a):** todo kicker e rótulo de coluna passa a ser **11 px / 800 / #AEB7C6**, com contraste de 10:1 sobre o preto. Isso muda o v3:
  - **Rótulos de coluna:** eram 10 px em `#7D8698`.
  - **Kicker:** era `#7D8698`.
  - **#7D8698:** fica só para estado inativo ou feito e para a pastilha de reconhecimento. Nunca mais em texto que precisa ser lido.
- **Rótulo de coluna em grade de 3 (ALVO / ÚLTIMA / DESCANSO, EXERCÍCIOS / SÉRIES / TEMPO):**
  - **Estilo:** 11 / 800 / **110%**, letter-spacing 0.06em, `white-space: nowrap`. Na largura 125%, "EXERCÍCIOS" encostava em "SÉRIES".
  - **Kickers soltos:** continuam em 125% / 0.14em.
- **Texto de apoio de 13 px:** sempre `#AEB7C6`.
- **Alvo de toque:** ≥ 44 px em tudo, incluindo filtros, chips e ações dentro de linha. No treino, os botões principais têm 56 px.

Tokens que **não** mudaram: cores de superfície, accent laranja só para alerta, gradiente prata, tipografia Archivo, raios, ausência de sombra projetada e ícones Phosphor.

---

## Padrões que valem para o app todo

### Desfazer (33b)
- **Onde:** depois de cada ação grande, a **pílula das abas vira o Desfazer**. Ela mostra um anel com os segundos que faltam, o texto do que mudou e o botão "Desfazer".
- **Duração:** **8 s**. Depois disso, a pílula volta a ser as abas.
- **Trocar de tela:** fecha o Desfazer na hora, e a mudança fica.
- **Telas sem abas:** em Editar ficha, Criar e Modelo, a pílula flutua acima do botão de rodapé.
- **Ações que usam o padrão:**
  - Trocar treino, nas cinco opções.
  - Trocar exercício.
  - Tirar da ficha.
  - Duplicar exercício.
  - Aplicar ou copiar em lote.
  - Reavaliação Feita hoje e Adiar.
  - Arquivar, Restaurar e Apagar fase.
- **Textos de exemplo:** "Remada saiu da ficha", "Sábado virou Inferiores A", "Sábado ficou vazio", "3 fichas mudaram", "Próxima em 10/fev".

### Avisos no celular (34a): um aviso por acontecimento, cada tipo com seu interruptor
| Lado | Aviso | Quando | Ao tocar, abre |
|---|---|---|---|
| Professor | **Sentiu dor**: "Lia sentiu dor agora · Agachamento, série 2: 'joelho direito incomodou'" | na hora | o recado na série |
| Professor | **Recado novo**: "Davi · Posso trocar o leg press hoje?" | na hora | a conversa |
| Professor | **Terminou o treino**: "Nina terminou o treino · Superiores · 5 de 5 · 52 min · 1 recorde" | na hora | o rendimento do dia |
| Professor | **Reavaliação vencida** | 08:00 do dia | os dados do aluno |
| Aluno | **O professor respondeu** | na hora | o recado |
| Aluno | **Sua ficha mudou** | na hora | o Treino, no dia que mudou |
| Aluno | **Lembrete do treino** | nos dias com treino, no horário escolhido (padrão 07:30) | o Hoje |

- **Onde se liga:** Professor › Mais › Avisos; Aluno › Perfil › Avisos.
- **Horário de silêncio:** configurável, padrão **22:00–07:00**. No professor, "Sentiu dor" **toca mesmo no silêncio**.
- **Fora da v4:** os avisos "X dias sem treinar" e "começou o treino". O professor não os escolheu.

### Estados: um padrão para todas as telas (55a)
- **Carregando:** blocos `#11141A`, raio 8, no formato do conteúdo. **Nada de spinner.** O título da tela continua visível.
- **Vazio:** título 20/800/110% que diz o que vai aparecer ali, uma frase de apoio 15 `#AEB7C6` e um botão secundário com o próximo passo. Ex.: "Nenhum treino ainda · Quando a Lia registrar a primeira série, o rendimento aparece aqui · Abrir ficha".
- **Erro:** mesmo layout, com "Não deu para carregar · Sem internet ou o servidor não respondeu. O que você já viu continua salvo." e o botão claro "Tentar de novo".
- **Vazios já desenhados nas telas:**
  - Lista de Alunos: busca sem resultado, ninguém hoje, ninguém em atenção.
  - Editar ficha: dia vazio, descanso e cardio.
  - Modelo em branco.
  - Conversa sem recados.
- ⚠ Os três estados estão montados só em Rendimento, pelo tweak `estado`. As outras telas aplicam o mesmo padrão.
- **Caso cheio:** a lista de Alunos rola com abas flutuantes e a grade Semana corta o nome com reticências. As listas de exercício não têm limite.

### Salvamento no treino (35b)
- **Indicador por série:** ✓ quando salvou e círculo girando enquanto salva (~1 s). Sem internet, aparece a nuvem cortada em laranja.
- **Sem internet:** aparece uma linha na barra de registro, por exemplo "Sem internet. 2 séries salvam quando voltar."
- **Sem conexão em todos os casos:** a série nunca se perde. Ela fica no aparelho até sincronizar.
- **Muda o v3:** o selo "Salvo neste aparelho" no topo saiu.

---

## Aluno: o que mudou
1. **Login: Esqueci o código (46a).**
   - **Onde:** o link "Esqueci o código" fica fixo sob as pastilhas, com 44 px de altura.
   - **O que faz:** abre a gaveta "Pedir o código ao professor", com a mensagem pronta e editável. "Abrir WhatsApp" leva ao WhatsApp do professor.
2. **Hoje:**
   - **Fundo (44b):** só reflexos prata em losango, espalhados e com opacidade baixa. O disco ou selo grande saiu do fundo.
   - **Trocar (43a):** o botão "Trocar" (120×56, contorno) fica ao lado de "Começar treino", só no estado de treino do dia. A gaveta "Treinar outro dia" lista os dias da ficha com o estado de cada um, por exemplo "feito ter 12/nov" ou "ainda não fez essa semana". Ao escolher, o título muda no Hoje e no Treino, e o professor fica sabendo.
   - **Recuperação (39):** em dia de descanso, o card mostra "Dia de descanso ativo. Marque o que fez." e a lista de itens, uma linha de 60 px por item, marcada com um toque. O botão vira "Fechar o dia · 2 de 3", e o dia fecha mesmo sem todos os itens. **Muda o v3:** "Recovery ativado…" e "Treinar mesmo assim" saíram.
   - **Domingo (47b):** o aviso "Sua semana fechou · 4 de 5 treinos e 2 recordes. Veja o resumo." aparece no Hoje e abre o Resumo da semana.
3. **Treino:**
   - **Pular série (36b):**
     - **Botão:** "PULAR" fica na linha de cima da barra de registro, à direita.
     - **Série pulada:** aparece riscada, com "pulada" e um traço no lugar do ✓. A pastilha fica no tom de pendente.
     - **Conta:** a série **não conta no volume** e não bloqueia o fim do exercício.
   - **Evolução (45c):** frase com minigráfico sob as colunas, por exemplo "**+5 kg** desde outubro, em 6 treinos".
   - **Vídeo (45c):**
     - **Abrir:** o botão "Ver execução · 6 s" abre a prévia dentro do exercício, em loop e sem som.
     - **Recolher:** o vídeo **recolhe sozinho ao registrar a série**.
   - **Salvamento:** padrão descrito acima.
4. **Cardio (39b):** é um dia da ficha (QUA · Cardio na gaveta Trocar), e o botão vira "Começar cardio".
   - **Tela:** nome, ALVO / ÚLTIMA / ESFORÇO e a nota do professor.
   - **Cronômetro:** a barra vira um cronômetro grande, como o descanso, enche até o alvo e tem pausar e **Terminar**.
   - **Registro:** depois aparecem o tempo já preenchido, km opcional, esforço (Leve / Moderado / Forte) e **Feito**. Quem usa o relógio da esteira toca Terminar e vai direto para o registro.
5. **Resumo da semana (47b):** tela cheia.
   - **Conteúdo:** "SEMANA 11–17 NOV", "4 DE 5 TREINOS", a grade dos 7 dias (feito em prata), os recordes, as séries contra a semana anterior e o grupo mais treinado.
   - **Ações:** Fechar e **Compartilhar**, que gera o card no formato de Compartilhar, 1080×1920.
   - **Onde abre:** pelo aviso de domingo e por Perfil › Resumo da semana.
6. **Perfil:**
   - **Novo:** "Resumo da semana" fica no topo do primeiro grupo.
   - **Avisos:** "Notificações · Meus dados" virou duas linhas, **Avisos** (interruptores e horários) e **Meus dados**.

## Professor: o que mudou
1. **Demonstração (32b):** "Ver demonstração" fica em **Mais**.
   - **Uso:** alunos fictícios. O professor entra sem sair da conta.
   - **Selo:** uma pílula prata "Demonstração · nada é salvo" com o botão **Sair** flutua sobre as abas em **todas as telas**. Sair volta ao Mais com os dados reais.
   - **Aluno:** não tem modo demonstração (decisão do professor).
2. **Alunos (v58 + 53a, 48b, 49a, 51a):**
   - **Topo:** busca com +, depois "TREINANDO AGORA · N" em faixa de pílulas com anel de progresso, que atualiza a cada 30 s.
   - **Precisa de atenção:** a reavaliação vencida tem **duas ações na linha**, "Feita hoje" (mostra a próxima data no Desfazer) e "Adiar 1 semana".
   - **Lista:** filtros Todos / Hoje / Atenção (44 px, com contagem) e o seletor **Lista | Semana**.
   - **Semana (51a):** grade aluno × dia com quatro estados de célula: feito (prata), treinando (branco com halo), faltou (traço prata em `#171B22`) e ainda vai (contorno). Contagem à direita e legenda embaixo. **É uma vista da lista e não substitui a lista.**
   - **Lote (49a):** "Selecionar" no topo liga as caixas nas linhas. Com alguém marcado, a barra das abas dá lugar a **Aplicar modelo** e **Copiar ficha de…**. A gaveta mostra "Entra como: Novo dia | Substitui [dia]" e termina com o Desfazer.
3. **Ficha (52a, ordem da v58):**
   - **Topo:** kicker com fase e semana, nome, e os três blocos **Recado · Editar ficha · Dados** (48 px, com ícone).
   - **Aula e semana:** depois vêm o card "Aula hoje? · Modo aula" e "ESSA SEMANA · 3 DE 4". Cada dia mostra a pastilha de estado e abre o **prescrito → feito** por exercício, com status em `#C6D2E4` (no alvo / feito) ou laranja (abaixo / pulou).
   - **Rendimento:** "Rendimento · 8 semanas" é uma linha que abre a tela.
   - **Volume (37a):** "Volume · 12–18 nov" mostra **o feito em barra prata sobre o prescrito em contorno** para os 11 grupos, com "feito / prescrito" em números. Logo acima fica o aviso "3 exercícios fora da conta · Vincular".
   - **Muda o v3:** saíram os chips de seção (Semana / Rendimento / Volume / Ficha) e o menu ⋯.
4. **Editar ficha (54a):**
   - **Topo:** kicker "ALUNA · EDITAR FICHA" com ⋯, depois os **7 dias em abas** com o número de exercícios de cada um (· em descanso, C em cardio), depois o nome do dia em 26/900 e o botão **Trocar treino**.
   - **Trocar treino:** a gaveta tem ícone por opção:
     - Aplicar um modelo
     - Copiar de outro dia
     - Trocar com outro dia
     - Marcar como dia de cardio
     - **Limpar o dia**
     Todas têm Desfazer de 8 s, e o histórico dos exercícios fica guardado.
   - **Menu ⋯:** Salvar como modelo · Baixar PDF da ficha · Arquivar e começar nova fase.
   - **Volume:** o bloco de volume ao vivo (28a) e a gaveta de adicionar e trocar (28b/28c) seguem iguais.
   - ⚠ No protótipo, só o sábado abre a lista. **No app, todo dia de treino abre a lista para editar**, e os dias de descanso mostram o vazio com Trocar treino.
5. **Exercício aberto (42b):** tocar na linha do Editar ficha abre uma página própria.
   - **Topo:** "SÁB · 02 DE 06", o nome e as ativações por grupo.
   - **Abas Prescrição | Histórico:**
     - **Prescrição:** tabela SÉRIE / REPS / CARGA / DESC. Tocar no tipo alterna Aquec. → Reconh. → Válida (descanso de 1:00 nos dois primeiros). Embaixo ficam + Série / − Série e a Observação.
     - **Histórico:** carga da série válida, "+5 kg desde outubro", gráfico e as sessões.
   - **Ações no pé:** Trocar exercício · Vídeo · Duplicar · Tirar da ficha (em laranja).
   - **Muda o v3:** o subir e descer do cartão antigo sai daqui. Reordenar fica para arrastar na lista.
6. **Criar exercício do zero (40b):** entra por Adicionar › **Criar do zero**, em dois passos.
   - **Passo 1:** o nome, com "NO CATÁLOGO, PARECIDOS" sugeridos enquanto o professor digita. Escolher um já vincula o exercício ao volume. "Nenhum desses" deixa fora do volume até vincular. Continuar só fica ativo com nome e escolha.
   - **Passo 2:** "Conta como [catálogo]" ou "Fora do volume", prescrição em steppers (séries, reps, descanso de 15 em 15 s), observação e link de vídeo. O botão final é "Adicionar ao [dia]".
7. **Editor de modelo (41d):**
   - **Como nasce:** de três jeitos. Pela ficha (⋯ › Salvar como modelo, gaveta com nome e Para quem; as cargas do aluno não vão junto) e pela Biblioteca › + Novo modelo, que começa de "Um dia da ficha de um aluno", "Outro modelo" ou "Página em branco".
   - **Tela:** nome, **Para quem** (Iniciante / Intermediário / Avançado), o aviso "Aplicado em N alunos. Mudar aqui não muda as fichas deles.", a lista com o tempo estimado e Salvar modelo.
8. **Fases arquivadas (38b):** linha do tempo em Dados do aluno.
   - **Fase atual:** fica no topo, com ponto cheio e "Arquivar e começar nova fase".
   - **Fase antiga:** tocar abre Restaurar e Apagar só para ela.
   - **Muda o v3:** "Arquivar semana" vira "Arquivar e começar nova fase".
9. **Respostas rápidas (50c):** ficam em Mais › Respostas rápidas, em dois jogos.
   - **Os dois jogos:** "Quando o recado é sobre uma série" (carga e técnica) e "Recado geral".
   - **Editar:** cada resposta se reordena arrastando e se edita pelo lápis. "Nova resposta" pede o grupo.
   - **Na conversa:** aparece o jogo certo para o contexto do último recado.
10. **Mais:** Avisos · Respostas rápidas · Ver demonstração, e "Sair da conta" separado.

⚠ **Não está no protótipo e precisa ser feito:** **cardio e recuperação no Modo aula.** Usam a mesma barra de baixo do Modo aula. O professor registra pelo aluno o cronômetro e o "como foi" do cardio (39b) ou marca os itens da recuperação. Nada muda no layout.

---

## O que não mudou
- Login com pastilhas que acendem (13c), carteirinha que vira (12b), selo, abas em pílula (14c).
- Fim do treino com resumo primeiro (6a) e Compartilhar com três cards (22b/24c).
- Recados dos dois lados (11a/11b), com o combinado fixado e o recado ligado à série. Os eventos "Treino feito" saíram do chat na v58 e continuam fora.
- Ao vivo, Rendimento por dia com gráfico ao tocar (18a/18b), Modo aula (20b), Biblioteca com Modelos primeiro (25b), Dados do aluno em gaveta (26c) com o alerta clínico só para o professor.
- Pastilhas em escada de tons (29a), nome do exercício em 16/700/110% (31b).
- **Volume por músculo:**
  - **Ativação:** cada série soma a ativação do exercício no grupo, pelo **maior valor entre os músculos do grupo** (`exerciseCatalog.js`).
  - **Formato:** uma casa decimal com vírgula, e os eretores ficam fora.
  - **Grupos:** os mesmos 11 em todo lugar.
  - **Séries puladas:** não contam.
- **Abas do aluno:** somem com o treino em andamento e voltam ao finalizar ou ao rolar para cima.
- **Descanso:** séries válidas usam o descanso do exercício; aquecimento e reconhecimento usam 1:00.

## Itens que dependem de dado novo (entram nesta rodada)
O professor pediu que entrem. O design já existe nos protótipos, e falta o back-end:
- **Recado fixado:** um campo `pinned` por conversa, editável pelo professor.
- **Cards com foto:** upload ou escolha de foto local no Compartilhar. Os cards Números e Pastilhas saem como PNG transparente sobre a foto.
- **Card 3D:** carteirinha que vira. O desenho está pronto, e falta o dado da carteirinha (número, desde quando, plano).
- **Resumo da semana:** agregados semanais (treinos contra a meta, recordes, séries contra a semana anterior, grupo mais treinado) e o envio do aviso de domingo às 18:00.
- **Avisos:** push na PWA, uma preferência por tipo e o horário de silêncio por usuário.
- **Salvamento:** fila local das séries com estado `saving | saved | pending`.

## Mapa tela → arquivo do repositório
| Tela | Arquivos |
|---|---|
| Rótulos e tokens | `src/styles/tokens.js` |
| Login · Esqueci o código | `index.html` |
| Hoje · Trocar · Recuperação · Domingo | `src/components/student/DayEntryScreen.jsx` |
| Treino · Pular · Salvo · Evolução · Vídeo | `src/components/student/ExerciseCard.jsx`, `src/components/student/RestTimer.jsx` |
| Cardio | novo `src/components/student/CardioCard.jsx` (barra como `RestTimer`) |
| Resumo da semana | novo `src/components/student/WeekSummary.jsx` + `src/components/share/ShareCard.jsx` |
| Perfil · Avisos | `src/components/student/StudentProfile.jsx` |
| Prof · Alunos · Semana · Lote | `src/components/professor/AlunosV3.jsx` |
| Prof · Ficha · Volume feito | `src/components/professor/PlanVsDone.jsx`, `src/components/professor/BulkLinkSheet.jsx` |
| Prof · Editar ficha · Trocar treino · Exercício aberto · Criar | `src/components/professor/DayToolsV3.jsx`, `src/components/professor/FichaEditor.jsx`, `src/components/professor/LibItem.jsx`, `src/data/exerciseCatalog.js` |
| Prof · Modelos | `src/components/professor/TemplateBuilder.jsx`, `src/components/professor/TemplateCard.jsx`, `src/components/professor/LibraryManager.jsx` |
| Prof · Fases · Dados | `src/components/professor/FichaEditor.jsx` |
| Desfazer · Demonstração | barra de abas do professor (componente novo `UndoPill`, `DemoPill`) |

**Ordem sugerida:**
1. `tokens.js` (rótulos 55a).
2. Os três padrões globais: Desfazer, estados e salvamento.
3. Treino (Pular, Salvo, Vídeo, Evolução).
4. Hoje e Cardio.
5. Ficha e Editar ficha do professor.
6. Telas migradas: Exercício aberto, Criar, Modelo, Fases, Volume feito.
7. Avisos e Resumo da semana (dependem do back-end).
