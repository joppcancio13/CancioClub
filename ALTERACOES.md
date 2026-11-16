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
