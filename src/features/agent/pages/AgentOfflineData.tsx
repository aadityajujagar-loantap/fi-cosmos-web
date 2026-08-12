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

interface OfflineRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeColorClass?: string;
  checked?: boolean;
  onToggleChange?: (checked: boolean) => void;
  showChevron?: boolean;
  actionButton?: React.ReactNode;
  iconColorClass?: string;
  iconBgClass?: string;
}

function OfflineRow({
  icon,
  title,
  subtitle,
  badgeText,
  badgeColorClass = "text-[#5c6a85]",
  checked,
  onToggleChange,
  showChevron = true,
  actionButton,
  iconColorClass = "text-[#1158d4]",
  iconBgClass = "bg-[#edf5ff]"
}: OfflineRowProps) {
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
        {onToggleChange !== undefined && checked !== undefined && (
          <Toggle checked={checked} onChange={onToggleChange} />
        )}
        {actionButton}
        {showChevron && !onToggleChange && !actionButton && (
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

interface AgentOfflineDataProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

export function AgentOfflineData({ onBack, onNavigate }: AgentOfflineDataProps) {
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [bgSync, setBgSync] = useState(true);

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
          
          <h1 className="text-lg font-bold text-[#07183f]">Offline Data</h1>
          
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
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-4">
          
          {/* Profile Card */}
          <AgentProfileCard />

          {/* Section: Offline Data Overview */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Offline Data Overview</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <OfflineRow
                showChevron={false}
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Offline Data Status"
                subtitle="Data available for offline access"
                badgeText="• Available"
                badgeColorClass="text-[#088d27]"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                }
              />
              <OfflineRow
                showChevron={false}
                title="Total Offline Data"
                subtitle="Data saved on this device"
                badgeText="256 MB"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                  </svg>
                }
              />
              <OfflineRow
                showChevron={false}
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Last Sync"
                subtitle="When data was last synced"
                badgeText="Today, 08:30 AM"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <OfflineRow
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                title="Pending Sync"
                subtitle="Data waiting to be synced"
                badgeText="12.4 MB"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="12" cy="15" r="3" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Section: Storage & Management */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Storage & Management</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <OfflineRow
                title="Data Categories"
                subtitle="Manage categories available offline"
                badgeText="5 Categories"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              
              {/* Storage Used Row with Inline Progress Bar */}
              <div className="w-full flex items-center justify-between gap-3 py-3 px-4 border-b border-[#edf1f5] last:border-b-0">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="grid w-8 h-8 place-items-center rounded-full bg-[#f8f5ff] text-[#7224e9] flex-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-xs font-bold text-[#07183f] leading-none">Storage Used</p>
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                      <span className="text-[10px] text-[#8f98a8] leading-none flex-none">Space used by offline data</span>
                      <div className="h-1.5 bg-[#edf2f7] rounded-full overflow-hidden flex-1 min-w-[50px] max-w-[120px]">
                        <div className="h-full bg-[#1158d4] w-[12%] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-none text-right">
                  <span className="text-xs font-bold text-[#07183f]">256 MB / 2 GB</span>
                  <span className="text-[10px] font-bold text-[#8f98a8]">12%</span>
                </div>
              </div>

              <OfflineRow
                iconColorClass="text-[#ee0f1a]"
                iconBgClass="bg-[#fff0ef]"
                title="Clear Offline Data"
                subtitle="Remove all offline data from this device"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
              />

              {/* Warning note banner */}
              <div className="p-3 bg-[#fbfdfb] border-t border-[#edf1f5] flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4] mt-0.5 flex-none">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="m-0 text-[10px] text-[#5c6a85] font-medium text-left leading-relaxed">
                  <strong>Note:</strong> Clearing offline data will remove all downloaded information. You will need an internet connection to download it again.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Sync Settings */}
          <div>
            <h2 className="text-xs font-bold text-[#5c6a85] text-left mb-2 px-1">Sync Settings</h2>
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col">
              <OfflineRow
                showChevron={false}
                iconColorClass="text-[#088d27]"
                iconBgClass="bg-[#ecfaef]"
                title="Auto Sync When Online"
                subtitle="Automatically sync data when internet is available"
                checked={autoSync}
                onToggleChange={setAutoSync}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <circle cx="12" cy="20" r="1" fill="currentColor" />
                  </svg>
                }
              />
              <OfflineRow
                showChevron={false}
                iconColorClass="text-[#7224e9]"
                iconBgClass="bg-[#f8f5ff]"
                title="Sync Only on Wi-Fi"
                subtitle="Sync data only when connected to Wi-Fi"
                checked={wifiOnly}
                onToggleChange={setWifiOnly}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                }
              />
              <OfflineRow
                showChevron={false}
                iconColorClass="text-[#e58000]"
                iconBgClass="bg-[#fff8eb]"
                title="Background Sync"
                subtitle="Allow app to sync in the background"
                checked={bgSync}
                onToggleChange={setBgSync}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                }
              />
              <OfflineRow
                showChevron={false}
                title="Manual Sync"
                subtitle="Sync pending data now"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                }
                actionButton={
                  <button
                    type="button"
                    className="border border-[#1158d4] text-[#1158d4] bg-white hover:bg-slate-50 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    Sync Now
                  </button>
                }
              />
            </div>
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
