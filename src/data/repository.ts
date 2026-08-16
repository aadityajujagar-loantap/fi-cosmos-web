import type { Agent, AppState, Branch, InvestigationDraft, InvestigationTask, LoanProduct, ProductQuestion, Profile, QuestionnaireAnswers } from "../domain/types";
import { supabase } from "../lib/supabase";
import { SupabaseRealtimeAdapter } from "./realtime";

type Row = Record<string, unknown>;
type Listener = () => void;
const emptyState: AppState = { branches: [], loanProducts: [], agents: [], tasks: [], drafts: [], notifications: [], activity: [], evidence: [] };
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback = 0) => typeof value === "number" ? value : fallback;
const optionalNumber = (value: unknown) => typeof value === "number" ? value : undefined;
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const row = (value: unknown): Row => value && typeof value === "object" ? value as Row : {};

function mapBranch(value: unknown): Branch {
  const item = row(value);
  return { id: text(item.id), code: text(item.code), name: text(item.name), city: text(item.city), state: text(item.state), pincodes: strings(item.pincodes), territories: strings(item.territories) };
}

function mapLoanProduct(value: unknown, questions: Row[]): LoanProduct {
  const item = row(value);
  const productQuestions = questions
    .filter((question) => question.loan_product_id === item.id)
    .map((question): ProductQuestion => ({
      id: text(question.id), loanProductId: text(question.loan_product_id), prompt: text(question.prompt),
      responseType: text(question.response_type) as ProductQuestion["responseType"], options: strings(question.options),
      required: Boolean(question.required), sortOrder: number(question.sort_order), active: Boolean(question.active),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
  return { id: text(item.id), code: text(item.code), name: text(item.name), active: Boolean(item.active), version: number(item.version, 1), questions: productQuestions, createdAt: text(item.created_at), updatedAt: text(item.updated_at) };
}

function mapAgent(value: unknown): Agent {
  const item = row(value); const profile = row(item.profiles); const branch = row(item.branches);
  return {
    id: text(item.id), profileId: text(item.profile_id), employeeCode: text(item.employee_code), name: text(profile.display_name),
    phone: text(item.phone), email: text(profile.email), branchId: text(item.branch_id), branchName: text(branch.name),
    city: text(item.city), state: text(item.state), pincodes: strings(item.pincodes), territories: strings(item.territories),
    availability: text(item.availability_status, "OFFLINE") as Agent["availability"], active: Boolean(item.active) && Boolean(profile.active),
    joinedAt: text(item.created_at), rating: number(item.rating, 4.5), battery: number(item.battery, 100),
    latitude: optionalNumber(item.current_latitude), longitude: optionalNumber(item.current_longitude),
    locationAccuracyMeters: optionalNumber(item.location_accuracy_meters), locationUpdatedAt: text(item.location_updated_at) || undefined,
  };
}

function mapTask(value: unknown, assignments: Row[], investigation?: Row): InvestigationTask {
  const item = row(value); const branch = row(item.branches);
  return {
    id: text(item.id), referenceNumber: text(item.reference_number), customerName: text(item.customer_name), customerPhone: text(item.customer_phone),
    loanType: text(item.loan_type), loanProductId: text(item.loan_product_id) || undefined, amount: number(item.amount), investigationType: text(item.investigation_type), address: text(item.address),
    area: text(item.area), city: text(item.city), state: text(item.state), pincode: text(item.pincode), territory: text(item.territory),
    branchId: text(item.branch_id), branchName: text(branch.name), latitude: number(item.latitude), longitude: number(item.longitude),
    assignedAgentId: text(item.assigned_agent_id) || undefined, assignedAt: text(item.assigned_at) || undefined,
    assignmentHistory: assignments.filter((entry) => entry.task_id === item.id).map((entry) => ({
      agentId: text(entry.agent_id), assignedAt: text(entry.assigned_at), assignedBy: text(entry.assigned_by),
      endedAt: text(entry.unassigned_at) || undefined, reason: text(entry.reason) || undefined,
    })),
    priority: text(item.priority) as InvestigationTask["priority"], dueAt: text(item.due_at), status: text(item.status) as InvestigationTask["status"],
    checklist: Array.isArray(item.checklist) ? item.checklist as InvestigationTask["checklist"] : [], questionnaire: Array.isArray(item.questionnaire) ? item.questionnaire as InvestigationTask["questionnaire"] : [], version: number(item.version, 1),
    createdAt: text(item.created_at), updatedAt: text(item.updated_at), acceptedAt: text(item.accepted_at) || undefined,
    startedAt: text(item.started_at) || undefined, submittedAt: text(item.submitted_at) || undefined, completedAt: text(item.completed_at) || undefined,
    rejectionReason: text(item.rejection_reason) || undefined, reworkReason: text(item.rework_reason) || undefined,
    investigationResult: investigation && text(investigation.status) === "SUBMITTED" ? {
      residesVerified: text(investigation.resides_verified), homeOwnership: text(investigation.home_ownership), stayDuration: text(investigation.stay_duration),
      remarks: text(investigation.remarks), questionnaireAnswers: row(investigation.questionnaire_answers) as QuestionnaireAnswers, evidenceIds: strings(investigation.evidence_ids), submittedAt: text(investigation.submitted_at),
    } : undefined,
  };
}

export class SupabaseRepository {
  private state = emptyState;
  private listeners = new Set<Listener>();
  private profile: Profile | null = null;
  private refreshing: Promise<void> | null = null;
  private refreshQueued = false;
  private configurationVersion = 0;
  private realtime = new SupabaseRealtimeAdapter();
  currentAgentId: string | null = null;
  private loaded = false;
  getIsLoaded = () => this.loaded;
  getSnapshot = () => this.state;
  subscribe = (listener: Listener) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };

  async configure(profile: Profile | null) {
    if (
      profile &&
      this.profile?.id === profile.id &&
      this.profile.role === profile.role &&
      this.loaded
    ) {
      this.profile = profile;
      return;
    }

    const version = ++this.configurationVersion;
    this.realtime.unsubscribe(); this.profile = profile; this.currentAgentId = null;
    if (!profile) { this.loaded = false; this.state = emptyState; this.notify(); return; }
    await this.refresh();
    if (version !== this.configurationVersion) return;
    this.realtime.subscribe(profile, this.currentAgentId, () => { void this.refresh(); });
  }

  async refresh() {
    if (!this.profile) return;
    if (this.refreshing) {
      this.refreshQueued = true;
      return this.refreshing;
    }
    this.refreshing = (async () => {
      do {
        this.refreshQueued = false;
        const profileId = this.profile?.id;
        if (!profileId) return;
        await this.fetchState(profileId);
      } while (this.refreshQueued && this.profile);
    })().finally(() => { this.refreshing = null; });
    return this.refreshing;
  }

  private async fetchState(profileId: string | null) {
    const start = performance.now();
    console.log(`[iFLOW Repository] Starting fetchState for profile ${profileId}...`);
    const [branchesResult, productsResult, questionsResult, agentsResult, tasksResult, assignmentsResult, investigationsResult, notificationsResult, activityResult, evidenceResult] = await Promise.all([
      supabase.from("branches").select("*"),
      supabase.from("loan_products").select("*").order("name"),
      supabase.from("product_questions").select("*").order("sort_order"),
      supabase.from("agents").select("*, profiles!agents_profile_id_fkey(display_name,email,active), branches(*)"),
      supabase.from("tasks").select("*, branches(*)"),
      supabase.from("task_assignments").select("*").order("assigned_at", { ascending: true }),
      supabase.from("investigations").select("*"),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      supabase.from("task_activity").select("*").order("created_at", { ascending: false }),
      supabase.from("task_evidence").select("*").order("created_at", { ascending: false }),
    ]);
    const endQueries = performance.now();
    console.log(`[iFLOW Repository] Database queries finished in ${(endQueries - start).toFixed(0)}ms`);

    const failure = [branchesResult, productsResult, questionsResult, agentsResult, tasksResult, assignmentsResult, investigationsResult, notificationsResult, activityResult, evidenceResult].find((result) => result.error);
    if (failure?.error) {
      console.error("[iFLOW Repository] Query failure:", failure.error);
      throw failure.error;
    }
    if (this.profile?.id !== profileId) {
      console.warn(`[iFLOW Repository] Profile mismatch (got ${profileId}, expected ${this.profile?.id}), aborting render.`);
      return;
    }
    const agents = (agentsResult.data ?? []).map(mapAgent);
    this.currentAgentId = agents.find((agent) => agent.profileId === this.profile?.id)?.id ?? null;
    const assignments = (assignmentsResult.data ?? []) as Row[];
    const investigations = (investigationsResult.data ?? []) as Row[];
    const evidenceRows = (evidenceResult.data ?? []) as Row[];
    const evidencePaths = evidenceRows.map((item) => text(item.storage_path));

    // --- EARLY RENDER: set core state and notify now, before the signed-URL round-trip.
    // The portal (agents, tasks, branches, notifications) is immediately usable.
    const mapEvidenceRow = (value: unknown, signedUrls?: Map<string, string>) => {
      const item = row(value);
      return { id: text(item.id), taskId: text(item.task_id), investigationId: text(item.investigation_id) || undefined, storagePath: text(item.storage_path), fileName: text(item.file_name), mimeType: text(item.mime_type), size: number(item.size), kind: text(item.evidence_kind, "document"), signedUrl: signedUrls?.get(text(item.storage_path)) ?? undefined, createdAt: text(item.created_at) };
    };
    this.state = {
      branches: (branchesResult.data ?? []).map(mapBranch),
      loanProducts: (productsResult.data ?? []).map((product) => mapLoanProduct(product, (questionsResult.data ?? []) as Row[])),
      agents,
      tasks: (tasksResult.data ?? []).map((task) => mapTask(task, assignments, investigations.find((item) => item.task_id === row(task).id))),
      drafts: investigations.map((item): InvestigationDraft => ({
        taskId: text(item.task_id), residesVerified: text(item.resides_verified), homeOwnership: text(item.home_ownership, "Owned"),
        stayDuration: text(item.stay_duration, "1-3 Years"), remarks: text(item.remarks), questionnaireAnswers: row(item.questionnaire_answers) as QuestionnaireAnswers, completedChecklistIds: strings(item.completed_checklist_ids),
        evidenceIds: strings(item.evidence_ids), updatedAt: text(item.updated_at), version: number(item.version, 1),
      })),
      notifications: (notificationsResult.data ?? []).map((value) => { const item = row(value); return { id: text(item.id), recipientUserId: text(item.recipient_profile_id), type: text(item.type) as AppState["notifications"][number]["type"], title: text(item.title), message: text(item.message), taskId: text(item.task_id) || undefined, read: Boolean(item.read_at), createdAt: text(item.created_at) }; }),
      activity: (activityResult.data ?? []).map((value) => { const item = row(value); const metadata = row(item.metadata); return { id: text(item.id), taskId: text(item.task_id), actorId: text(item.actor_profile_id), actorRole: text(item.actor_role) as AppState["activity"][number]["actorRole"], action: text(item.event_type) as AppState["activity"][number]["action"], timestamp: text(item.created_at), detail: text(metadata.detail, text(item.event_type).replaceAll("_", " ")) }; }),
      evidence: evidenceRows.map((v) => mapEvidenceRow(v)),  // no signed URLs yet
    };
    this.loaded = true;
    this.notify(); // ← portal renders here, before signed-URL network call
    console.log(`[iFLOW Repository] Early render triggered in ${(performance.now() - start).toFixed(0)}ms`);

    // --- BACKGROUND: fetch signed URLs and patch evidence
    if (!evidencePaths.length) {
      console.log(`[iFLOW Repository] No evidence files, loading complete.`);
      return;
    }
    console.log(`[iFLOW Repository] Fetching signed URLs for ${evidencePaths.length} items...`);
    const signedStart = performance.now();
    const signedResult = await supabase.storage.from("investigation-evidence").createSignedUrls(evidencePaths, 900);
    if (signedResult.error || this.profile?.id !== profileId) {
      if (signedResult.error) console.error("[iFLOW Repository] Signed URL error:", signedResult.error);
      return;
    }
    const signedUrls = new Map<string, string>((signedResult.data ?? []).flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl]] : []));
    this.state = { ...this.state, evidence: evidenceRows.map((v) => mapEvidenceRow(v, signedUrls)) };
    this.notify(); // ← evidence previews fill in
    console.log(`[iFLOW Repository] Signed URLs fetched and merged in ${(performance.now() - signedStart).toFixed(0)}ms`);
  }
  private notify() { this.listeners.forEach((listener) => listener()); }
}

export const supabaseRepository = new SupabaseRepository();
