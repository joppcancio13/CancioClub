# Atualização — logo, cards e carteirinha

## O que mudou
- **Login**: assinatura horizontal (silhueta + CANCIO / CLUB). A mensagem ("Digite o código…" / erro) agora fica colada nas caixas do código; o erro aparece em laranja.
- **Cards de compartilhar** (`src/components/share/ShareStudio.jsx`), sempre PNG 1080×1920:
  - entram **todos os exercícios do dia**, inclusive os não feitos (pastilhas apagadas);
  - exercício sem carga mostra séries×reps;
  - tudo dentro da área livre dos stories (topo 250 px e base 280 px ficam vazios);
  - Card: lista em 1 ou 2 colunas conforme o tamanho do treino;
  - Números: sem exercícios, centralizado, título reduz pra caber em 1 linha;
  - Pastilhas: cresce de baixo pra cima, sem limite de 8 exercícios;
  - singular/plural (1 série, 1 recorde).
- **Carteirinha** (`src/components/student/MemberCard.jsx`): botão "Carteirinha ›" na área do aluno. Frente = crachá (selo, nome, nº, desde, treinos do mês). Verso = cartão prata. Só pra mostrar.
- **Número de membro** (`src/utils/members.js`): ordem de entrada pela data de início da ficha. João Pedro Cancio = 0000, Ana Bia = 0001 (pelo nome exato). Quem não tem número recebe na próxima vez que o professor abrir o app, e o número vai pra ficha do aluno na nuvem. "Membro desde" usa a data de início da ficha.
- Cache do service worker: v38. O app agora procura versão nova sempre que é aberto e recarrega sozinho uma vez quando acha.

## Como publicar
1. `npm install` (se ainda não fez) e `npm run build`.
2. Suba o conteúdo de `dist/` na raiz do site, substituindo os arquivos.
3. Abra o app **como professor** uma vez, pra numerar os alunos.
4. Nada mudou no Supabase.

## Se continuar mostrando a versão antiga
- Confira se subiu o conteúdo de `cancio-club-projeto/dist/` (gerado agora pelo `npm run build`), e não a pasta `cancio-club-deploy/`.
- No Netlify, veja se o deploy mais recente está como "Published".
- No celular, feche o app de vez e abra de novo. Se ainda não trocar: Ajustes do navegador → limpar dados do site, ou remova o app da tela inicial e adicione de novo.

## Conferir no celular
- Compartilhar card no iPhone e no Android (abre a folha do sistema com o PNG).
- Carteirinha: nome longo no cartão prata (corta com "…").
- Números de membro do João Pedro (0000) e da Ana Bia (0001).
