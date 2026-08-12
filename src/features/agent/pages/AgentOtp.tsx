import { useRef, useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { OtpDigitInput } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

function OtpArt() {
  return (
    <svg className="w-full max-w-[220px] max-h-full object-contain mx-auto" viewBox="0 0 240 220" aria-hidden="true">
      <circle cx="124" cy="110" r="86" fill="#edf5ff" />
      <path d="M92 38h73l34 28v108c0 9-7 16-16 16H92c-9 0-16-7-16-16V54c0-9 7-16 16-16z" fill="#fff" stroke="#1b4fb2" strokeWidth="3" />
      <path d="M165 39v27h32" fill="#e8f2ff" stroke="#1b4fb2" strokeWidth="3" />
      <path d="M31 74h72c7 0 12 5 12 12v40l-24-18H31c-7 0-12-5-12-12V86c0-7 5-12 12-12z" fill="#fff" stroke="#1b4fb2" strokeWidth="3" />
      <text x="33" y="98" fontSize="22" fontFamily="Arial" fontWeight="700" fill="#41aa4b">******</text>
      <path d="M143 92l53-25 53 25v44c0 36-23 58-53 68-30-10-53-32-53-68z" fill="#f7fff8" stroke="#43a847" strokeWidth="3" transform="translate(-13 0)" />
      <rect x="173" y="119" width="44" height="39" rx="9" fill="#62bb45" />
      <path d="M183 119v-14c0-11 8-19 18-19s18 8 18 19v14h-12v-14c0-4-2-8-6-8s-6 4-6 8v14z" fill="#1b6ab6" />
      <circle cx="195" cy="139" r="6" fill="#fff" />
      <path d="M195 141v10" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M20 140l8 8M28 140l-8 8M223 64l8 8M231 64l-8 8" stroke="#2b67d2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface AgentOtpProps {
  mobileNumber: string;
  onVerifyOtp: (otpCode: string) => void;
  onBack: () => void;
}

export function AgentOtp({ mobileNumber, onVerifyOtp, onBack }: AgentOtpProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const maskedMobile = `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`;

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    onVerifyOtp(otp.join(""));
  };

  const handleResend = () => {
    if (timer > 0) return;
    setOtp(Array(6).fill(""));
    setTimer(30);
    otpRefs.current[0]?.focus();
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-8 py-6 justify-between items-center relative min-h-screen">
        {/* Top/Middle Group (Header, Illustration, instructions) */}
        <div className="w-full flex flex-col items-center flex-none">
          {/* Top Header */}
          <header className="relative flex items-center justify-center h-12 w-full flex-none">
            <button
              onClick={onBack}
              type="button"
              aria-label="Back"
              className="absolute left-0 w-8 h-8 flex items-center justify-center bg-transparent text-[#0a2c66] text-xl p-0 cursor-pointer hover:opacity-80 focus:outline-none"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
                <path d="M15 5 8 12l7 7M9 12h11" />
              </svg>
            </button>
            <h1 className="text-[#0d326e] text-lg font-bold">
              OTP Verification
            </h1>
          </header>

          {/* Illustration */}
          <div className="w-full flex items-center justify-center py-4 min-h-[140px] max-h-[220px] mt-2">
            <OtpArt />
          </div>

          {/* Verification Instructions */}
          <div className="text-center mt-3">
            <h2 className="text-[#091733] text-base font-bold leading-tight">
              Enter the 6-digit OTP sent to
            </h2>
            <p className="mt-1.5 text-[#0d3274] text-lg font-bold">
              {maskedMobile}
            </p>
          </div>
        </div>

        {/* Bottom Group (Form inputs, timer, banner, buttons) */}
        <div className="w-full flex flex-col items-center flex-none mt-4">
          {/* Input boxes */}
          <div className="grid grid-cols-6 gap-2.5 w-full mx-auto">
            {otp.map((digit, index) => (
              <OtpDigitInput
                aria-label={`OTP digit ${index + 1}`}
                inputMode="numeric"
                key={String(index)}
                maxLength={1}
                onChange={(event) => updateOtp(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                inputRef={(element) => {
                  otpRefs.current[index] = element;
                }}
                type="text"
                value={digit}
              />
            ))}
          </div>

          {/* Resend Timer */}
          <div className="flex justify-center gap-2 mt-4 text-[#243451] text-sm">
            <span>Didn't receive OTP?</span>
            <strong className="text-[#2cab27] font-bold">
              00:{timer < 10 ? `0${timer}` : timer}
            </strong>
          </div>

          {/* Security Banner */}
          <div className="flex items-center gap-3.5 w-full mt-5 rounded-xl bg-[#edf5ff] p-3.5">
            <div className="grid w-10 h-10 flex-none place-items-center rounded-full bg-[#d9ecff] text-[#1fab63]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-blue-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <p className="m-0 text-[#102957] text-xs leading-snug font-medium text-left">
              For security reasons, please do not share your OTP with anyone.
            </p>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full mt-5">
            Verify & Continue
          </Button>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            className={`block mx-auto mt-4 bg-transparent text-sm font-bold border-0 cursor-pointer focus:outline-none ${
              timer > 0 ? "text-[#a0aec0] cursor-not-allowed" : "text-[#0647b1] hover:underline"
            }`}
            type="button"
            disabled={timer > 0}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </section>
  );
}
