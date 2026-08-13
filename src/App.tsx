import { useState } from "react";
import { MobileWrapper } from "./features/agent/components/MobileWrapper";
import { AgentHome } from "./features/agent/pages/AgentHome";
import { AgentMenu } from "./features/agent/pages/AgentMenu";
import { AgentAddTask } from "./features/agent/pages/AgentAddTask";
import { AgentHelpSupport } from "./features/agent/pages/AgentHelpSupport";
import { AgentAbout } from "./features/agent/pages/AgentAbout";
import { AgentLocationMap } from "./features/agent/pages/AgentLocationMap";
import { AgentLogin } from "./features/agent/pages/AgentLogin";
import { AgentOtp } from "./features/agent/pages/AgentOtp";
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
import { Popup } from "./components/ui/Popup";
import { verifyMobileNumber, verifyOtpCode } from "./services/auth";
import type { Step } from "./types";
import { I18nProvider } from "./features/agent/i18n";

function AgentApp() {
  const [step, setStep] = useState<Step>(() => {
    return (localStorage.getItem("isLoggedIn") === "true" ? "home" : "login") as Step;
  });
  const [historyStack, setHistoryStack] = useState<Step[]>([]);
  const [mobileNumber, setMobileNumber] = useState(() => {
    return localStorage.getItem("mobileNumber") || "";
  });
  const [popup, setPopup] = useState("");
  // Start with 2 completed steps: Visit Location and Capture Photo (as in mockups)
  const [completedStepsCount, setCompletedStepsCount] = useState(2);

  const showPopup = (message: string) => {
    setPopup(message);
    window.setTimeout(() => setPopup(""), 2600);
  };

  const handleSendOtp = (num: string) => {
    if (!verifyMobileNumber(num)) {
      showPopup("Invalid mobile number");
      return;
    }
    setMobileNumber(num);
    setStep("otp");
  };

  const handleVerifyOtp = (code: string) => {
    if (!verifyOtpCode(code)) {
      showPopup("Invalid OTP");
      return;
    }
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("mobileNumber", mobileNumber);
    setStep("home");
  };

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

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("mobileNumber");
    setHistoryStack([]);
    setStep("login");
  };

  return (
    <I18nProvider>
      <MobileWrapper>
        {popup ? <Popup message={popup} /> : null}
      
        {step === "login" ? (
          <AgentLogin onSendOtp={handleSendOtp} />
        ) : null}

      {step === "otp" ? (
        <AgentOtp
          mobileNumber={mobileNumber}
          onVerifyOtp={handleVerifyOtp}
          onBack={() => setStep("login")}
        />
      ) : null}

      {step === "home" ? (
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
    </I18nProvider>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07183f] relative overflow-hidden font-sans px-5">
      {/* Background glowing gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1158d4]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#088d27]/10 blur-[120px] pointer-events-none" />

      {/* Glassmorphic Container */}
      <div className="w-full max-w-[400px] bg-white/5 border border-white/10 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl flex flex-col items-center text-center relative z-10">
        {/* Animated Icon Container */}
        <div className="w-16 h-16 rounded-full bg-[#ee0f1a]/10 border border-[#ee0f1a]/20 flex items-center justify-center relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#ee0f1a]/5 animate-ping" />
          <svg viewBox="0 0 24 24" fill="none" stroke="#ee0f1a" strokeWidth="2.5" className="w-7 h-7 relative z-10">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Brand */}
        <span className="text-[10px] tracking-[0.2em] font-black text-[#1158d4] uppercase mb-2">fi-iFlow Secure Gate</span>

        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-3">Access Restricted</h1>

        {/* Description */}
        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
          This portal is strictly reserved for authorized Field Agents. Direct browser access has been disabled to protect operations.
        </p>

        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-left flex items-start gap-3 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" className="w-5 h-5 flex-none mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-[11px] font-medium leading-normal text-slate-300">
            <p className="m-0 font-bold text-white mb-0.5">How to access:</p>
            <p className="m-0">Please launch the official fi-iFlow app on your Android or iOS device to sync tasks and verify field cases.</p>
          </div>
        </div>

        {/* Security Audit Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-[#088d27] animate-pulse" />
          <span className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">Device Security Verified</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const pathname = window.location.pathname.toLowerCase();

  // Strictly determine if we render the agent mobile module
  const isAgent = pathname.startsWith("/agent");

  if (isAgent) {
    const isMobileApp = navigator.userAgent.includes("fi-iflow-mobile-app");

    if (isMobileApp) {
      return <AgentApp />;
    }

    return <AccessDenied />;
  }

  return <AdminPortal />;
}
