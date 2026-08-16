# Supabase and Vercel Setup

## Prerequisites

- A Supabase project
- Supabase CLI authenticated locally
- Access to the Vercel project for `fi-iflow.vercel.app`
- Three Auth users: one Admin, Agent A, and Agent B

Do not use a service-role key in the Vite app.

## Apply the database

From `website/`:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

For a local disposable database, `npx supabase db reset` applies migrations and `seed.sql`.

Migration 202608160010_product_questionnaires.sql creates the loan-product and
questionnaire tables, seeds the standard products, and enables assignment
snapshots. After applying migrations, open **Admin > Product Questions** and
review each active product before creating or assigning production cases.

## Provision users

1. Create the three email/password users in Supabase Authentication. Choose passwords at setup time; do not store them in the repository.
2. Existing users created before the migration need profile rows:

```sql
insert into public.profiles(id, role, display_name, email)
select id, 'AGENT', coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), email
from auth.users
on conflict (id) do nothing;
```

3. Promote only the Admin account:

```sql
update public.profiles set role = 'ADMIN'
where email = 'YOUR_ADMIN_EMAIL';
```

4. Run `supabase/seed.sql`.
5. Sign into the Admin UI and add Agent A and Agent B using the exact Auth emails. The Admin operation links the existing Auth profile; it does not create or handle passwords.
6. Sign in at `/admin`, open the Admin profile menu, and use **Reset Dry Run Data** whenever a canonical reset is needed. The UI invokes the protected RPC with the Admin session.

## Frontend environment

Create an uncommitted `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

In Vercel, add the same two variables to Production and, where needed, Preview and Development. Redeploy after changing them because Vite reads these values at build time.

Never add a service-role key, database password, JWT secret, or Supabase secret key to a `VITE_*` variable.

## Deploy

```bash
npm run build
vercel --prod
```

Verify hard refreshes for:

- `https://fi-iflow.vercel.app/admin`
- `https://fi-iflow.vercel.app/agent`

The checked-in `vercel.json` provides the SPA rewrite.
