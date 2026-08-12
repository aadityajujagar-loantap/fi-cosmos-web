const DEFAULT_LAT = 18.559;
const DEFAULT_LNG = 73.7868;

export function routeUrl(latitude = DEFAULT_LAT, longitude = DEFAULT_LNG) {
  return `https://www.openstreetmap.org/directions?from=18.553%2C73.781&to=${latitude}%2C${longitude}`;
}
