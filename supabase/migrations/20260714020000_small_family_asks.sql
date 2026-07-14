-- Small, concrete requests make participation useful without turning the app into a task board.

create table public.family_asks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 140),
  description text check (char_length(description) <= 280),
  status text not null default 'open' check (status in ('open', 'claimed', 'completed', 'cancelled')),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  completed_at timestamptz,
  thanked_by uuid references auth.users(id) on delete set null,
  thanked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index family_asks_household_created_idx on public.family_asks(household_id, created_at desc);
create index family_asks_household_status_idx on public.family_asks(household_id, status);

alter table public.family_asks enable row level security;

create or replace function public.set_family_ask_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_family_ask_updated_at
  before update on public.family_asks
  for each row execute procedure public.set_family_ask_updated_at();

create policy "Members can view household asks"
  on public.family_asks for select to authenticated
  using (public.is_household_member(household_id));

create policy "Members can make household asks"
  on public.family_asks for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Requesters can manage their asks"
  on public.family_asks for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Members can claim an open ask"
  on public.family_asks for update to authenticated
  using (status = 'open' and claimed_by is null and public.is_household_member(household_id))
  with check (status = 'claimed' and claimed_by = auth.uid() and created_by <> auth.uid() and public.is_household_member(household_id));

create policy "Claimers can complete their ask"
  on public.family_asks for update to authenticated
  using (status = 'claimed' and claimed_by = auth.uid())
  with check (status = 'completed' and claimed_by = auth.uid() and public.is_household_member(household_id));

grant select, insert, update on public.family_asks to authenticated;
