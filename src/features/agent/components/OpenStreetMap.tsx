import { useEffect, useRef } from "react";

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
  // draggableMarkerId and onMarkerDrag kept for API compat but drag handled via popup in real Leaflet
  draggableMarkerId?: string;
  onMarkerDrag?: (id: string, location: { latitude: number; longitude: number }) => void;
  onMarkerDragEnd?: (id: string, location: { latitude: number; longitude: number }) => void;
  zoomSpan?: number;
}

const DEFAULT_LAT = 18.559;
const DEFAULT_LNG = 73.7868;

function priorityColor(priority?: "HIGH" | "MEDIUM" | "LOW") {
  if (priority === "LOW") return "#088d27";
  if (priority === "MEDIUM") return "#e58000";
  return "#ef3b3b";
}

// Build the full self-contained Leaflet HTML to inject in the iframe
function buildLeafletHtml(options: {
  centerLat: number;
  centerLng: number;
  markers: Array<{ id: string; label: string; latitude: number; longitude: number; color: string; selected: boolean }>;
  userLocation?: { latitude: number; longitude: number };
}) {
  const markersJs = options.markers
    .map(
      (m) => `
      (function() {
        var icon = L.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;background:${m.color};border:2px solid white;border-radius:3px 3px 50% 3px;transform:rotate(45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35);${m.selected ? "transform:rotate(45deg) scale(1.3);" : ""}"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 14],
          popupAnchor: [0, -16],
        });
        var marker = L.marker([${m.latitude}, ${m.longitude}], { icon: icon })
          .addTo(map)
          .bindPopup('<b style="font-size:11px;color:#07183f">${m.label.replace(/'/g, "&#39;").replace(/"/g, "&quot;")}</b>');
        marker.on('click', function() {
          window.parent.postMessage({ type: 'markerClick', id: '${m.id}' }, '*');
        });
      })();
    `,
    )
    .join("\n");

  const userLocJs = options.userLocation
    ? `
      L.circleMarker([${options.userLocation.latitude}, ${options.userLocation.longitude}], {
        radius: 8,
        fillColor: '#1158d4',
        color: 'white',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map).bindPopup('<b style="font-size:11px;color:#1158d4">Your Location</b>');
    `
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    html, body { margin:0; padding:0; height:100%; width:100%; overflow:hidden; }
    #map { height:100%; width:100%; }
    .leaflet-control-zoom { border-radius:10px!important; overflow:hidden; }
    .leaflet-control-zoom a { border-radius:0!important; font-size:16px!important; }
    .leaflet-popup-content-wrapper { border-radius:10px!important; box-shadow:0 4px 16px rgba(0,0,0,0.15)!important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${options.centerLat}, ${options.centerLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    ${markersJs}
    ${userLocJs}
  </script>
</body>
</html>`;
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
}: OpenStreetMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeMarkers = markers.length
    ? markers
    : [{ id: "destination", label: destinationLabel, latitude, longitude, priority: "HIGH" as const }];

  const centerLat = selectedMarkerId
    ? (activeMarkers.find((m) => m.id === selectedMarkerId)?.latitude ?? latitude)
    : latitude;
  const centerLng = selectedMarkerId
    ? (activeMarkers.find((m) => m.id === selectedMarkerId)?.longitude ?? longitude)
    : longitude;

  const htmlContent = buildLeafletHtml({
    centerLat,
    centerLng,
    markers: activeMarkers.map((m) => ({
      id: m.id,
      label: m.label,
      latitude: m.latitude,
      longitude: m.longitude,
      color: priorityColor(m.priority),
      selected: m.id === selectedMarkerId || (!selectedMarkerId && activeMarkers[0]?.id === m.id),
    })),
    userLocation,
  });

  // Reload the iframe when center or markers change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLng, selectedMarkerId, userLocation?.latitude, userLocation?.longitude, activeMarkers.length]);

  // Listen for marker click messages from the iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "markerClick" && event.data?.id) {
        onMarkerClick?.(event.data.id as string);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMarkerClick]);

  return (
    <div className={`relative overflow-hidden bg-[#dfeaf6] ${className}`} aria-label={`Map near ${destinationLabel}`}>
      <iframe
        ref={iframeRef}
        title="Location Map"
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#1158d4] shadow-sm">
        © OpenStreetMap
      </div>
    </div>
  );
}
