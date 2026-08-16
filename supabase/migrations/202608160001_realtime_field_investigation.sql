create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN','AGENT')) default 'AGENT',
  display_name text not null,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.branches (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  city text not null, state text not null, pincodes text[] not null default '{}', territories text[] not null default '{}',
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.agents (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_code text not null unique, phone text not null default '', branch_id uuid not null references public.branches(id), city text not null,
  state text not null, pincodes text[] not null default '{}', territories text[] not null default '{}',
  availability_status text not null default 'AVAILABLE' check (availability_status in ('AVAILABLE','BUSY','OFFLINE')),
  active boolean not null default true, rating numeric(2,1) not null default 4.5, battery integer not null default 100 check (battery between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), reference_number text not null unique,
  customer_name text not null, customer_phone text not null, loan_type text not null, amount numeric(14,2) not null check (amount > 0),
  investigation_type text not null, address text not null, area text not null default '', city text not null, state text not null,
  pincode text not null, territory text not null default '', branch_id uuid not null references public.branches(id),
  latitude double precision not null default 0, longitude double precision not null default 0,
  assigned_agent_id uuid references public.agents(id), priority text not null check (priority in ('HIGH','MEDIUM','LOW')),
  status text not null default 'UNASSIGNED' check (status in ('UNASSIGNED','ASSIGNED','ACCEPTED','IN_PROGRESS','SUBMITTED','REWORK_REQUIRED','COMPLETED','REJECTED','CANCELLED')),
  checklist jsonb not null default '[{"id":"visit-location","label":"Visit customer location","required":true},{"id":"capture-photo","label":"Capture customer photo","required":true},{"id":"verify-address","label":"Verify address","required":true},{"id":"capture-documents","label":"Capture documents","required":true},{"id":"customer-signature","label":"Customer signature","required":true}]'::jsonb,
  due_at timestamptz not null, assigned_at timestamptz, accepted_at timestamptz, started_at timestamptz, submitted_at timestamptz, completed_at timestamptz,
  rejection_reason text, rework_reason text, version integer not null default 1, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.task_assignments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  agent_id uuid not null references public.agents(id), assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now(), unassigned_at timestamptz, reason text, is_current boolean not null default true
);
create unique index task_assignments_one_current on public.task_assignments(task_id) where is_current;
create table public.investigations (
  id uuid primary key default gen_random_uuid(), task_id uuid not null unique references public.tasks(id) on delete cascade,
  agent_id uuid not null references public.agents(id), status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','REWORK_REQUIRED')),
  resides_verified text not null default '', home_ownership text not null default 'Owned', stay_duration text not null default '1-3 Years',
  remarks text not null default '', completed_checklist_ids text[] not null default '{}', evidence_ids uuid[] not null default '{}',
  form_data jsonb not null default '{}'::jsonb, version integer not null default 1, started_at timestamptz, submitted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, title text not null, message text not null, task_id uuid references public.tasks(id) on delete cascade,
  read_at timestamptz, dedupe_key text unique, created_at timestamptz not null default now()
);
create table public.task_activity (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id), actor_role text not null check (actor_role in ('ADMIN','AGENT')),
  event_type text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.task_evidence (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  investigation_id uuid references public.investigations(id) on delete set null, uploaded_by uuid not null default auth.uid() references public.profiles(id),
  storage_path text not null unique, file_name text not null, mime_type text not null, size bigint not null check (size > 0),
  evidence_kind text not null default 'document', created_at timestamptz not null default now()
);

create index tasks_agent_status_idx on public.tasks(assigned_agent_id, status);
create index tasks_branch_status_idx on public.tasks(branch_id, status);
create index tasks_due_at_idx on public.tasks(due_at);
create index notifications_recipient_unread_idx on public.notifications(recipient_profile_id, created_at desc) where read_at is null;
create index activity_task_created_idx on public.task_activity(task_id, created_at desc);
create index evidence_task_idx on public.task_evidence(task_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger branches_updated before update on public.branches for each row execute function public.set_updated_at();
create trigger agents_updated before update on public.agents for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create trigger investigations_updated before update on public.investigations for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from profiles where id = auth.uid() and role = 'ADMIN' and active) $$;
create or replace function public.current_agent_id() returns uuid language sql stable security definer set search_path = public as $$ select a.id from agents a join profiles p on p.id=a.profile_id where a.profile_id=auth.uid() and a.active and p.active limit 1 $$;
create or replace function public.assert_admin() returns void language plpgsql security definer set search_path = public as $$ begin if not is_admin() then raise exception 'ADMIN role required' using errcode='42501'; end if; end $$;
create or replace function public.assert_version(actual integer, expected integer) returns void language plpgsql immutable as $$ begin if actual <> expected then raise exception 'stale record version' using errcode='40001'; end if; end $$;

alter table public.profiles enable row level security; alter table public.branches enable row level security; alter table public.agents enable row level security;
alter table public.tasks enable row level security; alter table public.task_assignments enable row level security; alter table public.investigations enable row level security;
alter table public.notifications enable row level security; alter table public.task_activity enable row level security; alter table public.task_evidence enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (id=auth.uid() or is_admin());
create policy branches_read on public.branches for select to authenticated using (active or is_admin());
create policy agents_read on public.agents for select to authenticated using (is_admin() or profile_id=auth.uid());
create policy tasks_read on public.tasks for select to authenticated using (is_admin() or assigned_agent_id=current_agent_id());
create policy assignments_read on public.task_assignments for select to authenticated using (is_admin() or agent_id=current_agent_id());
create policy investigations_read on public.investigations for select to authenticated using (is_admin() or agent_id=current_agent_id());
create policy notifications_read on public.notifications for select to authenticated using (is_admin() or recipient_profile_id=auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (recipient_profile_id=auth.uid()) with check (recipient_profile_id=auth.uid());
create policy activity_read on public.task_activity for select to authenticated using (is_admin() or exists(select 1 from tasks t where t.id=task_id and t.assigned_agent_id=current_agent_id()));
create policy evidence_read on public.task_evidence for select to authenticated using (is_admin() or exists(select 1 from tasks t where t.id=task_id and t.assigned_agent_id=current_agent_id()));
create policy evidence_insert_own on public.task_evidence for insert to authenticated with check (uploaded_by=auth.uid() and exists(select 1 from tasks t where t.id=task_id and t.assigned_agent_id=current_agent_id() and t.status in ('ACCEPTED','IN_PROGRESS','REWORK_REQUIRED')));
create policy evidence_delete_own on public.task_evidence for delete to authenticated using (uploaded_by=auth.uid() and exists(select 1 from tasks t where t.id=task_id and t.assigned_agent_id=current_agent_id() and t.status in ('ACCEPTED','IN_PROGRESS','REWORK_REQUIRED')));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('investigation-evidence','investigation-evidence',false,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf','audio/webm','audio/mp4']) on conflict(id) do update set public=false;
create policy evidence_storage_read on storage.objects for select to authenticated using (bucket_id='investigation-evidence' and exists(select 1 from public.task_evidence e join public.tasks t on t.id=e.task_id where e.storage_path=name and (public.is_admin() or t.assigned_agent_id=public.current_agent_id())));
create policy evidence_storage_insert on storage.objects for insert to authenticated with check (bucket_id='investigation-evidence' and exists(select 1 from public.tasks t where t.id=(storage.foldername(name))[1]::uuid and t.assigned_agent_id=public.current_agent_id() and t.status in ('ACCEPTED','IN_PROGRESS','REWORK_REQUIRED')));
create policy evidence_storage_delete on storage.objects for delete to authenticated using (bucket_id='investigation-evidence' and (public.is_admin() or owner_id=auth.uid()::text));

create or replace function public.create_task(p_customer_name text,p_customer_phone text,p_loan_type text,p_amount numeric,p_investigation_type text,p_address text,p_city text,p_state text,p_pincode text,p_territory text,p_branch_id uuid,p_priority text,p_due_at timestamptz) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid:=gen_random_uuid(); v_reference text;
begin perform assert_admin(); if p_amount<=0 or p_due_at<=now() then raise exception 'Amount and future due date are required'; end if;
  v_reference:='FI-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.task_reference_seq')::text,4,'0');
  insert into tasks(id,reference_number,customer_name,customer_phone,loan_type,amount,investigation_type,address,area,city,state,pincode,territory,branch_id,priority,due_at,created_by)
  values(v_id,v_reference,trim(p_customer_name),trim(p_customer_phone),p_loan_type,p_amount,p_investigation_type,trim(p_address),p_territory,p_city,p_state,p_pincode,p_territory,p_branch_id,p_priority,p_due_at,auth.uid());
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(v_id,auth.uid(),'ADMIN','TASK_CREATED',jsonb_build_object('detail',v_reference||' created.')); return v_id; end $$;
create sequence public.task_reference_seq start 1001;

create or replace function public.assign_task(p_task_id uuid,p_agent_id uuid,p_expected_version integer,p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare v_task tasks; v_agent agents; v_profile profiles; v_old agents; v_reassign boolean;
begin perform assert_admin(); select * into v_task from tasks where id=p_task_id for update; if not found then raise exception 'Task not found'; end if; perform assert_version(v_task.version,p_expected_version);
  if v_task.status in ('SUBMITTED','COMPLETED','REJECTED','CANCELLED') then raise exception 'Task is not assignable'; end if;
  select * into v_agent from agents where id=p_agent_id and active for update; if not found or v_agent.availability_status='OFFLINE' then raise exception 'Agent is unavailable'; end if;
  select * into v_profile from profiles where id=v_agent.profile_id and active and role='AGENT'; if not found then raise exception 'Agent profile is inactive'; end if;
  v_reassign:=v_task.assigned_agent_id is not null; if v_task.assigned_agent_id=p_agent_id then raise exception 'Task is already assigned to this agent'; end if;
  if v_task.assigned_agent_id is not null then select * into v_old from agents where id=v_task.assigned_agent_id; update task_assignments set is_current=false,unassigned_at=now(),reason=coalesce(p_reason,'Reassigned by Admin') where task_id=p_task_id and is_current; end if;
  insert into task_assignments(task_id,agent_id,assigned_by,reason) values(p_task_id,p_agent_id,auth.uid(),p_reason);
  update tasks set assigned_agent_id=p_agent_id,assigned_at=now(),status='ASSIGNED',accepted_at=null,started_at=null,rework_reason=null,version=version+1 where id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'ADMIN',case when v_reassign then 'TASK_REASSIGNED' else 'TASK_ASSIGNED' end,jsonb_build_object('detail',case when v_reassign then 'Case reassigned.' else 'Case assigned.' end,'agent_id',p_agent_id));
  insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) values(v_agent.profile_id,case when v_reassign then 'TASK_REASSIGNED' else 'TASK_ASSIGNED' end,case when v_reassign then 'Case reassigned to you' else 'New case assigned' end,v_task.reference_number||' for '||v_task.customer_name||' is ready to accept.',p_task_id,'assignment:'||p_task_id||':'||(v_task.version+1));
  if v_old.profile_id is not null then insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) values(v_old.profile_id,'TASK_REASSIGNED','Case reassigned',v_task.reference_number||' is no longer in your active queue.',p_task_id,'unassigned:'||p_task_id||':'||(v_task.version+1)); end if; end $$;

create or replace function public.agent_transition(p_task_id uuid,p_expected_version integer,p_from text[],p_to text,p_event text,p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare v_task tasks; v_agent uuid:=current_agent_id();
begin if v_agent is null then raise exception 'AGENT role required' using errcode='42501'; end if; select * into v_task from tasks where id=p_task_id for update; if not found or v_task.assigned_agent_id<>v_agent then raise exception 'Task is not assigned to this agent' using errcode='42501'; end if; perform assert_version(v_task.version,p_expected_version); if not(v_task.status=any(p_from)) then raise exception 'Invalid task transition'; end if;
  update tasks set status=p_to,version=version+1,accepted_at=case when p_to='ACCEPTED' then now() else accepted_at end,started_at=case when p_to='IN_PROGRESS' then now() else started_at end,rejection_reason=case when p_to='REJECTED' then p_reason else rejection_reason end,rework_reason=case when p_to='IN_PROGRESS' then null else rework_reason end where id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'AGENT',p_event,jsonb_build_object('detail',coalesce(p_reason,p_event))); end $$;
create or replace function public.accept_task(p_task_id uuid,p_expected_version integer) returns void language sql security definer set search_path=public as $$ select agent_transition(p_task_id,p_expected_version,array['ASSIGNED'],'ACCEPTED','TASK_ACCEPTED') $$;
create or replace function public.start_task(p_task_id uuid,p_expected_version integer) returns void language sql security definer set search_path=public as $$ select agent_transition(p_task_id,p_expected_version,array['ACCEPTED','REWORK_REQUIRED'],'IN_PROGRESS','TASK_STARTED') $$;
create or replace function public.reject_assignment(p_task_id uuid,p_expected_version integer,p_reason text) returns void language plpgsql security definer set search_path=public as $$
declare v_task tasks; begin if trim(p_reason)='' then raise exception 'Reason required'; end if; perform agent_transition(p_task_id,p_expected_version,array['ASSIGNED'],'REJECTED','TASK_REJECTED',trim(p_reason)); select * into v_task from tasks where id=p_task_id; insert into notifications(recipient_profile_id,type,title,message,task_id) select id,'TASK_REJECTED','Assignment rejected',v_task.reference_number||': '||trim(p_reason),p_task_id from profiles where role='ADMIN' and active; end $$;

create or replace function public.save_investigation_draft(p_task_id uuid,p_expected_version integer,p_form jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare v_task tasks; v_agent uuid:=current_agent_id(); v_inv investigations;
begin select * into v_task from tasks where id=p_task_id for update; if v_agent is null or v_task.assigned_agent_id<>v_agent then raise exception 'Task access denied' using errcode='42501'; end if; if v_task.status not in ('ACCEPTED','IN_PROGRESS','REWORK_REQUIRED') then raise exception 'Draft cannot be edited in this status'; end if;
  select * into v_inv from investigations where task_id=p_task_id for update; if found then perform assert_version(v_inv.version,p_expected_version); update investigations set status='DRAFT',resides_verified=coalesce(p_form->>'resides_verified',''),home_ownership=coalesce(p_form->>'home_ownership','Owned'),stay_duration=coalesce(p_form->>'stay_duration','1-3 Years'),remarks=coalesce(p_form->>'remarks',''),completed_checklist_ids=coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}'),evidence_ids=coalesce(array(select jsonb_array_elements_text(p_form->'evidence_ids'))::uuid[],'{}'),form_data=p_form,version=version+1 where id=v_inv.id returning id into v_inv.id;
  else if p_expected_version<>0 then raise exception 'stale record version' using errcode='40001'; end if; insert into investigations(task_id,agent_id,status,resides_verified,home_ownership,stay_duration,remarks,completed_checklist_ids,evidence_ids,form_data,started_at) values(p_task_id,v_agent,'DRAFT',coalesce(p_form->>'resides_verified',''),coalesce(p_form->>'home_ownership','Owned'),coalesce(p_form->>'stay_duration','1-3 Years'),coalesce(p_form->>'remarks',''),coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}'),coalesce(array(select jsonb_array_elements_text(p_form->'evidence_ids'))::uuid[],'{}'),p_form,now()) returning id into v_inv.id; end if; return v_inv.id; end $$;

create or replace function public.submit_investigation(p_task_id uuid,p_expected_task_version integer,p_expected_investigation_version integer,p_form jsonb) returns void language plpgsql security definer set search_path=public as $$
declare v_task tasks; v_agent uuid:=current_agent_id(); v_inv_id uuid; v_count integer; v_missing integer; v_resubmission boolean;
begin select * into v_task from tasks where id=p_task_id for update; if v_agent is null or v_task.assigned_agent_id<>v_agent then raise exception 'Task access denied' using errcode='42501'; end if; perform assert_version(v_task.version,p_expected_task_version); if v_task.status<>'IN_PROGRESS' then raise exception 'Task must be in progress'; end if;
  select exists(select 1 from investigations where task_id=p_task_id and submitted_at is not null) into v_resubmission;
  select count(*) into v_count from task_evidence where task_id=p_task_id; if v_count<3 then raise exception 'At least three uploaded evidence items are required'; end if; if coalesce(p_form->>'resides_verified','')='' then raise exception 'Residence verification answer required'; end if;
  select count(*) into v_missing from jsonb_array_elements(v_task.checklist) c where coalesce((c->>'required')::boolean,false) and not (c->>'id'=any(coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}'))); if v_missing>0 then raise exception 'Required checklist is incomplete'; end if;
  perform save_investigation_draft(p_task_id,p_expected_investigation_version,p_form); update investigations set status='SUBMITTED',submitted_at=now(),version=version+1 where task_id=p_task_id returning id into v_inv_id;
  update task_evidence set investigation_id=v_inv_id where task_id=p_task_id; update tasks set status='SUBMITTED',submitted_at=now(),version=version+1 where id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'AGENT',case when v_resubmission then 'TASK_RESUBMITTED' else 'TASK_SUBMITTED' end,jsonb_build_object('detail',v_task.reference_number||case when v_resubmission then ' resubmitted for Admin review.' else ' submitted for Admin review.' end));
  insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) select id,'TASK_SUBMITTED','Investigation submitted',v_task.reference_number||' is ready for review.',p_task_id,'submitted:'||p_task_id||':'||(v_task.version+1) from profiles where role='ADMIN' and active; end $$;

create or replace function public.admin_review_transition(p_task_id uuid,p_expected_version integer,p_to text,p_event text,p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
declare v_task tasks; v_agent agents;
begin perform assert_admin(); select * into v_task from tasks where id=p_task_id for update; if not found then raise exception 'Task not found'; end if; perform assert_version(v_task.version,p_expected_version); if v_task.status<>'SUBMITTED' then raise exception 'Only submitted tasks can be reviewed'; end if; if p_to='REWORK_REQUIRED' and trim(coalesce(p_reason,''))='' then raise exception 'Rework reason required'; end if;
  update tasks set status=p_to,rework_reason=case when p_to='REWORK_REQUIRED' then trim(p_reason) else null end,completed_at=case when p_to='COMPLETED' then now() else completed_at end,version=version+1 where id=p_task_id; update investigations set status=case when p_to='REWORK_REQUIRED' then 'REWORK_REQUIRED' else status end where task_id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'ADMIN',p_event,jsonb_build_object('detail',coalesce(trim(p_reason),p_event)));
  select * into v_agent from agents where id=v_task.assigned_agent_id; insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) values(v_agent.profile_id,case when p_to='REWORK_REQUIRED' then 'REWORK_REQUESTED' else 'TASK_COMPLETED' end,case when p_to='REWORK_REQUIRED' then 'Rework requested' else 'Case completed' end,v_task.reference_number||case when p_to='REWORK_REQUIRED' then ': '||trim(p_reason) else ' was approved and closed.' end,p_task_id,lower(p_to)||':'||p_task_id||':'||(v_task.version+1)); end $$;
create or replace function public.request_rework(p_task_id uuid,p_expected_version integer,p_reason text) returns void language sql security definer set search_path=public as $$ select admin_review_transition(p_task_id,p_expected_version,'REWORK_REQUIRED','TASK_REWORK_REQUESTED',p_reason) $$;
create or replace function public.complete_task(p_task_id uuid,p_expected_version integer) returns void language sql security definer set search_path=public as $$ select admin_review_transition(p_task_id,p_expected_version,'COMPLETED','TASK_COMPLETED',null) $$;

create or replace function public.update_task_details(p_task_id uuid,p_expected_version integer,p_priority text,p_due_at timestamptz) returns void language plpgsql security definer set search_path=public as $$ declare v_task tasks; begin perform assert_admin(); select * into v_task from tasks where id=p_task_id for update; if v_task.status in ('COMPLETED','REJECTED','CANCELLED') then raise exception 'Closed task cannot be edited'; end if; perform assert_version(v_task.version,p_expected_version); update tasks set priority=coalesce(p_priority,priority),due_at=coalesce(p_due_at,due_at),version=version+1 where id=p_task_id; insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'ADMIN','TASK_UPDATED',jsonb_build_object('detail','Priority or due date updated.')); end $$;
create or replace function public.provision_agent(p_email text,p_display_name text,p_phone text,p_branch_id uuid) returns uuid language plpgsql security definer set search_path=public as $$ declare v_profile profiles; v_branch branches; v_id uuid; begin perform assert_admin(); select * into v_profile from profiles where lower(email)=lower(trim(p_email)); if not found then raise exception 'Create this email in Supabase Auth first'; end if; select * into v_branch from branches where id=p_branch_id and active; if not found then raise exception 'Branch not found'; end if; update profiles set role='AGENT',display_name=trim(p_display_name),active=true where id=v_profile.id; insert into agents(profile_id,employee_code,phone,branch_id,city,state,pincodes,territories) values(v_profile.id,'AGT'||lpad(nextval('public.agent_code_seq')::text,3,'0'),trim(p_phone),v_branch.id,v_branch.city,v_branch.state,v_branch.pincodes,v_branch.territories) returning id into v_id; return v_id; end $$;
create sequence public.agent_code_seq start 1;
create or replace function public.update_agent(p_agent_id uuid,p_branch_id uuid,p_availability text,p_battery integer,p_active boolean) returns void language plpgsql security definer set search_path=public as $$ declare v_branch branches; begin perform assert_admin(); if p_branch_id is not null then select * into v_branch from branches where id=p_branch_id; if not found then raise exception 'Branch not found'; end if; end if; update agents set branch_id=coalesce(p_branch_id,branch_id),city=case when p_branch_id is null then city else v_branch.city end,state=case when p_branch_id is null then state else v_branch.state end,pincodes=case when p_branch_id is null then pincodes else v_branch.pincodes end,territories=case when p_branch_id is null then territories else v_branch.territories end,availability_status=coalesce(p_availability,availability_status),battery=coalesce(p_battery,battery),active=coalesce(p_active,active) where id=p_agent_id; if not found then raise exception 'Agent not found'; end if; end $$;

revoke execute on all functions in schema public from public,anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_agent_id() to authenticated;
revoke execute on function public.agent_transition(uuid,integer,text[],text,text,text) from public,anon,authenticated;
revoke execute on function public.admin_review_transition(uuid,integer,text,text,text) from public,anon,authenticated;
revoke execute on function public.assert_admin() from public,anon,authenticated;
revoke execute on function public.assert_version(integer,integer) from public,anon,authenticated;
grant execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz) to authenticated;
grant execute on function public.assign_task(uuid,uuid,integer,text) to authenticated; grant execute on function public.accept_task(uuid,integer) to authenticated; grant execute on function public.start_task(uuid,integer) to authenticated; grant execute on function public.reject_assignment(uuid,integer,text) to authenticated;
grant execute on function public.save_investigation_draft(uuid,integer,jsonb) to authenticated; grant execute on function public.submit_investigation(uuid,integer,integer,jsonb) to authenticated;
grant execute on function public.request_rework(uuid,integer,text) to authenticated; grant execute on function public.complete_task(uuid,integer) to authenticated; grant execute on function public.update_task_details(uuid,integer,text,timestamptz) to authenticated;
grant execute on function public.provision_agent(text,text,text,uuid) to authenticated; grant execute on function public.update_agent(uuid,uuid,text,integer,boolean) to authenticated;


create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,role,display_name,email)
  values(new.id,'AGENT',coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)),coalesce(new.email,''))
  on conflict(id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();
revoke execute on function public.handle_new_auth_user() from public,anon,authenticated;

grant select on public.profiles,public.branches,public.agents,public.tasks,public.task_assignments,public.investigations,public.notifications,public.task_activity,public.task_evidence to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant insert,delete on public.task_evidence to authenticated;

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
  insert into public.tasks(reference_number,customer_name,customer_phone,loan_type,amount,investigation_type,address,area,city,state,pincode,territory,branch_id,priority,status,due_at,created_by)
  values
  ('FI-DRYRUN-001','Rajesh Kumar Sharma','+91 98765 43210','Home Loan',4200000,'Residence Verification','102, Sai Residency, Baner Road, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,'HIGH','UNASSIGNED',now()+interval '1 day',v_admin),
  ('FI-DRYRUN-002','Neha Patil','+91 91234 56780','Home Loan',1975000,'Residence Verification','Flat 7B, Green Heights, Baner, Pune - 411045','Baner','Pune','Maharashtra','411045','Baner',v_branch,'MEDIUM','UNASSIGNED',now()+interval '2 days',v_admin);
end $$;
revoke execute on function public.reset_dry_run_data() from public,anon;
grant execute on function public.reset_dry_run_data() to authenticated;

do $$ begin alter publication supabase_realtime add table public.tasks,public.task_assignments,public.investigations,public.task_evidence,public.notifications,public.task_activity,public.agents; exception when duplicate_object then null; end $$;
