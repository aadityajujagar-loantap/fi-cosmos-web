import { useState, type FormEvent } from "react";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";

interface AdminLoginPageProps {
  onAuthenticated: (email: string, password: string) => Promise<void>;
}

export function AdminLoginPage({ onAuthenticated }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onAuthenticated(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-shell grid min-h-screen grid-cols-1 bg-[#f5f7fb] font-sans text-[#07183f] xl:grid-cols-[minmax(520px,0.92fr)_minmax(540px,1.08fr)]">
      <section className="relative hidden overflow-hidden bg-[#07183f] px-12 py-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(#24406d 1px, transparent 1px), linear-gradient(90deg, #24406d 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1454c8]"><Icon name="shield" className="h-5 w-5" /></div><div><p className="text-lg font-bold">iFLOW</p><p className="text-xs font-semibold text-[#b8c7df]">Smart Field Intelligence</p></div></div>
          <div className="mt-20 max-w-xl"><p className="text-xs font-bold uppercase text-[#8fb5ff]">Admin Command Center</p><h1 className="mt-4 text-4xl font-bold leading-tight">Secure field investigation operations.</h1><p className="mt-5 text-sm leading-7 text-[#c7d4e8]">Assign cases, monitor field work, review evidence, and close investigations from one shared system.</p></div>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[460px] rounded-[18px] border border-[#dfe7f2] bg-white p-7 shadow-[0_24px_70px_rgba(7,24,63,0.10)]">
          <div className="mb-7"><div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ff] text-[#1454c8]"><Icon name="lock" className="h-5 w-5" /></div><h2 className="text-2xl font-bold text-[#07183f]">Admin Login</h2><p className="mt-2 text-sm text-[#62728b]">Sign in with your authorized account.</p></div>
          {error ? <div className="mb-5 rounded-xl border border-[#f2caca] bg-[#fff6f5] px-4 py-3 text-sm font-bold text-[#c62828]">{error}</div> : null}
          <form onSubmit={submit} className="space-y-4">
            <label className="block"><span className="text-xs font-bold uppercase text-[#62728b]">Email</span><input required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e3f5] px-4 text-sm font-semibold" type="email" autoComplete="username" /></label>
            <label className="block"><span className="text-xs font-bold uppercase text-[#62728b]">Password</span><input required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e3f5] px-4 text-sm font-semibold" type="password" autoComplete="current-password" /></label>
            <AdminButton disabled={submitting} type="submit" variant="primary" className="w-full">{submitting ? "Signing in..." : "Sign In"}</AdminButton>
          </form>
        </div>
      </section>
    </main>
  );
}
