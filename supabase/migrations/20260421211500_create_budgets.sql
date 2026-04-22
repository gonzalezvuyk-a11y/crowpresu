create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'Presupuesto sin título',
  client text,
  budget_type text,
  issue_date text,
  event_date text,
  amount numeric,
  currency text not null default '₲',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can read own budgets"
on public.budgets
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own budgets"
on public.budgets
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own budgets"
on public.budgets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own budgets"
on public.budgets
for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
before update on public.budgets
for each row
execute function public.set_updated_at();

create index if not exists budgets_user_updated_at_idx
on public.budgets (user_id, updated_at desc);

create index if not exists budgets_user_type_idx
on public.budgets (user_id, budget_type);
