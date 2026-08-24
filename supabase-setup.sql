-- StockFlow: exécute ce script une seule fois dans Supabase > SQL Editor
create table if not exists public.stockflow_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.stockflow_data enable row level security;

drop policy if exists "stockflow read" on public.stockflow_data;
drop policy if exists "stockflow insert" on public.stockflow_data;
drop policy if exists "stockflow update" on public.stockflow_data;

create policy "stockflow read" on public.stockflow_data
for select to anon using (id = 'main');

create policy "stockflow insert" on public.stockflow_data
for insert to anon with check (id = 'main');

create policy "stockflow update" on public.stockflow_data
for update to anon using (id = 'main') with check (id = 'main');