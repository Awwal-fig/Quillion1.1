create table if not exists public.matters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  suit_number text,
  court text,
  parties text,
  category text,
  description text,
  status text not null default 'active' check (status in ('active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matter_documents (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (matter_id, document_id)
);

alter table public.matters enable row level security;
alter table public.matter_documents enable row level security;

create policy "users can manage own matters" on public.matters
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can manage own matter docs" on public.matter_documents
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
