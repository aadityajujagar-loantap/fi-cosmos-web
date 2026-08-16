import { supabase } from "../lib/supabase";
import type { Coordinates } from "../domain/location";
import { supabaseRepository } from "./repository";
import { selectEligibleAgents, type AgentEligibilityFilters } from "../domain/selectors";
import type { Agent, AppActor, InvestigationDraft, ProductQuestion, TaskPriority } from "../domain/types";

async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    if (error.code === "40001") {
      await supabaseRepository.refresh();
      throw new Error("This case changed in another session. The latest assignment has been loaded; review it and try again.");
    }
    throw error;
  }
  await supabaseRepository.refresh();
  return data;
}
function task(taskId: string) { const value = supabaseRepository.getSnapshot().tasks.find((item) => item.id === taskId); if (!value) throw new Error("Task was not found or is no longer accessible."); return value; }



export const taskService = {
  list: () => supabaseRepository.getSnapshot().tasks,
  get: (taskId: string) => supabaseRepository.getSnapshot().tasks.find((item) => item.id === taskId) ?? null,
  getEligibleAgents(taskId: string, filters?: AgentEligibilityFilters) {
    const current = task(taskId);
    return selectEligibleAgents(supabaseRepository.getSnapshot(), current, filters);
  },
  async create(_actor: AppActor, input: { customerName: string; customerPhone: string; loanType: string; loanProductId: string; amount: number; investigationType: string; address: string; city: string; state: string; pincode: string; territory: string; branchId: string; priority: TaskPriority; dueAt: string; latitude: number | null; longitude: number | null }) {
    return rpc("create_task", { p_customer_name: input.customerName, p_customer_phone: input.customerPhone, p_loan_type: input.loanType, p_amount: input.amount, p_investigation_type: input.investigationType, p_address: input.address, p_city: input.city, p_state: input.state, p_pincode: input.pincode, p_territory: input.territory, p_branch_id: input.branchId, p_priority: input.priority, p_due_at: input.dueAt, p_latitude: input.latitude ?? null, p_longitude: input.longitude ?? null, p_loan_product_id: input.loanProductId });
  },
  async assign(_actor: AppActor, taskId: string, agentId: string, reason?: string) { const current = task(taskId); return rpc("assign_task", { p_task_id: taskId, p_agent_id: agentId, p_expected_version: current.version, p_reason: reason ?? null }); },
  async accept(_actor: AppActor, taskId: string) { const current = task(taskId); return rpc("accept_task", { p_task_id: taskId, p_expected_version: current.version }); },
  async start(_actor: AppActor, taskId: string) { const current = task(taskId); return rpc("start_task", { p_task_id: taskId, p_expected_version: current.version }); },
  async rejectAssignment(_actor: AppActor, taskId: string, reason: string) { const current = task(taskId); return rpc("reject_assignment", { p_task_id: taskId, p_expected_version: current.version, p_reason: reason }); },
  async requestRework(_actor: AppActor, taskId: string, reason: string) { const current = task(taskId); return rpc("request_rework", { p_task_id: taskId, p_expected_version: current.version, p_reason: reason }); },
  async complete(_actor: AppActor, taskId: string) { const current = task(taskId); return rpc("complete_task", { p_task_id: taskId, p_expected_version: current.version }); },
  async updateDetails(_actor: AppActor, taskId: string, patch: { priority?: TaskPriority; dueAt?: string }) { const current = task(taskId); return rpc("update_task_details", { p_task_id: taskId, p_expected_version: current.version, p_priority: patch.priority ?? null, p_due_at: patch.dueAt ?? null }); },
  async updateLocation(_actor: AppActor, taskId: string, location: Coordinates) { const current = task(taskId); return rpc("update_task_location", { p_task_id: taskId, p_expected_version: current.version, p_latitude: location.latitude, p_longitude: location.longitude }); },
};

const blankDraft = (taskId: string): InvestigationDraft => ({ taskId, residesVerified: "", homeOwnership: "", stayDuration: "", remarks: "", questionnaireAnswers: {}, completedChecklistIds: [], evidenceIds: [], updatedAt: new Date().toISOString(), version: 0 });
export const investigationService = {
  getDraft: (taskId: string) => supabaseRepository.getSnapshot().drafts.find((item) => item.taskId === taskId) ?? blankDraft(taskId),
  async saveDraft(_actor: AppActor, taskId: string, patch: Partial<Omit<InvestigationDraft, "taskId">>) {
    const current = investigationService.getDraft(taskId);
    return rpc("save_investigation_draft", { p_task_id: taskId, p_expected_version: current.version ?? 0, p_form: { resides_verified: patch.residesVerified ?? current.residesVerified, home_ownership: patch.homeOwnership ?? current.homeOwnership, stay_duration: patch.stayDuration ?? current.stayDuration, remarks: patch.remarks ?? current.remarks, questionnaire_answers: patch.questionnaireAnswers ?? current.questionnaireAnswers, completed_checklist_ids: patch.completedChecklistIds ?? current.completedChecklistIds, evidence_ids: patch.evidenceIds ?? current.evidenceIds } });
  },
  async submit(_actor: AppActor, taskId: string, draft: InvestigationDraft) { const current = task(taskId); return rpc("submit_investigation", { p_task_id: taskId, p_expected_task_version: current.version, p_expected_investigation_version: draft.version ?? 0, p_form: { resides_verified: draft.residesVerified, home_ownership: draft.homeOwnership, stay_duration: draft.stayDuration, remarks: draft.remarks, questionnaire_answers: draft.questionnaireAnswers, completed_checklist_ids: draft.completedChecklistIds, evidence_ids: draft.evidenceIds } }); },
};

export const notificationService = {
  list: (profileId: string) => supabaseRepository.getSnapshot().notifications.filter((item) => item.recipientUserId === profileId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  async markRead(profileId: string, notificationId: string) { const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("recipient_profile_id", profileId); if (error) throw error; await supabaseRepository.refresh(); },
  async markAllRead(profileId: string) { const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_profile_id", profileId).is("read_at", null); if (error) throw error; await supabaseRepository.refresh(); },
};

export const productService = {
  async create(_actor: AppActor, input: { code: string; name: string }) {
    return rpc("create_loan_product", { p_code: input.code, p_name: input.name }) as Promise<string>;
  },
  async update(_actor: AppActor, productId: string, patch: { name?: string; active?: boolean }) {
    return rpc("update_loan_product", { p_product_id: productId, p_name: patch.name ?? null, p_active: patch.active ?? null });
  },
  async replaceQuestions(_actor: AppActor, productId: string, questions: Array<Pick<ProductQuestion, "id" | "prompt" | "responseType" | "options" | "required">>) {
    return rpc("replace_product_questions", { p_product_id: productId, p_questions: questions });
  },
};
export const agentService = {
  async create(_actor: AppActor, input: { name: string; phone: string; email: string; branchId: string }) {
    const { data, error } = await supabase.functions.invoke("provision-agent", { body: input });
    if (error) {
      const context = (error as { context?: Response }).context;
      const details = context ? await context.clone().json().catch(() => null) as { error?: string } | null : null;
      throw new Error(details?.error ?? error.message);
    }
    if (typeof data?.error === "string") throw new Error(data.error);
    const agentId = typeof data?.agentId === "string" ? data.agentId : "";
    if (!agentId) throw new Error("Supabase did not return the created Field Agent.");
    await supabaseRepository.refresh();
    const created = supabaseRepository.getSnapshot().agents.find((item) => item.id === agentId);
    if (!created) throw new Error("The Field Agent was created but could not be loaded from Supabase.");
    return created;
  },
  async update(_actor: AppActor, agentId: string, patch: Partial<Pick<Agent, "active" | "availability" | "battery" | "branchId">>) { await rpc("update_agent", { p_agent_id: agentId, p_branch_id: patch.branchId ?? null, p_availability: patch.availability ?? null, p_battery: patch.battery ?? null, p_active: patch.active ?? null }); },
  async updateLocation(_agentId: string, location: Coordinates, accuracyMeters?: number) {
    const { error } = await supabase.rpc("update_agent_location", { p_latitude: location.latitude, p_longitude: location.longitude, p_accuracy_meters: accuracyMeters ?? null });
    if (error) throw error;
  },
};

export const evidenceService = {
  async upload(taskId: string, blob: Blob, fileName: string, kind: string) {
    const extension = fileName.includes(".") ? fileName.split(".").pop() : "bin";
    const path = `${taskId}/${crypto.randomUUID()}-${kind}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("investigation-evidence").upload(path, blob, { contentType: blob.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase.from("task_evidence").insert({ task_id: taskId, storage_path: path, file_name: fileName, mime_type: blob.type || "application/octet-stream", size: blob.size, evidence_kind: kind }).select("id").single();
    if (error) { await supabase.storage.from("investigation-evidence").remove([path]); throw error; }
    await supabaseRepository.refresh(); return data.id as string;
  },
  async signedUrl(storagePath: string) { const { data, error } = await supabase.storage.from("investigation-evidence").createSignedUrl(storagePath, 300); if (error) throw error; return data.signedUrl; },
  async remove(evidenceId: string) { const evidence = supabaseRepository.getSnapshot().evidence.find((item) => item.id === evidenceId); if (!evidence) return; const { error: storageError } = await supabase.storage.from("investigation-evidence").remove([evidence.storagePath]); if (storageError) throw storageError; const { error } = await supabase.from("task_evidence").delete().eq("id", evidenceId); if (error) throw error; await supabaseRepository.refresh(); },
};


export const adminService = {
  async resetDryRunData() {
    const paths = supabaseRepository.getSnapshot().evidence.map((item) => item.storagePath);
    if (paths.length) { const { error } = await supabase.storage.from("investigation-evidence").remove(paths); if (error) throw error; }
    await rpc("reset_dry_run_data", {});
  },
};
