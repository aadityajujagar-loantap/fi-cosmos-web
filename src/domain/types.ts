export type UserRole = "ADMIN" | "AGENT";
export interface AppActor { id: string; role: UserRole }
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "UNASSIGNED" | "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "SUBMITTED" | "REWORK_REQUIRED" | "COMPLETED" | "REJECTED" | "CANCELLED";
export type AgentAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface Profile { id: string; role: UserRole; displayName: string; email: string; active: boolean }
export interface Branch { id: string; code: string; name: string; city: string; state: string; pincodes: string[]; territories: string[] }
export interface Agent {
  id: string; profileId: string; employeeCode: string; name: string; phone: string; email: string;
  branchId: string; branchName: string; city: string; state: string; pincodes: string[]; territories: string[];
  availability: AgentAvailability; active: boolean; joinedAt: string; rating: number; battery: number;
  latitude?: number; longitude?: number; locationAccuracyMeters?: number; locationUpdatedAt?: string;
}
export type QuestionResponseType = "TEXT" | "TEXTAREA" | "YES_NO" | "NUMBER" | "DATE" | "SELECT" | "MULTI_SELECT";
export type QuestionnaireAnswerValue = string | string[];
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswerValue>;
export interface ProductQuestion { id: string; loanProductId: string; prompt: string; responseType: QuestionResponseType; options: string[]; required: boolean; sortOrder: number; active: boolean }
export interface LoanProduct { id: string; code: string; name: string; active: boolean; version: number; questions: ProductQuestion[]; createdAt: string; updatedAt: string }
export interface AssignedQuestion { id: string; prompt: string; responseType: QuestionResponseType; options: string[]; required: boolean; sortOrder: number }
export interface TaskChecklistItem { id: string; label: string; required: boolean }
export interface AssignmentRecord { agentId: string; assignedAt: string; assignedBy: string; endedAt?: string; reason?: string }
export interface InvestigationResult { residesVerified: string; homeOwnership: string; stayDuration: string; remarks: string; questionnaireAnswers: QuestionnaireAnswers; evidenceIds: string[]; submittedAt: string }
export interface InvestigationTask {
  id: string; referenceNumber: string; customerName: string; customerPhone: string; loanType: string; loanProductId?: string; amount: number;
  investigationType: string; address: string; area: string; city: string; state: string; pincode: string; territory: string;
  branchId: string; branchName: string; latitude: number; longitude: number; assignedAgentId?: string; assignedAt?: string;
  assignmentHistory: AssignmentRecord[]; priority: TaskPriority; dueAt: string; status: TaskStatus; checklist: TaskChecklistItem[]; questionnaire: AssignedQuestion[];
  version: number; createdAt: string; updatedAt: string; acceptedAt?: string; startedAt?: string; submittedAt?: string;
  completedAt?: string; rejectionReason?: string; reworkReason?: string; investigationResult?: InvestigationResult;
}
export interface InvestigationDraft {
  taskId: string; residesVerified: string; homeOwnership: string; stayDuration: string; remarks: string;
  questionnaireAnswers: QuestionnaireAnswers; completedChecklistIds: string[]; evidenceIds: string[]; updatedAt: string; version?: number;
}
export type NotificationType = "TASK_ASSIGNED" | "TASK_REASSIGNED" | "TASK_SUBMITTED" | "TASK_RESUBMITTED" | "TASK_COMPLETED" | "REWORK_REQUESTED" | "TASK_REJECTED" | "TASK_UPDATED";
export interface Notification { id: string; recipientUserId: string; type: NotificationType; title: string; message: string; taskId?: string; read: boolean; createdAt: string }
export type ActivityAction = "TASK_CREATED" | "TASK_ASSIGNED" | "TASK_REASSIGNED" | "TASK_ACCEPTED" | "TASK_STARTED" | "TASK_UPDATED" | "TASK_SUBMITTED" | "TASK_RESUBMITTED" | "TASK_COMPLETED" | "TASK_REWORK_REQUESTED" | "TASK_REJECTED";
export interface ActivityEvent { id: string; taskId: string; actorId: string; actorRole: UserRole; action: ActivityAction; timestamp: string; detail: string }
export interface Evidence { id: string; taskId: string; investigationId?: string; storagePath: string; fileName: string; mimeType: string; size: number; kind: string; signedUrl?: string; createdAt: string }
export interface AppState { branches: Branch[]; loanProducts: LoanProduct[]; agents: Agent[]; tasks: InvestigationTask[]; drafts: InvestigationDraft[]; notifications: Notification[]; activity: ActivityEvent[]; evidence: Evidence[] }
