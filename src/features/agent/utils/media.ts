import { evidenceService } from "../../../data/services";
import { supabaseRepository } from "../../../data/repository";
import { getActiveAgentTaskId } from "./tasks";

export type CaptureKind = "photo" | "document" | "signature" | "voice";
export interface CapturedAsset {
  createdAt: string; dataUrl: string; id: string; kind: CaptureKind; mimeType: string;
  name: string; slot?: string; size: number; duration?: number;
}
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const previews = new Map<string, CapturedAsset>();

export function loadCapturedAssets(taskId = getActiveAgentTaskId(), kind?: CaptureKind) {
  const remote = supabaseRepository.getSnapshot().evidence.filter((item) => item.taskId === taskId).map((item): CapturedAsset => {
    const [captureKind, slot] = (item.kind || "document").split(":", 2);
    return { createdAt: item.createdAt, dataUrl: previews.get(item.id)?.dataUrl || item.signedUrl || "", id: item.id, kind: captureKind as CaptureKind, mimeType: item.mimeType, name: item.fileName, size: item.size, slot };
  });
  return kind ? remote.filter((asset) => asset.kind === kind) : remote;
}

export async function addCapturedBlob(blob: Blob, options: { duration?: number; kind: CaptureKind; mimeType?: string; name?: string; slot?: string; taskId?: string }) {
  if (blob.size > MAX_FILE_SIZE) throw new Error("File is larger than 5MB.");
  const taskId = options.taskId || getActiveAgentTaskId();
  const name = options.name || `${options.kind}-${Date.now()}`;
  const normalizedBlob = blob.type ? blob : new Blob([blob], { type: options.mimeType || "application/octet-stream" });
  const id = await evidenceService.upload(taskId, normalizedBlob, name, options.slot ? `${options.kind}:${options.slot}` : options.kind);
  const asset: CapturedAsset = { createdAt: new Date().toISOString(), dataUrl: URL.createObjectURL(normalizedBlob), duration: options.duration, id, kind: options.kind, mimeType: normalizedBlob.type, name, size: blob.size, slot: options.slot };
  previews.set(id, asset);
  return asset;
}
export async function addCapturedAsset(file: File, options: { kind: CaptureKind; slot?: string; taskId?: string }) { return addCapturedBlob(file, { ...options, mimeType: file.type, name: file.name || `${options.kind}-${Date.now()}` }); }
export async function deleteCapturedAsset(assetId: string, taskId = getActiveAgentTaskId()) { await evidenceService.remove(assetId); previews.delete(assetId); return loadCapturedAssets(taskId); }
export async function saveSignatureDataUrl(dataUrl: string, taskId = getActiveAgentTaskId()) { const response = await fetch(dataUrl); return addCapturedBlob(await response.blob(), { kind: "signature", name: "customer-signature.png", taskId }); }
