import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../auth/authContext";
import { useAppData } from "../../../data/dataContext";
import { AdminContent } from "../components/AdminContent";
import { Sidebar } from "../components/Sidebar";
import { adminRoutes } from "../data/adminData";
import { AdminLoginPage } from "./AdminLoginPage";
import type { AdminRoute } from "../types/admin";
import { currentRouteFromPath, routePath } from "../utils/routes";
import "../styles/admin.css";

export function AdminPortal() {
  const { loading, profile, signIn, signOut } = useAuth();
  const { loading: dataLoading, error: dataError } = useAppData();
  const [route, setRoute] = useState<AdminRoute>(() => currentRouteFromPath());

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      if (window.location.pathname !== "/admin") window.history.replaceState(null, "", "/admin");
      document.title = "Admin Login | iFLOW Admin";
      return;
    }
    if (profile.role === "ADMIN" && ["/", "/admin", "/login"].includes(window.location.pathname.toLowerCase())) {
      window.history.replaceState(null, "", routePath("dashboard"));
    }
    const onPopState = () => setRoute(currentRouteFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [loading, profile]);

  const navigate = (nextRoute: AdminRoute) => { setRoute(nextRoute); window.history.pushState(null, "", routePath(nextRoute)); };
  const pageTitle = useMemo(() => adminRoutes.find((item) => item.id === route)?.label || "Dashboard", [route]);
  useEffect(() => { document.title = `${pageTitle} | iFLOW Admin`; }, [pageTitle]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f5f7fb] text-sm font-bold text-[#1454c8]">Checking session...</main>;
  if (!profile) return <AdminLoginPage onAuthenticated={async (email, password) => { await signIn(email, password); }} />;
  if (profile.role !== "ADMIN") return <main className="grid min-h-screen place-items-center bg-[#f5f7fb] p-6 text-center"><div><h1 className="text-xl font-bold text-[#07183f]">Admin access required</h1><p className="mt-2 text-sm text-[#62728b]">This account cannot use the Admin platform.</p><button onClick={() => { void signOut(); }} className="mt-5 rounded-xl bg-[#1454c8] px-5 py-3 text-sm font-bold text-white">Sign out</button></div></main>;

  if (dataLoading) return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb]">
      <div className="flex flex-col items-center gap-5">
        {/* Animated logo spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#dce8ff] border-t-[#1454c8]" />
          <span className="text-sm font-black text-[#1454c8]">FI</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[#1454c8]">Loading workspace…</p>
          <p className="mt-1 text-xs text-[#8da0bc]">Syncing cases, agents &amp; branches</p>
        </div>
        {/* Skeleton rows */}
        <div className="w-[320px] space-y-3">
          {[80, 60, 72, 50].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-[#dce8ff]" />
              <div className="flex-1 space-y-1.5">
                <div className="animate-pulse rounded-full bg-[#dce8ff]" style={{ height: 10, width: `${w}%` }} />
                <div className="animate-pulse rounded-full bg-[#edf2fb]" style={{ height: 8, width: `${Math.max(w - 20, 30)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
  if (dataError) return <main className="grid min-h-screen place-items-center p-6 text-sm font-bold text-[#c62828]">{dataError}</main>;

  return (
    <div className="admin-shell flex h-screen min-w-0 overflow-hidden font-sans text-[#07183f]">
      <Sidebar activeRoute={route} onLogout={() => { void signOut(); }} onNavigate={navigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminContent route={route} />
      </div>
    </div>
  );
}
