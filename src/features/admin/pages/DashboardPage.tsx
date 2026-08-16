import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { selectTaskCounts } from "../../../domain/selectors";
import { PageFrame } from "../components/PageFrame";
import { chartMonths, completedVolume, monthlyVolume, rejectedVolume } from "../data/adminData";
import { DonutChart, LineChart } from "../ui/Charts";
import { MetricCard } from "../ui/MetricCard";
import { Panel, PanelHeader } from "../ui/Panel";

export function DashboardPage() {
  const { state } = useAppData();
  const [period, setPeriod] = useState("FY 2024-25");
  const counts = selectTaskCounts(state);
  const dashboardMetrics = [
    { color: "#1454c8", context: "Shared investigation ledger", delta: "Live", icon: "file", label: "Total Cases", value: String(counts.total) },
    { color: "#b77900", context: "Awaiting assignment", delta: "Action", icon: "clipboard", label: "Unassigned", value: String(counts.unassigned) },
    { color: "#4f5bea", context: "Agent work underway", delta: "Live", icon: "refresh", label: "Active", value: String(counts.active) },
    { color: "#6b45d8", context: "Ready for Admin review", delta: "Review", icon: "target", label: "Submitted", value: String(counts.submitted) },
    { color: "#07883a", context: "Approved and closed", delta: "Done", icon: "target", label: "Completed", value: String(counts.completed) },
    { color: "#d92525", context: "Past due and still active", delta: "SLA", icon: "shield", label: "Overdue", value: String(counts.overdue) },
    { color: "#d92525", context: "Rejected investigations", delta: "Closed", icon: "shield", label: "Rejected", value: String(counts.rejected) },
    { color: "#0f8ea1", context: "Active field agents", delta: "Roster", icon: "map", label: "Available Agents", value: String(state.agents.filter((agent) => agent.active && agent.availability !== "OFFLINE").length) },
  ];
  const chartData = useMemo(() => {
    if (period === "Current Quarter") {
      return {
        completed: completedVolume.slice(-3),
        labels: chartMonths.slice(-3),
        rejected: rejectedVolume.slice(-3),
        total: monthlyVolume.slice(-3),
      };
    }

    return {
      completed: completedVolume,
      labels: chartMonths,
      rejected: rejectedVolume,
      total: monthlyVolume,
    };
  }, [period]);

  return (
    <PageFrame
      actions={
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
          <option>FY 2024-25</option>
          <option>Current Quarter</option>
        </select>
      }
      title="Dashboard"
      subtitle="Operational snapshot for field investigation management"
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <Panel>
          <PanelHeader title="Case Trend - Last 6 Months" subtitle="Assigned, completed, and rejected cases from the active mock case ledger" />
          <div className="px-4 py-5">
            <LineChart
              labels={chartData.labels}
              values={chartData.total}
              series={[
                { color: "#1454c8", label: "Assigned", values: chartData.total },
                { color: "#07883a", label: "Completed", values: chartData.completed },
                { color: "#d92525", label: "Rejected", values: chartData.rejected },
              ]}
            />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Investigation Types" subtitle="Distribution this month" />
          <div className="px-4 py-5">
            <DonutChart />
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
