import { useMemo, useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { applicationCases } from "../data/adminData";
import type { ApplicationCase, CaseStatus } from "../types/admin";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel } from "../ui/Panel";
import { PriorityPill, StatusPill } from "../ui/Pills";
import { ScoreRing } from "../ui/ScoreRing";
import { SearchField } from "../ui/SearchField";
import { classNames } from "../utils/classNames";
import { initials } from "../utils/formatters";

const statusTabs = ["All", "Pending", "In Progress", "Completed", "Rejected"] as const;
type SortKey = "amount" | "branch" | "customer" | "id" | "priority" | "status";

function amountNumber(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

export function ApplicationsPage() {
  const [cases, setCases] = useState<ApplicationCase[]>(applicationCases);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"All" | CaseStatus>("All");
  const [branch, setBranch] = useState("All Branches");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ direction: "asc" | "desc"; key: SortKey }>({ direction: "asc", key: "id" });

  const branches = useMemo(() => ["All Branches", ...Array.from(new Set(cases.map((item) => item.branch)))], [cases]);
  const filteredCases = cases.filter((item) => {
    const matchesTab = tab === "All" || item.status === tab;
    const matchesBranch = branch === "All Branches" || item.branch === branch;
    const text = `${item.id} ${item.customer} ${item.phone} ${item.agent} ${item.branch} ${item.type}`.toLowerCase();
    return matchesTab && matchesBranch && text.includes(query.toLowerCase());
  });
  const visibleCases = [...filteredCases].sort((a, b) => {
    const modifier = sort.direction === "asc" ? 1 : -1;
    if (sort.key === "amount") return (amountNumber(a.amount) - amountNumber(b.amount)) * modifier;
    return String(a[sort.key]).localeCompare(String(b[sort.key])) * modifier;
  });
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(visibleCases.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCases = visibleCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resultStart = visibleCases.length ? (currentPage - 1) * pageSize + 1 : 0;
  const resultEnd = visibleCases.length ? Math.min(currentPage * pageSize, visibleCases.length) : 0;
  const counts = {
    All: cases.length,
    Completed: cases.filter((item) => item.status === "Completed").length,
    "In Progress": cases.filter((item) => item.status === "In Progress").length,
    Pending: cases.filter((item) => item.status === "Pending").length,
    Rejected: cases.filter((item) => item.status === "Rejected").length,
  };
  const allPageSelected = pageCases.length > 0 && pageCases.every((item) => selectedIds.includes(item.id));

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const toggleAllVisible = () => {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageCases.some((item) => item.id === id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...pageCases.map((item) => item.id)])));
  };

  const changeSort = (key: SortKey) => {
    setSort((current) => ({
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
      key,
    }));
  };

  const sortLabel = (key: SortKey) => (sort.key === key ? (sort.direction === "asc" ? "up" : "down") : "");

  const resetFilters = () => {
    setQuery("");
    setBranch("All Branches");
    setTab("All");
    setPage(1);
    setSelectedIds([]);
    showNotice("Applications filters reset.");
  };

  const assignSelected = () => {
    const ids = selectedIds.length ? selectedIds : cases.filter((item) => item.status === "Pending").slice(0, 1).map((item) => item.id);
    if (!ids.length) {
      showNotice("No pending applications available for assignment.");
      return;
    }

    setCases((current) => current.map((item) => (ids.includes(item.id) && item.status === "Pending" ? { ...item, status: "In Progress", sla: "6h 00m left" } : item)));
    setSelectedIds([]);
    showNotice(`${ids.length} application${ids.length === 1 ? "" : "s"} moved to In Progress.`);
  };

  return (
    <PageFrame
      actions={
        <>
          <AdminButton onClick={() => showNotice("Filters applied to the local demo dataset.")} icon={<Icon name="filter" className="h-4 w-4" />}>
            Filter
          </AdminButton>
          <AdminButton onClick={resetFilters}>Reset</AdminButton>
          <AdminButton onClick={() => showNotice("Export prepared for the filtered table view.")}>Export</AdminButton>
          <AdminButton onClick={assignSelected} variant="primary">
            + Assign Case
          </AdminButton>
        </>
      }
      title="Applications"
      subtitle="Search, triage, and assign investigation cases"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#edf1f7] p-4">
          <SearchField value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="flex-1" placeholder="Search by case ID, customer, agent, branch..." />
          <select value={branch} onChange={(event) => { setBranch(event.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm font-bold text-[#07183f]">
            {branches.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-[#edf1f7] px-4 py-3">
          {statusTabs.map((item) => (
            <button
              key={item}
              onClick={() => { setTab(item); setPage(1); }}
              type="button"
              className={classNames("shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition", tab === item ? "bg-[#1454c8] text-white" : "bg-white text-[#4b6384] hover:bg-[#f7faff]")}
            >
              {item}
              <span className={classNames("ml-2 rounded-full px-2 py-0.5", tab === item ? "bg-white/20" : "bg-[#e8eefb] text-[#1454c8]")}>{counts[item]}</span>
            </button>
          ))}
        </div>
        {visibleCases.length ? (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[#f8fafd] text-[11px] font-bold uppercase tracking-[0.04em] text-[#62728b]">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input checked={allPageSelected} onChange={toggleAllVisible} type="checkbox" aria-label="Select visible applications" />
                  </th>
                  <th className="w-[18%] px-3 py-3"><button onClick={() => changeSort("id")} type="button">Case / Loan {sortLabel("id")}</button></th>
                  <th className="w-[20%] px-3 py-3"><button onClick={() => changeSort("customer")} type="button">Customer {sortLabel("customer")}</button></th>
                  <th className="w-[19%] px-3 py-3"><button onClick={() => changeSort("branch")} type="button">Branch / Agent {sortLabel("branch")}</button></th>
                  <th className="w-[14%] px-3 py-3 text-right"><button onClick={() => changeSort("amount")} type="button">Amount / SLA {sortLabel("amount")}</button></th>
                  <th className="w-[15%] px-3 py-3"><button onClick={() => changeSort("status")} type="button">Status {sortLabel("status")}</button></th>
                  <th className="w-[72px] px-3 py-3 text-center">AI</th>
                </tr>
              </thead>
              <tbody>
                {pageCases.map((item) => (
                  <tr key={item.id} className={classNames("border-t border-[#edf1f7] transition hover:bg-[#f8fafd]", selectedIds.includes(item.id) && "bg-[#f3f7ff]")}>
                    <td className="px-3 py-4">
                      <input
                        checked={selectedIds.includes(item.id)}
                        onChange={() => setSelectedIds((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]))}
                        type="checkbox"
                        aria-label={`Select ${item.id}`}
                      />
                    </td>
                    <td className="min-w-0 px-3 py-4">
                      <p className="truncate font-bold text-[#1454c8]">{item.id}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-[#4b6384]">{item.loan}</p>
                      <p className="mt-0.5 truncate text-xs text-[#7b8faa]">{item.type}</p>
                    </td>
                    <td className="min-w-0 px-3 py-4">
                      <p className="truncate font-bold text-[#07183f]">{item.customer}</p>
                      <p className="mt-0.5 truncate text-xs text-[#62728b]">{item.phone}</p>
                    </td>
                    <td className="min-w-0 px-3 py-4 text-[#4b6384]">
                      <p className="truncate font-semibold">{item.branch}</p>
                      <p className="truncate text-xs text-[#7b8faa]">{item.region}</p>
                      <p className="mt-2 flex min-w-0 items-center gap-2 font-medium text-[#07183f]">
                        <span className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[11px] font-bold text-[#1454c8]">{initials(item.agent)}</span>
                        <span className="min-w-0 truncate">{item.agent}</span>
                      </p>
                    </td>
                    <td className="min-w-0 px-3 py-4 text-right">
                      <p className="truncate font-bold text-[#07183f]">{item.amount}</p>
                      <p className="mt-1 truncate text-xs font-bold text-[#b77900]">{item.sla}</p>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex min-w-0 flex-col items-start gap-2 overflow-hidden">
                        <PriorityPill priority={item.priority} />
                        <StatusPill status={item.status} />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-center">
                        <ScoreRing score={item.aiScore} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No applications match this view"
              subtitle="Adjust the status tab, branch filter, or search phrase to return applications from the demo dataset."
              action="Clear Search"
              onAction={() => {
                setQuery("");
                setBranch("All Branches");
                setTab("All");
              }}
            />
          </div>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f7] px-4 py-3 text-xs font-semibold text-[#62728b]">
          <span>
            Showing {resultStart}-{resultEnd} of {visibleCases.length} applications
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span>{selectedIds.length} selected</span>
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} type="button" className="rounded-lg border border-[#d8e3f5] px-3 py-1 disabled:opacity-50">Prev</button>
            <span>Page {currentPage} / {totalPages}</span>
            <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} type="button" className="rounded-lg border border-[#d8e3f5] px-3 py-1 disabled:opacity-50">Next</button>
          </div>
        </footer>
      </Panel>
    </PageFrame>
  );
}
