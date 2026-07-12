# Family App V2 Plan

## Product Direction

- Build a family dashboard first, then layer in game energy.
- Keep the house lore, but make it ambient instead of the main UX.
- Give each family member a real account, personal progress, and personal challenges.
- Use shared family goals to upgrade the house state.


## Backend Recommendation

### Recommended

- Supabase for auth + app data

Why:
- real accounts and household invites
- safer private data
- easier shared state and future realtime
- cleaner path for mobile/web growth later

### Not recommended as primary database

- Google Sheets

Why not:
- weak auth model for a multi-user app
- awkward permissions per family member
- brittle for app logic, history, and private habit data
- okay for exports, admin reports, or temporary imports

### Best compromise

- Use Supabase for the app
- Use Google Sheets only for export/import and weekly summary views

## Core Screens

1. Sign in / Sign up
2. Create or Join Household
3. Household Dashboard
4. My Dashboard
5. Weekly Challenges
6. Meal Planner
7. Family Progress / House View
8. Memory Wall
9. Settings

## Screen Map

### Household Dashboard
- today cards
- who checked in
- family streak
- next meal
- weekly focus
- house status

### My Dashboard
- my habits
- my streaks
- my active challenges
- quick check-in buttons

### Weekly Challenges
- personal challenges
- shared challenges
- progress bars
- completed rewards

### Meal Planner
- weekly meals
- suggestions
- family votes
- final plan

### House View
- rooms or zones
- each zone improves from family participation
- simple upgrades, not a complex game map

### Memory Wall
- family jokes
- sayings
- photos later
- pinned family motto

## Data Model

### Core Entities

- users
- households
- household_members
- invites
- challenges
- challenge_assignments
- challenge_logs
- rewards
- reward_claims
- meal_plans
- meal_votes
- memories
- house_progress

### Key Rules

- one user can belong to one household in v1
- each challenge belongs to either `personal` or `shared`
- alcohol-related challenges should default to private visibility
- house progress is derived from shared activity, not from one person alone

## Challenge System

### Personal

- no alcohol day
- walk goal
- workout
- reading
- job applications
- no sugar day

### Shared

- family walk count
- weekly meal plan completed
- total movement sessions
- total calm sessions
- one new family memory this week

### Challenge Shape

- daily
- weekly
- streak
- milestone

## Reward System

- personal streak badges
- family stars
- room upgrades
- weekly family reward

Avoid:
- hard public ranking for sensitive health goals
- shame-based competition

## UI Direction

- dashboard-first
- warm, clean, readable
- game-like details in backgrounds, motion, and progression
- fewer giant scenic panels, more useful cards
- mobile-first with fast check-ins

## Rewrite Rule

V2 should feel like:

`family operating system + soft game layer`

Not:

`game world trying to become a planner`
