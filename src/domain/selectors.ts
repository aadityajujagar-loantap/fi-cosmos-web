import { distanceFromLiveLocation } from "./location";
import { isTerminalTaskStatus } from "./stateMachine";
import type { Agent, AppState, InvestigationTask, TaskStatus } from "./types";
export const selectAgentTasks = (state: AppState, agentId: string) => state.tasks.filter((task) => task.assignedAgentId === agentId);
export const selectNotifications = (state: AppState, profileId: string) => state.notifications.filter((item) => item.recipientUserId === profileId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const selectUnreadCount = (state: AppState, profileId: string) => state.notifications.filter((item) => item.recipientUserId === profileId && !item.read).length;
export function isTaskOverdue(task: InvestigationTask, at = Date.now()) { return !isTerminalTaskStatus(task.status) && task.status !== "SUBMITTED" && Date.parse(task.dueAt) < at; }
export function selectTaskCounts(state: AppState) { const count = (status: TaskStatus) => state.tasks.filter((task) => task.status === status).length; return { total: state.tasks.length, unassigned: count("UNASSIGNED"), active: state.tasks.filter((task) => ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "REWORK_REQUIRED"].includes(task.status)).length, submitted: count("SUBMITTED"), completed: count("COMPLETED"), rejected: count("REJECTED"), overdue: state.tasks.filter((task) => isTaskOverdue(task)).length }; }
export function selectAgentWorkload(state: AppState, agentId: string) { const tasks = selectAgentTasks(state, agentId); return { total: tasks.length, active: tasks.filter((task) => !isTerminalTaskStatus(task.status) && task.status !== "SUBMITTED").length, completed: tasks.filter((task) => task.status === "COMPLETED").length, submitted: tasks.filter((task) => task.status === "SUBMITTED").length }; }

export interface AgentEligibilityFilters {
  branchId?: string;
  city?: string;
  pincode?: string;
  query?: string;
}

export interface EligibleAgent extends Agent {
  activeTaskCount: number;
  distanceKm: number | null;
  matchReasons: string[];
  matchScore: number;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function selectEligibleAgents(state: AppState, task: InvestigationTask, filters: AgentEligibilityFilters = {}): EligibleAgent[] {
  const city = normalize(filters.city ?? "");
  const pincode = filters.pincode?.trim() ?? "";
  const query = normalize(filters.query ?? "");

  return state.agents
    .filter((agent) => agent.active && agent.availability !== "OFFLINE")
    .filter((agent) => !filters.branchId || agent.branchId === filters.branchId)
    .filter((agent) => !city || normalize(agent.city) === city)
    .filter((agent) => !pincode || agent.pincodes.includes(pincode))
    .filter((agent) => !query || normalize(`${agent.name} ${agent.employeeCode} ${agent.branchName} ${agent.city} ${agent.pincodes.join(" ")}`).includes(query))
    .map((agent) => {
      const matchReasons: string[] = [];
      let matchScore = 0;
      if (agent.pincodes.includes(task.pincode)) { matchScore += 1000; matchReasons.push("Exact pincode match"); }
      if (normalize(agent.city) === normalize(task.city)) { matchScore += 100; matchReasons.push("Same city"); }
      if (agent.branchId === task.branchId) { matchScore += 10; matchReasons.push("Same branch"); }
      if (agent.availability === "AVAILABLE") { matchScore += 1; matchReasons.push("Available"); }
      const activeTaskCount = selectAgentWorkload(state, agent.id).active;
      const distanceKm = distanceFromLiveLocation(agent, task);
      if (distanceKm !== null) matchReasons.push("Live distance available");
      return { ...agent, activeTaskCount, distanceKm, matchReasons, matchScore };
    })
    .sort((first, second) => second.matchScore - first.matchScore || (first.distanceKm ?? Number.POSITIVE_INFINITY) - (second.distanceKm ?? Number.POSITIVE_INFINITY) || first.activeTaskCount - second.activeTaskCount || first.name.localeCompare(second.name));
}
