-- Family Harmony: categories, language, weekly reflections, and opt-in challenges.

alter table public.profiles
  add column if not exists locale text not null default 'en' check (locale in ('en', 'ru'));

alter table public.weekly_goals
  add column if not exists category text not null default 'growth' check (category in ('sport', 'nutrition', 'growth', 'family', 'recovery')),
  add column if not exists preset_key text;

create table public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  win text check (char_length(win) <= 500),
  obstacle text check (char_length(obstacle) <= 500),
  next_focus text check (char_length(next_focus) <= 500),
  small_reward text check (char_length(small_reward) <= 240),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table public.family_challenges (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 100),
  description text check (char_length(description) <= 280),
  category text not null default 'family' check (category in ('sport', 'nutrition', 'growth', 'family', 'recovery')),
  target integer not null check (target between 1 and 1000),
  starts_on date not null default current_date,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.family_challenge_participants (
  challenge_id uuid not null references public.family_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'accepted' check (status in ('accepted', 'declined')),
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.family_challenge_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.family_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount between 1 and 1000),
  logged_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index weekly_reflections_household_week_idx on public.weekly_reflections(household_id, week_start);
create index family_challenges_household_end_idx on public.family_challenges(household_id, ends_on);
create index family_challenge_logs_user_idx on public.family_challenge_logs(user_id, challenge_id);

alter table public.weekly_reflections enable row level security;
alter table public.family_challenges enable row level security;
alter table public.family_challenge_participants enable row level security;
alter table public.family_challenge_logs enable row level security;

create or replace function public.can_access_family_challenge(target_challenge_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_challenges challenge
    where challenge.id = target_challenge_id
      and public.is_household_member(challenge.household_id)
  );
$$;

create or replace function public.add_challenge_creator()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.family_challenge_participants (challenge_id, user_id)
  values (new.id, new.created_by);
  return new;
end;
$$;

create trigger on_family_challenge_created
  after insert on public.family_challenges
  for each row execute procedure public.add_challenge_creator();

create or replace function public.prevent_challenge_progress_overflow()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  challenge_target integer;
  logged_total integer;
begin
  select target into challenge_target from public.family_challenges where id = new.challenge_id for update;
  select coalesce(sum(amount), 0) into logged_total from public.family_challenge_logs where challenge_id = new.challenge_id and user_id = new.user_id;
  if challenge_target is null or logged_total + new.amount > challenge_target then
    raise exception 'That progress would exceed this challenge target.';
  end if;
  return new;
end;
$$;

create trigger validate_challenge_progress_before_insert
  before insert on public.family_challenge_logs
  for each row execute procedure public.prevent_challenge_progress_overflow();

create policy "Members can read household profiles"
  on public.profiles for select to authenticated
  using (exists (
    select 1 from public.household_members self_member
    join public.household_members profile_member using (household_id)
    where self_member.user_id = auth.uid() and profile_member.user_id = profiles.id
  ));

create policy "Users can read their own reflections"
  on public.weekly_reflections for select to authenticated using (user_id = auth.uid() and public.is_household_member(household_id));
create policy "Users can add their own reflections"
  on public.weekly_reflections for insert to authenticated with check (user_id = auth.uid() and public.is_household_member(household_id));
create policy "Users can update their own reflections"
  on public.weekly_reflections for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_household_member(household_id));

create policy "Members can view household challenges"
  on public.family_challenges for select to authenticated using (public.is_household_member(household_id));
create policy "Members can create household challenges"
  on public.family_challenges for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id));
create policy "Creators can manage their challenges"
  on public.family_challenges for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Members can view challenge participants"
  on public.family_challenge_participants for select to authenticated using (public.can_access_family_challenge(challenge_id));
create policy "Users can join household challenges"
  on public.family_challenge_participants for insert to authenticated with check (user_id = auth.uid() and public.can_access_family_challenge(challenge_id));
create policy "Users can update their own challenge response"
  on public.family_challenge_participants for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_access_family_challenge(challenge_id));

create policy "Members can view challenge progress"
  on public.family_challenge_logs for select to authenticated using (public.can_access_family_challenge(challenge_id));
create policy "Accepted participants can log challenge progress"
  on public.family_challenge_logs for insert to authenticated with check (
    user_id = auth.uid() and exists (
      select 1 from public.family_challenge_participants participant
      where participant.challenge_id = family_challenge_logs.challenge_id and participant.user_id = auth.uid() and participant.status = 'accepted'
    )
  );

grant select, insert, update on public.weekly_reflections to authenticated;
grant select, insert, update on public.family_challenges to authenticated;
grant select, insert, update on public.family_challenge_participants to authenticated;
grant select, insert on public.family_challenge_logs to authenticated;
grant execute on function public.can_access_family_challenge(uuid) to authenticated;
