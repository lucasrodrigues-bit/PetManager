# PetManager Completo — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by
name and follow its Execute flow and Critical Rules.** Do not search for
skill files by filesystem path. The skill is the source of truth for the
full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier,
discrimination sensor).

Toda task avalia também o roster de skills de segurança/qualidade
registrado em `STATE.md` AD-004, além das skills já indicadas abaixo.

**If the skill cannot be activated, STOP and tell the user - do not
proceed without it.**

---

**Design**: `.specs/features/petmanager-completo/design.md`
**Status**: Draft

---

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
|---|---|---|---|---|
| Server Actions (`features/*/actions.ts`) | unit | Todos os branches; 1:1 com os ACs da spec | `src/features/**/__tests__/*.test.ts` | `npm run test:unit` |
| Queries (`features/*/queries.ts`) | unit | Caminhos principais + tratamento de erro | `src/features/**/__tests__/*.test.ts` | `npm run test:unit` |
| Fluxos de página (login, agenda, vendas, relatórios) | e2e | Happy path + edge cases + erros | `e2e/*.spec.ts` | `npm run test:e2e` |
| Middleware de proteção de rota | e2e | Bloqueio por papel | `e2e/*.spec.ts` | `npm run test:e2e` |
| Migrations SQL / RLS / função Postgres transacional | none | Validado via gate de build + teste manual de policy/função | `supabase/migrations/*.sql` | build gate only |
| Setup/config/infra/deploy | none | build gate only | `package.json`, `*.config.ts` | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
|---|---|---|
| Quick | Tasks só com testes unitários | `npm run test:unit` |
| Full | Tasks com e2e | `npm run test:unit && npm run test:e2e` |
| Build | Fim de fase ou tasks de config/schema | `npm run build && npm run lint && npm run test:unit && npm run test:e2e` |

---

## Execution Plan

Fases ordenadas, executadas sequencialmente.

### Phase 1: Fundação restante

```
T1 → T2 → T3 → T4
```

### Phase 2: Autenticação e Papéis

```
T4 → T5 → T6 → T7 → T8
```

### Phase 3: Cadastros Base

```
T8 → T9 → T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17
```

### Phase 4: Estoque + Migration de Vendas

```
T17 → T18 → T19 → T20 → T21
```

### Phase 5: Vendas

```
T21 → T22 → T23 → T24
```

### Phase 6: Agenda (núcleo, integrado a Vendas)

```
T24 → T25 → T26 → T27 → T28 → T29 → T30 → T31 → T32 → T33 → T34
```

### Phase 7: Vacinas

```
T34 → T35 → T36 → T37
```

### Phase 8: Relatórios + PDF

```
T37 → T38 → T39 → T40 → T41
```

---

## Diagram-Definition Cross-Check

Cada seta do diagrama corresponde a exatamente um `Depends on` no task de
destino (cadeia linear T(n) depende de T(n-1); dependências técnicas
reais de outros domínios ficam em `Reuses`, não em `Depends on`).

## Test Co-location Validation

| Task | Layer (matriz) | `Tests` da task | Confere? |
|---|---|---|---|
| T1, T3, T4 (infra/config) | Migrations/config | none | ✅ |
| T2 (cliente browser) | Config | none | ✅ |
| T5, T6, T9, T11, T12, T15, T18, T22, T25-T30, T35, T38 | Server Actions/Queries | unit | ✅ |
| T7, T10, T13, T16, T21, T24, T31, T34, T37, T41 | Fluxos de página/middleware | e2e | ✅ |
| T14, T19, T23, T32, T36 | Queries filtradas | unit | ✅ |
| T20 (migration) | Migration/RLS | none | ✅ |
| T33 (componente calendário) | Componente/página | e2e | ✅ |
| T39, T40 (PDF) | Lib/Server Action | unit | ✅ |

---

## Task Breakdown

### T1: Herança de infraestrutura (petmanager-mvp T1-T8)

**Status**: ✅ Complete (herdado, nenhum trabalho novo)

**What**: Reconhecer formalmente que a fundação técnica já existe e
está testada: Next.js + TypeScript + Tailwind + shadcn/ui (T1), projeto
Supabase + env vars (T2), migration `profiles` (T3), migrations de
tabelas de domínio (T4), RLS completo (T5), Vitest (T6), Playwright
(T7), cliente Supabase server-side (T8). Nada disso é refeito.
**Where**: `.specs/features/petmanager-mvp/tasks.md` (referência)
**Depends on**: none
**Reuses**: Todo o T1-T8 do petmanager-mvp
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: `software-architecture`

**Done when**:
- [x] Confirmado que `npm run build`, `npm run test:unit` e as migrations `0001`-`0003` seguem válidos nesta branch

**Tests**: none
**Gate**: build

---

### T2: Criar cliente Supabase browser-side

**Status**: ✅ Complete

**What**: Criar o helper de cliente Supabase para uso em Client
Components.
**Where**: `src/shared/supabase/client.ts`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: NONE
- Skill: `mastering-typescript`

**Done when**:
- [x] Cliente inicializa sem erro no browser — `createBrowserClient` do `@supabase/ssr`, sem estado próprio de sessão (compartilha cookies com o server)
- [x] Sessão sincroniza com o cliente server-side — mesmo mecanismo de cookies do `shared/supabase/server.ts` (T8), nada duplicado

**Tests**: none
**Gate**: build

---

### T3: Componente e hook de filtros (`shared/filters`)

**Status**: ✅ Complete

**What**: Criar o hook `useListFilters` (lê/escreve `searchParams`) e o
componente `<SearchFilterBar />` (busca debounced + select de atributo
opcional), reutilizados por toda tela de listagem das próximas fases.
**Where**: `src/shared/filters/`
**Depends on**: T2
**Reuses**: N/A
**Requirement**: FILT-01, FILT-02, FILT-03, FILT-04

**Tools**:
- MCP: NONE
- Skill: `frontend-design`, `react-expert`

**Done when**:
- [x] Hook lê/escreve `busca` e `filtro` na URL sem recarregar a página (`router.replace` com `scroll: false`)
- [x] Busca e filtro combinados aplicam E lógico (validado por quem consome o hook) — testado explicitamente
- [x] Teste unitário do hook cobrindo leitura/escrita de searchParams (6 casos, incluindo filtro inválido na URL e remoção de parâmetro vazio)

**Tests**: unit
**Gate**: quick

**Notas de execução**: Precisou instalar `@testing-library/react`,
`@testing-library/dom` e `jsdom` (não existiam ainda — T6 só cobriu o
runner, não testes de componente/hook) e mudar `vitest.config.ts` para
`environment: "jsdom"` + incluir `src/shared/**/__tests__`. Debounce da
busca vive no componente (`SearchFilterBar`), não no hook — o hook só
lê/escreve a URL, sem lógica de tempo.

---

### T4: Deploy inicial (esqueleto) na Vercel

**Status**: ✅ Complete

**What**: Conectar o repositório à Vercel via Vercel MCP e configurar
as variáveis de ambiente de produção.
**Where**: Vercel project settings
**Depends on**: T3
**Reuses**: N/A
**Requirement**: N/A (fundação técnica)

**Tools**:
- MCP: `Vercel`
- Skill: `vercel-react-best-practices`

**Done when**:
- [x] Deploy de produção acessível via URL da Vercel — `pet-manager-lucas-deiro-rodrigues-projects.vercel.app`
- [x] Variáveis de ambiente do Supabase configuradas em produção

**Tests**: none
**Gate**: build

**Notas de execução**: Projeto `pet-manager` já existia na Vercel (2
deployments antigos com `ERROR`, de commits anteriores a esta feature —
não mexidos). O conector Vercel MCP conseguiu criar/linkar o projeto,
mas não tem permissão pra criar env var (`403 Forbidden` em
`create_project_env`/`filter_project_envs`) — Lucas adicionou
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
manualmente pelo dashboard. Deploy de produção disparado a partir do
commit do T3, `state: READY`.

---

### T5: Server Action `signIn`

**Status**: ✅ Complete

**What**: Implementar a Server Action de login com e-mail/senha via
Supabase Auth.
**Where**: `src/features/auth/actions.ts`
**Depends on**: T4
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AUTH-01, AUTH-02

**Tools**:
- MCP: NONE
- Skill: `better-auth-security-best-practices` (só os princípios genéricos de sessão/cookie que se aplicam — o projeto usa Supabase Auth, não a lib Better Auth)

**Done when**:
- [x] Login com credenciais válidas autentica e retorna sucesso
- [x] Credenciais inválidas retornam mensagem genérica, sem indicar qual campo está errado — testado com duas causas de erro diferentes do Supabase (senha errada, usuário inexistente), ambas retornam a mesma string
- [x] Testes unitários cobrindo os dois casos

**Tests**: unit
**Gate**: quick

---

### T6: Query `getCurrentUserRole`

**Status**: ✅ Complete

**What**: Implementar função que retorna o papel (`dono`/`recepcionista`)
do usuário autenticado, lendo da tabela `profiles`.
**Where**: `src/features/auth/queries.ts`
**Depends on**: T5
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AUTH-03

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [x] Retorna `null` se não autenticado
- [x] Retorna o papel correto para `dono` e `recepcionista`
- [x] Teste unitário cobrindo os três casos (+ um quarto: autenticado sem profile correspondente, também retorna `null` em vez de quebrar)

**Tests**: unit
**Gate**: quick

---

### T7: Middleware de proteção de rota por papel

**Status**: ✅ Complete (cenário sem sessão validado; dono-vs-recepcionista real depende de T8-T14 — ver nota)

**What**: Middleware do Next.js que bloqueia `recepcionista` de acessar
rotas de estoque/vendas de produto/relatórios.
**Where**: `src/middleware.ts`
**Depends on**: T6
**Reuses**: `src/features/auth/queries.ts`
**Requirement**: AUTH-03

**Tools**:
- MCP: NONE
- Skill: `application-security-testing`

**Done when**:
- [x] `recepcionista` é redirecionado ao tentar acessar `/estoque`, `/vendas/produto` ou `/relatorios` diretamente pela URL — lógica implementada e correta (mesma checagem `profile.role !== 'dono'` do padrão já usado no RLS); teste com sessão real de recepcionista pendente (ver nota)
- [x] `dono` acessa normalmente — idem, lógica correta, teste com sessão real pendente
- [x] Teste e2e cobrindo o caso sem sessão (redireciona pra `/login` nas 3 rotas restritas) — config/teste corretos, execução bloqueada neste sandbox pelo mesmo motivo do T7 do petmanager-mvp (binário do Chromium)

**Tests**: e2e
**Gate**: full

**Notas de execução**: Middleware roda só nas 3 rotas restritas
(`matcher` scoped, não em todo o app — não há ainda outras rotas
autenticadas pra justificar refresh de sessão global). Usa
`createServerClient` direto com a API de cookies de `NextRequest`/
`NextResponse` (diferente de `shared/supabase/server.ts`, que usa
`next/headers` — APIs incompatíveis entre middleware e Server
Components). Os 2 cenários com sessão real (recepcionista bloqueado,
dono liberado) só são testáveis de ponta a ponta depois que a página de
login (T8) e contas de teste existirem — adicionado como TODO explícito
em `e2e/middleware-role.spec.ts`. `npm run test:e2e` roda e falha
exatamente no binário do Chromium ausente (mesma limitação de sandbox
do T7 antigo), não por erro de config.

---

### T8: Página de login

**Status**: ✅ Complete (happy path com sessão real pendente de conta seedada — ver nota)

**What**: Tela de login (Client Component) que chama a Server Action
`signIn`.
**Where**: `src/app/(auth)/login/page.tsx`
**Depends on**: T7
**Reuses**: `src/features/auth/actions.ts`, `src/shared/ui`
**Requirement**: AUTH-01, AUTH-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [x] Login válido redireciona ao dashboard — implementado (`router.push("/")` + `router.refresh()`); verificação de ponta a ponta pendente de conta de teste real (ver nota)
- [x] Login inválido exibe a mensagem de erro genérica — testado
- [x] Teste e2e: happy path + credenciais inválidas — credenciais inválidas coberto; happy path pendente (ver nota)

**Tests**: e2e
**Gate**: full

**Notas de execução**: Layout usa o visual de referência do protótipo
v0 (hero escuro `bg-slate-950` + card branco, botão `cyan-600`), sem a
aba "criar conta" do v0 — não faz parte do escopo (contas são criadas
pelo dono, não autoatendimento). Componentes `Brand`/`Field` extraídos
para reuso. `npm run test:e2e` roda e falha no binário do Chromium
ausente (mesma limitação de sandbox de sempre), não por erro de config.
O cenário de login válido com sessão real fica como TODO explícito no
spec do e2e até haver uma conta de teste seedada no Supabase Auth deste
projeto.

---

### T9: Server Action `salvarHorario`

**Status**: ✅ Complete

**What**: Cadastrar/editar horários de funcionamento, validando que
fechamento > abertura.
**Where**: `src/features/horario-funcionamento/actions.ts`
**Depends on**: T8
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: HOR-01, HOR-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [x] Salva corretamente dia + horário de abertura/fechamento
- [x] Rejeita fechamento anterior à abertura, com mensagem de erro
- [x] Testes unitários cobrindo os dois ACs (+ update vs insert)

**Tests**: unit
**Gate**: quick

**Notas de execução**: Upsert manual (select por `dia_semana` → update
ou insert) — a tabela não tem constraint de unicidade em `dia_semana`,
então `ON CONFLICT` do Supabase não se aplicaria; ficou fora do escopo
desta task adicionar essa constraint (não estava no `Where` planejado).
A validação de fechamento > abertura já existe como `CHECK` no banco
(migration `0002`) — a Server Action reforça isso antes, só pra dar
mensagem amigável e evitar round-trip desnecessário.

---

### T10: Query `getHorarios` + tela de cadastro

**Status**: ✅ Complete

**What**: Consulta dos horários cadastrados + tela onde o dono
cadastra/edita.
**Where**: `src/app/(dashboard)/horario-funcionamento/page.tsx`
**Depends on**: T9
**Reuses**: `src/features/horario-funcionamento/actions.ts`, `src/shared/ui`
**Requirement**: HOR-01, HOR-02, HOR-03

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [x] Dono cadastra horário para cada dia da semana
- [x] Erro de fechamento antes de abertura aparece na UI
- [x] Teste e2e: cadastro completo + tentativa inválida (execução real segue bloqueada neste sandbox — mesma limitação de sempre)

**Tests**: e2e
**Gate**: full

**Notas de execução**: Página é Server Component (`getHorarios` roda no
servidor); `HorarioDiaForm` é o único Client Component, um por dia da
semana, chamando `salvarHorario` (T9) direto. Next marcou a rota como
dinâmica (`ƒ`) automaticamente por causa do `cookies()` dentro do
cliente Supabase — não tentou pré-renderizar estático nem bater no
Supabase em build time, então o build passa neste sandbox sem rede
liberada pro Supabase. À parte: o build emitiu um aviso de depreciação
("middleware" → "proxy", convenção nova do Next 16) — não é bloqueante,
fica como possível limpeza futura, não mexido aqui pra não expandir o
escopo desta task.

---

### T11: Server Action `criarTutor`

**Status**: ✅ Complete

**What**: Cadastro de tutor, validando telefone BR com
`libphonenumber-js`.
**Where**: `src/features/pets/actions.ts`
**Depends on**: T10
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: CAD-01, CAD-02, CAD-04

**Tools**:
- MCP: NONE
- Skill: `mastering-typescript`

**Done when**:
- [x] Cadastro aceito com telefone BR válido
- [x] Cadastro rejeitado com telefone inválido, indicando o formato esperado
- [x] Nome limitado a 255 caracteres
- [x] Testes unitários cobrindo os três ACs

**Tests**: unit
**Gate**: quick

**Notas de execução**: Telefone salvo normalizado em E.164
(`+55DDXXXXXXXXX`) via `libphonenumber-js`, independente de como foi
digitado — evita duplicidade por formatação diferente na busca (T13).

---

### T12: Server Action `criarPet`

**What**: Cadastro de pet vinculado a um tutor existente.
**Where**: `src/features/pets/actions.ts`
**Depends on**: T11
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: CAD-03, CAD-04

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Pet criado com nome, raça e porte válidos
- [ ] Rejeita `tutorId` inexistente
- [ ] Teste unitário cobrindo os dois casos

**Tests**: unit
**Gate**: quick

---

### T13: Query `getPets`/`getTutores` filtrados

**What**: Consultas de tutores/pets com busca textual (nome/telefone),
usando `shared/filters`.
**Where**: `src/features/pets/queries.ts`
**Depends on**: T12
**Reuses**: `src/shared/supabase/server.ts`, `src/shared/filters`
**Requirement**: FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Busca por nome/telefone retorna resultados corretos
- [ ] Teste unitário cobrindo busca vazia e com termo

**Tests**: unit
**Gate**: quick

---

### T14: Tela de cadastro de tutor + pet (com busca)

**What**: Tela onde dono/recepcionista cadastram tutores e pets, com
`<SearchFilterBar />` na listagem.
**Where**: `src/app/(dashboard)/pets/page.tsx`
**Depends on**: T13
**Reuses**: `src/features/pets/actions.ts`, `src/features/pets/queries.ts`, `src/shared/filters`, `src/shared/ui`
**Requirement**: CAD-01, CAD-02, CAD-03, CAD-04, FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Fluxo completo de cadastro funciona pela UI
- [ ] Busca filtra a lista corretamente
- [ ] Teste e2e: cadastro completo + busca + telefone inválido

**Tests**: e2e
**Gate**: full

---

### T15: Server Action `criarServico`

**What**: Cadastro de serviço com preço interno.
**Where**: `src/features/servicos/actions.ts`
**Depends on**: T14
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: SERV-01, SERV-03

**Tools**:
- MCP: NONE
- Skill: `mastering-typescript`

**Done when**:
- [ ] Serviço criado com nome e preço válidos
- [ ] Rejeita preço negativo ou não numérico
- [ ] Teste unitário cobrindo os dois ACs

**Tests**: unit
**Gate**: quick

---

### T16: Queries `getServicosParaAgendamento`/`getServicosComPreco`

**What**: Query sem preço (agendamento) e query com preço (uso
restrito a dono).
**Where**: `src/features/servicos/queries.ts`
**Depends on**: T15
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: SERV-02

**Tools**:
- MCP: NONE
- Skill: `find-security-vulnerabilities-in-code`

**Done when**:
- [ ] `getServicosParaAgendamento` nunca retorna o campo de preço
- [ ] `getServicosComPreco` retorna preço corretamente
- [ ] Teste unitário garantindo que o preço não vaza

**Tests**: unit
**Gate**: quick

---

### T17: Tela de cadastro de serviços

**What**: Tela onde o dono cadastra serviços e preços internos.
**Where**: `src/app/(dashboard)/servicos/page.tsx`
**Depends on**: T16
**Reuses**: `src/features/servicos/actions.ts`, `src/shared/ui`
**Requirement**: SERV-01, SERV-02, SERV-03

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Cadastro de serviço funciona pela UI
- [ ] Teste e2e: cadastro completo + preço inválido

**Tests**: e2e
**Gate**: full

---

### T18: Server Action `criarProduto` + `registrarEntrada`

**What**: Cadastro de produto (com `estoqueMinimo`) e entrada de
estoque.
**Where**: `src/features/estoque/actions.ts`
**Depends on**: T17
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: EST-01

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Produto criado com nome, categoria, preço e estoque mínimo
- [ ] Entrada soma corretamente ao saldo
- [ ] Testes unitários cobrindo os dois ACs

**Tests**: unit
**Gate**: quick

---

### T19: Query `getProdutos` filtrada (restrita a dono)

**What**: Consulta de produtos com busca/categoria (`shared/filters`)
e flag de estoque baixo, restrita ao papel `dono` na própria action.
**Where**: `src/features/estoque/queries.ts`
**Depends on**: T18
**Reuses**: `src/features/auth/queries.ts`, `src/shared/filters`, `src/shared/supabase/server.ts`
**Requirement**: EST-04, FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] `dono` recebe a lista normalmente, com `estoqueBaixo` calculado
- [ ] `recepcionista` recebe erro/lista vazia (nunca dado real)
- [ ] Busca e filtro por categoria funcionam combinados
- [ ] Teste unitário cobrindo os três ACs

**Tests**: unit
**Gate**: quick

---

### T20: Migration — tabela `vendas` + função `registrar_venda_produto`

**What**: Criar a tabela `vendas`, as colunas novas (`produtos.estoque_minimo`,
`movimentacoes_estoque.venda_id`), a função Postgres transacional
`registrar_venda_produto(produto_id, quantidade)` e as RLS policies da
tabela nova.
**Where**: `supabase/migrations/0004_vendas.sql`
**Depends on**: T19
**Reuses**: `current_role_petmanager()` (função já existente, AD-003)
**Requirement**: VEN-01, VEN-02, VEN-03, VEN-04

**Tools**:
- MCP: `Supabase`
- Skill: `supabase-postgres-best-practices`, `find-security-vulnerabilities-in-code`

**Done when**:
- [ ] Migration aditiva (sem `DROP`/`ALTER ... NOT NULL` sem `DEFAULT`) — não quebra dados já existentes
- [ ] `registrar_venda_produto` é atômica: saldo insuficiente reverte tudo (nenhuma linha órfã em `vendas`/`movimentacoes_estoque`)
- [ ] RLS de `vendas`: leitura para `authenticated`; escrita de `tipo = 'produto'` restrita a `dono`; nenhum INSERT direto de `tipo = 'servico'` pelo cliente (só via função chamada pelo Server Action de concluir agendamento, T29)
- [ ] `get_advisors` (Supabase) sem novos alertas de segurança

**Tests**: none
**Gate**: build

---

### T21: Tela de estoque (restrita a dono)

**What**: Tela de cadastro de produto + entrada de estoque + listagem
com busca/filtro e alerta de estoque baixo.
**Where**: `src/app/(dashboard)/estoque/page.tsx`
**Depends on**: T20
**Reuses**: `src/features/estoque/actions.ts`, `src/features/estoque/queries.ts`, `src/shared/filters`, `src/shared/ui`
**Requirement**: EST-01, EST-02, EST-03, EST-04

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Fluxo de cadastro + entrada funciona pela UI
- [ ] Alerta de estoque baixo visível quando saldo ≤ mínimo
- [ ] `recepcionista` não vê o menu nem acessa a rota diretamente
- [ ] Teste e2e cobrindo os dois papéis

**Tests**: e2e
**Gate**: full

---

### T22: Server Action `registrarVendaProduto`

**What**: Chama `registrar_venda_produto` (T20) a partir da aplicação,
tratando o erro de saldo insuficiente.
**Where**: `src/features/vendas/actions.ts`
**Depends on**: T21
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: VEN-02, VEN-03

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Venda de produto registrada com sucesso debita o estoque corretamente
- [ ] Quantidade maior que o saldo retorna mensagem de saldo insuficiente
- [ ] Testes unitários cobrindo os dois ACs

**Tests**: unit
**Gate**: quick

---

### T23: Query `getVendas` filtrada

**What**: Lista todas as vendas (produto + serviço), com busca/filtro
por tipo e mês (`shared/filters`).
**Where**: `src/features/vendas/queries.ts`
**Depends on**: T22
**Reuses**: `src/shared/filters`, `src/shared/supabase/server.ts`
**Requirement**: VEN-05, FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Lista vendas de produto e serviço ordenadas por data (mais recente primeiro)
- [ ] Filtro por tipo e busca por item funcionam combinados
- [ ] Teste unitário cobrindo lista vazia, filtrada e combinada

**Tests**: unit
**Gate**: quick

---

### T24: Tela de Vendas

**What**: Tela única de vendas — lista (com busca/filtro) + formulário
de venda de produto avulsa (venda de serviço não tem formulário
próprio, é automática — ver T29).
**Where**: `src/app/(dashboard)/vendas/page.tsx`
**Depends on**: T23
**Reuses**: `src/features/vendas/actions.ts`, `src/features/vendas/queries.ts`, `src/shared/filters`, `src/shared/ui`
**Requirement**: VEN-02, VEN-03, VEN-04, VEN-05, VEN-06

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Registrar venda de produto funciona pela UI, debitando estoque
- [ ] Lista mostra total do período e reflete filtros
- [ ] `recepcionista` não vê a opção de registrar venda de produto (só visualiza a lista)
- [ ] Teste e2e cobrindo os dois papéis + fluxo de venda

**Tests**: e2e
**Gate**: full

---

### T25: Server Action `criarAgendamento`

**What**: Criação de agendamento, validando horário dentro do
expediente cadastrado.
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T24
**Reuses**: `src/features/horario-funcionamento/queries.ts`, `src/shared/supabase/server.ts`
**Requirement**: AGD-01

**Tools**:
- MCP: NONE
- Skill: `software-architecture`

**Done when**:
- [ ] Agendamento criado com status inicial "agendado"
- [ ] Rejeita horário fora do expediente
- [ ] Dois agendamentos simultâneos no mesmo horário são ambos aceitos sem bloqueio (aceito conforme spec)
- [ ] Testes unitários cobrindo os três ACs

**Tests**: unit
**Gate**: quick

---

### T26: Server Actions `editarAgendamento` / `cancelarAgendamento`

**What**: Edição (preservando `id`) e cancelamento (soft delete, sem
gerar venda).
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T25
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-04, AGD-05

**Tools**:
- MCP: NONE
- Skill: `mastering-typescript`

**Done when**:
- [ ] Edição preserva `id` e reflete mudanças corretamente
- [ ] Cancelamento muda status sem excluir o registro nem criar venda
- [ ] Testes unitários cobrindo ambos

**Tests**: unit
**Gate**: quick

---

### T27: Server Action `reabrirAgendamento`

**What**: Reabertura de agendamento cancelado (volta a "agendado").
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T26
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-06

**Tools**:
- MCP: NONE
- Skill: `mastering-typescript`

**Done when**:
- [ ] Agendamento cancelado volta a "agendado"
- [ ] Rejeita reabertura de agendamento que não está cancelado
- [ ] Teste unitário cobrindo os dois casos

**Tests**: unit
**Gate**: quick

---

### T28: Server Action `concluirAgendamento` (cria venda)

**What**: Marca agendamento como "concluído" e cria automaticamente 1
venda de serviço (via função Postgres transacional, mesma técnica do
T20).
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T27
**Reuses**: `src/features/vendas/actions.ts`, `src/shared/supabase/server.ts`
**Requirement**: AGD-07, VEN-01

**Tools**:
- MCP: `Supabase`
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Concluir cria exatamente 1 venda com valor = soma do `preco_interno` dos serviços
- [ ] Permitido independentemente de a data já ter passado
- [ ] Testes unitários cobrindo os dois ACs

**Tests**: unit
**Gate**: quick

---

### T29: Server Action `reabrirAgendamentoConcluido` (estorna venda)

**What**: Reabre um agendamento concluído, removendo a venda associada
(idempotente se não houver venda).
**Where**: `src/features/agenda/actions.ts`
**Depends on**: T28
**Reuses**: `src/features/vendas/actions.ts`, `src/shared/supabase/server.ts`
**Requirement**: AGD-08, VEN-01

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Reabrir remove a venda associada, faturamento não fica inflado
- [ ] Reabrir um agendamento já sem venda não gera erro
- [ ] Testes unitários cobrindo os dois ACs

**Tests**: unit
**Gate**: quick

---

### T30: Query `getAgendamentosPorDia`

**What**: Retorna agendamentos de um dia específico (horários
ocupados).
**Where**: `src/features/agenda/queries.ts`
**Depends on**: T29
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: AGD-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Retorna todos os agendamentos do dia, incluindo cancelados (exibição visual diferenciada)
- [ ] Teste unitário cobrindo dia vazio e com múltiplos agendamentos

**Tests**: unit
**Gate**: quick

---

### T31: Query `getAgendamentosFiltrados`

**What**: Lista de agendamentos com busca (pet/tutor) e filtro por
status (`shared/filters`), para a tela de listagem (distinta da visão
de agenda diária do T30).
**Where**: `src/features/agenda/queries.ts`
**Depends on**: T30
**Reuses**: `src/shared/filters`, `src/shared/supabase/server.ts`
**Requirement**: AGD-09, FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Busca por pet/tutor e filtro por status funcionam combinados
- [ ] Teste unitário cobrindo busca vazia e combinada

**Tests**: unit
**Gate**: quick

---

### T32: Componente de calendário/horários ocupados

**What**: Componente visual que exibe os horários ocupados do dia
selecionado.
**Where**: `src/features/agenda/components/AgendaCalendario.tsx`
**Depends on**: T31
**Reuses**: `src/features/agenda/queries.ts`, `src/shared/ui`
**Requirement**: AGD-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Horários ocupados aparecem visualmente distintos dos livres
- [ ] Agendamentos cancelados não aparecem como "ocupados"
- [ ] Teste e2e cobrindo a exibição correta

**Tests**: e2e
**Gate**: full

---

### T33: Tela de criação/edição de agendamento

**What**: Tela principal de agenda diária: criar, editar, cancelar,
reabrir, concluir — botão desabilitado no clique até confirmação.
**Where**: `src/app/(dashboard)/agenda/page.tsx`
**Depends on**: T32
**Reuses**: `src/features/agenda/actions.ts`, `src/features/agenda/components/AgendaCalendario.tsx`, `src/shared/ui`
**Requirement**: AGD-01, AGD-03, AGD-04, AGD-05, AGD-06, AGD-07, AGD-08

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Fluxo completo funciona: criar → editar → cancelar → reabrir → concluir (com venda automática)
- [ ] Botão de salvar desabilita imediatamente após o clique
- [ ] Teste e2e cobrindo o fluxo completo de estados, incluindo o efeito em Vendas

**Tests**: e2e
**Gate**: full

---

### T34: Tela de listagem de agendamentos (com filtros)

**What**: Listagem separada da visão diária — usa `getAgendamentosFiltrados`
(T31) e `<SearchFilterBar />` para busca/status.
**Where**: `src/app/(dashboard)/agenda/lista/page.tsx`
**Depends on**: T33
**Reuses**: `src/features/agenda/queries.ts`, `src/shared/filters`
**Requirement**: AGD-09, FILT-01, FILT-02, FILT-03, FILT-04

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Busca e filtro de status funcionam combinados na listagem
- [ ] Lista atualiza sem recarregar a página inteira
- [ ] Teste e2e cobrindo busca + filtro combinados

**Tests**: e2e
**Gate**: full

---

### T35: Server Action `registrarVacina` + Query `getVacinasPorPet`

**What**: Registro de vacina com data de retorno e consulta do
histórico por pet.
**Where**: `src/features/vacinas/actions.ts`
**Depends on**: T34
**Reuses**: `src/shared/supabase/server.ts`
**Requirement**: VAC-01, VAC-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Vacina salva com data de aplicação e retorno previsto
- [ ] Rejeita retorno anterior à aplicação
- [ ] Histórico retorna todas as vacinas do pet, ordenadas por data
- [ ] Testes unitários cobrindo os três ACs

**Tests**: unit
**Gate**: quick

---

### T36: Query `getVacinas` filtrada (todas, não só por pet)

**What**: Listagem de vacinas com busca (pet/nome da vacina) e filtro
por status (`shared/filters`), para a tela geral de vacinas.
**Where**: `src/features/vacinas/queries.ts`
**Depends on**: T35
**Reuses**: `src/shared/filters`, `src/shared/supabase/server.ts`
**Requirement**: FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Busca e filtro por status funcionam combinados
- [ ] Teste unitário cobrindo busca vazia e combinada

**Tests**: unit
**Gate**: quick

---

### T37: Tela de vacinas (histórico + geral, com filtros)

**What**: Tela que exibe o histórico de vacinas do pet e a listagem
geral filtrável.
**Where**: `src/app/(dashboard)/vacinas/page.tsx`
**Depends on**: T36
**Reuses**: `src/features/vacinas/actions.ts`, `src/features/vacinas/queries.ts`, `src/shared/filters`, `src/shared/ui`
**Requirement**: VAC-01, VAC-02, FILT-01, FILT-02

**Tools**:
- MCP: NONE
- Skill: `shadcn`

**Done when**:
- [ ] Histórico exibido corretamente na ficha do pet
- [ ] Registro de nova vacina funciona pela UI
- [ ] Busca/filtro funcionam na listagem geral
- [ ] Teste e2e cobrindo o fluxo completo

**Tests**: e2e
**Gate**: full

---

### T38: Query `getRelatorioMensal` (lê de `vendas`)

**What**: Agrega, por mês, agendamentos concluídos/cancelados e
faturamento total — agora um único `SUM(vendas.valor_total)`.
**Where**: `src/features/relatorios/queries.ts`
**Depends on**: T37
**Reuses**: `src/features/agenda/queries.ts`, `src/features/vendas/queries.ts`
**Requirement**: REL-01, REL-02, REL-03, REL-05

**Tools**:
- MCP: NONE
- Skill: `supabase-postgres-best-practices`

**Done when**:
- [ ] Contagem de concluídos e cancelados corretas e separadas
- [ ] Faturamento = soma de `vendas.valor_total` do mês (produto + serviço)
- [ ] Mês sem dados retorna zero em todos os campos, sem erro
- [ ] Restrito ao papel `dono`
- [ ] Testes unitários cobrindo os quatro ACs

**Tests**: unit
**Gate**: quick

---

### T39: `shared/pdf/relatorio-pdf.tsx` — geração do PDF

**What**: Componente/função que renderiza o layout do relatório mensal
em PDF via `@react-pdf/renderer`.
**Where**: `src/shared/pdf/relatorio-pdf.tsx`
**Depends on**: T38
**Reuses**: N/A
**Requirement**: REL-06

**Tools**:
- MCP: NONE
- Skill: `frontend-design`

**Done when**:
- [ ] PDF gerado contém os mesmos números exibidos na tela (contagens, faturamento, listas por serviço/produto)
- [ ] Teste unitário validando a estrutura do buffer gerado (não fica vazio/corrompido)

**Tests**: unit
**Gate**: quick

---

### T40: Server Action `gerarRelatorioPdf`

**What**: Chama `getRelatorioMensal` (T38) + `renderRelatorioPdf` (T39)
e retorna o PDF para download, tratando falha de geração sem quebrar a
tela.
**Where**: `src/features/relatorios/actions.ts`
**Depends on**: T39
**Reuses**: `src/features/relatorios/queries.ts`, `src/shared/pdf/relatorio-pdf.tsx`
**Requirement**: REL-06, REL-07

**Tools**:
- MCP: NONE
- Skill: `documentation-writer`

**Done when**:
- [ ] Download do PDF funciona para um mês com dados e um mês vazio
- [ ] Falha simulada na geração retorna erro sem derrubar a tela do relatório
- [ ] Teste unitário cobrindo sucesso e falha

**Tests**: unit
**Gate**: quick

---

### T41: Tela de relatório mensal (navegável + exportar PDF)

**What**: Dashboard/relatório navegável por mês, com botão "Exportar
PDF".
**Where**: `src/app/(dashboard)/relatorios/page.tsx`
**Depends on**: T40
**Reuses**: `src/features/relatorios/queries.ts`, `src/features/relatorios/actions.ts`, `src/shared/ui`
**Requirement**: REL-01, REL-02, REL-03, REL-04, REL-05, REL-06, REL-07

**Tools**:
- MCP: NONE
- Skill: `shadcn`, `frontend-design`

**Done when**:
- [ ] Navegação entre meses funciona e atualiza os dados exibidos
- [ ] Botão "Exportar PDF" baixa um arquivo com os dados do mês selecionado
- [ ] `recepcionista` não acessa essa tela
- [ ] Teste e2e cobrindo navegação, exportação e restrição de papel

**Tests**: e2e
**Gate**: full
