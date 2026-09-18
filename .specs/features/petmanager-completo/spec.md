# PetManager — Especificação Completa (pós-validação com V0)

> Substitui `.specs/features/petmanager-mvp/` como fonte da verdade a
> partir daqui. O MVP permanece documentado (histórico + T1-T8, infra
> real já construída: Next.js, Supabase, RLS, Vitest, Playwright,
> cliente Supabase server-side — nada disso é refeito). Esta spec
> incorpora o aprendizado de um protótipo feito no v0.dev, usado só
> para validar visual/fluxo com donos de petshop (código do protótipo
> não é reaproveitado — ver AD-006 em `STATE.md`).

## Problem Statement

Petshops pequenos e médios de Aracaju/Barra dos Coqueiros controlam
agendamento de banho/tosa, vacinas, estoque e vendas manualmente
(caderno, WhatsApp), sem visão organizada de faturamento mensal. O
PetManager substitui esse controle manual por um sistema completo,
vendável a múltiplos petshops (cada um com seu próprio deploy —
single-tenant, decisão confirmada e mantida).

## Goals

- [ ] Dono de petshop consegue gerenciar agenda, cadastros, vacinas,
      estoque e vendas sem depender de caderno/WhatsApp.
- [ ] Dono consegue ver, ao final do mês, quantos serviços foram
      realizados/cancelados, quanto vendeu (produto + serviço) e qual
      foi o faturamento total — e exportar isso como PDF.
- [ ] Qualquer lista principal do sistema é filtrável/buscável, não só
      uma listagem estática.
- [ ] Software vendável de verdade a múltiplos petshops (cada um com
      seu próprio deploy), com segurança adequada a um produto pago.

## Out of Scope

Explicitamente excluído desta versão. Documentado para prevenir scope
creep.

| Feature | Reason |
|---|---|
| Pagamento online | Não é dor prioritária; complexidade de gateway não se justifica ainda |
| Multi-tenant (múltiplos petshops na mesma base) | Reconfirmado como fora de escopo — cada petshop tem seu próprio deploy/projeto Supabase |
| Múltiplas unidades/filiais do petshop | Fora do escopo do nicho-alvo (unidade única) |
| Agenda separada por funcionário/tosador | Agenda única do estabelecimento, para reduzir complexidade |
| Autoatendimento do tutor | Tutor não acessa o sistema nesta versão |
| Chatbot WhatsApp (mesmo em modo triagem) | Feature separada, pós-validação comercial |
| Rate limiting / API pública | Sistema interno, sem API exposta publicamente |
| Trilha de auditoria completa (log de "quem alterou o quê" por campo) | `vendas`/`movimentacoes_estoque` já registram `criado_por`; log de campo-a-campo fica para versão futura |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Single-tenant vs multi-tenant | Single-tenant (1 deploy = 1 petshop) | Confirmado explicitamente pelo usuário nesta rodada | y |
| Escopo desta versão | Expandido: + Área de Vendas unificada, + filtros de pesquisa em todas as listas, + exportação de relatório em PDF | Confirmado explicitamente pelo usuário | y |
| Geração de PDF | Server-side, biblioteca pura JS (sem headless browser) — ver Tech Decisions em `design.md` | Vercel serverless não comporta bem Puppeteer/Chromium; lib pura JS é leve e determinística | n |
| Falha de rede/Supabase indisponível ao salvar | Mensagem de erro genérica, dados preenchidos preservados no formulário | Herdado do MVP, ainda válido | y |
| Concorrência de horário na agenda | Não tratado ativamente (sem lock de banco) | Herdado do MVP — risco aceito, 1-2 usuários internos por petshop | y |
| Funcionário desligado (recepcionista) | Conta desativada (soft-disable), não excluída | Herdado do MVP | n |
| Protótipo v0.dev | Usado só como referência de UX (dashboard, navegação, paleta) — código não reaproveitado | v0 não tem backend real, papéis, horário de funcionamento, preço oculto nem trilha de estoque — ver AD-006 | y |

**Open questions:** none — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Autenticação e Papéis ⭐ (herdada do MVP, sem mudança)

**User Story**: Como dono de petshop, quero que cada pessoa da equipe
tenha seu próprio login com permissões diferentes, para controlar quem
acessa estoque, vendas de produto e relatórios financeiros.

**Acceptance Criteria**:

1. WHEN um usuário faz login com e-mail e senha válidos THEN o sistema SHALL autenticá-lo e redirecioná-lo ao dashboard correspondente ao seu papel (`dono` ou `recepcionista`).
2. IF as credenciais forem inválidas THEN o sistema SHALL exibir mensagem "E-mail ou senha inválidos" sem indicar qual dos dois campos está incorreto.
3. WHILE o usuário autenticado tiver papel `recepcionista`, o sistema SHALL ocultar e bloquear (via RLS) o acesso às rotas de estoque, venda de produto e relatórios.
4. The system SHALL restringir toda política de RLS por `(select auth.uid())`, nunca chamando a função de autenticação linha a linha.

**Independent Test**: Criar um usuário `dono` e um `recepcionista`; logar com cada um e confirmar que o `recepcionista` não vê os menus de estoque/vendas de produto/relatórios nem consegue acessar as rotas diretamente pela URL.

---

### P1: Cadastro de Horário de Funcionamento ⭐ (herdada, sem mudança)

**User Story**: Como dono, quero cadastrar os dias e horários de
funcionamento do petshop, para que a agenda só ofereça horários dentro
do expediente.

**Acceptance Criteria**:

1. WHEN o dono cadastra ou edita os horários de funcionamento THEN o sistema SHALL salvar os dias da semana e o intervalo de horário (abertura/fechamento) para cada um.
2. IF o dono tentar salvar um intervalo com hora de fechamento anterior à hora de abertura THEN o sistema SHALL rejeitar o salvamento e exibir mensagem de erro explicando o problema.
3. The system SHALL usar os horários cadastrados como base para os slots exibidos na tela de Agenda.

**Independent Test**: Cadastrar horário de segunda a sábado, 9h-18h; confirmar que a tela de agenda só oferece slots dentro dessa janela e que domingo não aparece disponível.

---

### P1: Cadastro de Pet + Tutor ⭐ (herdada, sem mudança)

**User Story**: Como dono/recepcionista, quero cadastrar tutores e seus
pets, para vincular agendamentos, vacinas e vendas ao animal certo.

**Acceptance Criteria**:

1. WHEN um novo tutor é cadastrado THEN o sistema SHALL exigir nome e telefone/WhatsApp em formato brasileiro válido (DDD + número).
2. IF o telefone informado não seguir o formato brasileiro válido THEN o sistema SHALL rejeitar o cadastro e indicar o formato esperado.
3. WHEN um novo pet é cadastrado THEN o sistema SHALL exigir nome, raça e porte (pequeno/médio/grande), vinculados a um tutor já existente.
4. The system SHALL limitar campos de texto livre a 255 caracteres.

**Independent Test**: Cadastrar um tutor com telefone inválido (rejeitado) e um válido (aceito); cadastrar um pet vinculado e confirmar que aparece na busca de pets (ver Filtros de Pesquisa).

---

### P1: Cadastro de Serviços ⭐ (herdada, sem mudança)

**User Story**: Como dono, quero cadastrar os serviços oferecidos
(banho, tosa etc.) com um preço interno, para usar esse valor na venda
e no relatório sem expor preço na tela de agendamento.

**Acceptance Criteria**:

1. WHEN o dono cadastra um serviço THEN o sistema SHALL salvar nome e preço interno (`preco_interno`).
2. The system SHALL NOT exibir o preço do serviço na tela de criação/edição de agendamento.
3. IF o preço informado for negativo ou não numérico THEN o sistema SHALL rejeitar o cadastro.

**Independent Test**: Cadastrar o serviço "Banho" com preço R$ 40; confirmar que aparece na lista de serviços ao criar um agendamento, mas sem valor visível nessa tela.

---

### P1: Agenda de Agendamentos ⭐ (herdada, +1 critério novo de integração com Vendas)

**User Story**: Como dono/recepcionista, quero criar, editar e cancelar
agendamentos de banho/tosa visualizando os horários já ocupados, para
substituir o controle manual em caderno/WhatsApp.

**Acceptance Criteria**:

1. WHEN dono/recepcionista cria um agendamento THEN o sistema SHALL vincular um pet, um ou mais serviços e uma data/horário dentro do expediente cadastrado, com status inicial "agendado".
2. WHILE o usuário estiver criando/editando um agendamento, o sistema SHALL exibir visualmente os horários já ocupados no dia selecionado.
3. WHEN o botão de salvar agendamento é clicado THEN o sistema SHALL desabilitá-lo imediatamente até a confirmação do salvamento, prevenindo duplo envio.
4. WHEN dono/recepcionista edita um agendamento existente THEN o sistema SHALL permitir alterar pet, serviço(s) e data/horário, preservando o `id` do registro original.
5. WHEN dono/recepcionista cancela um agendamento THEN o sistema SHALL alterar seu status para "cancelado" sem excluí-lo do histórico (soft delete), e SHALL NOT gerar registro em `vendas`.
6. WHEN dono/recepcionista reabre um agendamento cancelado THEN o sistema SHALL permitir retorná-lo ao status "agendado".
7. WHEN dono/recepcionista marca um agendamento como "concluído" THEN o sistema SHALL permitir essa transição independentemente da data/horário já terem ocorrido, e SHALL criar automaticamente um registro em `vendas` (tipo `servico`, valor = soma do `preco_interno` dos serviços do agendamento) — **novo, substitui o cálculo direto de faturamento a partir de agendamentos concluídos que existia no MVP**.
8. IF um agendamento concluído for reaberto/cancelado após já ter gerado uma venda THEN o sistema SHALL estornar (remover) a venda associada, para não inflar o faturamento.
9. IF dois usuários tentarem salvar agendamentos no mesmo horário quase simultaneamente THEN o sistema SHALL aceitar ambos sem bloqueio ativo de concorrência (risco aceito).

**Independent Test**: Criar, editar, cancelar, reabrir e concluir um agendamento; confirmar que concluir gera 1 venda em `vendas`, e que reabrir depois de concluído remove essa venda.

---

### P1: Controle de Vacina/Retorno ⭐ (herdada, sem mudança)

**User Story**: Como dono/recepcionista, quero registrar vacinas
aplicadas e sua data de retorno prevista, para não perder o controle de
reforços.

**Acceptance Criteria**:

1. WHEN uma vacina é registrada para um pet THEN o sistema SHALL salvar data de aplicação e data prevista de retorno.
2. The system SHALL exibir, na ficha do pet, o histórico completo de vacinas aplicadas (sem limite de retenção).

**Independent Test**: Registrar duas vacinas para o mesmo pet em datas diferentes; confirmar que ambas aparecem na ficha do pet.

---

### P1: Controle de Estoque (revisada — saída de estoque agora é sempre via Vendas)

**User Story**: Como dono, quero controlar entrada de produtos e saber o
saldo disponível, para não vender o que não tenho.

**Acceptance Criteria**:

1. WHEN o dono registra entrada de estoque THEN o sistema SHALL somar a quantidade informada ao saldo atual do produto e SHALL registrar a entrada em `movimentacoes_estoque`.
2. The system SHALL NOT permitir dar saída em estoque diretamente — toda saída SHALL ocorrer exclusivamente através do registro de uma venda de produto (ver P1: Área de Vendas), garantindo que todo produto que sai também vira faturamento rastreado.
3. The system SHALL restringir o acesso a cadastro de produto e movimentação de estoque exclusivamente ao papel `dono`.
4. The system SHALL exibir alerta visual quando o saldo de um produto estiver igual ou abaixo do seu estoque mínimo cadastrado.

**Independent Test**: Cadastrar um produto com saldo inicial 10 e mínimo 5; confirmar que não existe ação de "dar saída" fora do fluxo de venda; registrar uma venda de 6 unidades e confirmar saldo final 4 com alerta de estoque baixo ativo.

---

### P1: Área de Vendas ⭐ NOVA — unifica venda de produto e serviço

**User Story**: Como dono/recepcionista, quero um lugar único onde toda
venda de produto ou serviço fica registrada, para que o faturamento do
dashboard e do relatório seja sempre um reflexo direto e confiável do
que realmente foi vendido.

**Why P1**: Pedido explícito do usuário após validar com donos de
petshop via protótipo — sem isso, faturamento fica espalhado entre
"agendamentos concluídos" e "saídas de estoque", difícil de auditar.

**Acceptance Criteria**:

1. WHEN um agendamento é concluído THEN o sistema SHALL criar automaticamente uma venda do tipo `servico` (ver P1: Agenda, critério 7) — dono/recepcionista SHALL NOT poder editar o valor dessa venda manualmente.
2. WHEN o dono registra uma venda de produto avulsa (balcão, sem agendamento) THEN o sistema SHALL exigir produto e quantidade, SHALL calcular `valor_total` (`preco_unitario` × `quantidade`), SHALL debitar o estoque do produto e SHALL registrar a movimentação correspondente em `movimentacoes_estoque`.
3. IF a quantidade solicitada numa venda de produto for maior que o saldo disponível THEN o sistema SHALL rejeitar a operação e exibir mensagem de saldo insuficiente.
4. The system SHALL restringir o registro de venda de produto exclusivamente ao papel `dono`; venda de serviço (via conclusão de agendamento) permanece acessível a `dono` e `recepcionista`, herdando a mesma permissão da Agenda.
5. The system SHALL listar todas as vendas (produto + serviço) em uma tela única, mais recente primeiro, com o total do período visível.
6. Toda venda registrada THE system SHALL refletir imediatamente no cálculo do dashboard e do relatório mensal (ver P1: Dashboard / Relatórios).

**Independent Test**: Concluir um agendamento (gera venda de serviço automática); registrar uma venda de produto avulsa; abrir a tela de Vendas e confirmar as duas vendas listadas, com o total batendo com a soma manual; confirmar que o estoque do produto baixou corretamente.

---

### P1: Dashboard / Relatórios Mensais (revisada — lê de `vendas`, +export PDF)

**User Story**: Como dono, quero ver, por mês, quantos banhos/tosas
foram realizados, quantos foram cancelados e qual foi o faturamento
total (produto + serviço), e poder baixar isso em PDF para guardar ou
enviar ao contador.

**Acceptance Criteria**:

1. WHEN o dono seleciona um mês no relatório THEN o sistema SHALL exibir a contagem de agendamentos com status "concluído" nesse mês.
2. WHEN o dono seleciona um mês no relatório THEN o sistema SHALL exibir, separadamente, a contagem de agendamentos "cancelado" nesse mês, sem incluí-los no faturamento.
3. The system SHALL calcular o faturamento total do mês somando o `valor_total` de todas as vendas (`vendas`, tipo `servico` + tipo `produto`) daquele mês — **fonte única, substitui o cálculo em duas partes do MVP original**.
4. The system SHALL permitir ao dono navegar/selecionar qualquer mês anterior para visualizar o relatório daquele período, sem limite de retenção.
5. The system SHALL restringir o acesso ao relatório exclusivamente ao papel `dono`.
6. WHEN o dono clica em "Exportar PDF" THEN o sistema SHALL gerar um arquivo PDF com os mesmos dados exibidos na tela (contagens, faturamento, listas de vendas por serviço/produto) para o mês selecionado, disponível para download.
7. IF a geração do PDF falhar (ex.: erro no servidor) THEN o sistema SHALL exibir mensagem de erro e manter a visualização em tela funcionando normalmente.

**Independent Test**: Concluir 2 agendamentos e cancelar 1 num mês, registrar uma venda de produto avulsa; abrir o relatório desse mês, confirmar contagens/faturamento corretos, clicar em exportar e confirmar que o PDF baixado reflete os mesmos números.

---

### P1: Filtros de Pesquisa ⭐ NOVA — cross-cutting em todas as listas principais

**User Story**: Como dono/recepcionista, quero buscar e filtrar
rapidamente dentro de agendamentos, clientes/pets, vacinas, produtos e
vendas, para não precisar rolar listas grandes manualmente.

**Why P1**: Pedido explícito do usuário; sem isso, o sistema não
escala visualmente conforme a base de clientes cresce (dor confirmada
ao validar com donos via protótipo).

**Acceptance Criteria**:

1. The system SHALL fornecer um campo de busca textual em cada uma destas listas: Agendamentos (por pet/tutor), Clientes e Pets (por nome/telefone), Vacinas (por pet/nome da vacina), Produtos (por nome), Vendas (por item).
2. The system SHALL fornecer, além da busca textual, um filtro por atributo específico do domínio em cada lista: status em Agendamentos e Vacinas, categoria em Produtos, tipo (produto/serviço) em Vendas.
3. WHEN busca textual e filtro de atributo são combinados THEN o sistema SHALL aplicar ambos simultaneamente (E lógico, não OU).
4. The system SHALL atualizar a lista exibida sem recarregar a página inteira ao digitar na busca ou trocar o filtro.

**Independent Test**: Na tela de Vendas, filtrar por tipo "produto" e buscar por um nome específico; confirmar que só aparecem vendas de produto cujo nome bate com a busca.

---

### P3: Chatbot WhatsApp de Triagem (herdada — deferred)

Não detalhado nesta spec — feature separada, a especificar quando
priorizada.

---

## Edge Cases

- IF um agendamento é criado para um pet inativado THEN o sistema SHALL impedir a seleção de pets inativos.
- IF o dono cadastra horário de funcionamento com todos os dias fechados THEN o sistema SHALL permitir salvar, mas SHALL exibir aviso de que nenhum horário estará disponível.
- IF a venda de um produto zera seu saldo THEN o sistema SHALL continuar permitindo a consulta do produto, apenas impedindo novas vendas até nova entrada.
- WHEN o relatório é aberto para um mês sem nenhuma venda THEN o sistema SHALL exibir zero em todos os campos, não erro, e o botão de exportar PDF SHALL continuar funcional (gera um PDF "sem movimento").
- IF dois agendamentos do mesmo horário forem concluídos quase simultaneamente THEN cada conclusão SHALL gerar sua própria venda, sem duplicar nem perder nenhuma.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| AUTH-01 | Autenticação e Papéis | Design | Pending |
| AUTH-02 | Autenticação e Papéis | Design | Pending |
| AUTH-03 | Autenticação e Papéis | Execute (T5, petmanager-mvp) | Satisfied |
| AUTH-04 | Autenticação e Papéis | Design | Pending |
| HOR-01 | Horário de Funcionamento | Design | Pending |
| HOR-02 | Horário de Funcionamento | Design | Pending |
| HOR-03 | Horário de Funcionamento | Design | Pending |
| CAD-01 | Cadastro de Pet + Tutor | Design | Pending |
| CAD-02 | Cadastro de Pet + Tutor | Design | Pending |
| CAD-03 | Cadastro de Pet + Tutor | Design | Pending |
| CAD-04 | Cadastro de Pet + Tutor | Design | Pending |
| SERV-01 | Cadastro de Serviços | Design | Pending |
| SERV-02 | Cadastro de Serviços | Design | Pending |
| SERV-03 | Cadastro de Serviços | Design | Pending |
| AGD-01 | Agenda de Agendamentos | Design | Pending |
| AGD-02 | Agenda de Agendamentos | Design | Pending |
| AGD-03 | Agenda de Agendamentos | Design | Pending |
| AGD-04 | Agenda de Agendamentos | Design | Pending |
| AGD-05 | Agenda de Agendamentos | Design | Pending |
| AGD-06 | Agenda de Agendamentos | Design | Pending |
| AGD-07 | Agenda de Agendamentos | Design | Pending |
| AGD-08 | Agenda de Agendamentos | Design | Pending |
| AGD-09 | Agenda de Agendamentos | Design | Pending |
| VAC-01 | Controle de Vacina/Retorno | Design | Pending |
| VAC-02 | Controle de Vacina/Retorno | Design | Pending |
| EST-01 | Controle de Estoque | Design | Pending |
| EST-02 | Controle de Estoque | Design | Pending |
| EST-03 | Controle de Estoque | Execute (T5, petmanager-mvp) | Satisfied |
| EST-04 | Controle de Estoque | Design | Pending |
| VEN-01 | Área de Vendas | Design | Pending |
| VEN-02 | Área de Vendas | Design | Pending |
| VEN-03 | Área de Vendas | Design | Pending |
| VEN-04 | Área de Vendas | Design | Pending |
| VEN-05 | Área de Vendas | Design | Pending |
| VEN-06 | Área de Vendas | Design | Pending |
| REL-01 | Dashboard / Relatórios Mensais | Design | Pending |
| REL-02 | Dashboard / Relatórios Mensais | Design | Pending |
| REL-03 | Dashboard / Relatórios Mensais | Design | Pending |
| REL-04 | Dashboard / Relatórios Mensais | Design | Pending |
| REL-05 | Dashboard / Relatórios Mensais | Execute (T5, petmanager-mvp) | Satisfied |
| REL-06 | Dashboard / Relatórios Mensais | Design | Pending |
| REL-07 | Dashboard / Relatórios Mensais | Design | Pending |
| FILT-01 | Filtros de Pesquisa | Design | Pending |
| FILT-02 | Filtros de Pesquisa | Design | Pending |
| FILT-03 | Filtros de Pesquisa | Design | Pending |
| FILT-04 | Filtros de Pesquisa | Design | Pending |

**Coverage:** 43 total, 3 mapped a tasks já concluídas (petmanager-mvp), 40 unmapped ⚠️ (aguardando `tasks.md` desta feature)

---

## Success Criteria

- [ ] Dono de um petshop vê a demo e concorda em pagar pela versão completa.
- [ ] Um agendamento pode ser criado, editado, cancelado, reaberto e concluído sem perda de histórico, e concluir gera venda automaticamente.
- [ ] Toda venda (produto ou serviço) aparece na tela de Vendas e é refletida no dashboard/relatório sem cálculo manual.
- [ ] O relatório mensal é exportável em PDF com os mesmos números da tela.
- [ ] Todas as listas principais (agendamentos, clientes/pets, vacinas, produtos, vendas) são buscáveis e filtráveis.
