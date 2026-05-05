create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_formatting jsonb not null default '{"lineHeight":2,"paragraphSpacing":8,"headingStyle":"uppercase"}'::jsonb,
  tone_style text not null default 'formal' check (tone_style in ('formal','concise','verbose')),
  common_phrasing_patterns text[] not null default '{}',
  structural_patterns jsonb not null default '{"sentence_style":"balanced","clause_formatting":"paragraph","heading_style":"uppercase"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy if not exists "Users can view own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can upsert own preferences"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.touch_user_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.touch_user_preferences_updated_at();
