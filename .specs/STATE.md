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
- **Phase / Task**: Phase 1 / T1 - inicializar projeto Next.js
- **Completed**: none
- **In-progress**: T1 (scaffold já criado pelo usuário localmente: Next.js 16 + TypeScript + Tailwind v4 + ESLint; falta shadcn/ui)
- **Next step**: Finalizar T1 (inicializar shadcn/ui) e rodar gate de build
- **Blockers**: none
- **Uncommitted files**: .specs/ (spec.md, design.md, tasks.md, STATE.md) ainda não commitados neste repositório
- **Branch**: main
