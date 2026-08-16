import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAppData } from "../../../data/dataContext";
import { agentService } from "../../../data/services";
import { distanceInKilometers, hasFreshCoordinates, hasUsableCoordinates, type Coordinates } from "../../../domain/location";
import { AgentLocationContext, type AgentLocationValue } from "./agentLocationContext";

const SYNC_INTERVAL_MS = 15_000;
const SYNC_MOVEMENT_KM = 0.025;
const HEARTBEAT_INTERVAL_MS = 60_000;

export function AgentLocationProvider({ children }: { children: ReactNode }) {
  const { agentId, state } = useAppData();
  const storedAgent = state.agents.find((agent) => agent.id === agentId);
  const storedCoordinates = hasFreshCoordinates(storedAgent) ? storedAgent : null;
  const [liveCoordinates, setLiveCoordinates] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(storedAgent?.locationAccuracyMeters ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(storedAgent?.locationUpdatedAt ?? null);
  const [status, setStatus] = useState(navigator.geolocation ? "Locating device..." : "Location unavailable on this device");
  const lastSynced = useRef<{ coordinates: Coordinates; timestamp: number } | null>(null);
  const latestPosition = useRef<{ accuracy: number; coordinates: Coordinates } | null>(null);

  const syncLocation = useCallback((coordinates: Coordinates, accuracyMeters: number, force = false) => {
    if (!agentId) return;
    const now = Date.now();
    const previous = lastSynced.current;
    const moved = previous ? distanceInKilometers(previous.coordinates, coordinates) ?? 0 : Number.POSITIVE_INFINITY;
    if (!force && previous && now - previous.timestamp < SYNC_INTERVAL_MS && moved < SYNC_MOVEMENT_KM) return;
    lastSynced.current = { coordinates, timestamp: now };
    void agentService.updateLocation(agentId, coordinates, accuracyMeters).catch((caught: unknown) => {
      const message = caught && typeof caught === "object" && "message" in caught ? String(caught.message) : "Supabase update failed";
      setStatus(`GPS active; sync failed: ${message}`);
    });
  }, [agentId]);

  const receivePosition = useCallback((position: GeolocationPosition) => {
    const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    if (!hasUsableCoordinates(coordinates)) return;
    const now = Date.now();
    setLiveCoordinates(coordinates);
    setAccuracy(position.coords.accuracy);
    setUpdatedAt(new Date(position.timestamp || now).toISOString());
    setStatus("Live location active");
    latestPosition.current = { accuracy: position.coords.accuracy, coordinates };
    syncLocation(coordinates, position.coords.accuracy);
  }, [syncLocation]);

  const receiveError = useCallback((error: GeolocationPositionError) => {
    setStatus(error.code === error.PERMISSION_DENIED ? "Location permission required" : "Waiting for a GPS fix");
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setStatus("Requesting live location...");
    navigator.geolocation.getCurrentPosition(receivePosition, receiveError, { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 });
  }, [receiveError, receivePosition]);

  useEffect(() => {
    if (!navigator.geolocation || !agentId) return;
    const watchId = navigator.geolocation.watchPosition(receivePosition, receiveError, { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [agentId, receiveError, receivePosition]);

  useEffect(() => {
    const heartbeat = window.setInterval(() => {
      const latest = latestPosition.current;
      if (latest) syncLocation(latest.coordinates, latest.accuracy, true);
    }, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(heartbeat);
  }, [syncLocation]);

  const value = useMemo<AgentLocationValue>(() => ({
    accuracy,
    coordinates: liveCoordinates ?? storedCoordinates,
    requestLocation,
    status,
    updatedAt: updatedAt ?? storedAgent?.locationUpdatedAt ?? null,
  }), [accuracy, liveCoordinates, requestLocation, status, storedAgent?.locationUpdatedAt, storedCoordinates, updatedAt]);

  return <AgentLocationContext.Provider value={value}>{children}</AgentLocationContext.Provider>;
}
