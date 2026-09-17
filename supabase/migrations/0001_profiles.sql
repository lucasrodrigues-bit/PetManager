create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'recepcionista' check (role in ('dono', 'recepcionista')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Papel (dono/recepcionista) e status de cada usuário do PetManager, 1:1 com auth.users.';
