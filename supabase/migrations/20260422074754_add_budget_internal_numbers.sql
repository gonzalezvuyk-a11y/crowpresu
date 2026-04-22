create schema if not exists private;

create table if not exists private.budget_number_counters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_number integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table private.budget_number_counters enable row level security;

alter table if exists public.budgets
add column if not exists internal_number integer;

with numbered as (
  select
    id,
    row_number() over (
      partition by user_id
      order by created_at asc, id asc
    )::integer as next_number
  from public.budgets
  where internal_number is null
)
update public.budgets b
set internal_number = numbered.next_number
from numbered
where b.id = numbered.id;

insert into private.budget_number_counters (user_id, last_number)
select user_id, max(internal_number)
from public.budgets
where internal_number is not null
group by user_id
on conflict (user_id) do update
set
  last_number = greatest(private.budget_number_counters.last_number, excluded.last_number),
  updated_at = now();

create or replace function private.assign_budget_internal_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_number integer;
begin
  if new.internal_number is not null then
    return new;
  end if;

  insert into private.budget_number_counters (user_id, last_number)
  values (new.user_id, 1)
  on conflict (user_id) do update
  set
    last_number = private.budget_number_counters.last_number + 1,
    updated_at = now()
  returning last_number into next_number;

  new.internal_number = next_number;
  return new;
end;
$$;

drop trigger if exists budgets_assign_internal_number on public.budgets;
create trigger budgets_assign_internal_number
before insert on public.budgets
for each row
execute function private.assign_budget_internal_number();

alter table if exists public.budgets
alter column internal_number set not null;

create unique index if not exists budgets_user_internal_number_key
on public.budgets (user_id, internal_number);

create index if not exists budgets_user_created_at_idx
on public.budgets (user_id, created_at desc);
