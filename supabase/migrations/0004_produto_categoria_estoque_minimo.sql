-- Adiciona categoria e estoque_minimo em produtos.
--
-- Esses dois campos foram desenhados em design.md (petmanager-completo)
-- como parte da migration de vendas (0004_vendas, T20), mas o T18
-- (cadastro de produto) já precisa deles antes disso — sequenciamento
-- corrigido aqui com uma migration pequena e aditiva, própria. A
-- migration de vendas do T20 vira 0005.
--
-- Aditiva: DEFAULT em ambas as colunas, nenhum dado existente quebra.

alter table public.produtos
  add column categoria text not null default 'Geral',
  add column estoque_minimo integer not null default 0 check (estoque_minimo >= 0);
