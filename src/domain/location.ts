export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function hasUsableCoordinates(value: Partial<Coordinates> | null | undefined): value is Coordinates {
  if (!value) return false;
  const { latitude, longitude } = value;
  return typeof latitude === "number" && typeof longitude === "number" && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 && (latitude !== 0 || longitude !== 0);
}

export const LIVE_LOCATION_MAX_AGE_MS = 2 * 60 * 1000;

export function hasFreshCoordinates(
  value: (Partial<Coordinates> & { locationUpdatedAt?: string }) | null | undefined,
  at = Date.now(),
): value is Coordinates & { locationUpdatedAt: string } {
  const locationUpdatedAt = value?.locationUpdatedAt;
  return hasUsableCoordinates(value) && typeof locationUpdatedAt === "string" && at - Date.parse(locationUpdatedAt) <= LIVE_LOCATION_MAX_AGE_MS;
}

export function distanceFromLiveLocation(
  origin: (Partial<Coordinates> & { locationUpdatedAt?: string }) | null | undefined,
  destination: Partial<Coordinates> | null | undefined,
) {
  return hasFreshCoordinates(origin) ? distanceInKilometers(origin, destination) : null;
}
export function distanceInKilometers(origin: Partial<Coordinates> | null | undefined, destination: Partial<Coordinates> | null | undefined) {
  if (!hasUsableCoordinates(origin) || !hasUsableCoordinates(destination)) return null;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const bounded = Math.min(1, Math.max(0, haversine));
  return 6371 * 2 * Math.atan2(Math.sqrt(bounded), Math.sqrt(1 - bounded));
}

export function formatDistance(distance: number | null) {
  if (distance === null) return "Location unavailable";
  return `${distance < 10 ? distance.toFixed(1) : distance.toFixed(0)} km`;
}

export function formatDistanceWithContext(distance: number | null, context: string) {
  return distance === null ? "Location unavailable" : `${formatDistance(distance)} ${context}`;
}
