do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'profiles', 'branches', 'agents', 'tasks', 'task_assignments',
    'investigations', 'task_evidence', 'notifications', 'task_activity'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end $$;

create or replace function public.update_agent(
  p_agent_id uuid,
  p_branch_id uuid,
  p_availability text,
  p_battery integer,
  p_active boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent public.agents%rowtype;
  v_branch public.branches%rowtype;
begin
  perform public.assert_admin();

  select * into v_agent from public.agents where id = p_agent_id for update;
  if not found then raise exception 'Agent not found'; end if;

  if p_branch_id is not null then
    select * into v_branch from public.branches where id = p_branch_id and active;
    if not found then raise exception 'Active branch not found'; end if;
  end if;
  if p_availability is not null and p_availability not in ('AVAILABLE', 'BUSY', 'OFFLINE') then
    raise exception 'Invalid availability';
  end if;
  if p_battery is not null and p_battery not between 0 and 100 then
    raise exception 'Battery must be between 0 and 100';
  end if;

  update public.agents
  set branch_id = coalesce(p_branch_id, branch_id),
      city = case when p_branch_id is null then city else v_branch.city end,
      state = case when p_branch_id is null then state else v_branch.state end,
      pincodes = case when p_branch_id is null then pincodes else v_branch.pincodes end,
      territories = case when p_branch_id is null then territories else v_branch.territories end,
      availability_status = coalesce(p_availability, availability_status),
      battery = coalesce(p_battery, battery),
      active = coalesce(p_active, active)
  where id = p_agent_id;

  if p_active is not null then
    update public.profiles set active = p_active where id = v_agent.profile_id;
  end if;
end;
$$;

revoke execute on function public.update_agent(uuid,uuid,text,integer,boolean) from public, anon;
grant execute on function public.update_agent(uuid,uuid,text,integer,boolean) to authenticated;

notify pgrst, 'reload schema';