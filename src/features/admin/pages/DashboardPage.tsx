import { useMemo, useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { chartMonths, completedVolume, dashboardMetrics, monthlyVolume, rejectedVolume } from "../data/adminData";
import { DonutChart, LineChart } from "../ui/Charts";
import { MetricCard } from "../ui/MetricCard";
import { Panel, PanelHeader } from "../ui/Panel";

export function DashboardPage() {
  const [period, setPeriod] = useState("FY 2024-25");
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
