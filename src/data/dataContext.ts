import { createContext, useContext } from "react";
import type { AppActor, AppState } from "../domain/types";

export interface DataContextValue { state: AppState; adminActor: AppActor; agentActor: AppActor; agentId: string | null; loading: boolean; error: string; refresh: () => Promise<void> }
export const DataContext = createContext<DataContextValue | null>(null);
export function useAppData() { const value = useContext(DataContext); if (!value) throw new Error("useAppData must be used within DataProvider."); return value; }
