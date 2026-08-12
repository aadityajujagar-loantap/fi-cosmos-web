interface OpenStreetMapProps {
  className?: string;
  destinationLabel?: string;
  latitude?: number;
  longitude?: number;
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
  zoomSpan = 0.018,
}: OpenStreetMapProps) {
  const centerX = lonToTileX(longitude, TILE_ZOOM);
  const centerY = latToTileY(latitude, TILE_ZOOM);
  const tiles = [-1, 0, 1].flatMap((row) =>
    [-1, 0, 1].map((column) => ({
      column,
      row,
      src: `https://tile.openstreetmap.org/${TILE_ZOOM}/${centerX + column}/${centerY + row}.png`,
    })),
  );

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
      <div className="absolute left-[62%] top-[34%] -translate-x-1/2 -translate-y-full rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-[#07183f] shadow-md">
        <span className="block max-w-[120px] truncate">{destinationLabel}</span>
      </div>
      <div className="absolute left-[62%] top-[34%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-br-[10px] rounded-tl-[10px] border-2 border-white bg-[#ef3b3b] shadow-md" />
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
