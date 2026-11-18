-- Avisos com hora marcada (design v4 · 34a): a cada 15 min o pg_cron chama a função push, que decide
-- o que mandar (lembrete do treino, reavaliação vencida, resumo de domingo). A anon key é pública;
-- quem autoriza a chamada é o segredo do Vault (push_cron_secret), conferido dentro da função.
select cron.unschedule('push-a-cada-15-min') where exists (select 1 from cron.job where jobname = 'push-a-cada-15-min');
select cron.schedule(
  'push-a-cada-15-min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://xyeydcgohqylaytpeabk.supabase.co/functions/v1/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZXlkY2dvaHF5bGF5dHBlYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDU1NzksImV4cCI6MjA5ODc4MTU3OX0.s4hwY7FNr6Nbmxv_mPFMAdDbz6XXNkWgkDSZqrYhdRk',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret')
    ),
    body := '{"action":"cron"}'::jsonb
  );
  $$
);
