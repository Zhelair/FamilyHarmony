# Family App V2 Plan

## Product direction

Family Harmony is a family operating system with a soft game layer: dashboard-first, warm, calm, and useful before it is playful.

## Access decision

- Family Harmony is private.
- Supabase public self-sign-up is disabled.
- Accounts are manually created with email/password and Auto confirm enabled.
- A household owner grants access to an existing account in Settings.
- No invite routes, public sign-up, magic links, Resend, or custom domain are needed for v1.

## Current core screens

1. Password sign-in and household setup
2. Household dashboard
3. My Day check-ins
4. Weekly goals: personal and shared, with progress logging
5. Opt-in challenges, Harmony points, achievements, and weekly reflection
6. A data-driven 2D Harmony Home dashboard
7. Settings, language preference, and owner-managed household access
8. Together: shared plans, opt-in attendance, and private photo/caption memories
9. Visit mode, richer family activity, and memories next

## Core entities

- profiles
- households
- household_members
- check_ins
- weekly_goals
- goal_progress_logs
- family_moments, family_moment_participants, and family_memories
- daily_intentions
- visit mode, richer rewards, and house_progress (later)

## Weekly goal rules

- A goal belongs to one household and one weekly cycle.
- `shared` goals and their progress are visible to members of that household.
- `personal` goals and their progress are visible only to their creator.
- Goals invite gentle contribution, never public ranking or shame.
- The Hearth derives from shared activity; personal category rooms are visible only to their owner.

## UI direction

- warm forest/cream palette, soft rounded cards, and friendly editorial type
- dashboard-first and mobile-first
- useful cards and focused actions rather than giant scenic panels
- calm micro-feedback, clear loading/error states, and accessible keyboard use
