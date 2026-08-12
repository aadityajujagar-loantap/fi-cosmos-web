import { useMemo, useState } from "react";
import type { Tone, SummaryCard, Task, Step } from "../../../types";

type TaskWithStatus = Task & { id?: string; status: "In Progress" | "Pending" | "Completed" };

const initialTasks: TaskWithStatus[] = [
  {
    title: "Field Investigation",
    location: "Pune, Maharashtra",
    distance: "2.4 km",
    time: "10:30 AM - 12:30 PM",
    priority: "HIGH",
    tone: "blue",
    icon: "search",
    action: "filled",
    status: "In Progress",
  },
  {
    title: "Document Collection",
    location: "Pimpri-Chinchwad, Maharashtra",
    distance: "5.7 km",
    time: "01:00 PM - 03:00 PM",
    priority: "MEDIUM",
    tone: "green",
    icon: "document",
    action: "filled",
    status: "In Progress",
  },
  {
    title: "KYC Verification",
    location: "Pune, Maharashtra",
    distance: "6.1 km",
    time: "03:30 PM - 05:00 PM",
    priority: "HIGH",
    tone: "purple",
    icon: "id",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Legal Verification",
    location: "Hinjewadi, Maharashtra",
    distance: "7.8 km",
    time: "Tomorrow",
    priority: "LOW",
    tone: "orange",
    icon: "scale",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Additional Doc Collection",
    location: "Pune, Maharashtra",
    distance: "9.3 km",
    time: "Tomorrow",
    priority: "MEDIUM",
    tone: "cyan",
    icon: "folder",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Asset Valuation",
    location: "Kothrud, Pune",
    distance: "4.2 km",
    time: "10:00 AM - 11:30 AM",
    priority: "HIGH",
    tone: "blue",
    icon: "search",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Signature Verification",
    location: "Aundh, Pune",
    distance: "8.1 km",
    time: "12:00 PM - 01:30 PM",
    priority: "MEDIUM",
    tone: "green",
    icon: "document",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Background Check",
    location: "Baner, Pune",
    distance: "5.3 km",
    time: "02:00 PM - 03:30 PM",
    priority: "LOW",
    tone: "orange",
    icon: "scale",
    action: "outline",
    status: "Pending",
  },
  {
    title: "Final Approval Upload",
    location: "Viman Nagar, Pune",
    distance: "11.5 km",
    time: "Tomorrow",
    priority: "HIGH",
    tone: "purple",
    icon: "folder",
    action: "outline",
    status: "Pending",
  },
];

function loadCreatedTasks(): TaskWithStatus[] {
  try {
    const saved = JSON.parse(localStorage.getItem("agent-created-tasks") || "[]") as Array<{
      address?: string;
      distance?: string;
      id?: string;
      priority?: string;
      slot?: string;
      title?: string;
      type?: string;
    }>;

    return saved.map((task) => ({
      action: "outline",
      distance: task.distance || "2.4 km",
      icon: task.type === "Document Collection" ? "document" : "search",
      id: task.id,
      location: task.address || "Pune, Maharashtra",
      priority: task.priority === "Low" ? "LOW" : task.priority === "Medium" ? "MEDIUM" : "HIGH",
      status: "Pending",
      time: task.slot || "Today",
      title: task.title || "New Field Task",
      tone: task.priority === "Medium" ? "orange" : task.priority === "Low" ? "green" : "blue",
    }));
  } catch {
    return [];
  }
}

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

const statusStyles = {
  Completed: "bg-[#ecfaef] text-[#088d27]",
  "In Progress": "bg-[#fff2e4] text-[#e58000]",
  Pending: "bg-[#f3f4f6] text-[#5c6a85]",
};

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
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
      <path d="M4 11.4 12 4l8 7.4V21h-6v-5.5h-4V21H4z" />
    </svg>
  );
}

interface AgentMyTasksProps {
  onNavigate?: (step: Step) => void;
}

export function AgentMyTasks({ onNavigate }: AgentMyTasksProps) {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks] = useState<TaskWithStatus[]>(() => [...loadCreatedTasks(), ...initialTasks]);
  const summaries = useMemo<SummaryCard[]>(() => {
    const countByStatus = (status: TaskWithStatus["status"]) => tasks.filter((task) => task.status === status).length;

    return [
      { label: "Total Tasks", count: tasks.length, icon: "clipboard", tone: "blue" },
      { label: "In Progress", count: countByStatus("In Progress"), icon: "hourglass", tone: "orange" },
      { label: "Completed", count: countByStatus("Completed"), icon: "check", tone: "green" },
      { label: "Pending", count: countByStatus("Pending"), icon: "alert", tone: "red" },
    ];
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    // Show first 5 tasks under Today, and let search filter them
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "today") {
      return matchesSearch;
    }
    // Simple demo filter for other tabs
    if (activeTab === "upcoming") {
      return matchesSearch && task.time === "Tomorrow";
    }
    return false; // Overdue starts empty
  });

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative h-full overflow-hidden">
        
        {/* Header */}
        <header className="relative flex items-center justify-center h-12 w-full flex-none">
          <h1 className="text-lg font-bold text-[#07183f]">My Tasks</h1>
          
          <button
            type="button"
            className="absolute right-0 flex items-center gap-1.5 h-8 px-3 border border-[#d5dbe5] rounded-[10px] bg-white text-xs font-bold text-[#061332] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 text-[#102f6c]">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>English</span>
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-[#102f6c]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
              <path d="m3 4.5 3 3 3-3" />
            </svg>
          </button>
        </header>

        {/* Segmented Tabs Switcher */}
        <div className="flex bg-[#f3f4f6] p-1 rounded-xl w-full mt-4 flex-none">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              activeTab === "today" ? "bg-white text-[#1158d4] shadow-sm" : "text-[#5c6a85]"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              activeTab === "upcoming" ? "bg-white text-[#1158d4] shadow-sm" : "text-[#5c6a85]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              activeTab === "overdue" ? "bg-white text-[#1158d4] shadow-sm" : "text-[#5c6a85]"
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-2.5 mt-4 w-full flex-none">
          <div className="flex-1 flex items-center h-10 border border-[#d5dbe5] rounded-xl bg-white px-3 focus-within:border-[#174cb3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400 mr-2 flex-none">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks by name or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 border-0 outline-none text-xs font-medium text-[#07183f] placeholder-[#8f98a8]"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-3.5 border border-[#d5dbe5] rounded-xl bg-white text-xs font-bold text-[#1158d4] cursor-pointer hover:bg-slate-50 flex-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 flex-none">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filter
          </button>
        </div>

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
                <button type="button" className={`flex items-center gap-0.5 text-[9px] font-bold leading-none mt-1.5 cursor-pointer ${tone.text}`} aria-label={`View all ${item.label.toLowerCase()}`}>
                  View all
                  <ChevronRight />
                </button>
              </article>
            );
          })}
        </section>

        {/* Today's Tasks Section Title */}
        <div className="flex items-center justify-between mt-4 w-full flex-none px-1">
          <h2 className="text-sm font-bold text-[#07183f]">
            Today's Tasks ({filteredTasks.length})
          </h2>
          <button type="button" className="flex items-center gap-1 text-[11px] font-bold text-[#1158d4] bg-[#edf4ff] px-2.5 py-1 rounded-lg cursor-pointer border-0">
            Sort by: Start Time v
          </button>
        </div>

        {/* Scrollable Tasks list body */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-3 flex flex-col gap-3 pb-28">
          
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No tasks found.</div>
          ) : (
              filteredTasks.map((task) => {
                const tone = toneStyles[task.tone];
                return (
                  <article
                    key={task.id ?? `${task.title}-${task.location}-${task.time}`}
                    onClick={() => onNavigate?.("task-details")}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border border-[#edf1f5] rounded-[18px] bg-white shadow-sm relative cursor-pointer hover:bg-slate-50/50"
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
                          <span className="truncate">{task.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-none ml-auto">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold leading-none ${statusStyles[task.status]}`}>
                          {task.status}
                        </span>
                        
                        <button
                          type="button"
                          className={
                            task.status === "In Progress"
                              ? "bg-[#1158d4] text-white hover:bg-[#0f4ebc] text-[10px] font-bold px-2 py-1.5 rounded-md flex items-center justify-center gap-0.5 w-[76px] shadow-sm cursor-pointer border-0"
                              : "border border-[#1158d4] text-[#1158d4] bg-white hover:bg-slate-50 text-[10px] font-bold px-2 py-1.5 rounded-md flex items-center justify-center w-[76px] cursor-pointer"
                          }
                        >
                          <span>{task.status === "In Progress" ? "Continue" : "Start Task"}</span>
                          {task.status === "In Progress" && <span className="text-[10px] font-bold">&gt;</span>}
                        </button>
                      </div>
                      
                      <button type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 self-start mt-0.5 flex-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </article>
              );
            })
          )}

          {/* Facing an issue Banner */}
          <div className="flex items-center justify-between gap-3 w-full bg-[#f4f6f8] rounded-xl p-3 mt-2 border border-[#e6ebf1]">
            <div className="flex items-center gap-2.5">
              <div className="grid w-8 h-8 place-items-center rounded-full bg-[#e3e7ec] text-[#2c3e50] flex-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="m-0 text-xs font-bold text-[#07183f]">Facing an issue?</p>
                <p className="m-0 text-[10px] text-[#5c6a85]">Report a problem with any task.</p>
              </div>
            </div>
            <button onClick={() => onNavigate?.("help-support")} type="button" className="border border-[#d5dbe5] text-xs font-bold text-[#07183f] bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex-none shadow-sm">
              Report Issue
            </button>
          </div>

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
          
          <button type="button" className="flex flex-1 flex-col items-center justify-center gap-1 text-[#1158d4] cursor-pointer bg-transparent border-0">
            <NavIcon type="tasks" />
            <span className="text-[10px] font-bold leading-none">My Tasks</span>
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
