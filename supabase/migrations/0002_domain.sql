create table public.horarios_funcionamento (
  id bigint generated always as identity primary key,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_abertura time not null,
  hora_fechamento time not null,
  check (hora_fechamento > hora_abertura)
);

create table public.tutores (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(nome) <= 255),
  telefone text not null,
  created_at timestamptz not null default now()
);

create table public.pets (
  id bigint generated always as identity primary key,
  tutor_id bigint not null references public.tutores (id) on delete cascade,
  nome text not null check (char_length(nome) <= 255),
  raca text not null,
  porte text not null check (porte in ('pequeno', 'medio', 'grande')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index pets_tutor_id_idx on public.pets (tutor_id);

create table public.servicos (
  id bigint generated always as identity primary key,
  nome text not null,
  preco_interno numeric(10, 2) not null check (preco_interno >= 0),
  created_at timestamptz not null default now()
);

create table public.agendamentos (
  id bigint generated always as identity primary key,
  pet_id bigint not null references public.pets (id),
  data_hora timestamptz not null,
  status text not null default 'agendado' check (status in ('agendado', 'concluido', 'cancelado')),
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index agendamentos_pet_id_idx on public.agendamentos (pet_id);
create index agendamentos_criado_por_idx on public.agendamentos (criado_por);
create index agendamentos_data_hora_idx on public.agendamentos (data_hora);

create table public.agendamento_servicos (
  agendamento_id bigint not null references public.agendamentos (id) on delete cascade,
  servico_id bigint not null references public.servicos (id),
  primary key (agendamento_id, servico_id)
);
create index agendamento_servicos_servico_id_idx on public.agendamento_servicos (servico_id);

create table public.vacinas (
  id bigint generated always as identity primary key,
  pet_id bigint not null references public.pets (id) on delete cascade,
  data_aplicacao date not null,
  data_retorno_prevista date not null,
  created_at timestamptz not null default now(),
  check (data_retorno_prevista >= data_aplicacao)
);
create index vacinas_pet_id_idx on public.vacinas (pet_id);

create table public.produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  saldo_estoque integer not null default 0 check (saldo_estoque >= 0),
  created_at timestamptz not null default now()
);

create table public.movimentacoes_estoque (
  id bigint generated always as identity primary key,
  produto_id bigint not null references public.produtos (id),
  tipo text not null check (tipo in ('entrada', 'saida')),
  quantidade integer not null check (quantidade > 0),
  valor_total numeric(10, 2),
  data timestamptz not null default now()
);
create index movimentacoes_estoque_produto_id_idx on public.movimentacoes_estoque (produto_id);
