# PetManager MVP Specification

## Problem Statement

Petshops pequenos e médios de Aracaju/Barra dos Coqueiros controlam
agendamento de banho/tosa, vacinas e estoque manualmente (caderno,
WhatsApp), sem visão organizada de faturamento mensal. O PetManager
substitui esse controle manual por um sistema simples, servindo também
como MVP de vitrine para venda de software a múltiplos petshops (agenda de
Lucas de freelance/negócio local).

## Goals

- [ ] Dono de petshop consegue gerenciar agenda, cadastros, vacinas e
      estoque sem depender de caderno/WhatsApp.
- [ ] Dono consegue ver, ao final do mês, quantos serviços foram
      realizados/cancelados e qual foi o faturamento total.
- [ ] MVP genérico o suficiente para ser demonstrado a múltiplos petshops
      diferentes, sem lock-in a um único cliente.

## Out of Scope

Explicitamente excluído do v1. Documentado para prevenir scope creep.

| Feature | Reason |
|---|---|
| Pagamento online | Não é dor prioritária no MVP; complexidade de integração de gateway não se justifica antes de validar o software em si |
| Multi-tenant (múltiplos petshops na mesma base) | Decisão adiada deliberadamente até haver tração real (vários clientes fechados) |
| Múltiplas unidades/filiais do petshop | Fora do escopo do primeiro nicho-alvo (petshop pequeno/médio, unidade única) |
| Agenda separada por funcionário/tosador | Mantido como agenda única do estabelecimento para reduzir complexidade do v1 |
| Autoatendimento do tutor (agendamento direto sem confirmação humana) | Tutor não acessa o sistema nesta versão |
| Chatbot WhatsApp (mesmo em modo triagem) | Avaliado e adiado — ver Deferred em contexto; vira feature separada pós-validação do MVP core |
| Rate limiting / API pública | Sistema interno sem API exposta publicamente no v1 |
| Trilha de auditoria (log de "quem alterou o quê") | Log básico de erro é suficiente no v1; auditoria fica para versão futura se necessário |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Falha de rede/Supabase indisponível ao salvar | Mostrar mensagem de erro genérica ("Não foi possível salvar, tente novamente") e manter os dados preenchidos no formulário | Baixo risco/baixo volume no v1; UX simples resolve sem precisar de retry automático | n |
| Rate limiting / auth de API pública | N/A — sem API pública no v1 | Sistema interno, sem consumidores externos | y |
| Dependência externa instável | N/A — nenhuma dependência externa no v1 (Supabase/Vercel são a própria infra, não integrações de terceiro) | Escopo do v1 não inclui WhatsApp/Evolution API | y |
| Observabilidade | Log básico de erro no runtime da Vercel; sem trilha de auditoria dedicada | Volume baixo de uso no v1 não justifica investimento em observabilidade avançada | y |
| Concorrência de horário (dois usuários internos marcando o mesmo slot ao mesmo tempo) | Não tratado ativamente no v1 (sem lock/constraint de banco) | Risco aceito como baixíssimo — apenas 1-2 usuários internos por petshop | y |
| Tamanho máximo de campos de texto (nome do pet, nome do tutor) | Limite razoável de 255 caracteres, sem validação de conteúdo além disso | Não é uma decisão de produto relevante o suficiente para gastar turno de discussão | n |
| Funcionário desligado (recepcionista) | Conta é desativada (soft-disable), não excluída, para preservar histórico de quem criou/editou registros | Preserva integridade do histórico sem decisão explícita do usuário sobre este ponto | n |

**Open questions:** none — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Autenticação e Papéis ⭐ MVP

**User Story**: Como dono de petshop, quero que cada pessoa da equipe tenha
seu próprio login com permissões diferentes, para controlar quem acessa
estoque e relatórios financeiros.

**Why P1**: Sem controle de acesso, dono não consegue delegar a agenda para
a recepcionista com segurança sobre dados sensíveis (estoque/faturamento).

**Acceptance Criteria**:

1. WHEN um usuário faz login com e-mail e senha válidos THEN o sistema SHALL autenticá-lo e redirecioná-lo ao dashboard correspondente ao seu papel (`dono` ou `recepcionista`).
2. IF as credenciais forem inválidas THEN o sistema SHALL exibir mensagem "E-mail ou senha inválidos" sem indicar qual dos dois campos está incorreto.
3. WHILE o usuário autenticado tiver papel `recepcionista`, o sistema SHALL ocultar e bloquear (via RLS) o acesso às rotas de estoque e relatórios.
4. The system SHALL restringir toda política de RLS por `(select auth.uid())`, nunca chamando a função de autenticação linha a linha.

**Independent Test**: Criar um usuário `dono` e um `recepcionista`; logar com cada um e confirmar que o `recepcionista` não vê os menus de estoque/relatórios nem consegue acessar as rotas diretamente pela URL.

---

### P1: Cadastro de Horário de Funcionamento ⭐ MVP

**User Story**: Como dono, quero cadastrar os dias e horários de
funcionamento do petshop, para que a agenda só ofereça horários dentro do
expediente.

**Why P1**: Pré-requisito direto da Agenda — sem isso, não há horários
válidos para oferecer.

**Acceptance Criteria**:

1. WHEN o dono cadastra ou edita os horários de funcionamento THEN o sistema SHALL salvar os dias da semana e o intervalo de horário (abertura/fechamento) para cada um.
2. IF o dono tentar salvar um intervalo com hora de fechamento anterior à hora de abertura THEN o sistema SHALL rejeitar o salvamento e exibir mensagem de erro explicando o problema.
3. The system SHALL usar os horários cadastrados como base para os slots exibidos na tela de Agenda (P1 seguinte).

**Independent Test**: Cadastrar horário de segunda a sábado, 9h-18h; confirmar que a tela de agenda só oferece slots dentro dessa janela e que domingo não aparece disponível.

---

### P1: Cadastro de Pet + Tutor ⭐ MVP

**User Story**: Como dono/recepcionista, quero cadastrar tutores e seus
pets, para vincular agendamentos e histórico de vacina a cada animal.

**Why P1**: Pré-requisito de Agenda e Controle de Vacina.

**Acceptance Criteria**:

1. WHEN um novo tutor é cadastrado THEN o sistema SHALL exigir nome e telefone/WhatsApp em formato brasileiro válido (DDD + número) como campos obrigatórios.
2. IF o telefone informado não seguir o formato brasileiro válido THEN o sistema SHALL rejeitar o cadastro e indicar o formato esperado.
3. WHEN um novo pet é cadastrado THEN o sistema SHALL exigir nome, raça e porte (pequeno/médio/grande), vinculados a um tutor já existente.
4. The system SHALL limitar campos de texto livre (nome do pet, nome do tutor) a 255 caracteres.

**Independent Test**: Cadastrar um tutor com telefone inválido (deve ser rejeitado) e um válido (deve ser aceito); cadastrar um pet vinculado a esse tutor e confirmar que aparece na busca de pets.

---

### P1: Cadastro de Serviços ⭐ MVP

**User Story**: Como dono, quero cadastrar os serviços oferecidos (banho,
tosa etc.) com um preço interno, para usar esse valor no relatório de
faturamento sem expor preço na tela de agendamento.

**Why P1**: Pré-requisito de Agenda e do Relatório de Faturamento.

**Acceptance Criteria**:

1. WHEN o dono cadastra um serviço THEN o sistema SHALL salvar nome e preço interno (`preco_interno`).
2. The system SHALL NOT exibir o preço do serviço na tela de criação/edição de agendamento.
3. IF o preço informado for negativo ou não numérico THEN o sistema SHALL rejeitar o cadastro.

**Independent Test**: Cadastrar o serviço "Banho" com preço R$ 40; confirmar que ele aparece na lista de serviços ao criar um agendamento, mas sem o valor visível nessa tela.

---

### P1: Agenda de Agendamentos ⭐ MVP

**User Story**: Como dono/recepcionista, quero criar, editar e cancelar
agendamentos de banho/tosa visualizando os horários já ocupados, para
substituir o controle manual em caderno/WhatsApp.

**Why P1**: É o núcleo do produto — a funcionalidade que resolve a dor
principal e mais pesa na demonstração ao cliente.

**Acceptance Criteria**:

1. WHEN dono/recepcionista cria um agendamento THEN o sistema SHALL vincular um pet, um ou mais serviços e uma data/horário dentro do expediente cadastrado, com status inicial "agendado".
2. WHILE o usuário estiver criando/editando um agendamento, o sistema SHALL exibir visualmente os horários já ocupados no dia selecionado.
3. WHEN o botão de salvar agendamento é clicado THEN o sistema SHALL desabilitá-lo imediatamente até a confirmação do salvamento, prevenindo duplo envio.
4. WHEN dono/recepcionista edita um agendamento existente THEN o sistema SHALL permitir alterar pet, serviço(s) e data/horário, preservando o `id` do registro original.
5. WHEN dono/recepcionista cancela um agendamento THEN o sistema SHALL alterar seu status para "cancelado" sem excluí-lo do histórico (soft delete).
6. WHEN dono/recepcionista reabre um agendamento cancelado THEN o sistema SHALL permitir retorná-lo ao status "agendado".
7. WHEN dono/recepcionista marca um agendamento como "concluído" THEN o sistema SHALL permitir essa transição independentemente de a data/horário marcados já terem ocorrido ou não (atendimento pode ser adiantado).
8. IF dois usuários tentarem salvar agendamentos no mesmo horário quase simultaneamente THEN o sistema SHALL aceitar ambos sem bloqueio ativo de concorrência (risco aceito como assunção — ver Assumptions).

**Independent Test**: Criar um agendamento, editá-lo, cancelá-lo, reabri-lo e marcá-lo como concluído antes da data chegar — todas as transições devem funcionar e o registro nunca deve ser removido do banco.

---

### P1: Controle de Vacina/Retorno ⭐ MVP

**User Story**: Como dono/recepcionista, quero registrar vacinas aplicadas
e sua data de retorno prevista, para não perder o controle de reforços.

**Why P1**: Dor recorrente citada explicitamente pelo nicho (controle de
vacina).

**Acceptance Criteria**:

1. WHEN uma vacina é registrada para um pet THEN o sistema SHALL salvar data de aplicação e data prevista de retorno.
2. The system SHALL exibir, na ficha do pet, o histórico completo de vacinas aplicadas (sem limite de retenção).

**Independent Test**: Registrar duas vacinas para o mesmo pet em datas diferentes; confirmar que ambas aparecem na ficha do pet, com suas respectivas datas de retorno.

---

### P1: Controle de Estoque ⭐ MVP

**User Story**: Como dono, quero controlar entrada e saída de produtos
vendidos na loja (ração, brinquedos, acessórios), para saber o que tenho
disponível e quanto vendi.

**Why P1**: Pré-requisito direto do Relatório de Faturamento.

**Acceptance Criteria**:

1. WHEN o dono registra entrada de estoque THEN o sistema SHALL somar a quantidade informada ao saldo atual do produto.
2. WHEN o dono registra saída de estoque THEN o sistema SHALL subtrair a quantidade do saldo e SHALL calcular e salvar `valor_total` (`preco_unitario` × `quantidade`) dessa saída, tratando-a como uma venda.
3. IF a quantidade de saída solicitada for maior que o saldo disponível THEN o sistema SHALL rejeitar a operação e exibir mensagem de saldo insuficiente.
4. The system SHALL restringir o acesso a estoque exclusivamente ao papel `dono`.

**Independent Test**: Cadastrar um produto com saldo inicial 10; registrar saída de 3 unidades e confirmar saldo final de 7 e um registro de venda com valor calculado corretamente; tentar saída de 20 unidades e confirmar rejeição.

---

### P1: Dashboard / Relatórios Mensais ⭐ MVP

**User Story**: Como dono, quero ver, por mês, quantos banhos/tosas foram
realizados, quantos foram cancelados e qual foi o faturamento total, para
acompanhar a saúde do negócio sem precisar somar tudo manualmente.

**Why P1**: É o critério de sucesso do MVP — o que convence o dono a pagar
pela versão completa.

**Acceptance Criteria**:

1. WHEN o dono seleciona um mês no relatório THEN o sistema SHALL exibir a contagem de agendamentos com status "concluído" nesse mês.
2. WHEN o dono seleciona um mês no relatório THEN o sistema SHALL exibir, separadamente, a contagem de agendamentos com status "cancelado" nesse mês (rotulados como "Canceladas: X"), sem incluí-los na contagem de concluídos nem no faturamento.
3. The system SHALL calcular o faturamento total do mês somando (a) o `preco_interno` dos serviços de agendamentos concluídos e (b) o `valor_total` das saídas de estoque (vendas) registradas no mesmo mês.
4. The system SHALL permitir ao dono navegar/selecionar qualquer mês anterior para visualizar o relatório daquele período, sem limite de retenção de histórico.
5. The system SHALL restringir o acesso ao relatório exclusivamente ao papel `dono`.

**Independent Test**: Concluir 2 agendamentos e cancelar 1 num mês, registrar uma venda de estoque; abrir o relatório desse mês e confirmar contagens e faturamento corretos; trocar para o mês anterior e confirmar que os dados mudam corretamente.

---

### P3: Chatbot WhatsApp de Triagem

**User Story**: Como dono, quero um chatbot que faça a triagem inicial do
que o cliente deseja (banho, tosa, banho e tosa, comprar ração etc.) via
WhatsApp, sem integração direta com o software e sem marcar sozinho, para
agilizar o primeiro contato sem assumir o risco de automação completa.

**Why P3**: Deferred — avaliado e adiado deliberadamente para depois da
validação do MVP core, pelo custo de complexidade (estado de conversa,
dependência de API não-oficial do WhatsApp) frente ao ganho no momento da
demo.

**Acceptance Criteria**: Não detalhado nesta spec — feature separada, a
especificar quando priorizada.

---

## Edge Cases

- IF um agendamento é criado para um pet que foi excluído/inativado THEN o sistema SHALL impedir a seleção de pets inativos na criação de novo agendamento.
- IF o dono tenta cadastrar horário de funcionamento com todos os dias fechados THEN o sistema SHALL permitir salvar, mas SHALL exibir aviso de que nenhum horário estará disponível para agendamento.
- IF a saída de estoque zera o saldo de um produto THEN o sistema SHALL continuar permitindo a consulta do produto (não ocultar), apenas impedindo novas saídas até haver nova entrada.
- WHEN o relatório é aberto para um mês sem nenhum dado (nenhum agendamento concluído, cancelado ou venda) THEN o sistema SHALL exibir zero em todos os campos, não erro.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| AUTH-01 | P1: Autenticação e Papéis | Design | Pending |
| AUTH-02 | P1: Autenticação e Papéis | Design | Pending |
| AUTH-03 | P1: Autenticação e Papéis | Execute (T5) | Satisfied |
| AUTH-04 | P1: Autenticação e Papéis | Design | Pending |
| HOR-01 | P1: Cadastro de Horário de Funcionamento | Design | Pending |
| HOR-02 | P1: Cadastro de Horário de Funcionamento | Design | Pending |
| HOR-03 | P1: Cadastro de Horário de Funcionamento | Design | Pending |
| CAD-01 | P1: Cadastro de Pet + Tutor | Design | Pending |
| CAD-02 | P1: Cadastro de Pet + Tutor | Design | Pending |
| CAD-03 | P1: Cadastro de Pet + Tutor | Design | Pending |
| CAD-04 | P1: Cadastro de Pet + Tutor | Design | Pending |
| SERV-01 | P1: Cadastro de Serviços | Design | Pending |
| SERV-02 | P1: Cadastro de Serviços | Design | Pending |
| SERV-03 | P1: Cadastro de Serviços | Design | Pending |
| AGD-01 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-02 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-03 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-04 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-05 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-06 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-07 | P1: Agenda de Agendamentos | Design | Pending |
| AGD-08 | P1: Agenda de Agendamentos | Design | Pending |
| VAC-01 | P1: Controle de Vacina/Retorno | Design | Pending |
| VAC-02 | P1: Controle de Vacina/Retorno | Design | Pending |
| EST-01 | P1: Controle de Estoque | Design | Pending |
| EST-02 | P1: Controle de Estoque | Design | Pending |
| EST-03 | P1: Controle de Estoque | Design | Pending |
| EST-04 | P1: Controle de Estoque | Execute (T5) | Satisfied |
| REL-01 | P1: Dashboard / Relatórios Mensais | Design | Pending |
| REL-02 | P1: Dashboard / Relatórios Mensais | Design | Pending |
| REL-03 | P1: Dashboard / Relatórios Mensais | Design | Pending |
| REL-04 | P1: Dashboard / Relatórios Mensais | Design | Pending |
| REL-05 | P1: Dashboard / Relatórios Mensais | Execute (T5) | Satisfied |

**Coverage:** 30 total, 3 mapped to tasks, 27 unmapped ⚠️

---

## Success Criteria

- [ ] Dono de um petshop vê a demo do MVP e concorda em pagar pela versão completa (critério de sucesso definido pelo usuário — não exige semanas de uso real).
- [ ] Um agendamento pode ser criado, editado, cancelado e reaberto sem perda de histórico.
- [ ] O relatório mensal reflete corretamente concluídos, cancelados e faturamento, navegável por qualquer mês anterior.
