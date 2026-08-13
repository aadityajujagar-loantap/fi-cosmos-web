import { useEffect } from "react";

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
  trails?: Array<{
    color?: string;
    coordinates: Array<{ latitude: number; longitude: number }>;
    id: string;
  }>;
  userLocation?: { latitude: number; longitude: number };
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function zoomForSpan(zoomSpan: number) {
  if (zoomSpan <= 0.014) return 15;
  if (zoomSpan <= 0.04) return 14;
  if (zoomSpan <= 0.09) return 13;
  return 11;
}

function buildLeafletHtml(options: {
  centerLat: number;
  centerLng: number;
  draggableMarkerId?: string;
  markers: Array<{ id: string; label: string; latitude: number; longitude: number; color: string; selected: boolean }>;
  trails?: Array<{ color: string; coordinates: Array<{ latitude: number; longitude: number }> }>;
  userLocation?: { latitude: number; longitude: number };
  zoom: number;
}) {
  const markersJs = options.markers
    .map((marker) => {
      const markerId = JSON.stringify(marker.id);
      const isDraggable = marker.id === options.draggableMarkerId;
      const markerTransform = marker.selected ? "rotate(45deg) scale(1.3)" : "rotate(45deg)";

      return `
        (function() {
          var markerId = ${markerId};
          var icon = L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:${marker.color};border:2px solid white;border-radius:3px 3px 50% 3px;transform:${markerTransform};box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 14],
            popupAnchor: [0, -16]
          });
          var pin = L.marker([${marker.latitude}, ${marker.longitude}], {
            draggable: ${isDraggable},
            icon: icon
          }).addTo(map).bindPopup('<b style="font-size:11px;color:#07183f">${escapeHtml(marker.label)}</b>');
          pin.on('click', function() {
            window.parent.postMessage({ type: 'markerClick', id: markerId }, '*');
          });
          pin.on('drag', function(event) {
            var point = event.target.getLatLng();
            window.parent.postMessage({ type: 'markerDrag', id: markerId, latitude: point.lat, longitude: point.lng }, '*');
          });
          pin.on('dragend', function(event) {
            var point = event.target.getLatLng();
            window.parent.postMessage({ type: 'markerDragEnd', id: markerId, latitude: point.lat, longitude: point.lng }, '*');
          });
        })();
      `;
    })
    .join("\n");

  const trailsJs = (options.trails || [])
    .map((trail) => {
      const points = JSON.stringify(trail.coordinates.map((point) => [point.latitude, point.longitude]));
      return `L.polyline(${points}, { color: '${trail.color}', weight: 4, opacity: 0.78, dashArray: '6 8' }).addTo(map);`;
    })
    .join("\n");

  const userLocJs = options.userLocation
    ? `
      L.circleMarker([${options.userLocation.latitude}, ${options.userLocation.longitude}], {
        radius: 8,
        fillColor: '#1158d4',
        color: 'white',
        weight: 2,
        fillOpacity: 1
      }).addTo(map).bindPopup('<b style="font-size:11px;color:#1158d4">Your Location</b>');
    `
    : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    html, body { margin:0; padding:0; height:100%; width:100%; overflow:hidden; }
    #map { height:100%; width:100%; }
    .leaflet-container { background:#dbeafe; font-family:Arial,sans-serif; }
    .leaflet-control-zoom { border-radius:10px!important; overflow:hidden; }
    .leaflet-control-zoom a { border-radius:0!important; font-size:16px!important; }
    .leaflet-marker-draggable { cursor:grab!important; }
    .leaflet-popup-content-wrapper { border-radius:10px!important; box-shadow:0 4px 16px rgba(0,0,0,0.15)!important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { attributionControl: true, zoomControl: true }).setView([${options.centerLat}, ${options.centerLng}], ${options.zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    ${trailsJs}
    ${markersJs}
    ${userLocJs}
    setTimeout(function() { map.invalidateSize(); }, 150);
  </script>
</body>
</html>`;
}

export function OpenStreetMap({
  className = "",
  destinationLabel = "102, Sai Residency, Baner Road",
  draggableMarkerId,
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  markers = [],
  onMarkerClick,
  onMarkerDrag,
  onMarkerDragEnd,
  selectedMarkerId,
  trails = [],
  userLocation,
  zoomSpan = 0.018,
}: OpenStreetMapProps) {
  const activeMarkers = markers.length
    ? markers
    : [{ id: "destination", label: destinationLabel, latitude, longitude, priority: "HIGH" as const }];

  const centerLat = selectedMarkerId
    ? (activeMarkers.find((marker) => marker.id === selectedMarkerId)?.latitude ?? latitude)
    : latitude;
  const centerLng = selectedMarkerId
    ? (activeMarkers.find((marker) => marker.id === selectedMarkerId)?.longitude ?? longitude)
    : longitude;

  const htmlContent = buildLeafletHtml({
    centerLat,
    centerLng,
    draggableMarkerId,
    markers: activeMarkers.map((marker) => ({
      color: priorityColor(marker.priority),
      id: marker.id,
      label: marker.label,
      latitude: marker.latitude,
      longitude: marker.longitude,
      selected: marker.id === selectedMarkerId || (!selectedMarkerId && activeMarkers[0]?.id === marker.id),
    })),
    trails: trails.map((trail) => ({
      color: trail.color || "#1158d4",
      coordinates: trail.coordinates,
    })),
    userLocation,
    zoom: zoomForSpan(zoomSpan),
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "markerClick" && event.data?.id) {
        onMarkerClick?.(event.data.id as string);
        return;
      }

      if ((event.data?.type === "markerDrag" || event.data?.type === "markerDragEnd") && event.data?.id) {
        const location = {
          latitude: Number(event.data.latitude),
          longitude: Number(event.data.longitude),
        };

        if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return;

        if (event.data.type === "markerDrag") {
          onMarkerDrag?.(event.data.id as string, location);
        } else {
          onMarkerDragEnd?.(event.data.id as string, location);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMarkerClick, onMarkerDrag, onMarkerDragEnd]);

  return (
    <div className={`relative overflow-hidden bg-[#dfeaf6] ${className}`} aria-label={`Map near ${destinationLabel}`}>
      <iframe
        title="Location Map"
        className="h-full w-full border-0"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        srcDoc={htmlContent}
      />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#1158d4] shadow-sm">
        (c) OpenStreetMap
      </div>
    </div>
  );
}
