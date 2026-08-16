export type AdminRoute =
  | "dashboard"
  | "applications"
  | "case-assignment"
  | "agents"
  | "analytics"
  | "fraud-alert"
  | "live-tracking"
  | "questionnaire"
  | "roles-permissions";

export type Priority = "High" | "Medium" | "Low";

export type CaseStatus = "Pending" | "In Progress" | "Completed" | "Rejected";

export interface AdminRouteItem {
  icon: string;
  id: AdminRoute;
  label: string;
}

export interface ApplicationCase {
  aiScore: number;
  agent: string;
  amount: string;
  branch: string;
  customer: string;
  id: string;
  loan: string;
  phone: string;
  priority: Priority;
  region: string;
  sla: string;
  status: CaseStatus;
  type: string;
}

export interface AgentRecord {
  active: boolean;
  battery: number;
  branch: string;
  cases: number;
  code: string;
  current: string;
  done: number;
  eta: string;
  initials: string;
  joined: string;
  name: string;
  pending: number;
  rating: number;
  region: string;
  sync: string;
}

export type AgentTrackerStatus = "Active" | "On Break" | "Offline";

export interface LiveAgentTracker {
  activeCaseId: string;
  agentCode: string;
  agentName: string;
  area: string;
  battery: number;
  branch: string;
  customer: string;
  eta: string;
  initials: string;
  latitude: number;
  longitude: number;
  path: Array<{ latitude: number; longitude: number }>;
  status: AgentTrackerStatus;
  sync: string;
}

export interface FraudAlert {
  agent: string;
  body: string;
  id: string;
  severity: "Critical" | Priority;
  time: string;
  title: string;
}

export interface RoleRecord {
  name: string;
  permissions: string[];
  users: string;
}
