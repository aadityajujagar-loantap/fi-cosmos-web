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

interface SecurityRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  checked?: boolean;
  onToggleChange?: (checked: boolean) => void;
  iconColorClass?: string;
  iconBgClass?: string;
  badgeColorClass?: string;
}

function SecurityRow({
  icon,
  title,
  subtitle,
  badgeText,
  checked,
  onToggleChange,
  iconColorClass = "text-[#1158d4]",
  iconBgClass = "bg-[#edf5ff]",
  badgeColorClass = "text-[#5c6a85]"
}: SecurityRowProps) {
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
        {badgeText && <span className={`text-[11px] font-bold ${badgeColorClass}`}>{badgeText}</span>}
        {onToggleChange !== undefined && checked !== undefined ? (
          <Toggle checked={checked} onChange={onToggleChange} />
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

interface AgentPrivacySecurityProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

export function AgentPrivacySecurity({ onBack, onNavigate }: AgentPrivacySecurityProps) {
  const [biometric, setBiometric] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Privacy & Security</h1>
          
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

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-28">
          
          {/* Profile Summary Card */}
          <AgentProfileCard />

          {/* Section: Account Security */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Account Security</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SecurityRow
                title="Change Password"
                subtitle="Update your account password"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                badgeColorClass="text-[#088d27]"
                title="PIN / App Lock"
                subtitle="Set PIN to protect app access"
                badgeText="Enabled"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Biometric Login"
                subtitle="Use fingerprint or face ID to login"
                checked={biometric}
                onToggleChange={setBiometric}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 2a10 10 0 0 0-8 8.4" />
                    <path d="M8 6a10 10 0 0 1 8 0" />
                    <path d="M16 10a8 8 0 0 0-8-8" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Manage Devices"
                subtitle="View and manage devices logged in to your account"
                badgeText="2 Devices"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Privacy Settings */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Privacy Settings</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SecurityRow
                title="Profile Visibility"
                subtitle="Choose who can view your profile information"
                badgeText="Only Me"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                title="Data Sharing"
                subtitle="Control how your data is shared"
                badgeText="Limited"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Activity Status"
                subtitle="Show your active status to others"
                checked={activityStatus}
                onToggleChange={setActivityStatus}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Location Sharing"
                subtitle="Allow app to access your location"
                badgeText="While Using"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Data & Permissions */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Data & Permissions</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <SecurityRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                title="Download My Data"
                subtitle="Download a copy of your personal data"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#ee0f1a]"
                iconBgClass="bg-[#fff0ef]"
                title="Clear Personal Data"
                subtitle="Clear your personal data from the app"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
              />
              <SecurityRow
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="App Permissions"
                subtitle="Manage app permissions"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <polyline points="9 11 12 14 22 4" />
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
              <strong>Note:</strong> We take your privacy and security seriously. Your data is protected and will never be shared without your consent.
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
