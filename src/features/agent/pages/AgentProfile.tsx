import type { Step, Tone, SummaryCard } from "../../../types";
import { AgentProfileCard } from "../components/AgentProfileCard";

const summaries: SummaryCard[] = [
  { label: "Total Tasks", count: 18, icon: "clipboard", tone: "blue" },
  { label: "In Progress", count: 5, icon: "hourglass", tone: "orange" },
  { label: "Completed", count: 10, icon: "check", tone: "green" },
  { label: "Pending", count: 3, icon: "alert", tone: "red" },
];

const toneStyles: Record<Tone, { accent: string; card: string; iconBg: string }> = {
  blue: {
    accent: "text-[#1158d4]",
    card: "border-[#d8e6ff] bg-[#f4f8ff]",
    iconBg: "bg-[#edf5ff]",
  },
  orange: {
    accent: "text-[#e58000]",
    card: "border-[#fdecd5] bg-[#fffbf5]",
    iconBg: "bg-[#fff8eb]",
  },
  green: {
    accent: "text-[#088d27]",
    card: "border-[#d4f3dd] bg-[#f5fdf7]",
    iconBg: "bg-[#ecfaef]",
  },
  red: {
    accent: "text-[#ee0f1a]",
    card: "border-[#fddbd9] bg-[#fff5f5]",
    iconBg: "bg-[#fff0ef]",
  },
  purple: {
    accent: "text-[#7224e9]",
    card: "border-[#e5d8ff] bg-[#fbf8ff]",
    iconBg: "bg-[#f8f5ff]",
  },
  cyan: {
    accent: "text-[#0aa6b4]",
    card: "border-[#cceff1] bg-[#f5feff]",
    iconBg: "bg-[#ebfbfc]",
  },
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SummaryIcon({ icon }: { icon: SummaryCard["icon"] }) {
  if (icon === "hourglass") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M6 3h12M6 21h12M8 3c0 4 2.2 6.2 4 9-1.8 2.8-4 5-4 9M16 3c0 4-2.2 6.2-4 9 1.8 2.8 4 5 4 9" />
      </svg>
    );
  }

  if (icon === "check") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.2 2.7 2.7L16.5 9" />
      </svg>
    );
  }

  if (icon === "alert") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5a3 3 0 0 1 6 0M9 10h6M9 14h6M9 18h4" />
    </svg>
  );
}

function NavIcon({ type }: { type: "home" | "tasks" | "history" | "profile" }) {
  if (type === "tasks") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <rect x="7" y="4" width="10" height="17" rx="2" />
        <path d="M9 4a3 3 0 0 1 6 0M10 10h4M10 14h4" />
      </svg>
    );
  }

  if (type === "history") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7" />
        <path d="M4 4v4.7h4.7M12 8v5l3 2" />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21c1.2-4.2 3.5-6.2 7-6.2s5.8 2 7 6.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
      <path d="M4 11.4 12 4l8 7.4V21h-6v-5.5h-4V21H4z" />
    </svg>
  );
}

interface MenuRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

function MenuRow({ icon, title, subtitle, onClick }: MenuRowProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full flex items-center justify-between gap-3 py-3 px-4 border-b border-[#edf1f5] last:border-b-0 hover:bg-slate-50/50 text-left bg-transparent cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="grid w-8 h-8 place-items-center rounded-full bg-[#edf5ff] text-[#1158d4] flex-none">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="m-0 text-sm font-bold text-[#07183f] leading-none">{title}</p>
          <p className="m-0 text-xs text-[#8f98a8] mt-1.5 leading-none truncate">{subtitle}</p>
        </div>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400 flex-none">
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  );
}

interface AgentProfileProps {
  onNavigate?: (step: Step) => void;
  onLogout?: () => void;
}

export function AgentProfile({ onNavigate, onLogout }: AgentProfileProps) {
  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative overflow-hidden">
        
        {/* Header */}
        <header className="relative flex items-center justify-center h-12 w-full flex-none">
          <h1 className="text-lg font-bold text-[#07183f]">Profile</h1>
          
          <button
            type="button"
            className="absolute right-0 flex items-center gap-1.5 h-8 px-3 border border-[#d5dbe5] rounded-[10px] bg-white text-xs font-bold text-[#061332] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 text-[#102f6c]">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span data-language-label data-no-translate>English</span>
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-[#102f6c]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
              <path d="m3 4.5 3 3 3-3" />
            </svg>
          </button>
        </header>

        {/* Scrollable Container (Locks header and tabbar static) */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-28">
          
          {/* Profile Card */}
          <AgentProfileCard showArrow onClick={() => onNavigate?.("personal-info")} />

          {/* Metrics Grid */}
          <section className="grid grid-cols-4 gap-2.5 w-full flex-none">
            {summaries.map((item) => {
              const tone = toneStyles[item.tone];
              return (
                <article key={item.label} className={`flex flex-col items-center justify-center rounded-[14px] border py-2.5 text-center min-h-[90px] bg-white ${tone.card}`}>
                  <div className={`grid h-8 w-8 place-items-center rounded-full ${tone.iconBg} ${tone.accent}`}>
                    <SummaryIcon icon={item.icon} />
                  </div>
                  <p className="text-[9px] font-bold leading-none text-[#5c6980] mt-1.5">
                    {item.label}
                  </p>
                  <strong className="text-sm font-bold leading-none text-[#050a16] mt-1">
                    {item.count}
                  </strong>
                </article>
              );
            })}
          </section>

          {/* Menu Card */}
          <section className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col flex-none">
            <MenuRow
              onClick={() => onNavigate?.("personal-info")}
              title="Personal Information"
              subtitle="View and update your personal details"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("employee-info")}
              title="Employee Information"
              subtitle="View your employee and work details"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("work-settings")}
              title="Work Settings"
              subtitle="Manage app preferences and work settings"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("notifications")}
              title="Notifications"
              subtitle="Manage your notification preferences"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("privacy-security")}
              title="Privacy & Security"
              subtitle="Manage password and security settings"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("offline-data")}
              title="Offline Data"
              subtitle="Manage downloaded data for offline access"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("help-support")}
              title="Help & Support"
              subtitle="FAQs, tutorials and support"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => onNavigate?.("about")}
              title="About FieldOps"
              subtitle="App version and information"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              }
            />
          </section>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            type="button"
            aria-label="Logout"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#ffd2d2] bg-[#fff5f5] px-4 text-sm font-bold text-[#d92027] shadow-sm transition-colors hover:bg-[#ffeaea] active:bg-[#ffe0df]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>

          {/* App Version */}
          <p className="text-[10px] text-center text-slate-400 font-medium leading-none mt-2">
            Version 2.3.0 (Build 45)
          </p>

        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="relative flex h-16 items-center justify-between rounded-t-[22px] border-t border-[#eef2f6] bg-white px-5 shadow-[0_-8px_24px_rgba(26,57,111,0.08)]">
          <button
            onClick={() => onNavigate?.("home")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="home" />
            <span className="text-[10px] font-medium leading-none">Home</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("my-tasks")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="tasks" />
            <span className="text-[10px] font-medium leading-none">My Tasks</span>
          </button>
          
          <button onClick={() => onNavigate?.("add-task")} type="button" className="flex flex-1 flex-col items-center justify-end relative h-full pb-1 text-[#70798d]">
            <span className="absolute -top-5 grid h-12 w-12 place-items-center rounded-full bg-[#1158d4] text-white shadow-[0_6px_14px_rgba(19,91,215,0.3)] hover:scale-105 transition-transform duration-200 cursor-pointer">
              <PlusIcon />
            </span>
            <span className="text-[10px] font-medium leading-none mt-auto">Add Task</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("history")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="history" />
            <span className="text-[10px] font-medium leading-none">History</span>
          </button>
          
          <button type="button" className="flex flex-1 flex-col items-center justify-center gap-1 text-[#1158d4] cursor-pointer bg-transparent border-0">
            <NavIcon type="profile" />
            <span className="text-[10px] font-bold leading-none">Profile</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
