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

### AD-004
- **Decision**: Toda task deve avaliar, além das skills já indicadas em `tasks.md`, se alguma das skills abaixo se aplica antes de ser considerada concluída: `application-security-testing`, `better-auth-security-best-practices`, `find-security-vulnerabilities-in-code`, `fix-security-vulnerabilities-with-strix`, `managed-pentesting-with-strix`, `penetration-testing-with-strix`, `supabase-postgres-best-practices`, `brainstorming`, `ci-security-scanning-with-strix`, `documentation-writer`, `mysql`, `frontend-design`, `mastering-typescript`, `react-expert`, `software-architecture`, `prompt-engineering`, `vercel-react-best-practices`.
- **Reason**: O software vai ser vendido a clientes reais (petshops) — segurança e qualidade de código pesam mais que velocidade. Ter o roster centralizado aqui evita esquecer de checar segurança/arquitetura numa task só porque `tasks.md` não previu aquela skill especificamente.
- **Trade-off**: Duas skills do roster não batem com a stack do projeto hoje — `mysql` (o projeto usa Postgres/Supabase) e `better-auth-security-best-practices` (o projeto usa Supabase Auth, não a lib Better Auth). Mantidas na lista a pedido, mas devem ser tratadas como não aplicáveis até o stack mudar — nenhuma task deve seguir orientação de `mysql` ou `better-auth` como se valesse para Postgres/Supabase Auth.
- **Scope**: Todas as tasks do projeto PetManager, do T7 em diante.
- **Date**: 2026-09-18
- **Status**: active

### AD-005
- **Decision**: A partir do T8, nada vai direto pra `main`. Cada task (ou grupo pequeno de tasks bem relacionadas) roda numa branch `task/T<N>-<slug>`, sobe um PR, e só é integrada via **squash merge** depois que o gate da task (build/test) passa. A branch é apagada após o merge.
- **Reason**: O software vai ser vendido — `main` devia ser sempre um estado confiável. PR (mesmo sem outro revisor humano, já que é projeto solo) cria um ponto de checagem antes de qualquer coisa entrar em `main`, e o squash mantém o histórico da main com 1 commit por task (fácil de ler/reverter).
- **Trade-off**: Mais overhead por task num projeto solo (branch + PR + merge em vez de commit direto). Tentei habilitar branch protection na `main` via API pra forçar isso do lado do GitHub, mas o token fine-grained atual não tem permissão (`403 Resource not accessible`) — fica registrado que isso ainda não está tecnicamente bloqueado no GitHub, só é uma disciplina seguida manualmente. Lucas pode habilitar "Require pull request before merging" em Settings → Branches quando quiser forçar de verdade.
- **Scope**: Todas as tasks do projeto PetManager, do T8 em diante.
- **Date**: 2026-09-18
- **Status**: active

## Handoff

- **Feature**: petmanager-mvp
- **Phase / Task**: Phase 1 / T8 - Cliente Supabase server-side
- **Completed**: T1, T2, T3, T4, T5, T6, T7
- **In-progress**: none
- **Next step**: Executar T8 (helper de cliente Supabase para Server Components/Actions)
- **Blockers**: T7 — rodar `npx playwright install --with-deps && npm run test:e2e` fora deste sandbox (bloqueado por allowlist de rede) pra confirmar o e2e de ponta a ponta antes de considerar 100% validado
- **Uncommitted files**: none (tudo commitado após T7)
- **Branch**: main
