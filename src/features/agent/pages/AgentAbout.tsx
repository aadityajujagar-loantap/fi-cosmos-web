import { useState } from "react";

interface AgentAboutProps {
  onBack: () => void;
}

const panels = {
  privacy: {
    title: "Privacy Policy",
    body: "FieldOps stores only task, profile, location and verification data needed for field operations. Sensitive captures remain tied to assigned task IDs.",
  },
  terms: {
    title: "Terms",
    body: "This agent app is intended for authorized operational use. Actions performed in the app are logged for audit and task quality review.",
  },
  licenses: {
    title: "Licenses",
    body: "Map data uses OpenStreetMap contributors. UI assets, fonts and app code are bundled for the FieldOps demonstration workspace.",
  },
  diagnostics: {
    title: "Diagnostics",
    body: "All core UI routes are available. Local storage is enabled, offline queue is writable, and OpenStreetMap tiles are configured.",
  },
};

type PanelKey = keyof typeof panels;

export function AgentAbout({ onBack }: AgentAboutProps) {
  const [activePanel, setActivePanel] = useState<PanelKey>("diagnostics");
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  const panel = panels[activePanel];

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f]">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
        <header className="relative flex h-12 flex-none items-center justify-center">
          <button onClick={onBack} type="button" aria-label="Back" className="absolute left-0 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M15 5 8 12l7 7M9 12h11" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">About FieldOps</h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <section className="mt-3 rounded-[22px] border border-[#d3e5fe] bg-gradient-to-r from-[#f5f9ff] to-[#edf5ff] p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-[#1158d4] shadow-sm">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" aria-hidden="true">
                <path d="M4 11.4 12 4l8 7.4V21h-6v-5.5h-4V21H4z" />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-none"><span className="text-[#16469d]">Field</span><span className="text-[#34a853]">Ops</span></h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">Field operations, verification tasks and customer visits in one secure mobile workspace.</p>
          </section>

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold">App Information</h2>
            <div className="mt-3 grid gap-2 text-xs">
              {[
                ["Version", "2.3.0"],
                ["Build", "45"],
                ["Environment", "Production"],
                ["Last Sync", "Today, 09:38 AM"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3 py-2.5">
                  <span className="font-medium text-[#5c6a85]">{label}</span>
                  <strong className="text-[#07183f]">{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold">What FieldOps Covers</h2>
            <div className="mt-3 grid gap-2">
              {["Task assignment and route planning", "Offline-ready field verification", "Document and signature capture", "Secure profile and notification settings"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-[#f7faff] px-3 py-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ecfaef] text-[#088d27]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
                      <path d="m7 12 3 3 7-7" />
                    </svg>
                  </span>
                  <span className="text-xs font-bold text-[#07183f]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3">
            {([
              ["privacy", "Privacy Policy"],
              ["terms", "Terms"],
              ["licenses", "Licenses"],
              ["diagnostics", "Diagnostics"],
            ] as Array<[PanelKey, string]>).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                type="button"
                className={`h-11 rounded-xl border text-xs font-bold ${activePanel === key ? "border-[#1158d4] bg-[#f4f8ff] text-[#1158d4]" : "border-[#d8e0eb] bg-white text-[#07183f]"}`}
              >
                {label}
              </button>
            ))}
          </section>

          <section className="mt-4 rounded-[18px] border border-[#d8e6ff] bg-[#f4f8ff] p-4">
            <h2 className="text-sm font-bold text-[#07183f]">{panel.title}</h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">{panel.body}</p>
            {activePanel === "diagnostics" ? (
              <button onClick={() => setDiagnosticsRun(true)} type="button" className="mt-3 h-10 w-full rounded-xl bg-[#1158d4] text-xs font-bold text-white">
                {diagnosticsRun ? "Diagnostics Passed" : "Run Diagnostics"}
              </button>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
