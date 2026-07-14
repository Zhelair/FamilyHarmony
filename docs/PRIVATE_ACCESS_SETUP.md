# Family Harmony private access setup

Family Harmony has no public registration and does not send authentication email in v1. Every person who uses the app needs an account that you create manually in Supabase.

## 0. Disable self-sign-up in Supabase

Open **Authentication -> Settings -> General configuration** and turn off **Allow new users to sign up**. Also keep anonymous sign-ins disabled.

This is the server-side lock: the public Vercel URL can stay visible, while Supabase accepts sign-in only for accounts you created yourself. Supabase confirms that, once this setting is disabled, only existing users can sign in.

## 1. Apply the database migrations

Open **Supabase -> SQL Editor -> New query** and run these files in order:

`supabase/migrations/20260713000000_private_households.sql`

`supabase/migrations/20260713010000_weekly_goals.sql`

`supabase/migrations/20260713020000_family_harmony_progression.sql`

`supabase/migrations/20260713030000_together_memories_and_daily_intentions.sql`

`supabase/migrations/20260714010000_together_moment_lifecycle.sql`

`supabase/migrations/20260714020000_small_family_asks.sql`

They create the private household tables, weekly goals, reflections, opt-in challenges, private daily intentions, Together moments, text-only family memories, small household asks, their Row Level Security policies, and the moment lifecycle. Run each file once, in that order, before deploying this version.

## 2. Create the first owner account

Open **Authentication -> Users -> Add user -> Create new user**.

- Enter your email and a strong temporary password.
- Keep **Auto confirm user** checked.
- Click **Create user**.

Open Family Harmony and sign in with that account. The app will offer **Create your household**; that creates your private room and makes you its owner.

## 3. Add family accounts

For every family member, repeat **Authentication -> Users -> Add user -> Create new user** with their email and a temporary password. Keep **Auto confirm user** checked.

Then, in Family Harmony, open **Settings -> Household access** and add the same email. Only an account that already exists can be granted access.

Share each temporary password privately. Members can change it inside Family Harmony after they sign in.

## Privacy rules

- The app has no sign-up route and Supabase self-sign-up is disabled.
- A person without a manually created account cannot sign in.
- A signed-in account with no household membership cannot see household data.
- Database Row Level Security prevents one household from reading another household's rows, even if someone manipulates the browser.
- Do not use a Supabase secret/service-role key in Vercel client environment variables or the browser.
