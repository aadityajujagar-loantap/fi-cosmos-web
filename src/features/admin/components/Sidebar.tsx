import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../auth/authContext";
import { useAppData } from "../../../data/dataContext";
import { selectNotifications, selectUnreadCount } from "../../../domain/selectors";
import { notificationService } from "../../../data/services";
import { adminRoutes } from "../data/adminData";
import type { AdminRoute } from "../types/admin";
import { Icon } from "../ui/Icon";
import { classNames } from "../utils/classNames";
import { AdminButton } from "../ui/AdminButton";

interface SidebarProps {
  activeRoute: AdminRoute;
  onLogout: () => void;
  onNavigate: (route: AdminRoute) => void;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

const dateTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export function Sidebar({ activeRoute, onLogout, onNavigate }: SidebarProps) {
  const { state, adminActor } = useAppData();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "profile">("notifications");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const notifications = selectNotifications(state, adminActor.id);
  const unreadCount = selectUnreadCount(state, adminActor.id);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnPointerDown = (event: MouseEvent) => {
      if (popoverRef.current?.contains(event.target as Node)) return;
      if (triggerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("mousedown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: typeof notifications[number]) => {
    void notificationService.markRead(adminActor.id, notification.id);
    if (notification.taskId) {
      window.localStorage.setItem("iflow-admin-open-task", notification.taskId);
      window.dispatchEvent(new CustomEvent("iflow-open-admin-task", { detail: notification.taskId }));
    }
    onNavigate("applications");
    setIsOpen(false);
  };

  return (
    <aside className="relative flex h-screen w-[86px] flex-none flex-col border-r border-[#dfe7f2] bg-white xl:w-[268px]">



      <div className="flex min-h-[72px] items-center justify-center gap-3 px-3 xl:justify-start xl:px-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1454c8] text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m13 2-8 12h7l-1 8 8-12h-7z" />
          </svg>
        </div>
        <span className="hidden text-xl font-bold text-[#1454c8] xl:inline">iFLOW</span>
      </div>
      
      <nav className="admin-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        {adminRoutes.map((route) => (
          <button
            key={route.id}
            onClick={() => onNavigate(route.id)}
            type="button"
            className={classNames(
              "flex h-11 w-full items-center justify-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition xl:justify-start",
              activeRoute === route.id ? "bg-[#1454c8] text-white shadow-[0_8px_18px_rgba(20,84,200,0.18)]" : "bg-transparent text-[#4b6384] hover:bg-[#f4f7ff]",
            )}
            title={route.label}
          >
            <Icon name={route.icon} />
            <span className="hidden xl:inline">{route.label}</span>
          </button>
        ))}
      </nav>

      {/* Clickable bottom profile component */}
      <div className="relative border-t border-[#dfe7f2] p-4">
        {isOpen && (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Admin settings and notifications"
            className="absolute bottom-[72px] left-2 z-50 w-[300px] sm:w-[340px] overflow-hidden rounded-[16px] border border-[#dfe7f2] bg-white shadow-[0_12px_40px_rgba(7,24,63,0.16)] xl:left-4"
          >
            {/* Header Tab Switcher */}
            <div className="flex border-b border-[#edf1f7] bg-[#f8fafd] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={classNames(
                  "flex-1 py-3 text-center transition border-b-2",
                  activeTab === "notifications" ? "border-[#1454c8] text-[#1454c8] bg-white" : "border-transparent text-[#62728b] hover:bg-[#f3f7ff]",
                )}
              >
                Alerts {unreadCount > 0 ? `(${unreadCount})` : ""}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={classNames(
                  "flex-1 py-3 text-center transition border-b-2",
                  activeTab === "profile" ? "border-[#1454c8] text-[#1454c8] bg-white" : "border-transparent text-[#62728b] hover:bg-[#f3f7ff]",
                )}
              >
                Profile Settings
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === "notifications" ? (
              <div className="max-h-[320px] overflow-y-auto admin-scrollbar">
                <div className="flex items-center justify-between border-b border-[#edf1f7] px-4 py-2 bg-[#fdfeff]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Operational alerts</span>
                  {unreadCount > 0 ? (
                    <button
                      onClick={() => void notificationService.markAllRead(adminActor.id)}
                      type="button"
                      className="text-xs font-bold text-[#1454c8] hover:underline"
                    >
                      Mark all read
                    </button>
                  ) : null}
                </div>
                {notifications.slice(0, 8).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    type="button"
                    className={classNames(
                      "w-full border-b border-[#edf1f7] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f8fafd]",
                      notification.read ? "bg-white" : "bg-[#f3f7ff]",
                    )}
                  >
                    <span className="block text-sm font-bold text-[#07183f]">{notification.title}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-[#62728b]">{notification.message}</span>
                    <span className="mt-1 block text-[10px] text-[#8b9ab0]">{dateTime(notification.createdAt)}</span>
                  </button>
                ))}
                {!notifications.length ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-[#62728b]">No active notifications.</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-4 space-y-3.5">
                <div className="rounded-xl border border-[#edf1f7] bg-[#f8fafd] p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4ff] text-[#1454c8] font-bold">
                      {profile?.displayName ? initials(profile.displayName) : "AD"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#07183f]">{profile?.displayName || "Admin"}</p>
                      <p className="text-xs font-semibold text-[#62728b]">{profile?.email || "Admin"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-sm">
                  <div className="rounded-xl border border-[#edf1f7] p-3 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Access Role</p>
                    <p className="mt-0.5 text-sm font-bold text-[#07183f]">Super Admin</p>
                  </div>
                  <div className="rounded-xl border border-[#edf1f7] p-3 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8b9ab0]">Connection</p>
                    <p className="mt-0.5 text-sm font-bold text-[#07883a]">Active</p>
                  </div>
                </div>

                <AdminButton
                  onClick={onLogout}
                  variant="danger"
                  className="w-full text-xs"
                  icon={<Icon name="logout" className="h-4 w-4" />}
                >
                  Sign Out
                </AdminButton>
              </div>
            )}
          </div>
        )}

        <button
          ref={triggerRef}
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-center gap-3 rounded-xl p-2 text-left hover:bg-[#f4f7ff] xl:justify-start"
        >
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1454c8] text-sm font-bold text-white shadow-sm hover:bg-[#0f49b4] transition">
              {profile?.displayName ? initials(profile.displayName) : "AD"}
            </div>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#ee0f1a] text-[9px] font-bold text-white shadow-[0_0_0_2px_#fff]">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="hidden min-w-0 flex-1 xl:block">
            <p className="truncate text-sm font-bold text-[#07183f]">{profile?.displayName || "Admin"}</p>
            <p className="text-xs font-semibold text-[#7b8faa]">Super Admin</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
