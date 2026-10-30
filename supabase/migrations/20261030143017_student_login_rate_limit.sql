-- Rate limiting pro login/sync de aluno (código de 4 dígitos) na Edge Function `student`:
-- depois de 5 tentativas com código não encontrado vindas do mesmo IP numa janela de 15
-- minutos, a função passa a responder 429 pra esse IP até a janela expirar. Um código
-- encontrado (tentativa certa) limpa o histórico de falhas daquele IP.
--
-- Só a service role (usada pela Edge Function, nunca exposta ao navegador) enxerga essa
-- tabela — RLS fechada pra anon/authenticated, mesmo modelo de segurança da tabela `cancio`.

create table if not exists public.student_login_rate_limits (
  ip text primary key,
  fail_count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_login_rate_limits enable row level security;

-- incrementa (ou reabre a janela em 1, se a anterior já expirou) de forma atômica — um único
-- UPSERT evita condição de corrida entre tentativas simultâneas do mesmo IP
create or replace function public.cancio_record_login_failure(p_ip text, p_window_ms bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_login_rate_limits (ip, fail_count, window_start, updated_at)
  values (p_ip, 1, now(), now())
  on conflict (ip) do update set
    fail_count = case
      when public.student_login_rate_limits.window_start < now() - make_interval(secs => p_window_ms / 1000.0)
        then 1
      else public.student_login_rate_limits.fail_count + 1
    end,
    window_start = case
      when public.student_login_rate_limits.window_start < now() - make_interval(secs => p_window_ms / 1000.0)
        then now()
      else public.student_login_rate_limits.window_start
    end,
    updated_at = now();
end;
$$;
