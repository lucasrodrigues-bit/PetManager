-- T35: adiciona coluna `nome` em vacinas
--
-- Gap encontrado antes de codar: FILT-01 (spec.md) exige busca de
-- vacinas "por pet/nome da vacina", mas a tabela `vacinas` (migration
-- 0002) nunca teve uma coluna de nome — só data de aplicação e de
-- retorno. Mesmo padrão dos gaps do T18/T29: corrigido com uma
-- migration pequena e aditiva antes de escrever o Server Action.
--
-- DEFAULT só existe pra não quebrar linha nenhuma já existente; todo
-- INSERT novo (via `registrarVacina`, T35) sempre informa um nome
-- real.
--
-- Aplicada ao banco de produção em 2026-09-20.
--
-- Requirement: FILT-01

alter table public.vacinas
  add column nome text not null default 'Vacina';
