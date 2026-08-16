-- Allow create_task to be called without coordinates.
-- Lat/lng default to NULL so admin can create a case without GPS and
-- set coordinates later via update_task_location.

drop function if exists public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision);

create or replace function public.create_task(
  p_customer_name      text,
  p_customer_phone     text,
  p_loan_type          text,
  p_amount             numeric,
  p_investigation_type text,
  p_address            text,
  p_city               text,
  p_state              text,
  p_pincode            text,
  p_territory          text,
  p_branch_id          uuid,
  p_priority           text,
  p_due_at             timestamptz,
  p_latitude           double precision default null,
  p_longitude          double precision default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id        uuid := gen_random_uuid();
  v_reference text;
begin
  perform assert_admin();

  if p_amount <= 0 or p_due_at <= now() then
    raise exception 'Amount and a future due date are required';
  end if;

  -- Only validate coordinates when they are actually supplied
  if p_latitude is not null or p_longitude is not null then
    if p_latitude is null or p_longitude is null
       or p_latitude  not between -90  and 90
       or p_longitude not between -180 and 180
       or (p_latitude = 0 and p_longitude = 0) then
      raise exception 'Valid destination coordinates are required when provided';
    end if;
  end if;

  v_reference := 'FI-' || to_char(now(), 'YYYY') || '-' ||
                 lpad(nextval('public.task_reference_seq')::text, 4, '0');

  insert into tasks(
    id, reference_number, customer_name, customer_phone, loan_type,
    amount, investigation_type, address, area, city, state, pincode,
    territory, branch_id, latitude, longitude, priority, due_at, created_by
  ) values (
    v_id, v_reference,
    trim(p_customer_name), trim(p_customer_phone),
    p_loan_type, p_amount, p_investigation_type,
    trim(p_address), p_territory, p_city, p_state, p_pincode,
    p_territory, p_branch_id,
    p_latitude, p_longitude,
    p_priority, p_due_at, auth.uid()
  );

  insert into task_activity(task_id, actor_profile_id, actor_role, event_type, metadata)
  values (v_id, auth.uid(), 'ADMIN', 'TASK_CREATED',
          jsonb_build_object('detail', v_reference || ' created.'));

  return v_id;
end;
$$;

revoke execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision) from public, anon;
grant  execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision) to authenticated;
