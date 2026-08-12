import { useState } from "react";
import type { Step } from "../../../types";

interface HistoryTask {
  id: string;
  title: string;
  type: "search" | "document" | "id" | "scale" | "folder";
  status: "COMPLETED" | "IN PROGRESS" | "REJECTED" | "CANCELLED";
  location: string;
  distance: string;
  date: string;
  timeRange: string;
  displayStatusText: string;
  displayStatusColorClass: string;
  tagColorClass: string;
  reason?: string;
}

const historyTasks: HistoryTask[] = [
  {
    id: "#T123456",
    title: "Field Investigation",
    type: "search",
    status: "COMPLETED",
    location: "Pune, Maharashtra",
    distance: "2.4 km",
    date: "16 May 2025",
    timeRange: "10:30 AM - 12:30 PM",
    displayStatusText: "16 May 2025",
    displayStatusColorClass: "text-[#088d27]",
    tagColorClass: "bg-[#ecfaef] text-[#088d27]"
  },
  {
    id: "#T123457",
    title: "Document Collection",
    type: "document",
    status: "IN PROGRESS",
    location: "Pimpri-Chinchwad, Maharashtra",
    distance: "5.7 km",
    date: "16 May 2025",
    timeRange: "01:00 PM - 03:00 PM",
    displayStatusText: "In Progress",
    displayStatusColorClass: "text-[#e58000]",
    tagColorClass: "bg-[#fff8eb] text-[#e58000]"
  },
  {
    id: "#T123458",
    title: "KYC Verification",
    type: "id",
    status: "COMPLETED",
    location: "Pune, Maharashtra",
    distance: "6.1 km",
    date: "15 May 2025",
    timeRange: "03:30 PM - 05:00 PM",
    displayStatusText: "15 May 2025",
    displayStatusColorClass: "text-[#088d27]",
    tagColorClass: "bg-[#ecfaef] text-[#088d27]"
  },
  {
    id: "#T123459",
    title: "Legal Verification",
    type: "scale",
    status: "REJECTED",
    location: "Hinjewadi, Maharashtra",
    distance: "7.8 km",
    date: "15 May 2025",
    timeRange: "11:00 AM - 12:30 PM",
    displayStatusText: "Rejected",
    displayStatusColorClass: "text-[#ee0f1a]",
    tagColorClass: "bg-[#fff0ef] text-[#ee0f1a]",
    reason: "Reason: Insufficient address proof provided."
  },
  {
    id: "#T123460",
    title: "Additional Doc Collection",
    type: "folder",
    status: "COMPLETED",
    location: "Pune, Maharashtra",
    distance: "3.2 km",
    date: "14 May 2025",
    timeRange: "02:00 PM - 03:30 PM",
    displayStatusText: "14 May 2025",
    displayStatusColorClass: "text-[#088d27]",
    tagColorClass: "bg-[#ecfaef] text-[#088d27]"
  },
  {
    id: "#T123461",
    title: "Field Investigation",
    type: "document",
    status: "CANCELLED",
    location: "Akurdi, Maharashtra",
    distance: "3.2 km",
    date: "14 May 2025",
    timeRange: "09:30 AM - 10:30 AM",
    displayStatusText: "Cancelled",
    displayStatusColorClass: "text-[#5c6a85]",
    tagColorClass: "bg-[#edf2f7] text-[#5c6a85]",
    reason: "Reason: Task was cancelled by admin."
  }
];

function TaskTypeIcon({ type }: { type: HistoryTask["type"] }) {
  if (type === "search") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf5ff] text-[#1158d4]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="22" x2="16.65" y2="16.65" />
          <circle cx="11" cy="11" r="3" />
        </svg>
      </div>
    );
  }
  if (type === "document") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ecfaef] text-[#088d27]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
    );
  }
  if (type === "id") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f8f5ff] text-[#7224e9]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M15 10h3M15 14h3M5 16c0-2 4-3 4-3s4 1 4 3" />
        </svg>
      </div>
    );
  }
  if (type === "scale") {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0ef] text-[#ee0f1a]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M12 2v20M2 5h20M3 9l3-3 3 3M15 9l3-3 3 3" />
        </svg>
      </div>
    );
  }
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f9ff] text-[#00b2e3]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
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

interface AgentHistoryProps {
  onNavigate?: (step: Step) => void;
}

export function AgentHistory({ onNavigate }: AgentHistoryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "rejected" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = historyTasks.filter((task) => {
    // Filter by Tab
    if (activeTab === "completed" && task.status !== "COMPLETED") return false;
    if (activeTab === "rejected" && task.status !== "REJECTED") return false;
    if (activeTab === "cancelled" && task.status !== "CANCELLED") return false;

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative h-full overflow-hidden">
        
        {/* Header */}
        <header className="relative flex items-center justify-center h-12 w-full flex-none">
          <h1 className="text-lg font-bold text-[#07183f]">History</h1>
          
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

        {/* Tab Switcher */}
        <div className="mt-2 bg-[#f8fafc] border border-[#eef2f6] rounded-[14px] p-1 flex items-center w-full flex-none">
          {(["all", "completed", "rejected", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`flex-1 text-[11px] font-bold py-2 rounded-xl text-center capitalize cursor-pointer transition-all duration-200 border-0 ${
                activeTab === tab
                  ? "bg-[#edf4ff] text-[#1158d4] shadow-sm"
                  : "text-[#70798d] hover:text-[#07183f] bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="mt-4 flex gap-2.5 w-full flex-none">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task name, customer or ID..."
              className="w-full h-10 pl-10 pr-4 border border-[#e2e8f0] rounded-[12px] text-xs font-bold placeholder-slate-400 bg-white outline-none focus:border-[#1158d4] focus:ring-1 focus:ring-[#1158d4] shadow-sm"
            />
          </div>
          
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-4 border border-[#e2e8f0] rounded-[12px] bg-white text-xs font-bold text-[#061332] cursor-pointer shadow-sm hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4]">
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
            <span>Filter</span>
          </button>
        </div>

        {/* Recent Activity List */}
        <div className="flex-1 mt-4 overflow-hidden flex flex-col min-h-0">
          <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1 flex-none">Recent Activity</h2>
          
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full flex flex-col gap-3 pb-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-white border border-[#edf1f5] rounded-[18px]">
                No history logs found.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article
                  key={task.id}
                  onClick={() => onNavigate?.("task-details")}
                  className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 px-4 py-3.5">
                    <TaskTypeIcon type={task.type} />

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold leading-none ${task.tagColorClass}`}>
                          {task.status}
                        </span>
                        <h3 className="min-w-0 truncate text-xs font-bold leading-none text-[#07183f]">
                          {task.title}
                        </h3>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium leading-none text-[#5c6a85]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 flex-none text-[#1158d4]">
                          <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                          <circle cx="12" cy="9" r="2" />
                        </svg>
                        <span className="truncate">{task.location}</span>
                        <span className="text-[#a0aec0]">.</span>
                        <span>{task.distance}</span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium leading-none text-[#5c6a85]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 flex-none text-[#1158d4]">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="truncate">{task.timeRange}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-none text-right justify-center">
                      <span className={`text-[10px] font-bold ${task.displayStatusColorClass}`}>
                        {task.displayStatusText}
                      </span>
                    </div>

                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400 flex-none ml-1">
                      <path d="m9 5 7 7-7 7" />
                    </svg>
                  </div>

                  {task.reason && (
                    <div className={`px-4 py-2 border-t text-[10px] font-bold text-left leading-relaxed ${
                      task.status === "REJECTED" ? "bg-[#fff0ef] border-[#ffd9d6] text-[#ee0f1a]" : "bg-slate-50 border-slate-100 text-slate-500"
                    }`}>
                      {task.reason}
                    </div>
                  )}
                </article>
              ))
            )}

            {/* Pagination Footer */}
            {filteredTasks.length > 0 && (
              <div className="flex items-center justify-between px-2 py-1 w-full flex-none mt-2">
                <span className="text-[10px] font-bold text-[#8f98a8]">Showing 1 to 6 of 18 tasks</span>
                <div className="flex items-center gap-1">
                  <button type="button" className="w-6 h-6 rounded-md border border-[#e2e8f0] bg-white grid place-items-center text-slate-400 hover:text-slate-700 cursor-pointer text-xs">
                    &lt;
                  </button>
                  <button type="button" className="w-6 h-6 rounded-md bg-[#1158d4] text-white font-bold grid place-items-center cursor-pointer text-xs border-0">
                    1
                  </button>
                  <button type="button" className="w-6 h-6 rounded-md border border-[#e2e8f0] bg-white text-slate-500 hover:text-slate-700 grid place-items-center cursor-pointer text-xs">
                    2
                  </button>
                  <button type="button" className="w-6 h-6 rounded-md border border-[#e2e8f0] bg-white text-slate-500 hover:text-slate-700 grid place-items-center cursor-pointer text-xs">
                    3
                  </button>
                  <button type="button" className="w-6 h-6 rounded-md border border-[#e2e8f0] bg-white grid place-items-center text-slate-400 hover:text-slate-700 cursor-pointer text-xs">
                    &gt;
                  </button>
                </div>
              </div>
            )}
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
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="history" />
            <span className="text-[10px] font-bold leading-none">History</span>
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
