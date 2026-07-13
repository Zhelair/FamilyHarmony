-- Family Harmony: shared moments, private household memories, and a personal daily intention.

create table public.family_moments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 100),
  description text check (char_length(description) <= 280),
  kind text not null default 'together' check (kind in ('beach', 'movie', 'walk', 'cook', 'game', 'call', 'visit', 'together')),
  scheduled_for date,
  status text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.family_moment_participants (
  moment_id uuid not null references public.family_moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'maybe', 'not_going')),
  joined_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);

create table public.family_memories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  moment_id uuid not null references public.family_moments(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  caption text not null check (char_length(trim(caption)) between 1 and 500),
  photo_path text check (char_length(photo_path) <= 500),
  created_at timestamptz not null default now()
);

create table public.daily_intentions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  intended_on date not null default current_date,
  intention text check (char_length(trim(intention)) between 2 and 120),
  reason text check (char_length(reason) <= 280),
  evening_note text check (char_length(evening_note) <= 500),
  updated_at timestamptz not null default now(),
  unique (user_id, intended_on)
);

create index family_moments_household_date_idx on public.family_moments(household_id, scheduled_for);
create index family_memories_household_created_idx on public.family_memories(household_id, created_at desc);
create index daily_intentions_user_date_idx on public.daily_intentions(user_id, intended_on);

alter table public.family_moments enable row level security;
alter table public.family_moment_participants enable row level security;
alter table public.family_memories enable row level security;
alter table public.daily_intentions enable row level security;

create or replace function public.can_access_family_moment(target_moment_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_moments moment
    where moment.id = target_moment_id
      and public.is_household_member(moment.household_id)
  );
$$;

create or replace function public.add_moment_creator()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.family_moment_participants (moment_id, user_id, status)
  values (new.id, new.created_by, 'going');
  return new;
end;
$$;

create trigger on_family_moment_created
  after insert on public.family_moments
  for each row execute procedure public.add_moment_creator();

create policy "Members can view household moments"
  on public.family_moments for select to authenticated
  using (public.is_household_member(household_id));
create policy "Members can create household moments"
  on public.family_moments for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_member(household_id));
create policy "Creators can manage their moments"
  on public.family_moments for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Members can view moment participation"
  on public.family_moment_participants for select to authenticated
  using (public.can_access_family_moment(moment_id));
create policy "Users can join or answer for themselves"
  on public.family_moment_participants for insert to authenticated
  with check (user_id = auth.uid() and public.can_access_family_moment(moment_id));
create policy "Users can change their own moment answer"
  on public.family_moment_participants for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.can_access_family_moment(moment_id));

create policy "Members can view household memories"
  on public.family_memories for select to authenticated
  using (public.is_household_member(household_id));
create policy "Members can add household memories"
  on public.family_memories for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.is_household_member(household_id)
    and exists (
      select 1 from public.family_moments moment
      where moment.id = family_memories.moment_id and moment.household_id = family_memories.household_id
    )
  );
create policy "Creators can update their own memories"
  on public.family_memories for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Users can view their own daily intentions"
  on public.daily_intentions for select to authenticated
  using (user_id = auth.uid() and public.is_household_member(household_id));
create policy "Users can add their own daily intentions"
  on public.daily_intentions for insert to authenticated
  with check (user_id = auth.uid() and public.is_household_member(household_id));
create policy "Users can update their own daily intentions"
  on public.daily_intentions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_household_member(household_id));

grant select, insert, update on public.family_moments to authenticated;
grant select, insert, update on public.family_moment_participants to authenticated;
grant select, insert, update on public.family_memories to authenticated;
grant select, insert, update on public.daily_intentions to authenticated;
grant execute on function public.can_access_family_moment(uuid) to authenticated;
