export function AdminPlaceholder() {
  return (
    <section className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans selection:bg-[#1158d4]/30 selection:text-white">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#1158d4]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-xl bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl text-center flex flex-col items-center gap-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-none">
            <div className="absolute inset-0 rounded-full border-[2.2px] border-[#1158d4] opacity-80" />
            <div className="absolute inset-1.5 rounded-full border-[2.2px] border-emerald-500 opacity-90" />
            <div className="absolute inset-3 rounded-full bg-[#1158d4]" />
          </div>
          <span className="text-sm font-bold tracking-[0.1em] text-slate-300 uppercase">fi-iFlow</span>
        </div>

        {/* Big locked console icon */}
        <div className="relative w-24 h-24 mt-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center justify-center text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12 text-[#1158d4]">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          {/* Padlock badge */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5 text-emerald-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Titles */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Admin Console Under Construction
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            This dashboard is reserved for web and desktop browser administration. The agent field operations module runs independently and securely.
          </p>
        </div>

        {/* Security Warning Panel */}
        <div className="w-full bg-slate-950/80 border border-slate-800/50 rounded-xl p-4 flex items-start gap-3 text-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5 text-emerald-500 mt-0.5 flex-none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div className="text-xs text-slate-300">
            <p className="font-bold text-white mb-0.5">Strict Path Segregation Enforced</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Access control rules prevent cross-route rendering. Admin panels are strictly isolated from the mobile `/agent` viewports.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 text-left text-[11px] text-slate-400 mt-2">
          <div className="bg-slate-800/20 border border-slate-800/30 rounded-lg p-2.5">
            <span className="block font-medium text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">System Version</span>
            <span className="font-bold text-slate-300">v1.0.0-beta</span>
          </div>
          <div className="bg-slate-800/20 border border-slate-800/30 rounded-lg p-2.5">
            <span className="block font-medium text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Routing Mode</span>
            <span className="font-bold text-emerald-500">Isolated Segregation</span>
          </div>
          <div className="bg-slate-800/20 border border-slate-800/30 rounded-lg p-2.5">
            <span className="block font-medium text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Endpoint Access</span>
            <span className="font-bold text-slate-300">/admin & /</span>
          </div>
          <div className="bg-slate-800/20 border border-slate-800/30 rounded-lg p-2.5">
            <span className="block font-medium text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Mobile Sync Status</span>
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>

        {/* Action Button to launch mobile view for ease of development */}
        <div className="flex flex-col gap-2 w-full mt-4">
          <a
            href="/agent"
            className="w-full bg-[#1158d4] text-white hover:bg-[#0f4ebc] active:scale-[0.99] transition h-11 rounded-xl text-xs font-bold flex items-center justify-center shadow-lg shadow-[#1158d4]/10 decoration-none select-none"
          >
            Launch Agent Mobile UI
          </a>
          <span className="text-[10px] text-slate-500 font-medium">
            Click above to load the mobile-optimized viewport `/agent` in this browser.
          </span>
        </div>

      </div>
    </section>
  );
}
