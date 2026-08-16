alter table public.agents
  add column if not exists current_latitude double precision,
  add column if not exists current_longitude double precision,
  add column if not exists location_accuracy_meters double precision,
  add column if not exists location_updated_at timestamptz;

create index if not exists agents_location_updated_idx on public.agents(location_updated_at desc);

create or replace function public.update_agent_location(p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or (p_latitude=0 and p_longitude=0) then raise exception 'Invalid location'; end if;
  update agents set current_latitude=p_latitude,current_longitude=p_longitude,location_accuracy_meters=case when p_accuracy_meters is null then null else greatest(0,p_accuracy_meters) end,location_updated_at=now() where profile_id=auth.uid() and active;
  if not found then raise exception 'Active Field Agent not found'; end if;
end $$;

create or replace function public.update_task_location(p_task_id uuid,p_expected_version integer,p_latitude double precision,p_longitude double precision)
returns void language plpgsql security definer set search_path=public as $$
begin
  perform assert_admin();
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or (p_latitude=0 and p_longitude=0) then raise exception 'Invalid destination location'; end if;
  update tasks set latitude=p_latitude,longitude=p_longitude,version=version+1 where id=p_task_id and version=p_expected_version;
  if not found then raise sqlstate '40001' using message='Version conflict'; end if;
end $$;

drop function if exists public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz);

create or replace function public.create_task(p_customer_name text,p_customer_phone text,p_loan_type text,p_amount numeric,p_investigation_type text,p_address text,p_city text,p_state text,p_pincode text,p_territory text,p_branch_id uuid,p_priority text,p_due_at timestamptz,p_latitude double precision,p_longitude double precision)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid:=gen_random_uuid(); v_reference text;
begin
  perform assert_admin();
  if p_amount<=0 or p_due_at<=now() then raise exception 'Amount and future due date are required'; end if;
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or (p_latitude=0 and p_longitude=0) then raise exception 'Valid destination coordinates are required'; end if;
  v_reference:='FI-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.task_reference_seq')::text,4,'0');
  insert into tasks(id,reference_number,customer_name,customer_phone,loan_type,amount,investigation_type,address,area,city,state,pincode,territory,branch_id,latitude,longitude,priority,due_at,created_by)
  values(v_id,v_reference,trim(p_customer_name),trim(p_customer_phone),p_loan_type,p_amount,p_investigation_type,trim(p_address),p_territory,p_city,p_state,p_pincode,p_territory,p_branch_id,p_latitude,p_longitude,p_priority,p_due_at,auth.uid());
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(v_id,auth.uid(),'ADMIN','TASK_CREATED',jsonb_build_object('detail',v_reference||' created.'));
  return v_id;
end $$;

revoke execute on function public.update_agent_location(double precision,double precision,double precision) from public,anon;
revoke execute on function public.update_task_location(uuid,integer,double precision,double precision) from public,anon;
revoke execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision) from public,anon;
grant execute on function public.update_agent_location(double precision,double precision,double precision) to authenticated;
grant execute on function public.update_task_location(uuid,integer,double precision,double precision) to authenticated;
grant execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision) to authenticated;
