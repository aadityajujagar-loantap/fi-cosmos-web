import { useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { fieldAgents } from "../data/adminData";
import type { AgentRecord } from "../types/admin";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";
import { SearchField } from "../ui/SearchField";
import { StatusDot } from "../ui/StatusDot";
import { classNames } from "../utils/classNames";

export function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>(fieldAgents);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const editingAgent = agents.find((agent) => agent.code === editingCode) || null;
  const [draft, setDraft] = useState({ active: true, battery: 100, branch: "" });

  const visibleAgents = agents.filter((agent) => `${agent.name} ${agent.code} ${agent.branch} ${agent.region}`.toLowerCase().includes(query.toLowerCase()));
  const selectedAgent = agents.find((agent) => agent.code === selected) || null;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const addAgent = () => {
    const nextAgent: AgentRecord = {
      active: true,
      battery: 100,
      branch: "Pune West",
      cases: 0,
      code: `AGT${String(agents.length + 1).padStart(3, "0")}`,
      current: "-",
      done: 0,
      eta: "-",
      initials: "CR",
      joined: "Today",
      name: "Chirag Ranade",
      pending: 0,
      rating: 4.5,
      region: "West",
      sync: "Just now",
    };

    setAgents((current) => [nextAgent, ...current]);
    showNotice("Agent added to the local demo roster.");
  };

  const viewAgent = (agent: AgentRecord) => {
    setSelected(agent.code);
    setDetailsOpen(true);
  };

  const startEdit = (agent: AgentRecord) => {
    setEditingCode(agent.code);
    setDraft({ active: agent.active, battery: agent.battery, branch: agent.branch });
  };

  const saveEdit = () => {
    if (!editingCode || !draft.branch.trim()) return;
    setAgents((current) =>
      current.map((agent) =>
        agent.code === editingCode
          ? {
              ...agent,
              active: draft.active,
              battery: Math.max(0, Math.min(100, draft.battery)),
              branch: draft.branch.trim(),
              sync: "Just now",
            }
          : agent,
      ),
    );
    setEditingCode(null);
    showNotice("Agent profile updated locally.");
  };

  return (
    <PageFrame
      actions={
        <>
          <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="w-[280px]" placeholder="Search agents..." />
          <AdminButton onClick={addAgent} variant="primary">
            + Add Agent
          </AdminButton>
        </>
      }
      title="Agent Management"
      subtitle="Performance, availability, and branch assignment"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {visibleAgents.map((agent) => (
          <article key={agent.code} className={classNames("rounded-[14px] border bg-white p-5 shadow-[0_1px_2px_rgba(7,24,63,0.04)] transition", selected === agent.code && detailsOpen ? "border-[#1454c8] ring-4 ring-[#1454c8]/10" : "border-[#dfe7f2] hover:border-[#c8d5e8]")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1454c8] text-base font-bold text-white">{agent.initials}</div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[#07183f]">{agent.name}</h3>
                  <p className="text-xs font-semibold text-[#7b8faa]">{agent.code}</p>
                </div>
              </div>
              <StatusDot active={agent.active} label={agent.active ? "Active" : "On Break"} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8da0bc]">Branch</p>
                <p className="font-medium text-[#4b6384]">{agent.branch}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8da0bc]">Region</p>
                <p className="font-medium text-[#4b6384]">{agent.region}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8da0bc]">Joined</p>
                <p className="font-medium text-[#4b6384]">{agent.joined}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8da0bc]">Battery</p>
                <p className="font-medium text-[#4b6384]">{agent.battery}%</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 rounded-xl border border-[#edf1f7] bg-[#f8fafd] py-3 text-center">
              <strong className="text-lg text-[#07183f]">{agent.cases}<span className="block text-xs font-medium text-[#7b8faa]">Cases</span></strong>
              <strong className="text-lg text-[#07183f]">{agent.done}<span className="block text-xs font-medium text-[#7b8faa]">Done</span></strong>
              <strong className="text-lg text-[#07183f]">{agent.pending}<span className="block text-xs font-medium text-[#7b8faa]">Pending</span></strong>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-bold text-[#4b6384]">Rating {agent.rating}</span>
              <div className="flex gap-2">
                <button onClick={() => viewAgent(agent)} type="button" title="View focused agent sidebar" className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ff] text-[#1158d4]">
                  <Icon name="target" className="h-4 w-4" />
                </button>
                <button onClick={() => startEdit(agent)} type="button" title="Edit agent" className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf2f7] text-[#4b6384]">
                  <Icon name="edit" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {detailsOpen && selectedAgent ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#07183f]/25 backdrop-blur-[2px]" role="dialog" aria-label="Focused agent sidebar" aria-modal="true">
          <button onClick={() => setDetailsOpen(false)} type="button" aria-label="Close focused agent sidebar" className="absolute inset-0 h-full w-full cursor-default" />
          <aside className="relative z-10 flex h-full w-full max-w-[430px] flex-col border-l border-[#dfe7f2] bg-white shadow-[0_24px_70px_rgba(7,24,63,0.26)]">
            <header className="flex items-start justify-between gap-4 border-b border-[#edf1f7] bg-[#f8fafd] px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8b9ab0]">Focused Agent</p>
                <h3 className="mt-1 text-lg font-bold text-[#07183f]">{selectedAgent.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#62728b]">{selectedAgent.code} - {selectedAgent.branch}</p>
              </div>
              <button onClick={() => setDetailsOpen(false)} type="button" title="Close" className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8e3f5] bg-white text-[#62728b] hover:bg-[#f7faff]">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </header>
            <div className="admin-scrollbar flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#1454c8] text-xl font-bold text-white">{selectedAgent.initials}</div>
                <div>
                  <StatusDot active={selectedAgent.active} label={selectedAgent.active ? "Active" : "On Break"} />
                  <p className="mt-2 text-sm font-bold text-[#4b6384]">Rating {selectedAgent.rating}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#f8fafd] p-3">
                  <dt className="text-xs font-bold text-[#8b9ab0]">Current</dt>
                  <dd className="mt-1 font-bold text-[#1454c8]">{selectedAgent.current}</dd>
                </div>
                <div className="rounded-xl bg-[#f8fafd] p-3">
                  <dt className="text-xs font-bold text-[#8b9ab0]">ETA</dt>
                  <dd className="mt-1 font-bold text-[#07183f]">{selectedAgent.eta}</dd>
                </div>
                <div className="rounded-xl bg-[#f8fafd] p-3">
                  <dt className="text-xs font-bold text-[#8b9ab0]">Last Sync</dt>
                  <dd className="mt-1 font-bold text-[#07183f]">{selectedAgent.sync}</dd>
                </div>
                <div className="rounded-xl bg-[#f8fafd] p-3">
                  <dt className="text-xs font-bold text-[#8b9ab0]">Battery</dt>
                  <dd className="mt-1 font-bold text-[#07883a]">{selectedAgent.battery}%</dd>
                </div>
              </dl>
              <div className="mt-6 rounded-[14px] border border-[#edf1f7] bg-white p-4">
                <h4 className="text-sm font-bold text-[#07183f]">Workload</h4>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[#f8fafd] p-3">
                    <p className="text-xl font-bold text-[#07183f]">{selectedAgent.cases}</p>
                    <p className="mt-1 text-xs font-semibold text-[#7b8faa]">Cases</p>
                  </div>
                  <div className="rounded-xl bg-[#f8fafd] p-3">
                    <p className="text-xl font-bold text-[#07883a]">{selectedAgent.done}</p>
                    <p className="mt-1 text-xs font-semibold text-[#7b8faa]">Done</p>
                  </div>
                  <div className="rounded-xl bg-[#f8fafd] p-3">
                    <p className="text-xl font-bold text-[#b77900]">{selectedAgent.pending}</p>
                    <p className="mt-1 text-xs font-semibold text-[#7b8faa]">Pending</p>
                  </div>
                </div>
              </div>
            </div>
            <footer className="flex justify-end gap-3 border-t border-[#edf1f7] px-6 py-4">
              <AdminButton onClick={() => setDetailsOpen(false)}>Close</AdminButton>
              <AdminButton onClick={() => startEdit(selectedAgent)} variant="primary">
                Edit Agent
              </AdminButton>
            </footer>
          </aside>
        </div>
      ) : null}
      {editingAgent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#07183f]/30 px-4 backdrop-blur-sm" role="dialog" aria-label="Edit agent">
          <div className="w-full max-w-[460px] rounded-[16px] border border-[#dfe7f2] bg-white shadow-[0_24px_70px_rgba(7,24,63,0.22)]">
            <div className="border-b border-[#edf1f7] px-5 py-4">
              <h3 className="text-base font-bold text-[#07183f]">Edit Agent</h3>
              <p className="mt-1 text-sm font-medium text-[#62728b]">{editingAgent.name} - {editingAgent.code}</p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#62728b]">Branch</span>
                <input value={draft.branch} onChange={(event) => setDraft((current) => ({ ...current, branch: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#d8e3f5] px-3 text-sm font-semibold text-[#07183f]" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#62728b]">Battery</span>
                <input value={draft.battery} onChange={(event) => setDraft((current) => ({ ...current, battery: Number(event.target.value) }))} className="mt-2 h-11 w-full rounded-xl border border-[#d8e3f5] px-3 text-sm font-semibold text-[#07183f]" max="100" min="0" type="number" />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-[#d8e3f5] px-4 py-3">
                <span className="text-sm font-bold text-[#07183f]">Active status</span>
                <input checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} type="checkbox" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#edf1f7] px-5 py-4">
              <AdminButton onClick={() => setEditingCode(null)}>Cancel</AdminButton>
              <AdminButton onClick={saveEdit} variant="primary">Save Changes</AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </PageFrame>
  );
}
