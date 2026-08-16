import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { selectAgentWorkload } from "../../../domain/selectors";
import { agentService } from "../../../data/services";
import type { Agent, AgentAvailability } from "../../../domain/types";
import { PageFrame } from "../components/PageFrame";
import { AgentDetailPanel } from "../components/AgentDetailPanel";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";
import { SearchField } from "../ui/SearchField";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AgentsPage() {
  const { state, adminActor } = useAppData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savingAgent, setSavingAgent] = useState(false);
  const selected = state.agents.find((agent) => agent.id === selectedId) ?? null;
  const editing = state.agents.find((agent) => agent.id === editingId) ?? null;
  const [draft, setDraft] = useState({ branchId: "", availability: "AVAILABLE" as AgentAvailability, battery: 100, active: true });
  const [newAgent, setNewAgent] = useState({ name: "", phone: "", email: "", branchId: state.branches[0]?.id ?? "" });
  const visibleAgents = useMemo(() => state.agents.filter((agent) => `${agent.name} ${agent.employeeCode} ${agent.email} ${agent.phone} ${agent.branchName} ${agent.city} ${agent.pincodes.join(" ")} ${agent.territories.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [query, state.agents]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const startEdit = (agent: Agent) => {
    setEditingId(agent.id);
    setDraft({ branchId: agent.branchId, availability: agent.availability, battery: agent.battery, active: agent.active });
    setError("");
  };

  const save = async () => {
    if (!editing) return;
    try {
      await agentService.update(adminActor, editing.id, draft);
      setEditingId(null);
      setError("");
      showNotice(`${editing.name} updated.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Agent could not be updated.");
    }
  };

  const add = async () => {
    if (savingAgent) return;
    const input = { name: newAgent.name.trim(), phone: newAgent.phone.trim(), email: newAgent.email.trim().toLowerCase(), branchId: newAgent.branchId };
    const phoneDigits = input.phone.replace(/\D/g, "");
    if (!input.name || !input.email.includes("@") || phoneDigits.length < 10 || !input.branchId) {
      setError("Enter a valid name, email, phone number, and branch.");
      return;
    }
    if (state.agents.some((agent) => agent.email.toLowerCase() === input.email || agent.phone.replace(/\D/g, "") === phoneDigits)) {
      setError("A Field Agent with this email or phone number already exists.");
      return;
    }

    setSavingAgent(true);
    try {
      const created = await agentService.create(adminActor, input);
      setAddOpen(false);
      setNewAgent({ name: "", phone: "", email: "", branchId: state.branches[0]?.id ?? "" });
      setError("");
      showNotice(`${created.name} added and synchronized.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message || "Field Agent could not be synchronized.");
    } finally {
      setSavingAgent(false);
    }
  };

  return <PageFrame actions={<><SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="w-[280px]" placeholder="Search agents..." /><AdminButton onClick={() => { setNewAgent((value) => ({ ...value, branchId: value.branchId || state.branches[0]?.id || "" })); setAddOpen(true); setError(""); }} variant="primary">+ Add Agent</AdminButton></>} title="Agent Management" subtitle="Availability, coverage, and workload derived from the shared case ledger">
    {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">{visibleAgents.map((agent) => {
      const workload = selectAgentWorkload(state, agent.id);
      return <article key={agent.id} className="rounded-[14px] border border-[#dfe7f2] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1454c8] font-bold text-white">{initials(agent.name)}</div><div className="min-w-0"><h3 className="truncate font-bold text-[#07183f]">{agent.name}</h3><p className="text-xs font-semibold text-[#7b8faa]">{agent.employeeCode}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${agent.availability === "AVAILABLE" ? "bg-[#ecfaef] text-[#07883a]" : agent.availability === "BUSY" ? "bg-[#fff7e8] text-[#b77900]" : "bg-[#edf2f7] text-[#62728b]"}`}>{agent.availability}</span></div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs font-bold text-[#8da0bc]">Branch</dt><dd className="font-semibold text-[#4b6384]">{agent.branchName}</dd></div><div><dt className="text-xs font-bold text-[#8da0bc]">Coverage</dt><dd className="truncate font-semibold text-[#4b6384]">{agent.territories.join(", ")}</dd></div></dl>
        <div className="mt-5 grid grid-cols-3 rounded-xl bg-[#f8fafd] py-3 text-center"><strong className="text-lg text-[#07183f]">{workload.total}<span className="block text-xs font-medium text-[#7b8faa]">Cases</span></strong><strong className="text-lg text-[#b77900]">{workload.active}<span className="block text-xs font-medium text-[#7b8faa]">Active</span></strong><strong className="text-lg text-[#07883a]">{workload.completed}<span className="block text-xs font-medium text-[#7b8faa]">Done</span></strong></div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelectedId(agent.id)} type="button" title="View agent" className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ff] text-[#1454c8]"><Icon name="target" className="h-4 w-4" /></button><button onClick={() => startEdit(agent)} type="button" title="Edit agent" className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf2f7] text-[#4b6384]"><Icon name="edit" className="h-4 w-4" /></button></div>
      </article>;
    })}</div>

    {selected ? <AgentDetailPanel agent={selected} state={state} onClose={() => setSelectedId(null)} onEdit={(agent) => { setSelectedId(null); startEdit(agent); }} /> : null}

    {editing ? <div className="fixed inset-0 z-[60] grid place-items-center bg-[#07183f]/40 p-5" role="dialog" aria-modal="true" aria-label="Edit agent"><div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-2xl"><h2 className="text-lg font-bold text-[#07183f]">Edit {editing.name}</h2>{error ? <p className="mt-3 rounded-xl bg-[#fff5f5] p-3 text-sm font-bold text-[#d92525]">{error}</p> : null}<div className="mt-4 grid gap-3"><select value={draft.branchId} onChange={(e) => setDraft((value) => ({ ...value, branchId: e.target.value }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3">{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><select value={draft.availability} onChange={(e) => setDraft((value) => ({ ...value, availability: e.target.value as AgentAvailability }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3"><option>AVAILABLE</option><option>BUSY</option><option>OFFLINE</option></select><input value={draft.battery} onChange={(e) => setDraft((value) => ({ ...value, battery: Number(e.target.value) }))} type="number" min="0" max="100" className="h-11 rounded-xl border border-[#d8e3f5] px-3" /><label className="flex items-center justify-between rounded-xl border border-[#d8e3f5] p-3 text-sm font-bold">Active account<input checked={draft.active} onChange={(e) => setDraft((value) => ({ ...value, active: e.target.checked }))} type="checkbox" /></label></div><div className="mt-5 flex justify-end gap-3"><AdminButton onClick={() => setEditingId(null)}>Cancel</AdminButton><AdminButton onClick={save} variant="primary">Save</AdminButton></div></div></div> : null}

    {addOpen ? <div className="fixed inset-0 z-[60] grid place-items-center bg-[#07183f]/40 p-5" role="dialog" aria-modal="true" aria-label="Add agent"><div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-2xl"><h2 className="text-lg font-bold text-[#07183f]">Add Field Agent</h2>{error ? <p className="mt-3 rounded-xl bg-[#fff5f5] p-3 text-sm font-bold text-[#d92525]">{error}</p> : null}<div className="mt-4 grid gap-3"><input value={newAgent.name} onChange={(e) => setNewAgent((value) => ({ ...value, name: e.target.value }))} placeholder="Full name" className="h-11 rounded-xl border border-[#d8e3f5] px-3" /><input value={newAgent.phone} onChange={(e) => setNewAgent((value) => ({ ...value, phone: e.target.value }))} placeholder="Phone" className="h-11 rounded-xl border border-[#d8e3f5] px-3" /><input value={newAgent.email} onChange={(e) => setNewAgent((value) => ({ ...value, email: e.target.value }))} placeholder="Email" className="h-11 rounded-xl border border-[#d8e3f5] px-3" /><select value={newAgent.branchId} onChange={(e) => setNewAgent((value) => ({ ...value, branchId: e.target.value }))} className="h-11 rounded-xl border border-[#d8e3f5] px-3">{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div><div className="mt-5 flex justify-end gap-3"><AdminButton onClick={() => setAddOpen(false)}>Cancel</AdminButton><AdminButton disabled={savingAgent} onClick={add} variant="primary">{savingAgent ? "Synchronizing..." : "Add Agent"}</AdminButton></div></div></div> : null}
  </PageFrame>;
}
