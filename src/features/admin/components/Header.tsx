import { useEffect, useRef, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { selectNotifications, selectUnreadCount } from "../../../domain/selectors";
import { adminService, notificationService } from "../../../data/services";
import { useAuth } from "../../../auth/authContext";
import { adminRoutes } from "../data/adminData";
import type { AdminRoute } from "../types/admin";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";
import { SearchField } from "../ui/SearchField";

interface HeaderProps {
  onLogout: () => void;
  onNavigate: (route: AdminRoute) => void;
  route: AdminRoute;
}

export function Header({ onLogout, onNavigate, route }: HeaderProps) {
  const { state, adminActor } = useAppData();
  const { profile } = useAuth();
  const routeLabel = adminRoutes.find((item) => item.id === route)?.label || "Dashboard";
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notifications = selectNotifications(state, adminActor.id);
  const unreadCount = selectUnreadCount(state, adminActor.id);

  const searchResults = search.trim()
    ? [
        ...adminRoutes
          .filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
          .map((item) => ({ id: item.id, label: item.label, meta: "Route", route: item.id })),
        ...state.tasks
          .filter((item) => `${item.id} ${item.customerName} ${item.branchName}`.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 4)
          .map((item) => ({ id: item.id, label: item.customerName, meta: item.id, route: "applications" as AdminRoute })),
        ...state.agents
          .filter((item) => `${item.name} ${item.employeeCode} ${item.branchName}`.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 4)
          .map((item) => ({ id: item.id, label: item.name, meta: item.employeeCode, route: "agents" as AdminRoute })),
      ].slice(0, 6)
    : [];

  useEffect(() => {
    if (!profileOpen && !notificationsOpen) return;

    const closeOnPointerDown = (event: MouseEvent) => {
      if (profileRef.current?.contains(event.target as Node)) return;
      if (notificationRef.current?.contains(event.target as Node)) return;
      setProfileOpen(false);
      setNotificationsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("mousedown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen, profileOpen]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2000);
  };

  return (
    <header className="flex min-h-[72px] flex-none items-center justify-between gap-5 border-b border-[#dfe7f2] bg-white px-5 xl:px-7">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-[#07183f] xl:text-xl">{routeLabel}</h1>
        <p className="mt-1 truncate text-xs font-semibold text-[#62728b] xl:text-sm">iFLOW Smart Field Intelligence Platform</p>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative hidden xl:block">
          <SearchField value={search} onChange={(event) => setSearch(event.target.value)} className="w-[300px]" placeholder="Search cases, agents..." />
          {search.trim() ? (
            <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[360px] overflow-hidden rounded-[14px] border border-[#dfe7f2] bg-white shadow-[0_18px_46px_rgba(7,24,63,0.16)]">
              {searchResults.length ? (
                searchResults.map((result) => (
                  <button
                    key={`${result.meta}-${result.id}`}
                    onClick={() => {
                      onNavigate(result.route);
                      setSearch("");
                    }}
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-[#edf1f7] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8fafd]"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf4ff] text-[#1454c8]">
                      <Icon name="search" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[#07183f]">{result.label}</span>
                      <span className="text-xs font-semibold text-[#62728b]">{result.meta}</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-sm font-semibold text-[#62728b]">No matching route, case, or agent.</div>
              )}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          title="Refresh"
          onClick={() => showNotice("Dashboard data refreshed locally.")}
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8e3f5] bg-white text-[#5c6a85] transition hover:bg-[#f7faff]"
        >
          <Icon name="refresh" className="h-4 w-4" />
        </button>
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            title="Notifications"
            onClick={() => setNotificationsOpen((current) => !current)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#d8e3f5] bg-white text-[#5c6a85] transition hover:bg-[#f7faff]"
          >
            {unreadCount ? <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#ee0f1a] px-1 text-[9px] font-bold text-white">{unreadCount}</span> : null}
            <Icon name="bell" className="h-4 w-4" />
          </button>
          {notificationsOpen ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[340px] overflow-hidden rounded-[16px] border border-[#dfe7f2] bg-white shadow-[0_22px_60px_rgba(7,24,63,0.18)]">
              <div className="border-b border-[#edf1f7] px-4 py-3">
                <p className="text-sm font-bold text-[#07183f]">Notifications</p>
                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#62728b]">Workflow alerts</p>{unreadCount ? <button onClick={() => void notificationService.markAllRead(adminActor.id)} type="button" className="text-xs font-bold text-[#1454c8]">Mark all read</button> : null}</div>
              </div>
              {notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    void notificationService.markRead(adminActor.id, notification.id);
                    if (notification.taskId) {
                      window.localStorage.setItem("iflow-admin-open-task", notification.taskId);
                      window.dispatchEvent(new CustomEvent("iflow-open-admin-task", { detail: notification.taskId }));
                    }
                    onNavigate("applications");
                    setNotificationsOpen(false);
                  }}
                  type="button"
                  className={`w-full border-b border-[#edf1f7] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8fafd] ${notification.read ? "bg-white" : "bg-[#f3f7ff]"}`}
                >
                  <span className="block text-sm font-bold text-[#07183f]">{notification.title}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-[#62728b]">{notification.message}</span>
                </button>
              ))}
              {!notifications.length ? <p className="px-4 py-5 text-sm font-semibold text-[#62728b]">No workflow notifications.</p> : null}
            </div>
          ) : null}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((current) => !current)}
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="dialog"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#1454c8] text-sm font-bold text-white shadow-sm transition hover:bg-[#0f49b4]"
          >
            FC
          </button>
          {profileOpen ? (
            <div role="dialog" aria-label="Admin profile" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] overflow-hidden rounded-[16px] border border-[#dfe7f2] bg-white shadow-[0_22px_60px_rgba(7,24,63,0.18)]">
              <div className="border-b border-[#edf1f7] bg-[#f8fafd] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1454c8] text-base font-bold text-white">FC</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#07183f]">{profile?.displayName || "Admin"}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#62728b]">Super Admin</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="rounded-xl border border-[#edf1f7] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4ff] text-[#1454c8]">
                      <Icon name="user" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Username</p>
                      <p className="text-sm font-bold text-[#07183f]">{profile?.email || "Admin"}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#edf1f7] bg-[#f8fafd] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Role</p>
                    <p className="mt-1 text-sm font-bold text-[#07183f]">Super Admin</p>
                  </div>
                  <div className="rounded-xl border border-[#edf1f7] bg-[#f8fafd] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Status</p>
                    <p className="mt-1 text-sm font-bold text-[#07883a]">Verified</p>
                  </div>
                </div>
                <p className="px-1 text-xs font-semibold text-[#62728b]">{profile?.email}</p>
                <AdminButton onClick={() => { if (window.confirm("Reset all cases, notifications, activity, and evidence to the canonical dry-run state?")) { void adminService.resetDryRunData().then(() => { setProfileOpen(false); showNotice("Dry-run data reset completed."); }).catch((caught: unknown) => showNotice(caught instanceof Error ? caught.message : "Reset failed.")); } }} className="w-full">Reset Dry Run Data</AdminButton>
                <AdminButton onClick={onLogout} variant="danger" className="w-full" icon={<Icon name="logout" className="h-4 w-4" />}>
                  Logout
                </AdminButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {notice ? <div className="fixed right-5 top-20 z-50 rounded-xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm font-bold text-[#1454c8] shadow-[0_14px_34px_rgba(7,24,63,0.14)]">{notice}</div> : null}
    </header>
  );
}
