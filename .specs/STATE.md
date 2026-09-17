# STATE

## Decisions

### AD-001
- **Decision**: Sem camada de API REST separada — Server Actions do Next.js (App Router) fazem toda escrita, Server Components fazem toda leitura direto do Supabase.
- **Reason**: Não há consumidor externo da API no v1; Server Actions eliminam boilerplate de rotas/handlers para um app CRUD interno de uso único.
- **Trade-off**: Se um dia surgir um segundo cliente (app mobile, integração externa), será necessário extrair uma camada de API — decisão reversível, mas com retrabalho.
- **Scope**: Todas as features do PetManager.
- **Date**: 2026-09-16
- **Status**: active

### AD-002
- **Decision**: Estrutura de pastas por domínio (`src/features/<dominio>/{actions,queries,types}.ts`), nunca por camada genérica (`utils/`, `helpers/`, `common/`).
- **Reason**: Cada domínio (agenda, estoque, vacinas...) nasce isolado e testável; evita virar dumping ground sem propósito claro.
- **Trade-off**: Nenhum código verdadeiramente compartilhado entre domínios deve ir em `shared/` só por conveniência — precisa ser genuinamente cross-cutting (ex.: cliente Supabase, componentes de UI).
- **Scope**: Todas as features do PetManager.
- **Date**: 2026-09-16
- **Status**: active

### AD-003
- **Decision**: Toda policy de RLS usa `(select auth.uid())`, nunca `auth.uid()` chamado diretamente na condição.
- **Reason**: `(select auth.uid())` é cacheado pelo planner do Postgres por statement; a forma direta é reavaliada por linha, degradando performance em tabelas grandes.
- **Trade-off**: Nenhum — é estritamente melhor, mas fácil de esquecer sem essa decisão documentada.
- **Scope**: Todas as tabelas com RLS em todas as features do PetManager.
- **Date**: 2026-09-16
- **Status**: active

## Handoff

- **Feature**: petmanager-mvp
- **Phase / Task**: Phase 1 / T4 - migration das tabelas de domínio
- **Completed**: T1, T2, T3
- **In-progress**: none
- **Next step**: Executar T4 (tabelas de domínio: horarios_funcionamento, tutores, pets, servicos, agendamentos, agendamento_servicos, vacinas, produtos, movimentacoes_estoque)
- **Blockers**: RLS ainda desabilitado em `profiles` (e vai ficar assim em `public` até a T5) — risco aceito temporariamente, sem dados reais trafegando ainda
- **Blockers**: none
- **Uncommitted files**: none (tudo commitado após T1)
- **Branch**: main
