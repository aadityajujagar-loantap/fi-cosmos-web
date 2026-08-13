import { useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { fraudAlerts } from "../data/adminData";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel, PanelHeader } from "../ui/Panel";
import { classNames } from "../utils/classNames";

const severities = ["All", "Critical", "High", "Medium", "Low"] as const;

export function FraudPage() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [severity, setSeverity] = useState<(typeof severities)[number]>("All");
  const [notice, setNotice] = useState("");
  const activeAlerts = fraudAlerts.filter((alert) => !dismissed.includes(alert.title));
  const alerts = activeAlerts.filter((alert) => severity === "All" || alert.severity === severity);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <PageFrame
      actions={
        <span className="flex items-center gap-2 rounded-full bg-[#fff0ef] px-4 py-2 text-sm font-bold text-[#d92525]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d92525]" />
          {activeAlerts.length} Active Alerts
        </span>
      }
      title="Fraud Intelligence"
      subtitle="AI-powered fraud detection across field activities"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm font-bold text-[#1454c8]">{notice}</div> : null}
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["7", "GPS Spoof Detected"],
          ["12", "Duplicate Photos"],
          ["3", "Image Tampering"],
          ["4", "Duplicate Customers"],
        ].map(([value, label]) => (
          <article key={label} className="rounded-[14px] border border-[#dfe7f2] bg-white p-5 text-center shadow-[0_1px_2px_rgba(7,24,63,0.04)]">
            <p className="text-3xl font-bold text-[#d92525]">{value}</p>
            <p className="mt-2 text-sm font-semibold text-[#62728b]">{label}</p>
          </article>
        ))}
      </div>
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Active Fraud Alerts"
          actions={
            <>
              <select value={severity} onChange={(event) => setSeverity(event.target.value as (typeof severities)[number])} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
                {severities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <AdminButton onClick={() => showNotice("Fraud alert export prepared for the filtered view.")}>Export</AdminButton>
            </>
          }
        />
        {alerts.length ? (
          alerts.map((alert) => (
            <article key={alert.title} className="grid grid-cols-1 gap-4 border-b border-[#edf1f7] px-5 py-5 last:border-b-0 xl:grid-cols-[48px_1fr_110px_128px]">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0ef] text-[#d92525]">
                <Icon name="shield" />
              </div>
              <div>
                <h4 className="font-bold text-[#07183f]">
                  {alert.title}
                  <span
                    className={classNames(
                      "ml-2 rounded-full px-2 py-1 text-xs",
                      alert.severity === "Critical" ? "bg-[#07183f] text-white" : alert.severity === "Medium" ? "bg-[#fff8eb] text-[#b77900]" : alert.severity === "Low" ? "bg-[#edf2f7] text-[#5c6a85]" : "bg-[#fff0ef] text-[#d92525]",
                    )}
                  >
                    {alert.severity}
                  </span>
                </h4>
                <p className="mt-1 text-sm leading-6 text-[#62728b]">{alert.body}</p>
                <p className="mt-2 text-sm text-[#4b6384]">
                  {alert.agent || "System"} {alert.id ? <span className="ml-4 font-bold text-[#1454c8]"># {alert.id}</span> : null}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#62728b]">{alert.time}</span>
              <div className="space-y-2">
                <AdminButton onClick={() => showNotice(`${alert.title} opened for review.`)} className="w-full" size="sm">
                  Investigate
                </AdminButton>
                <AdminButton onClick={() => setDismissed((current) => [...current, alert.title])} className="w-full" size="sm" variant="ghost">
                  Dismiss
                </AdminButton>
              </div>
            </article>
          ))
        ) : (
          <div className="p-5">
            <EmptyState title="No alerts in this filter" subtitle="Dismissed alerts are removed locally for the demo. Change severity or reset the view to see other alerts." action="Reset Alerts" onAction={() => setDismissed([])} />
          </div>
        )}
      </Panel>
    </PageFrame>
  );
}
