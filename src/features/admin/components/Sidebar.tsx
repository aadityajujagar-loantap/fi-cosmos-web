import { adminRoutes } from "../data/adminData";
import type { AdminRoute } from "../types/admin";
import { Icon } from "../ui/Icon";
import { classNames } from "../utils/classNames";

interface SidebarProps {
  activeRoute: AdminRoute;
  onLogout: () => void;
  onNavigate: (route: AdminRoute) => void;
}

export function Sidebar({ activeRoute, onLogout, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-[86px] flex-none flex-col border-r border-[#dfe7f2] bg-white xl:w-[268px]">
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
      <div className="border-t border-[#dfe7f2] p-4">
        <div className="flex items-center justify-center gap-3 xl:justify-start">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1454c8] text-sm font-bold text-white">RK</div>
          <div className="hidden xl:block">
            <p className="text-sm font-bold text-[#07183f]">Rahul Kapoor</p>
            <p className="text-xs font-medium text-[#7b8faa]">Super Admin</p>
          </div>
        </div>
        <button onClick={onLogout} type="button" className="mt-4 hidden text-sm font-bold text-[#d92525] xl:block">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
