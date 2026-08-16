import { useState, useEffect, useRef, useCallback } from "react";
import { investigationService } from "../../../data/services";
import { useAppData } from "../../../data/dataContext";
import type { Step } from "../../../types";
import {
  addCapturedAsset,
  addCapturedBlob,
  deleteCapturedAsset,
  loadCapturedAssets,
  type CapturedAsset,
} from "../utils/media";
import { getActiveAgentTask } from "../utils/tasks";
import { generateTaskPdf } from "../utils/pdfGenerator";
import { AssignedQuestionnaire } from "../components/AssignedQuestionnaire";

interface AgentUpdateChecklistProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

export function AgentUpdateChecklist({
  onBack,
  onNavigate,
  completedStepsCount = 0,
  setCompletedStepsCount
}: AgentUpdateChecklistProps) {
  const { agentActor, state } = useAppData();
  const [task] = useState(() => getActiveAgentTask());
  const [initialDraft] = useState(() => investigationService.getDraft(task.id));
  const assignedTask = state.tasks.find((item) => item.id === task.id);
  const questionnaire = assignedTask?.questionnaire ?? [];
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(() => ({ ...initialDraft.questionnaireAnswers }));
  const [initialUploadedProof] = useState<CapturedAsset | null>(
    () => loadCapturedAssets(task.id, "document").find((asset) => asset.slot === "address-verification") || null,
  );
  const [notes, setNotes] = useState(initialDraft.remarks);
  const [uploadedProof, setUploadedProof] = useState<CapturedAsset | null>(initialUploadedProof);
  const [proofError, setProofError] = useState("");
  const [photoCount] = useState(() => loadCapturedAssets(task.id, "photo").length);
  const [documentCount] = useState(() => loadCapturedAssets(task.id, "document").length);
  const [signatureCount] = useState(() => loadCapturedAssets(task.id, "signature").length);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const answerText = (term: string) => {
    const question = questionnaire.find((item) => item.prompt.toLowerCase().includes(term));
    const answer = question ? questionnaireAnswers[question.id] : undefined;
    return typeof answer === "string" ? answer : "";
  };
  const residesVerified = answerText("reside") || answerText("met") || answerText("exist") || initialDraft.residesVerified;
  const homeOwnership = answerText("ownership") || initialDraft.homeOwnership;
  const stayDuration = answerText("how long") || initialDraft.stayDuration;
  const questionnaireComplete = questionnaire.length > 0 && questionnaire
    .filter((question) => question.required)
    .every((question) => {
      const answer = questionnaireAnswers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim().length > 0;
    });

  // Camera states for Step 3
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraStatus, setCameraStatus] = useState<"starting" | "ready" | "blocked" | "unsupported">("starting");
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopInlineCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startInlineCamera = useCallback(async () => {
    setProofError("");
    setCameraActive(true);
    setCameraStatus("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      setProofError("Inline camera not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: cameraFacing },
          height: { ideal: 960 },
          width: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus("ready");
    } catch {
      setCameraStatus("blocked");
      setProofError("Unable to access camera.");
    }
  }, [cameraFacing]);

  // Restart camera if facing changes
  useEffect(() => {
    if (cameraActive) {
      void startInlineCamera();
    }
  }, [cameraFacing, startInlineCamera]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureInlineProof = async () => {
    const video = videoRef.current;
    if (!video || cameraStatus !== "ready" || !video.videoWidth || !video.videoHeight) {
      return;
    }

    setIsSaving(true);
    setProofError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to capture proof photo.");

      if (cameraFacing === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error("Unable to save captured proof."));
        }, "image/jpeg", 0.92);
      });

      const asset = await addCapturedBlob(blob, {
        kind: "document",
        mimeType: "image/jpeg",
        name: `address_proof_${Date.now()}.jpg`,
        slot: "address-verification",
        taskId: task.id,
      });
      setUploadedProof(asset);
      stopInlineCamera();
    } catch (caught) {
      setProofError(caught instanceof Error ? caught.message : "Unable to save captured proof.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1 manual visit verification state
  const [visitVerified, setVisitVerified] = useState(() => initialDraft.completedChecklistIds.includes("visit-location"));

  // Accordion expanded state (Step 1 open by default if not verified, else Step 3)
  const [expandedStep, setExpandedStep] = useState<number | null>(() => 
    initialDraft.completedChecklistIds.includes("visit-location") ? 3 : 1
  );

  // Dynamically derive step completions sequentially (Step N is only completed if Step N-1 is completed)
  const step1Completed = visitVerified;
  const step2Completed = step1Completed && (photoCount > 0 || (completedStepsCount ?? 0) >= 2);
  const step3Completed = step2Completed && questionnaireComplete && notes.trim().length >= 5;
  const step4Completed = step3Completed && (documentCount > 0 || (completedStepsCount ?? 0) >= 4);
  const step5Completed = step4Completed && (signatureCount > 0 || (completedStepsCount ?? 0) >= 5);

  const step2Enabled = step1Completed;
  const step3Enabled = step2Completed;
  const step4Enabled = step3Completed;
  const step5Enabled = step4Completed;

  const completedCount =
    (step1Completed ? 1 : 0) +
    (step2Completed ? 1 : 0) +
    (step3Completed ? 1 : 0) +
    (step4Completed ? 1 : 0) +
    (step5Completed ? 1 : 0);

  const progressPercent = Math.round((completedCount / 5) * 100);

  // Sync back to parent context
  useEffect(() => {
    setCompletedStepsCount?.(completedCount);
  }, [completedCount, setCompletedStepsCount]);

  const handleProofFile = async (fileList: FileList | null, resetInput?: () => void) => {
    const file = fileList?.[0];
    if (!file) return;

    try {
      const asset = await addCapturedAsset(file, { kind: "document", slot: "address-verification", taskId: task.id });
      setUploadedProof(asset);
      setProofError("");
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Unable to save proof.");
    } finally {
      resetInput?.();
    }
  };



  const buildDraft = () => ({
    taskId: task.id,
    residesVerified: residesVerified ?? "",
    homeOwnership,
    stayDuration,
    remarks: notes.trim(),
    questionnaireAnswers,
    completedChecklistIds: [
      step1Completed ? "visit-location" : null,
      step2Completed ? "capture-photo" : null,
      step3Completed ? "verify-address" : null,
      step4Completed ? "capture-documents" : null,
      step5Completed ? "customer-signature" : null,
    ].filter((value): value is string => Boolean(value)),
    evidenceIds: loadCapturedAssets(task.id).map((asset) => asset.id),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (showSuccessModal) return;
    const timer = window.setTimeout(() => {
      try {
        void investigationService.saveDraft(
          { id: agentActor.id, role: "AGENT" },
          task.id,
          {
            residesVerified: residesVerified ?? "",
            homeOwnership,
            stayDuration,
            remarks: notes.trim(),
            questionnaireAnswers,
            completedChecklistIds: [
              step1Completed ? "visit-location" : null,
              step2Completed ? "capture-photo" : null,
              step3Completed ? "verify-address" : null,
              step4Completed ? "capture-documents" : null,
              step5Completed ? "customer-signature" : null,
            ].filter((value): value is string => Boolean(value)),
            evidenceIds: loadCapturedAssets(task.id).map((asset) => asset.id),
          },
        );
      } catch {
        // A status change can make the draft read-only while this screen closes.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [agentActor.id, step1Completed, step2Completed, step3Completed, step4Completed, step5Completed, homeOwnership, notes, questionnaireAnswers, residesVerified, showSuccessModal, stayDuration, task.id]);

  const handleSaveAndContinue = async () => {
    const actor = agentActor;
    const draft = buildDraft();
    try {
      await investigationService.saveDraft(actor, task.id, draft);
      if (completedCount < 5) {
        setSubmissionError("");
        onBack();
        return;
      }
      const missing: string[] = [];
      if (!questionnaireComplete) missing.push("required product questionnaire answers");
      if (!notes.trim() || notes.trim().length < 5) missing.push("textual remarks (minimum 5 characters)");
      if (!uploadedProof) missing.push("address proof");
      if (!photoCount) missing.push("customer photo");
      if (!documentCount) missing.push("supporting document");
      if (!signatureCount) missing.push("customer signature");
      if (missing.length) throw new Error(`Complete required items: ${missing.join(", ")}.`);
      await investigationService.submit(actor, task.id, investigationService.getDraft(task.id));
      setSubmissionError("");
      setShowSuccessModal(true);
    } catch (caught) {
      setSubmissionError(caught instanceof Error ? caught.message : "Investigation could not be saved.");
    }
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden animate-slide-up">
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
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-4">
          
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
              <div
                onClick={() => setExpandedStep((prev) => prev === 1 ? null : 1)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    step1Completed ? "bg-[#ecfaef] text-[#088d27]" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {step1Completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "1"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">1. Visit Customer Location</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step1Completed ? "bg-[#ecfaef] text-[#088d27]" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {step1Completed ? "Completed" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedStep === 1 ? "rotate-180 text-[#1158d4]" : "text-slate-400"}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              {expandedStep === 1 && (
                <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3 bg-white">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{step1Completed ? "Completed at 10:25 AM, 16 May 2025" : "Check-in verified"}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="leading-relaxed">
                      {step1Completed 
                        ? "Visited the location and verified the address coordinates." 
                        : task.status === "In Progress"
                          ? "You have checked in. Please click the button below to verify the customer location visit."
                          : "Please check in at the customer's location first on the task panel to unlock verification."}
                    </span>
                    {!step1Completed && task.status === "In Progress" && (
                      <button
                        onClick={() => {
                          setVisitVerified(true);
                          setExpandedStep(2); // Auto-expand step 2
                        }}
                        type="button"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl border-0 cursor-pointer w-max shadow-sm"
                      >
                        Verify Visit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Capture Photo */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => {
                  if (step2Enabled) {
                    setExpandedStep((prev) => prev === 2 ? null : 2);
                  }
                }}
                className={`flex items-center justify-between p-4 ${step2Enabled ? "cursor-pointer hover:bg-slate-50/50" : "cursor-not-allowed opacity-50 bg-slate-50/50"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    step2Completed 
                      ? "bg-[#ecfaef] text-[#088d27]" 
                      : !step2Enabled
                        ? "bg-slate-100 text-slate-400"
                        : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {step2Completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : !step2Enabled ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      "2"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">2. Capture Customer Photo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step2Completed ? "bg-[#ecfaef] text-[#088d27]" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {step2Completed ? "Completed" : !step2Enabled ? "Locked" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedStep === 2 ? "rotate-180 text-[#1158d4]" : "text-slate-400"}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              {expandedStep === 2 && step2Enabled && (
                <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3 relative bg-white">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{step2Completed ? "Completed at 10:28 AM, 16 May 2025" : "No photo captured"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 mt-1.5">
                    <div className="grid w-14 h-14 place-items-center rounded-lg bg-slate-100 overflow-hidden border border-slate-200 text-[#1158d4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="m-0 text-xs font-bold text-[#1158d4]">{photoCount} Photo{photoCount === 1 ? "" : "s"} Captured</p>
                      <button
                        onClick={() => onNavigate?.("capture-photo")}
                        type="button"
                        className="mt-2 bg-[#1158d4] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border-0 cursor-pointer shadow-sm hover:bg-[#0f4ebc] transition"
                      >
                        {photoCount > 0 ? "Manage / Retake Photos" : "Open Camera"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Verify Address */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => {
                  if (step3Enabled) {
                    setExpandedStep((prev) => prev === 3 ? null : 3);
                  }
                }}
                className={`flex items-center justify-between p-4 ${step3Enabled ? "cursor-pointer hover:bg-slate-50/50" : "cursor-not-allowed opacity-50 bg-slate-50/50"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    step3Completed ? "bg-[#ecfaef] text-[#088d27]" : !step3Enabled ? "bg-slate-100 text-slate-400" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {step3Completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : !step3Enabled ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      "3"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">3. Product Questionnaire</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step3Completed ? "bg-[#ecfaef] text-[#088d27]" : !step3Enabled ? "bg-slate-50/50 text-slate-400 border border-slate-200" : "bg-[#edf5ff] text-[#1158d4]"
                  }`}>
                    {step3Completed ? "Completed" : !step3Enabled ? "Locked" : "In Progress"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedStep === 3 ? "rotate-180 text-[#1158d4]" : "text-slate-400"}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              {expandedStep === 3 && (
                <div className="px-4 pb-4 pl-12 flex flex-col gap-3.5 text-xs text-[#5c6a85] border-t border-slate-100 pt-3 bg-white">
                  <p className="m-0 text-xs font-bold text-[#5c6a85]">
                    Complete the questions configured for this loan product.
                  </p>

                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="m-0 text-[10px] font-bold uppercase text-[#07183f]">{assignedTask?.loanType ?? "Product"} Questionnaire</h4>
                      <span className="text-[9px] font-bold text-[#62728b]">{questionnaire.length} questions</span>
                    </div>
                    <AssignedQuestionnaire
                      answers={questionnaireAnswers}
                      onChange={(questionId, value) => setQuestionnaireAnswers((current) => ({ ...current, [questionId]: value }))}
                      questions={questionnaire}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#8f98a8]">Textual Remarks (Required)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 250))}
                      placeholder="Enter textual remarks here (minimum 5 characters)..."
                      className="w-full h-20 p-2.5 border border-[#e2e8f0] rounded-xl outline-none focus:border-[#1158d4] text-xs font-bold placeholder-slate-400 bg-white"
                    />
                    <div className="flex justify-between items-center mt-1">
                      {notes.trim().length > 0 && notes.trim().length < 5 ? (
                        <span className="text-[9px] font-bold text-[#ee0f1a]">Must be at least 5 characters</span>
                      ) : <span />}
                      <span className="text-[9px] text-[#8f98a8]">{notes.length}/250</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8f98a8]">Address Proof Photo / Document (Optional)</label>
                    <p className="m-0 text-[10px] text-[#8f98a8] leading-none">Add supporting photo of address (e.g., house number, name plate)</p>
                    
                    <label
                      className="relative mt-1 border-2 border-dashed border-[#cbdbe5] rounded-xl p-4 bg-[#f8fafc] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 overflow-hidden"
                    >
                      <input
                        id="address-proof-file-input"
                        accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(event) => {
                          const input = event.currentTarget;
                          setProofError("");
                          void handleProofFile(input.files, () => {
                            input.value = "";
                          });
                        }}
                        type="file"
                      />
                      {uploadedProof ? (
                        <div className="flex items-center justify-between w-full z-10">
                          <div className="flex items-center gap-2 text-[#088d27] font-bold text-xs">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="truncate max-w-[180px]">{uploadedProof.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              void deleteCapturedAsset(uploadedProof.id, task.id);
                              setUploadedProof(null);
                            }}
                            type="button"
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer font-bold text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6 text-[#1158d4]">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          <span className="font-bold text-xs text-[#1158d4]">Tap to upload proof</span>
                          <span className="text-[9px] text-slate-400">JPG, PNG, PDF up to 5MB</span>
                        </>
                      )}
                    </label>

                    {/* Step 3 Inline Camera viewfinder */}
                    {cameraActive && (
                      <div className="relative flex flex-col gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-700 mb-2 text-left mt-2">
                        <div className="flex items-center justify-between text-white text-[10px] font-bold px-0.5">
                          <span>Address Proof Camera Viewfinder</span>
                          <button
                            onClick={stopInlineCamera}
                            type="button"
                            className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-[10px]"
                          >
                            Close
                          </button>
                        </div>

                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black border border-slate-800">
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`h-full w-full object-cover ${cameraFacing === "user" ? "-scale-x-100" : ""} ${cameraStatus === "ready" ? "opacity-100" : "opacity-0"}`}
                          />
                          {cameraStatus !== "ready" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-slate-950">
                              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span className="text-[9px] font-bold">Initializing...</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center gap-2 mt-1">
                          <button
                            onClick={() => setCameraFacing((current) => (current === "environment" ? "user" : "environment"))}
                            type="button"
                            className="h-7 px-2.5 rounded-lg bg-slate-800 border-0 hover:bg-slate-750 text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Switch Camera
                          </button>

                          <button
                            onClick={captureInlineProof}
                            type="button"
                            disabled={cameraStatus !== "ready" || isSaving}
                            className="w-10 h-10 rounded-full border-2 border-white bg-[#1158d4] p-0.5 outline-none hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                            aria-label="Capture address proof"
                          >
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#1158d4]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#1158d4]" aria-hidden="true">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              stopInlineCamera();
                              const uploadInput = document.getElementById("address-proof-file-input");
                              uploadInput?.click();
                            }}
                            type="button"
                            className="h-7 px-2.5 rounded-lg bg-slate-800 border-0 hover:bg-slate-750 text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Upload File
                          </button>
                        </div>
                      </div>
                    )}

                    {!cameraActive && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => void startInlineCamera()}
                          type="button"
                          className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#1158d4] text-xs font-bold text-white border-0 hover:bg-[#0f4ebc] transition shadow-sm"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Camera
                        </button>
                        <button
                          onClick={() => {
                            const uploadInput = document.getElementById("address-proof-file-input");
                            uploadInput?.click();
                          }}
                          type="button"
                          className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#d8e0eb] bg-white text-xs font-bold text-[#1158d4] hover:bg-slate-50 transition shadow-sm"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          Upload
                        </button>
                      </div>
                    )}
                    {proofError ? <p className="m-0 text-[10px] font-bold text-[#ee0f1a]">{proofError}</p> : null}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Capture Documents */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => {
                  if (step4Enabled) {
                    setExpandedStep((prev) => prev === 4 ? null : 4);
                  }
                }}
                className={`flex items-center justify-between p-4 ${step4Enabled ? "cursor-pointer hover:bg-slate-50/50" : "cursor-not-allowed opacity-50 bg-slate-50/50"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    step4Completed ? "bg-[#ecfaef] text-[#088d27]" : !step4Enabled ? "bg-slate-100 text-slate-400" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {step4Completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : !step4Enabled ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      "4"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">4. Capture Documents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step4Completed ? "bg-[#ecfaef] text-[#088d27]" : !step4Enabled ? "bg-slate-50/50 text-slate-400 border border-slate-200" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {documentCount > 0 ? `${documentCount} Files` : step4Completed ? "Completed" : !step4Enabled ? "Locked" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedStep === 4 ? "rotate-180 text-[#1158d4]" : "text-slate-400"}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              {expandedStep === 4 && step4Enabled && (
                <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3 bg-white">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{step4Completed ? "Completed" : "No documents captured"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 mt-1.5">
                    <div className="grid w-14 h-14 place-items-center rounded-lg bg-slate-100 overflow-hidden border border-slate-200 text-[#1158d4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="m-0 text-xs font-bold text-[#1158d4]">{documentCount} Document{documentCount === 1 ? "" : "s"} Captured</p>
                      <button
                        onClick={() => onNavigate?.("capture-docs")}
                        type="button"
                        className="mt-2 bg-[#1158d4] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border-0 cursor-pointer shadow-sm hover:bg-[#0f4ebc] transition"
                      >
                        {documentCount > 0 ? "Manage Documents" : "Upload / Scan Documents"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Customer Signature */}
            <div className="border border-[#edf1f5] rounded-[18px] bg-[#fcfdfe] shadow-sm overflow-hidden flex flex-col z-10 text-left">
              <div
                onClick={() => {
                  if (step5Enabled) {
                    setExpandedStep((prev) => prev === 5 ? null : 5);
                  }
                }}
                className={`flex items-center justify-between p-4 ${step5Enabled ? "cursor-pointer hover:bg-slate-50/50" : "cursor-not-allowed opacity-50 bg-slate-50/50"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-none font-bold text-[10px] ${
                    step5Completed ? "bg-[#ecfaef] text-[#088d27]" : !step5Enabled ? "bg-slate-100 text-slate-400" : "border border-slate-300 text-[#5c6a85]"
                  }`}>
                    {step5Completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : !step5Enabled ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      "5"
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#07183f]">5. Customer Signature</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    step5Completed ? "bg-[#ecfaef] text-[#088d27]" : !step5Enabled ? "bg-slate-50/50 text-slate-400 border border-slate-200" : "bg-[#edf2f7] text-[#5c6a85]"
                  }`}>
                    {signatureCount > 0 ? "Captured" : step5Completed ? "Completed" : !step5Enabled ? "Locked" : "Pending"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedStep === 5 ? "rotate-180 text-[#1158d4]" : "text-slate-400"}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              {expandedStep === 5 && step5Enabled && (
                <div className="px-4 pb-4 pl-12 flex flex-col gap-2.5 text-xs text-[#5c6a85] border-t border-slate-50 pt-3 bg-white">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                    <span>{step5Completed ? "Completed" : "Pending customer signature"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 mt-1.5">
                    <div className="grid w-14 h-14 place-items-center rounded-lg bg-slate-100 overflow-hidden border border-slate-200 text-[#1158d4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="m-0 text-xs font-bold text-[#1158d4]">{signatureCount > 0 ? "Signature Captured" : "No Signature"}</p>
                      <button
                        onClick={() => onNavigate?.("customer-signature")}
                        type="button"
                        className="mt-2 bg-[#1158d4] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border-0 cursor-pointer shadow-sm hover:bg-[#0f4ebc] transition"
                      >
                        {signatureCount > 0 ? "Update Signature" : "Collect Signature"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        <footer className="flex-none border-t border-[#eef2f6] bg-white pt-3">
          {submissionError ? <p className="mb-2 rounded-xl bg-[#fff0ef] px-3 py-2 text-[10px] font-bold text-[#ee0f1a]">{submissionError}</p> : null}
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
            <span>{completedCount >= 5 ? "Submit Investigation" : "Save Draft"}</span>
          </button>
        </footer>

      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-[#eef2f6] shadow-2xl text-center flex flex-col items-center gap-4 animate-scale-in">
            {/* Animated checkmark container */}
            <div className="w-16 h-16 rounded-full bg-[#ecfaef] border-2 border-[#088d27] flex items-center justify-center text-[#088d27] mt-2 animate-bounce">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="text-base font-extrabold text-[#07183f] mt-1">Task Submitted Successfully</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
              All checklist evidence, coordinates, and signatures have been secured and geotagged.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2 w-full mt-4">
              <button
                onClick={() => generateTaskPdf(task)}
                type="button"
                className="w-full bg-[#1158d4] text-white hover:bg-[#0f4ebc] active:scale-[0.99] h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md border-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF Report
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate?.("history");
                }}
                type="button"
                className="w-full border border-slate-200 text-[#07183f] hover:bg-slate-50 active:scale-[0.99] h-11 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer bg-white"
              >
                Return to History
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
