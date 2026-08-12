const DEFAULT_LAT = 18.559;
const DEFAULT_LNG = 73.7868;

export function routeUrl(
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  from = { latitude: 18.553, longitude: 73.781 },
) {
  return `https://www.openstreetmap.org/directions?from=${from.latitude}%2C${from.longitude}&to=${latitude}%2C${longitude}`;
}
