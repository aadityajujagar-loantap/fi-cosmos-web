import { useRef, useState } from "react";
import { addCapturedAsset, deleteCapturedAsset, loadCapturedAssets, type CapturedAsset } from "../utils/media";
import { getActiveAgentTask } from "../utils/tasks";

interface AgentCapturePhotoProps {
  onBack: () => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function AgentCapturePhoto({
  onBack,
  completedStepsCount = 2,
  setCompletedStepsCount,
}: AgentCapturePhotoProps) {
  const [task] = useState(() => getActiveAgentTask());
  const [photos, setPhotos] = useState<CapturedAsset[]>(() => loadCapturedAssets(task.id, "photo"));
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [triggerFlashAnimation, setTriggerFlashAnimation] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const saveFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    setIsSaving(true);
    setError("");
    try {
      for (const file of Array.from(fileList)) {
        await addCapturedAsset(file, { kind: "photo", taskId: task.id });
      }
      setPhotos(loadCapturedAssets(task.id, "photo"));
      setTriggerFlashAnimation(true);
      window.setTimeout(() => setTriggerFlashAnimation(false), 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save photo.");
    } finally {
      setIsSaving(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const removePhoto = (assetId: string) => {
    deleteCapturedAsset(assetId, task.id);
    setPhotos(loadCapturedAssets(task.id, "photo"));
  };

  const handleUsePhoto = () => {
    if (!photos.length) {
      setError("Capture or upload at least one customer photo.");
      return;
    }
    if (setCompletedStepsCount && completedStepsCount < 2) {
      setCompletedStepsCount(2);
    }
    onBack();
  };

  const latestPhoto = photos[0];

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white">
      {triggerFlashAnimation ? (
        <div className="absolute inset-0 z-50 bg-white" style={{ animation: "flashEffect 0.4s ease-out forwards" }} />
      ) : null}

      <style>{`
        @keyframes flashEffect {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

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

          <h1 className="max-w-[240px] truncate text-lg font-bold text-[#07183f]">Capture Customer Photo</h1>
        </header>

        <input
          ref={cameraInputRef}
          accept="image/*"
          capture={cameraFacing}
          className="hidden"
          onChange={(event) => void saveFiles(event.target.files)}
          type="file"
        />
        <input
          ref={uploadInputRef}
          accept="image/*"
          className="hidden"
          multiple
          onChange={(event) => void saveFiles(event.target.files)}
          type="file"
        />

        <div className="mt-2 flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex w-full flex-none items-center gap-2.5 rounded-xl border border-[#d8e6ff] bg-[#f4f8ff] p-3 text-left">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#edf5ff] text-[#1158d4]">
              <CameraIcon />
            </div>
            <div className="min-w-0 text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Capture a clear customer photo</p>
              <p className="m-0 mt-0.5 font-medium text-[#5c6a85]">Native camera opens on mobile; gallery upload is also supported.</p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full flex-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner">
            {latestPhoto ? (
              <img alt={latestPhoto.name} className="h-full w-full object-cover" src={latestPhoto.dataUrl} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/12">
                  <CameraIcon />
                </div>
                <div>
                  <p className="m-0 text-sm font-bold">No photo captured yet</p>
                  <p className="m-0 mt-1 text-xs font-medium text-white/70">Tap the shutter to open the device camera.</p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 rounded-tl border-l-2 border-t-2 border-white" />
            <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 rounded-tr border-r-2 border-t-2 border-white" />
            <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 rounded-bl border-b-2 border-l-2 border-white" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 rounded-br border-b-2 border-r-2 border-white" />
          </div>

          <div className="flex w-full flex-none items-center justify-around py-2">
            <button
              onClick={() => uploadInputRef.current?.click()}
              type="button"
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 border-0 bg-transparent outline-none"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#cbd5e1] bg-[#edf5ff] text-[#1158d4] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#5c6a85]">Upload</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              type="button"
              disabled={isSaving}
              className="h-16 w-16 cursor-pointer rounded-full border-4 border-[#1158d4] bg-white p-1 outline-none transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
              aria-label="Open camera"
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-[#1158d4] text-white">
                <CameraIcon />
              </div>
            </button>

            <button
              onClick={() => setCameraFacing((current) => (current === "environment" ? "user" : "environment"))}
              type="button"
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 border-0 bg-transparent outline-none"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#cbd5e1] bg-[#edf5ff] text-[#1158d4] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#5c6a85]">{cameraFacing === "environment" ? "Rear" : "Front"}</span>
            </button>
          </div>

          <div className="flex w-full flex-none flex-col text-left">
            <h2 className="mb-2 px-1 text-xs font-bold text-[#5c6a85]">Captured Photos ({photos.length})</h2>
            <div className="grid grid-cols-4 gap-2.5">
              {photos.slice(0, 7).map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img alt={photo.name} className="h-full w-full object-cover" src={photo.dataUrl} />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    type="button"
                    aria-label={`Delete ${photo.name}`}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full border-0 bg-slate-900/70 text-[10px] font-bold text-white"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                onClick={() => cameraInputRef.current?.click()}
                type="button"
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#cbdbe5] bg-[#f8fafc] text-[#1158d4] hover:bg-slate-50"
              >
                <span className="text-xs font-bold">+</span>
                <span className="text-[9px] font-bold">Add</span>
              </button>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-[#fff0ef] px-3 py-2 text-xs font-bold text-[#ee0f1a]">{error}</p> : null}
        </div>

        <footer className="flex flex-none items-center gap-3 border-t border-[#eef2f6] bg-white pt-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            type="button"
            className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-[#1158d4] bg-white text-sm font-bold text-[#1158d4] shadow-sm hover:bg-slate-50"
          >
            Retake
          </button>
          <button
            onClick={handleUsePhoto}
            type="button"
            className="flex h-12 w-[60%] cursor-pointer items-center justify-center rounded-[14px] border-0 bg-[#1158d4] text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] hover:bg-[#0f4ebc] active:scale-[0.99] disabled:opacity-60"
            disabled={!photos.length}
          >
            Use Photo
          </button>
        </footer>
      </div>
    </section>
  );
}
