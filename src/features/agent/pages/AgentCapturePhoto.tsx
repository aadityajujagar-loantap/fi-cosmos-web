import { useCallback, useEffect, useRef, useState } from "react";
import {
  addCapturedAsset,
  addCapturedBlob,
  deleteCapturedAsset,
  loadCapturedAssets,
  type CapturedAsset,
} from "../utils/media";
import { getActiveAgentTask } from "../utils/tasks";

interface AgentCapturePhotoProps {
  onBack: () => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

type CameraStatus = "starting" | "ready" | "blocked" | "unsupported";

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
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("user");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [triggerFlashAnimation, setTriggerFlashAnimation] = useState(false);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshPhotos = () => setPhotos(loadCapturedAssets(task.id, "photo"));

  const stopInlineCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startInlineCamera = useCallback(async () => {
    setError("");

    if (!window.isSecureContext) {
      setCameraStatus("unsupported");
      setError("Inline camera needs HTTPS. Use the fallback camera button on this local dev build.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      return;
    }

    stopInlineCamera();
    setCameraStatus("starting");

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
      stopInlineCamera();
      setCameraStatus("blocked");
      setError("Camera permission denied or unavailable. You can still upload a photo.");
    }
  }, [cameraFacing, stopInlineCamera]);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      void startInlineCamera();
    }, 0);
    return () => {
      window.clearTimeout(startTimer);
      stopInlineCamera();
    };
  }, [startInlineCamera, stopInlineCamera]);

  const saveUploadedFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    setIsSaving(true);
    setError("");
    try {
      for (const file of Array.from(fileList)) {
        await addCapturedAsset(file, { kind: "photo", taskId: task.id });
      }
      refreshPhotos();
      setTriggerFlashAnimation(true);
      window.setTimeout(() => setTriggerFlashAnimation(false), 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save photo.");
    } finally {
      setIsSaving(false);
      if (cameraFallbackInputRef.current) cameraFallbackInputRef.current.value = "";
    }
  };

  const captureInlinePhoto = async () => {
    const video = videoRef.current;
    if (!video || cameraStatus !== "ready" || !video.videoWidth || !video.videoHeight) {
      await startInlineCamera();
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to capture photo.");

      if (cameraFacing === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error("Unable to save captured photo."));
        }, "image/jpeg", 0.92);
      });

      await addCapturedBlob(blob, {
        kind: "photo",
        mimeType: "image/jpeg",
        name: `customer_photo_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.jpg`,
        taskId: task.id,
      });
      refreshPhotos();
      setTriggerFlashAnimation(true);
      window.setTimeout(() => setTriggerFlashAnimation(false), 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const removePhoto = (assetId: string) => {
    deleteCapturedAsset(assetId, task.id);
    refreshPhotos();
  };

  const handleUsePhoto = () => {
    if (!photos.length) {
      setError("Capture or upload at least one customer photo.");
      return;
    }
    if (setCompletedStepsCount && completedStepsCount < 2) {
      setCompletedStepsCount(2);
    }
    stopInlineCamera();
    onBack();
  };

  const latestPhoto = photos[0];
  const cameraMessage =
    cameraStatus === "starting"
      ? "Opening camera..."
      : cameraStatus === "blocked"
        ? "Camera unavailable"
        : "Inline camera is not supported";

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
            onClick={() => {
              stopInlineCamera();
              onBack();
            }}
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
          ref={cameraFallbackInputRef}
          accept="image/*"
          capture={cameraFacing}
          className="hidden"
          onChange={(event) => void saveUploadedFiles(event.target.files)}
          type="file"
        />


        <div className="mt-2 flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex w-full flex-none items-center gap-2.5 rounded-xl border border-[#d8e6ff] bg-[#f4f8ff] p-3 text-left">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#edf5ff] text-[#1158d4]">
              <CameraIcon />
            </div>
            <div className="min-w-0 text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Capture a clear customer photo</p>
              <p className="m-0 mt-0.5 font-medium text-[#5c6a85]">The camera opens inside this screen. Upload remains available as fallback.</p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full flex-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${cameraFacing === "user" ? "-scale-x-100" : ""} ${cameraStatus === "ready" ? "opacity-100" : "opacity-0"}`}
            />

            {cameraStatus !== "ready" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
                {latestPhoto ? (
                  <img alt={latestPhoto.name} className="absolute inset-0 h-full w-full object-cover opacity-35" src={latestPhoto.dataUrl} />
                ) : null}
                <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white/12">
                  <CameraIcon />
                </div>
                <div className="relative z-10">
                  <p className="m-0 text-sm font-bold">{cameraMessage}</p>
                  <p className="m-0 mt-1 text-xs font-medium text-white/70">
                    {cameraStatus === "starting" ? "Please allow camera access." : "Use HTTPS for inline camera, or capture with fallback."}
                  </p>
                </div>
                {cameraStatus !== "starting" ? (
                  <div className="relative z-10 flex gap-2">
                    <button
                      onClick={() => void startInlineCamera()}
                      type="button"
                      className="h-9 rounded-xl border border-white/30 bg-white/15 px-3 text-xs font-bold text-white"
                    >
                      Start Inline
                    </button>
                    <button
                      onClick={() => cameraFallbackInputRef.current?.click()}
                      type="button"
                      className="h-9 rounded-xl border border-white bg-white px-3 text-xs font-bold text-[#1158d4]"
                    >
                      Open Camera
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 rounded-tl border-l-2 border-t-2 border-white" />
            <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 rounded-tr border-r-2 border-t-2 border-white" />
            <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 rounded-bl border-b-2 border-l-2 border-white" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 rounded-br border-b-2 border-r-2 border-white" />
          </div>

          <div className="flex w-full flex-none items-center justify-around py-2">
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 border-0 bg-transparent outline-none"
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  void saveUploadedFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#cbd5e1] bg-[#edf5ff] text-[#1158d4] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#5c6a85]">Upload</span>
            </label>

            <button
              onClick={() => void captureInlinePhoto()}
              type="button"
              disabled={isSaving}
              className="h-16 w-16 cursor-pointer rounded-full border-4 border-[#1158d4] bg-white p-1 outline-none transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
              aria-label="Capture photo"
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
              <span className="text-[10px] font-bold text-[#5c6a85]">{cameraFacing === "user" ? "Front" : "Rear"}</span>
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
                onClick={() => void captureInlinePhoto()}
                type="button"
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#cbdbe5] bg-[#f8fafc] text-[#1158d4] hover:bg-slate-50"
              >
                <span className="text-xs font-bold">+</span>
                <span className="text-[9px] font-bold">Capture</span>
              </button>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-[#fff0ef] px-3 py-2 text-xs font-bold text-[#ee0f1a]">{error}</p> : null}
        </div>

        <footer className="flex flex-none items-center gap-3 border-t border-[#eef2f6] bg-white pt-3">
          <button
            onClick={() => {
              if (window.isSecureContext) {
                void startInlineCamera();
              } else {
                cameraFallbackInputRef.current?.click();
              }
            }}
            type="button"
            className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-[#1158d4] bg-white text-sm font-bold text-[#1158d4] shadow-sm hover:bg-slate-50"
          >
            {window.isSecureContext ? "Restart" : "Camera"}
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
