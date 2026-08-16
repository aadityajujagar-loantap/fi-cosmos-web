import { selectAgentWorkload } from "../../../domain/selectors";
import { taskStatusLabel } from "../../../domain/stateMachine";
import type { Agent, AppState, InvestigationTask } from "../../../domain/types";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";

interface AgentDetailPanelProps {
  agent: Agent;
  onClose: () => void;
  onEdit: (agent: Agent) => void;
  state: AppState;
}

const dateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function statusTone(status: InvestigationTask["status"]) {
  if (status === "COMPLETED") return "bg-[#ecfaef] text-[#07883a]";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-[#fff0ef] text-[#d92525]";
  if (status === "SUBMITTED") return "bg-[#f2efff] text-[#6b45d8]";
  if (status === "REWORK_REQUIRED") return "bg-[#fff7e8] text-[#a86800]";
  return "bg-[#edf4ff] text-[#1454c8]";
}

function taskProgress(state: AppState, task: InvestigationTask) {
  if (task.status === "COMPLETED" || task.status === "SUBMITTED") return 100;
  const required = task.checklist.filter((item) => item.required);
  if (!required.length) return task.status === "IN_PROGRESS" ? 50 : 0;
  const completed = new Set(state.drafts.find((draft) => draft.taskId === task.id)?.completedChecklistIds ?? []);
  return Math.round((required.filter((item) => completed.has(item.id)).length / required.length) * 100);
}

export function AgentDetailPanel({ agent, onClose, onEdit, state }: AgentDetailPanelProps) {
  const workload = selectAgentWorkload(state, agent.id);
  const tasks = state.tasks
    .filter((task) => task.assignedAgentId === agent.id)
    .sort((first, second) => Date.parse(first.dueAt) - Date.parse(second.dueAt));
  const historicalAssignments = state.tasks.reduce((count, task) => count + task.assignmentHistory.filter((assignment) => assignment.agentId === agent.id).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#07183f]/30" role="dialog" aria-modal="true" aria-label="Field Agent details">
      <button onClick={onClose} type="button" className="absolute inset-0" aria-label="Close Field Agent details" />
      <aside className="admin-scrollbar relative z-10 h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#dfe7f2] bg-white p-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#8da0bc]">Field Agent</p>
            <h2 className="mt-1 text-xl font-bold text-[#07183f]">{agent.name}</h2>
            <p className="mt-1 text-sm font-semibold text-[#62728b]">{agent.employeeCode} | {agent.branchName}</p>
          </div>
          <button onClick={onClose} type="button" title="Close" className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8e3f5] text-[#4b6384]"><Icon name="close" className="h-4 w-4" /></button>
        </header>

        <div className="space-y-6 p-6">
          <section className="grid grid-cols-4 overflow-hidden rounded-xl border border-[#dfe7f2] text-center">
            <div className="border-r border-[#edf1f7] p-3"><strong className="text-lg text-[#07183f]">{workload.total}</strong><span className="block text-[10px] font-bold uppercase text-[#7b8faa]">Current</span></div>
            <div className="border-r border-[#edf1f7] p-3"><strong className="text-lg text-[#a86800]">{workload.active}</strong><span className="block text-[10px] font-bold uppercase text-[#7b8faa]">Active</span></div>
            <div className="border-r border-[#edf1f7] p-3"><strong className="text-lg text-[#6b45d8]">{workload.submitted}</strong><span className="block text-[10px] font-bold uppercase text-[#7b8faa]">Review</span></div>
            <div className="p-3"><strong className="text-lg text-[#07883a]">{workload.completed}</strong><span className="block text-[10px] font-bold uppercase text-[#7b8faa]">Done</span></div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-3"><h3 className="text-sm font-bold text-[#07183f]">Assigned applications</h3><span className="text-xs font-semibold text-[#62728b]">{historicalAssignments} total assignments</span></div>
            <div className="mt-3 space-y-3">
              {tasks.map((task) => {
                const progress = taskProgress(state, task);
                return <article key={task.id} className="rounded-xl border border-[#dfe7f2] p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold text-[#1454c8]">{task.referenceNumber}</p><p className="mt-1 truncate text-sm font-semibold text-[#07183f]">{task.customerName}</p><p className="mt-1 text-xs text-[#62728b]">{task.investigationType} | Due {dateTime(task.dueAt)}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone(task.status)}`}>{taskStatusLabel(task.status)}</span></div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold"><span className="text-[#62728b]">Investigation progress</span><span className="text-[#07183f]">{progress}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf1f7]"><div className="h-full rounded-full bg-[#1454c8] transition-[width]" style={{ width: `${progress}%` }} /></div>
                </article>;
              })}
              {!tasks.length ? <div className="rounded-xl border border-dashed border-[#c8d5e8] bg-[#f8fafd] px-4 py-8 text-center text-sm font-semibold text-[#62728b]">No applications are currently assigned.</div> : null}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-xl border border-[#edf1f7] p-4 text-sm">
            <div><p className="text-xs font-bold text-[#8da0bc]">Contact</p><p className="mt-1 font-bold text-[#07183f]">{agent.phone}<br />{agent.email}</p></div>
            <div><p className="text-xs font-bold text-[#8da0bc]">Availability</p><p className="mt-1 font-bold text-[#07183f]">{agent.availability}</p></div>
            <div className="col-span-2"><p className="text-xs font-bold text-[#8da0bc]">Pincode coverage</p><p className="mt-1 font-bold text-[#07183f]">{agent.pincodes.join(", ") || "Not configured"}</p></div>
          </section>
          <AdminButton onClick={() => onEdit(agent)} variant="primary">Edit Field Agent</AdminButton>
        </div>
      </aside>
    </div>
  );
}