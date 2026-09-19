-- T20: tabela vendas + funcao transacional registrar_venda_produto
--
-- categoria/estoque_minimo em produtos ja foram adicionados no T18
-- (0004_produto_categoria_estoque_minimo.sql) - aqui so falta venda_id
-- em movimentacoes_estoque e a tabela vendas em si.
--
-- Requirement: VEN-01, VEN-02, VEN-03, VEN-04
-- Decision: AD-003 (sempre (select auth.uid()) / current_role_petmanager())

create table public.vendas (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('servico', 'produto')),
  agendamento_id bigint references public.agendamentos (id),
  produto_id bigint references public.produtos (id),
  quantidade integer not null default 1 check (quantidade > 0),
  valor_total numeric(10, 2) not null check (valor_total >= 0),
  criado_por uuid references public.profiles (id),
  criado_em timestamptz not null default now(),
  constraint vendas_tipo_referencia_check check (
    (tipo = 'servico' and agendamento_id is not null and produto_id is null)
    or
    (tipo = 'produto' and produto_id is not null and agendamento_id is null)
  ),
  -- no maximo 1 venda por agendamento (Postgres permite multiplos NULLs
  -- numa unique constraint, entao vendas de produto - agendamento_id
  -- sempre null - nunca conflitam entre si)
  constraint vendas_agendamento_unique unique (agendamento_id)
);

create index vendas_criado_em_idx on public.vendas (criado_em);
create index vendas_tipo_idx on public.vendas (tipo);

alter table public.movimentacoes_estoque
  add column venda_id bigint references public.vendas (id);

-- RLS: leitura liberada pra qualquer autenticado (dono e recepcionista
-- veem a mesma lista de vendas, VEN-05). Insert direto do cliente só
-- existe pra tipo='produto', e só pra dono - não existe policy de
-- insert pra tipo='servico', então uma tentativa de insert direto
-- desse tipo é sempre negada pelo RLS (nenhuma policy de insert cobre
-- o caso). A criação de venda de serviço (T28) e o estorno (T29) vão
-- precisar de funções `security definer` pra escrever apesar dessa
-- restrição - de propósito, pra ninguém inserir uma venda de serviço
-- fabricada direto via client.
alter table public.vendas enable row level security;

create policy vendas_select_all
  on public.vendas
  for select
  to authenticated
  using (true);

create policy vendas_insert_produto_dono
  on public.vendas
  for insert
  to authenticated
  with check (tipo = 'produto' and (select public.current_role_petmanager()) = 'dono');

-- Função transacional: valida saldo, registra a venda e a saída de
-- estoque, debita o saldo - tudo ou nada (se qualquer `raise
-- exception` disparar, a invocação inteira é revertida pelo Postgres).
-- `security invoker` (padrão, explícito aqui) - roda com o papel de
-- quem chama, então a RLS de `produtos`/`vendas` já garante que só
-- `dono` consegue completar a operação; não duplicamos a checagem de
-- papel aqui.
create or replace function public.registrar_venda_produto(
  p_produto_id bigint,
  p_quantidade integer
)
returns bigint
language plpgsql
security invoker
set search_path = 'public', 'pg_temp'
as $$
declare
  v_saldo integer;
  v_preco numeric(10, 2);
  v_venda_id bigint;
begin
  if p_quantidade <= 0 then
    raise exception 'Quantidade deve ser maior que zero';
  end if;

  select saldo_estoque, preco_unitario
    into v_saldo, v_preco
  from public.produtos
  where id = p_produto_id
  for update;

  if not found then
    raise exception 'Produto não encontrado';
  end if;

  if v_saldo < p_quantidade then
    raise exception 'Saldo insuficiente';
  end if;

  insert into public.vendas (tipo, produto_id, quantidade, valor_total, criado_por)
  values ('produto', p_produto_id, p_quantidade, v_preco * p_quantidade, auth.uid())
  returning id into v_venda_id;

  insert into public.movimentacoes_estoque (produto_id, tipo, quantidade, valor_total, venda_id)
  values (p_produto_id, 'saida', p_quantidade, v_preco * p_quantidade, v_venda_id);

  update public.produtos
  set saldo_estoque = saldo_estoque - p_quantidade
  where id = p_produto_id;

  return v_venda_id;
end;
$$;
