import { useEffect, useMemo, useState } from "react";

import { AdminContent } from "../components/AdminContent";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { adminRoutes } from "../data/adminData";
import { AdminLoginPage } from "./AdminLoginPage";
import type { AdminRoute } from "../types/admin";
import { currentRouteFromPath, routePath } from "../utils/routes";
import "../styles/admin.css";

const ADMIN_AUTH_KEY = "iflow-admin-authenticated";
const LOGIN_PATH = "/login";

export function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.localStorage.getItem(ADMIN_AUTH_KEY) === "true");
  const [route, setRoute] = useState<AdminRoute>(() => currentRouteFromPath());

  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();

    if (!isAuthenticated) {
      if (pathname !== LOGIN_PATH) {
        window.history.replaceState(null, "", LOGIN_PATH);
      }
      document.title = "Admin Login | iFLOW Admin";
      return;
    }

    if (pathname === LOGIN_PATH || pathname === "/" || pathname === "/admin") {
      window.history.replaceState(null, "", routePath("dashboard"));
    }

    const onPopState = () => setRoute(currentRouteFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAuthenticated]);

  const navigate = (nextRoute: AdminRoute) => {
    setRoute(nextRoute);
    window.history.pushState(null, "", routePath(nextRoute));
  };

  const pageTitle = useMemo(() => adminRoutes.find((item) => item.id === route)?.label || "Dashboard", [route]);

  useEffect(() => {
    document.title = `${pageTitle} | iFLOW Admin`;
  }, [pageTitle]);

  const handleAuthenticated = () => {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
    window.history.replaceState(null, "", routePath("dashboard"));
    setRoute("dashboard");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    window.history.replaceState(null, "", LOGIN_PATH);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="admin-shell flex h-screen min-w-0 overflow-hidden font-sans text-[#07183f]">
      <Sidebar activeRoute={route} onLogout={handleLogout} onNavigate={navigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onLogout={handleLogout} onNavigate={navigate} route={route} />
        <AdminContent route={route} />
      </div>
    </div>
  );
}
