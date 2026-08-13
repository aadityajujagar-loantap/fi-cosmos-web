import { useState, type FormEvent } from "react";

import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";

const ADMIN_USERNAME = "FI-cos-admin";
const ADMIN_PASSWORD = "admin@123";
const ADMIN_OTP = "123456";

interface AdminLoginPageProps {
  onAuthenticated: () => void;
}

export function AdminLoginPage({ onAuthenticated }: AdminLoginPageProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const runSubmit = (callback: () => void) => {
    setSubmitting(true);
    window.setTimeout(() => {
      callback();
      setSubmitting(false);
    }, 420);
  };

  const submitCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("Invalid admin username or password.");
      return;
    }

    runSubmit(() => setStep("otp"));
  };

  const submitOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (otp.trim() !== ADMIN_OTP) {
      setError("Invalid OTP. Enter the 6-digit admin verification code.");
      return;
    }

    runSubmit(onAuthenticated);
  };

  return (
    <main className="admin-shell grid min-h-screen grid-cols-1 bg-[#f5f7fb] font-sans text-[#07183f] xl:grid-cols-[minmax(520px,0.92fr)_minmax(540px,1.08fr)]">
      <section className="relative hidden overflow-hidden bg-[#07183f] px-12 py-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(#24406d 1px, transparent 1px), linear-gradient(90deg, #24406d 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1454c8]">
              <Icon name="shield" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">iFLOW</p>
              <p className="text-xs font-semibold text-[#b8c7df]">Smart Field Intelligence</p>
            </div>
          </div>
          <div className="mt-20 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8fb5ff]">Admin Command Center</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em]">Secure access for field investigation operations.</h1>
            <p className="mt-5 text-sm leading-7 text-[#c7d4e8]">
              Review applications, track agents, manage questionnaires, monitor fraud signals, and keep investigation workflows audit-ready.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            ["98.4%", "GPS compliance"],
            ["2.1d", "Avg. TAT"],
            ["34", "Live agents"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[14px] border border-white/10 bg-white/[0.07] p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs font-semibold text-[#b8c7df]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 xl:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1454c8] text-white">
                <Icon name="shield" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1454c8]">iFLOW</p>
                <p className="text-xs font-semibold text-[#62728b]">Smart Field Intelligence</p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#dfe7f2] bg-white p-7 shadow-[0_24px_70px_rgba(7,24,63,0.10)]">
            <div className="mb-7">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ff] text-[#1454c8]">
                <Icon name={step === "credentials" ? "lock" : "key"} className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#07183f]">{step === "credentials" ? "Admin Login" : "OTP Verification"}</h2>
              <p className="mt-2 text-sm leading-6 text-[#62728b]">
                {step === "credentials" ? "Sign in with your authorized admin credentials." : "Enter the verification code sent to the registered admin device."}
              </p>
            </div>

            {error ? <div className="mb-5 rounded-xl border border-[#f2caca] bg-[#fff6f5] px-4 py-3 text-sm font-bold text-[#c62828]">{error}</div> : null}

            {step === "credentials" ? (
              <form onSubmit={submitCredentials} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#62728b]">Username</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#d8e3f5] bg-white px-4 text-sm font-semibold text-[#07183f] outline-none placeholder:text-[#9aacc5]"
                    placeholder="Enter admin username"
                    autoComplete="username"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#62728b]">Password</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#d8e3f5] bg-white px-4 text-sm font-semibold text-[#07183f] outline-none placeholder:text-[#9aacc5]"
                    placeholder="Enter password"
                    type="password"
                    autoComplete="current-password"
                  />
                </label>
                <AdminButton disabled={submitting} type="submit" variant="primary" className="mt-2 w-full">
                  {submitting ? "Verifying..." : "Continue"}
                </AdminButton>
              </form>
            ) : (
              <form onSubmit={submitOtp} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#62728b]">6-digit OTP</span>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-2 h-14 w-full rounded-xl border border-[#d8e3f5] bg-white px-4 text-center text-2xl font-bold tracking-[0.34em] text-[#07183f] outline-none placeholder:text-[#9aacc5]"
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </label>
                <div className="flex gap-3">
                  <AdminButton onClick={() => setStep("credentials")} className="flex-1">
                    Back
                  </AdminButton>
                  <AdminButton disabled={submitting} type="submit" variant="primary" className="flex-1">
                    {submitting ? "Signing in..." : "Verify OTP"}
                  </AdminButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
