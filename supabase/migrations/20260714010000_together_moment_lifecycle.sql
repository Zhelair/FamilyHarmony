-- Makes Together a complete household loop: plan, answer, close, and remember.

alter table public.family_moments
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_family_moment_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_family_moment_updated_at on public.family_moments;
create trigger set_family_moment_updated_at
  before update on public.family_moments
  for each row execute procedure public.set_family_moment_updated_at();

drop policy if exists "Members can add household memories" on public.family_memories;
create policy "Members can add completed moment memories"
  on public.family_memories for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.is_household_member(household_id)
    and exists (
      select 1 from public.family_moments moment
      where moment.id = family_memories.moment_id
        and moment.household_id = family_memories.household_id
        and moment.status = 'completed'
    )
  );
