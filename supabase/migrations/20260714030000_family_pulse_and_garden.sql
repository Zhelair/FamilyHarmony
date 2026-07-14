-- Opt-in family pulse: shared movement, a weekly family choice, and warmth events.

create table public.family_garden_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('walk', 'workout', 'stretch', 'dance', 'other')),
  created_at timestamptz not null default now()
);

create table public.family_weekly_choices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  title text not null check (char_length(trim(title)) between 2 and 140),
  target integer not null default 12 check (target between 3 and 100),
  created_at timestamptz not null default now(),
  unique (household_id, week_start)
);

create table public.family_warmth_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('small_win', 'help_claimed', 'thanks', 'moment_completed')),
  message text check (char_length(message) <= 280),
  created_at timestamptz not null default now()
);

create index family_garden_entries_household_created_idx on public.family_garden_entries(household_id, created_at desc);
create index family_weekly_choices_household_week_idx on public.family_weekly_choices(household_id, week_start);
create index family_warmth_events_household_created_idx on public.family_warmth_events(household_id, created_at desc);

alter table public.family_garden_entries enable row level security;
alter table public.family_weekly_choices enable row level security;
alter table public.family_warmth_events enable row level security;

create policy "Members can view household garden entries"
  on public.family_garden_entries for select to authenticated
  using (public.is_household_member(household_id));
create policy "Members can add their own garden entry"
  on public.family_garden_entries for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Members can view weekly family choices"
  on public.family_weekly_choices for select to authenticated
  using (public.is_household_member(household_id));
create policy "Owners can set weekly family choices"
  on public.family_weekly_choices for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_owner(household_id));
create policy "Owners can update weekly family choices"
  on public.family_weekly_choices for update to authenticated
  using (public.is_household_owner(household_id))
  with check (created_by = auth.uid() and public.is_household_owner(household_id));

create policy "Members can view household warmth events"
  on public.family_warmth_events for select to authenticated
  using (public.is_household_member(household_id));
create policy "Members can share their own warmth event"
  on public.family_warmth_events for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_member(household_id));

grant select, insert on public.family_garden_entries to authenticated;
grant select, insert, update on public.family_weekly_choices to authenticated;
grant select, insert on public.family_warmth_events to authenticated;
