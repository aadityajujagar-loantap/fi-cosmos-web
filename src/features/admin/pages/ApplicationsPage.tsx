import { useEffect, useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { distanceFromLiveLocation, formatDistanceWithContext } from "../../../domain/location";
import { isTaskOverdue } from "../../../domain/selectors";
import { evidenceService, taskService } from "../../../data/services";
import { taskStatusLabel } from "../../../domain/stateMachine";
import type { InvestigationTask, TaskPriority, TaskStatus } from "../../../domain/types";
import { PageFrame } from "../components/PageFrame";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel } from "../ui/Panel";
import { SearchField } from "../ui/SearchField";
import { generateTaskPdf } from "../../agent/utils/pdfGenerator";
import { toAgentTask } from "../../agent/utils/tasks";

const statusTabs: Array<"ALL" | TaskStatus> = ["ALL", "UNASSIGNED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED", "REWORK_REQUIRED", "COMPLETED", "REJECTED"];

function money(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function dateTime(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function statusTone(status: TaskStatus) {
  if (status === "COMPLETED") return "bg-[#ecfaef] text-[#07883a]";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-[#fff0ef] text-[#d92525]";
  if (status === "SUBMITTED") return "bg-[#f2efff] text-[#6b45d8]";
  if (status === "REWORK_REQUIRED") return "bg-[#fff4e5] text-[#b77900]";
  if (status === "UNASSIGNED") return "bg-[#edf2f7] text-[#5c6a85]";
  return "bg-[#edf4ff] text-[#1454c8]";
}

function priorityTone(priority: TaskPriority) {
  if (priority === "HIGH") return "bg-[#fff0ef] text-[#d92525]";
  if (priority === "MEDIUM") return "bg-[#fff7e8] text-[#b77900]";
  return "bg-[#ecfaef] text-[#07883a]";
}

function formatQuestionnaireAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ") || "Not answered";
  if (typeof value === "string") return value.trim() || "Not answered";
  return "Not answered";
}

function formatEvidenceKind(kind: string) {
  if (kind === "photo") return "Customer Photo";
  if (kind === "signature") return "Customer Signature";
  if (kind === "document:address-verification") return "Address Verification Proof";
  if (kind === "document:identity") return "Identity Proof (Doc)";
  if (kind === "document:address") return "Address Proof (Doc)";
  if (kind === "document:income") return "Income Proof (Doc)";
  if (kind === "document:other") return "Other Document";
  return "Document";
}

export function ApplicationsPage() {
  const { state, adminActor } = useAppData();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof statusTabs)[number]>("ALL");
  const [branchId, setBranchId] = useState("ALL");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => window.localStorage.getItem("iflow-admin-open-task"));
  const [assignmentTaskId, setAssignmentTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reworkReason, setReworkReason] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("MEDIUM");
  const [editDueAt, setEditDueAt] = useState("");
  const [editLatitude, setEditLatitude] = useState("");
  const [editLongitude, setEditLongitude] = useState("");
  const [createForm, setCreateForm] = useState(() => ({
    customerName: "", customerPhone: "", loanProductId: state.loanProducts.find((product) => product.active)?.id ?? "", amount: "", investigationType: "Residence Verification",
    address: "", pincode: "411045", territory: "Baner", latitude: "", longitude: "", branchId: state.branches[0]?.id ?? "", priority: "MEDIUM" as TaskPriority,
    dueAt: toDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
  }));

  const selectedTask = state.tasks.find((task) => task.id === selectedTaskId) ?? null;
  const assignmentTask = state.tasks.find((task) => task.id === assignmentTaskId) ?? null;
  const assignedAgent = selectedTask ? state.agents.find((agent) => agent.id === selectedTask.assignedAgentId) : null;
  const activity = selectedTask ? state.activity.filter((event) => event.taskId === selectedTask.id) : [];
  const evidence = selectedTask ? state.evidence.filter((item) => item.taskId === selectedTask.id) : [];
  const eligibleAgents = assignmentTask ? taskService.getEligibleAgents(assignmentTask.id) : [];

  const filteredTasks = useMemo(() => state.tasks.filter((task) => {
    const text = `${task.referenceNumber} ${task.customerName} ${task.customerPhone} ${task.branchName} ${task.investigationType}`.toLowerCase();
    return (tab === "ALL" || task.status === tab)
      && (branchId === "ALL" || task.branchId === branchId)
      && text.includes(query.trim().toLowerCase());
  }).sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)), [branchId, query, state.tasks, tab]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const openDetails = (task: InvestigationTask) => {
    setSelectedTaskId(task.id);
    setEditPriority(task.priority);
    setEditDueAt(toDateTimeLocal(task.dueAt));
    setEditLatitude(task.latitude ? String(task.latitude) : "");
    setEditLongitude(task.longitude ? String(task.longitude) : "");
    setReworkReason(task.reworkReason ?? "");
    setError("");
  };

  useEffect(() => {
    window.localStorage.removeItem("iflow-admin-open-task");
    const openFromNotification = (event: Event) => {
      const taskId = (event as CustomEvent<string>).detail;
      const task = state.tasks.find((item) => item.id === taskId);
      if (task) openDetails(task);
    };
    window.addEventListener("iflow-open-admin-task", openFromNotification);
    return () => window.removeEventListener("iflow-open-admin-task", openFromNotification);
  }, [state.tasks]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setError("");
      showNotice(success);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The action could not be completed.");
      return false;
    }
  };

  const assign = (agentId: string) => {
    if (!assignmentTask) return;
    void run(() => taskService.assign(adminActor, assignmentTask.id, agentId), `${assignmentTask.referenceNumber} assigned successfully.`).then((ok) => { if (ok) setAssignmentTaskId(null); });
  };

  const createCase = () => {
    const branch = state.branches.find((item) => item.id === createForm.branchId);
    const product = state.loanProducts.find((item) => item.id === createForm.loanProductId && item.active);
    if (!branch || !product) { setError("Select an active loan product and branch."); return; }
    const lat = createForm.latitude.trim() ? Number(createForm.latitude) : null;
    const lng = createForm.longitude.trim() ? Number(createForm.longitude) : null;
    void run(() => taskService.create(adminActor, {
      customerName: createForm.customerName,
      customerPhone: createForm.customerPhone,
      loanType: product.name,
      loanProductId: product.id,
      amount: Number(createForm.amount),
      investigationType: createForm.investigationType,
      address: createForm.address,
      city: branch.city,
      state: branch.state,
      pincode: createForm.pincode,
      territory: createForm.territory,
      branchId: branch.id,
      priority: createForm.priority,
      dueAt: createForm.dueAt,
      latitude: lat,
      longitude: lng,
    }), "Case created in the unassigned queue.").then((ok) => { if (ok) setCreateOpen(false); });
  };

  return (
    <PageFrame
      actions={<AdminButton onClick={() => { setCreateForm((form) => ({ ...form, branchId: form.branchId || state.branches[0]?.id || "", loanProductId: form.loanProductId || state.loanProducts.find((product) => product.active)?.id || "" })); setCreateOpen(true); }}>+ New Case</AdminButton>}
      title="Applications"
      subtitle="Create, assign, track, review, and close field investigations"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      {error && !selectedTask ? <div className="mb-4 rounded-xl border border-[#ffd9d6] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#d92525]">{error}</div> : null}
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#edf1f7] p-4">
          <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-[260px] flex-1" placeholder="Search case, customer, branch, investigation..." />
          <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
            <option value="ALL">All Branches</option>
            {state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </div>
        <div className="admin-scrollbar flex gap-2 overflow-x-auto border-b border-[#edf1f7] px-4 py-3">
          {statusTabs.map((status) => {
            const count = status === "ALL" ? state.tasks.length : state.tasks.filter((task) => task.status === status).length;
            return <button key={status} onClick={() => setTab(status)} type="button" className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${tab === status ? "bg-[#1454c8] text-white" : "bg-[#f8fafd] text-[#4b6384]"}`}>{status === "ALL" ? "All" : taskStatusLabel(status)} <span className="ml-1 opacity-75">{count}</span></button>;
          })}
        </div>
        {filteredTasks.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#f8fafd] text-[11px] font-bold uppercase text-[#62728b]"><tr><th className="px-4 py-3">Case</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Branch / Agent</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody>{filteredTasks.map((task) => {
                const agent = state.agents.find((item) => item.id === task.assignedAgentId);
                return <tr key={task.id} className="border-t border-[#edf1f7] hover:bg-[#f8fafd]">
                  <td className="px-4 py-4"><button onClick={() => openDetails(task)} type="button" className="font-bold text-[#1454c8]">{task.referenceNumber}</button><p className="mt-1 text-xs text-[#62728b]">{task.loanType} · {task.investigationType}</p><p className="mt-1 font-bold text-[#07183f]">{money(task.amount)}</p></td>
                  <td className="px-4 py-4"><p className="font-bold text-[#07183f]">{task.customerName}</p><p className="mt-1 text-xs text-[#62728b]">{task.customerPhone}</p><p className="mt-1 max-w-[260px] truncate text-xs text-[#7b8faa]">{task.address}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-[#07183f]">{task.branchName}</p><p className="mt-1 text-xs text-[#62728b]">{task.pincode} · {task.territory}</p><p className="mt-2 font-bold text-[#1454c8]">{agent?.name ?? "Unassigned"}</p>{agent ? <p className="mt-1 text-xs font-bold text-[#07883a]">{formatDistanceWithContext(distanceFromLiveLocation(agent, task), "from case")}</p> : null}</td>
                  <td className="px-4 py-4"><p className={`font-bold ${isTaskOverdue(task) ? "text-[#d92525]" : "text-[#07183f]"}`}>{dateTime(task.dueAt)}</p>{isTaskOverdue(task) ? <p className="mt-1 text-xs font-bold text-[#d92525]">Overdue</p> : null}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${priorityTone(task.priority)}`}>{task.priority}</span><span className={`mt-2 block w-max rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(task.status)}`}>{taskStatusLabel(task.status)}</span></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-2"><AdminButton onClick={() => openDetails(task)} size="sm">Open</AdminButton>{!['COMPLETED','REJECTED','CANCELLED','SUBMITTED'].includes(task.status) ? <AdminButton onClick={() => setAssignmentTaskId(task.id)} size="sm" variant="primary">{task.assignedAgentId ? "Reassign" : "Assign"}</AdminButton> : null}</div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : <div className="p-6"><EmptyState title="No applications match this view" subtitle="Adjust the status, branch, or search filters." action="Clear Filters" onAction={() => { setQuery(""); setBranchId("ALL"); setTab("ALL"); }} /></div>}
      </Panel>

      {assignmentTask ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#07183f]/40 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Assign case"><div className="max-h-[85vh] w-full max-w-[640px] overflow-hidden rounded-[16px] bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#edf1f7] p-5"><div><h2 className="text-lg font-bold text-[#07183f]">{assignmentTask.assignedAgentId ? "Reassign" : "Assign"} {assignmentTask.referenceNumber}</h2><p className="mt-1 text-sm text-[#62728b]">Eligibility ranks branch, pincode, territory, availability, and workload.</p></div><button onClick={() => setAssignmentTaskId(null)} type="button" title="Close" className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8e3f5]"><Icon name="close" className="h-4 w-4" /></button></header><div className="admin-scrollbar max-h-[65vh] space-y-3 overflow-y-auto p-5">{eligibleAgents.map((agent) => <button key={agent.id} onClick={() => assign(agent.id)} type="button" className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7f2] p-4 text-left hover:border-[#1454c8] hover:bg-[#f8fafd]"><div><p className="font-bold text-[#07183f]">{agent.name} <span className="text-xs text-[#62728b]">{agent.employeeCode}</span></p><p className="mt-1 text-xs font-semibold text-[#1454c8]">{agent.matchReasons.join(" · ") || "City match"}</p><p className="mt-1 text-xs text-[#62728b]">{agent.branchName} · {agent.activeTaskCount} active tasks · {formatDistanceWithContext(agent.distanceKm, "from case")}</p></div><span className="rounded-full bg-[#edf4ff] px-3 py-1 text-sm font-bold text-[#1454c8]">Score {agent.matchScore}</span></button>)}</div></div></div> : null}

      {selectedTask ? <div className="fixed inset-0 z-50 flex justify-end bg-[#07183f]/35 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Case details"><button onClick={() => setSelectedTaskId(null)} type="button" aria-label="Close case details" className="absolute inset-0" /><aside className="admin-scrollbar relative z-10 h-full w-full max-w-[620px] overflow-y-auto bg-white shadow-2xl"><header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#edf1f7] bg-white p-6"><div><p className="text-xs font-bold uppercase text-[#62728b]">Investigation Case</p><h2 className="mt-1 text-xl font-bold text-[#07183f]">{selectedTask.referenceNumber}</h2><p className="mt-1 text-sm text-[#62728b]">{selectedTask.customerName} · {selectedTask.investigationType}</p></div><button onClick={() => setSelectedTaskId(null)} type="button" title="Close" className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8e3f5]"><Icon name="close" className="h-4 w-4" /></button></header><div className="space-y-5 p-6">
        {error ? <div className="rounded-xl border border-[#ffd9d6] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#d92525]">{error}</div> : null}
        <div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(selectedTask.status)}`}>{taskStatusLabel(selectedTask.status)}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityTone(selectedTask.priority)}`}>{selectedTask.priority}</span>{isTaskOverdue(selectedTask) ? <span className="rounded-full bg-[#fff0ef] px-3 py-1 text-xs font-bold text-[#d92525]">Overdue</span> : null}</div>
        <section className="grid grid-cols-2 gap-3 rounded-[14px] border border-[#edf1f7] p-4 text-sm"><div><p className="text-xs font-bold text-[#7b8faa]">Assigned Agent</p><p className="mt-1 font-bold text-[#07183f]">{assignedAgent?.name ?? "Unassigned"}</p>{assignedAgent ? <p className="mt-1 text-xs font-bold text-[#07883a]">{formatDistanceWithContext(distanceFromLiveLocation(assignedAgent, selectedTask), "from case")}</p> : null}</div><div><p className="text-xs font-bold text-[#7b8faa]">Branch</p><p className="mt-1 font-bold text-[#07183f]">{selectedTask.branchName}</p></div><div className="col-span-2"><p className="text-xs font-bold text-[#7b8faa]">Visit Address</p><p className="mt-1 font-semibold text-[#07183f]">{selectedTask.address}</p></div></section>
        {!['COMPLETED','REJECTED','CANCELLED'].includes(selectedTask.status) ? <section className="rounded-[14px] border border-[#edf1f7] p-4"><h3 className="font-bold text-[#07183f]">Priority and due date</h3><div className="mt-3 grid grid-cols-2 gap-3"><select value={editPriority} onChange={(event) => setEditPriority(event.target.value as TaskPriority)} className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm font-bold"><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select><input value={editDueAt} onChange={(event) => setEditDueAt(event.target.value)} type="datetime-local" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm font-bold" /></div><AdminButton onClick={() => run(() => taskService.updateDetails(adminActor, selectedTask.id, { priority: editPriority, dueAt: editDueAt }), "Case details updated.")} className="mt-3" variant="primary">Save Changes</AdminButton></section> : null}<section className="rounded-[14px] border border-[#edf1f7] p-4"><h3 className="font-bold text-[#07183f]">Destination coordinates</h3><p className="mt-1 text-xs text-[#62728b]">Required for live agent-to-case distance.</p><div className="mt-3 grid grid-cols-2 gap-3"><input value={editLatitude} onChange={(event) => setEditLatitude(event.target.value)} type="number" step="any" placeholder="Latitude" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm font-bold" /><input value={editLongitude} onChange={(event) => setEditLongitude(event.target.value)} type="number" step="any" placeholder="Longitude" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm font-bold" /></div><AdminButton onClick={() => run(() => taskService.updateLocation(adminActor, selectedTask.id, { latitude: Number(editLatitude), longitude: Number(editLongitude) }), "Destination location updated.")} className="mt-3" variant="primary">Save Location</AdminButton></section>
        {selectedTask.investigationResult ? (
          <section className="rounded-[14px] border border-[#d8e6ff] bg-[#f8fbff] p-4">
            <h3 className="font-bold text-[#07183f]">Submitted Investigation</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {selectedTask.questionnaire.map((question) => (
                <div className="col-span-2" key={question.id}>
                  <dt className="text-xs font-bold text-[#7b8faa]">{question.prompt}</dt>
                  <dd className="mt-1 font-bold text-[#07183f]">{formatQuestionnaireAnswer(selectedTask.investigationResult?.questionnaireAnswers[question.id])}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-xs font-bold text-[#7b8faa]">Remarks</dt>
                <dd className="font-semibold">{selectedTask.investigationResult.remarks || "No optional remarks."}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[#7b8faa]">Evidence</dt>
                <dd className="font-bold">{selectedTask.investigationResult.evidenceIds.length} items</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[#7b8faa]">Submitted</dt>
                <dd className="font-bold">{dateTime(selectedTask.investigationResult.submittedAt)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <AdminButton
                onClick={() => {
                  const agentTask = toAgentTask(selectedTask);
                  generateTaskPdf(agentTask);
                }}
                variant="primary"
                className="w-full justify-center flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 3v12" />
                </svg>
                Download Verification Report
              </AdminButton>
            </div>
          </section>
        ) : null}
        {evidence.length ? (
          <section className="rounded-[14px] border border-[#edf1f7] p-4">
            <h3 className="font-bold text-[#07183f]">Remote Evidence</h3>
            <div className="mt-3 grid gap-2">
              {evidence.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    void evidenceService
                      .signedUrl(item.storagePath)
                      .then((url) => window.open(url, "_blank", "noopener,noreferrer"))
                      .catch((caught: unknown) =>
                        setError(caught instanceof Error ? caught.message : "Evidence could not be opened.")
                      );
                  }}
                  type="button"
                  className="flex items-center justify-between rounded-xl border border-[#d8e3f5] px-3 py-2.5 text-left text-sm font-bold text-[#1454c8]"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="truncate text-xs font-bold text-[#07183f]">{item.fileName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-normal">{formatEvidenceKind(item.kind)}</span>
                  </div>
                  <span className="text-xs text-[#62728b] flex-none">Open</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}        {selectedTask.status === "SUBMITTED" ? <section className="rounded-[14px] border border-[#edf1f7] p-4"><h3 className="font-bold text-[#07183f]">Admin Review</h3><textarea value={reworkReason} onChange={(event) => setReworkReason(event.target.value)} placeholder="Reason required when requesting rework" className="mt-3 h-20 w-full rounded-xl border border-[#d8e3f5] p-3 text-sm" /><div className="mt-3 flex gap-3"><AdminButton onClick={() => run(() => taskService.requestRework(adminActor, selectedTask.id, reworkReason), "Rework sent to the agent.")} className="flex-1">Request Rework</AdminButton><AdminButton onClick={() => run(() => taskService.complete(adminActor, selectedTask.id), "Case approved and completed.")} className="flex-1" variant="primary">Approve & Complete</AdminButton></div></section> : null}
        {!['COMPLETED','REJECTED','CANCELLED','SUBMITTED'].includes(selectedTask.status) ? <AdminButton onClick={() => setAssignmentTaskId(selectedTask.id)} variant="primary">{selectedTask.assignedAgentId ? "Reassign Case" : "Assign Case"}</AdminButton> : null}
        <section><h3 className="font-bold text-[#07183f]">Activity History</h3><div className="mt-3 space-y-3">{activity.map((event) => <div key={event.id} className="border-l-2 border-[#1454c8] pl-3"><p className="text-sm font-bold text-[#07183f]">{event.detail}</p><p className="mt-1 text-xs text-[#7b8faa]">{dateTime(event.timestamp)} · {event.actorRole}</p></div>)}</div></section>
      </div></aside></div> : null}

      {createOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#07183f]/40 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create case"><div className="admin-scrollbar max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-[16px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-[#07183f]">Create Investigation Case</h2><p className="mt-1 text-sm text-[#62728b]">The new case enters the unassigned queue.</p></div><button onClick={() => setCreateOpen(false)} type="button" title="Close"><Icon name="close" className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-2 gap-3">
        <input value={createForm.customerName} onChange={(e) => setCreateForm((f) => ({ ...f, customerName: e.target.value }))} placeholder="Customer name" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <input value={createForm.customerPhone} onChange={(e) => setCreateForm((f) => ({ ...f, customerPhone: e.target.value }))} placeholder="Customer phone" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <select value={createForm.loanProductId} onChange={(e) => setCreateForm((form) => ({ ...form, loanProductId: e.target.value }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm"><option value="">Select loan product</option>{state.loanProducts.filter((product) => product.active).map((product) => <option key={product.id} value={product.id}>{product.name} ({product.questions.length} questions)</option>)}</select>
        <input value={createForm.amount} onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Loan amount" type="number" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <select value={createForm.investigationType} onChange={(e) => setCreateForm((f) => ({ ...f, investigationType: e.target.value }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm"><option>Residence Verification</option><option>Office Verification</option><option>Business Verification</option><option>Stock Verification</option><option>Property Verification</option><option>Collection Visit</option></select>
        <select value={createForm.branchId} onChange={(e) => setCreateForm((f) => ({ ...f, branchId: e.target.value }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm">{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
        <input value={createForm.address} onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))} placeholder="Visit address" className="col-span-2 h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" /><input value={createForm.latitude} onChange={(e) => setCreateForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="Destination latitude" type="number" step="any" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" /><input value={createForm.longitude} onChange={(e) => setCreateForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="Destination longitude" type="number" step="any" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <input value={createForm.pincode} onChange={(e) => setCreateForm((f) => ({ ...f, pincode: e.target.value }))} placeholder="Pincode" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <input value={createForm.territory} onChange={(e) => setCreateForm((f) => ({ ...f, territory: e.target.value }))} placeholder="Territory" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
        <select value={createForm.priority} onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm"><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
        <input value={createForm.dueAt} onChange={(e) => setCreateForm((f) => ({ ...f, dueAt: e.target.value }))} type="datetime-local" className="h-11 rounded-xl border border-[#d8e3f5] px-3 text-sm" />
      </div><div className="mt-5 flex justify-end gap-3"><AdminButton onClick={() => setCreateOpen(false)}>Cancel</AdminButton><AdminButton onClick={createCase} variant="primary">Create Case</AdminButton></div></div></div> : null}
    </PageFrame>
  );
}
