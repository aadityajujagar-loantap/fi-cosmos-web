-- ============================================================
-- AGENT PHONE LOOKUP — callable by anon (pre-auth)
-- Run in Supabase SQL Editor after migration 202608160001
-- ============================================================

-- Normalises a phone string to digits only for flexible matching.
-- e.g. "+91 98765 43210", "9876543210", "+919876543210" all match.

create or replace function public.lookup_agent_by_phone(p_phone text)
returns text          -- returns the agent's auth email, or NULL if not found
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_digits text := regexp_replace(trim(p_phone), '[^0-9]', '', 'g');
begin
  if char_length(v_digits) < 10 then
    return null;      -- reject obviously invalid inputs
  end if;

  select p.email into v_email
  from   public.agents  a
  join   public.profiles p on p.id = a.profile_id
  where  regexp_replace(a.phone, '[^0-9]', '', 'g') = v_digits
    and  a.active = true
    and  p.active = true
    and  p.role   = 'AGENT'
  limit 1;

  return v_email;     -- NULL when no matching active agent found
end;
$$;

-- Allow unauthenticated callers (anon role) — needed for pre-login lookups
revoke execute on function public.lookup_agent_by_phone(text) from public;
grant  execute on function public.lookup_agent_by_phone(text) to anon, authenticated;
