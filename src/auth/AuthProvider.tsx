import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../domain/types";
import { AuthContext, type AuthContextValue } from "./authContext";

// All agent Supabase Auth accounts must be provisioned with this password.
// Agents never type it — it is used internally after the dummy OTP check passes.
const AGENT_COMMON_PASS = "FiAgent@123";
const DUMMY_OTP = "123456";

async function loadProfile(session: Session | null): Promise<Profile | null> {
  if (!session) return null;
  const { data, error } = await supabase.from("profiles").select("id, role, display_name, email, active").eq("id", session.user.id).single();
  if (error) throw error;
  return { id: data.id, role: data.role as UserRole, displayName: data.display_name, email: data.email, active: data.active };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setProfile(await loadProfile(data.session));
      setLoading(false);
    }).catch(() => setLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(() => {
        loadProfile(nextSession).then(setProfile).finally(() => setLoading(false));
      }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  // Email + password sign-in (used by admin portal)
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    const nextProfile = await loadProfile(data.session);
    if (!nextProfile?.active) { await supabase.auth.signOut(); throw new Error("This account is inactive or not provisioned."); }
    setSession(data.session); setProfile(nextProfile);
  }, []);

  // Phone + dummy OTP sign-in (used by agent mobile app).
  // Phone lookup (DB validation) is done in AgentLogin UI at "Send OTP" step;
  // this method receives the pre-looked-up email + the entered OTP.
  const signInWithPhone = useCallback(async (email: string, otp: string) => {
    // 1. Validate OTP first (fast, no network needed)
    if (otp.trim() !== DUMMY_OTP) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // 2. Sign in with the shared agent password
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: AGENT_COMMON_PASS });
    if (error) throw new Error("Sign-in failed. Contact your admin to reset your account.");

    // 3. Verify profile is active and AGENT role
    const nextProfile = await loadProfile(data.session);
    if (!nextProfile?.active) { await supabase.auth.signOut(); throw new Error("This account is inactive. Contact your admin."); }
    if (nextProfile.role !== "AGENT") { await supabase.auth.signOut(); throw new Error("This login is for field agents only."); }

    setSession(data.session);
    setProfile(nextProfile);
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ loading, profile, session, signIn, signInWithPhone, signOut }),
    [loading, profile, session, signIn, signInWithPhone, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
