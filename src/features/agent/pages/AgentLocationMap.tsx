import { useMemo, useState } from "react";
import type { Step } from "../../../types";
import { OpenStreetMap } from "../components/OpenStreetMap";
import { routeUrl } from "../utils/map";

interface AgentLocationMapProps {
  onBack: () => void;
  onNavigate?: (step: Step) => void;
}

type MapFilter = "All" | "Nearby" | "High" | "Pending";

const mapTasks = [
  { title: "Field Investigation", distance: "2.4 km", distanceValue: 2.4, priority: "HIGH", area: "Baner Road", status: "Pending" },
  { title: "Document Collection", distance: "5.7 km", distanceValue: 5.7, priority: "MEDIUM", area: "Pimpri-Chinchwad", status: "Pending" },
  { title: "KYC Verification", distance: "6.1 km", distanceValue: 6.1, priority: "HIGH", area: "Pune Station", status: "In Progress" },
  { title: "Legal Verification", distance: "7.8 km", distanceValue: 7.8, priority: "LOW", area: "Hinjewadi", status: "Pending" },
];

function priorityClass(priority: string) {
  if (priority === "LOW") return "bg-[#f0fff4] text-[#088d27]";
  if (priority === "MEDIUM") return "bg-[#fff7f0] text-[#e58000]";
  return "bg-[#f0f4ff] text-[#1158d4]";
}

export function AgentLocationMap({ onBack, onNavigate }: AgentLocationMapProps) {
  const [activeFilter, setActiveFilter] = useState<MapFilter>("All");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "Nearby") return mapTasks.filter((task) => task.distanceValue <= 6);
    if (activeFilter === "High") return mapTasks.filter((task) => task.priority === "HIGH");
    if (activeFilter === "Pending") return mapTasks.filter((task) => task.status === "Pending");
    return mapTasks;
  }, [activeFilter]);

  const openRoute = () => {
    window.open(routeUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f] animate-slide-up">
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
          <OpenStreetMap className="h-[310px] w-full" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 shadow-sm">
            <span>
              <span className="block text-xs font-bold">Live location</span>
              <span className="mt-1 block text-[10px] font-medium text-[#088d27]">Accurate to 10 meters</span>
            </span>
            <button onClick={openRoute} type="button" className="h-9 rounded-xl bg-[#1158d4] px-4 text-xs font-bold text-white">Navigate</button>
          </div>
        </section>

        <section className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#edf1f5] px-4 py-3">
            <h2 className="text-sm font-bold">Nearby Tasks</h2>
            <span className="text-[10px] font-bold text-[#1158d4]">{filteredTasks.length} found</span>
          </header>
          <div className="h-full overflow-y-auto pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredTasks.map((task) => (
              <button key={task.title} onClick={() => onNavigate?.("task-details")} type="button" className="flex w-full items-center justify-between gap-3 border-b border-[#edf1f5] px-4 py-3 text-left last:border-b-0 hover:bg-slate-50">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${priorityClass(task.priority)}`}>{task.priority}</span>
                    <span className="truncate text-xs font-bold text-[#07183f]">{task.title}</span>
                  </span>
                  <span className="mt-1.5 block truncate text-[10px] font-medium text-[#5c6a85]">{task.area} . {task.distance}</span>
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
