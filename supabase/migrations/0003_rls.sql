-- T5: RLS policies para todas as tabelas do PetManager MVP
--
-- Reconstruído por introspecção do banco em 2026-09-18: as policies já
-- estavam aplicadas em produção (Supabase project lfllgrvnxlxtbjbszgqj)
-- desde 2026-09-17, mas este arquivo de migration nunca havia sido
-- commitado no repositório (ver Notas de execução em tasks.md, T5, e
-- LESSONS.md). O SQL abaixo reflete exatamente o estado hoje vigente no
-- banco (funções, RLS enable e policies), incluindo o hardening de
-- search_path que uma correção posterior (fix_function_search_path)
-- já havia aplicado sobre a função helper.
--
-- Requirement: AUTH-03, EST-04, REL-05
-- Decision: AD-003 (sempre `(select auth.uid())`, nunca `auth.uid()` por linha)

-- Helper: retorna o role do usuário autenticado a partir de profiles.
-- STABLE + search_path fixo (public, pg_temp) evita o advisory de
-- "function search_path mutable" do Supabase.
create or replace function public.current_role_petmanager()
returns text
language sql
stable
set search_path to 'public', 'pg_temp'
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

-- Habilita RLS em todas as tabelas do domínio
alter table public.profiles enable row level security;
alter table public.horarios_funcionamento enable row level security;
alter table public.tutores enable row level security;
alter table public.pets enable row level security;
alter table public.servicos enable row level security;
alter table public.agendamentos enable row level security;
alter table public.agendamento_servicos enable row level security;
alter table public.vacinas enable row level security;
alter table public.produtos enable row level security;
alter table public.movimentacoes_estoque enable row level security;

-- profiles: cada usuário só enxerga o próprio registro
-- (insert/update/delete ficam a cargo do service role / trigger de signup)
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- horarios_funcionamento: leitura livre para autenticados, escrita só dono
create policy horarios_select_all
  on public.horarios_funcionamento
  for select
  to authenticated
  using (true);

create policy horarios_insert_dono
  on public.horarios_funcionamento
  for insert
  to authenticated
  with check ((select public.current_role_petmanager()) = 'dono');

create policy horarios_update_dono
  on public.horarios_funcionamento
  for update
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono');

create policy horarios_delete_dono
  on public.horarios_funcionamento
  for delete
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono');

-- Cadastros de agenda: dono e recepcionista têm acesso completo (AUTH-03)
create policy tutores_all_authenticated
  on public.tutores
  for all
  to authenticated
  using (true)
  with check (true);

create policy pets_all_authenticated
  on public.pets
  for all
  to authenticated
  using (true)
  with check (true);

create policy agendamentos_all_authenticated
  on public.agendamentos
  for all
  to authenticated
  using (true)
  with check (true);

create policy agendamento_servicos_all_authenticated
  on public.agendamento_servicos
  for all
  to authenticated
  using (true)
  with check (true);

create policy vacinas_all_authenticated
  on public.vacinas
  for all
  to authenticated
  using (true)
  with check (true);

-- servicos: leitura livre (preço interno é filtrado na query, não na RLS),
-- escrita restrita a dono
create policy servicos_select_all
  on public.servicos
  for select
  to authenticated
  using (true);

create policy servicos_insert_dono
  on public.servicos
  for insert
  to authenticated
  with check ((select public.current_role_petmanager()) = 'dono');

create policy servicos_update_dono
  on public.servicos
  for update
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono');

create policy servicos_delete_dono
  on public.servicos
  for delete
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono');

-- produtos e movimentacoes_estoque: exclusivo do dono (EST-04, REL-05)
create policy produtos_dono_only
  on public.produtos
  for all
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono')
  with check ((select public.current_role_petmanager()) = 'dono');

create policy movimentacoes_dono_only
  on public.movimentacoes_estoque
  for all
  to authenticated
  using ((select public.current_role_petmanager()) = 'dono')
  with check ((select public.current_role_petmanager()) = 'dono');
