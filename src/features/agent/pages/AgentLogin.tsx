import { useState } from "react";
import type { ChangeEvent } from "react";
import { Card } from "../../../components/ui/Card";
import { PhoneInput } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import agentLoginBg from "../../../assets/agent-login-bg.png";

function LogoMark() {
  return (
    <div className="block w-[clamp(64px,18vw,80px)] h-[clamp(64px,18vw,80px)] mx-auto" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Circular Background */}
        <circle cx="50" cy="50" r="44" fill="#e8f2ff" />
        
        {/* Left Green Swoosh */}
        <path d="M 50,6 A 44,44 0 0,0 50,94" stroke="#34a853" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        {/* Right Blue Swoosh */}
        <path d="M 50,94 A 44,44 0 0,0 50,6" stroke="#16469d" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        
        {/* Worker Body (Polo Shirt) */}
        <path d="M 28,84 C 28,68 38,59 50,59 C 62,59 72,68 72,84 Z" fill="#16469d" />
        
        {/* Collar */}
        <path d="M 39,59 L 50,71 L 61,59 Z" fill="#102f6c" />
        
        {/* Neck */}
        <rect x="46" y="50" width="8" height="11" fill="#fcd4b0" />
        
        {/* Head */}
        <circle cx="50" cy="42" r="12" fill="#fcd4b0" />
        
        {/* Hair */}
        <path d="M 38,42 C 38,34 42,30 50,30 C 58,30 62,34 62,42 Z" fill="#2d3748" />
        
        {/* Cap */}
        <path d="M 38,38 C 38,28 44,26 50,26 C 56,26 62,38 62,38 Z" fill="#16469d" />
        {/* Cap Visor */}
        <path d="M 45,30 C 52,30 59,33 63,37 L 59,40 C 56,37 51,35 45,35 Z" fill="#102f6c" />
        
        {/* Face Features */}
        <circle cx="46" cy="42" r="1.2" fill="#2d3748" />
        <circle cx="54" cy="42" r="1.2" fill="#2d3748" />
        <path d="M 47,46 Q 50,49 53,46" stroke="#2d3748" strokeWidth="1" fill="none" strokeLinecap="round" />
        
        {/* Clipboard (Green) */}
        <rect x="42" y="56" width="16" height="23" rx="2" fill="#34a853" />
        {/* Clipboard Clip */}
        <rect x="47" y="53" width="6" height="4" rx="1" fill="#718096" />
        {/* Paper on Clipboard */}
        <rect x="45" y="59" width="10" height="18" rx="0.5" fill="#ffffff" />
        {/* Writing on Paper */}
        <line x1="47" y1="62" x2="53" y2="62" stroke="#a0aec0" strokeWidth="1.2" />
        <line x1="47" y1="65" x2="53" y2="65" stroke="#a0aec0" strokeWidth="1.2" />
        <line x1="47" y1="68" x2="51" y2="68" stroke="#a0aec0" strokeWidth="1.2" />
        
        {/* Hands holding Clipboard */}
        <circle cx="39" cy="67" r="3.5" fill="#fcd4b0" />
        <circle cx="61" cy="67" r="3.5" fill="#fcd4b0" />
      </svg>
    </div>
  );
}

interface AgentLoginProps {
  onSendOtp: (mobileNumber: string) => void;
}

export function AgentLogin({ onSendOtp }: AgentLoginProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSubmit = () => {
    if (mobileNumber.length < 10) return;
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      onSendOtp(mobileNumber);
    }, 1000); // 1-second simulated delay
  };

  return (
    <section className="relative flex flex-col flex-1 bg-gradient-to-b from-white via-white via-[80%] to-[#eef8ff] min-h-screen h-[100dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-fade-in">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-6 py-6 justify-between items-center relative min-h-screen">
        {/* Top Section (Language & Brand Header) */}
        <div className="w-full flex flex-col items-center flex-none relative z-20">
          {/* Language Button */}
          <div className="w-full flex justify-end relative z-30">
            <button
              className="flex items-center gap-2 h-10 px-4 border border-[#d5dbe5] rounded-[14px] bg-white/98 shadow-[0_4px_12px_rgba(10,25,48,0.1)] text-[#061332] text-sm font-bold cursor-pointer"
              type="button"
              aria-label="Change language"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#102f6c]"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span data-language-label data-no-translate>English</span>
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-[#102f6c]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
                <path d="m3 4.5 3 3 3-3" />
              </svg>
            </button>
          </div>

          {/* Brand Header */}
          <div className="mt-4 text-center relative z-20">
            <LogoMark />
            <h1 className="mt-2 text-[#16469d] text-4xl font-bold tracking-tight leading-none">
              FieldOps
            </h1>
            <p className="mt-2 text-[#091733] text-base font-medium leading-tight">
              Field Operations Made Simple
            </p>
            <span className="inline-flex items-center h-7 mt-2.5 bg-[#d9f0ce] text-[#479335] text-xs font-bold px-3.5 rounded-[11px]">
              Agent App
            </span>
          </div>
        </div>

        {/* Center Illustration */}
        <div className="w-full flex-1 flex items-center justify-center py-1 min-h-[140px] max-h-[260px] relative z-0">
          <img
            src={agentLoginBg}
            alt="Field agent illustration"
            className="w-[85%] max-w-[370px] max-h-full object-contain mx-auto mix-blend-multiply contrast-[1.02] brightness-[1.05]"
          />
        </div>

        {/* Bottom Group (Card & Footer) */}
        <div className="w-full flex flex-col flex-none mt-4">
          <Card className="w-full mt-0">
            <h2 className="text-[#061332] text-lg font-bold leading-snug">
              Login securely using OTP
            </h2>
            <p className="max-w-full w-[280px] mx-auto mt-2 mb-5 text-[#243451] text-sm font-normal leading-normal">
              We will send you a One Time Password on your mobile number
            </p>

            <PhoneInput
              inputMode="numeric"
              maxLength={10}
              onChange={handleMobileChange}
              placeholder="Enter mobile number"
              type="tel"
              value={mobileNumber}
            />

            <Button onClick={handleSubmit} className="mt-5 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send OTP</span>
              )}
            </Button>
          </Card>

          {/* Bottom Section (Safe Note & Footer) */}
          <div className="w-full flex flex-col items-center mt-5">
            {/* Bottom Safe Note */}
            <div className="flex items-center justify-center gap-2 text-[#243451]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#34a853]"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
              <p className="text-sm font-medium">
                Your data is safe and secure with us
              </p>
            </div>

            {/* Footer Legal Links */}
            <footer className="w-full flex items-center justify-center gap-5 mt-4">
              <a href="#privacy" className="text-[#0a234f] text-sm font-medium hover:underline">
                Privacy Policy
              </a>
              <span className="w-[1px] h-4 bg-[#a9b1c0]" />
              <a href="#terms" className="text-[#0a234f] text-sm font-medium hover:underline">
                Terms & Conditions
              </a>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
