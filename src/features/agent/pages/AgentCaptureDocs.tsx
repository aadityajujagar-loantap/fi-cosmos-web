import { useState } from "react";
import type { Step } from "../../../types";

interface DocumentSlotProps {
  title: string;
  subtitle: string;
  required?: boolean;
  captured?: boolean;
  expanded?: boolean;
  mockups?: React.ReactNode[];
  onToggleExpand?: () => void;
  onRetake?: () => void;
}

function DocumentSlot({
  title,
  subtitle,
  required,
  captured,
  expanded = true,
  mockups = [],
  onToggleExpand,
  onRetake
}: DocumentSlotProps) {
  return (
    <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col text-left">
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#07183f]">{title}</h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              required ? "bg-[#edf5ff] text-[#1158d4]" : "bg-[#edf2f7] text-[#5c6a85]"
            }`}>
              {required ? "Required" : "Optional"}
            </span>
          </div>
          <p className="m-0 text-[10px] text-[#8f98a8] mt-1 leading-none truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-none">
          {captured ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#088d27]">
              <span>Captured</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-[#1158d4]">Add Document</span>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
            <path d={expanded ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-4 flex flex-col gap-3">
          {captured && mockups.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {mockups.map((mockup, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {mockup}
                  {/* Close trigger delete */}
                  <button type="button" className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-500/80 text-white flex items-center justify-center text-[9px] hover:bg-slate-700/80 border-0 cursor-pointer">
                    ×
                  </button>
                </div>
              ))}
              
              {/* Retake Camera Slot */}
              <div
                onClick={onRetake}
                className="aspect-[4/3] rounded-lg border-2 border-dashed border-[#cbdbe5] bg-[#f8fafc] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#1158d4]">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-[10px] font-bold text-[#1158d4]">Retake</span>
              </div>
            </div>
          ) : (
            <div
              onClick={onRetake}
              className="border-2 border-dashed border-[#cbdbe5] rounded-xl p-4 bg-[#f8fafc] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6 text-[#1158d4]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="font-bold text-xs text-[#1158d4]">Tap to capture or upload document</span>
              <span className="text-[9px] text-slate-400">JPG, PNG, PDF up to 5MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AgentCaptureDocsProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

export function AgentCaptureDocs({
  onBack,
  onNavigate,
  completedStepsCount = 2,
  setCompletedStepsCount
}: AgentCaptureDocsProps) {
  const [expandId, setExpandId] = useState(true);
  const [expandAddress, setExpandAddress] = useState(true);
  const [expandIncome, setExpandIncome] = useState(false);
  const [expandOther, setExpandOther] = useState(false);

  const handleSaveAndContinue = () => {
    if (setCompletedStepsCount && completedStepsCount < 4) {
      setCompletedStepsCount(4);
    }
    onBack();
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Capture Documents</h1>
          
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

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-16">
          
          {/* Top Instruction Banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff] text-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#1158d4] mt-0.5 flex-none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div className="text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Please capture clear and readable documents.</p>
              <p className="m-0 mt-0.5 font-medium">Ensure all corners are visible.</p>
            </div>
          </div>

          {/* Slot 1: Identity Proof */}
          <DocumentSlot
            title="1. Identity Proof"
            subtitle="Aadhaar Card / PAN Card / Voter ID / Passport"
            required
            captured
            expanded={expandId}
            onToggleExpand={() => setExpandId(!expandId)}
            onRetake={() => onNavigate?.("capture-photo")}
            mockups={[
              // Front Aadhaar Mock
              <svg key="front" viewBox="0 0 120 90" className="w-full h-full p-1.5 bg-white">
                <rect width="120" height="90" fill="#fcfdfe" rx="4" stroke="#cbd5e1" strokeWidth="0.5" />
                <rect x="2" y="2" width="116" height="6" fill="#ff9933" />
                <rect x="2" y="8" width="116" height="6" fill="#ffffff" />
                <rect x="2" y="14" width="116" height="6" fill="#128807" />
                {/* Photo */}
                <rect x="6" y="26" width="22" height="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="17" cy="36" r="5" fill="#94a3b8" />
                <path d="M8 50c0-6 4-9 9-9s9 3 9 9" fill="#475569" />
                {/* Details */}
                <rect x="34" y="26" width="40" height="3" fill="#cbd5e1" />
                <rect x="34" y="32" width="50" height="3" fill="#cbd5e1" />
                <rect x="34" y="38" width="30" height="3" fill="#cbd5e1" />
                <text x="34" y="58" fontSize="6.5" fontWeight="bold" fill="#07183f" fontFamily="sans-serif">
                  1234 5678 9012
                </text>
                <text x="12" y="78" fontSize="4.5" fill="#ee0f1a" fontFamily="sans-serif">
                  मेरा आधार, मेरी पहचान
                </text>
              </svg>,
              // Back Aadhaar Mock
              <svg key="back" viewBox="0 0 120 90" className="w-full h-full p-1.5 bg-white">
                <rect width="120" height="90" fill="#fcfdfe" rx="4" stroke="#cbd5e1" strokeWidth="0.5" />
                <rect x="4" y="6" width="60" height="3" fill="#cbd5e1" />
                <rect x="4" y="12" width="70" height="3" fill="#cbd5e1" />
                <rect x="4" y="18" width="50" height="3" fill="#cbd5e1" />
                <rect x="4" y="24" width="65" height="3" fill="#cbd5e1" />
                {/* QR Code */}
                <rect x="84" y="44" width="28" height="28" fill="#07183f" />
                <rect x="86" y="46" width="10" height="10" fill="#ffffff" />
                <rect x="100" y="46" width="10" height="10" fill="#ffffff" />
                <rect x="86" y="60" width="10" height="10" fill="#ffffff" />
                <rect x="88" y="48" width="6" height="6" fill="#07183f" />
                <rect x="102" y="48" width="6" height="6" fill="#07183f" />
                <rect x="88" y="62" width="6" height="6" fill="#07183f" />
              </svg>
            ]}
          />

          {/* Slot 2: Address Proof */}
          <DocumentSlot
            title="2. Address Proof"
            subtitle="Utility Bill / Bank Statement / Rent Agreement"
            required
            captured
            expanded={expandAddress}
            onToggleExpand={() => setExpandAddress(!expandAddress)}
            onRetake={() => onNavigate?.("capture-photo")}
            mockups={[
              // Electricity Bill Front Mock
              <svg key="billFront" viewBox="0 0 120 90" className="w-full h-full p-1.5 bg-white">
                <rect width="120" height="90" fill="#fafbfc" rx="4" stroke="#cbd5e1" strokeWidth="0.5" />
                <rect x="4" y="4" width="12" height="12" fill="#1158d4" rx="2" />
                <text x="20" y="10" fontSize="5" fontWeight="bold" fill="#1158d4" fontFamily="sans-serif">
                  MSEB BILL
                </text>
                <rect x="4" y="24" width="70" height="3" fill="#cbd5e1" />
                <rect x="4" y="32" width="80" height="3" fill="#cbd5e1" />
                <rect x="4" y="40" width="60" height="3" fill="#cbd5e1" />
                <rect x="4" y="48" width="90" height="3" fill="#cbd5e1" />
                <text x="4" y="76" fontSize="7" fontWeight="bold" fill="#07183f" fontFamily="sans-serif">
                  ₹ 1,280.00
                </text>
              </svg>,
              // Electricity Bill Back Mock
              <svg key="billBack" viewBox="0 0 120 90" className="w-full h-full p-1.5 bg-white">
                <rect width="120" height="90" fill="#fafbfc" rx="4" stroke="#cbd5e1" strokeWidth="0.5" />
                <rect x="4" y="8" width="60" height="3.5" fill="#cbd5e1" />
                <rect x="4" y="16" width="75" height="3.5" fill="#cbd5e1" />
                <rect x="4" y="24" width="50" height="3.5" fill="#cbd5e1" />
                {/* Barcode representation */}
                <rect x="4" y="52" width="75" height="15" fill="#0f172a" />
                {/* Slices of white */}
                <rect x="8" y="52" width="2" height="15" fill="#ffffff" />
                <rect x="14" y="52" width="3" height="15" fill="#ffffff" />
                <rect x="22" y="52" width="1" height="15" fill="#ffffff" />
                <rect x="28" y="52" width="4" height="15" fill="#ffffff" />
                <rect x="36" y="52" width="2" height="15" fill="#ffffff" />
                <rect x="44" y="52" width="3" height="15" fill="#ffffff" />
                <rect x="52" y="52" width="1" height="15" fill="#ffffff" />
                <rect x="60" y="52" width="4" height="15" fill="#ffffff" />
                <rect x="70" y="52" width="2" height="15" fill="#ffffff" />
              </svg>
            ]}
          />

          {/* Slot 3: Income Proof */}
          <DocumentSlot
            title="3. Income Proof"
            subtitle="Salary Slip / ITR / Bank Statement"
            expanded={expandIncome}
            onToggleExpand={() => setExpandIncome(!expandIncome)}
            onRetake={() => onNavigate?.("capture-photo")}
          />

          {/* Slot 4: Other Documents */}
          <DocumentSlot
            title="4. Other Documents"
            subtitle="Any other supporting document"
            expanded={expandOther}
            onToggleExpand={() => setExpandOther(!expandOther)}
            onRetake={() => onNavigate?.("capture-photo")}
          />

          {/* Yellow tips banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#fdfaf2] rounded-xl p-3 border border-[#faecd1] text-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#e58000] mt-0.5 flex-none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-xs text-[#7c5b16]">
              <p className="m-0 font-bold">Note:</p>
              <ul className="m-0 mt-1 pl-4 list-disc flex flex-col gap-1 leading-snug font-medium">
                <li>Ensure document is clear and all details are visible.</li>
                <li>Supported formats: JPG, PNG, PDF (Max 5MB each)</li>
              </ul>
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
            Cancel
          </button>
          <button
            onClick={handleSaveAndContinue}
            type="button"
            className="w-[65%] bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
          >
            Save & Continue
          </button>
        </div>

      </div>
    </section>
  );
}
