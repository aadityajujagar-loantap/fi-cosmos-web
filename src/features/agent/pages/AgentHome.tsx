import { useMemo } from "react";
import { useAppData } from "../../../data/dataContext";
import { useAgentLocation } from "../location/agentLocationContext";
import { selectUnreadCount } from "../../../domain/selectors";
import type { Tone, SummaryCard, Task, Step } from "../../../types";
import { setActiveAgentTaskId, toAgentTasks, type AgentTaskRecord } from "../utils/tasks";

const toneStyles: Record<Tone, { accent: string; card: string; iconBg: string; soft: string; text: string }> = {
  blue: {
    accent: "text-[#1158d4]",
    card: "border-[#d8e6ff] bg-[#f4f8ff]",
    iconBg: "bg-[#edf5ff]",
    soft: "bg-[#edf5ff]",
    text: "text-[#1158d4]",
  },
  orange: {
    accent: "text-[#e58000]",
    card: "border-[#fdecd5] bg-[#fffbf5]",
    iconBg: "bg-[#fff8eb]",
    soft: "bg-[#fff8eb]",
    text: "text-[#e58000]",
  },
  green: {
    accent: "text-[#088d27]",
    card: "border-[#d4f3dd] bg-[#f5fdf7]",
    iconBg: "bg-[#ecfaef]",
    soft: "bg-[#ecfaef]",
    text: "text-[#088d27]",
  },
  red: {
    accent: "text-[#ee0f1a]",
    card: "border-[#fddbd9] bg-[#fff5f5]",
    iconBg: "bg-[#fff0ef]",
    soft: "bg-[#fff0ef]",
    text: "text-[#ee0f1a]",
  },
  purple: {
    accent: "text-[#7224e9]",
    card: "border-[#e5d8ff] bg-[#fbf8ff]",
    iconBg: "bg-[#f8f5ff]",
    soft: "bg-[#f8f5ff]",
    text: "text-[#7224e9]",
  },
  cyan: {
    accent: "text-[#0aa6b4]",
    card: "border-[#cceff1] bg-[#f5feff]",
    iconBg: "bg-[#ebfbfc]",
    soft: "bg-[#ebfbfc]",
    text: "text-[#0aa6b4]",
  },
};

const priorityStyles: Record<Task["priority"], string> = {
  HIGH: "bg-[#f0f4ff] text-[#1158d4]",
  MEDIUM: "bg-[#fff7f0] text-[#e58000]",
  LOW: "bg-[#f0fff4] text-[#088d27]",
};

function LogoMark() {
  return (
    <div className="w-8 h-8 flex-none" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="#e8f2ff" />
        <path d="M 50,6 A 44,44 0 0,0 50,94" stroke="#34a853" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 50,94 A 44,44 0 0,0 50,6" stroke="#16469d" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 28,84 C 28,68 38,59 50,59 C 62,59 72,68 72,84 Z" fill="#16469d" />
        <path d="M 39,59 L 50,71 L 61,59 Z" fill="#102f6c" />
        <rect x="46" y="50" width="8" height="11" fill="#fcd4b0" />
        <circle cx="50" cy="42" r="12" fill="#fcd4b0" />
        <path d="M 38,42 C 38,34 42,30 50,30 C 58,30 62,34 62,42 Z" fill="#2d3748" />
        <path d="M 38,38 C 38,28 44,26 50,26 C 56,26 62,38 62,38 Z" fill="#16469d" />
        <path d="M 45,30 C 52,30 59,33 63,37 L 59,40 C 56,37 51,35 45,35 Z" fill="#102f6c" />
        <circle cx="46" cy="42" r="1.2" fill="#2d3748" />
        <circle cx="54" cy="42" r="1.2" fill="#2d3748" />
        <path d="M 47,46 Q 50,49 53,46" stroke="#2d3748" strokeWidth="1" fill="none" strokeLinecap="round" />
        <rect x="42" y="56" width="16" height="23" rx="2" fill="#34a853" />
        <rect x="47" y="53" width="6" height="4" rx="1" fill="#718096" />
        <rect x="45" y="59" width="10" height="18" rx="0.5" fill="#ffffff" />
        <line x1="47" y1="62" x2="53" y2="62" stroke="#a0aec0" strokeWidth="1.2" />
        <line x1="47" y1="65" x2="53" y2="65" stroke="#a0aec0" strokeWidth="1.2" />
        <line x1="47" y1="68" x2="51" y2="68" stroke="#a0aec0" strokeWidth="1.2" />
        <circle cx="39" cy="67" r="3.5" fill="#fcd4b0" />
        <circle cx="61" cy="67" r="3.5" fill="#fcd4b0" />
      </svg>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true">
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
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

function TaskIcon({ icon }: { icon: Task["icon"] }) {
  if (icon === "document") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );
  }

  if (icon === "id") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <circle cx="9" cy="12" r="2" />
        <path d="M13 10h4M13 14h4M7 16c.5-1.4 1.2-2 2-2s1.5.6 2 2" />
      </svg>
    );
  }

  if (icon === "scale") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M12 4v16M6 20h12M5 7h14" />
        <path d="m7 7-4 7h8L7 7ZM17 7l-4 7h8l-4-7Z" />
      </svg>
    );
  }

  if (icon === "folder") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <path d="M3 7h7l2 3h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="m9 15 2 2 5-5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
      <circle cx="11" cy="10" r="3.5" />
      <path d="M6.5 17c1-2.6 2.5-3.8 4.5-3.8s3.5 1.2 4.5 3.8" />
      <circle cx="11" cy="10" r="8" />
      <path d="m17 16 4 4" />
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
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21c1.2-4.2 3.5-6.2 7-6.2s5.8 2 7 6.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M4 11.4 12 4l8 7.4V21h-6v-5.5h-4V21H4z" />
    </svg>
  );
}

function HomeHeroArt() {
  return (
    <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
      <path d="M 10,95 Q 60,60 110,90 T 150,80" fill="none" stroke="#eef4fc" strokeWidth="16" strokeLinecap="round" />
      <path d="M 10,95 Q 60,60 110,90 T 150,80" fill="none" stroke="#135bd7" strokeWidth="2.5" strokeDasharray="5,5" strokeLinecap="round" />
      <circle cx="10" cy="95" r="4" fill="#135bd7" />
      <g transform="translate(100, 30)">
        <ellipse cx="12" cy="46" rx="8" ry="2.5" fill="#135bd7" opacity="0.25" />
        <path d="M12 2C6.48 2 2 6.48 2 12c0 5.25 10 28 10 28s10-22.75 10-28c0-5.52-4.48-10-10-10z" fill="#135bd7" />
        <circle cx="12" cy="12" r="5" fill="#ffffff" />
      </g>
    </svg>
  );
}

interface AgentHomeProps {
  onNavigate?: (step: Step) => void;
}

export function AgentHome({ onNavigate }: AgentHomeProps) {
  const { state, agentActor } = useAppData();
  const { coordinates: agentLocation } = useAgentLocation();
  const taskQueue = useMemo<AgentTaskRecord[]>(() => toAgentTasks(state.tasks, agentLocation), [agentLocation, state.tasks]);
  const unreadCount = selectUnreadCount(state, agentActor.id);
  const homeTasks = useMemo(
    () => taskQueue
      .filter((task) => ["Assigned", "Accepted", "In Progress", "Rework Required"].includes(task.status))
      .sort((first, second) => (first.status === "Assigned" ? -1 : 0) - (second.status === "Assigned" ? -1 : 0) || Date.parse(first.dueAt) - Date.parse(second.dueAt)),
    [taskQueue],
  );
  const summaries = useMemo<SummaryCard[]>(() => {
    const countByStatus = (status: AgentTaskRecord["status"]) => taskQueue.filter((task) => task.status === status).length;

    return [
      { label: "Total Tasks", count: taskQueue.length, icon: "clipboard", tone: "blue" },
      { label: "In Progress", count: countByStatus("In Progress"), icon: "hourglass", tone: "orange" },
      { label: "Completed", count: taskQueue.filter((t) => t.status === "Completed" || t.status === "Submitted").length, icon: "check", tone: "green" },
      { label: "Assigned", count: countByStatus("Assigned"), icon: "alert", tone: "red" },
    ];
  }, [taskQueue]);

  const openTask = (task: AgentTaskRecord, step: Step = "task-details") => {
    setActiveAgentTaskId(task.id);
    onNavigate?.(step);
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative overflow-hidden">
        
        {/* Header */}
        <header className="flex w-full items-center justify-between gap-3 flex-none">
          <button onClick={() => onNavigate?.("menu")} type="button" aria-label="Open menu" className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50 cursor-pointer">
            <MenuIcon />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <LogoMark />
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-none tracking-tight">
                <span className="text-[#16469d]">Field</span><span className="text-[#34a853]">Ops</span>
              </h1>
              <p className="mt-1 text-[10px] font-medium leading-none text-[#4b5563]">
                Field Operations Made Simple
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.("notifications")}
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 flex-none place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50 cursor-pointer"
          >
            <BellIcon />
            {unreadCount ? <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount}</span> : null}
          </button>
        </header>

        {/* Hero Card */}
        <section className="mt-4 py-4 px-5 bg-gradient-to-r from-[#f5f9ff] to-[#edf5ff] rounded-[18px] border border-[#d3e5fe] flex items-center justify-between gap-3 w-full flex-none">
          <div className="flex min-w-0 flex-col justify-center">
            <h2 className="text-xl font-bold leading-tight text-[#07183f]">
              Good Morning,{" "}
              <span className="whitespace-nowrap">
                Amit! <span aria-hidden="true">{"\uD83D\uDC4B"}</span>
              </span>
            </h2>
            <p className="mt-1 text-xs font-medium text-[#5c6a85] leading-snug">
              You have {homeTasks.length} active assigned tasks.
            </p>
          </div>
          <div className="w-28 h-20 flex-none flex items-center justify-center">
            <HomeHeroArt />
          </div>
        </section>

        {/* Summary Metrics Grid */}
        <section className="mt-4 grid grid-cols-4 gap-2.5 w-full flex-none">
          {summaries.map((item) => {
            const tone = toneStyles[item.tone];
            return (
              <article key={item.label} className={`flex flex-col items-center justify-between rounded-[14px] border p-2 text-center min-h-[105px] bg-white ${tone.card}`}>
                <div className={`grid h-8 w-8 place-items-center rounded-full ${tone.iconBg} ${tone.accent}`}>
                  <SummaryIcon icon={item.icon} />
                </div>
                <p className="text-[9px] font-bold leading-none text-[#5c6980] mt-1.5">
                  {item.label}
                </p>
                <strong className="text-base font-bold leading-none text-[#050a16] mt-1">
                  {item.count}
                </strong>
                <button onClick={() => onNavigate?.("my-tasks")} type="button" className={`flex items-center gap-0.5 text-[9px] font-bold leading-none mt-1.5 cursor-pointer ${tone.text}`} aria-label={`View all ${item.label.toLowerCase()}`}>
                  View all
                  <ChevronRight />
                </button>
              </article>
            );
          })}
        </section>

        {/* Assigned Tasks Section (Scrollable list container only) */}
        <section className="mt-5 border border-[#e6ebf1] rounded-[18px] bg-white shadow-sm overflow-hidden w-full flex-1 flex flex-col min-h-0">
          <header className="flex items-center justify-between px-4 py-3 border-b border-[#edf1f5] bg-slate-50/30 flex-none">
            <h2 className="text-sm font-bold leading-none text-[#07183f]">
              Assigned Tasks
            </h2>
            <button onClick={() => onNavigate?.("location-map")} type="button" className="flex items-center gap-1 text-[11px] font-bold leading-none text-[#1158d4] cursor-pointer hover:underline bg-transparent border-0">
              <MapIcon />
              View Map
            </button>
          </header>

          <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {homeTasks.map((task) => {
              const tone = toneStyles[task.tone];
              return (
                <article
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-[#edf1f5] last:border-b-0 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-3 min-w-[200px] flex-1">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg flex-none ${tone.iconBg} ${tone.accent}`}>
                      <TaskIcon icon={task.icon} />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold leading-none ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                        <h3 className="min-w-0 truncate text-xs font-bold leading-none text-[#07183f]">
                          {task.title}
                        </h3>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] font-medium leading-none text-[#5c6a85]">
                        <LocationIcon />
                        <span className="truncate max-w-[130px] sm:max-w-none">{task.location}</span>
                        <span className="text-[#a0aec0]">.</span>
                        <span>{task.distance}</span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold leading-none text-[#1158d4]">
                        <ClockIcon />
                        <span className="truncate">{task.date} | {task.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-none ml-auto">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        openTask(task, task.status === "In Progress" ? "task-in-progress" : "task-details");
                      }}
                      type="button"
                      className={
                        task.action === "filled"
                          ? "bg-[#1158d4] text-white hover:bg-[#0f4ebc] text-[10px] font-bold px-2 py-1.5 rounded-md flex items-center justify-center w-[74px] shadow-sm cursor-pointer border-0"
                          : "border border-[#1158d4] text-[#1158d4] bg-white hover:bg-slate-50 text-[10px] font-bold px-2 py-1.5 rounded-md flex items-center justify-center w-[74px] cursor-pointer"
                      }
                    >
                      {task.status === "Assigned" ? "View" : task.status === "Rework Required" ? "Rework" : "Continue"}
                    </button>
                    <div className="text-slate-400 pl-0.5">
                      <ChevronRight />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Nav Bar (Attached to bottommost edge) */}
      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="relative flex h-16 items-center justify-between rounded-t-[22px] border-t border-[#eef2f6] bg-white px-5 shadow-[0_-8px_24px_rgba(26,57,111,0.08)]">
          <button type="button" className="flex flex-1 flex-col items-center justify-center gap-1 text-[#1158d4] cursor-pointer bg-transparent border-0">
            <NavIcon type="home" />
            <span className="text-[10px] font-bold leading-none">Home</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("my-tasks")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="tasks" />
            <span className="text-[10px] font-medium leading-none">My Tasks</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("history")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="history" />
            <span className="text-[10px] font-medium leading-none">History</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("profile")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="profile" />
            <span className="text-[10px] font-medium leading-none">Profile</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
