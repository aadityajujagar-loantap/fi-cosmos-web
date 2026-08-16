-- ============================================================
-- FIX 1: Auto-create public.profiles on Supabase Auth signup
-- Run this in Supabase SQL Editor (once, after the main migration)
-- ============================================================

-- Trigger function: copies auth.users data into public.profiles on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'AGENT',     -- default role; change to 'ADMIN' manually afterwards for admin users
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach the trigger to auth.users (fires after every new user insert)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- FIX 2: Manually create profiles for EXISTING Auth users
-- (Run this once for any user you created BEFORE the trigger above)
-- ============================================================

insert into public.profiles (id, email, display_name, role, active)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  'AGENT',
  true
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;


-- ============================================================
-- FIX 3: Set the Admin role for your admin user by email
-- Replace the email below with your actual admin email
-- ============================================================

update public.profiles
set role = 'ADMIN', display_name = 'Admin'
where email = 'aditya.jujagar@loantap.in';   -- <-- Replace this

-- Verify it worked:
select id, email, role, display_name, active from public.profiles;
