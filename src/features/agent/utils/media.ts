import { getActiveAgentTaskId } from "./tasks";

export type CaptureKind = "photo" | "document" | "signature" | "voice";

export interface CapturedAsset {
  createdAt: string;
  dataUrl: string;
  id: string;
  kind: CaptureKind;
  mimeType: string;
  name: string;
  slot?: string;
  size: number;
  duration?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function keyForTask(taskId = getActiveAgentTaskId()) {
  return `agent-captures-${taskId}`;
}

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function loadCapturedAssets(taskId = getActiveAgentTaskId(), kind?: CaptureKind) {
  if (!storageAvailable()) return [];

  try {
    const saved = JSON.parse(window.localStorage.getItem(keyForTask(taskId)) || "[]") as CapturedAsset[];
    return kind ? saved.filter((asset) => asset.kind === kind) : saved;
  } catch {
    return [];
  }
}

function saveCapturedAssets(assets: CapturedAsset[], taskId = getActiveAgentTaskId()) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(keyForTask(taskId), JSON.stringify(assets.slice(0, 30)));
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected media."));
    reader.readAsDataURL(blob);
  });
}

export async function addCapturedBlob(
  blob: Blob,
  options: { duration?: number; kind: CaptureKind; mimeType?: string; name?: string; slot?: string; taskId?: string },
) {
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("File is larger than 5MB.");
  }

  const taskId = options.taskId || getActiveAgentTaskId();
  const asset: CapturedAsset = {
    createdAt: new Date().toISOString(),
    dataUrl: await blobToDataUrl(blob),
    duration: options.duration,
    id: `CAP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: options.kind,
    mimeType: options.mimeType || blob.type || "application/octet-stream",
    name: options.name || `${options.kind}-${Date.now()}`,
    size: blob.size,
    slot: options.slot,
  };
  const nextAssets = [asset, ...loadCapturedAssets(taskId)];
  saveCapturedAssets(nextAssets, taskId);
  return asset;
}

export async function addCapturedAsset(file: File, options: { kind: CaptureKind; slot?: string; taskId?: string }) {
  return addCapturedBlob(file, {
    ...options,
    mimeType: file.type,
    name: file.name || `${options.kind}-${Date.now()}`,
  });
}

export function deleteCapturedAsset(assetId: string, taskId = getActiveAgentTaskId()) {
  const nextAssets = loadCapturedAssets(taskId).filter((asset) => asset.id !== assetId);
  saveCapturedAssets(nextAssets, taskId);
  return nextAssets;
}

export function saveSignatureDataUrl(dataUrl: string, taskId = getActiveAgentTaskId()) {
  const existing = loadCapturedAssets(taskId).filter((asset) => asset.kind !== "signature");
  const signature: CapturedAsset = {
    createdAt: new Date().toISOString(),
    dataUrl,
    id: `SIG-${Date.now()}`,
    kind: "signature",
    mimeType: "image/png",
    name: "customer-signature.png",
    size: dataUrl.length,
  };
  saveCapturedAssets([signature, ...existing], taskId);
  return signature;
}
