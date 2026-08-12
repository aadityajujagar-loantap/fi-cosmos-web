import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Step } from "../../../types";

interface AgentAddTaskProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

const checklistItems = [
  "Visit customer location",
  "Capture customer photo",
  "Verify address",
  "Capture documents",
  "Customer signature",
];

function Field({
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.02em] text-[#5c6a85]">{label}</span>
      <input
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        className="h-11 w-full rounded-xl border border-[#d8e0eb] bg-white px-3 text-xs font-bold text-[#07183f] outline-none placeholder:text-[#a0aec0] focus:border-[#1158d4]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.02em] text-[#5c6a85]">{label}</span>
      <select
        name={name}
        onChange={onChange}
        value={value}
        className="h-11 w-full rounded-xl border border-[#d8e0eb] bg-white px-3 text-xs font-bold text-[#07183f] outline-none focus:border-[#1158d4]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function AgentAddTask({ onBack, onNavigate }: AgentAddTaskProps) {
  const [form, setForm] = useState({
    title: "Field Investigation",
    type: "KYC Verification",
    priority: "High",
    date: "Today",
    slot: "03:30 PM",
    customer: "Rahul Sharma",
    mobile: "+91 98765 43210",
    address: "102, Sai Residency, Baner Road, Pune",
    distance: "2.4 km",
    branch: "Pune West",
  });
  const [checklist, setChecklist] = useState(() => new Set(checklistItems));
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");

  const completionText = useMemo(() => `${checklist.size}/${checklistItems.length} checklist steps selected`, [checklist]);

  const updateText = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  };

  const toggleChecklist = (item: string) => {
    setChecklist((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const createTask = () => {
    const digits = form.mobile.replace(/\D/g, "");
    if (!form.title.trim() || !form.customer.trim() || !form.address.trim() || digits.length < 10) {
      setError("Fill task title, customer, valid mobile number, and address.");
      return;
    }

    const id = `TASK-${Date.now().toString().slice(-6)}`;
    const payload = {
      ...form,
      id,
      checklist: Array.from(checklist),
      createdAt: new Date().toISOString(),
      status: "Pending",
    };
    const existing = JSON.parse(localStorage.getItem("agent-created-tasks") || "[]");
    localStorage.setItem("agent-created-tasks", JSON.stringify([payload, ...existing].slice(0, 20)));
    setCreatedId(id);
    setError("");
  };

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f]">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
        <header className="relative flex h-12 flex-none items-center justify-center">
          <button onClick={onBack} type="button" aria-label="Back" className="absolute left-0 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M15 5 8 12l7 7M9 12h11" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Add Task</h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {createdId ? (
            <section className="mt-3 rounded-[18px] border border-[#d4f3dd] bg-[#f5fdf7] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#088d27]">Task created</p>
              <h2 className="mt-1 text-xl font-bold leading-tight text-[#07183f]">{createdId} is saved to the local field queue.</h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">This static demo stores created tasks in browser localStorage for the agent session.</p>
            </section>
          ) : (
            <section className="mt-3 rounded-[18px] border border-[#d3e5fe] bg-gradient-to-r from-[#f5f9ff] to-[#edf5ff] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1158d4]">New field assignment</p>
              <h2 className="mt-1 text-xl font-bold leading-tight text-[#07183f]">Create a task with customer, visit and document details.</h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">{completionText}. The task will sync into the field queue.</p>
            </section>
          )}

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#07183f]">Task Details</h2>
            <div className="mt-3 grid gap-3">
              <Field label="Task title" name="title" onChange={updateText} value={form.title} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Type" name="type" onChange={updateText} options={["KYC Verification", "Document Collection", "Legal Verification", "Field Investigation"]} value={form.type} />
                <SelectField label="Priority" name="priority" onChange={updateText} options={["High", "Medium", "Low"]} value={form.priority} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Date" name="date" onChange={updateText} options={["Today", "Tomorrow", "This Week"]} value={form.date} />
                <SelectField label="Slot" name="slot" onChange={updateText} options={["10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"]} value={form.slot} />
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#07183f]">Customer Details</h2>
            <div className="mt-3 grid gap-3">
              <Field label="Customer name" name="customer" onChange={updateText} value={form.customer} />
              <Field label="Mobile number" name="mobile" onChange={updateText} value={form.mobile} />
              <Field label="Address" name="address" onChange={updateText} value={form.address} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Distance" name="distance" onChange={updateText} value={form.distance} />
                <SelectField label="Branch" name="branch" onChange={updateText} options={["Pune West", "Pune Central", "Pune North"]} value={form.branch} />
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#07183f]">Required Checklist</h2>
            <div className="mt-3 grid gap-2">
              {checklistItems.map((item) => (
                <label key={item} className="flex items-center gap-3 rounded-xl bg-[#f7faff] px-3 py-2.5">
                  <input checked={checklist.has(item)} onChange={() => toggleChecklist(item)} type="checkbox" className="h-4 w-4 accent-[#1158d4]" />
                  <span className="text-xs font-bold text-[#07183f]">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {error ? <p className="mt-3 rounded-xl bg-[#fff0ef] px-3 py-2 text-xs font-bold text-[#ee0f1a]">{error}</p> : null}
        </div>

        <div className="flex flex-none gap-3 pt-3">
          <button onClick={createdId ? () => onNavigate?.("my-tasks") : onBack} type="button" className="h-12 flex-1 rounded-xl border border-[#d8e0eb] bg-white text-sm font-bold text-[#07183f]">
            {createdId ? "View Tasks" : "Cancel"}
          </button>
          <button onClick={createdId ? () => onNavigate?.("home") : createTask} type="button" className="h-12 flex-[1.4] rounded-xl bg-[#1158d4] text-sm font-bold text-white shadow-[0_8px_18px_rgba(17,88,212,0.24)]">
            {createdId ? "Done" : "Create Task"}
          </button>
        </div>
      </div>
    </section>
  );
}
