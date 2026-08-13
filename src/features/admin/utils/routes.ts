import { adminRoutes } from "../data/adminData";
import type { AdminRoute } from "../types/admin";

export function currentRouteFromPath(): AdminRoute {
  const slug = window.location.pathname.toLowerCase().replace(/^\/+/, "").split("/").filter(Boolean).at(-1);
  return adminRoutes.find((route) => route.id === slug)?.id || "dashboard";
}

export function routePath(route: AdminRoute) {
  return `/admin/${route}`;
}
