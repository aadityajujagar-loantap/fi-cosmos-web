-- Harden Admin-created Field Agent provisioning against partial or duplicate records.
create or replace function public.provision_agent(
  p_email text,
  p_display_name text,
  p_phone text,
  p_branch_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_branch public.branches%rowtype;
  v_id uuid;
  v_email text := lower(trim(p_email));
  v_name text := trim(p_display_name);
  v_phone text := trim(p_phone);
  v_phone_digits text := regexp_replace(trim(p_phone), '[^0-9]', '', 'g');
begin
  perform public.assert_admin();

  if v_name = '' then raise exception 'Field Agent name is required'; end if;
  if v_email = '' or position('@' in v_email) < 2 then raise exception 'Valid Field Agent email is required'; end if;
  if char_length(v_phone_digits) < 10 then raise exception 'Valid Field Agent phone is required'; end if;

  select * into v_profile
  from public.profiles
  where lower(email) = v_email
  for update;
  if not found then
    raise exception 'Create this email in Supabase Auth first';
  end if;

  select * into v_branch
  from public.branches
  where id = p_branch_id and active
  for share;
  if not found then raise exception 'Active branch not found'; end if;

  if exists(select 1 from public.agents where profile_id = v_profile.id) then
    raise exception 'This Supabase Auth user is already a Field Agent';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_phone_digits));
  if exists(
    select 1 from public.agents
    where regexp_replace(phone, '[^0-9]', '', 'g') = v_phone_digits
  ) then
    raise exception 'This phone number is already assigned to a Field Agent';
  end if;

  update public.profiles
  set role = 'AGENT', display_name = v_name, active = true
  where id = v_profile.id;

  insert into public.agents(
    profile_id, employee_code, phone, branch_id, city, state,
    pincodes, territories, availability_status, active
  ) values (
    v_profile.id,
    'AGT' || lpad(nextval('public.agent_code_seq')::text, 3, '0'),
    v_phone,
    v_branch.id,
    v_branch.city,
    v_branch.state,
    v_branch.pincodes,
    v_branch.territories,
    'AVAILABLE',
    true
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.provision_agent(text,text,text,uuid) from public, anon;
grant execute on function public.provision_agent(text,text,text,uuid) to authenticated;