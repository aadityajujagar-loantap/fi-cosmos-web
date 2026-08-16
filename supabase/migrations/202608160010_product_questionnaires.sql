create table if not exists public.loan_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  active boolean not null default true,
  version integer not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (code = upper(code) and code ~ '^[A-Z0-9_-]{2,30}$'),
  check (char_length(trim(name)) between 2 and 80)
);

create table if not exists public.product_questions (
  id uuid primary key default gen_random_uuid(),
  loan_product_id uuid not null references public.loan_products(id) on delete cascade,
  prompt text not null,
  response_type text not null check (response_type in ('TEXT','TEXTAREA','YES_NO','NUMBER','DATE','SELECT','MULTI_SELECT')),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  required boolean not null default true,
  sort_order integer not null check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loan_product_id, sort_order),
  check (char_length(trim(prompt)) between 3 and 300)
);

alter table public.tasks
  add column if not exists loan_product_id uuid references public.loan_products(id),
  add column if not exists questionnaire jsonb not null default '[]'::jsonb;

alter table public.investigations
  add column if not exists questionnaire_answers jsonb not null default '{}'::jsonb;

create index if not exists product_questions_product_order_idx on public.product_questions(loan_product_id, sort_order);
create index if not exists tasks_loan_product_idx on public.tasks(loan_product_id);

drop trigger if exists loan_products_updated on public.loan_products;
create trigger loan_products_updated before update on public.loan_products for each row execute function public.set_updated_at();
drop trigger if exists product_questions_updated on public.product_questions;
create trigger product_questions_updated before update on public.product_questions for each row execute function public.set_updated_at();

alter table public.loan_products enable row level security;
alter table public.product_questions enable row level security;

drop policy if exists loan_products_read on public.loan_products;
create policy loan_products_read on public.loan_products for select to authenticated
using (active or public.is_admin());

drop policy if exists product_questions_read on public.product_questions;
create policy product_questions_read on public.product_questions for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.loan_products product
    where product.id = loan_product_id and product.active
  )
);

grant select on public.loan_products, public.product_questions to authenticated;

insert into public.loan_products(code, name)
values
  ('HOME_LOAN', 'Home Loan'),
  ('BUSINESS_LOAN', 'Business Loan'),
  ('VEHICLE_LOAN', 'Vehicle Loan'),
  ('PERSONAL_LOAN', 'Personal Loan'),
  ('PROPERTY_LOAN', 'Property Loan')
on conflict (code) do update set name = excluded.name;

insert into public.product_questions(loan_product_id, prompt, response_type, options, required, sort_order)
select product.id, definition.prompt, definition.response_type, definition.options, true, definition.sort_order
from public.loan_products product
cross join (values
  ('Does the applicant currently reside at the stated address?', 'YES_NO', '["Yes","No"]'::jsonb, 0),
  ('What is the residence ownership type?', 'SELECT', '["Owned","Rented","Family owned","Company provided"]'::jsonb, 1),
  ('How long has the applicant stayed at this address?', 'SELECT', '["Less than 1 year","1-3 years","3-5 years","More than 5 years"]'::jsonb, 2),
  ('Record property occupancy and neighborhood verification.', 'TEXTAREA', '[]'::jsonb, 3)
) as definition(prompt, response_type, options, sort_order)
where product.code = 'HOME_LOAN'
  and not exists (select 1 from public.product_questions question where question.loan_product_id = product.id);

insert into public.product_questions(loan_product_id, prompt, response_type, options, required, sort_order)
select product.id, definition.prompt, definition.response_type, definition.options, true, definition.sort_order
from public.loan_products product
cross join (values
  ('Is the business operating at the stated premises?', 'YES_NO', '["Yes","No"]'::jsonb, 0),
  ('Select the business constitution.', 'SELECT', '["Proprietorship","Partnership","Private Limited","Public Limited","Other"]'::jsonb, 1),
  ('How many years has the business operated?', 'NUMBER', '[]'::jsonb, 2),
  ('Describe visible business activity, stock, and staff.', 'TEXTAREA', '[]'::jsonb, 3)
) as definition(prompt, response_type, options, sort_order)
where product.code = 'BUSINESS_LOAN'
  and not exists (select 1 from public.product_questions question where question.loan_product_id = product.id);

insert into public.product_questions(loan_product_id, prompt, response_type, options, required, sort_order)
select product.id, definition.prompt, definition.response_type, definition.options, true, definition.sort_order
from public.loan_products product
cross join (values
  ('Was the financed vehicle physically available for inspection?', 'YES_NO', '["Yes","No"]'::jsonb, 0),
  ('Enter the vehicle registration number.', 'TEXT', '[]'::jsonb, 1),
  ('Enter the last five characters of the chassis number.', 'TEXT', '[]'::jsonb, 2),
  ('Select the observed vehicle condition.', 'SELECT', '["Excellent","Good","Fair","Damaged"]'::jsonb, 3)
) as definition(prompt, response_type, options, sort_order)
where product.code = 'VEHICLE_LOAN'
  and not exists (select 1 from public.product_questions question where question.loan_product_id = product.id);

insert into public.product_questions(loan_product_id, prompt, response_type, options, required, sort_order)
select product.id, definition.prompt, definition.response_type, definition.options, true, definition.sort_order
from public.loan_products product
cross join (values
  ('Was the applicant personally met during verification?', 'YES_NO', '["Yes","No"]'::jsonb, 0),
  ('Select the applicant employment type.', 'SELECT', '["Salaried","Self-employed","Professional","Retired","Other"]'::jsonb, 1),
  ('Enter the employer or business name.', 'TEXT', '[]'::jsonb, 2),
  ('Record residence and neighborhood feedback.', 'TEXTAREA', '[]'::jsonb, 3)
) as definition(prompt, response_type, options, sort_order)
where product.code = 'PERSONAL_LOAN'
  and not exists (select 1 from public.product_questions question where question.loan_product_id = product.id);

insert into public.product_questions(loan_product_id, prompt, response_type, options, required, sort_order)
select product.id, definition.prompt, definition.response_type, definition.options, true, definition.sort_order
from public.loan_products product
cross join (values
  ('Does the property exist at the stated location?', 'YES_NO', '["Yes","No"]'::jsonb, 0),
  ('Select the current property usage.', 'SELECT', '["Self occupied","Tenant occupied","Vacant","Under construction"]'::jsonb, 1),
  ('Enter the approximate built-up area in square feet.', 'NUMBER', '[]'::jsonb, 2),
  ('Record access, boundaries, condition, and local enquiry.', 'TEXTAREA', '[]'::jsonb, 3)
) as definition(prompt, response_type, options, sort_order)
where product.code = 'PROPERTY_LOAN'
  and not exists (select 1 from public.product_questions question where question.loan_product_id = product.id);

create or replace function public.product_questionnaire_snapshot(p_product_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', question.id,
    'prompt', question.prompt,
    'responseType', question.response_type,
    'options', question.options,
    'required', question.required,
    'sortOrder', question.sort_order
  ) order by question.sort_order), '[]'::jsonb)
  from public.product_questions question
  where question.loan_product_id = p_product_id and question.active;
$$;

revoke execute on function public.product_questionnaire_snapshot(uuid) from public, anon, authenticated;

create or replace function public.create_loan_product(p_code text, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  perform public.assert_admin();
  if upper(trim(p_code)) !~ '^[A-Z0-9_-]{2,30}$' then raise exception 'Product code must contain only letters, numbers, underscores, or hyphens'; end if;
  if char_length(trim(p_name)) not between 2 and 80 then raise exception 'Product name must contain 2 to 80 characters'; end if;
  insert into public.loan_products(code, name, created_by)
  values(upper(trim(p_code)), trim(p_name), auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.update_loan_product(p_product_id uuid, p_name text, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  if p_name is not null and char_length(trim(p_name)) not between 2 and 80 then raise exception 'Product name must contain 2 to 80 characters'; end if;
  update public.loan_products
  set name = coalesce(nullif(trim(p_name), ''), name), active = coalesce(p_active, active), version = version + 1
  where id = p_product_id;
  if not found then raise exception 'Loan product not found'; end if;
end;
$$;

create or replace function public.replace_product_questions(p_product_id uuid, p_questions jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_question jsonb;
  v_type text;
  v_options jsonb;
  v_order integer := 0;
begin
  perform public.assert_admin();
  perform 1 from public.loan_products where id = p_product_id for update;
  if not found then raise exception 'Loan product not found'; end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) < 1 then raise exception 'At least one product question is required'; end if;
  if jsonb_array_length(p_questions) > 100 then raise exception 'A product cannot contain more than 100 questions'; end if;

  delete from public.product_questions where loan_product_id = p_product_id;
  for v_question in select value from jsonb_array_elements(p_questions) loop
    v_type := upper(coalesce(v_question->>'responseType', ''));
    v_options := coalesce(v_question->'options', '[]'::jsonb);
    if char_length(trim(coalesce(v_question->>'prompt', ''))) not between 3 and 300 then raise exception 'Every question must contain 3 to 300 characters'; end if;
    if v_type not in ('TEXT','TEXTAREA','YES_NO','NUMBER','DATE','SELECT','MULTI_SELECT') then raise exception 'Unsupported question type: %', v_type; end if;
    if jsonb_typeof(v_options) <> 'array' then raise exception 'Question options must be an array'; end if;
    if v_type in ('SELECT','MULTI_SELECT','YES_NO') and jsonb_array_length(v_options) < 2 then raise exception 'Choice questions require at least two options'; end if;
    insert into public.product_questions(id, loan_product_id, prompt, response_type, options, required, sort_order)
    values(
      coalesce(nullif(v_question->>'id', '')::uuid, gen_random_uuid()),
      p_product_id,
      trim(v_question->>'prompt'),
      v_type,
      v_options,
      coalesce((v_question->>'required')::boolean, false),
      v_order
    );
    v_order := v_order + 1;
  end loop;

  update public.loan_products set version = version + 1 where id = p_product_id;
end;
$$;

revoke execute on function public.create_loan_product(text,text) from public, anon;
revoke execute on function public.update_loan_product(uuid,text,boolean) from public, anon;
revoke execute on function public.replace_product_questions(uuid,jsonb) from public, anon;
grant execute on function public.create_loan_product(text,text) to authenticated;
grant execute on function public.update_loan_product(uuid,text,boolean) to authenticated;
grant execute on function public.replace_product_questions(uuid,jsonb) to authenticated;

update public.tasks task
set loan_product_id = product.id
from public.loan_products product
where task.loan_product_id is null and lower(task.loan_type) = lower(product.name);

update public.tasks
set questionnaire = public.product_questionnaire_snapshot(loan_product_id)
where loan_product_id is not null and questionnaire = '[]'::jsonb;

create or replace function public.set_task_product_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.loan_products%rowtype;
begin
  if new.loan_product_id is not null then
    select * into v_product from public.loan_products where id = new.loan_product_id;
  else
    select * into v_product from public.loan_products where lower(name) = lower(new.loan_type) limit 1;
  end if;
  if found then
    new.loan_product_id := v_product.id;
    new.loan_type := v_product.name;
    if new.questionnaire is null or new.questionnaire = '[]'::jsonb then
      new.questionnaire := public.product_questionnaire_snapshot(v_product.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_product_defaults on public.tasks;
create trigger tasks_product_defaults
before insert on public.tasks
for each row execute function public.set_task_product_defaults();

drop function if exists public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision);

create or replace function public.create_task(
  p_customer_name text,
  p_customer_phone text,
  p_loan_type text,
  p_amount numeric,
  p_investigation_type text,
  p_address text,
  p_city text,
  p_state text,
  p_pincode text,
  p_territory text,
  p_branch_id uuid,
  p_priority text,
  p_due_at timestamptz,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_loan_product_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := gen_random_uuid();
  v_reference text;
  v_product public.loan_products%rowtype;
  v_questionnaire jsonb;
begin
  perform public.assert_admin();
  if p_amount <= 0 or p_due_at <= now() then raise exception 'Amount and future due date are required'; end if;
  if p_latitude is not null or p_longitude is not null then
    if p_latitude is null or p_longitude is null or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or (p_latitude = 0 and p_longitude = 0) then
      raise exception 'Destination coordinates must be a valid latitude/longitude pair';
    end if;
  end if;
  select * into v_product
  from public.loan_products
  where active and (id = p_loan_product_id or (p_loan_product_id is null and lower(name) = lower(trim(p_loan_type))))
  limit 1;
  if not found then raise exception 'Active loan product is required'; end if;
  v_questionnaire := public.product_questionnaire_snapshot(v_product.id);
  if jsonb_array_length(v_questionnaire) = 0 then raise exception 'Configure at least one question for this loan product'; end if;
  v_reference := 'FI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.task_reference_seq')::text, 4, '0');
  insert into public.tasks(
    id, reference_number, customer_name, customer_phone, loan_type, loan_product_id, amount,
    investigation_type, address, area, city, state, pincode, territory, branch_id,
    latitude, longitude, priority, due_at, created_by, questionnaire
  ) values (
    v_id, v_reference, trim(p_customer_name), trim(p_customer_phone), v_product.name, v_product.id, p_amount,
    p_investigation_type, trim(p_address), p_territory, p_city, p_state, p_pincode, p_territory, p_branch_id,
    p_latitude, p_longitude, p_priority, p_due_at, auth.uid(), v_questionnaire
  );
  insert into public.task_activity(task_id, actor_profile_id, actor_role, event_type, metadata)
  values(v_id, auth.uid(), 'ADMIN', 'TASK_CREATED', jsonb_build_object('detail', v_reference || ' created for ' || v_product.name || '.'));
  return v_id;
end;
$$;

create or replace function public.assign_task(p_task_id uuid,p_agent_id uuid,p_expected_version integer,p_reason text default null)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_task tasks; v_agent agents; v_profile profiles; v_old agents; v_product loan_products; v_reassign boolean; v_questionnaire jsonb;
begin
  perform assert_admin();
  select * into v_task from tasks where id=p_task_id for update;
  if not found then raise exception 'Task not found'; end if;
  perform assert_version(v_task.version,p_expected_version);
  if v_task.status in ('SUBMITTED','COMPLETED','REJECTED','CANCELLED') then raise exception 'Task is not assignable'; end if;
  select * into v_agent from agents where id=p_agent_id and active for update;
  if not found or v_agent.availability_status='OFFLINE' then raise exception 'Agent is unavailable'; end if;
  select * into v_profile from profiles where id=v_agent.profile_id and active and role='AGENT';
  if not found then raise exception 'Agent profile is inactive'; end if;
  v_reassign:=v_task.assigned_agent_id is not null;
  if v_task.assigned_agent_id=p_agent_id then raise exception 'Task is already assigned to this agent'; end if;
  if not v_reassign then
    if v_task.loan_product_id is null then raise exception 'Task has no configured loan product'; end if;
    select * into v_product from loan_products where id = v_task.loan_product_id and active;
    if not found then raise exception 'Task loan product is inactive or missing'; end if;
    v_questionnaire := public.product_questionnaire_snapshot(v_task.loan_product_id);
    if jsonb_array_length(v_questionnaire)=0 then raise exception 'Loan product has no active questionnaire'; end if;
  else
    v_questionnaire := v_task.questionnaire;
  end if;
  if v_task.assigned_agent_id is not null then
    select * into v_old from agents where id=v_task.assigned_agent_id;
    update task_assignments set is_current=false,unassigned_at=now(),reason=coalesce(p_reason,'Reassigned by Admin') where task_id=p_task_id and is_current;
  end if;
  insert into task_assignments(task_id,agent_id,assigned_by,reason) values(p_task_id,p_agent_id,auth.uid(),p_reason);
  update tasks set assigned_agent_id=p_agent_id,assigned_at=now(),status='ASSIGNED',accepted_at=null,started_at=null,rework_reason=null,loan_type=case when v_reassign then loan_type else v_product.name end,questionnaire=v_questionnaire,version=version+1 where id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'ADMIN',case when v_reassign then 'TASK_REASSIGNED' else 'TASK_ASSIGNED' end,jsonb_build_object('detail',case when v_reassign then 'Case reassigned.' else 'Case assigned with product questionnaire.' end,'agent_id',p_agent_id));
  insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) values(v_agent.profile_id,case when v_reassign then 'TASK_REASSIGNED' else 'TASK_ASSIGNED' end,case when v_reassign then 'Case reassigned to you' else 'New case assigned' end,v_task.reference_number||' for '||v_task.customer_name||' is ready to accept.',p_task_id,'assignment:'||p_task_id||':'||(v_task.version+1));
  if v_old.profile_id is not null then insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) values(v_old.profile_id,'TASK_REASSIGNED','Case reassigned',v_task.reference_number||' is no longer in your active queue.',p_task_id,'unassigned:'||p_task_id||':'||(v_task.version+1)); end if;
end;
$$;

create or replace function public.save_investigation_draft(p_task_id uuid,p_expected_version integer,p_form jsonb)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_task tasks; v_agent uuid:=current_agent_id(); v_inv investigations; v_answers jsonb:=coalesce(p_form->'questionnaire_answers','{}'::jsonb);
begin
  select * into v_task from tasks where id=p_task_id for update;
  if v_agent is null or v_task.assigned_agent_id<>v_agent then raise exception 'Task access denied' using errcode='42501'; end if;
  if v_task.status not in ('ACCEPTED','IN_PROGRESS','REWORK_REQUIRED') then raise exception 'Draft cannot be edited in this status'; end if;
  if jsonb_typeof(v_answers)<>'object' then raise exception 'Questionnaire answers must be an object'; end if;
  select * into v_inv from investigations where task_id=p_task_id for update;
  if found then
    perform assert_version(v_inv.version,p_expected_version);
    update investigations set status='DRAFT',resides_verified=coalesce(p_form->>'resides_verified',''),home_ownership=coalesce(p_form->>'home_ownership',''),stay_duration=coalesce(p_form->>'stay_duration',''),remarks=coalesce(p_form->>'remarks',''),completed_checklist_ids=coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}'),evidence_ids=coalesce(array(select jsonb_array_elements_text(p_form->'evidence_ids'))::uuid[],'{}'),questionnaire_answers=v_answers,form_data=p_form,version=version+1 where id=v_inv.id returning id into v_inv.id;
  else
    if p_expected_version<>0 then raise exception 'stale record version' using errcode='40001'; end if;
    insert into investigations(task_id,agent_id,status,resides_verified,home_ownership,stay_duration,remarks,completed_checklist_ids,evidence_ids,questionnaire_answers,form_data,started_at)
    values(p_task_id,v_agent,'DRAFT',coalesce(p_form->>'resides_verified',''),coalesce(p_form->>'home_ownership',''),coalesce(p_form->>'stay_duration',''),coalesce(p_form->>'remarks',''),coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}'),coalesce(array(select jsonb_array_elements_text(p_form->'evidence_ids'))::uuid[],'{}'),v_answers,p_form,now()) returning id into v_inv.id;
  end if;
  return v_inv.id;
end;
$$;

create or replace function public.submit_investigation(p_task_id uuid,p_expected_task_version integer,p_expected_investigation_version integer,p_form jsonb)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_task tasks; v_agent uuid:=current_agent_id(); v_inv_id uuid; v_count integer; v_missing integer; v_resubmission boolean; v_question jsonb; v_answer jsonb; v_type text; v_answers jsonb:=coalesce(p_form->'questionnaire_answers','{}'::jsonb);
begin
  select * into v_task from tasks where id=p_task_id for update;
  if v_agent is null or v_task.assigned_agent_id<>v_agent then raise exception 'Task access denied' using errcode='42501'; end if;
  perform assert_version(v_task.version,p_expected_task_version);
  if v_task.status<>'IN_PROGRESS' then raise exception 'Task must be in progress'; end if;
  select exists(select 1 from investigations where task_id=p_task_id and submitted_at is not null) into v_resubmission;
  select count(*) into v_count from task_evidence where task_id=p_task_id;
  if v_count<3 then raise exception 'At least three uploaded evidence items are required'; end if;
  if jsonb_typeof(v_answers)<>'object' then raise exception 'Questionnaire answers must be an object'; end if;
  select count(*) into v_missing
  from jsonb_array_elements(v_task.questionnaire) question
  where coalesce((question->>'required')::boolean,false)
    and (
      not (v_answers ? (question->>'id'))
      or jsonb_typeof(v_answers->(question->>'id'))='null'
      or (jsonb_typeof(v_answers->(question->>'id'))='string' and btrim(v_answers->>(question->>'id'))='')
      or (jsonb_typeof(v_answers->(question->>'id'))='array' and jsonb_array_length(v_answers->(question->>'id'))=0)
    );
  if v_missing>0 then raise exception 'Complete all required product questionnaire answers'; end if;

  for v_question in select value from jsonb_array_elements(v_task.questionnaire) loop
    if not (v_answers ? (v_question->>'id')) then continue; end if;
    v_answer := v_answers->(v_question->>'id');
    if jsonb_typeof(v_answer) = 'null' then continue; end if;
    v_type := v_question->>'responseType';

    if v_type in ('TEXT','TEXTAREA') and jsonb_typeof(v_answer) <> 'string' then
      raise exception 'Invalid text answer for: %', v_question->>'prompt';
    elsif v_type = 'NUMBER' and (
      jsonb_typeof(v_answer) <> 'string' or (v_answer #>> '{}') !~ '^[+-]?([0-9]+([.][0-9]+)?|[.][0-9]+)$'
    ) then
      raise exception 'Invalid number answer for: %', v_question->>'prompt';
    elsif v_type = 'DATE' and (
      jsonb_typeof(v_answer) <> 'string' or (v_answer #>> '{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    ) then
      raise exception 'Invalid date answer for: %', v_question->>'prompt';
    elsif v_type in ('YES_NO','SELECT') and (
      jsonb_typeof(v_answer) <> 'string' or not exists (
        select 1 from jsonb_array_elements_text(v_question->'options') option_value
        where option_value = (v_answer #>> '{}')
      )
    ) then
      raise exception 'Invalid choice answer for: %', v_question->>'prompt';
    elsif v_type = 'MULTI_SELECT' then
      if jsonb_typeof(v_answer) <> 'array' then
        raise exception 'Invalid multi-select answer for: %', v_question->>'prompt';
      end if;
      select count(*) into v_count
      from jsonb_array_elements(v_answer) selected_value
      where jsonb_typeof(selected_value) <> 'string'
        or not exists (
          select 1 from jsonb_array_elements_text(v_question->'options') option_value
          where option_value = (selected_value #>> '{}')
        );
      if v_count > 0 then raise exception 'Invalid multi-select answer for: %', v_question->>'prompt'; end if;
    end if;
  end loop;

  select count(*) into v_missing from jsonb_array_elements(v_task.checklist) item where coalesce((item->>'required')::boolean,false) and not (item->>'id'=any(coalesce(array(select jsonb_array_elements_text(p_form->'completed_checklist_ids')),'{}')));
  if v_missing>0 then raise exception 'Required checklist is incomplete'; end if;
  perform save_investigation_draft(p_task_id,p_expected_investigation_version,p_form);
  update investigations set status='SUBMITTED',submitted_at=now(),version=version+1 where task_id=p_task_id returning id into v_inv_id;
  update task_evidence set investigation_id=v_inv_id where task_id=p_task_id;
  update tasks set status='SUBMITTED',submitted_at=now(),version=version+1 where id=p_task_id;
  insert into task_activity(task_id,actor_profile_id,actor_role,event_type,metadata) values(p_task_id,auth.uid(),'AGENT',case when v_resubmission then 'TASK_RESUBMITTED' else 'TASK_SUBMITTED' end,jsonb_build_object('detail',v_task.reference_number||case when v_resubmission then ' resubmitted for Admin review.' else ' submitted for Admin review.' end));
  insert into notifications(recipient_profile_id,type,title,message,task_id,dedupe_key) select id,'TASK_SUBMITTED','Investigation submitted',v_task.reference_number||' is ready for review.',p_task_id,'submitted:'||p_task_id||':'||(v_task.version+1) from profiles where role='ADMIN' and active;
end;
$$;

revoke execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision,uuid) from public, anon;
grant execute on function public.create_task(text,text,text,numeric,text,text,text,text,text,text,uuid,text,timestamptz,double precision,double precision,uuid) to authenticated;

do $$
declare v_table text;
begin
  foreach v_table in array array['loan_products','product_questions'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename=v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I',v_table);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
