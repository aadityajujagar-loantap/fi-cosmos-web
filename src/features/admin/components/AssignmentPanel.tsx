import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { taskService } from "../../../data/services";
import { formatDistance } from "../../../domain/location";
import type { EligibleAgent } from "../../../domain/selectors";
import type { InvestigationTask } from "../../../domain/types";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { SearchField } from "../ui/SearchField";

interface AssignmentPanelProps {
  onAssigned: (message: string) => void;
  onClose: () => void;
  task: InvestigationTask;
}

const dateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const normalized = (value: string) => value.trim().toLocaleLowerCase();

function assignmentError(caught: unknown) {
  if (caught instanceof Error && caught.message.includes("changed in another session")) return caught.message;
  if (caught instanceof Error && caught.message.includes("already assigned")) return "This case is already assigned to that Field Agent. The latest data has been loaded.";
  if (caught instanceof Error && caught.message.includes("unavailable")) return "That Field Agent is no longer available. Choose another eligible agent.";
  return "The assignment could not be completed. Refresh the candidates and try again.";
}

function ConfirmationDialog({ agent, busy, onCancel, onConfirm, reason, setReason, task }: {
  agent: EligibleAgent;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (value: string) => void;
  task: InvestigationTask;
}) {
  const reassigning = Boolean(task.assignedAgentId);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#07183f]/50 p-5" role="dialog" aria-modal="true" aria-label={`${reassigning ? "Reassign" : "Assign"} case confirmation`}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-[14px] bg-white shadow-2xl">
        <header className="border-b border-[#edf1f7] px-5 py-4">
          <p className="text-xs font-bold uppercase text-[#62728b]">Final confirmation</p>
          <h3 className="mt-1 text-lg font-bold text-[#07183f]">{reassigning ? "Reassign" : "Assign"} {task.referenceNumber}</h3>
        </header>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 p-5 text-sm">
          <div className="col-span-2"><dt className="text-xs font-bold text-[#7b8faa]">Field Agent</dt><dd className="mt-1 font-bold text-[#07183f]">{agent.name} ({agent.employeeCode})</dd></div>
          <div><dt className="text-xs font-bold text-[#7b8faa]">Branch</dt><dd className="mt-1 font-semibold text-[#07183f]">{agent.branchName}</dd></div>
          <div><dt className="text-xs font-bold text-[#7b8faa]">City</dt><dd className="mt-1 font-semibold text-[#07183f]">{agent.city}</dd></div>
          <div><dt className="text-xs font-bold text-[#7b8faa]">Pincode match</dt><dd className="mt-1 font-semibold text-[#07183f]">{agent.pincodes.includes(task.pincode) ? task.pincode : "No exact match"}</dd></div>
          <div><dt className="text-xs font-bold text-[#7b8faa]">Active workload</dt><dd className="mt-1 font-semibold text-[#07183f]">{agent.activeTaskCount} cases</dd></div><div><dt className="text-xs font-bold text-[#7b8faa]">Live distance</dt><dd className="mt-1 font-semibold text-[#07183f]">{formatDistance(agent.distanceKm)}</dd></div>
        </dl>
        {reassigning ? <div className="px-5 pb-5"><label className="text-xs font-bold text-[#62728b]" htmlFor="reassignment-reason">Reassignment reason (optional)</label><textarea id="reassignment-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={250} className="mt-2 h-20 w-full resize-none rounded-xl border border-[#d8e3f5] p-3 text-sm text-[#07183f]" placeholder="Record why ownership is changing" /></div> : null}
        <footer className="flex justify-end gap-3 border-t border-[#edf1f7] bg-[#f8fafd] px-5 py-4">
          <AdminButton disabled={busy} onClick={onCancel}>Cancel</AdminButton>
          <AdminButton disabled={busy} onClick={onConfirm} variant="primary">{busy ? "Assigning..." : reassigning ? "Confirm Reassignment" : "Confirm Assignment"}</AdminButton>
        </footer>
      </div>
    </div>
  );
}

export function AssignmentPanel({ onAssigned, onClose, task }: AssignmentPanelProps) {
  const { state, adminActor } = useAppData();
  const [branchId, setBranchId] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [query, setQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<EligibleAgent | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentAgent = state.agents.find((agent) => agent.id === task.assignedAgentId);

  const branchAgents = state.agents.filter((agent) => agent.active && (!branchId || agent.branchId === branchId));
  const cities = useMemo(() => [...new Set(branchAgents.map((agent) => agent.city).filter(Boolean))].sort(), [branchAgents]);
  const pincodeAgents = branchAgents.filter((agent) => !city || normalized(agent.city) === normalized(city));
  const pincodes = useMemo(() => [...new Set(pincodeAgents.flatMap((agent) => agent.pincodes))].sort(), [pincodeAgents]);
  const candidates = taskService.getEligibleAgents(task.id, { branchId: branchId || undefined, city: city || undefined, pincode: pincode || undefined, query: query || undefined }).filter((agent) => agent.id !== task.assignedAgentId);

  const clearFilters = () => { setBranchId(""); setCity(""); setPincode(""); setQuery(""); };
  const useCaseLocation = () => { setBranchId(task.branchId); setCity(task.city); setPincode(task.pincode); };
  const confirm = async () => {
    if (!selectedAgent || busy) return;
    setBusy(true);
    setError("");
    try {
      await taskService.assign(adminActor, task.id, selectedAgent.id, reason.trim() || undefined);
      onAssigned(`${task.referenceNumber} ${task.assignedAgentId ? "reassigned" : "assigned"} to ${selectedAgent.name}.`);
    } catch (caught) {
      setError(assignmentError(caught));
      setSelectedAgent(null);
      setConfirmationOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#07183f]/35" role="dialog" aria-modal="true" aria-label="Case assignment">
      <button type="button" className="absolute inset-0" aria-label="Close case assignment" onClick={onClose} />
      <aside className="admin-scrollbar relative z-10 h-full w-full max-w-[980px] overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#dfe7f2] bg-white px-6 py-5">
          <div><p className="text-xs font-bold uppercase text-[#62728b]">{task.assignedAgentId ? "Reassign case" : "Assign case"}</p><h2 className="mt-1 text-xl font-bold text-[#07183f]">{task.referenceNumber}</h2><p className="mt-1 text-sm font-semibold text-[#62728b]">{task.customerName} | {task.investigationType}</p></div>
          <button type="button" title="Close" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8e3f5] text-[#4b6384]"><Icon name="close" className="h-4 w-4" /></button>
        </header>

        <div className="border-b border-[#dfe7f2] bg-[#f8fafd] px-6 py-4"><dl className="grid gap-4 text-sm sm:grid-cols-5"><div><dt className="text-xs font-bold text-[#7b8faa]">Branch</dt><dd className="mt-1 font-bold">{task.branchName}</dd></div><div><dt className="text-xs font-bold text-[#7b8faa]">City</dt><dd className="mt-1 font-bold">{task.city}</dd></div><div><dt className="text-xs font-bold text-[#7b8faa]">Pincode</dt><dd className="mt-1 font-bold">{task.pincode}</dd></div><div><dt className="text-xs font-bold text-[#7b8faa]">Priority</dt><dd className="mt-1 font-bold">{task.priority}</dd></div><div><dt className="text-xs font-bold text-[#7b8faa]">Due</dt><dd className="mt-1 font-bold">{dateTime(task.dueAt)}</dd></div></dl></div>

        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-base font-bold text-[#07183f]">Eligible Field Agents</h3><p className="mt-1 text-xs font-semibold text-[#62728b]">Ranked by exact pincode, city, branch, availability, then lower active workload.</p></div><AdminButton size="sm" onClick={useCaseLocation}>Use Case Location</AdminButton></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select aria-label="Filter agents by branch" value={branchId} onChange={(event) => { setBranchId(event.target.value); setCity(""); setPincode(""); }} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold"><option value="">All branches</option>{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
              <select aria-label="Filter agents by city" value={city} onChange={(event) => { setCity(event.target.value); setPincode(""); }} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold"><option value="">All cities</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select aria-label="Filter agents by pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold"><option value="">All pincodes</option>{pincodes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <AdminButton onClick={clearFilters}>Clear Filters</AdminButton>
            </div>
            <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="mt-3 w-full" placeholder="Search agent, code, branch, city, pincode..." />
            {error ? <div className="mt-4 rounded-xl border border-[#ffd9d6] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#c62828]">{error}</div> : null}
            <div className="mt-4 space-y-3">
              {candidates.map((agent, index) => {
                const assignedToday = state.tasks.filter((item) => item.assignmentHistory.some((assignment) => assignment.agentId === agent.id && new Date(assignment.assignedAt).toDateString() === new Date().toDateString())).length;
                const isSelected = selectedAgent?.id === agent.id;
                return <button key={agent.id} type="button" aria-pressed={isSelected} onClick={() => { setSelectedAgent(agent); setConfirmationOpen(false); setReason(""); setError(""); }} className={`grid w-full gap-4 rounded-xl border p-4 text-left transition sm:grid-cols-[minmax(0,1fr)_auto] ${isSelected ? "border-[#1454c8] bg-[#f3f7ff] shadow-[0_0_0_1px_rgba(20,84,200,0.12)]" : "border-[#dfe7f2] hover:border-[#1454c8] hover:bg-[#f8fafd]"}`}>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`grid h-5 w-5 place-items-center rounded-full border ${isSelected ? "border-[#1454c8] bg-[#1454c8] text-white" : "border-[#b8c6da] bg-white"}`}>{isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}</span><p className="font-bold text-[#07183f]">{agent.name}</p><span className="text-xs font-bold text-[#62728b]">{agent.employeeCode}</span>{index === 0 ? <span className="rounded-full bg-[#edf4ff] px-2 py-1 text-[10px] font-bold text-[#1454c8]">Top recommendation</span> : null}</div><p className="mt-1 text-xs font-semibold text-[#4b6384]">{agent.branchName} | {agent.city} | {agent.pincodes.join(", ")}</p><div className="mt-2 flex flex-wrap gap-1.5">{(agent.matchReasons.length ? agent.matchReasons : ["Other eligible agent"]).map((item) => <span key={item} className="rounded-full bg-[#eef7f1] px-2 py-1 text-[10px] font-bold text-[#07883a]">{item}</span>)}</div></div>
                  <div className="grid grid-cols-4 gap-3 text-center sm:min-w-[330px]"><div><p className="text-[10px] font-bold uppercase text-[#7b8faa]">Availability</p><p className="mt-1 text-xs font-bold text-[#07183f]">{agent.availability}</p></div><div><p className="text-[10px] font-bold uppercase text-[#7b8faa]">Active</p><p className="mt-1 text-xs font-bold text-[#07183f]">{agent.activeTaskCount}</p></div><div><p className="text-[10px] font-bold uppercase text-[#7b8faa]">Today</p><p className="mt-1 text-xs font-bold text-[#07183f]">{assignedToday}</p></div><div><p className="text-[10px] font-bold uppercase text-[#7b8faa]">Distance</p><p className="mt-1 text-xs font-bold text-[#07883a]">{formatDistance(agent.distanceKm)}</p></div></div>
                </button>;
              })}
              {!candidates.length ? <EmptyState title="No eligible agents found" subtitle="Change the branch, city, or exact pincode filters and review agent coverage." action="Clear Filters" onAction={clearFilters} /> : null}
            </div>
            {selectedAgent ? <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#bfd1ee] bg-white p-4 shadow-[0_-8px_24px_rgba(7,24,63,0.08)]"><div><p className="text-xs font-bold uppercase text-[#7b8faa]">Selected Field Agent</p><p className="mt-1 font-bold text-[#07183f]">{selectedAgent.name} <span className="text-xs text-[#62728b]">{selectedAgent.employeeCode}</span></p></div><AdminButton onClick={() => setConfirmationOpen(true)} variant="primary">Review Assignment</AdminButton></div> : null}
          </section>

          <aside className="space-y-5 border-t border-[#edf1f7] pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <section><h3 className="text-sm font-bold text-[#07183f]">Current assignment</h3><p className="mt-2 text-sm font-semibold text-[#4b6384]">{currentAgent ? `${currentAgent.name} (${currentAgent.employeeCode})` : "Unassigned"}</p>{task.assignedAt ? <p className="mt-1 text-xs text-[#7b8faa]">Since {dateTime(task.assignedAt)}</p> : null}</section>
            <section><h3 className="text-sm font-bold text-[#07183f]">Assignment history</h3><div className="mt-3 space-y-3">{[...task.assignmentHistory].reverse().map((entry, index) => { const agent = state.agents.find((item) => item.id === entry.agentId); return <div key={`${entry.agentId}-${entry.assignedAt}`} className="border-l-2 border-[#d8e3f5] pl-3"><p className="text-xs font-bold text-[#07183f]">{index === 0 && !entry.endedAt ? "Assigned" : "Previous"}: {agent?.name ?? entry.agentId}</p><p className="mt-1 text-[11px] text-[#62728b]">{dateTime(entry.assignedAt)}</p>{entry.reason ? <p className="mt-1 text-[11px] font-semibold text-[#4b6384]">{entry.reason}</p> : null}</div>; })}{!task.assignmentHistory.length ? <p className="text-xs font-semibold text-[#7b8faa]">No assignment history yet.</p> : null}</div></section>
          </aside>
        </div>
      </aside>
      {selectedAgent && confirmationOpen ? <ConfirmationDialog agent={selectedAgent} busy={busy} onCancel={() => { if (!busy) setConfirmationOpen(false); }} onConfirm={() => { void confirm(); }} reason={reason} setReason={setReason} task={task} /> : null}
    </div>
  );
}
