import type { CaseStatus, Priority } from "../types/admin";
import { classNames } from "../utils/classNames";

export function StatusPill({ status }: { status: CaseStatus }) {
  const styles: Record<CaseStatus, string> = {
    Completed: "bg-[#ecfaef] text-[#088d27]",
    "In Progress": "bg-[#edf4ff] text-[#1158d4]",
    Pending: "bg-[#fff8eb] text-[#b77900]",
    Rejected: "bg-[#fff0ef] text-[#ee0f1a]",
  };

  return <span className={classNames("inline-flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", styles[status])}>{status}</span>;
}

export function PriorityPill({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    High: "bg-[#fff0ef] text-[#ee0f1a]",
    Low: "bg-[#edf2f7] text-[#5c6a85]",
    Medium: "bg-[#fff8eb] text-[#b77900]",
  };

  return <span className={classNames("inline-flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", styles[priority])}>{priority}</span>;
}
