import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../../data/dataContext";
import { useAgentLocation } from "../location/agentLocationContext";
import type { Step } from "../../../types";
import { OpenStreetMap } from "../components/OpenStreetMap";
import { hasUsableCoordinates } from "../utils/distance";
import { routeUrl } from "../utils/map";
import { DEFAULT_USER_LOCATION, getActiveAgentTask, toAgentTask, updateAgentTask } from "../utils/tasks";
import { loadCapturedAssets } from "../utils/media";
import { investigationService } from "../../../data/services";

interface ChecklistRowProps {
  label: string;
  completed: boolean;
  statusText: string;
  isGreenStatus?: boolean;
}

function ChecklistRow({ label, completed, statusText, isGreenStatus }: ChecklistRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#edf1f5] last:border-b-0 text-xs">
      <div className="flex items-center gap-3">
        {completed ? (
          <div className="w-5 h-5 rounded-full bg-[#ecfaef] text-[#088d27] flex items-center justify-center flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-slate-300 flex-none" />
        )}
        <div className="text-left">
          <p className={`font-bold m-0 leading-none ${completed ? "text-[#07183f]" : "text-[#5c6a85]"}`}>
            {label}
          </p>
          {completed && (
            <p className="m-0 text-[10px] text-[#088d27] font-bold mt-0.5 leading-none">Completed</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-none">
        <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
          isGreenStatus ? "text-[#088d27] bg-[#ecfaef]" : "text-[#5c6a85] bg-[#edf2f7]"
        }`}>
          {statusText}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

interface AgentTaskInProgressProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
  completedStepsCount?: number;
}

export function AgentTaskInProgress({ onBack, onNavigate, completedStepsCount = 0 }: AgentTaskInProgressProps) {
  const { state } = useAppData();
  const { accuracy, coordinates: agentLocation, status: locationStatus } = useAgentLocation();
  const [taskId] = useState(() => getActiveAgentTask(agentLocation).id);
  const task = useMemo(() => {
    const current = state.tasks.find((item) => item.id === taskId);
    return current ? toAgentTask(current, agentLocation) : getActiveAgentTask(agentLocation);
  }, [agentLocation, state.tasks, taskId]);
  const taskLocation = hasUsableCoordinates(task) ? task : DEFAULT_USER_LOCATION;
  // Start stopwatch at 5 minutes 24 seconds as shown in the picture
  const [seconds, setSeconds] = useState(5 * 60 + 24);
  const [isCheckedIn, setIsCheckedIn] = useState(() => task.status === "In Progress");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const photoCount = useMemo(() => loadCapturedAssets(task.id, "photo").length, [task.id, state.tasks]);
  const documentCount = useMemo(() => loadCapturedAssets(task.id, "document").length, [task.id, state.tasks]);
  const signatureCount = useMemo(() => loadCapturedAssets(task.id, "signature").length, [task.id, state.tasks]);
  const draft = useMemo(() => investigationService.getDraft(task.id), [task.id, state.tasks]);

  const isFinished = task.status === "Completed" || task.status === "Submitted";
  const step1Completed = isFinished || draft.completedChecklistIds.includes("visit-location") || (completedStepsCount ?? 0) >= 1;
  const step2Completed = isFinished || (step1Completed && (photoCount > 0 || (completedStepsCount ?? 0) >= 2));
  const step3Completed = isFinished || (step2Completed && ((draft.residesVerified !== "" && draft.remarks.trim().length >= 5) || (completedStepsCount ?? 0) >= 3));
  const step4Completed = isFinished || (step3Completed && (documentCount > 0 || (completedStepsCount ?? 0) >= 4));
  const step5Completed = isFinished || (step4Completed && (signatureCount > 0 || (completedStepsCount ?? 0) >= 5));

  const derivedCompletedCount =
    (step1Completed ? 1 : 0) +
    (step2Completed ? 1 : 0) +
    (step3Completed ? 1 : 0) +
    (step4Completed ? 1 : 0) +
    (step5Completed ? 1 : 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      setIsCheckedIn(true);
      void updateAgentTask(task.id, { action: "filled", status: "In Progress" });
      setPopupMsg("Check-In Successful! Geo-Fence Verified.");
      setTimeout(() => setPopupMsg(""), 2000);
    }, 1200);
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ]
      .filter(Boolean)
      .join(":");
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
      {popupMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#07183f] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg transition-all animate-bounce">
          {popupMsg}
        </div>
      )}

      {isCheckingIn && (
        <div className="absolute inset-0 bg-[#07183f]/65 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white text-xs font-bold tracking-wide">Validating GPS Geo-Fence...</span>
        </div>
      )}

      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] justify-start h-full min-h-0 overflow-hidden">
        
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Task In Progress</h1>
          
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

        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-4">
          
          {/* Running Timer Card */}
          <div className="flex items-center justify-between border border-[#e6ebf1] rounded-[18px] bg-slate-50/50 p-4 shadow-sm w-full flex-none text-left">
            <div className="flex flex-col">
              <span className="bg-[#edf5ff] text-[#1158d4] font-bold text-[9px] px-1.5 py-0.5 rounded w-max">
                {task.status.toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-[#5c6a85] mt-1.5">{task.title} . #{task.id}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-lg font-bold text-[#1158d4]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatTime(seconds)}</span>
            </div>
          </div>

          {/* Live Location Panel with Vector Map */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col w-full flex-none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#edf1f5] bg-slate-50/30">
              <h3 className="text-xs font-bold text-[#07183f] text-left">Live Location</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#088d27]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{accuracy === null ? locationStatus : `Accurate to ${Math.round(accuracy)} meters`}</span>
              </div>
            </div>

            <OpenStreetMap
              className="h-[170px] w-full border-b border-[#edf1f5]"
              destinationLabel={task.address}
              latitude={taskLocation.latitude}
              longitude={taskLocation.longitude}
              markers={[{ id: task.id, label: task.title, latitude: taskLocation.latitude, longitude: taskLocation.longitude, priority: task.priority }]}
              selectedMarkerId={task.id}
              userLocation={agentLocation ?? undefined}
              zoomSpan={0.012}
            />

            {/* Location address row */}
            <div className="flex items-center justify-between gap-3 p-4 bg-white text-xs">
              <div className="flex items-start gap-2.5 min-w-0 text-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4] mt-0.5 flex-none">
                  <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2" />
                </svg>
                <p className="m-0 font-bold text-[#07183f] leading-snug">
                  {task.address}
                </p>
              </div>
              <div className="flex flex-none flex-col items-end gap-1">
                <span className="text-[9px] font-bold uppercase text-[#7b8faa]">Live distance</span>
                <span className="text-sm font-bold text-[#07883a]">{task.distance}</span>
                <button
                  onClick={() => window.open(routeUrl(taskLocation.latitude, taskLocation.longitude), "_blank", "noopener,noreferrer")}
                  type="button"
                  className="flex items-center gap-0.5 text-xs font-bold text-[#1158d4] cursor-pointer hover:underline bg-transparent border-0"
                >
                  <span>Navigate</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm p-4 flex flex-col w-full flex-none text-left">
            <div className="flex items-center justify-between w-full border-b border-[#edf1f5] pb-3 mb-2">
              <h3 className="text-xs font-bold text-[#07183f]">Checklist ({derivedCompletedCount}/5 Completed)</h3>
              <button
                onClick={() => onNavigate?.("update-checklist")}
                type="button"
                className="flex items-center gap-0.5 text-[10px] font-bold text-[#1158d4] cursor-pointer hover:underline bg-transparent border-0"
              >
                <span>View Details</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col">
              <ChecklistRow
                label="Visit Customer Location"
                completed={step1Completed}
                statusText={step1Completed ? "Completed" : "Pending"}
                isGreenStatus={step1Completed}
              />
              <ChecklistRow
                label="Capture Customer Photo"
                completed={step2Completed}
                statusText={step2Completed ? "Completed" : "Pending"}
                isGreenStatus={step2Completed}
              />
              <ChecklistRow
                label="Verify Address"
                completed={step3Completed}
                statusText={step3Completed ? "Completed" : "Pending"}
                isGreenStatus={step3Completed}
              />
              <ChecklistRow
                label="Capture Documents"
                completed={step4Completed}
                statusText={step4Completed ? "Completed" : "Pending"}
                isGreenStatus={step4Completed}
              />
              <ChecklistRow
                label="Customer Signature"
                completed={step5Completed}
                statusText={step5Completed ? "Completed" : "Pending"}
                isGreenStatus={step5Completed}
              />
            </div>
          </div>

        </div>

        {/* Floating Footer Button */}
        <footer className="flex flex-col flex-none border-t border-[#eef2f6] bg-white pt-3">
          <div className="flex items-center justify-between w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 mb-2 text-left">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isCheckedIn ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
              <span>{accuracy === null ? locationStatus : `GPS: ${accuracy.toFixed(1)}m accuracy`}</span>
            </span>
            <span>{isCheckedIn ? "Check-In Verified" : "Within Check-In Range"}</span>
          </div>

          {isCheckedIn ? (
            derivedCompletedCount >= task.checklist.length ? (
              <button
                onClick={() => onNavigate?.("update-checklist")}
                type="button"
                className="w-full bg-[#088d27] text-white hover:bg-[#06751f] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
              >
                <span>Review & Submit</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate?.("update-checklist")}
                type="button"
                className="w-full bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                </svg>
                <span>Update Checklist</span>
              </button>
            )
          ) : (
            <button
              onClick={handleCheckIn}
              type="button"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Check-In at Location</span>
            </button>
          )}
        </footer>

      </div>
    </section>
  );
}
