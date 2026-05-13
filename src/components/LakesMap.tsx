import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapLake = {
  id: string;
  name: string;
  county: string | null;
  distance_km: number | null;
  latitude: number;
  longitude: number;
  score: number | null;
  temperature: number | null;
  wind_speed: number | null;
  pressure: number | null;
};

function scoreColor(score: number | null) {
  if (score == null) return "var(--muted-foreground)";
  if (score >= 75) return "var(--color-score-high)";
  if (score >= 50) return "var(--color-score-mid)";
  return "var(--color-score-low)";
}

function makeIcon(score: number | null) {
  const color = scoreColor(score);
  const label = score == null ? "–" : Math.round(score).toString();
  const html = `
    <div style="
      display:flex;align-items:center;justify-content:center;
      width:38px;height:38px;border-radius:9999px;
      background:${color};color:#0b1220;font-weight:700;font-size:13px;
      border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 6px 18px -6px rgba(0,0,0,0.55);
      transform:translate(-50%,-100%);
    ">${label}</div>
    <div style="
      width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
      border-top:8px solid ${color};
      transform:translate(-50%,-100%);margin-top:-2px;
    "></div>`;
  return L.divIcon({
    html,
    className: "lake-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ lakes }: { lakes: MapLake[] }) {
  const map = useMap();
  useEffect(() => {
    if (!lakes.length) return;
    const bounds = L.latLngBounds(lakes.map((l) => [l.latitude, l.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [lakes, map]);
  return null;
}

export function LakesMap({ lakes }: { lakes: MapLake[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-full w-full animate-pulse rounded-2xl bg-card/60" />;
  }

  const center: [number, number] = [44.4268, 26.1025]; // Bucharest

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", background: "var(--background)" }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds lakes={lakes} />
      {lakes.map((l) => (
        <Marker key={l.id} position={[l.latitude, l.longitude]} icon={makeIcon(l.score)}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{l.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                {l.county ?? "—"}
                {l.distance_km != null ? ` · ${l.distance_km} km` : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                <div><b>Score:</b> {l.score ?? "—"}</div>
                <div><b>Temp:</b> {l.temperature ?? "—"}°C</div>
                <div><b>Wind:</b> {l.wind_speed ?? "—"} km/h</div>
                <div><b>Pres:</b> {l.pressure ?? "—"} hPa</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default LakesMap;
