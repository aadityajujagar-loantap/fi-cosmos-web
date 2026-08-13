import type { AdminRoute } from "../types/admin";
import { AgentsPage } from "../pages/AgentsPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ApplicationsPage } from "../pages/ApplicationsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { FraudPage } from "../pages/FraudPage";
import { LiveTrackingPage } from "../pages/LiveTrackingPage";
import { QuestionnairePage } from "../pages/QuestionnairePage";
import { RolesPage } from "../pages/RolesPage";

export function AdminContent({ route }: { route: AdminRoute }) {
  if (route === "applications") return <ApplicationsPage />;
  if (route === "agents") return <AgentsPage />;
  if (route === "analytics") return <AnalyticsPage />;
  if (route === "fraud-alert") return <FraudPage />;
  if (route === "live-tracking") return <LiveTrackingPage />;
  if (route === "questionnaire") return <QuestionnairePage />;
  if (route === "roles-permissions") return <RolesPage />;
  return <DashboardPage />;
}
