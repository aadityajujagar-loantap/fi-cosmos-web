import type { TaskStatus } from "./types";

const transitions: Record<TaskStatus, TaskStatus[]> = {
  UNASSIGNED: ["ASSIGNED", "CANCELLED"], ASSIGNED: ["ACCEPTED", "ASSIGNED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "ASSIGNED", "CANCELLED"], IN_PROGRESS: ["SUBMITTED", "ASSIGNED", "CANCELLED"],
  SUBMITTED: ["REWORK_REQUIRED", "COMPLETED"], REWORK_REQUIRED: ["IN_PROGRESS", "ASSIGNED", "CANCELLED"],
  COMPLETED: [], REJECTED: [], CANCELLED: [],
};
export function assertTransition(current: TaskStatus, next: TaskStatus) { if (!transitions[current].includes(next)) throw new Error(`Task cannot transition from ${current} to ${next}.`); }
export function isTerminalTaskStatus(status: TaskStatus) { return ["COMPLETED", "REJECTED", "CANCELLED"].includes(status); }
export function taskStatusLabel(status: TaskStatus) { return status.toLowerCase().split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "); }
