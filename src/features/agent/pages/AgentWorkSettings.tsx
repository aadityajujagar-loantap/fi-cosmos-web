import { useState } from "react";
import type { Step } from "../../../types";
import { AgentProfileCard } from "../components/AgentProfileCard";

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  valueText?: string;
  checked?: boolean;
  onToggleChange?: (checked: boolean) => void;
  toggleColorClass?: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  valueText,
  checked,
  onToggleChange,
  toggleColorClass = "bg-[#1158d4]",
  iconColorClass = "text-[#1158d4]",
  iconBgClass = "bg-[#edf5ff]"
}: SettingsRowProps) {
  return (
    <div className="w-full flex items-center justify-between gap-3 py-3 px-4 border-b border-[#edf1f5] last:border-b-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`grid w-8 h-8 place-items-center rounded-full flex-none ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
        <div className="min-w-0 text-left">
          <p className="m-0 text-xs font-bold text-[#07183f] leading-none">{title}</p>
          <p className="m-0 text-[10px] text-[#8f98a8] mt-1 leading-none truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-none">
        {valueText && <span className="text-[11px] font-bold text-[#5c6a85]">{valueText}</span>}
        {onToggleChange !== undefined && checked !== undefined ? (
          <button
            onClick={() => onToggleChange(!checked)}
            type="button"
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none flex-none ${
              checked ? toggleColorClass : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                checked ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
            <path d="m9 5 7 7-7 7" />
          </svg>
        )}
      </div>
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

interface AgentWorkSettingsProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

export function AgentWorkSettings({ onBack, onNavigate }: AgentWorkSettingsProps) {
  const [autoAssign, setAutoAssign] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [startReminder, setStartReminder] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative overflow-hidden">
        
        {/* Header */}
        <header className="relative flex items-center justify-center h-12 w-full flex-none">
          <button
            onClick={onBack}
            type="button"
            className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50 cursor-pointer border-0 text-[#07183f]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-lg font-bold text-[#07183f]">Work Settings</h1>
          
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

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-28">
          
          {/* Profile Summary Card */}
          <AgentProfileCard />

          {/* Section: General Settings */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">General Settings</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SettingsRow
                title="Working Hours"
                subtitle="Set your working hours and shift timings"
                valueText="09:00 AM - 06:00 PM"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <SettingsRow
                title="Working Days"
                subtitle="Select your working days"
                valueText="Mon - Sat"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <SettingsRow
                title="Break Duration"
                subtitle="Set your break time"
                valueText="30 mins"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M18 8h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                }
              />
              <SettingsRow
                title="Default Location"
                subtitle="Set your default work location"
                valueText="Pune, Maharashtra"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Task Settings */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Task Settings</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SettingsRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                toggleColorClass="bg-[#088d27]"
                title="Auto Task Assignment"
                subtitle="Automatically assign tasks to you"
                checked={autoAssign}
                onToggleChange={setAutoAssign}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                toggleColorClass="bg-[#088d27]"
                title="Task Reminders"
                subtitle="Receive reminders for upcoming tasks"
                checked={reminders}
                onToggleChange={setReminders}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                toggleColorClass="bg-[#088d27]"
                title="Task Start Reminder"
                subtitle="Get reminded to start tasks on time"
                checked={startReminder}
                onToggleChange={setStartReminder}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                title="Auto Sync"
                subtitle="Automatically sync tasks and data"
                valueText="Wi-Fi & Mobile Data"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Data & Sync */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Data & Sync</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SettingsRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Data Sync Mode"
                subtitle="Choose how data is synced"
                valueText="Wi-Fi & Mobile Data"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 2a10 10 0 0 0-8 8.4" />
                    <path d="M8 6a10 10 0 0 1 8 0" />
                    <path d="M16 10a8 8 0 0 0-8-8" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                toggleColorClass="bg-[#7224e9]"
                title="Upload Only on Wi-Fi"
                subtitle="Upload task data only when connected to Wi-Fi"
                checked={wifiOnly}
                onToggleChange={setWifiOnly}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Clear Cached Data"
                subtitle="Free up space by clearing locally cached data"
                valueText="15.6 MB"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Other Settings */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Other Settings</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SettingsRow
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Distance Unit"
                subtitle="Choose distance measurement unit"
                valueText="Kilometers (km)"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Map Preference"
                subtitle="Choose your default map application"
                valueText="Google Maps"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                }
              />
              <SettingsRow
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Theme"
                subtitle="Choose your preferred app theme"
                valueText="System Default"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Footer note banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4] mt-0.5 flex-none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="m-0 text-[10px] text-[#1158d4] font-medium text-left leading-relaxed">
              <strong>Note:</strong> These settings will be applied to your account and help personalize your work experience.
            </p>
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
          
          <button onClick={() => onNavigate?.("history")} type="button" className="flex flex-1 flex-col items-center justify-center gap-1 text-[#70798d] hover:text-[#1158d4] cursor-pointer bg-transparent border-0">
            <NavIcon type="history" />
            <span className="text-[10px] font-medium leading-none">History</span>
          </button>
          
          <button
            onClick={() => onNavigate?.("profile")}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[#1158d4] cursor-pointer bg-transparent border-0"
          >
            <NavIcon type="profile" />
            <span className="text-[10px] font-bold leading-none">Profile</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
