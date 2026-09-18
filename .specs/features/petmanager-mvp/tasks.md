# PetManager MVP Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by
name and follow its Execute flow and Critical Rules.** Do not search for
skill files by filesystem path. The skill is the source of truth for the
full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier,
discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not
proceed without it.**

---

**Design**: `.specs/features/petmanager-mvp/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Gerado a partir da spec e da decisão do usuário (unitários + E2E com
> Playwright). Guidelines encontradas: nenhuma — projeto greenfield, sem
> `AGENTS.md`/config de teste ainda. Defaults fortes aplicados.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
|---|---|---|---|---|
| Server Actions (`features/*/actions.ts`) | unit | Todos os branches; 1:1 com os ACs da spec; todo edge case listado tem teste | `src/features/**/__tests__/*.test.ts` | `npm run test:unit` |
| Queries (`features/*/queries.ts`) | unit | Caminhos de consulta principais + tratamento de erro | `src/features/**/__tests__/*.test.ts` | `npm run test:unit` |
| Fluxos de página (login, agenda) | e2e | Happy path + todo edge case listado + caminhos de erro | `e2e/*.spec.ts` | `npm run test:e2e` |
| Middleware de proteção de rota | e2e | Bloqueio por papel: happy + tentativa de acesso indevido | `e2e/*.spec.ts` | `npm run test:e2e` |
| Migrations SQL / RLS policies | none | — (validado via gate de build + teste manual de policy) | `supabase/migrations/*.sql` | build gate only |
| Setup/config/infra (init do projeto, config de test runner, clientes Supabase, deploy) | none | — (build gate only) | `package.json`, `*.config.ts`, `src/shared/supabase/*.ts` | build gate only |
| Types/interfaces (`features/*/types.ts`) | none | — (build gate only) | `src/features/**/types.ts` | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
|---|---|---|
| Quick | Depois de tasks só com testes unitários | `npm run test:unit` |
| Full | Depois de tasks com e2e | `npm run test:unit && npm run test:e2e` |
| Build | Fim de fase ou tasks só de config/schema | `npm run build && npm run lint && npm run test:unit && npm run test:e2e` |

---

## Execution Plan

Fases ordenadas, executadas sequencialmente — cada fase completa antes da
próxima começar, e as tasks dentro de uma fase executam em ordem.

### Phase 1: Foundation

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10
```

### Phase 2: Autenticação e Papéis

```
T10 → T11 → T12 → T13 → T14
```

### Phase 3: Cadastros Base

```
T14 → T15 → T16 → T17 → T18 → T19 → T20 → T21 → T22 → T23
```

### Phase 4: Agenda (núcleo)

```
T23 → T24 → T25 → T26 → T27 → T28 → T29 → T30 → T31
```

### Phase 5: Vacinas

```
T31 → T32 → T33 → T34
```

### Phase 6: Estoque

```
T34 → T35 → T36 → T37 → T38
```

### Phase 7: Relatórios

```
T38 → T39 → T40
```

---

## Diagram-Definition Cross-Check

| Edge no diagrama | `Depends on` correspondente | Status |
|---|---|---|
| T1→T2→...→T10 | Cada task Tn depende de T(n-1) | ✅ |
| T10→T11 (fase 1→2) | T11 depende de T10 | ✅ |
| T11→T12→T13→T14 | Cada task depende da anterior | ✅ |
| T14→T15 (fase 2→3) | T15 depende de T14 | ✅ |
| T15→...→T23 | Cada task depende da anterior | ✅ |
| T23→T24 (fase 3→4) | T24 depende de T23 | ✅ |
| T24→...→T31 | Cada task depende da anterior | ✅ |
| T31→T32 (fase 4→5) | T32 depende de T31 | ✅ |
| T32→T33→T34 | Cada task depende da anterior | ✅ |
| T34→T35 (fase 5→6) | T35 depende de T34 | ✅ |
| T35→...→T38 | Cada task depende da anterior | ✅ |
| T38→T39 (fase 6→7) | T39 depende de T38 | ✅ |
| T39→T40 | T40 depende de T39 | ✅ |

## Test Co-location Validation

| Task | Layer (matriz) | `Tests` da task | Confere? |
|---|---|---|---|
| T11, T12 | Server Actions/Queries | unit | ✅ |
| T13, T14 | Fluxos de página/middleware | e2e | ✅ |
| T15, T16, T18, T19, T21, T22 | Server Actions/Queries | unit | ✅ |
| T17, T20, T23 | Fluxos de página | e2e | ✅ |
| T24–T29 | Server Actions/Queries | unit | ✅ |
| T30, T31 | Fluxos de página | e2e | ✅ |
| T32, T33 | Server Actions/Queries | unit | ✅ |
| T34 | Fluxo de página | e2e | ✅ |
| T35, T36, T37 | Server Actions/Queries | unit | ✅ |
| T38 | Fluxo de página | e2e | ✅ |
| T39 | Query | unit | ✅ |
| T40 | Fluxo de página | e2e | ✅ |
| T1, T3, T4, T5 (config/migration) | Migrations/config | none | ✅ |
| T6, T7, T8, T9, T10 (config/infra) | Types/config | none | ✅ |

---

## Task Breakdown

### T1: Inicializar projeto Next.js + TypeScript + Tailwind + shadcn/ui

**Status**: ✅ Complete

**What**: Criar o projeto base com `create-next-app` (App Router,
TypeScript), configurar Tailwind e inicializar shadcn/ui.
**Where**: `package.json`
**Depends on**: None
**Reuses**: N/A (primeira task do projeto)
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Projeto Next.js roda localmente (`npm run dev`)
- [x] Tailwind configurado e funcionando
- [x] shadcn/ui inicializado com pelo menos 1 componente de exemplo

**Tests**: none
**Gate**: build

**Notas de execução**: shadcn/ui inicializado manualmente (componentes
copiados à mão) porque a CLI (`npx shadcn init`) depende de
`ui.shadcn.com`, fora da allowlist de rede deste ambiente sandbox — fora
dele (Vercel, máquina local) a CLI funciona normalmente. Fontes Google
(`next/font/google`) removidas do layout por depender de
`fonts.googleapis.com`, também fora da allowlist; layout usa a stack de
fontes do sistema (`ui-sans-serif, system-ui...`) — decisão que também
reduz uma dependência externa no runtime de produção.

---

### T2: Criar projeto Supabase e configurar variáveis de ambiente

**Status**: ✅ Complete

**What**: Criar o projeto no Supabase via Supabase MCP e configurar
`.env.local` com URL e chaves.
**Where**: `.env.local`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: `Supabase`
- Skill: NONE

**Done when**:
- [x] Projeto Supabase criado
- [x] `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Conexão testada com sucesso (query simples)

**Tests**: none
**Gate**: build

**Notas de execução**: Projeto "petmanager project" já existia (criado
pelo usuário, id `lfllgrvnxlxtbjbszgqj`, região `ca-central-1`). URL e
chave publicável (`sb_publishable_...`, formato moderno recomendado pelo
Supabase, substitui a legacy anon JWT key) obtidas via Supabase MCP e
gravadas em `.env.local` (git-ignorado). `.env.example` criado sem
segredos para documentar as variáveis exigidas. Conexão validada via
`supabase.auth.getSession()` sem erro.

---

### T3: Migration — tabela `profiles` (role, ativo)

**Status**: ✅ Complete

**What**: Criar migration SQL da tabela `profiles` vinculada a
`auth.users`, com colunas `role` (`dono`/`recepcionista`) e `ativo`
(soft-disable).
**Where**: `supabase/migrations/0001_profiles.sql`
**Depends on**: T2
**Reuses**: N/A
**Requirement**: AUTH-03

**Tools**:
- MCP: `Supabase`
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [x] Migration aplicada sem erro
- [x] Tabela `profiles` com FK para `auth.users`

**Tests**: none
**Gate**: build

**Notas de execução**: Migration aplicada via Supabase MCP
(`apply_migration`, nome `profiles`). `id` é PK e FK direta para
`auth.users(id)` — padrão idiomático do Supabase para tabela de perfil
1:1 (a preocupação geral de "evitar UUID aleatório como PK" não se aplica
aqui: o UUID não é gerado por nós, vem do próprio `auth.users`, e o
acesso é sempre por lookup direto do `id`, nunca por range scan).
**RLS ainda não habilitado nessa tabela — entra na T5**, conforme
avisado pelo próprio advisor do Supabase.

---

### T4: Migration — tabelas de domínio

**Status**: ✅ Complete

**What**: Criar migration com as tabelas `horarios_funcionamento`,
`tutores`, `pets`, `servicos`, `agendamentos`, `agendamento_servicos`,
`vacinas`, `produtos`, `movimentacoes_estoque`, conforme modelo de dados
do design.
**Where**: `supabase/migrations/0002_domain.sql`
**Depends on**: T3
**Reuses**: N/A
**Requirement**: HOR-01, CAD-01, CAD-03, SERV-01, AGD-01, VAC-01, EST-01

**Tools**:
- MCP: `Supabase`
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [x] Todas as tabelas criadas com os tipos corretos
- [x] FKs entre `pets→tutores`, `agendamentos→pets`, `agendamento_servicos→agendamentos/servicos`, `vacinas→pets`, `movimentacoes_estoque→produtos`
- [x] Índices em colunas usadas em filtro (ex.: `agendamentos.data_hora`)

**Tests**: none
**Gate**: build

**Notas de execução**: `bigint generated always as identity` como PK em
todas as tabelas de domínio (sequencial, sem fragmentação de índice —
diferente do caso de `profiles`, aqui não há motivo pra usar UUID).
Índice criado em toda coluna de FK (`pets.tutor_id`,
`agendamentos.pet_id`, `agendamentos.criado_por`,
`agendamento_servicos.servico_id`, `vacinas.pet_id`,
`movimentacoes_estoque.produto_id`), mais um índice extra em
`agendamentos.data_hora` por ser o filtro mais comum (AGD-02). RLS ainda
desabilitado em todas as 10 tabelas — confirmado pelo advisor de
segurança do Supabase, corrigido na T5 (próxima).

---

### T5: Migration — RLS policies

**Status**: ✅ Complete

**What**: Criar as policies de RLS para todas as tabelas, usando
`(select auth.uid())` (nunca chamado linha a linha) e checagem de
`role = 'dono'` nas tabelas restritas (`produtos`,
`movimentacoes_estoque`, queries de relatório).
**Where**: `supabase/migrations/0003_rls.sql`
**Depends on**: T4
**Reuses**: N/A
**Requirement**: AUTH-03, EST-04, REL-05

**Tools**:
- MCP: `Supabase`
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [x] RLS habilitado em todas as tabelas
- [x] Policies usam `(select auth.uid())`, não `auth.uid()` direto
- [x] `recepcionista` não consegue ler/escrever em `produtos`/`movimentacoes_estoque` (confirmado via introspecção das policies: ambas usam `current_role_petmanager() = 'dono'`, restrito a `authenticated`)

**Tests**: none
**Gate**: build

**Notas de execução**: As policies foram aplicadas diretamente no Supabase
(project `lfllgrvnxlxtbjbszgqj`) em 2026-09-17 numa sessão anterior, junto
de uma correção extra (`fix_function_search_path`) que não fazia parte do
escopo original — a função `current_role_petmanager()` recebeu `STABLE` +
`search_path` fixo para eliminar um advisory de segurança do Supabase.
Nenhuma das duas mudanças tinha sido commitada no repositório nem
refletida aqui — gap encontrado e fechado em 2026-09-18 por introspecção
do banco (`pg_policies`, `pg_proc`, `get_advisors`: 0 lints de segurança).
`0003_rls.sql` foi reconstruído para casar exatamente com o estado do
banco. Ver `LESSONS.md` (spec_deviation) para o registro do incidente.

---

### T6: Configurar Vitest (testes unitários)

**Status**: ✅ Complete

**What**: Instalar e configurar Vitest, adicionar script `test:unit` no
`package.json`.
**Where**: `vitest.config.ts`
**Depends on**: T5
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `npm run test:unit` roda e passa com um teste de exemplo
- [x] Config aponta para `src/features/**/__tests__/*.test.ts`

**Tests**: none
**Gate**: build

**Notas de execução**: `vitest` mais recente (5.x) exige `@types/node@^22`,
em conflito com o `@types/node@^20` já usado no projeto — fixado em
`vitest@3.2.4`, última versão compatível com `@types/node@^20`. Teste de
exemplo criado em `src/features/example/__tests__/example.test.ts` (é
descartável assim que a primeira feature real tiver testes próprios).

---

### T7: Configurar Playwright (testes e2e)

**What**: Instalar e configurar Playwright, adicionar script `test:e2e`
no `package.json`.
**Where**: `playwright.config.ts`
**Depends on**: T6
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `npm run test:e2e` roda com um teste de exemplo (ex.: página inicial carrega)
- [ ] Config aponta para `e2e/*.spec.ts`

**Tests**: none
**Gate**: build

---

### T8: Criar cliente Supabase server-side

**What**: Criar o helper de cliente Supabase para uso em Server
Components e Server Actions.
**Where**: `src/shared/supabase/server.ts`
**Depends on**: T7
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Cliente autentica corretamente usando cookies da sessão
- [ ] Importável por qualquer `features/*/actions.ts`

**Tests**: none
**Gate**: build

---

### T9: Criar cliente Supabase browser-side

**What**: Criar o helper de cliente Supabase para uso em Client
Components.
**Where**: `src/shared/supabase/client.ts`
**Depends on**: T8
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Cliente inicializa sem erro no browser
- [ ] Sessão sincroniza com o cliente server-side

**Tests**: none
**Gate**: build

---

### T10: Deploy inicial (esqueleto) na Vercel

**What**: Conectar o repositório à Vercel via Vercel MCP e configurar as
variáveis de ambiente de produção.
**Where**: Vercel project settings
**Depends on**: T9
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: `Vercel`
- Skill: `vercel-react-best-practices`

**Done when**:
- [ ] Deploy de produção acessível via URL da Vercel
- [ ] Variáveis de ambiente do Supabase configuradas em produção

**Tests**: none
**Gate**: build

---

### T11: Server Action `signIn`

**What**: Implementar a Server Action de login com e-mail/senha via
Supabase Auth.
**Where**: `src/features/auth/actions.ts`
**Depends on**: T10
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AUTH-01, AUTH-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Login com credenciais válidas autentica e retorna sucesso
- [ ] Credenciais inválidas retornam mensagem genérica ("E-mail ou senha inválidos"), sem indicar qual campo está errado
- [ ] Testes unitários cobrindo os dois casos (AC 1 e AC 2 de AUTH)
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T12: Query `getCurrentUserRole`

**What**: Implementar função que retorna o papel (`dono`/`recepcionista`)
do usuário autenticado, lendo da tabela `profiles`.
**Where**: `src/features/auth/queries.ts`
**Depends on**: T11
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AUTH-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Retorna `null` se não autenticado
- [ ] Retorna o papel correto para usuário `dono` e `recepcionista`
- [ ] Teste unitário cobrindo os três casos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T13: Middleware de proteção de rota por papel

**What**: Criar middleware do Next.js que bloqueia `recepcionista` de
acessar rotas de estoque/relatórios.
**Where**: `src/middleware.ts`
**Depends on**: T12
**Reuses**: `src/features/auth/queries.ts`
**Requirement**: AUTH-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `recepcionista` é redirecionado ao tentar acessar `/estoque` ou `/relatorios` diretamente pela URL
- [ ] `dono` acessa normalmente
- [ ] Teste e2e cobrindo os dois papéis tentando acessar a rota restrita
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T14: Página de login

**What**: Criar a tela de login (Client Component) que chama a Server
Action `signIn`.
**Where**: `src/app/(auth)/login/page.tsx`
**Depends on**: T13
**Reuses**: `src/features/auth/actions.ts`, `src/shared/ui` (componentes shadcn)
**Requirement**: AUTH-01, AUTH-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Login com credenciais válidas redireciona ao dashboard
- [ ] Login inválido exibe a mensagem de erro genérica na tela
- [ ] Teste e2e: fluxo completo happy path + credenciais inválidas
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T15: Server Action `salvarHorario`

**What**: Implementar Server Action para cadastrar/editar horários de
funcionamento, validando que fechamento > abertura.
**Where**: `src/features/horario-funcionamento/actions.ts`
**Depends on**: T14
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: HOR-01, HOR-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Salva corretamente dia da semana + horário de abertura/fechamento
- [ ] Rejeita quando fechamento é anterior à abertura, com mensagem de erro
- [ ] Testes unitários cobrindo os dois ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T16: Query `getHorarios`

**What**: Implementar função que retorna os horários de funcionamento
cadastrados, usados para gerar os slots da Agenda.
**Where**: `src/features/horario-funcionamento/queries.ts`
**Depends on**: T15
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: HOR-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Retorna os horários no formato esperado pelo componente de agenda
- [ ] Teste unitário cobrindo o retorno vazio e com dados
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T17: Tela de cadastro de horário de funcionamento

**What**: Criar a tela onde o dono cadastra/edita os horários de
funcionamento.
**Where**: `src/app/(dashboard)/horario-funcionamento/page.tsx`
**Depends on**: T16
**Reuses**: `src/features/horario-funcionamento/actions.ts`, `src/shared/ui`
**Requirement**: HOR-01, HOR-02, HOR-03

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Dono consegue cadastrar horário para cada dia da semana
- [ ] Erro de fechamento antes de abertura aparece na UI
- [ ] Teste e2e: cadastro completo + tentativa de horário inválido
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T18: Server Action `criarTutor`

**What**: Implementar Server Action de cadastro de tutor, validando
telefone em formato brasileiro com `libphonenumber-js`.
**Where**: `src/features/pets/actions.ts`
**Depends on**: T17
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: CAD-01, CAD-02, CAD-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Cadastro aceito com telefone BR válido
- [ ] Cadastro rejeitado com telefone inválido, indicando o formato esperado
- [ ] Nome limitado a 255 caracteres
- [ ] Testes unitários cobrindo os três ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T19: Server Action `criarPet`

**What**: Implementar Server Action de cadastro de pet vinculado a um
tutor existente.
**Where**: `src/features/pets/actions.ts`
**Depends on**: T18
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: CAD-03, CAD-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Pet criado com nome, raça e porte válidos
- [ ] Rejeita `tutorId` inexistente
- [ ] Teste unitário cobrindo os dois casos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T20: Tela de cadastro de tutor + pet

**What**: Criar a tela onde dono/recepcionista cadastram tutores e pets.
**Where**: `src/app/(dashboard)/pets/page.tsx`
**Depends on**: T19
**Reuses**: `src/features/pets/actions.ts`, `src/shared/ui`
**Requirement**: CAD-01, CAD-02, CAD-03, CAD-04

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Fluxo completo de cadastro de tutor + pet funciona pela UI
- [ ] Erro de telefone inválido aparece na tela
- [ ] Teste e2e: cadastro completo + tentativa de telefone inválido
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T21: Server Action `criarServico`

**What**: Implementar Server Action de cadastro de serviço com preço
interno.
**Where**: `src/features/servicos/actions.ts`
**Depends on**: T20
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: SERV-01, SERV-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Serviço criado com nome e preço válidos
- [ ] Rejeita preço negativo ou não numérico
- [ ] Teste unitário cobrindo os dois ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T22: Queries `getServicosParaAgendamento` e `getServicosComPreco`

**What**: Implementar as duas queries de serviço — uma sem preço (para a
tela de agendamento) e outra com preço (uso restrito a relatórios/dono).
**Where**: `src/features/servicos/queries.ts`
**Depends on**: T21
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: SERV-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `getServicosParaAgendamento` nunca retorna o campo de preço
- [ ] `getServicosComPreco` retorna preço corretamente
- [ ] Teste unitário garantindo que o preço não vaza na primeira função
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T23: Tela de cadastro de serviços

**What**: Criar a tela onde o dono cadastra serviços e seus preços
internos.
**Where**: `src/app/(dashboard)/servicos/page.tsx`
**Depends on**: T22
**Reuses**: `src/features/servicos/actions.ts`, `src/shared/ui`
**Requirement**: SERV-01, SERV-02, SERV-03

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Cadastro de serviço funciona pela UI
- [ ] Teste e2e: cadastro completo + validação de preço inválido
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T24: Server Action `criarAgendamento`

**What**: Implementar a criação de agendamento, validando que o
horário está dentro do expediente cadastrado.
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T23
**Reuses**: `src/features/horario-funcionamento/queries.ts`, `src/shared/supabase/server.ts`
**Requirement**: AGD-01, AGD-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Agendamento criado com status inicial "agendado"
- [ ] Rejeita horário fora do expediente
- [ ] Dois agendamentos simultâneos no mesmo horário são ambos aceitos sem bloqueio (comportamento aceito conforme spec/design)
- [ ] Testes unitários cobrindo os três ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T25: Server Action `editarAgendamento`

**What**: Implementar edição de agendamento existente (pet, serviço(s),
data/horário).
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T24
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Edição preserva o `id` original
- [ ] Alterações refletidas corretamente no banco
- [ ] Teste unitário cobrindo edição de cada campo
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T26: Server Action `cancelarAgendamento`

**What**: Implementar cancelamento como soft delete (muda status para
"cancelado", sem excluir o registro).
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T25
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Status muda para "cancelado"
- [ ] Registro permanece no banco (não é excluído)
- [ ] Teste unitário confirmando ambos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T27: Server Action `reabrirAgendamento`

**What**: Implementar reabertura de agendamento cancelado, voltando o
status para "agendado".
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T26
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Agendamento cancelado pode voltar a "agendado"
- [ ] Rejeita reabertura de agendamento que não está cancelado
- [ ] Teste unitário cobrindo os dois casos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T28: Server Action `concluirAgendamento`

**What**: Implementar marcação de agendamento como "concluído",
permitida independentemente da data/horário já ter passado.
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T27
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Agendamento futuro pode ser marcado como concluído (atendimento adiantado)
- [ ] Agendamento passado também pode ser marcado como concluído
- [ ] Teste unitário cobrindo os dois casos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T29: Query `getAgendamentosPorDia`

**What**: Implementar consulta que retorna os agendamentos de um dia
específico, para alimentar a visualização de horários ocupados.
**Where**: `src/features/agenda/queries.ts`
**Depends on**: T28
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Retorna todos os agendamentos do dia, incluindo cancelados (para exibição visual diferenciada)
- [ ] Teste unitário cobrindo dia vazio e dia com múltiplos agendamentos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T30: Componente de calendário/visualização de horários ocupados

**What**: Criar o componente visual que exibe os horários ocupados do
dia selecionado.
**Where**: `src/features/agenda/components/AgendaCalendario.tsx`
**Depends on**: T29
**Reuses**: `src/features/agenda/queries.ts`, `src/shared/ui`
**Requirement**: AGD-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Horários ocupados aparecem visualmente distintos dos livres
- [ ] Agendamentos cancelados não aparecem como "ocupados"
- [ ] Teste e2e cobrindo a exibição correta
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T31: Tela de criação/edição de agendamento

**What**: Criar a tela principal de agenda: criar, editar, cancelar,
reabrir e concluir agendamento, com botão desabilitado no clique até
confirmação (evitar duplo envio).
**Where**: `src/app/(dashboard)/agenda/page.tsx`
**Depends on**: T30
**Reuses**: `src/features/agenda/actions.ts`, `src/features/agenda/components/AgendaCalendario.tsx`, `src/shared/ui`
**Requirement**: AGD-01, AGD-03, AGD-04, AGD-05, AGD-06, AGD-07

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Fluxo completo funciona: criar → editar → cancelar → reabrir → concluir
- [ ] Botão de salvar fica desabilitado imediatamente após o clique
- [ ] Teste e2e cobrindo o fluxo completo de estados do agendamento
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T32: Server Action `registrarVacina`

**What**: Implementar registro de vacina aplicada com data de retorno
prevista.
**Where**: `src/features/vacinas/actions.ts`
**Depends on**: T31
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: VAC-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Vacina salva com data de aplicação e retorno previsto
- [ ] Rejeita datas inválidas (retorno anterior à aplicação)
- [ ] Teste unitário cobrindo os dois casos
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T33: Query `getVacinasPorPet`

**What**: Implementar consulta que retorna o histórico completo de
vacinas de um pet.
**Where**: `src/features/vacinas/queries.ts`
**Depends on**: T32
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: VAC-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Retorna todas as vacinas do pet, ordenadas por data
- [ ] Teste unitário cobrindo pet sem vacinas e com múltiplas vacinas
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T34: Tela de histórico/registro de vacina na ficha do pet

**What**: Criar a tela que exibe o histórico de vacinas do pet e permite
registrar uma nova.
**Where**: `src/app/(dashboard)/vacinas/page.tsx`
**Depends on**: T33
**Reuses**: `src/features/vacinas/actions.ts`, `src/shared/ui`
**Requirement**: VAC-01, VAC-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Histórico de vacinas exibido corretamente na ficha do pet
- [ ] Registro de nova vacina funciona pela UI
- [ ] Teste e2e cobrindo o fluxo completo
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T35: Server Action `registrarEntrada`

**What**: Implementar entrada de estoque, somando quantidade ao saldo
atual do produto.
**Where**: `src/features/estoque/actions.ts`
**Depends on**: T34
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: EST-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Saldo do produto aumenta corretamente
- [ ] Teste unitário cobrindo o cálculo de saldo
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T36: Server Action `registrarSaida`

**What**: Implementar saída de estoque, tratando-a automaticamente como
venda (calcula `valorTotal`), validando saldo disponível.
**Where**: `src/features/estoque/actions.ts`
**Depends on**: T35
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: EST-02, EST-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Saída calcula `valorTotal = precoUnitario × quantidade` corretamente
- [ ] Rejeita saída maior que o saldo disponível, com mensagem de saldo insuficiente
- [ ] Testes unitários cobrindo os dois ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T37: Query `getProdutos` (restrita ao papel dono)

**What**: Implementar consulta de produtos em estoque, com restrição de
acesso ao papel `dono` na própria Server Action (redundante à RLS).
**Where**: `src/features/estoque/queries.ts`
**Depends on**: T36
**Reuses**: `src/features/auth/queries.ts`, `src/shared/supabase/server.ts`
**Requirement**: EST-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `dono` recebe a lista de produtos normalmente
- [ ] `recepcionista` recebe erro/lista vazia (nunca dado real)
- [ ] Teste unitário cobrindo os dois papéis
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T38: Tela de estoque (restrita a dono)

**What**: Criar a tela de controle de estoque (entrada/saída de
produtos), acessível apenas ao dono.
**Where**: `src/app/(dashboard)/estoque/page.tsx`
**Depends on**: T37
**Reuses**: `src/features/estoque/actions.ts`, `src/shared/ui`
**Requirement**: EST-01, EST-02, EST-03, EST-04

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Fluxo completo de entrada/saída funciona pela UI
- [ ] `recepcionista` não vê o menu nem acessa a rota diretamente
- [ ] Teste e2e cobrindo os dois papéis
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full

---

### T39: Query `getRelatorioMensal`

**What**: Implementar a consulta que agrega, por mês, agendamentos
concluídos, cancelados e faturamento total (serviços + vendas de
estoque).
**Where**: `src/features/relatorios/queries.ts`
**Depends on**: T38
**Reuses**: `src/features/agenda/queries.ts`, `src/features/estoque/queries.ts`, `src/features/servicos/queries.ts`
**Requirement**: REL-01, REL-02, REL-03, REL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Contagem de concluídos e cancelados corretas e separadas
- [ ] Faturamento soma serviços concluídos + saídas de estoque do mês
- [ ] Mês sem dados retorna zero em todos os campos, sem erro
- [ ] Restrito ao papel `dono`
- [ ] Testes unitários cobrindo os quatro ACs
- [ ] `npm run test:unit` passa

**Tests**: unit
**Gate**: quick

---

### T40: Tela de relatório mensal navegável por mês

**What**: Criar a tela de dashboard/relatório, permitindo navegar para
qualquer mês anterior.
**Where**: `src/app/(dashboard)/relatorios/page.tsx`
**Depends on**: T39
**Reuses**: `src/features/relatorios/queries.ts`, `src/shared/ui`
**Requirement**: REL-01, REL-02, REL-03, REL-04, REL-05

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Navegação entre meses funciona e atualiza os dados exibidos
- [ ] `recepcionista` não acessa essa tela
- [ ] Teste e2e cobrindo navegação entre meses e restrição de papel
- [ ] `npm run test:e2e` passa

**Tests**: e2e
**Gate**: full
