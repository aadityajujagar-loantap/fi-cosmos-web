import { useState } from "react";
import type { Step } from "../../../types";

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  valueRight?: string;
}

function DetailItem({ icon, label, value, subtitle, actionButton, valueRight }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3.5 py-3 px-4 border-b border-[#edf1f5] last:border-b-0">
      <div className="grid w-8 h-8 place-items-center rounded-full bg-[#edf5ff] text-[#1158d4] flex-none mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="m-0 text-[10px] font-bold text-[#8f98a8] leading-none">{label}</p>
        <div className="flex items-start justify-between gap-2 mt-1">
          <p className="m-0 text-xs font-bold text-[#07183f] leading-snug">{value}</p>
          {valueRight && <span className="text-xs font-bold text-[#1158d4] flex-none mt-0.5">{valueRight}</span>}
        </div>
        {subtitle && <p className="m-0 text-[10px] text-[#5c6a85] mt-1 leading-none">{subtitle}</p>}
      </div>
      {actionButton && <div className="flex-none self-center ml-2">{actionButton}</div>}
    </div>
  );
}

interface AgentTaskDetailsProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

export function AgentTaskDetails({ onBack, onNavigate }: AgentTaskDetailsProps) {
  const [isAccepted, setIsAccepted] = useState(() => {
    return localStorage.getItem("task_accepted_T123456") === "true";
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("Out of Area");
  const [customReason, setCustomReason] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  const triggerPopup = (msg: string) => {
    setPopupMsg(msg);
    setTimeout(() => setPopupMsg(""), 2000);
  };

  const handleAccept = () => {
    localStorage.setItem("task_accepted_T123456", "true");
    setIsAccepted(true);
    triggerPopup("Case accepted successfully!");
  };

  const handleRejectConfirm = () => {
    localStorage.setItem("task_rejected_T123456", "true");
    localStorage.removeItem("task_accepted_T123456");
    setShowRejectModal(false);
    triggerPopup("Case rejected successfully.");
    setTimeout(() => {
      onBack();
    }, 1500);
  };
  
  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
      {popupMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#07183f] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg transition-all animate-bounce">
          {popupMsg}
        </div>
      )}

      {showRejectModal && (
        <div className="absolute inset-0 bg-[#07183f]/60 backdrop-blur-sm z-40 flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl text-left flex flex-col gap-4 animate-scale-up">
            <h3 className="text-sm font-bold text-[#07183f] m-0">Reject Case Assignment</h3>
            <p className="m-0 text-[11px] text-[#5c6a85] leading-normal">
              Please specify the reason for rejecting case #T123456. This action is irreversible.
            </p>

            <div className="flex flex-col gap-2">
              {[
                "Out of Area",
                "Incorrect Customer Phone Number",
                "Customer Unavailable for Visit",
                "Duplicate Task Assignment",
                "Other Reason"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-bold text-[#07183f]">
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-[#1158d4]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {rejectReason === "Other Reason" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Type your rejection remarks..."
                className="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs font-bold placeholder-slate-400 focus:border-[#1158d4] outline-none"
              />
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                type="button"
                className="flex-1 bg-white border border-slate-200 text-[#5c6a85] h-10 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                type="button"
                className="flex-1 bg-red-600 text-white hover:bg-red-700 h-10 rounded-xl text-xs font-bold border-0 cursor-pointer"
              >
                Reject Case
              </button>
            </div>
          </div>
        </div>
      )}

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
          
          <h1 className="text-lg font-bold text-[#07183f]">Task Details</h1>
          
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
          
          {/* Title Row */}
          <div className="flex items-center justify-between border border-[#e6ebf1] rounded-[18px] bg-slate-50/50 p-4 shadow-sm w-full flex-none text-left">
            <div className="flex items-center gap-2">
              <span className="bg-[#fff0ef] text-[#ee0f1a] font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                HIGH
              </span>
              <h2 className="text-sm font-bold text-[#07183f]">Field Investigation</h2>
            </div>
            <span className="text-xs font-bold text-[#8f98a8]">#T123456</span>
          </div>

          {/* Details Card */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col w-full flex-none">
            <DetailItem
              label="Location"
              value="Pune, Maharashtra"
              valueRight="2.4 km"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2" />
                </svg>
              }
            />
            <DetailItem
              label="Scheduled Time"
              value="10:30 AM - 12:30 PM"
              subtitle="Today, 16 May 2025"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <DetailItem
              label="Customer Name"
              value="Amit Deshmukh"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <DetailItem
              label="Mobile Number"
              value="+91 98765 43210"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              }
              actionButton={
                <a
                  href="tel:+919876543210"
                  className="grid w-8 h-8 place-items-center rounded-full bg-[#ecfaef] text-[#088d27] hover:scale-105 transition-transform"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              }
            />
            <DetailItem
              label="Address"
              value="102, Sai Residency, Baner Road, Baner Road, Pune - 411045"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17" />
                </svg>
              }
              actionButton={
                <button
                  onClick={() => onNavigate?.("task-in-progress")}
                  type="button"
                  className="grid w-8 h-8 place-items-center rounded-full bg-[#edf5ff] text-[#1158d4] hover:scale-105 transition-transform border-0 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </button>
              }
            />
            <DetailItem
              label="Task Description"
              value="Visit customer location and verify the details. Capture photo and collect required information."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              }
            />
          </div>

          {/* Checklist Card */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm p-4 flex flex-col w-full flex-none text-left">
            <div className="flex items-center justify-between w-full border-b border-[#edf1f5] pb-3 mb-2">
              <h3 className="text-xs font-bold text-[#07183f]">Required Checklist</h3>
              <span className="text-[10px] font-bold text-[#8f98a8]">0/5 Completed</span>
            </div>
            
            <div className="flex flex-col">
              {[
                "Visit Customer Location",
                "Capture Customer Photo",
                "Verify Address",
                "Capture Documents",
                "Customer Signature"
              ].map((step, idx) => (
                <div key={step} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-none" />
                    <span className="font-bold text-[#5c6a85]">{idx + 1}. {step}</span>
                  </div>
                  <span className="bg-[#edf2f7] text-[#5c6a85] font-bold text-[9px] px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Floating Footer Shutter */}
        <div className="absolute bottom-4 left-5 right-5 z-20 w-[calc(100%-40px)] max-w-[390px] mx-auto flex items-center gap-3 flex-none">
          {isAccepted ? (
            <button
              onClick={() => onNavigate?.("task-in-progress")}
              type="button"
              className="w-full bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
            >
              <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 translate-x-[0.5px]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span>Start Task</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                type="button"
                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 h-12 rounded-[14px] font-bold text-sm flex items-center justify-center cursor-pointer shadow-sm"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                type="button"
                className="w-[65%] bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
              >
                Accept Case
              </button>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
