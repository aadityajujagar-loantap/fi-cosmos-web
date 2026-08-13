import { useRef, useState } from "react";
import type { Step } from "../../../types";
import { addCapturedAsset, deleteCapturedAsset, loadCapturedAssets, type CapturedAsset } from "../utils/media";
import { getActiveAgentTask } from "../utils/tasks";

interface DocumentSlotConfig {
  id: string;
  required?: boolean;
  subtitle: string;
  title: string;
}

interface DocumentSlotProps extends DocumentSlotConfig {
  assets: CapturedAsset[];
  expanded: boolean;
  onDelete: (assetId: string) => void;
  onPickCamera: () => void;
  onPickFile: () => void;
  onToggleExpand: () => void;
}

const documentSlots: DocumentSlotConfig[] = [
  {
    id: "identity",
    required: true,
    subtitle: "Aadhaar Card / PAN Card / Voter ID / Passport",
    title: "1. Identity Proof",
  },
  {
    id: "address",
    required: true,
    subtitle: "Utility Bill / Bank Statement / Rent Agreement",
    title: "2. Address Proof",
  },
  {
    id: "income",
    subtitle: "Salary Slip / ITR / Bank Statement",
    title: "3. Income Proof",
  },
  {
    id: "other",
    subtitle: "Any other supporting document",
    title: "4. Other Documents",
  },
];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function DocumentPreview({ asset, onDelete }: { asset: CapturedAsset; onDelete: () => void }) {
  const isImage = asset.mimeType.startsWith("image/");

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {isImage ? (
        <img alt={asset.name} className="h-full w-full object-cover" src={asset.dataUrl} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-[#1158d4]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6" aria-hidden="true">
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v6h5M9 14h6M9 18h5" />
          </svg>
          <span className="line-clamp-2 text-[9px] font-bold">{asset.name}</span>
        </div>
      )}
      <button
        onClick={onDelete}
        type="button"
        aria-label={`Delete ${asset.name}`}
        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full border-0 bg-slate-900/70 text-[10px] font-bold text-white"
      >
        x
      </button>
    </div>
  );
}

function DocumentSlot({
  assets,
  expanded,
  onDelete,
  onPickCamera,
  onPickFile,
  onToggleExpand,
  required,
  subtitle,
  title,
}: DocumentSlotProps) {
  const captured = assets.length > 0;

  return (
    <div className="flex flex-none flex-col overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white text-left shadow-sm">
      <button
        onClick={onToggleExpand}
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-white p-4 text-left hover:bg-slate-50/50"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#07183f]">{title}</span>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${required ? "bg-[#edf5ff] text-[#1158d4]" : "bg-[#edf2f7] text-[#5c6a85]"}`}>
              {required ? "Required" : "Optional"}
            </span>
          </span>
          <span className="mt-1 block truncate text-[10px] leading-none text-[#8f98a8]">{subtitle}</span>
        </span>
        <span className="flex flex-none items-center gap-1.5">
          <span className={`text-[10px] font-bold ${captured ? "text-[#088d27]" : "text-[#1158d4]"}`}>
            {captured ? `${assets.length} Captured` : "Add Document"}
          </span>
          {captured ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5 text-[#088d27]" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : null}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-slate-400" aria-hidden="true">
            <path d={expanded ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
          </svg>
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-col gap-3 border-t border-slate-50 px-4 pb-4 pt-4">
          {assets.length ? (
            <div className="grid grid-cols-3 gap-2.5">
              {assets.map((asset) => (
                <DocumentPreview key={asset.id} asset={asset} onDelete={() => onDelete(asset.id)} />
              ))}
              <button
                onClick={onPickCamera}
                type="button"
                className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#cbdbe5] bg-[#f8fafc] text-[#1158d4] hover:bg-slate-50"
              >
                <CameraIcon />
                <span className="text-[10px] font-bold">Retake</span>
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPickCamera}
              type="button"
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#1158d4] text-xs font-bold text-white"
            >
              <CameraIcon />
              Camera
            </button>
            <button
              onClick={onPickFile}
              type="button"
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#d8e0eb] bg-white text-xs font-bold text-[#1158d4]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload
            </button>
          </div>
        </div>
      ) : null}
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
  completedStepsCount = 2,
  setCompletedStepsCount,
}: AgentCaptureDocsProps) {
  const [task] = useState(() => getActiveAgentTask());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    address: true,
    identity: true,
    income: false,
    other: false,
  });
  const [documents, setDocuments] = useState<CapturedAsset[]>(() => loadCapturedAssets(task.id, "document"));
  const [error, setError] = useState("");
  const activeSlotRef = useRef(documentSlots[0].id);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const reloadDocuments = () => setDocuments(loadCapturedAssets(task.id, "document"));
  const assetsForSlot = (slotId: string) => documents.filter((asset) => asset.slot === slotId);

  const openCamera = (slotId: string) => {
    activeSlotRef.current = slotId;
    cameraInputRef.current?.click();
  };

  const openUpload = (slotId: string) => {
    activeSlotRef.current = slotId;
    uploadInputRef.current?.click();
  };

  const saveFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    setError("");
    try {
      for (const file of Array.from(fileList)) {
        await addCapturedAsset(file, {
          kind: "document",
          slot: activeSlotRef.current,
          taskId: task.id,
        });
      }
      reloadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save document.");
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const removeDocument = (assetId: string) => {
    deleteCapturedAsset(assetId, task.id);
    reloadDocuments();
  };

  const handleSaveAndContinue = () => {
    const missingRequired = documentSlots.filter((slot) => slot.required && assetsForSlot(slot.id).length === 0);
    if (missingRequired.length) {
      setExpanded((current) => ({
        ...current,
        ...Object.fromEntries(missingRequired.map((slot) => [slot.id, true])),
      }));
      setError("Capture identity proof and address proof before continuing.");
      return;
    }

    if (setCompletedStepsCount && completedStepsCount < 4) {
      setCompletedStepsCount(4);
    }
    onBack();
  };

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <header className="relative flex h-12 w-full flex-none items-center justify-center">
          <button
            onClick={onBack}
            type="button"
            aria-label="Back"
            className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-0 text-[#07183f] hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="max-w-[240px] truncate text-lg font-bold text-[#07183f]">Capture Documents</h1>
        </header>

        <input
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => void saveFiles(event.target.files)}
          type="file"
        />
        <input
          ref={uploadInputRef}
          accept="image/*,application/pdf"
          className="hidden"
          multiple
          onChange={(event) => void saveFiles(event.target.files)}
          type="file"
        />

        <div className="mt-2 flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex w-full flex-none items-start gap-2.5 rounded-xl border border-[#d8e6ff] bg-[#f4f8ff] p-3 text-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-5 w-5 flex-none text-[#1158d4]" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div className="min-w-0 text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Please capture clear and readable documents.</p>
              <p className="m-0 mt-0.5 font-medium">Camera capture and file upload are both supported.</p>
            </div>
          </div>

          {documentSlots.map((slot) => (
            <DocumentSlot
              key={slot.id}
              {...slot}
              assets={assetsForSlot(slot.id)}
              expanded={expanded[slot.id]}
              onDelete={removeDocument}
              onPickCamera={() => openCamera(slot.id)}
              onPickFile={() => openUpload(slot.id)}
              onToggleExpand={() => setExpanded((current) => ({ ...current, [slot.id]: !current[slot.id] }))}
            />
          ))}

          <div className="flex w-full flex-none items-start gap-2.5 rounded-xl border border-[#faecd1] bg-[#fdfaf2] p-3 text-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-5 w-5 flex-none text-[#e58000]" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-xs text-[#7c5b16]">
              <p className="m-0 font-bold">Note:</p>
              <ul className="m-0 mt-1 flex list-disc flex-col gap-1 pl-4 font-medium leading-snug">
                <li>Ensure every document is clear and all details are visible.</li>
                <li>Supported formats: JPG, PNG, PDF. Max 5MB each.</li>
              </ul>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-[#fff0ef] px-3 py-2 text-xs font-bold text-[#ee0f1a]">{error}</p> : null}
        </div>

        <footer className="flex flex-none items-center gap-3 border-t border-[#eef2f6] bg-white pt-3">
          <button
            onClick={onBack}
            type="button"
            className="flex h-12 flex-1 items-center justify-center rounded-[14px] border border-[#1158d4] bg-white text-sm font-bold text-[#1158d4] shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndContinue}
            type="button"
            className="flex h-12 w-[65%] items-center justify-center rounded-[14px] border-0 bg-[#1158d4] text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] hover:bg-[#0f4ebc] active:scale-[0.99]"
          >
            Save & Continue
          </button>
        </footer>
      </div>
    </section>
  );
}
