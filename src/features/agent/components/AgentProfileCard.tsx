export function ProfileAvatar() {
  return (
    <div className="relative w-16 h-16 flex-none rounded-full overflow-visible">
      {/* Background Circle */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Sky blue soft background */}
        <circle cx="50" cy="50" r="50" fill="#f0f7ff" />
        
        {/* Face skin */}
        <circle cx="50" cy="46" r="18" fill="#fcd4b0" />
        
        {/* Ears */}
        <circle cx="31" cy="46" r="4.5" fill="#fcd4b0" />
        <circle cx="69" cy="46" r="4.5" fill="#fcd4b0" />
        
        {/* Hair */}
        <path d="M32,40 C32,28 68,28 68,40" fill="#2d3748" />
        
        {/* Blue Cap */}
        <path d="M 32,38 C 32,24 68,24 68,38 Z" fill="#135bd7" />
        <path d="M 28,34 C 42,26 58,26 72,34 L 68,38 L 32,38 Z" fill="#1c6aff" />
        <path d="M 40,38 L 60,38 L 50,30 Z" fill="#102f6c" />
        
        {/* Eyes */}
        <circle cx="44" cy="45" r="1.5" fill="#2d3748" />
        <circle cx="56" cy="45" r="1.5" fill="#2d3748" />
        
        {/* Eyebrows */}
        <path d="M 40,41 Q 44,39 48,41" stroke="#2d3748" strokeWidth="1" fill="none" />
        <path d="M 52,41 Q 56,39 60,41" stroke="#2d3748" strokeWidth="1" fill="none" />
        
        {/* Smile */}
        <path d="M 46,52 Q 50,55 54,52" stroke="#2d3748" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        
        {/* Neck */}
        <rect x="46" y="58" width="8" height="10" fill="#fcd4b0" />
        
        {/* Blue Polo Shirt */}
        <path d="M 26,72 C 26,62 38,62 50,62 C 62,62 74,62 74,72 L 74,100 L 26,100 Z" fill="#135bd7" />
        
        {/* Polo Collar */}
        <path d="M 36,62 L 50,72 L 64,62 L 50,62 Z" fill="#102f6c" />
        <path d="M 44,62 L 50,72 L 56,62 Z" fill="#fcd4b0" />
        
        {/* Green Lanyard */}
        <path d="M 43,62 L 49,84 M 57,62 L 51,84" stroke="#34a853" strokeWidth="1.8" fill="none" />
        
        {/* Gold Badge Card */}
        <rect x="44" y="80" width="12" height="15" rx="1" fill="#f1c40f" />
        <rect x="46" y="83" width="8" height="9" fill="#ffffff" />
        <line x1="47" y1="86" x2="53" y2="86" stroke="#7f8c8d" strokeWidth="1" />
        <line x1="47" y1="89" x2="53" y2="89" stroke="#7f8c8d" strokeWidth="1" />
      </svg>
      {/* Camera badge */}
      <span className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-[#d5dbe5] rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#1158d4]">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </span>
    </div>
  );
}

interface ProfileCardProps {
  showArrow?: boolean;
  onClick?: () => void;
}

export function AgentProfileCard({ showArrow, onClick }: ProfileCardProps) {
  return (
    <article
      onClick={onClick}
      className={`mt-4 p-4 rounded-[18px] border border-[#d3e5fe] bg-gradient-to-r from-[#f5f9ff] to-[#edf5ff] flex items-center justify-between gap-3 w-full flex-none ${
        onClick ? "cursor-pointer hover:from-[#edf5ff] hover:to-[#e1eeff] transition-all" : ""
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <ProfileAvatar />
        <div className="min-w-0 text-left">
          <h2 className="text-sm font-bold text-[#07183f]">Amit Deshmukh</h2>
          <span className="mt-1 inline-block bg-[#e6f0ff] text-[#135bd7] text-[10px] font-bold px-2 py-0.5 rounded-md">
            Field Executive
          </span>
          <div className="mt-2 flex flex-col gap-1 text-[10px] text-[#5c6a85] font-medium leading-none">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#135bd7] flex-none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#135bd7] flex-none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="truncate text-slate-600">amit.deshmukh@fieldops.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#135bd7] flex-none">
                <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2" />
              </svg>
              <span>Pune, Maharashtra</span>
            </div>
          </div>
        </div>
      </div>
      {showArrow && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400 flex-none">
          <path d="m9 5 7 7-7 7" />
        </svg>
      )}
    </article>
  );
}
