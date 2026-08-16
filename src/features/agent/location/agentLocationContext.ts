import { createContext, useContext } from "react";
import type { Coordinates } from "../../../domain/location";

export interface AgentLocationValue {
  accuracy: number | null;
  coordinates: Coordinates | null;
  requestLocation: () => void;
  status: string;
  updatedAt: string | null;
}

export const AgentLocationContext = createContext<AgentLocationValue | null>(null);

export function useAgentLocation() {
  const value = useContext(AgentLocationContext);
  if (!value) throw new Error("useAgentLocation must be used within AgentLocationProvider.");
  return value;
}
