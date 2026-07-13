# Private access setup

Hearthlight has no public registration and does not send authentication email in v1. Every person who uses the app needs an account that you create manually in Supabase.

## 0. Disable self-sign-up in Supabase

Open **Authentication -> Settings -> General configuration** and turn off **Allow new users to sign up**. Also keep anonymous sign-ins disabled.

This is the server-side lock: the public Vercel URL can stay visible, while Supabase accepts sign-in only for accounts you created yourself. Supabase confirms that, once this setting is disabled, only existing users can sign in.

## 1. Apply the database migration

Open **Supabase -> SQL Editor -> New query**, paste the contents of:

`supabase/migrations/20260713000000_private_households.sql`

Run it once. It creates the private household tables, owner/member roles, personal check-ins, and Row Level Security policies.

## 2. Create the first owner account

Open **Authentication -> Users -> Add user -> Create new user**.

- Enter your email and a strong temporary password.
- Keep **Auto confirm user** checked.
- Click **Create user**.

Open Hearthlight and sign in with that account. The app will offer **Create your household**; that creates your private room and makes you its owner.

## 3. Add family accounts

For every family member, repeat **Authentication -> Users -> Add user -> Create new user** with their email and a temporary password. Keep **Auto confirm user** checked.

Then, in Hearthlight, open **Settings -> Household access** and add the same email. Only an account that already exists can be granted access.

Share each temporary password privately. Members can change it inside Hearthlight after they sign in.

## Privacy rules

- The app has no sign-up route and Supabase self-sign-up is disabled.
- A person without a manually created account cannot sign in.
- A signed-in account with no household membership cannot see household data.
- Database Row Level Security prevents one household from reading another household's rows, even if someone manipulates the browser.
- Do not use a Supabase secret/service-role key in Vercel client environment variables or the browser.
