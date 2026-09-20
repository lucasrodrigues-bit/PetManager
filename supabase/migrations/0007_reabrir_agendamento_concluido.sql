-- T29: função transacional reabrir_agendamento_concluido
--
-- Gap encontrado antes de codar: a RLS de `vendas` (0005_vendas.sql)
-- não tem policy de DELETE — um `.delete()` direto do client seria
-- silenciosamente bloqueado (0 linhas afetadas, sem erro), deixando a
-- venda órfã depois de reabrir o agendamento e inflando o faturamento
-- (exatamente o bug que AGD-08 existe pra evitar). Mesma técnica do
-- T28: função `security definer`, EXECUTE revogado de `anon`/`public`
-- explicitamente (lição do T28 aplicada de cara aqui), concedido só a
-- `authenticated`.
--
-- Idempotente: se não existir venda pro agendamento, o `delete` afeta
-- 0 linhas sem erro; só falha (`raise exception`) se o agendamento em
-- si não existir.
--
-- Aplicada ao banco de produção em 2026-09-20 (via Supabase MCP,
-- `get_advisors` limpo — só o aviso esperado de `authenticated` poder
-- executar).
--
-- Requirement: AGD-08, VEN-01

create or replace function public.reabrir_agendamento_concluido(p_agendamento_id bigint)
returns void
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  delete from public.vendas where agendamento_id = p_agendamento_id;

  update public.agendamentos
  set status = 'agendado', updated_at = now()
  where id = p_agendamento_id;

  if not found then
    raise exception 'Agendamento não encontrado';
  end if;
end;
$$;

revoke execute on function public.reabrir_agendamento_concluido(bigint) from anon;
revoke execute on function public.reabrir_agendamento_concluido(bigint) from public;
grant execute on function public.reabrir_agendamento_concluido(bigint) to authenticated;
