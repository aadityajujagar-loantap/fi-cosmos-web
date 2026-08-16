import { supabaseRepository } from "../../../data/repository";
import { taskService } from "../../../data/services";
import { isTerminalTaskStatus } from "../../../domain/stateMachine";
import type { InvestigationTask, TaskStatus } from "../../../domain/types";
import type { Task } from "../../../types";
import { distanceInKilometers, formatDistance, hasUsableCoordinates, type Coordinates } from "./distance";

export type AgentTaskStatus = "Assigned" | "Accepted" | "In Progress" | "Submitted" | "Rework Required" | "Completed" | "Rejected" | "Cancelled";

export interface AgentTaskRecord {
  action: Task["action"];
  address: string;
  area: string;
  branch: string;
  checklist: string[];
  createdAt: string;
  customer: string;
  date: string;
  distance: string;
  distanceValue: number;
  dueAt: string;
  icon: Task["icon"];
  id: string;
  latitude: number;
  location: string;
  longitude: number;
  mobile: string;
  priority: Task["priority"];
  rejectReason?: string;
  reworkReason?: string;
  slot: string;
  status: AgentTaskStatus;
  time: string;
  timeRange: string;
  title: string;
  tone: Task["tone"];
  type: string;
  updatedAt: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export const DEFAULT_USER_LOCATION: LatLng = { latitude: 18.553, longitude: 73.781 };

const ACTIVE_TASK_ID_KEY = "agent-active-task-id";

function statusLabel(status: TaskStatus): AgentTaskStatus {
  const labels: Record<TaskStatus, AgentTaskStatus> = {
    UNASSIGNED: "Assigned",
    ASSIGNED: "Assigned",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In Progress",
    SUBMITTED: "Submitted",
    REWORK_REQUIRED: "Rework Required",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

function taskIcon(type: string): Task["icon"] {
  const normalized = type.toLowerCase();
  if (normalized.includes("document") || normalized.includes("signature")) return "document";
  if (normalized.includes("kyc") || normalized.includes("contact")) return "id";
  if (normalized.includes("legal") || normalized.includes("property")) return "scale";
  if (normalized.includes("stock") || normalized.includes("collection")) return "folder";
  return "search";
}

function taskTone(task: InvestigationTask, icon: Task["icon"]): Task["tone"] {
  if (task.status === "REJECTED" || task.status === "CANCELLED") return "red";
  if (task.status === "REWORK_REQUIRED") return "orange";
  if (icon === "id") return "purple";
  if (icon === "folder") return "cyan";
  if (task.priority === "LOW") return "green";
  if (task.priority === "MEDIUM") return "orange";
  return "blue";
}

function dateLabel(dueAt: string) {
  const due = new Date(dueAt);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (due.toDateString() === today.toDateString()) return "Today";
  if (due.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return due.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function distanceFromUser(task: InvestigationTask, origin?: Coordinates | null) {
  return distanceInKilometers(origin, {
    latitude: task.latitude,
    longitude: task.longitude,
  });
}

function distanceLabel(task: InvestigationTask, origin: Coordinates | null | undefined, distance: number | null) {
  if (!hasUsableCoordinates(origin)) return "Live GPS unavailable";
  if (!hasUsableCoordinates(task)) return "Destination unavailable";
  return formatDistance(distance);
}

export function toAgentTask(task: InvestigationTask, origin?: Coordinates | null): AgentTaskRecord {
  const due = new Date(task.dueAt);
  const slot = due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const end = new Date(due.getTime() + 90 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const liveDistance = distanceFromUser(task, origin);
  const distanceValue = liveDistance ?? Number.POSITIVE_INFINITY;
  const icon = taskIcon(task.investigationType);
  return {
    action: ["ACCEPTED", "IN_PROGRESS", "REWORK_REQUIRED"].includes(task.status) ? "filled" : "outline",
    address: task.address,
    area: task.area,
    branch: task.branchName,
    checklist: task.checklist.map((item) => item.label),
    createdAt: task.createdAt,
    customer: task.customerName,
    date: dateLabel(task.dueAt),
    distance: distanceLabel(task, origin, liveDistance),
    distanceValue,
    dueAt: task.dueAt,
    icon,
    id: task.id,
    latitude: task.latitude,
    location: `${task.area}, ${task.city}`,
    longitude: task.longitude,
    mobile: task.customerPhone,
    priority: task.priority,
    rejectReason: task.rejectionReason ? `Reason: ${task.rejectionReason}` : undefined,
    reworkReason: task.reworkReason,
    slot,
    status: statusLabel(task.status),
    time: `${slot} - ${end}`,
    timeRange: `${slot} - ${end}`,
    title: task.investigationType,
    tone: taskTone(task, icon),
    type: task.investigationType,
    updatedAt: task.updatedAt,
  };
}

export function loadAgentTasks() {
  const snapshot = supabaseRepository.getSnapshot();
  const agent = snapshot.agents.find((item) => item.id === supabaseRepository.currentAgentId);
  return toAgentTasks(snapshot.tasks, hasUsableCoordinates(agent) ? agent : null);
}

export function toAgentTasks(tasks: InvestigationTask[], origin?: Coordinates | null) {
  // Supabase RLS already limits Agent task queries to the signed-in owner.
  return tasks.map((task) => toAgentTask(task, origin));
}

export async function createAgentTask(_input: Record<string, unknown>) {
  void _input;
  throw new Error("Cases can only be created and assigned by an Admin.");
}

export function setActiveAgentTaskId(id: string) {
  window.localStorage.setItem(ACTIVE_TASK_ID_KEY, id);
}

export function getActiveAgentTaskId() {
  return window.localStorage.getItem(ACTIVE_TASK_ID_KEY) || loadAgentTasks()[0]?.id || "";
}

export function getActiveDomainTask() {
  const tasks = supabaseRepository.getSnapshot().tasks;
  return tasks.find((task) => task.id === getActiveAgentTaskId()) ?? tasks[0] ?? null;
}

export function getActiveAgentTask(origin?: Coordinates | null) {
  const task = getActiveDomainTask();
  if (!task) throw new Error("No task is assigned to the current Field Agent.");
  return toAgentTask(task, origin);
}

export async function updateAgentTask(id: string, patch: Partial<AgentTaskRecord>) {
  const actor = { id: "", role: "AGENT" as const };
  const current = taskService.get(id);
  if (!current) return null;
  if (patch.status === "Accepted" && current.status === "ASSIGNED") await taskService.accept(actor, id);
  if (patch.status === "In Progress") {
    const latest = taskService.get(id);
    if (latest?.status === "ASSIGNED") await taskService.accept(actor, id);
    const accepted = taskService.get(id);
    if (accepted?.status === "ACCEPTED" || accepted?.status === "REWORK_REQUIRED") await taskService.start(actor, id);
  }
  if (patch.status === "Rejected" && current.status === "ASSIGNED") {
    await taskService.rejectAssignment(actor, id, patch.rejectReason?.replace(/^Reason:\s*/i, "").replace(/\.$/, "") || "Assignment rejected");
  }
  const updated = taskService.get(id);
  return updated ? toAgentTask(updated) : null;
}

export function isTerminalStatus(status: AgentTaskStatus) {
  const map: Record<AgentTaskStatus, TaskStatus> = {
    Assigned: "ASSIGNED",
    Accepted: "ACCEPTED",
    "In Progress": "IN_PROGRESS",
    Submitted: "SUBMITTED",
    "Rework Required": "REWORK_REQUIRED",
    Completed: "COMPLETED",
    Rejected: "REJECTED",
    Cancelled: "CANCELLED",
  };
  return isTerminalTaskStatus(map[status]);
}
