-- Hearthlight v1: private households with manually approved accounts.
-- Run this migration in Supabase SQL Editor before using the authenticated app.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('move', 'pause', 'connect')),
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, kind, completed_on)
);

create index household_members_user_id_idx on public.household_members(user_id);
create index check_ins_user_day_idx on public.check_ins(user_id, completed_on);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.check_ins enable row level security;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_owner(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household_id and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.add_household_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_members (household_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_household_created
  after insert on public.households
  for each row execute procedure public.add_household_owner();

-- The owner can grant access only to a user account that has already been
-- manually created in Supabase Auth. The browser never sees an admin key.
create or replace function public.add_existing_household_member(
  target_household_id uuid,
  target_email text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
begin
  if not public.is_household_owner(target_household_id) then
    raise exception 'Only the household owner can grant access.';
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if target_user_id is null then
    raise exception 'Create this account in Supabase first, then add it here.';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (target_household_id, target_user_id, 'member')
  on conflict (household_id, user_id) do nothing;
end;
$$;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can read their household"
  on public.households for select to authenticated
  using (public.is_household_member(id));

create policy "Authenticated users can create a household"
  on public.households for insert to authenticated
  with check (created_by = auth.uid());

create policy "Owners can update their household"
  on public.households for update to authenticated
  using (public.is_household_owner(id)) with check (public.is_household_owner(id));

create policy "Members can see who belongs to their household"
  on public.household_members for select to authenticated
  using (public.is_household_member(household_id));

create policy "Owners can add household members"
  on public.household_members for insert to authenticated
  with check (public.is_household_owner(household_id));

create policy "Owners can remove non-owner household members"
  on public.household_members for delete to authenticated
  using (public.is_household_owner(household_id) and role = 'member');

-- Check-ins are personal by default. A member can only ever see and alter their own.
create policy "Users can read their own check-ins"
  on public.check_ins for select to authenticated
  using (user_id = auth.uid() and public.is_household_member(household_id));

create policy "Users can add their own check-ins"
  on public.check_ins for insert to authenticated
  with check (user_id = auth.uid() and public.is_household_member(household_id));

create policy "Users can delete their own check-ins"
  on public.check_ins for delete to authenticated
  using (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.households to authenticated;
grant select, insert, delete on public.household_members to authenticated;
grant select, insert, delete on public.check_ins to authenticated;
grant execute on function public.add_existing_household_member(uuid, text) to authenticated;
