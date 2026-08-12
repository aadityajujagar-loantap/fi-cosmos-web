import { useState } from "react";
import type { Step } from "../../../types";
import { AgentProfileCard } from "../components/AgentProfileCard";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      type="button"
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none flex-none ${
        checked ? "bg-[#1158d4]" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  showChevron?: boolean;
}

function PreferenceRow({ icon, title, subtitle, checked, onChange, showChevron = true }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 border-b border-[#edf1f5] last:border-b-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="grid w-8 h-8 place-items-center rounded-full bg-[#edf5ff] text-[#1158d4] flex-none">
          {icon}
        </div>
        <div className="min-w-0 text-left">
          <p className="m-0 text-xs font-bold text-[#07183f] leading-none">{title}</p>
          <p className="m-0 text-[10px] text-[#8f98a8] mt-1 leading-none truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-none">
        <Toggle checked={checked} onChange={onChange} />
        {showChevron && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
            <path d="m9 5 7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );
}

interface TypeRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  statusText: string;
}

function TypeRow({ icon, title, subtitle, statusText }: TypeRowProps) {
  return (
    <button type="button" className="w-full flex items-center justify-between gap-3 py-3 px-4 border-b border-[#edf1f5] last:border-b-0 hover:bg-slate-50/30 text-left bg-transparent cursor-pointer">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="grid w-8 h-8 place-items-center rounded-full bg-[#f4f6f8] text-[#5c6a85] flex-none">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold text-[#07183f] leading-none">{title}</p>
          <p className="m-0 text-[10px] text-[#8f98a8] mt-1 leading-none truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-none">
        <span className="text-[11px] font-bold text-[#5c6a85]">{statusText}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </div>
    </button>
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

interface AgentNotificationsProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

export function AgentNotifications({ onBack, onNavigate }: AgentNotificationsProps) {
  const [prefEnabled, setPrefEnabled] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [push, setPush] = useState(true);

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-20 justify-start relative h-full overflow-hidden">
        
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Notifications</h1>
          
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

        {/* Scrollable container for Settings */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-4">
          
          {/* Profile Card */}
          <AgentProfileCard />

          {/* Section: Notification Preference */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Notification Preference</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <PreferenceRow
                showChevron={false}
                checked={prefEnabled}
                onChange={setPrefEnabled}
                title="Enable Notifications"
                subtitle="Receive notifications and alerts"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Notification Channels */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Notification Channels</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <PreferenceRow
                checked={inApp}
                onChange={setInApp}
                title="In-App Notifications"
                subtitle="Receive alerts within the app"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                }
              />
              <PreferenceRow
                checked={email}
                onChange={setEmail}
                title="Email Notifications"
                subtitle="Receive updates on your email"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#0aa6b4]">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
              />
              <PreferenceRow
                checked={sms}
                onChange={setSms}
                title="SMS Notifications"
                subtitle="Receive important alerts via SMS"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#7224e9]">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              <PreferenceRow
                checked={push}
                onChange={setPush}
                title="Push Notifications"
                subtitle="Receive push alerts on your device"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#e58000]">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Notification Types */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Notification Types</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <TypeRow
                title="Task Updates"
                subtitle="Alerts for task assignment, updates and changes"
                statusText="On"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#088d27]">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                }
              />
              <TypeRow
                title="Due Reminders"
                subtitle="Reminders for upcoming and overdue tasks"
                statusText="On"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#e58000]">
                    <path d="M6 3h12M6 21h12M8 3c0 4 2.2 6.2 4 9-1.8 2.8-4 5-4 9M16 3c0 4-2.2 6.2-4 9 1.8 2.8 4 5 4 9" />
                  </svg>
                }
              />
              <TypeRow
                title="Task Completion"
                subtitle="Notifications when a task is completed"
                statusText="On"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <TypeRow
                title="Escalations & Alerts"
                subtitle="Important alerts and escalation notifications"
                statusText="On"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#ee0f1a]">
                    <path d="m12 3 10 18H2L12 3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
              />
              <TypeRow
                title="Document Updates"
                subtitle="Alerts for document uploads and verifications"
                statusText="Off"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#7224e9]">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <TypeRow
                title="Announcements"
                subtitle="Important announcements and messages"
                statusText="Off"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#0aa6b4]">
                    <path d="M12 19c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2s2 .9 2 2v10c0 1.1-.9 2-2 2Z" />
                    <path d="M18 8h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3M6 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Footer Banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4] mt-0.5 flex-none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="m-0 text-[10px] text-[#1158d4] font-medium text-left leading-relaxed">
              <strong>Note:</strong> You can manage how and when you want to receive notifications.
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
