import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { supabase } from "../../../lib/supabase";
import agentLoginBg from "../../../assets/agent-login-bg.png";

interface AgentLoginProps {
  // onLogin receives the looked-up email (not raw phone) + OTP
  onLogin: (email: string, otp: string) => Promise<void>;
}

const OTP_LENGTH = 6;

export function AgentLogin({ onLogin }: AgentLoginProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [agentEmail, setAgentEmail] = useState(""); // resolved from DB at step 1
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Phone step ──────────────────────────────────────────────────────────────
  const handlePhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }

    // Validate phone against agents DB right here at "Send OTP" step
    setLoading(true);
    try {
      const { data: email, error: rpcError } = await supabase.rpc("lookup_agent_by_phone", { p_phone: digits });
      if (rpcError) throw new Error("Verification failed. Check your connection and try again.");
      if (!email) throw new Error("This mobile number is not registered. Contact your admin.");
      setAgentEmail(email as string);
      setStep("otp");
      // auto-focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP step ────────────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setError("Enter all 6 digits of the OTP."); return; }
    setLoading(true); setError("");
    try { await onLogin(agentEmail, code); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Verification failed."); }
    finally { setLoading(false); }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp(Array(OTP_LENGTH).fill(""));
    setAgentEmail("");
    setError("");
  };

  return (
    <section className="flex min-h-[100dvh] flex-1 overflow-y-auto bg-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-between px-6 py-7">

        {/* Header */}
        <header className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f2ff] text-xl font-bold text-[#16469d]">FI</div>
          <h1 className="mt-3 text-3xl font-bold text-[#16469d]">FieldOps</h1>
          <p className="mt-2 text-sm font-medium text-[#243451]">Agent Platform</p>
        </header>

        <img src={agentLoginBg} alt="Field agent" className="mx-auto my-5 max-h-64 w-[85%] object-contain mix-blend-multiply" />

        {/* ── STEP 1: Phone number ─────────────────────────────────────────── */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="rounded-[14px] border border-[#dfe7f2] bg-white p-5 shadow-lg">
            <h2 className="text-lg font-bold text-[#061332]">Enter your mobile number</h2>
            <p className="mb-5 mt-1 text-sm text-[#5c6a85]">We'll verify you're a registered field agent.</p>

            {error ? <p className="mb-3 rounded-xl bg-[#fff0ef] p-3 text-xs font-bold text-[#c62828]">{error}</p> : null}

            <div className="flex items-center gap-2 rounded-xl border border-[#dfe7f2] bg-[#f7f9fc] px-4 h-12 focus-within:border-[#1158d4] focus-within:ring-2 focus-within:ring-[#1158d4]/20 transition-all">
              <span className="text-sm font-semibold text-[#243451] shrink-0">🇮🇳 +91</span>
              <div className="w-px h-5 bg-[#dfe7f2] shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-sm font-medium text-[#061332] outline-none placeholder:text-[#b0bac9]"
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-5">
              {loading ? "Checking..." : "Send OTP"}
            </Button>
          </form>
        )}

        {/* ── STEP 2: OTP entry ────────────────────────────────────────────── */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="rounded-[14px] border border-[#dfe7f2] bg-white p-5 shadow-lg">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-[#1158d4] hover:opacity-70 transition-opacity"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Change number
            </button>

            <h2 className="text-lg font-bold text-[#061332]">Enter OTP</h2>
            <p className="mb-1 mt-1 text-sm text-[#5c6a85]">
              Sent to <span className="font-semibold text-[#243451]">+91 {phone}</span>
            </p>

            {error ? <p className="my-3 rounded-xl bg-[#fff0ef] p-3 text-xs font-bold text-[#c62828]">{error}</p> : <div className="mb-3" />}

            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-full rounded-xl border border-[#dfe7f2] bg-[#f7f9fc] text-center text-lg font-bold text-[#061332] outline-none transition-all focus:border-[#1158d4] focus:ring-2 focus:ring-[#1158d4]/20"
                />
              ))}
            </div>

            <Button disabled={loading} className="mt-5" type="submit">
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <button
              type="button"
              className="mt-4 w-full text-center text-xs font-semibold text-[#1158d4] hover:opacity-70 transition-opacity"
              onClick={() => { setOtp(Array(OTP_LENGTH).fill("")); setError(""); setTimeout(() => otpRefs.current[0]?.focus(), 50); }}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs font-medium text-[#5c6a85]">
          Authenticated and protected by role-based access.
        </p>
      </div>
    </section>
  );
}
