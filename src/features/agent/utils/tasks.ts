import type { Task } from "../../../types";

export type AgentTaskStatus = "Pending" | "In Progress" | "Completed" | "Rejected" | "Cancelled";

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
  icon: Task["icon"];
  id: string;
  latitude: number;
  location: string;
  longitude: number;
  mobile: string;
  priority: Task["priority"];
  rejectReason?: string;
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

export const DEFAULT_USER_LOCATION: LatLng = {
  latitude: 18.553,
  longitude: 73.781,
};

const TASKS_KEY = "agent-tasks";
const LEGACY_CREATED_TASKS_KEY = "agent-created-tasks";
const ACTIVE_TASK_ID_KEY = "agent-active-task-id";

const DEFAULT_CHECKLIST = [
  "Visit customer location",
  "Capture customer photo",
  "Verify address",
  "Capture documents",
  "Customer signature",
];

const PUNE_POINTS = [
  { area: "Baner Road", latitude: 18.559, longitude: 73.7868 },
  { area: "Pimpri-Chinchwad", latitude: 18.6298, longitude: 73.7997 },
  { area: "Pune Station", latitude: 18.5286, longitude: 73.874 },
  { area: "Hinjewadi", latitude: 18.5913, longitude: 73.7389 },
  { area: "Kothrud", latitude: 18.5074, longitude: 73.8077 },
  { area: "Aundh", latitude: 18.5602, longitude: 73.807 },
  { area: "Viman Nagar", latitude: 18.5679, longitude: 73.9143 },
  { area: "Akurdi", latitude: 18.6487, longitude: 73.764 },
];

export const defaultAgentTasks: AgentTaskRecord[] = [
  {
    action: "filled",
    address: "102, Sai Residency, Baner Road, Pune - 411045",
    area: "Baner Road",
    branch: "Pune West",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-16T04:45:00.000Z",
    customer: "Amit Deshmukh",
    date: "Today",
    distance: "2.4 km",
    distanceValue: 2.4,
    icon: "search",
    id: "T123456",
    latitude: 18.559,
    location: "Baner Road, Pune",
    longitude: 73.7868,
    mobile: "+91 98765 43210",
    priority: "HIGH",
    slot: "10:30 AM",
    status: "In Progress",
    time: "10:30 AM - 12:30 PM",
    timeRange: "10:30 AM - 12:30 PM",
    title: "Field Investigation",
    tone: "blue",
    type: "Field Investigation",
    updatedAt: "2025-05-16T05:00:00.000Z",
  },
  {
    action: "outline",
    address: "Flat 7B, Green Heights, Pimpri-Chinchwad, Pune",
    area: "Pimpri-Chinchwad",
    branch: "Pune North",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-16T05:10:00.000Z",
    customer: "Neha Patil",
    date: "Today",
    distance: "5.7 km",
    distanceValue: 5.7,
    icon: "document",
    id: "T123457",
    latitude: 18.6298,
    location: "Pimpri-Chinchwad, Pune",
    longitude: 73.7997,
    mobile: "+91 91234 56780",
    priority: "MEDIUM",
    slot: "01:00 PM",
    status: "Pending",
    time: "01:00 PM - 03:00 PM",
    timeRange: "01:00 PM - 03:00 PM",
    title: "Document Collection",
    tone: "green",
    type: "Document Collection",
    updatedAt: "2025-05-16T05:10:00.000Z",
  },
  {
    action: "outline",
    address: "Office 214, City Center, Pune Station, Pune",
    area: "Pune Station",
    branch: "Pune Central",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-16T06:00:00.000Z",
    customer: "Rahul Sharma",
    date: "Today",
    distance: "6.1 km",
    distanceValue: 6.1,
    icon: "id",
    id: "T123458",
    latitude: 18.5286,
    location: "Pune Station, Pune",
    longitude: 73.874,
    mobile: "+91 98765 43211",
    priority: "HIGH",
    slot: "03:30 PM",
    status: "Pending",
    time: "03:30 PM - 05:00 PM",
    timeRange: "03:30 PM - 05:00 PM",
    title: "KYC Verification",
    tone: "purple",
    type: "KYC Verification",
    updatedAt: "2025-05-16T06:00:00.000Z",
  },
  {
    action: "outline",
    address: "Phase 1, Hinjewadi Rajiv Gandhi Infotech Park, Pune",
    area: "Hinjewadi",
    branch: "Pune West",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-16T06:20:00.000Z",
    customer: "Sana Khan",
    date: "Tomorrow",
    distance: "7.8 km",
    distanceValue: 7.8,
    icon: "scale",
    id: "T123459",
    latitude: 18.5913,
    location: "Hinjewadi, Pune",
    longitude: 73.7389,
    mobile: "+91 99887 66554",
    priority: "LOW",
    slot: "11:00 AM",
    status: "Pending",
    time: "Tomorrow",
    timeRange: "11:00 AM - 12:30 PM",
    title: "Legal Verification",
    tone: "orange",
    type: "Legal Verification",
    updatedAt: "2025-05-16T06:20:00.000Z",
  },
  {
    action: "outline",
    address: "Mayfair Building, Kothrud Depot Road, Pune",
    area: "Kothrud",
    branch: "Pune West",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-15T08:00:00.000Z",
    customer: "Prasad Kulkarni",
    date: "15 May 2025",
    distance: "4.2 km",
    distanceValue: 4.2,
    icon: "search",
    id: "T123460",
    latitude: 18.5074,
    location: "Kothrud, Pune",
    longitude: 73.8077,
    mobile: "+91 90000 11122",
    priority: "HIGH",
    slot: "10:00 AM",
    status: "Completed",
    time: "10:00 AM - 11:30 AM",
    timeRange: "10:00 AM - 11:30 AM",
    title: "Asset Valuation",
    tone: "blue",
    type: "Field Investigation",
    updatedAt: "2025-05-15T06:00:00.000Z",
  },
  {
    action: "outline",
    address: "IT Park Road, Aundh, Pune",
    area: "Aundh",
    branch: "Pune North",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-15T08:40:00.000Z",
    customer: "Rohini Deshmukh",
    date: "15 May 2025",
    distance: "8.1 km",
    distanceValue: 8.1,
    icon: "document",
    id: "T123461",
    latitude: 18.5602,
    location: "Aundh, Pune",
    longitude: 73.807,
    mobile: "+91 91234 56789",
    priority: "MEDIUM",
    slot: "12:00 PM",
    status: "Completed",
    time: "12:00 PM - 01:30 PM",
    timeRange: "12:00 PM - 01:30 PM",
    title: "Signature Verification",
    tone: "green",
    type: "Document Collection",
    updatedAt: "2025-05-15T08:00:00.000Z",
  },
  {
    action: "outline",
    address: "Balewadi High Street, Baner, Pune",
    area: "Baner",
    branch: "Pune West",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-14T07:30:00.000Z",
    customer: "Manish Joshi",
    date: "14 May 2025",
    distance: "5.3 km",
    distanceValue: 5.3,
    icon: "scale",
    id: "T123462",
    latitude: 18.5654,
    location: "Baner, Pune",
    longitude: 73.7769,
    mobile: "+91 90123 45678",
    priority: "LOW",
    rejectReason: "Reason: Customer unavailable for visit.",
    slot: "02:00 PM",
    status: "Rejected",
    time: "02:00 PM - 03:30 PM",
    timeRange: "02:00 PM - 03:30 PM",
    title: "Background Check",
    tone: "red",
    type: "Legal Verification",
    updatedAt: "2025-05-14T10:00:00.000Z",
  },
  {
    action: "outline",
    address: "Phoenix Marketcity Road, Viman Nagar, Pune",
    area: "Viman Nagar",
    branch: "Pune Central",
    checklist: DEFAULT_CHECKLIST,
    createdAt: "2025-05-14T09:00:00.000Z",
    customer: "Irfan Shaikh",
    date: "14 May 2025",
    distance: "11.5 km",
    distanceValue: 11.5,
    icon: "folder",
    id: "T123463",
    latitude: 18.5679,
    location: "Viman Nagar, Pune",
    longitude: 73.9143,
    mobile: "+91 93210 98765",
    priority: "HIGH",
    rejectReason: "Reason: Task was cancelled by admin.",
    slot: "05:00 PM",
    status: "Cancelled",
    time: "05:00 PM - 06:30 PM",
    timeRange: "05:00 PM - 06:30 PM",
    title: "Final Approval Upload",
    tone: "purple",
    type: "Document Collection",
    updatedAt: "2025-05-14T09:45:00.000Z",
  },
];

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function readJson<T>(key: string, fallback: T): T {
  if (!storageAvailable()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function toPriority(value: unknown): Task["priority"] {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "LOW" || normalized === "MEDIUM" || normalized === "HIGH") return normalized;
  return "HIGH";
}

function toStatus(value: unknown): AgentTaskStatus {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("complete")) return "Completed";
  if (normalized.includes("reject")) return "Rejected";
  if (normalized.includes("cancel")) return "Cancelled";
  if (normalized.includes("progress")) return "In Progress";
  return "Pending";
}

function taskIcon(type: string): Task["icon"] {
  const normalized = type.toLowerCase();
  if (normalized === "search" || normalized === "document" || normalized === "id" || normalized === "scale" || normalized === "folder") {
    return normalized;
  }
  if (normalized.includes("document") || normalized.includes("signature")) return "document";
  if (normalized.includes("kyc")) return "id";
  if (normalized.includes("legal") || normalized.includes("background")) return "scale";
  if (normalized.includes("upload") || normalized.includes("additional")) return "folder";
  return "search";
}

function taskTone(priority: Task["priority"], icon: Task["icon"], status: AgentTaskStatus): Task["tone"] {
  if (status === "Rejected" || status === "Cancelled") return "red";
  if (icon === "id") return "purple";
  if (icon === "folder") return "cyan";
  if (priority === "LOW") return "green";
  if (priority === "MEDIUM") return "orange";
  return "blue";
}

function parseDistance(value: unknown) {
  const parsed = Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 2.4;
}

function pointForAddress(address: string, id: string) {
  const normalized = address.toLowerCase();
  const matched = PUNE_POINTS.find((point) => normalized.includes(point.area.toLowerCase()));
  if (matched) return matched;

  const numeric = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PUNE_POINTS[numeric % PUNE_POINTS.length];
}

function areaFromAddress(address: string) {
  const point = pointForAddress(address, address);
  return point.area;
}

function asString(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function normalizeTask(value: Partial<AgentTaskRecord> & Record<string, unknown>, index: number): AgentTaskRecord {
  const id = asString(value.id, `T${123500 + index}`);
  const title = asString(value.title, "New Field Task");
  const type = asString(value.type, title);
  const address = asString(value.address, "Pune, Maharashtra");
  const priority = toPriority(value.priority);
  const status = toStatus(value.status);
  const icon = value.icon ? taskIcon(String(value.icon)) : taskIcon(type || title);
  const point = pointForAddress(address, id);
  const distanceValue = parseDistance(value.distance);
  const slot = asString(value.slot, asString(value.time, "10:30 AM"));
  const timeRange = asString(value.timeRange, slot.includes("-") ? slot : `${slot} - ${slot}`);
  const now = new Date().toISOString();

  return {
    action: status === "In Progress" ? "filled" : "outline",
    address,
    area: asString(value.area, areaFromAddress(address)),
    branch: asString(value.branch, "Pune West"),
    checklist: Array.isArray(value.checklist) && value.checklist.length ? value.checklist.map(String) : DEFAULT_CHECKLIST,
    createdAt: asString(value.createdAt, now),
    customer: asString(value.customer, "Walk-in Customer"),
    date: asString(value.date, "Today"),
    distance: asString(value.distance, `${distanceValue.toFixed(1)} km`),
    distanceValue,
    icon,
    id,
    latitude: typeof value.latitude === "number" ? value.latitude : point.latitude,
    location: asString(value.location, `${point.area}, Pune`),
    longitude: typeof value.longitude === "number" ? value.longitude : point.longitude,
    mobile: asString(value.mobile, "+91 98765 43210"),
    priority,
    rejectReason: typeof value.rejectReason === "string" ? value.rejectReason : undefined,
    slot,
    status,
    time: asString(value.time, timeRange),
    timeRange,
    title,
    tone: value.tone ? taskTone(priority, icon, status) : taskTone(priority, icon, status),
    type,
    updatedAt: asString(value.updatedAt, now),
  };
}

function dedupeTasks(tasks: AgentTaskRecord[]) {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

function loadLegacyTasks() {
  const legacy = readJson<Array<Record<string, unknown>>>(LEGACY_CREATED_TASKS_KEY, []);
  return legacy.map((task, index) => normalizeTask(task, index));
}

export function loadAgentTasks() {
  const saved = readJson<Array<Record<string, unknown>> | null>(TASKS_KEY, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((task, index) => normalizeTask(task, index));
  }

  return dedupeTasks([...loadLegacyTasks(), ...defaultAgentTasks]);
}

export function saveAgentTasks(tasks: AgentTaskRecord[]) {
  writeJson(TASKS_KEY, dedupeTasks(tasks));
}

export function createAgentTask(input: {
  address: string;
  branch: string;
  checklist: string[];
  customer: string;
  date: string;
  distance: string;
  mobile: string;
  priority: string;
  slot: string;
  title: string;
  type: string;
}) {
  const now = new Date().toISOString();
  const id = `T${Date.now().toString().slice(-6)}`;
  const priority = toPriority(input.priority);
  const icon = taskIcon(input.type);
  const point = pointForAddress(input.address, id);
  const distanceValue = parseDistance(input.distance);
  const task = normalizeTask(
    {
      ...input,
      action: "outline",
      area: point.area,
      createdAt: now,
      distance: input.distance || `${distanceValue.toFixed(1)} km`,
      icon,
      id,
      latitude: point.latitude,
      location: `${point.area}, Pune`,
      longitude: point.longitude,
      priority,
      status: "Pending",
      time: input.date === "Today" ? `${input.slot} - ${input.slot}` : input.date,
      timeRange: input.date === "Today" ? `${input.slot} - ${input.slot}` : input.date,
      tone: taskTone(priority, icon, "Pending"),
      updatedAt: now,
    },
    0,
  );
  const tasks = loadAgentTasks();
  saveAgentTasks([task, ...tasks]);
  setActiveAgentTaskId(task.id);
  return task;
}

export function setActiveAgentTaskId(id: string) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(ACTIVE_TASK_ID_KEY, id);
}

export function getActiveAgentTaskId() {
  if (!storageAvailable()) return defaultAgentTasks[0].id;
  return window.localStorage.getItem(ACTIVE_TASK_ID_KEY) || defaultAgentTasks[0].id;
}

export function getActiveAgentTask() {
  const tasks = loadAgentTasks();
  return tasks.find((task) => task.id === getActiveAgentTaskId()) || tasks[0] || defaultAgentTasks[0];
}

export function updateAgentTask(id: string, patch: Partial<AgentTaskRecord>) {
  const tasks = loadAgentTasks();
  const now = new Date().toISOString();
  const nextTasks = tasks.map((task) =>
    task.id === id
      ? normalizeTask({ ...task, ...patch, id, updatedAt: now }, 0)
      : task,
  );
  saveAgentTasks(nextTasks);
  return nextTasks.find((task) => task.id === id) || null;
}

export function deleteAgentTask(id: string) {
  const tasks = loadAgentTasks().filter((task) => task.id !== id);
  saveAgentTasks(tasks);
  if (getActiveAgentTaskId() === id && tasks[0]) setActiveAgentTaskId(tasks[0].id);
  return tasks;
}

export function completeActiveAgentTask() {
  const task = getActiveAgentTask();
  return updateAgentTask(task.id, { status: "Completed", action: "outline" });
}

export function isTerminalStatus(status: AgentTaskStatus) {
  return status === "Completed" || status === "Rejected" || status === "Cancelled";
}
