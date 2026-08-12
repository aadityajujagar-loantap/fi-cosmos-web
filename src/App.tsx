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
import { AdminPlaceholder } from "./features/admin/pages/AdminPlaceholder";
import { Popup } from "./components/ui/Popup";
import { verifyMobileNumber, verifyOtpCode } from "./services/auth";
import type { Step } from "./types";

function AgentApp() {
  const [step, setStep] = useState<Step>(() => {
    return (localStorage.getItem("isLoggedIn") === "true" ? "home" : "login") as Step;
  });
  const [prevStep, setPrevStep] = useState<Step>("home");
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
    // Save current step to trace back dynamically
    if ([
      "notifications", "personal-info", "privacy-security", "offline-data", 
      "employee-info", "work-settings", "history", "task-details", 
      "task-in-progress", "update-checklist", "capture-photo", 
      "capture-docs", "customer-signature", "menu", "add-task",
      "help-support", "about", "location-map"
    ].includes(nextStep)) {
      setPrevStep(step);
    }
    setStep(nextStep);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("mobileNumber");
    setStep("login");
  };

  return (
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
          onBack={() => setStep(prevStep)}
          onLogout={handleLogout}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "add-task" ? (
        <AgentAddTask
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "help-support" ? (
        <AgentHelpSupport
          onBack={() => setStep(prevStep)}
        />
      ) : null}

      {step === "about" ? (
        <AgentAbout
          onBack={() => setStep(prevStep)}
        />
      ) : null}

      {step === "location-map" ? (
        <AgentLocationMap
          onBack={() => setStep(prevStep)}
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
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "notifications" ? (
        <AgentNotifications
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "privacy-security" ? (
        <AgentPrivacySecurity
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "offline-data" ? (
        <AgentOfflineData
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "employee-info" ? (
        <AgentEmployeeInfo
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "work-settings" ? (
        <AgentWorkSettings
          onBack={() => setStep(prevStep)}
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
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
        />
      ) : null}

      {step === "task-in-progress" ? (
        <AgentTaskInProgress
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
        />
      ) : null}

      {step === "update-checklist" ? (
        <AgentUpdateChecklist
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

      {step === "capture-photo" ? (
        <AgentCapturePhoto
          onBack={() => setStep(prevStep)}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

      {step === "capture-docs" ? (
        <AgentCaptureDocs
          onBack={() => setStep(prevStep)}
          onNavigate={navigateTo}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}

      {step === "customer-signature" ? (
        <AgentCustomerSignature
          onBack={() => setStep(prevStep)}
          completedStepsCount={completedStepsCount}
          setCompletedStepsCount={setCompletedStepsCount}
        />
      ) : null}
    </MobileWrapper>
  );
}

export default function App() {
  const pathname = window.location.pathname.toLowerCase();
  
  // Strictly determine if we render the agent mobile module
  const isAgent = pathname.startsWith("/agent");

  if (isAgent) {
    return <AgentApp />;
  }

  return <AdminPlaceholder />;
}
