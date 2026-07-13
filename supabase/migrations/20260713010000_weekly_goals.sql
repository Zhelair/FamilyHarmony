-- Hearthlight v1: real weekly goals with private personal and shared household visibility.

create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  visibility text not null check (visibility in ('shared', 'personal')),
  title text not null check (char_length(trim(title)) between 2 and 100),
  description text check (char_length(description) <= 280),
  target integer not null check (target between 1 and 1000),
  week_start date not null default date_trunc('week', current_date)::date,
  created_at timestamptz not null default now()
);

create table public.goal_progress_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.weekly_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount between 1 and 1000),
  logged_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index weekly_goals_household_week_idx on public.weekly_goals(household_id, week_start);
create index weekly_goals_creator_week_idx on public.weekly_goals(created_by, week_start);
create index goal_progress_logs_goal_idx on public.goal_progress_logs(goal_id);

create or replace function public.prevent_goal_progress_overflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  goal_target integer;
  logged_total integer;
begin
  select target into goal_target
  from public.weekly_goals
  where id = new.goal_id
  for update;

  if goal_target is null then
    raise exception 'This goal no longer exists.';
  end if;

  select coalesce(sum(amount), 0) into logged_total
  from public.goal_progress_logs
  where goal_id = new.goal_id;

  if logged_total + new.amount > goal_target then
    raise exception 'That progress would exceed this week''s goal target.';
  end if;

  return new;
end;
$$;

create trigger validate_goal_progress_before_insert
  before insert on public.goal_progress_logs
  for each row execute procedure public.prevent_goal_progress_overflow();

alter table public.weekly_goals enable row level security;
alter table public.goal_progress_logs enable row level security;

create or replace function public.can_access_weekly_goal(target_goal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.weekly_goals goal
    where goal.id = target_goal_id
      and (
        (goal.visibility = 'shared' and public.is_household_member(goal.household_id))
        or (goal.visibility = 'personal' and goal.created_by = auth.uid() and public.is_household_member(goal.household_id))
      )
  );
$$;

create policy "Members can view shared and own personal weekly goals"
  on public.weekly_goals for select to authenticated
  using ((visibility = 'shared' and public.is_household_member(household_id)) or (visibility = 'personal' and created_by = auth.uid() and public.is_household_member(household_id)));

create policy "Members can create weekly goals in their household"
  on public.weekly_goals for insert to authenticated
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Creators can update their weekly goals"
  on public.weekly_goals for update to authenticated
  using (created_by = auth.uid() and public.is_household_member(household_id))
  with check (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Creators can delete their weekly goals"
  on public.weekly_goals for delete to authenticated
  using (created_by = auth.uid() and public.is_household_member(household_id));

create policy "Users can view progress for accessible weekly goals"
  on public.goal_progress_logs for select to authenticated
  using (public.can_access_weekly_goal(goal_id));

create policy "Users can log progress for accessible weekly goals"
  on public.goal_progress_logs for insert to authenticated
  with check (user_id = auth.uid() and public.can_access_weekly_goal(goal_id));

create policy "Users can remove their own goal progress logs"
  on public.goal_progress_logs for delete to authenticated
  using (user_id = auth.uid() and public.can_access_weekly_goal(goal_id));

grant select, insert, update, delete on public.weekly_goals to authenticated;
grant select, insert, delete on public.goal_progress_logs to authenticated;
grant execute on function public.can_access_weekly_goal(uuid) to authenticated;
