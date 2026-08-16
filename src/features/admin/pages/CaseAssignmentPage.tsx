import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { distanceFromLiveLocation, formatDistanceWithContext } from "../../../domain/location";
import { isTaskOverdue } from "../../../domain/selectors";
import { taskStatusLabel } from "../../../domain/stateMachine";
import type { InvestigationTask, TaskPriority } from "../../../domain/types";
import { AssignmentPanel } from "../components/AssignmentPanel";
import { PageFrame } from "../components/PageFrame";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Panel } from "../ui/Panel";
import { SearchField } from "../ui/SearchField";

const assignableStatuses = new Set<InvestigationTask["status"]>(["UNASSIGNED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "REWORK_REQUIRED"]);
const priorityOrder: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
type AssignmentFilter = "ALL" | "UNASSIGNED" | "ASSIGNED";
type SortMode = "DUE" | "PRIORITY" | "CREATED" | "STATUS";
type DueFilter = "ALL" | "OVERDUE" | "TODAY";

const dateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function dueState(task: InvestigationTask) {
  if (isTaskOverdue(task)) return { label: "Overdue", className: "bg-[#fff0ef] text-[#d92525]" };
  const due = new Date(task.dueAt);
  const today = new Date();
  if (due.toDateString() === today.toDateString()) return { label: "Due today", className: "bg-[#fff7e8] text-[#a86800]" };
  return null;
}

function AssignmentMetric({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "green" | "red" | "amber" }) {
  const tones = { blue: "bg-[#edf4ff] text-[#1454c8]", green: "bg-[#ecfaef] text-[#07883a]", red: "bg-[#fff0ef] text-[#d92525]", amber: "bg-[#fff7e8] text-[#a86800]" };
  return <div className="border-r border-[#edf1f7] px-5 py-4 last:border-r-0"><p className="text-xs font-bold text-[#62728b]">{label}</p><span className={`mt-2 inline-flex min-w-10 justify-center rounded-lg px-2.5 py-1 text-lg font-bold ${tones[tone]}`}>{value}</span></div>;
}

export function CaseAssignmentPage() {
  const { state } = useAppData();
  const [query, setQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("ALL");
  const [branchId, setBranchId] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [taskStatus, setTaskStatus] = useState<"" | InvestigationTask["status"]>("");
  const [dueFilter, setDueFilter] = useState<DueFilter>("ALL");
  const [priority, setPriority] = useState<"" | TaskPriority>("");
  const [sortMode, setSortMode] = useState<SortMode>("DUE");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const assignableTasks = useMemo(() => state.tasks.filter((task) => assignableStatuses.has(task.status)), [state.tasks]);
  const selectedTask = state.tasks.find((task) => task.id === selectedTaskId && assignableStatuses.has(task.status)) ?? null;
  const taskCities = useMemo(() => [...new Set(assignableTasks.filter((task) => !branchId || task.branchId === branchId).map((task) => task.city).filter(Boolean))].sort(), [assignableTasks, branchId]);
  const taskPincodes = useMemo(() => [...new Set(assignableTasks.filter((task) => (!branchId || task.branchId === branchId) && (!city || task.city.toLocaleLowerCase() === city.toLocaleLowerCase())).map((task) => task.pincode).filter(Boolean))].sort(), [assignableTasks, branchId, city]);
  const filteredTasks = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const tasks = assignableTasks.filter((task) => {
      const text = `${task.referenceNumber} ${task.customerName} ${task.customerPhone} ${task.branchName} ${task.city} ${task.pincode} ${task.investigationType}`.toLocaleLowerCase();
      const assignmentMatches = assignmentFilter === "ALL" || (assignmentFilter === "UNASSIGNED" ? !task.assignedAgentId : Boolean(task.assignedAgentId));
      const dueMatches = dueFilter === "ALL" || (dueFilter === "OVERDUE" ? isTaskOverdue(task) : new Date(task.dueAt).toDateString() === new Date().toDateString());
      return assignmentMatches && (!branchId || task.branchId === branchId) && (!city || task.city.toLocaleLowerCase() === city.toLocaleLowerCase()) && (!pincode || task.pincode === pincode) && (!taskStatus || task.status === taskStatus) && (!priority || task.priority === priority) && dueMatches && (!search || text.includes(search));
    });
    return tasks.sort((first, second) => {
      if (sortMode === "PRIORITY") return priorityOrder[first.priority] - priorityOrder[second.priority] || Date.parse(first.dueAt) - Date.parse(second.dueAt);
      if (sortMode === "CREATED") return Date.parse(second.createdAt) - Date.parse(first.createdAt);
      if (sortMode === "STATUS") return first.status.localeCompare(second.status) || Date.parse(first.dueAt) - Date.parse(second.dueAt);
      return Date.parse(first.dueAt) - Date.parse(second.dueAt);
    });
  }, [assignableTasks, assignmentFilter, branchId, city, dueFilter, pincode, priority, query, sortMode, taskStatus]);

  const assignedCount = assignableTasks.filter((task) => task.assignedAgentId).length;
  const activeAgents = state.agents.filter((agent) => agent.active && agent.availability !== "OFFLINE").length;
  const clearFilters = () => { setQuery(""); setAssignmentFilter("ALL"); setBranchId(""); setCity(""); setPincode(""); setTaskStatus(""); setPriority(""); setDueFilter("ALL"); setSortMode("DUE"); };
  const showNotice = (message: string) => {
    setNotice(message);
    setSelectedTaskId(null);
    window.setTimeout(() => setNotice(""), 3200);
  };

  return (
    <PageFrame title="Case Assignment" subtitle="Allocate field investigation applications using branch, city, pincode, availability, and live workload.">
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]" role="status">{notice}</div> : null}
      <Panel className="mb-5 overflow-hidden"><div className="grid grid-cols-2 lg:grid-cols-4"><AssignmentMetric label="Unassigned" value={assignableTasks.length - assignedCount} tone="amber" /><AssignmentMetric label="Assigned / Active" value={assignedCount} /><AssignmentMetric label="Overdue" value={assignableTasks.filter((task) => isTaskOverdue(task)).length} tone="red" /><AssignmentMetric label="Eligible Field Agents" value={activeAgents} tone="green" /></div></Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-[#edf1f7] p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(150px,auto))]">
            <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search case, customer, city, pincode..." />
            <select aria-label="Assignment status" value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value as AssignmentFilter)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="ALL">All assignments</option><option value="UNASSIGNED">Unassigned</option><option value="ASSIGNED">Assigned</option></select>
            <select aria-label="Task status" value={taskStatus} onChange={(event) => setTaskStatus(event.target.value as "" | InvestigationTask["status"])} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="">All task statuses</option><option value="UNASSIGNED">Unassigned</option><option value="ASSIGNED">Assigned</option><option value="ACCEPTED">Accepted</option><option value="IN_PROGRESS">In progress</option><option value="REWORK_REQUIRED">Rework required</option></select>
            <select aria-label="Case priority" value={priority} onChange={(event) => setPriority(event.target.value as "" | TaskPriority)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
            <select aria-label="Due date" value={dueFilter} onChange={(event) => setDueFilter(event.target.value as DueFilter)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="ALL">Any due date</option><option value="OVERDUE">Overdue</option><option value="TODAY">Due today</option></select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(170px,1fr))_minmax(150px,auto)_auto]">
            <select aria-label="Case branch" value={branchId} onChange={(event) => { setBranchId(event.target.value); setCity(""); setPincode(""); }} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="">All branches</option>{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
            <select aria-label="Case city" value={city} onChange={(event) => { setCity(event.target.value); setPincode(""); }} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="">All cities</option>{taskCities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select aria-label="Case pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="">All pincodes</option>{taskPincodes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select aria-label="Sort cases" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]"><option value="DUE">Sort: due date</option><option value="PRIORITY">Sort: priority</option><option value="CREATED">Sort: created date</option><option value="STATUS">Sort: status</option></select>
            <AdminButton onClick={clearFilters}>Clear Filters</AdminButton>
          </div>
        </div>

        {filteredTasks.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#f8fafd] text-[11px] font-bold uppercase text-[#62728b]"><tr><th className="px-4 py-3">Case</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Priority / SLA</th><th className="px-4 py-3">Current Field Agent</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{filteredTasks.map((task) => {
          const agent = state.agents.find((item) => item.id === task.assignedAgentId);
          const due = dueState(task);
          return <tr key={task.id} className="border-t border-[#edf1f7] hover:bg-[#f8fafd]"><td className="px-4 py-4"><button type="button" onClick={() => setSelectedTaskId(task.id)} className="font-bold text-[#1454c8]">{task.referenceNumber}</button><p className="mt-1 text-xs font-semibold text-[#62728b]">{task.investigationType}</p><span className="mt-2 inline-flex rounded-full bg-[#edf4ff] px-2 py-1 text-[10px] font-bold text-[#1454c8]">{taskStatusLabel(task.status)}</span></td><td className="px-4 py-4"><p className="font-bold text-[#07183f]">{task.customerName}</p><p className="mt-1 text-xs text-[#62728b]">{task.loanType}</p></td><td className="px-4 py-4"><p className="font-bold text-[#07183f]">{task.branchName}</p><p className="mt-1 text-xs text-[#62728b]">{task.city} | {task.pincode}</p><p className="mt-1 max-w-[220px] truncate text-xs text-[#7b8faa]">{task.address}</p></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${task.priority === "HIGH" ? "bg-[#fff0ef] text-[#d92525]" : task.priority === "MEDIUM" ? "bg-[#fff7e8] text-[#a86800]" : "bg-[#ecfaef] text-[#07883a]"}`}>{task.priority}</span><p className="mt-2 text-xs font-bold text-[#07183f]">{dateTime(task.dueAt)}</p>{due ? <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${due.className}`}>{due.label}</span> : null}</td><td className="px-4 py-4"><p className="font-bold text-[#07183f]">{agent?.name ?? "Unassigned"}</p>{agent ? <p className="mt-1 text-xs text-[#62728b]">{agent.employeeCode} | {agent.availability}</p> : <p className="mt-1 text-xs font-bold text-[#a86800]">Awaiting allocation</p>}{agent ? <p className="mt-1 text-xs font-bold text-[#07883a]">{formatDistanceWithContext(distanceFromLiveLocation(agent, task), "from case")}</p> : null}</td><td className="px-4 py-4 text-right"><AdminButton size="sm" variant="primary" onClick={() => setSelectedTaskId(task.id)}>{task.assignedAgentId ? "Reassign" : "Assign"}</AdminButton></td></tr>;
        })}</tbody></table></div> : <div className="p-8"><EmptyState title={assignableTasks.length ? "No cases match these filters" : "No cases pending assignment"} subtitle={assignableTasks.length ? "Adjust the search, assignment, branch, or priority filters." : "New assignable applications will appear here automatically."} action={assignableTasks.length ? "Clear Filters" : undefined} onAction={assignableTasks.length ? clearFilters : undefined} /></div>}
      </Panel>
      {selectedTask ? <AssignmentPanel task={selectedTask} onClose={() => setSelectedTaskId(null)} onAssigned={showNotice} /> : null}
    </PageFrame>
  );
}