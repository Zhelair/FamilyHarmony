# Hearthlight Architecture

## Folder Structure

```text
hearthlight-app/
  public/
  src/
    app/
      router.jsx
      providers.jsx
      routes.jsx
    assets/
      illustrations/
      icons/
      textures/
    components/
      ui/
        button.jsx
        card.jsx
        dialog.jsx
        drawer.jsx
        input.jsx
        progress.jsx
        tabs.jsx
      layout/
        app-shell.jsx
        mobile-nav.jsx
        sidebar.jsx
        topbar.jsx
      dashboard/
      challenges/
      meals/
      house/
      memories/
    features/
      auth/
        auth-api.js
        auth-context.jsx
        auth-guards.jsx
      household/
        household-api.js
        household-hooks.js
      challenges/
        challenges-api.js
        challenges-hooks.js
      meals/
        meals-api.js
        meals-hooks.js
      progress/
        progress-api.js
        progress-hooks.js
      memories/
        memories-api.js
        memories-hooks.js
    hooks/
      use-breakpoint.js
      use-current-member.js
      use-household.js
    lib/
      supabase/
        client.js
        auth.js
      constants/
      format/
      utils/
    pages/
      auth/
        sign-in.jsx
        sign-up.jsx
        join-household.jsx
      dashboard/
        household-dashboard.jsx
        my-dashboard.jsx
      challenges/
        weekly-challenges.jsx
      meals/
        meal-planner.jsx
      house/
        house-progress.jsx
      memories/
        memory-wall.jsx
      settings/
        settings.jsx
    styles/
      globals.css
      tokens.css
      utilities.css
    main.jsx
  .env.local
  package.json
  vite.config.js
```

## Route Map

- `/`
- `/sign-in`
- `/sign-up`
- `/join`
- `/dashboard`
- `/me`
- `/challenges`
- `/meals`
- `/house`
- `/memories`
- `/settings`

## State Strategy

- Supabase for auth and remote data
- React context for auth and household session
- local component state for page interactions

No extra global state library in v1 unless we truly need it.

## Design System Structure

### Foundations

- typography scale
- spacing scale
- color tokens
- radius scale
- shadow scale
- motion rules

### Main UI Patterns

- dashboard cards
- quick action chips
- bottom drawer for mobile actions
- room progress panels
- streak and milestone strips
- family activity timeline

## MVP First Screens

1. Sign in / Sign up
2. Create or Join Household
3. Household Dashboard
4. My Dashboard
5. Weekly Challenges
6. House Progress

## Build Rule

Every screen must feel:
- useful first
- beautiful immediately
- fast on mobile
- emotionally warm
