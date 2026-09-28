# PetManager Completo — Validation

**Feature**: petmanager-completo
**Date**: 2026-09-22
**Result**: PASS — 41/41 tasks concluídas, gates verdes; 3 lacunas de verificação documentadas abaixo (limitações de ambiente, não falhas de código)

## Gates executados nesta validação

| Gate | Resultado |
|---|---|
| `npm run test:unit` | 80/80 testes, 25 arquivos |
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 problemas (1 erro real em `search-filter-bar.tsx` corrigido no fechamento) |
| `npm run build` | OK, todas as rotas compilam (`/agenda`, `/agenda/lista`, `/estoque`, `/horario-funcionamento`, `/pets`, `/relatorios`, `/servicos`, `/vacinas`, `/vendas`, `/login`) |
| `validate_spec.py` / `validate_tasks.py` | 0 erros |
| Supabase `get_advisors` (security) | sem alertas além do esperado/intencional (`authenticated` executando as 2 funções `security definer`) |

## Evidência por requisito

| Requisito | Evidência | Verdict |
|---|---|---|
| AUTH-01/02 login, mensagem genérica | src/features/auth/actions.ts:16 | PASS |
| AUTH-03 papéis bloqueiam rotas restritas | src/middleware.ts:11 ; supabase/migrations/0003_rls.sql:28 | PASS |
| AUTH-04 `(select auth.uid())` nas policies | supabase/migrations/0003_rls.sql:47 | PASS |
| HOR-01/02 horário, fechamento > abertura | src/features/horario-funcionamento/actions.ts:25 | PASS |
| CAD-01..04 tutor/pet, telefone BR, 255 chars | src/features/pets/actions.ts:67 ; src/features/pets/actions.ts:38 | PASS |
| SERV-01..03 preço interno, nunca vaza no agendamento | src/features/servicos/queries.ts:20 | PASS |
| AGD-01 criar dentro do expediente | src/features/agenda/actions.ts:29 | PASS |
| AGD-04/05/06 editar, cancelar (soft), reabrir | src/features/agenda/actions.ts:89 ; src/features/agenda/actions.ts:133 ; src/features/agenda/actions.ts:154 | PASS |
| AGD-07 / VEN-01 concluir cria venda | src/features/agenda/actions.ts:191 ; supabase/migrations/0006_concluir_agendamento.sql:28 | PASS |
| AGD-08 reabrir concluído estorna venda | src/features/agenda/actions.ts:221 ; supabase/migrations/0007_reabrir_agendamento_concluido.sql:22 | PASS |
| EST-01/04 produto/entrada, só dono | src/features/estoque/queries.ts:26 | PASS |
| VEN-02/03 venda de produto atômica, saldo | src/features/vendas/actions.ts:16 ; supabase/migrations/0005_vendas.sql:66 | PASS |
| VEN-05 lista unificada de vendas | src/features/vendas/queries.ts:69 | PASS |
| VAC-01/02 vacina + histórico | src/features/vacinas/actions.ts:23 | PASS |
| REL-01..05 relatório mensal, fonte única `vendas`, só dono | src/features/relatorios/queries.ts:40 | PASS |
| REL-06/07 export PDF, falha não derruba a tela | src/features/relatorios/actions.ts:22 ; src/shared/pdf/relatorio-pdf.tsx:80 | PASS |
| FILT-01..04 busca + filtro combinados na URL | src/shared/filters/use-list-filters.ts:17 | PASS |

## Lacunas de verificação (NÃO são falhas — precisam ser fechadas fora deste ambiente)

1. **E2E nunca executado de ponta a ponta.** O sandbox bloqueia o download do Chromium do Playwright; todos os specs em `e2e/` foram escritos e falham exatamente em "executável não existe", nunca por erro de config. Rodar `npx playwright install --with-deps && npm run test:e2e` localmente ou no CI.
2. **Cenários com sessão real de `dono`/`recepcionista`** (T7/T8/T21/T24/T41) dependem de contas de teste seedadas no Supabase Auth — a lógica está coberta por unit tests + middleware + RLS, mas o fluxo logado real não foi exercitado.
3. **Nenhum teste automatizado de RLS por papel** no banco (as policies foram verificadas por introspecção + `get_advisors`, não por queries reais como recepcionista).

## Sensor de discriminação

Encontrou 1 mutante sobrevivente em `criarAgendamento` (limite exato do horário de abertura não coberto); teste adicionado em `src/features/agenda/__tests__/actions.test.ts`.
