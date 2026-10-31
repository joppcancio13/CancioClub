-- A tabela `cancio` já tinha RLS habilitado, mas a única policy existente ("Professor pode
-- tudo") liberava acesso total pra QUALQUER sessão autenticada (qual: true), sem checar QUAL
-- auth.uid() era. Isso só "funcionava certo" porque hoje existe uma única conta autenticada no
-- projeto (o professor) — não é travado nele de verdade. Troca pra policies presas no auth.uid()
-- real do professor.
--
-- O aluno nunca passa por aqui como `authenticated` — ele não tem sessão Supabase Auth, só um
-- código de 4 dígitos (ver supabase/functions/student/index.ts). Todo acesso dele é mediado pela
-- Edge Function, que usa a Service Role key — e a Service Role sempre ignora RLS completamente
-- (não é coberta por nenhuma policy, não é `anon` nem `authenticated`), então isso aqui não muda
-- nada no fluxo do aluno, só fecha o acesso direto via cliente pra quem não for o professor.
--
-- UUID vem de auth.users (select id from auth.users where email = 'joppcancio13@gmail.com').
-- Se essa conta for excluída e recriada um dia, o novo auth.uid() precisa substituir o valor
-- abaixo nas 4 policies.

drop policy if exists "Professor pode tudo" on public.cancio;

create policy "professor select proprio" on public.cancio
  for select
  to authenticated
  using (auth.uid() = '1617b8a8-8134-4b6a-a749-5a5669a427c7'::uuid);

create policy "professor insert proprio" on public.cancio
  for insert
  to authenticated
  with check (auth.uid() = '1617b8a8-8134-4b6a-a749-5a5669a427c7'::uuid);

create policy "professor update proprio" on public.cancio
  for update
  to authenticated
  using (auth.uid() = '1617b8a8-8134-4b6a-a749-5a5669a427c7'::uuid)
  with check (auth.uid() = '1617b8a8-8134-4b6a-a749-5a5669a427c7'::uuid);

create policy "professor delete proprio" on public.cancio
  for delete
  to authenticated
  using (auth.uid() = '1617b8a8-8134-4b6a-a749-5a5669a427c7'::uuid);
