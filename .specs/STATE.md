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
- **Phase / Task**: Phase 1 / T6 - Configurar Vitest
- **Completed**: T1, T2, T3, T4, T5
- **In-progress**: none
- **Next step**: Executar T6 (instalar/configurar Vitest, script `test:unit`)
- **Blockers**: none
- **Reconciliation note (2026-09-18)**: T5 (RLS) já estava aplicado direto no Supabase desde 2026-09-17 (sessão anterior), incluindo um hardening extra de `search_path` na função `current_role_petmanager()` fora do escopo original. Nada disso tinha migration commitada nem os specs atualizados. Fechado por introspecção do banco: `0003_rls.sql` reconstruído para bater com o estado real, `tasks.md`/`spec.md` atualizados, lição registrada em `LESSONS.md`.
- **Uncommitted files**: none (tudo commitado após esta reconciliação)
- **Branch**: main
