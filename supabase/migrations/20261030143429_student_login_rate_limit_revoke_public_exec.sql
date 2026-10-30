-- cancio_record_login_failure só deve ser chamada pela Edge Function (via service role) —
-- por padrão o PostgREST expõe toda SECURITY DEFINER function pra anon/authenticated via
-- /rest/v1/rpc/..., o que deixaria qualquer um incrementar o contador de falhas de um IP
-- arbitrário direto pela API pública (um jeito barato de forçar o bloqueio de outra pessoa).
-- Encontrado pelo advisor de segurança do Supabase logo depois da migração anterior.
revoke execute on function public.cancio_record_login_failure(text, bigint) from anon, authenticated, public;
