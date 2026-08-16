import { useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { chartMonths, completedVolume, fieldAgents, monthlyVolume, rejectedVolume, tatTrend } from "../data/adminData";
import { AdminButton } from "../ui/AdminButton";
import { BarChart, LineChart } from "../ui/Charts";
import { Panel, PanelHeader } from "../ui/Panel";
import { SegmentedTabs } from "../ui/SegmentedTabs";

export function AnalyticsPage() {
  const [tab, setTab] = useState<"Overview" | "TAT Analysis" | "By Region" | "Agent Stats">("Overview");
  const [period, setPeriod] = useState("Last 6 Months");
  const labels = period === "Current Quarter" ? chartMonths.slice(-3) : chartMonths;
  const assigned = period === "Current Quarter" ? monthlyVolume.slice(-3) : monthlyVolume;
  const completed = period === "Current Quarter" ? completedVolume.slice(-3) : completedVolume;
  const rejected = period === "Current Quarter" ? rejectedVolume.slice(-3) : rejectedVolume;
  const tat = period === "Current Quarter" ? tatTrend.slice(-3) : tatTrend;
  const primaryChart =
    tab === "Agent Stats"
      ? { labels: fieldAgents.map((agent) => agent.initials), title: "Agent Productivity", values: fieldAgents.map((agent) => agent.done) }
      : tab === "By Region"
        ? { labels: ["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad"], title: "Region Performance", values: [1260, 1120, 980, 840, 700, 560] }
        : { labels, title: "Monthly Volume", values: assigned };

  return (
    <PageFrame
      actions={
        <>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-11 rounded-2xl border border-[#d8e3f5] bg-white px-4 text-sm font-bold">
            <option>Last 6 Months</option>
            <option>Current Quarter</option>
          </select>
          <AdminButton onClick={() => window.print()}>
            Print / Save PDF
          </AdminButton>
        </>
      }
      title="Analytics"
      subtitle="Performance trends and compliance health"
    >
      <div className="mb-5 overflow-x-auto">
        <SegmentedTabs items={["Overview", "TAT Analysis", "By Region", "Agent Stats"] as const} value={tab} onChange={setTab} />
      </div>
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        <Panel>
          <PanelHeader title={primaryChart.title} subtitle={tab === "Agent Stats" ? "Completed cases by field agent" : "Total cases processed in the selected view"} />
          <div className="px-4 py-5">
            <BarChart
              labels={primaryChart.labels}
              values={primaryChart.values}
              series={tab === "Overview" || tab === "TAT Analysis" ? [
                { color: "#1454c8", label: "Assigned", values: assigned },
                { color: "#07883a", label: "Completed", values: completed },
                { color: "#d92525", label: "Rejected", values: rejected },
              ] : [{ color: "#1454c8", label: primaryChart.title, values: primaryChart.values }]}
            />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Average TAT Trend" subtitle="Days to complete a case, target below 2.0d" />
          <div className="px-4 py-5">
            <LineChart labels={labels} values={tat} series={[{ color: "#1454c8", label: "Average TAT", values: tat }]} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Region Performance" subtitle="Cases by geography" />
          <div className="mt-5 space-y-4">
            {["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad"].map((region, index) => (
              <div key={region} className="grid grid-cols-[100px_1fr_52px] items-center gap-4 px-5 text-sm">
                <span className="text-right text-[#5c6a85]">{region}</span>
                <span className="h-7 rounded-r-lg bg-[#1454c8]" style={{ width: `${95 - index * 11}%` }} />
                <strong>{1260 - index * 140}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Compliance Dashboard" subtitle="GPS and photo compliance by month" />
          <div className="grid grid-cols-2 gap-4 p-5">
            {[
              ["94.2%", "GPS Compliance", "#1454c8"],
              ["97.8%", "Photo Compliance", "#08b94e"],
              ["88.4%", "On-Time Cases", "#6a5cff"],
              ["91.2%", "Agent Active Rate", "#12b7ca"],
            ].map(([value, label, color]) => (
              <div key={label} className="rounded-xl border border-[#edf1f7] bg-[#f8fafd] p-5 text-center">
                <p className="text-2xl font-bold" style={{ color }}>
                  {value}
                </p>
                <p className="text-sm text-[#5c6a85]">{label}</p>
                <p className="text-xs font-bold text-[#08b94e]">Target: 95%</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
