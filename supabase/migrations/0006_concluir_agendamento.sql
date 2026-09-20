-- T28: função transacional concluir_agendamento
--
-- SECURITY DEFINER: a RLS de `vendas` não tem policy de INSERT pra
-- tipo='servico' (de propósito, ver 0005_vendas.sql) — só uma função
-- com privilégios elevados pode criar esse tipo de venda, pra ninguém
-- fabricar uma venda de serviço direto via client. EXECUTE revogado de
-- PUBLIC e concedido só a `authenticated` (dono e recepcionista podem
-- concluir agendamento, mesma permissão de AGD).
--
-- SECURITY DEFINER: a RLS de `vendas` não tem policy de INSERT pra
-- tipo='servico' (de propósito, ver 0005_vendas.sql) — só uma função
-- com privilégios elevados pode criar esse tipo de venda, pra ninguém
-- fabricar uma venda de serviço direto via client. EXECUTE revogado de
-- PUBLIC e de `anon` explicitamente (Supabase concede EXECUTE a `anon`
-- por padrão em funções novas do schema `public` — revogar só de
-- PUBLIC não bastou, confirmado via `get_advisors` depois da primeira
-- aplicação) e concedido só a `authenticated` (dono e recepcionista
-- podem concluir agendamento, mesma permissão de AGD). O advisor ainda
-- aponta `authenticated` como podendo executar uma função
-- `security definer` — isso é intencional, não um problema.
--
-- Aplicada ao banco de produção em 2026-09-20 (via Supabase MCP,
-- `apply_migration` + correção do grant a `anon` logo em seguida,
-- `get_advisors` limpo depois disso).
--
-- Requirement: AGD-07, VEN-01

create or replace function public.concluir_agendamento(p_agendamento_id bigint)
returns bigint
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_valor_total numeric(10, 2);
  v_venda_id bigint;
  v_status text;
begin
  select status into v_status
  from public.agendamentos
  where id = p_agendamento_id
  for update;

  if not found then
    raise exception 'Agendamento não encontrado';
  end if;

  select coalesce(sum(s.preco_interno), 0)
    into v_valor_total
  from public.agendamento_servicos ags
  join public.servicos s on s.id = ags.servico_id
  where ags.agendamento_id = p_agendamento_id;

  update public.agendamentos
  set status = 'concluido', updated_at = now()
  where id = p_agendamento_id;

  insert into public.vendas (tipo, agendamento_id, quantidade, valor_total, criado_por)
  values ('servico', p_agendamento_id, 1, v_valor_total, auth.uid())
  returning id into v_venda_id;

  return v_venda_id;
end;
$$;

revoke execute on function public.concluir_agendamento(bigint) from anon;
revoke execute on function public.concluir_agendamento(bigint) from public;
grant execute on function public.concluir_agendamento(bigint) to authenticated;
