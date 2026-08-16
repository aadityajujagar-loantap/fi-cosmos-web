import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useAuth } from "../auth/authContext";
import { DataContext, type DataContextValue } from "./dataContext";
import { supabaseRepository } from "./repository";

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const profileId = profile?.id ?? "";
  const profileRole = profile?.role;
  const profileDisplayName = profile?.displayName ?? "";
  const profileEmail = profile?.email ?? "";
  const profileActive = profile?.active ?? false;
  const repositoryProfile = useMemo(
    () =>
      profileId && profileRole
        ? {
            id: profileId,
            role: profileRole,
            displayName: profileDisplayName,
            email: profileEmail,
            active: profileActive,
          }
        : null,
    [profileActive, profileDisplayName, profileEmail, profileId, profileRole],
  );
  const state = useSyncExternalStore(supabaseRepository.subscribe, supabaseRepository.getSnapshot);
  // isLoaded updates on every repository notify(), so this re-renders as soon as core data arrives
  const isLoaded = useSyncExternalStore(supabaseRepository.subscribe, supabaseRepository.getIsLoaded);
  const [error, setError] = useState("");

  // loading = true while a profile is set but the repository hasn't fired its first early notify yet
  const loading = Boolean(repositoryProfile && !isLoaded);

  useEffect(() => {
    let active = true;
    void supabaseRepository
      .configure(repositoryProfile)
      .then(() => {
        if (active) setError("");
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to load shared data.");
      });

    return () => {
      active = false;
    };
  }, [repositoryProfile]);

  useEffect(
    () => () => {
      void supabaseRepository.configure(null);
    },
    [],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      state,
      loading,
      error,
      agentId: supabaseRepository.currentAgentId,
      adminActor: { id: repositoryProfile?.id ?? "", role: "ADMIN" },
      agentActor: { id: repositoryProfile?.id ?? "", role: "AGENT" },
      refresh: () => supabaseRepository.refresh(),
    }),
    [state, loading, error, repositoryProfile],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
