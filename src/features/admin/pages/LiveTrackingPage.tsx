import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { distanceFromLiveLocation, formatDistance, formatDistanceWithContext, hasFreshCoordinates, hasUsableCoordinates } from "../../../domain/location";
import type { Agent, InvestigationTask } from "../../../domain/types";
import { OpenStreetMap } from "../../agent/components/OpenStreetMap";
import { PageFrame } from "../components/PageFrame";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel, PanelHeader } from "../ui/Panel";
import { SearchField } from "../ui/SearchField";
import { StatusDot } from "../ui/StatusDot";
import { classNames } from "../utils/classNames";

type TrackerStatus = "Active" | "Busy" | "Offline";
type Tracker = { agent: Agent; distanceKm: number | null; status: TrackerStatus; task: InvestigationTask | null };

const statusOptions = ["All", "Active", "Busy", "Offline"] as const;
const activeTaskStatuses = new Set<InvestigationTask["status"]>(["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "REWORK_REQUIRED"]);

function trackerStatus(agent: Agent): TrackerStatus {
  if (!agent.active || agent.availability === "OFFLINE") return "Offline";
  if (agent.availability === "BUSY") return "Busy";
  return "Active";
}

function priorityForStatus(status: TrackerStatus): "HIGH" | "MEDIUM" | "LOW" {
  if (status === "Offline") return "HIGH";
  if (status === "Busy") return "MEDIUM";
  return "LOW";
}

function lastSeen(value?: string) {
  if (!value) return "No device location";
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return new Date(value).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

export function LiveTrackingPage() {
  const { refresh, state } = useAppData();
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("All");
  const [lastRefresh, setLastRefresh] = useState("Just now");

  const trackers = useMemo<Tracker[]>(() => state.agents.map((agent) => {
    const task = state.tasks
      .filter((item) => item.assignedAgentId === agent.id && activeTaskStatuses.has(item.status))
      .sort((first, second) => Date.parse(first.dueAt) - Date.parse(second.dueAt))[0] ?? null;
    return { agent, distanceKm: task ? distanceFromLiveLocation(agent, task) : null, status: trackerStatus(agent), task };
  }), [state.agents, state.tasks]);

  const filteredTrackers = useMemo(() => trackers.filter((tracker) => {
    const matchesStatus = status === "All" || tracker.status === status;
    const text = `${tracker.agent.name} ${tracker.agent.employeeCode} ${tracker.agent.city} ${tracker.agent.branchName} ${tracker.task?.customerName ?? ""} ${tracker.task?.referenceNumber ?? ""}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }), [query, status, trackers]);

  const selected = filteredTrackers.find((tracker) => tracker.agent.id === selectedId) ?? filteredTrackers[0] ?? trackers[0] ?? null;
  const mapMarkers = filteredTrackers.flatMap((tracker) => hasFreshCoordinates(tracker.agent) ? [{
    id: tracker.agent.id,
    label: `${tracker.agent.name} - ${tracker.task?.referenceNumber ?? "No active case"} - ${formatDistance(tracker.distanceKm)}`,
    latitude: tracker.agent.latitude,
    longitude: tracker.agent.longitude,
    priority: priorityForStatus(tracker.status),
  }] : []);
  const trails = filteredTrackers.flatMap((tracker) =>
    tracker.task && hasFreshCoordinates(tracker.agent) && hasUsableCoordinates(tracker.task)
      ? [{ color: tracker.agent.id === selected?.agent.id ? "#1454c8" : "#8b9ab0", coordinates: [tracker.agent, tracker.task], id: tracker.agent.id }]
      : [],
  );

  const refreshLiveData = () => {
    void refresh();
    setLastRefresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <PageFrame
      actions={<><StatusDot active label={`${trackers.filter((tracker) => tracker.status !== "Offline" && hasFreshCoordinates(tracker.agent)).length} Agents Reporting`} /><AdminButton onClick={refreshLiveData} icon={<Icon name="refresh" className="h-4 w-4" />}>Refresh</AdminButton></>}
      title="Live Agent Tracking"
      subtitle={`Device-reported agent positions and active case distances from Supabase. Last refreshed ${lastRefresh}.`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-[280px] flex-1" placeholder="Search agent, case, customer, city..." />
        <select value={status} onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number])} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
          {statusOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="overflow-hidden">
          <div className="relative h-[480px] md:h-[560px] xl:h-[640px]">
            {mapMarkers.length ? <OpenStreetMap className="h-full w-full" destinationLabel={selected?.agent.city || "Agent location"} latitude={selected?.agent.latitude} longitude={selected?.agent.longitude} markers={mapMarkers} onMarkerClick={setSelectedId} selectedMarkerId={selected?.agent.id} trails={trails} zoomSpan={0.055} /> : <div className="p-5"><EmptyState title="No live agent coordinates" subtitle="Agents appear here after granting location permission in the mobile app." /></div>}
            {selected ? <div className="absolute left-4 top-4 w-[min(360px,calc(100%-32px))] rounded-[14px] border border-[#d8e3f5] bg-white/95 p-4 shadow-[0_16px_40px_rgba(7,24,63,0.14)] backdrop-blur"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[#8b9ab0]">Selected Agent</p><h3 className="mt-1 text-base font-bold text-[#07183f]">{selected.agent.name}</h3><p className="mt-1 text-sm font-semibold text-[#62728b]">{selected.task?.referenceNumber ?? "No active case"}</p><p className="mt-2 text-sm font-bold text-[#07883a]">{formatDistanceWithContext(selected.distanceKm, "to destination")}</p></div><StatusDot active={selected.status !== "Offline"} label={selected.status} /></div></div> : null}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader title="Live Agents" subtitle={selected ? `Focused on ${selected.agent.name}` : "Supabase field roster"} />
          <div className="admin-scrollbar max-h-[640px] space-y-2 overflow-y-auto p-3">
            {filteredTrackers.map((tracker) => <button key={tracker.agent.id} onClick={() => setSelectedId(tracker.agent.id)} type="button" className={classNames("w-full rounded-[14px] border p-4 text-left transition", selected?.agent.id === tracker.agent.id ? "border-[#1454c8] bg-[#f3f7ff] shadow-sm" : "border-[#dfe7f2] bg-white hover:bg-[#f8fafd]")}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-[#07183f]">{tracker.agent.name}</h3><p className="text-sm text-[#62728b]">{tracker.agent.employeeCode} - {tracker.agent.branchName}</p></div><StatusDot active={tracker.status !== "Offline"} label={tracker.status} /></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><span className="text-[#62728b]">Active case</span><strong className="truncate text-right text-[#1454c8]">{tracker.task?.referenceNumber ?? "None"}</strong><span className="text-[#62728b]">Distance</span><strong className="text-right text-[#07883a]">{tracker.task ? formatDistance(tracker.distanceKm) : "No active case"}</strong><span className="text-[#62728b]">Last GPS update</span><strong className="text-right text-[11px]">{lastSeen(tracker.agent.locationUpdatedAt)}</strong><span className="text-[#62728b]">Accuracy</span><strong className="text-right">{tracker.agent.locationAccuracyMeters === undefined ? "Unavailable" : `${Math.round(tracker.agent.locationAccuracyMeters)} m`}</strong></div></button>)}
            {!filteredTrackers.length ? <EmptyState title="No tracker results" subtitle="Adjust the search text or status filter." /> : null}
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
