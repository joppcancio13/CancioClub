# Próximos passos

## Notificações push (servidor)
O app já pede permissão, mostra o número no ícone e o service worker trata `push` e o toque na notificação.
Falta o envio do servidor, pra avisar com o app fechado:
1. Gerar chaves VAPID (`npx web-push generate-vapid-keys`) e guardar como secrets no Supabase.
2. Tabela `push_subscriptions (user_id, role, endpoint, keys, created_at)` com RLS.
3. No cliente: `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` e salvar a assinatura.
4. Edge function que, ao gravar um recado, manda o push pro destinatário.

## LGPD
- Texto de consentimento, "Meus dados" e pedido de exclusão estão no app. Revisar a redação com um advogado e publicar uma política de privacidade com nome do responsável e contato.
- O pedido de exclusão aparece pro professor como alerta "LGPD" e na ficha do aluno, com o botão "Apagar aluno e dados". A lei pede resposta em até 15 dias.
- Conferir se o servidor apaga a linha do aluno na nuvem quando ele é removido.

## Testar no celular
- Chips de série e calendário com fonte mínima de 11 px e botões de 44 px.
- Imprimir/PDF da ficha no iPhone (PWA) e no Android.
- Troca de exercício autorizada: escolher uma alternativa, registrar séries e voltar ao original.
