-- Avisos no celular (design v4 · 34a): uma linha por aparelho inscrito.
-- Só a Edge Function `push` (service role) lê e grava; anon/authenticated não têm acesso.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_kind text not null check (owner_kind in ('prof', 'student')),
  owner_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  prefs jsonb not null default '{}'::jsonb,
  tz text not null default 'America/Sao_Paulo',
  last_sent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_owner_idx on public.push_subscriptions (owner_kind, owner_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

-- agendamento (lembrete 07:30, reavaliação 08:00, resumo de domingo 18:00)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- segredo do agendamento: gerado aqui dentro, nunca sai do banco a não ser pra própria função `push`
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'push_cron_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'push_cron_secret', 'Confere que a chamada agendada para a função push veio do pg_cron');
  end if;
end $$;

create or replace function public.push_cron_secret()
returns text
language sql
security definer
set search_path = ''
as $$ select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret' limit 1 $$;
revoke all on function public.push_cron_secret() from public, anon, authenticated;
grant execute on function public.push_cron_secret() to service_role;
