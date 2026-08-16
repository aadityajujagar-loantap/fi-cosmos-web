-- Create the Admin, Agent A, and Agent B users in Supabase Auth first.
-- This seed deliberately contains no passwords and links users by email.
insert into public.branches(code,name,city,state,pincodes,territories) values
('BR-PW','Pune West','Pune','Maharashtra',array['411045','411057','411038'],array['Baner','Hinjewadi','Kothrud']),
('BR-PC','Pune Central','Pune','Maharashtra',array['411001'],array['Koregaon Park'])
on conflict(code) do update set name=excluded.name,city=excluded.city,state=excluded.state,pincodes=excluded.pincodes,territories=excluded.territories,active=true;

do $$
declare v_branch uuid; v_admin uuid;
begin
  select id into v_branch from public.branches where code='BR-PW';
  select id into v_admin from public.profiles where role='ADMIN' and active order by created_at limit 1;
  if v_admin is null then raise exception 'Create an Auth user and set its public.profiles role to ADMIN before seeding tasks'; end if;
  if not exists(select 1 from public.tasks where reference_number='FI-DRYRUN-001') then
    insert into public.tasks(reference_number,customer_name,customer_phone,loan_type,amount,investigation_type,address,area,city,state,pincode,territory,branch_id,latitude,longitude,priority,status,due_at,created_by)
    values('FI-DRYRUN-001','Rajesh Kumar Sharma','+91 98765 43210','Home Loan',4200000,'Residence Verification','102, Sai Residency, Baner Road, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,18.559000,73.786800,'HIGH','UNASSIGNED',now()+interval '1 day',v_admin),
          ('FI-DRYRUN-002','Neha Patil','+91 91234 56780','Home Loan',1975000,'Residence Verification','Flat 7B, Green Heights, Baner, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,18.559000,73.786800,'MEDIUM','UNASSIGNED',now()+interval '2 days',v_admin);
  end if;
end $$;
