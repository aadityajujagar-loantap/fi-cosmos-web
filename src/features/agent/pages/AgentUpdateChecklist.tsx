import { useState, useEffect } from "react";
import type { Step } from "../../../types";

interface AgentUpdateChecklistProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

export function AgentUpdateChecklist({
  onBack,
  onNavigate,
  completedStepsCount = 2,
  setCompletedStepsCount
}: AgentUpdateChecklistProps) {
  const [notes, setNotes] = useState("");
  const [step3Completed, setStep3Completed] = useState(completedStepsCount >= 3);
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);

  // Questionnaire state variables
  const [residesVerified, setResidesVerified] = useState<string | null>(null);
  const [homeOwnership, setHomeOwnership] = useState("Owned");
  const [stayDuration, setStayDuration] = useState("1-3 Years");

  // Voice recording state variables
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceFile, setVoiceFile] = useState<{ name: string; duration: number } | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Recording Timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [isRecording]);

  // Audio Playback Simulation
  useEffect(() => {
    if (!isPlayingVoice) return;
    const playTimer = window.setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingVoice(false);
          return 0;
        }
        return prev + 12.5; // Ticks up to 100% in 8 ticks
      });
    }, 1000);
    return () => {
      window.clearInterval(playTimer);
    };
  }, [isPlayingVoice]);

  const handleStartRecord = () => {
    setRecordingSeconds(0);
    setIsRecording(true);
    setVoiceFile(null);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setVoiceFile({
      name: `voice_remarks_${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '')}.wav`,
      duration: Math.max(recordingSeconds, 3)
    });
    setStep3Completed(true);
    if (setCompletedStepsCount && completedStepsCount < 3) {
      setCompletedStepsCount(3);
    }
  };

  const handleDeleteVoice = () => {
    setVoiceFile(null);
    setIsPlayingVoice(false);
    setPlaybackProgress(0);
  };

  const handleVoicePlayToggle = () => {
    if (!isPlayingVoice) {
      setPlaybackProgress(0);
    }
    setIsPlayingVoice((prev) => !prev);
  };

  // Derive completed percentage
  const completedCount =
    (completedStepsCount >= 1 ? 1 : 0) +
    (completedStepsCount >= 2 ? 1 : 0) +
    (step3Completed ? 1 : 0) +
    (completedStepsCount >= 4 ? 1 : 0) +
    (completedStepsCount >= 5 ? 1 : 0);

  const progressPercent = Math.round((completedCount / 5) * 100);

  const handleUploadClick = () => {
    // Simulate image upload
    setUploadedProof("address_proof_uploaded.png");
    setStep3Completed(true);
    if (setCompletedStepsCount && completedStepsCount < 3) {
      setCompletedStepsCount(3);
    }
  };

  const handleSaveAndContinue = () => {
    if (completedStepsCount < 5) {
      onBack();
    } else {
      // Completed all workflow steps! Go to My Tasks or History.
      onNavigate?.("my-tasks");
    }
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
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
          
          <h1 className="text-lg font-bold text-[#07183f]">Update Checklist</h1>
          
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

        {/* Scrollable Checklist */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-16">
          
          {/* Progress Card */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white p-4 shadow-sm flex flex-col w-full flex-none text-left">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#07183f]">Checklist Progress</span>
              <span className="text-xs font-bold text-[#1158d4]">{progressPercent}%</span>
            </div>
            <div className="flex items-center justify-between w-full mt-1.5 text-[10px] text-[#8f98a8]">
              <span className="font-bold">{completedCount}/5 Completed</span>
              <div className="h-1.5 bg-[#edf2f7] rounded-full overflow-hidden flex-1 ml-4">
                <div
                  className="h-full bg-[#1158d4] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items Accordions */}
          <div className="flex flex-col gap-3.5 relative">
            
            {/* Timeline connector line */}
            <div className="absolute left-[24px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-[#e2e8f0] z-0" />

            {/* Step 1: Visit Location */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#ecfaef] text-[#088d27] flex items-center justify-center flex-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">1. Visit Customer Location</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#ecfaef] text-[#088d27] font-bold text-[9px] px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#088d27]">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Completed at 10:25 AM, 16 May 2025</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400 mt-0.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Visited the location and verified the address.</span>
                </div>
              </div>
            </div>

            {/* Step 2: Capture Photo */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => onNavigate?.("capture-photo")}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#ecfaef] text-[#088d27] flex items-center justify-center flex-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">2. Capture Customer Photo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#ecfaef] text-[#088d27] font-bold text-[9px] px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#088d27]">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3 relative">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Completed at 10:28 AM, 16 May 2025</span>
                </div>
                
                <div className="flex items-center gap-3.5 mt-1.5">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    {/* Inline vector avatar preview */}
                    <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
                      <rect width="100" height="100" fill="#f1f5f9" />
                      <circle cx="50" cy="42" r="22" fill="#94a3b8" />
                      <path d="M15 88c0-18 15-28 35-28s35 10 35 28" fill="#475569" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="m-0 text-xs font-bold text-[#1158d4]">1 Photo Captured</p>
                    <p className="m-0 text-[10px] text-[#8f98a8] mt-0.5">Tap to view</p>
                  </div>
                </div>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400 absolute right-4 bottom-8">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 3: Verify Address */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#1158d4] text-white flex items-center justify-center flex-none font-bold text-[10px]">
                    3
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">3. Verify Address</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step3Completed ? "bg-[#ecfaef] text-[#088d27]" : "bg-[#edf5ff] text-[#1158d4]"
                  }`}>
                    {step3Completed ? "Completed" : "In Progress"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#1158d4]">
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </div>
              </div>
              <div className="px-4 pb-4 pl-12 flex flex-col gap-3.5 text-xs text-[#5c6a85] border-t border-slate-100 pt-3 bg-white">
                <p className="m-0 text-xs font-bold text-[#5c6a85]">
                  Please verify the address details with the customer.
                </p>

                {/* 1. Dynamic Verification Questionnaire */}
                <div className="border border-slate-100 rounded-xl p-3 flex flex-col gap-3 bg-slate-50/50">
                  <h4 className="text-[10px] font-bold text-[#07183f] uppercase tracking-wider m-0">Verification Questionnaire</h4>
                  
                  {/* Q1: Resides Verified */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8f98a8]">Does the customer reside at this address?</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Yes", "No", "Moved"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setResidesVerified(opt);
                            setStep3Completed(true);
                            if (setCompletedStepsCount && completedStepsCount < 3) {
                              setCompletedStepsCount(3);
                            }
                          }}
                          type="button"
                          className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            residesVerified === opt
                              ? "bg-[#edf5ff] border-[#1158d4] text-[#1158d4]"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Home Ownership */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#8f98a8]">Home Ownership Type</label>
                    <select
                      value={homeOwnership}
                      onChange={(e) => setHomeOwnership(e.target.value)}
                      className="w-full h-8 px-2 border border-slate-200 rounded-lg text-[10px] font-bold text-[#07183f] outline-none focus:border-[#1158d4] bg-white cursor-pointer"
                    >
                      <option value="Owned">Owned</option>
                      <option value="Rented">Rented</option>
                      <option value="Parent's House">Parent's House</option>
                      <option value="Company Provided">Company Provided</option>
                    </select>
                  </div>

                  {/* Q3: Stay Duration */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#8f98a8]">Approximate Stay Duration</label>
                    <select
                      value={stayDuration}
                      onChange={(e) => setStayDuration(e.target.value)}
                      className="w-full h-8 px-2 border border-slate-200 rounded-lg text-[10px] font-bold text-[#07183f] outline-none focus:border-[#1158d4] bg-white cursor-pointer"
                    >
                      <option value="< 1 Year">&lt; 1 Year</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                </div>

                {/* 2. Voice Remarks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8f98a8]">Voice Remarks (Required)</label>
                  
                  {isRecording ? (
                    /* Active Recording Panel */
                    <div className="border border-red-200 rounded-xl p-3 bg-red-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-red-600">Recording...</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                          {String(recordingSeconds % 60).padStart(2, "0")}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleStopRecord}
                        type="button"
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center border-0 cursor-pointer shadow"
                      >
                        {/* Stop icon */}
                        <rect width="8" height="8" fill="white" className="w-2.5 h-2.5 rounded-sm" />
                      </button>
                    </div>
                  ) : voiceFile ? (
                    /* Recorded File Player */
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#07183f] truncate max-w-[170px]">{voiceFile.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400">0:0{voiceFile.duration}</span>
                          <button
                            onClick={handleDeleteVoice}
                            type="button"
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                          >
                            {/* Trash icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Playback Progress Slider */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleVoicePlayToggle}
                          type="button"
                          className="w-7 h-7 rounded-full bg-[#1158d4] text-white flex items-center justify-center border-0 cursor-pointer shadow-sm hover:scale-105"
                        >
                          {isPlayingVoice ? (
                            /* Pause */
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            /* Play */
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 translate-x-[0.5px]">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                        
                        <div className="h-1 bg-slate-200 rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-[#1158d4] transition-all duration-300"
                            style={{ width: `${playbackProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default Record Button */
                    <button
                      onClick={handleStartRecord}
                      type="button"
                      className="border border-[#cbdbe5] rounded-xl py-2 px-3 bg-white flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 text-xs font-bold text-[#1158d4] outline-none"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#1158d4]">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
                      </svg>
                      <span>Record Voice Remarks</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#8f98a8]">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value.slice(0, 250));
                      if (e.target.value.length > 5) {
                        setStep3Completed(true);
                      }
                    }}
                    placeholder="Enter notes here..."
                    className="w-full h-20 p-2.5 border border-[#e2e8f0] rounded-xl outline-none focus:border-[#1158d4] text-xs font-bold placeholder-slate-400 bg-white"
                  />
                  <span className="text-[9px] text-[#8f98a8] text-right self-end mt-0.5">{notes.length}/250</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8f98a8]">Upload Proof (Optional)</label>
                  <p className="m-0 text-[10px] text-[#8f98a8] leading-none">Add supporting photo of address (e.g., house number, name plate)</p>
                  
                  <div
                    onClick={handleUploadClick}
                    className="mt-1 border-2 border-dashed border-[#cbdbe5] rounded-xl p-4 bg-[#f8fafc] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50"
                  >
                    {uploadedProof ? (
                      <div className="flex items-center gap-2 text-[#088d27] font-bold text-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Proof Uploaded Successfully</span>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6 text-[#1158d4]">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span className="font-bold text-xs text-[#1158d4]">Tap to upload photo</span>
                        <span className="text-[9px] text-slate-400">JPG, PNG up to 5MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Capture Documents */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => onNavigate?.("capture-docs")}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    completedStepsCount >= 4 ? "bg-[#ecfaef] text-[#088d27]" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {completedStepsCount >= 4 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "4"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">4. Capture Documents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    completedStepsCount >= 4 ? "bg-[#ecfaef] text-[#088d27]" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {completedStepsCount >= 4 ? "Completed" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 5: Customer Signature */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => onNavigate?.("customer-signature")}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    completedStepsCount >= 5 ? "bg-[#ecfaef] text-[#088d27]" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {completedStepsCount >= 5 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "5"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">5. Customer Signature</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    completedStepsCount >= 5 ? "bg-[#ecfaef] text-[#088d27]" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {completedStepsCount >= 5 ? "Completed" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Floating Footer Button */}
        <div className="absolute bottom-4 left-5 right-5 z-20 w-[calc(100%-40px)] max-w-[390px] mx-auto flex-none">
          <button
            onClick={handleSaveAndContinue}
            type="button"
            className="w-full bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Save & Continue</span>
          </button>
        </div>

      </div>
    </section>
  );
}
