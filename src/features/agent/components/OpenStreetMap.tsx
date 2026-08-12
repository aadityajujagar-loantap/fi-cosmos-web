interface OpenStreetMapProps {
  className?: string;
  destinationLabel?: string;
  latitude?: number;
  longitude?: number;
  markers?: Array<{
    id: string;
    label: string;
    latitude: number;
    longitude: number;
    priority?: "HIGH" | "MEDIUM" | "LOW";
  }>;
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string;
  userLocation?: { latitude: number; longitude: number };
  zoomSpan?: number;
}

const DEFAULT_LAT = 18.559;
const DEFAULT_LNG = 73.7868;
const TILE_SIZE = 256;
const TILE_ZOOM = 15;

function lonToTileX(longitude: number, zoom: number) {
  return Math.floor(((longitude + 180) / 360) * 2 ** zoom);
}

function latToTileY(latitude: number, zoom: number) {
  const latitudeRad = (latitude * Math.PI) / 180;
  const mercator = Math.log(Math.tan(latitudeRad) + 1 / Math.cos(latitudeRad));

  return Math.floor(((1 - mercator / Math.PI) / 2) * 2 ** zoom);
}

export function OpenStreetMap({
  className = "",
  destinationLabel = "102, Sai Residency, Baner Road",
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  markers = [],
  onMarkerClick,
  selectedMarkerId,
  userLocation,
  zoomSpan = 0.018,
}: OpenStreetMapProps) {
  const centerX = lonToTileX(longitude, TILE_ZOOM);
  const centerY = latToTileY(latitude, TILE_ZOOM);
  const north = latitude + zoomSpan / 2;
  const south = latitude - zoomSpan / 2;
  const east = longitude + zoomSpan / 2;
  const west = longitude - zoomSpan / 2;
  const tiles = [-1, 0, 1].flatMap((row) =>
    [-1, 0, 1].map((column) => ({
      column,
      row,
      src: `https://tile.openstreetmap.org/${TILE_ZOOM}/${centerX + column}/${centerY + row}.png`,
    })),
  );
  const activeMarkers = markers.length
    ? markers
    : [{ id: "destination", label: destinationLabel, latitude, longitude, priority: "HIGH" as const }];

  const markerPosition = (markerLatitude: number, markerLongitude: number) => ({
    left: `${Math.min(94, Math.max(6, ((markerLongitude - west) / (east - west)) * 100))}%`,
    top: `${Math.min(88, Math.max(12, ((north - markerLatitude) / (north - south)) * 100))}%`,
  });

  const markerClass = (priority?: "HIGH" | "MEDIUM" | "LOW") => {
    if (priority === "LOW") return "bg-[#088d27]";
    if (priority === "MEDIUM") return "bg-[#e58000]";
    return "bg-[#ef3b3b]";
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#dfeaf6] ${className}`}
      aria-label={`OpenStreetMap route near ${destinationLabel}`}
      role="img"
    >
      <div className="absolute inset-0 bg-[linear-gradient(42deg,transparent_46%,rgba(255,255,255,0.92)_47%,rgba(255,255,255,0.92)_53%,transparent_54%),linear-gradient(128deg,transparent_44%,rgba(255,255,255,0.86)_45%,rgba(255,255,255,0.86)_53%,transparent_54%),linear-gradient(90deg,rgba(17,88,212,0.09)_1px,transparent_1px),linear-gradient(0deg,rgba(17,88,212,0.09)_1px,transparent_1px)] bg-[length:100%_100%,100%_100%,48px_48px,48px_48px]" />
      <div
        className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-3 grid-rows-3 shadow-sm"
        style={{ height: TILE_SIZE * 3, width: TILE_SIZE * 3 }}
      >
        {tiles.map((tile) => (
          <img
            key={`${tile.column}-${tile.row}`}
            alt=""
            className="h-64 w-64 object-cover"
            draggable={false}
            loading="lazy"
            referrerPolicy="no-referrer"
            src={tile.src}
          />
        ))}
      </div>
      <div className="absolute left-[20%] top-[61%] h-2 w-[68%] -rotate-[18deg] rounded-full bg-[#ffcf4a]/90 shadow-[0_0_0_3px_rgba(255,255,255,0.75)]" />
      <div className="absolute left-[43%] top-[22%] h-[62%] w-1.5 rotate-[12deg] rounded-full bg-white/95 shadow-[0_0_0_2px_rgba(17,88,212,0.12)]" />
      <div className="absolute left-[12%] top-[38%] h-1.5 w-[54%] rotate-[8deg] rounded-full bg-white/95 shadow-[0_0_0_2px_rgba(17,88,212,0.12)]" />
      <div className="absolute left-[54%] top-[44%] h-[8px] w-[8px] rounded-full bg-[#1158d4] shadow-[0_0_0_5px_rgba(17,88,212,0.18)]" />
      {activeMarkers.map((marker) => {
        const isSelected = selectedMarkerId ? selectedMarkerId === marker.id : activeMarkers[0]?.id === marker.id;
        const position = markerPosition(marker.latitude, marker.longitude);

        return (
          <button
            key={marker.id}
            onClick={() => onMarkerClick?.(marker.id)}
            type="button"
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-left"
            style={position}
            aria-label={`Select ${marker.label}`}
          >
            {isSelected ? (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-[#07183f] shadow-md">
                <span className="block max-w-[130px] truncate">{marker.label}</span>
              </span>
            ) : null}
            <span
              className={`block h-4 w-4 rotate-45 rounded-br-[10px] rounded-tl-[10px] border-2 border-white shadow-md ${
                isSelected ? `${markerClass(marker.priority)} scale-125` : markerClass(marker.priority)
              }`}
            />
          </button>
        );
      })}
      {userLocation ? (
        <div
          className="absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1158d4] shadow-[0_0_0_6px_rgba(17,88,212,0.18)]"
          style={markerPosition(userLocation.latitude, userLocation.longitude)}
          aria-label="Your current location"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#1158d4] shadow-sm">
        OpenStreetMap tiles
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-[#5c6a85] shadow-sm">
        zoom {TILE_ZOOM} / span {zoomSpan.toFixed(3)}
      </div>
    </div>
  );
}
