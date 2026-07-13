# Family Harmony Stack

## Final Stack Choice

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Framer Motion
- Supabase
- Radix UI primitives
- Lucide icons

## Why This Is The Best Fit

- Vite is fast, simple, and deploys cleanly to Vercel
- React keeps the UI flexible across desktop and mobile web
- Tailwind lets us build a real visual system from the first day
- Framer Motion gives us premium motion instead of "AI app" stiffness
- Supabase handles auth, database, and future realtime cleanly
- Radix gives us accessible UI primitives without forcing generic styling

## Chosen UI Approach

We will not rely on a generic off-the-shelf theme.

We will use:
- custom layout and visual identity
- Radix primitives for accessibility
- our own buttons, cards, drawers, dialogs, tabs, and form styling

This keeps the app beautiful from the start while avoiding "template look".

## Package Groups

### App

- `react`
- `react-dom`
- `react-router-dom`
- `framer-motion`
- `@supabase/supabase-js`
- `lucide-react`

### UI Foundations

- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

### Forms

- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### Dev

- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`

## Install Shape

```powershell
npm.cmd create vite@latest hearthlight-app -- --template react
cd hearthlight-app
npm.cmd install react-router-dom framer-motion @supabase/supabase-js lucide-react
npm.cmd install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-slot
npm.cmd install class-variance-authority clsx tailwind-merge react-hook-form zod @hookform/resolvers
npm.cmd install -D tailwindcss postcss autoprefixer
```

## Hosting

- GitHub for source control
- Vercel for hosting
- Supabase for backend
