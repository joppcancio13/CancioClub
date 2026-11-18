# Cancio Club — alterações (nov 2026)

Desde a v51 (14/nov) existe **um lugar só**: este repositório, branch `main`.
- **Código-fonte:** `src/` (React com `React.createElement`, sem JSX de verdade, apesar da extensão `.jsx`).
- **Gerar o site:** `npm install` e depois `npm run build` → a pasta `dist/` é o que vai pro Netlify.
- **Edge Function do aluno:** `supabase/functions/student/` (como publicar: `supabase/LEIA-ME.txt`).
- Pastas antigas fora do Git (`cancio-club-site/`, `cancio-club-deploy/`, zips): só referência, não edite nem suba.

As seções até a v45 abaixo foram escritas quando o site era editado já pronto: os nomes `.jsx` nelas
correspondem a `src/`, e as instruções "arraste a pasta" valem hoje para o `dist/`.

## Marca
- Login com a assinatura horizontal: silhueta + CANCIO / CLUB. "Digite o código" virou rótulo colado nas caixas; erro em laranja.
- Selo novo (anel CANCIO CLUB / TREINOS · PROGRESSÃO + silhueta), gerado no app como PNG transparente 2160 px, em prata ou preto.
- Ícone do app continua a bola 3D.
  Arquivos: `App.jsx`, `components/share/LogoCard.jsx`, `public/selo-silhueta*.png`

## Cards de compartilhar (PNG 1080×1920)
- Entram todos os exercícios do dia, inclusive os não feitos (pastilhas apagadas). Sem carga mostra séries×reps.
- Tudo dentro da área livre dos stories (topo 250 px / base 280 px vazios).
- Card: lista em 1 ou 2 colunas. Números: sem exercícios, com TEMPO, SÉRIES, LEVANTADOS. Pastilhas: cresce de baixo pra cima.
- Singular/plural corrigido.
  Arquivo: `components/share/ShareStudio.jsx`

## Carteirinha e número de membro
- Carteirinha: frente crachá (selo, nome, nº, desde, treinos do mês), verso cartão prata. Só pra mostrar.
- Número por ordem de entrada. João Pedro Cancio = 0000, Ana Bia = 0001. O professor numera ao abrir o app.
  Arquivos: `components/student/MemberCard.jsx`, `utils/members.js`, `App.jsx`

## Perfil do aluno (novo)
- Abre tocando no nome ou na foto no topo do treino.
- Topo: foto, nº de membro, desde, nome grande, treinos / maior sequência / recordes, botões Carteirinha e Selo.
- Blocos: Frequência do mês, Recordes, Evolução (gráfico por exercício), Metas, Corpo (medidas e reavaliação), Conquistas (12).
- Lista: Meu professor (abre recados), Minha anamnese (só leitura), Contato, Notificações, Meus dados, Sair.
- Aluno edita foto, WhatsApp, e-mail e metas de carga.
- Se já treinou hoje, o app abre no perfil com a faixa "TREINO DE HOJE FEITO · Ver e compartilhar".
  Arquivos: `components/student/StudentProfile.jsx`, `App.jsx`

## Treino
- "DESCANSO" cabe dentro do anel do cronômetro. (`components/student/ExerciseCard.jsx`)
- Topo do treino: só "Trocar treino" como botão; Carteirinha, Selo, Meus dados e Sair foram pro perfil.

## Atualização automática
- O app procura versão nova sempre que abre ou volta pra tela e recarrega sozinho uma vez. Cache v41.
  Arquivos: `main.jsx`, `sw.js`

## Depois de subir
1. Abra como professor uma vez (numera os alunos).
2. No celular, feche o app e abra de novo.
3. Conferir: compartilhar card (iPhone e Android), carteirinha, perfil, abrir o app depois de já ter treinado.

Supabase: nada mudou. (Naquela época o site pronto carregava React/Supabase/gráficos do esm.sh; o `dist/` do build já traz tudo junto.)

## Correções (v42)
- Tela preta ao abrir depois da atualização: agora, se uma tela quebrar, aparece a mensagem de erro e um botão "Recarregar".
- Número de membro, metas, contato: não somem mais quando o app sincroniza com a nuvem.
- Numeração dos alunos roda uma vez por abertura, só depois de o professor entrar.

## Pente fino (v44)
**Texto**
- Português do Brasil: "Compartilhar treino" (era "Partilhar Treino"), "Imagem salva na galeria", "Compartilhe".
- Sentence case: "Finalizar treino", "Concluir exercício", "Salvar recuperação", "Modo edição", "Modo aula", "Gerar resumo da semana", "Recuperação ativa", "Cancelar", "Restaurar".
- "Selecione…" com reticências; exclamação removida.
**Leitura e toque**
- 25 textos em cinza #5A6273 (3,3:1) subiram para #7D8698 (5,3:1).
- Nenhum texto abaixo de 11px; tamanhos fora da escala encaixados em 11/13/15/18/24.
- 8 botões que tinham 34–40px agora têm 44px.
- 7 botões só de símbolo (×, ‹, +, ↑) ganharam descrição para leitor de tela.
**Consistência**
- Cores quase iguais unificadas (fios, fundos, pratas) e cinzas da paleta antiga trocados.
- Raios fora do padrão encaixados em 10/16/24.
- 26 números grandes agora com algarismos de largura fixa (não tremem no cronômetro e nas cargas).
**Comportamento**
- "Remover aluno", "Apagar aluno" e "Restaurar backup" usam confirmação no visual do app (botão laranja), não a caixa do navegador. Avisos de backup também.
  Arquivo novo: `utils/confirm.js`
- Cache v44.

## v45 — correção urgente
- **A v44 quebrava a tela de treino do aluno** ("br is not defined" no card de exercício). Corrigido. Se você subiu a v44, suba a v45 já.
- Cargas com vírgula decimal em todo o card (12,5 kg; +7,5 kg).
- Aviso de restrição no card fechado virou um selo curto ("● ombro"); o texto completo aparece ao abrir o exercício.
- Pastilhas do card fechado maiores (28×14).
- Cache v45.

## v46
- Card aberto: séries vêm primeiro; data/anotação, "Concluir exercício", vídeo e histórico ficam embaixo.
- Topo do treino: aviso de reavaliação só aparece quando não há recado novo do professor (um aviso por vez).
- Cache v46.

## v47
- Entrada do dia: botão "Começar treino" branco chapado (sem degradê), 52px.
- Série: "alvo" aparece uma vez só (no cabeçalho); embaixo fica só "REPS".
- Carga vazia mostra a carga da última vez apagada ("40 kg") em vez de "—", e "última vez" com vírgula decimal.
- Cache v47.

## v48
- Entrada do dia: "Fechar" com maiúscula, 15px, área de toque maior.
- Card fechado: sem o ponto branco no canto e sem o botão "Pular exercício". "Pular" aparece só com o card aberto.
- Frases de apoio com maiúscula e ponto final ("Registre ao menos 1 série…", "Cada série é salva sozinha…").
- Cache v48.

## v49
- **Correção importante:** a tela de compartilhar não derruba mais o app quando a imagem da silhueta não carrega (internet fraca na academia). Antes aparecia "Algo deu errado nesta tela".
- Título do treino no topo não vaza mais da tela com nomes longos ("SUPERIORES" cortava): diminui e quebra linha.
- "Finalizar treino", "Pular descanso" e a aba ativa do professor: branco chapado, sem degradê metálico (mesmo padrão do resto).
- Cache v49.

## v50
- Anamnese, Volume e cronômetro de descanso no mesmo padrão: botões brancos chapados, sem degradê; prata no lugar do tom antigo; rótulos com maiúscula inicial.
- Cache v50.

## v51 — correções de perda de dados
- **Numeração de membros** só roda depois que a lista de alunos chega da nuvem. Antes, com a sessão do professor já salva, ela rodava com a lista antiga do aparelho e enviava essa ficha velha pra nuvem, apagando treinos e check-ins registrados depois. (`App.js`)
- **Login do professor** não descarta mais check-ins, sessões, cardio, recuperação e recados que o aluno registrou no celular dele. A nuvem é a base, e o que só existe no aparelho é somado (`mergeLocalActivityInto` em `utils/merge.js`). Antes, um horário geral do aparelho decidia quem "ganhava".
- **"Finalizar" logo depois de digitar a carga** agora salva a última série. A proteção existia, mas lia a linha ainda vazia e não salvava nada. (`components/student/ExerciseCard.js`)
- **Tela de esforço** mostrava "NaN s" na duração. Corrigido. (`App.js`)
- Plano de séries carimbado com `planAt` sempre que muda (aluno ou professor), pra Edge Function saber qual é o mais novo. (`components/student/ExerciseCard.js`)
- **Edge Function `student` nova** (pasta `supabase/functions/student/`, publicar à parte no Supabase): o `sync` mescla em vez de gravar por cima, e o `login` não manda mais o alerta clínico pro aluno.
- Cache v51.

## v52 — bugs 5 a 8
- **Restaurar fase arquivada** pede confirmação e guarda a ficha atual como fase "Antes de restaurar…", pra dar pra desfazer. **Apagar fase** (o "×") também pede confirmação. (`App.jsx`)
- **Correção de carga não é mais desfeita:** cada série grava a hora (`at`) e, nas mesclas, vale a edição mais nova. Antes valia sempre a maior carga. Dia antigo (formato achatado) não fica mais com a série duplicada, e a nota do aluno no exercício não some mais na mescla. (`App.jsx`, `utils/merge.js`, Edge Function `merge.js`)
- **Mês e semana no fuso do aparelho:** Salva-Vidas, frequência do mês no perfil, evolução de 8 semanas e semana do volume usavam UTC e viravam o mês às 21h do último dia. (`App.jsx`, `StudentProfile.jsx`, `EvolutionSummary.jsx`, `utils/volumeCalculator.js`)
- **Restaurar backup** apaga da nuvem os alunos que não estão no backup (a confirmação mostra quantos). Antes eles voltavam no próximo login do professor. (`App.jsx`)
- Cache v52.

## v53 — design v3, fases 1 e 2 (aluno)
- **Tela de treino nova** (`components/student/WorkoutV3.jsx`): lista corrida, exercício aberto com nota do professor e ALVO / ÚLTIMA / DESCANSO; registro só na barra de baixo; "Feito" vira descanso; corrigir série; recado com contexto da série; pular exercício.
- **Tela Hoje** (`components/student/HojeV3.jsx`) e **abas** Hoje / Treino / Recados / Perfil (`components/student/TabBarV3.jsx`). Recados ganhou aba própria; Diário fica em Hoje. Abas somem com o treino em andamento e voltam ao rolar pra cima.
- Tokens v3 em `styles/tokens.js`. Decisões em `design/v3/DECISOES.md`.
- Saíram da tela do aluno: anotação por exercício, gráfico no exercício, troca por alternativa, editar séries do plano, vídeo embutido (virou link).
- Professor: sem mudança. Cache v53.

## v54 — design v3, fase 3 (fim do treino e compartilhar)
- **Tela Fim do treino** (`components/student/FimV3.jsx`): resumo primeiro (tempo, séries válidas, kg levantados, recordes do dia) e "Como foi o treino de hoje?". "Compartilhar treino" salva e abre os cards; "Fechar" salva e volta pra Hoje; "Voltar ao treino" não salva. Substitui, pro aluno, a janela de esforço e a comemoração.
- **Compartilhar** (`components/share/ShareStudio.jsx`): abas Card / Números / Pastilhas e deslizar entre elas; o que não foi feito fica fora do card por padrão ("Mostrar o que ficou de fora"); foto só nos cards transparentes; baixar como ícone.
- Registro do dia com séries ganha do registro antigo na mesma data (`utils/workout.js · dayEntry`): o card podia sair com "0 séries" e o recorde do dia não aparecer.
- Cache v54.

## v55 — design v3, fases 4a e 4b (professor)
- **Início "Alunos"** (`components/professor/AlunosV3.jsx`): "Na pista" com anel de progresso (atualiza a cada 30 s com a tela aberta), "Precisa de atenção" em lista com a ação na linha (Responder, Chamar, Revisar, Ver), "Treinam hoje" e "Outros". Tela **Ao vivo** com o treino que o aluno está fazendo agora.
- **Ficha em página única** (`components/professor/FichaV3.jsx`): Aula hoje + Modo aula, semana, resumo do rendimento, volume planejado e ficha do dia com prescrito × feito (no alvo, abaixo, no teto, X de Y, não fez). Telas completas com "‹ Resumo"; o botão do cabeçalho virou "Dados".
- **Volume pela ativação** (`utils/volumeCalculator.js`): cada série soma a ativação do exercício em cada grupo (11 grupos, uma casa decimal); eretores da espinha fora. Na edição, bloco "Séries na semana" com a mudança desde que abriu. Na tela Volume, barras no lugar das pastilhas.
- Cache v55.

## v56 — design v3, fase 4c (professor)
- **Recados** (`components/professor/ProfInbox.jsx`): contador de não lidos, lista por aluno e conversa no mesmo padrão de balões do aluno, com os treinos do aluno na linha do tempo, respostas rápidas e "Abrir ficha".
- **Rendimento** (`components/professor/RendimentoV3.jsx`, `utils/rendimento.js`): resumo de volume, frequência e recordes, e a evolução por exercício.
- **Modo aula** (`components/professor/AulaV3.jsx`): registro guiado com notas de técnica rápidas.
- **Biblioteca** (`components/professor/BibliotecaV3.jsx`): a aba "Modelos" virou "Biblioteca", com Modelos (aplicar escolhendo aluno e dia, editar, apagar) e Exercícios (busca que cria, quantas fichas usam). Saiu do "Mais".
- **Dados do aluno** (`components/professor/DadosV3.jsx`): resumo de leitura com o alerta clínico privado no topo e gavetas com escolhas prontas; pedido de exclusão (LGPD) só quando o aluno pede. Substitui o FichaEditor.
- Cache v56.

## v57 — Editar ficha e notas de técnica
- **Gavetas no Editar ficha** (`components/professor/ExerciseSheet.jsx`): "+ Adicionar exercício" abre busca + grupos, com a biblioteca (prescrição da última vez) e o catálogo; "+ Pôr" entra direto e já conta no volume. "Criar do zero" abre o formulário antigo. Cada exercício ganhou "Trocar": alternativas de mesmo padrão e mesmo grupo com a mudança de volume da semana; séries, reps e descanso ficam. O exercício trocado ou tirado com registros vai pras fases arquivadas.
- **Notas de técnica pro aluno** (`components/student/WorkoutV3.jsx`): o exercício aberto mostra as notas da última aula ("Na aula de 12 nov · Técnica").
- **Mescla** (`utils/merge.js` e Edge Function `student` v7): as notas de técnica não somem mais ao juntar os dados e a cópia do aluno nunca sobrescreve a do professor.
- Cache v57.

## v58 — arrumação do professor e diário no Perfil
- **Recados**: o professor puxa conversa com qualquer aluno ("+ Nova conversa"; o "Chamar" do aluno sumido não abria nada). A conversa ficou só com recados — saíram os eventos "Treino feito", dos dois lados.
- **Alunos** (`components/professor/AlunosV3.jsx`): busca no topo, "Precisa de atenção" com no máx. 3 (e "Ver todos") e uma lista só, A–Z, com filtros Todos · Treinam hoje · Atenção.
- **Ficha do aluno** (`components/professor/FichaV3.jsx`): Recado, Editar ficha e Dados no topo; Semana primeiro, cada dia abre o prescrito × feito com "Editar este dia" e Modo aula. Saem a fileira de atalhos e a seção "Ficha de …".
- **Editar ficha** (`components/professor/DayToolsV3.jsx`): dias em abas; "Trocar treino" (aplicar modelo, copiar ou trocar com outro dia, cardio, salvar como modelo, baixar a série, limpar); "Trocar" visível em cada exercício; volume da semana recolhido no fim.
- **Diário do aluno**: saiu da tela Hoje e virou um bloco do Perfil.
- Cache v58.

## v59 — design v4, fases 1 a 3
- **Rótulos e toque (55a):** rótulos pequenos em 11 px #AEB7C6 (antes cinza escuro); alvos de toque de 44 px.
- **Desfazer (33b):** depois de cada ação grande do professor (Trocar treino, trocar/tirar exercício, modelos e biblioteca), a pílula das abas vira "Desfazer" por 8 s.
- **Estados (55a):** vazio, carregando (blocos, sem rodinha) e erro com "Tentar de novo" no mesmo padrão.
- **Salvamento no treino (35b):** cada série mostra ✓ / enviando / só no aparelho; "Sem internet. N séries salvam quando voltar." Saiu o selo "Salvo neste aparelho".
- **Treino (36b, 45c):** PULAR série (não conta no volume), evolução da carga com minigráfico e "Ver execução" com o vídeo dentro do exercício.
- **Hoje (43a, 39, 44b):** Trocar o treino do dia; recuperação marcada no card com "Fechar o dia · N de 3"; fundo com reflexos em losango.
- **Login (46a):** "Esqueci o código" abre o pedido pronto no WhatsApp.
- **Cardio (39b):** dia de cardio com plano do professor (atividade, alvo, esforço, nota), cronômetro e registro (minutos, km, esforço).
- Detalhes e decisões em `design/v4/DECISOES.md`. Cache v59.

## v60 — design v4, fases 4 e 5 (professor)
- **Demonstração (32b):** Mais › Ver demonstração mostra alunos fictícios pra testar ou mostrar o app; nada é salvo e "Sair" volta aos dados reais.
- **Alunos (51a, 49a, 53a):** vista Semana (grade aluno × dia); Selecionar alunos e Aplicar modelo ou Copiar ficha em lote; reavaliação vencida em "Precisa de atenção" com Feita hoje e Adiar 1 semana.
- **Ficha (52a, 37a):** card Aula hoje, "Essa semana", Rendimento numa linha e volume feito × prescrito nos 11 grupos.
- **Editar ficha (54a, 42b, 40b):** Trocar treino com 5 opções e menu ⋯ (modelo, PDF, série, nova fase); linhas que se arrastam pra reordenar; exercício em página própria (Prescrição e Histórico, Duplicar, Tirar); criar do zero em dois passos com parecidos do catálogo.
- **Modo aula** também em dia de cardio e de descanso.
- Detalhes em `design/v4/DECISOES.md`. Cache v60.

## v61 — design v4, fases 6 e 7
- **Modelos (41d):** editor com Para quem (Iniciante / Intermediário / Avançado), aviso de quantos alunos usam e tempo estimado; "+ Novo modelo" começa de um dia de um aluno, de outro modelo ou em branco.
- **Fases (38b):** linha do tempo em Dados do aluno, com Arquivar e começar nova fase, Restaurar e Apagar (com Desfazer).
- **Respostas rápidas (50c):** editáveis em Mais, em dois grupos; a conversa mostra o grupo certo pro último recado.
- **Mais** reorganizado, com Sair da conta separado.
- **Resumo da semana (47b):** tela e card pra compartilhar; aviso "Sua semana fechou" no Hoje aos domingos e entrada no Perfil.
- **Recado fixado:** o combinado do professor no topo da conversa, dos dois lados.
- Detalhes em `design/v4/DECISOES.md`. Cache v61.

## v62 — design v4, fase 8 (avisos no celular)
- **Avisos (34a):** Mais › Avisos (professor) e Perfil › Avisos (aluno), com um interruptor por tipo, hora do lembrete, silêncio (padrão 22:00–07:00), aviso de teste e desligar.
- **Professor recebe:** "Sentiu dor" (toca mesmo no silêncio), recado novo, terminou o treino e reavaliação vencida (08:00).
- **Aluno recebe:** o professor respondeu, sua ficha mudou, lembrete do treino (07:30 por padrão) e resumo de domingo (18:00).
- Tocar no aviso abre o lugar certo. No iPhone, só com o app na tela inicial (iOS 16.4+).
- Servidor: função `push`, tabela `push_subscriptions` e agendamento a cada 15 min no Supabase (ver `supabase/LEIA-ME.txt`). Precisa do segredo VAPID_PRIVATE_KEY.
- Cache v62.

## v63 — correções
- **Exercício tirado voltava:** com dois aparelhos (ou a atualização de 30 s no meio do caminho), uma cópia antiga devolvia o exercício. Agora cada aluno guarda a marca de "tirado" (`removedEx`) e todas as mesclas respeitam; o Desfazer continua trazendo de volta. Atualize o app em todos os aparelhos do professor.
- **Tempo do treino:** saindo e voltando pro app, o tempo contava só do retorno. Agora o início guardado é lido ao abrir e a duração conta no mínimo desde a primeira série do dia.
- **Barra de registro:** não cobre mais os últimos exercícios; ao rolar pra baixo vira uma linha (série + Feito); as abas só voltam com a tela no topo durante o treino, então a barra não sobe e desce.
- **Login:** cabe em celular baixo (tamanhos acompanham a altura da tela).
- Cache v63.

## v64 — ajustes pedidos pelo professor (18/nov)
- **Dados do aluno:** objetivo longo ("Força/Condicionamento") não passa mais por cima do card ao lado; quebra dentro do card.
- **Conversa (professor e aluno):** a caixa de escrever fica sempre embaixo, logo acima das abas, com 1 ou 100 recados, e a conversa abre no recado mais novo. "Fixar um combinado" vazio virou um atalho de uma linha.
- **Fotos:** a foto do aluno aparece nos Recados (lista, conversa, nova conversa) e na lista de Alunos. O professor põe a dele em Mais › Pôr sua foto; o aluno vê no topo dos Recados e nos balões do professor. A foto vai na linha de cada aluno (é por ela que chega no celular dele).
- **Precisa de atenção:** mostra 2 (antes 3) e cada aviso tem × (Ignorar), com Desfazer. O aviso some até a situação mudar (recado novo, treino novo, outra reavaliação). Pedido de exclusão (LGPD) não se ignora.
- **Alunos:** filtros (Todos · Hoje · Atenção) numa linha própria, ocupando a largura; Lista / Semana passou pra linha do título da lista.
- **Biblioteca › Exercícios:** agora é o catálogo do cálculo de volume, por grupo muscular, com o que está em uso primeiro. Cada exercício mostra quanto conta no volume por grupo e aceita vídeo. Os criados por você são ligados ao catálogo (com sugestão pelo nome); "Sem vínculo" lista os que não contam. Aviso com os exercícios das fichas que não contam no volume e "Ligar pela sugestão" (com Desfazer).
- **Evolução (aluno):** lista de exercícios com carga atual, quanto mudou e minigráfico; o detalhe tem eixo em kg, pontos e recordes, Carga × Volume, 1 mês / 3 meses / Tudo e a lista de treinos. Conta só séries válidas (sem aquecimento, reconhecimento e puladas).
- **Corpo (aluno):** fotos primeiro — Antes × Agora por pose (frente, lado, costas), "+ Fotos de hoje" (não conta como reavaliação), medidas e histórico com as fotos; toque amplia. A reavaliação aceita 3 fotos. O professor vê todas em Dados › Reavaliações.
- **Correção:** ao atualizar da nuvem, o aparelho do professor perdia campos do aluno que não estavam numa lista fixa (combinado fixado, adiar reavaliação, exercícios tirados). Agora vem tudo.
- Função `push` (opcional publicar de novo): entrada só de fotos não adia o aviso de reavaliação vencida.
- Cache v64.
