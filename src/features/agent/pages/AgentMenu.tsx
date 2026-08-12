import type { ReactNode } from "react";
import type { Step } from "../../../types";
import { AgentProfileCard } from "../components/AgentProfileCard";

interface AgentMenuProps {
  onBack: () => void;
  onLogout?: () => void;
  onNavigate?: (step: Step) => void;
}

interface MenuItemProps {
  accent?: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  subtitle: string;
}

function MenuItem({ accent = "text-[#1158d4] bg-[#edf5ff]", icon, label, onClick, subtitle }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex w-full items-center justify-between gap-3 border-b border-[#edf1f5] bg-white px-4 py-3.5 text-left last:border-b-0 hover:bg-slate-50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${accent}`}>{icon}</span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold leading-none text-[#07183f]">{label}</span>
          <span className="mt-1 block truncate text-[10px] font-medium leading-none text-[#7c879b]">{subtitle}</span>
        </span>
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-slate-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  );
}

function Icon({ type }: { type: "home" | "tasks" | "plus" | "bell" | "map" | "briefcase" | "offline" | "help" | "info" }) {
  const common = "h-5 w-5";

  if (type === "tasks") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <rect x="7" y="4" width="10" height="17" rx="2" />
        <path d="M9 4a3 3 0 0 1 6 0M10 10h4M10 14h4" />
      </svg>
    );
  }

  if (type === "plus") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15M15 6v15" />
      </svg>
    );
  }

  if (type === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
      </svg>
    );
  }

  if (type === "offline") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
    );
  }

  if (type === "help") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.2 9a3 3 0 1 1 4.9 2.3c-1.2.9-2.1 1.5-2.1 3M12 18h.01" />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
      <path d="M4 11.4 12 4l8 7.4V21h-6v-5.5h-4V21H4z" />
    </svg>
  );
}

export function AgentMenu({ onBack, onLogout, onNavigate }: AgentMenuProps) {
  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f] animate-slide-in-left">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
        <header className="relative flex h-12 flex-none items-center justify-center">
          <button onClick={onBack} type="button" aria-label="Close menu" className="absolute left-0 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Menu</h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AgentProfileCard showArrow onClick={() => onNavigate?.("profile")} />

          <section className="mt-4 grid grid-cols-3 gap-2.5">
            <button onClick={() => onNavigate?.("home")} type="button" className="rounded-2xl border border-[#d8e6ff] bg-[#f4f8ff] px-2 py-3 text-[#1158d4]">
              <strong className="block text-xl leading-none">5</strong>
              <span className="mt-1 block text-[10px] font-bold leading-tight">Today</span>
            </button>
            <button onClick={() => onNavigate?.("my-tasks")} type="button" className="rounded-2xl border border-[#d4f3dd] bg-[#f5fdf7] px-2 py-3 text-[#088d27]">
              <strong className="block text-xl leading-none">10</strong>
              <span className="mt-1 block text-[10px] font-bold leading-tight">Completed</span>
            </button>
            <button onClick={() => onNavigate?.("history")} type="button" className="rounded-2xl border border-[#fdecd5] bg-[#fffbf5] px-2 py-3 text-[#e58000]">
              <strong className="block text-xl leading-none">18</strong>
              <span className="mt-1 block text-[10px] font-bold leading-tight">All Logs</span>
            </button>
          </section>

          <section className="mt-4 overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white shadow-sm">
            <MenuItem onClick={() => onNavigate?.("home")} label="Dashboard" subtitle="Return to agent home" icon={<Icon type="home" />} />
            <MenuItem onClick={() => onNavigate?.("my-tasks")} label="My Tasks" subtitle="Assigned, pending and completed work" icon={<Icon type="tasks" />} />
            <MenuItem onClick={() => onNavigate?.("add-task")} label="Add Task" subtitle="Create a new field visit request" icon={<Icon type="plus" />} accent="bg-[#eaf8ef] text-[#088d27]" />
            <MenuItem onClick={() => onNavigate?.("notifications")} label="Notifications" subtitle="Alerts and reminder settings" icon={<Icon type="bell" />} />
            <MenuItem onClick={() => onNavigate?.("location-map")} label="Location Map" subtitle="Track routes and nearby tasks" icon={<Icon type="map" />} />
            <MenuItem onClick={() => onNavigate?.("work-settings")} label="Work Settings" subtitle="Availability, routes and preferences" icon={<Icon type="briefcase" />} />
            <MenuItem onClick={() => onNavigate?.("offline-data")} label="Offline Data" subtitle="Downloaded tasks and sync status" icon={<Icon type="offline" />} />
            <MenuItem onClick={() => onNavigate?.("help-support")} label="Help & Support" subtitle="FAQs, tickets and emergency support" icon={<Icon type="help" />} accent="bg-[#fff8eb] text-[#e58000]" />
            <MenuItem onClick={() => onNavigate?.("about")} label="About FieldOps" subtitle="App version, policies and diagnostics" icon={<Icon type="info" />} />
          </section>

          <button
            onClick={onLogout}
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ffd5d4] bg-white text-xs font-bold text-red-500 hover:bg-[#fff5f5]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
