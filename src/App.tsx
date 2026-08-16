import { useState } from "react";
import { MobileWrapper } from "./features/agent/components/MobileWrapper";
import { AgentHome } from "./features/agent/pages/AgentHome";
import { AgentMenu } from "./features/agent/pages/AgentMenu";
import { AgentAddTask } from "./features/agent/pages/AgentAddTask";
import { AgentHelpSupport } from "./features/agent/pages/AgentHelpSupport";
import { AgentAbout } from "./features/agent/pages/AgentAbout";
import { AgentLocationMap } from "./features/agent/pages/AgentLocationMap";
import { AgentLogin } from "./features/agent/pages/AgentLogin";
import { AgentMyTasks } from "./features/agent/pages/AgentMyTasks";
import { AgentProfile } from "./features/agent/pages/AgentProfile";
import { AgentNotifications } from "./features/agent/pages/AgentNotifications";
import { AgentPersonalInfo } from "./features/agent/pages/AgentPersonalInfo";
import { AgentPrivacySecurity } from "./features/agent/pages/AgentPrivacySecurity";
import { AgentOfflineData } from "./features/agent/pages/AgentOfflineData";
import { AgentEmployeeInfo } from "./features/agent/pages/AgentEmployeeInfo";
import { AgentWorkSettings } from "./features/agent/pages/AgentWorkSettings";
import { AgentHistory } from "./features/agent/pages/AgentHistory";
import { AgentTaskDetails } from "./features/agent/pages/AgentTaskDetails";
import { AgentTaskInProgress } from "./features/agent/pages/AgentTaskInProgress";
import { AgentUpdateChecklist } from "./features/agent/pages/AgentUpdateChecklist";
import { AgentCaptureDocs } from "./features/agent/pages/AgentCaptureDocs";
import { AgentCapturePhoto } from "./features/agent/pages/AgentCapturePhoto";
import { AgentCustomerSignature } from "./features/agent/pages/AgentCustomerSignature";
import { AdminPortal } from "./features/admin/pages/AdminPortal";
import type { Step } from "./types";
import { I18nProvider } from "./features/agent/i18n";
import { AgentLocationProvider } from "./features/agent/location/AgentLocationProvider";

import { useNetworkStatus } from "./native/network";
import { investigationService } from "./data/services";
import { useAuth } from "./auth/authContext";
import { useAppData } from "./data/dataContext";
import { getActiveAgentTaskId } from "./features/agent/utils/tasks";

function AgentApp() {
  const { isOffline } = useNetworkStatus();
  const { signOut } = useAuth();
  const [step, setStep] = useState<Step>("home");
  const [historyStack, setHistoryStack] = useState<Step[]>([]);
  const [completedStepsByTask, setCompletedStepsByTask] = useState<Record<string, number>>({});
  const activeTaskId = getActiveAgentTaskId();
  const completedStepsCount = completedStepsByTask[activeTaskId] ?? investigationService.getDraft(activeTaskId).completedChecklistIds.length;
  const setCompletedStepsCount = (count: number) => setCompletedStepsByTask((current) => ({ ...current, [getActiveAgentTaskId()]: count }));

  const navigateTo = (nextStep: Step) => {
    if (nextStep === step) return;
    setHistoryStack((current) => [...current, step]);
    setStep(nextStep);
  };

  const goBack = (fallback: Step = "home") => {
    const previousStep = historyStack[historyStack.length - 1] || fallback;
    setHistoryStack(historyStack.slice(0, -1));
    setStep(previousStep);
  };

  const handleLogout = () => { void signOut(); };

  return (
    <I18nProvider>
      <AgentLocationProvider>
      <MobileWrapper>
        {isOffline ? (
          <div className="bg-[#ee0f1a] text-white py-1.5 px-4 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 shrink-0 z-50 select-none shadow-sm animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.5M5 12.5a10.94 10.94 0 0 1 5.83-2.84M8.5 16a4.5 4.5 0 0 1 7 0M12 20h.01" />
            </svg>
            <span>No internet connection. Some actions may be unavailable.</span>
          </div>
        ) : null}{step === "home" ? (
        <AgentHome
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "menu" ? (
        <AgentMenu
          onBack={() => goBack("home")}
          onLogout={handleLogout}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "add-task" ? (
        <AgentAddTask
          onBack={() => goBack("home")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "help-support" ? (
        <AgentHelpSupport
          onBack={() => goBack("home")}
        />
      ) : null}

      {step === "about" ? (
        <AgentAbout
          onBack={() => goBack("home")}
        />
      ) : null}

      {step === "location-map" ? (
        <AgentLocationMap
          onBack={() => goBack("home")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "my-tasks" ? (
        <AgentMyTasks
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "profile" ? (
        <AgentProfile
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      ) : null}

      {step === "personal-info" ? (
        <AgentPersonalInfo
          onBack={() => goBack("profile")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "notifications" ? (
        <AgentNotifications
          onBack={() => goBack("home")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "privacy-security" ? (
        <AgentPrivacySecurity
          onBack={() => goBack("profile")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "offline-data" ? (
        <AgentOfflineData
          onBack={() => goBack("profile")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "employee-info" ? (
        <AgentEmployeeInfo
          onBack={() => goBack("profile")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "work-settings" ? (
        <AgentWorkSettings
          onBack={() => goBack("profile")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "history" ? (
        <AgentHistory
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "task-details" ? (
        <AgentTaskDetails
          onBack={() => goBack("my-tasks")}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "task-in-progress" ? (
        <AgentTaskInProgress
          onBack={() => goBack("my-tasks")}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
        />
      ) : null}

      {step === "update-checklist" ? (
        <AgentUpdateChecklist
          onBack={() => goBack("task-in-progress")}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

      {step === "capture-photo" ? (
        <AgentCapturePhoto
          onBack={() => goBack("update-checklist")}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

      {step === "capture-docs" ? (
        <AgentCaptureDocs
          onBack={() => goBack("update-checklist")}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

        {step === "customer-signature" ? (
          <AgentCustomerSignature
            onBack={() => goBack("update-checklist")}
            completedStepsCount={completedStepsCount}
            setCompletedStepsCount={setCompletedStepsCount}
          />
        ) : null}
      </MobileWrapper>
      </AgentLocationProvider>
    </I18nProvider>
  );
}

export default function App() {
  const { loading: authLoading, profile, signInWithPhone, signOut } = useAuth();
  const { loading: dataLoading, error } = useAppData();
  const pathname = window.location.pathname.toLowerCase();
  const isAgent = pathname === "/agent" || pathname.startsWith("/agent/") || window.location.search.includes("mode=agent") || window.location.href.includes("android_asset");

  if (authLoading) return <main className="grid min-h-[100dvh] place-items-center text-sm font-bold text-[#1158d4]">Checking session...</main>;
  if (isAgent) {
    if (!profile) return <AgentLogin onLogin={signInWithPhone} />;
    if (profile.role !== "AGENT") return <main className="grid min-h-[100dvh] place-items-center p-6 text-center"><div><h1 className="text-xl font-bold text-[#07183f]">Field Agent access required</h1><p className="mt-2 text-sm text-[#5c6a85]">This application is for Field Agents only.</p><button onClick={() => { void signOut(); }} className="mt-5 rounded-xl bg-[#1158d4] px-5 py-3 text-sm font-bold text-white">Sign out</button></div></main>;
    if (dataLoading) return <main className="grid min-h-[100dvh] place-items-center text-sm font-bold text-[#1158d4]">Syncing assignments...</main>;
    if (error) return <main className="grid min-h-[100dvh] place-items-center p-6 text-center text-sm font-bold text-[#c62828]">{error}</main>;
    return <AgentApp />;
  }
  return <AdminPortal />;
}