# Family Harmony Architecture

## Current application

- React + Vite single-page application with React Router.
- Supabase Auth holds manually created email/password accounts.
- Supabase Postgres holds profiles, households, memberships, personal check-ins, weekly goals, and goal-progress logs.
- The browser uses only the public URL and anon key. Authorization is enforced with Row Level Security, never just a client route guard.

## Private access model

1. An administrator manually creates an email/password account in Supabase and enables Auto confirm.
2. The person signs in with password; public self-sign-up is disabled.
3. The first account can create a household and becomes owner.
4. A household owner grants another existing account access from Settings.

There are no public sign-up, invite, join-household, magic-link, or email-delivery routes in v1.

## Route map

- `/dashboard` - household dashboard and shared weekly focus
- `/me` - personal daily check-ins
- `/challenges` - real weekly goals
- `/meals` - next slice, currently placeholder
- `/settings` - household access, password change, and sign-out

## Weekly goals model

- `weekly_goals` belongs to a household and current week.
- A `shared` goal is visible to household members; any member can add progress.
- A `personal` goal is visible only to its creator.
- `goal_progress_logs` are append-only progress entries from the signed-in member.
- RLS policies control both goal visibility and log access.

## Build rule

Every screen should be useful first, emotionally warm, fast on mobile, and explicitly private by design.
