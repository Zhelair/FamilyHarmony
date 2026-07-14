# Family Harmony Architecture

## Current application

- React + Vite single-page application with React Router.
- Supabase Auth holds manually created email/password accounts.
- Supabase Postgres holds profiles, households, memberships, personal check-ins, daily intentions, weekly goals, goal-progress logs, weekly reflections, opt-in family challenges, Together moments, small household asks, and private caption memories.
- The browser uses only the public URL and anon key. Authorization is enforced with Row Level Security, never just a client route guard.

## Private access model

1. An administrator manually creates an email/password account in Supabase and enables Auto confirm.
2. The person signs in with password; public self-sign-up is disabled.
3. The first account can create a household and becomes owner.
4. A household owner grants another existing account access from Settings.

There are no public sign-up, invite, join-household, magic-link, or email-delivery routes in v1.

## Route map

- `/dashboard` - household dashboard, real-progress Harmony Home, and shared weekly focus
- `/me` - personal daily check-ins
- `/challenges` - real weekly goals
- `/together` - shared moments, opt-in attendance, and private family memories
- `/asks` - small household requests, a one-person claim, completion, and thank-you
- `/meals` - redirects to Together; meal planning is intentionally out of scope
- `/settings` - household access, password change, and sign-out

## Weekly progress model

- `weekly_goals` belongs to a household and current week.
- A `shared` goal is visible to household members; any member can add progress.
- A `personal` goal is visible only to its creator.
- `goal_progress_logs` are append-only progress entries from the signed-in member.
- RLS policies control both goal visibility and log access.
- Challenges are household-visible, but members choose whether to join and log their own progress.
- The dashboard computes room states from visible real progress; it does not persist or expose private-room progress to others.
- Family memories are short private captions stored alongside their household moment. Household RLS keeps them visible only to members.

## Build rule

Every screen should be useful first, emotionally warm, fast on mobile, and explicitly private by design.
