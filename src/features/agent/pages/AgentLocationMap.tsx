import { useMemo, useState } from "react";
import type { Step } from "../../../types";
import { OpenStreetMap } from "../components/OpenStreetMap";
import { routeUrl } from "../utils/map";
import {
  DEFAULT_USER_LOCATION,
  isTerminalStatus,
  loadAgentTasks,
  setActiveAgentTaskId,
  type AgentTaskRecord,
  type LatLng,
} from "../utils/tasks";

interface AgentLocationMapProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

type MapFilter = "All" | "Nearby" | "High" | "Pending";

function priorityClass(priority: string) {
  if (priority === "LOW") return "bg-[#f0fff4] text-[#088d27]";
  if (priority === "MEDIUM") return "bg-[#fff7f0] text-[#e58000]";
  return "bg-[#f0f4ff] text-[#1158d4]";
}

export function AgentLocationMap({ onBack, onNavigate }: AgentLocationMapProps) {
  const [activeFilter, setActiveFilter] = useState<MapFilter>("All");
  const [tasks] = useState<AgentTaskRecord[]>(() => loadAgentTasks());
  const activeTasks = useMemo(() => tasks.filter((task) => !isTerminalStatus(task.status)), [tasks]);
  const [selectedTaskId, setSelectedTaskId] = useState(() => activeTasks[0]?.id || tasks[0]?.id || "");
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => localStorage.getItem("agent-location-prompt-seen") !== "true");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationStatus, setLocationStatus] = useState("Allow location access to improve route start point.");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "Nearby") return activeTasks.filter((task) => task.distanceValue <= 6);
    if (activeFilter === "High") return activeTasks.filter((task) => task.priority === "HIGH");
    if (activeFilter === "Pending") return activeTasks.filter((task) => task.status === "Pending");
    return activeTasks;
  }, [activeFilter, activeTasks]);

  const selectedTask = filteredTasks.find((task) => task.id === selectedTaskId) || filteredTasks[0] || tasks[0];

  const requestLocation = () => {
    localStorage.setItem("agent-location-prompt-seen", "true");
    setShowLocationPrompt(false);

    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable in this browser. Showing Pune demo routes.");
      return;
    }

    setLocationStatus("Fetching your current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus(`Live location enabled. Accuracy ${Math.round(position.coords.accuracy)} meters.`);
      },
      () => {
        setLocationStatus("Location permission unavailable. Showing Pune demo routes.");
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 },
    );
  };

  const skipLocation = () => {
    localStorage.setItem("agent-location-prompt-seen", "true");
    setShowLocationPrompt(false);
    setLocationStatus("Using Pune demo start point for routes.");
  };

  const openRoute = () => {
    if (!selectedTask) return;
    window.open(routeUrl(selectedTask.latitude, selectedTask.longitude, userLocation || DEFAULT_USER_LOCATION), "_blank", "noopener,noreferrer");
  };

  const openTask = (task: AgentTaskRecord) => {
    setActiveAgentTaskId(task.id);
    onNavigate?.("task-details");
  };

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f] animate-slide-up">
      {showLocationPrompt ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#07183f]/50 px-5">
          <div className="w-full max-w-[360px] rounded-[22px] bg-white p-4 shadow-2xl">
            <h2 className="text-sm font-bold text-[#07183f]">Use current location?</h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">
              The map can use your device location as the route start point. Task pins will still show Pune demo locations.
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={skipLocation} type="button" className="h-11 flex-1 rounded-xl border border-[#d8e0eb] bg-white text-xs font-bold text-[#07183f]">
                Not now
              </button>
              <button onClick={requestLocation} type="button" className="h-11 flex-1 rounded-xl bg-[#1158d4] text-xs font-bold text-white">
                Allow
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
        <header className="relative flex h-12 flex-none items-center justify-center">
          <button onClick={onBack} type="button" aria-label="Back" className="absolute left-0 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M15 5 8 12l7 7M9 12h11" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Location Map</h1>
        </header>

        <div className="mt-3 flex flex-none gap-2">
          {(["All", "Nearby", "High", "Pending"] as MapFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
              className={`h-9 flex-1 rounded-xl text-xs font-bold ${
                activeFilter === filter ? "bg-[#1158d4] text-white" : "border border-[#d8e0eb] bg-white text-[#5c6a85]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="relative mt-4 min-h-[310px] flex-none overflow-hidden rounded-[22px] border border-[#d3e5fe] bg-[#f7faff]">
          <OpenStreetMap
            className="h-[310px] w-full"
            destinationLabel={selectedTask?.address}
            latitude={selectedTask?.latitude || DEFAULT_USER_LOCATION.latitude}
            longitude={selectedTask?.longitude || DEFAULT_USER_LOCATION.longitude}
            markers={filteredTasks.map((task) => ({
              id: task.id,
              label: task.title,
              latitude: task.latitude,
              longitude: task.longitude,
              priority: task.priority,
            }))}
            onMarkerClick={setSelectedTaskId}
            selectedMarkerId={selectedTask?.id}
            userLocation={userLocation || undefined}
            zoomSpan={0.22}
          />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 shadow-sm">
            <span>
              <span className="block text-xs font-bold">Live location</span>
              <span className="mt-1 block max-w-[210px] truncate text-[10px] font-medium text-[#088d27]">{locationStatus}</span>
            </span>
            <button onClick={openRoute} type="button" className="h-9 rounded-xl bg-[#1158d4] px-4 text-xs font-bold text-white">Navigate</button>
          </div>
          <button onClick={requestLocation} type="button" className="absolute bottom-4 right-4 rounded-xl bg-white/95 px-3 py-2 text-[10px] font-bold text-[#1158d4] shadow-sm">
            Use my location
          </button>
        </section>

        <section className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#edf1f5] px-4 py-3">
            <h2 className="text-sm font-bold">Nearby Tasks</h2>
            <span className="text-[10px] font-bold text-[#1158d4]">{filteredTasks.length} found</span>
          </header>
          <div className="h-full overflow-y-auto pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  openTask(task);
                }}
                type="button"
                className={`flex w-full items-center justify-between gap-3 border-b border-[#edf1f5] px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${
                  selectedTask?.id === task.id ? "bg-[#f4f8ff]" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${priorityClass(task.priority)}`}>{task.priority}</span>
                    <span className="truncate text-xs font-bold text-[#07183f]">{task.title}</span>
                  </span>
                  <span className="mt-1.5 block truncate text-[10px] font-medium text-[#5c6a85]">{task.area} . {task.distance} . {task.status}</span>
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-slate-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
