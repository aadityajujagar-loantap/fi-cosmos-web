import { useState } from "react";


interface AgentCapturePhotoProps {
  onBack: () => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

export function AgentCapturePhoto({
  onBack,
  completedStepsCount = 2,
  setCompletedStepsCount
}: AgentCapturePhotoProps) {
  const [flashActive, setFlashActive] = useState(false);
  const [photoCount, setPhotoCount] = useState(3);
  const [triggerFlashAnimation, setTriggerFlashAnimation] = useState(false);

  const handleCapture = () => {
    // Shutter Trigger
    setTriggerFlashAnimation(true);
    setTimeout(() => {
      setTriggerFlashAnimation(false);
      setPhotoCount((prev) => Math.min(prev + 1, 4));
    }, 450);
  };

  const handleUsePhoto = () => {
    if (setCompletedStepsCount && completedStepsCount < 2) {
      setCompletedStepsCount(2);
    }
    onBack();
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
      
      {/* Screen flash transition overlay */}
      {triggerFlashAnimation && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-out" style={{
          animation: "flashEffect 0.4s ease-out forwards"
        }} />
      )}
      
      <style>{`
        @keyframes flashEffect {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-4 justify-start relative h-full overflow-hidden">
        
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Capture Customer Photo</h1>
          
          <button
            type="button"
            className="absolute right-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50 cursor-pointer border-0 text-[#07183f]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </header>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-16">
          
          {/* Top Instruction Banner */}
          <div className="flex items-center gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff] text-left flex-none">
            <div className="grid w-8 h-8 place-items-center rounded-full bg-[#edf5ff] text-[#1158d4] flex-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Please capture clear photo</p>
              <p className="m-0 mt-0.5 font-medium text-[#5c6a85]">of the customer</p>
            </div>
          </div>

          {/* Camera Viewport Screen */}
          <div className="relative aspect-[4/3] w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner flex-none">
            
            {/* Simulated camera feed (avatar overlay) */}
            <svg viewBox="0 0 120 90" className="w-full h-full object-cover">
              {/* Camera background */}
              <rect width="120" height="90" fill="#2d3748" />
              {/* Office indoor background lines */}
              <rect x="10" y="10" width="40" height="50" fill="#4a5568" opacity="0.4" />
              <rect x="70" y="20" width="45" height="40" fill="#4a5568" opacity="0.4" />
              
              {/* Customer Avatar Vector */}
              <g className="translate-x-[15px] translate-y-0 scale-[0.75]">
                {/* Hair */}
                <path d="M50 20c-15 0-20 8-20 18h40c0-10-5-18-20-18z" fill="#0f172a" />
                {/* Neck */}
                <rect x="46" y="56" width="8" height="10" fill="#e29c7b" />
                {/* Face */}
                <circle cx="50" cy="40" r="18" fill="#f5af8e" />
                {/* Beard shadow */}
                <path d="M35 44c0 10 7 15 15 15s15-5 15-15c0-1 0-1-30 0z" fill="#475569" opacity="0.4" />
                {/* Eyes */}
                <circle cx="44" cy="38" r="2" fill="#0f172a" />
                <circle cx="56" cy="38" r="2" fill="#0f172a" />
                {/* Eyebrows */}
                <path d="M40 34c2-1 5 0 5 0" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M55 34c2-1-5 0-5 0" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                {/* Nose */}
                <path d="M50 37v6" stroke="#d48a66" strokeWidth="1.5" strokeLinecap="round" />
                {/* Mouth/Smile */}
                <path d="M46 48q4 3 8 0" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                {/* Shirt Collar */}
                <path d="M32 66 L50 78 L68 66 Z" fill="#1e3a8a" />
                <path d="M15 72c0-12 15-16 35-16s35 4 35 16v18H15z" fill="#1e40af" />
              </g>
            </svg>

            {/* Transparent camera brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />

            {/* Flash active display */}
            {flashActive && (
              <div className="absolute top-4 right-14 w-6 h-6 rounded-full bg-yellow-400 text-slate-900 grid place-items-center font-bold text-[9px] shadow animate-pulse">
                ⚡
              </div>
            )}
          </div>

          {/* Photo Tips Card */}
          <div className="flex items-start gap-2.5 w-full bg-[#f1fcf4] rounded-xl p-3 border border-[#d2fae1] text-left flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#088d27] mt-0.5 flex-none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-xs text-[#088d27]">
              <p className="m-0 font-bold">Photo Tips</p>
              <ul className="m-0 mt-1 pl-4 list-disc flex flex-col gap-1 leading-snug font-medium text-[#5c6a85]">
                <li>Ensure good lighting and clear visibility</li>
                <li>Customer's face should be clearly visible</li>
                <li>Avoid blur and backlight</li>
              </ul>
            </div>
          </div>

          {/* Camera controls panel */}
          <div className="flex items-center justify-around w-full py-2 flex-none">
            
            {/* Flash */}
            <button
              onClick={() => setFlashActive(!flashActive)}
              type="button"
              className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none`}
            >
              <div className={`grid w-10 h-10 place-items-center rounded-full border shadow-sm transition-colors ${
                flashActive ? "bg-yellow-100 border-yellow-300 text-yellow-600" : "bg-[#edf5ff] border-[#cbd5e1] text-[#1158d4]"
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#5c6a85]">Flash</span>
            </button>

            {/* Shutter capture button */}
            <button
              onClick={handleCapture}
              type="button"
              className="w-16 h-16 rounded-full border-4 border-[#1158d4] p-1 bg-white cursor-pointer hover:scale-105 active:scale-95 transition-transform outline-none"
            >
              <div className="w-full h-full rounded-full bg-[#1158d4]" />
            </button>

            {/* Flip Camera */}
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none"
            >
              <div className="grid w-10 h-10 place-items-center rounded-full bg-[#edf5ff] border-[#cbd5e1] text-[#1158d4] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#5c6a85]">Flip Camera</span>
            </button>
          </div>

          {/* Recently Captured Section */}
          <div className="flex flex-col text-left flex-none">
            <h2 className="text-xs font-bold text-[#5c6a85] mb-2 px-1">Recently Captured</h2>
            <div className="grid grid-cols-4 gap-2.5">
              
              {/* Photo 1 */}
              <div className="aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
                  <rect width="100" height="100" fill="#cbd5e1" />
                  <circle cx="50" cy="45" r="20" fill="#94a3b8" />
                  <path d="M20 90c0-12 12-20 30-20s30 8 30 20" fill="#475569" />
                </svg>
              </div>

              {/* Photo 2 */}
              {photoCount >= 2 && (
                <div className="aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
                    <rect width="100" height="100" fill="#cbd5e1" />
                    <circle cx="50" cy="45" r="20" fill="#94a3b8" />
                    <path d="M20 90c0-12 12-20 30-20s30 8 30 20" fill="#475569" />
                  </svg>
                </div>
              )}

              {/* Photo 3: Clipboard doc */}
              {photoCount >= 3 && (
                <div className="aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full text-[#7224e9]">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                </div>
              )}

              {/* Add More Slot */}
              <div
                onClick={handleCapture}
                className="aspect-square rounded-xl border-2 border-dashed border-[#cbdbe5] bg-[#f8fafc] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50"
              >
                <span className="text-xs font-bold text-[#1158d4]">+</span>
                <span className="text-[9px] font-bold text-[#1158d4]">Add More</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer buttons row */}
        <div className="absolute bottom-4 left-5 right-5 z-20 w-[calc(100%-40px)] max-w-[390px] mx-auto flex items-center gap-3 flex-none">
          <button
            onClick={onBack}
            type="button"
            className="flex-1 bg-white border border-[#1158d4] text-[#1158d4] hover:bg-slate-50 h-12 rounded-[14px] font-bold text-sm flex items-center justify-center cursor-pointer shadow-sm"
          >
            Retake
          </button>
          <button
            onClick={handleUsePhoto}
            type="button"
            className="w-[60%] bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
          >
            Use Photo
          </button>
        </div>

      </div>
    </section>
  );
}
