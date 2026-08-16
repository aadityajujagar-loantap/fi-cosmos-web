with known_locations(pattern, latitude, longitude) as (
  values
    ('baner', 18.559000, 73.786800),
    ('pimpri-chinchwad', 18.629800, 73.799700),
    ('pune station', 18.528600, 73.874000),
    ('hinjewadi', 18.591300, 73.738900),
    ('kothrud', 18.507400, 73.807700),
    ('aundh', 18.560200, 73.807000),
    ('viman nagar', 18.567900, 73.914300),
    ('akurdi', 18.648700, 73.764000)
), resolved as (
  select distinct on (task.id) task.id, location.latitude, location.longitude
  from public.tasks task
  join known_locations location on lower(task.address) like '%' || location.pattern || '%'
  where task.latitude = 0 and task.longitude = 0
  order by task.id, length(location.pattern) desc
)
update public.tasks task
set latitude = resolved.latitude,
    longitude = resolved.longitude,
    version = task.version + 1
from resolved
where task.id = resolved.id;

create or replace function public.reset_dry_run_data() returns void
language plpgsql security definer set search_path=public,storage as $$
declare v_branch uuid; v_admin uuid:=auth.uid();
begin
  perform public.assert_admin();
  delete from public.tasks;
  insert into public.branches(code,name,city,state,pincodes,territories,active)
  values('BR-PW','Pune West','Pune','Maharashtra',array['411045','411057','411038'],array['Baner','Hinjewadi','Kothrud'],true)
  on conflict(code) do update set name=excluded.name,city=excluded.city,state=excluded.state,pincodes=excluded.pincodes,territories=excluded.territories,active=true
  returning id into v_branch;
  insert into public.tasks(reference_number,customer_name,customer_phone,loan_type,amount,investigation_type,address,area,city,state,pincode,territory,branch_id,latitude,longitude,priority,status,due_at,created_by)
  values
  ('FI-DRYRUN-001','Rajesh Kumar Sharma','+91 98765 43210','Home Loan',4200000,'Residence Verification','102, Sai Residency, Baner Road, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,18.559000,73.786800,'HIGH','UNASSIGNED',now()+interval '1 day',v_admin),
  ('FI-DRYRUN-002','Neha Patil','+91 91234 56780','Home Loan',1975000,'Residence Verification','Flat 7B, Green Heights, Baner, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,18.559000,73.786800,'MEDIUM','UNASSIGNED',now()+interval '2 days',v_admin);
end $$;
notify pgrst, 'reload schema';
