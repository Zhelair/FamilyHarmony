# Family Harmony

Family Harmony is a warm, private family app for shared household goals, personal check-ins, friendly challenges, gentle routines, meals, and a home that grows with the family.

## Start here

```powershell
npm.cmd install
npm.cmd run dev
```

## Private access and Supabase

This is a real, deployed private app - not a demo. It uses password sign-in only. Public sign-up, magic links, Resend, and custom-domain work are intentionally outside v1.

Create each account manually in Supabase with **Auto confirm** enabled. A household owner then grants that existing account access in Settings. Follow [private access setup](docs/PRIVATE_ACCESS_SETUP.md) and apply all SQL migrations before using goals, challenges, reflections, Together, or private photo memories.

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` belong in the browser. Never add a service-role key to Vercel or client code.

## Project references

- `docs/planning/` - product, stack, package, architecture, and roadmap notes
- `design-system/hearthlight/MASTER.md` - live Family Harmony visual-system baseline
