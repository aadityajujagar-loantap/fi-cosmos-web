import { useMemo, useState } from "react";

import { OpenStreetMap } from "../../agent/components/OpenStreetMap";
import { PageFrame } from "../components/PageFrame";
import { liveAgentTrackers } from "../data/adminData";
import type { AgentTrackerStatus, LiveAgentTracker } from "../types/admin";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel, PanelHeader } from "../ui/Panel";
import { SearchField } from "../ui/SearchField";
import { StatusDot } from "../ui/StatusDot";
import { classNames } from "../utils/classNames";

const statusOptions = ["All", "Active", "On Break", "Offline"] as const;

function statusPriority(status: AgentTrackerStatus): "HIGH" | "MEDIUM" | "LOW" {
  if (status === "Active") return "LOW";
  if (status === "On Break") return "MEDIUM";
  return "HIGH";
}

function statusColor(status: AgentTrackerStatus) {
  if (status === "Active") return "#07883a";
  if (status === "On Break") return "#b77900";
  return "#d92525";
}

export function LiveTrackingPage() {
  const [trackers, setTrackers] = useState<LiveAgentTracker[]>(liveAgentTrackers);
  const [selectedCode, setSelectedCode] = useState(liveAgentTrackers[0]?.agentCode ?? "");
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("All");
  const [notice, setNotice] = useState("");

  const filteredTrackers = useMemo(
    () =>
      trackers.filter((tracker) => {
        const matchesStatus = status === "All" || tracker.status === status;
        const text = `${tracker.agentName} ${tracker.agentCode} ${tracker.area} ${tracker.customer} ${tracker.activeCaseId}`.toLowerCase();
        return matchesStatus && text.includes(query.toLowerCase());
      }),
    [query, status, trackers],
  );
  const selectedAgent = filteredTrackers.find((agent) => agent.agentCode === selectedCode) ?? filteredTrackers[0] ?? trackers[0];
  const selectedId = selectedAgent?.agentCode ?? "";

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const handleMarkerDrag = (id: string, location: { latitude: number; longitude: number }) => {
    setTrackers((current) =>
      current.map((tracker) =>
        tracker.agentCode === id
          ? {
              ...tracker,
              latitude: Number(location.latitude.toFixed(6)),
              longitude: Number(location.longitude.toFixed(6)),
              sync: "Live drag",
            }
          : tracker,
      ),
    );
  };

  const handleMarkerDragEnd = (id: string, location: { latitude: number; longitude: number }) => {
    handleMarkerDrag(id, location);
    showNotice(`${trackers.find((tracker) => tracker.agentCode === id)?.agentName || "Agent"} location updated locally.`);
  };

  const resetView = () => {
    setQuery("");
    setStatus("All");
    setTrackers(liveAgentTrackers);
    setSelectedCode(liveAgentTrackers[0]?.agentCode ?? "");
    showNotice("Tracker view reset to Pune operations.");
  };

  return (
    <PageFrame
      actions={
        <>
          <StatusDot active label={`${filteredTrackers.filter((agent) => agent.status === "Active").length} Agents Live`} />
          <AdminButton onClick={() => setLastRefresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Refresh
          </AdminButton>
          <AdminButton onClick={resetView}>Reset</AdminButton>
        </>
      }
      title="Live Agent Tracking"
      subtitle={`Interactive Pune field map. Click or drag markers; list and map stay synchronized. Last refreshed ${lastRefresh}.`}
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm font-bold text-[#1454c8]">{notice}</div> : null}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-[280px] flex-1" placeholder="Search agent, case, customer, Pune area..." />
        <select value={status} onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number])} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
          {statusOptions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="overflow-hidden">
          <div className="relative h-[480px] md:h-[560px] xl:h-[640px]">
            {filteredTrackers.length ? (
              <OpenStreetMap
                className="h-full w-full"
                destinationLabel={selectedAgent?.area || "Pune"}
                draggableMarkerId={selectedId}
                latitude={selectedAgent?.latitude}
                longitude={selectedAgent?.longitude}
                markers={filteredTrackers.map((tracker) => ({
                  id: tracker.agentCode,
                  label: `${tracker.agentName} - ${tracker.area} - ${tracker.activeCaseId}`,
                  latitude: tracker.latitude,
                  longitude: tracker.longitude,
                  priority: statusPriority(tracker.status),
                }))}
                onMarkerClick={(id) => setSelectedCode(id)}
                onMarkerDrag={handleMarkerDrag}
                onMarkerDragEnd={handleMarkerDragEnd}
                selectedMarkerId={selectedId}
                trails={filteredTrackers.map((tracker) => ({
                  color: tracker.agentCode === selectedId ? "#1454c8" : statusColor(tracker.status),
                  coordinates: tracker.path,
                  id: tracker.agentCode,
                }))}
                zoomSpan={0.055}
              />
            ) : (
              <div className="p-5">
                <EmptyState title="No tracked agents match this view" subtitle="Adjust the search text or status filter to restore markers on the Pune tracker." action="Reset Tracker" onAction={resetView} />
              </div>
            )}
            {selectedAgent ? (
              <div className="absolute left-4 top-4 w-[min(360px,calc(100%-32px))] rounded-[14px] border border-[#d8e3f5] bg-white/95 p-4 shadow-[0_16px_40px_rgba(7,24,63,0.14)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8b9ab0]">Selected Agent</p>
                    <h3 className="mt-1 text-base font-bold text-[#07183f]">{selectedAgent.agentName}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#62728b]">{selectedAgent.area} - {selectedAgent.activeCaseId}</p>
                  </div>
                  <StatusDot active={selectedAgent.status === "Active"} label={selectedAgent.status} />
                </div>
              </div>
            ) : null}
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <PanelHeader title="Live Agents" subtitle={selectedAgent ? `Focused on ${selectedAgent.agentName}` : "Filtered field roster"} />
          <div className="admin-scrollbar max-h-[640px] space-y-2 overflow-y-auto p-3">
            {filteredTrackers.map((agent) => (
              <button
                key={agent.agentCode}
                onClick={() => setSelectedCode(agent.agentCode)}
                type="button"
                className={classNames("w-full rounded-[14px] border p-4 text-left transition", selectedId === agent.agentCode ? "border-[#1454c8] bg-[#f3f7ff] shadow-sm" : "border-[#dfe7f2] bg-white hover:bg-[#f8fafd]")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1454c8] font-bold text-white">{agent.initials}</div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-[#07183f]">{agent.agentName}</h3>
                      <p className="text-sm text-[#62728b]">{agent.area} - {agent.branch}</p>
                    </div>
                  </div>
                  <StatusDot active={agent.status === "Active"} label={agent.status === "On Break" ? "Break" : agent.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#62728b]">Customer</span>
                  <strong className="truncate text-right text-[#1454c8]">{agent.customer}</strong>
                  <span className="text-[#62728b]">Battery</span>
                  <strong className="text-right text-[#07883a]">{agent.battery}%</strong>
                  <span className="text-[#62728b]">Coordinates</span>
                  <strong className="text-right text-[11px]">{agent.latitude.toFixed(4)}, {agent.longitude.toFixed(4)}</strong>
                  <span className="text-[#62728b]">ETA</span>
                  <strong className="text-right text-[#4f5bea]">{agent.eta}</strong>
                </div>
              </button>
            ))}
            {!filteredTrackers.length ? <EmptyState title="No tracker results" subtitle="Search and status filters affect both the map and roster." action="Reset Tracker" onAction={resetView} /> : null}
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
