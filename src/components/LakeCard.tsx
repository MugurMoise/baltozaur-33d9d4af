import { Thermometer, Wind, Gauge, MapPin, Fish } from "lucide-react";

type Props = {
  name: string;
  county: string | null;
  distance_km: number | null;
  score: number | null;
  temperature: number | null;
  pressure: number | null;
  wind_speed: number | null;
  rank: number;
};

function scoreTone(score: number) {
  if (score >= 75) return { bg: "bg-[var(--color-score-high)]/15", text: "text-[var(--color-score-high)]", label: "Excelent", ring: "ring-[var(--color-score-high)]/40" };
  if (score >= 55) return { bg: "bg-[var(--color-score-mid)]/15", text: "text-[var(--color-score-mid)]", label: "Bun", ring: "ring-[var(--color-score-mid)]/40" };
  return { bg: "bg-[var(--color-score-low)]/15", text: "text-[var(--color-score-low)]", label: "Slab", ring: "ring-[var(--color-score-low)]/40" };
}

export function LakeCard({ name, county, distance_km, score, temperature, pressure, wind_speed, rank }: Props) {
  const s = score ?? 0;
  const tone = scoreTone(s);

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-transform active:scale-[0.99]"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-foreground">
              {rank}
            </span>
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {county ?? "—"} · {distance_km ?? "—"} km
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-lg font-semibold tracking-tight text-foreground">
            {name}
          </h3>
        </div>

        <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 ring-1 ${tone.bg} ${tone.ring}`}>
          <div className={`flex items-center gap-1 text-2xl font-bold leading-none ${tone.text}`}>
            <Fish className="h-4 w-4" />
            {Math.round(s)}
          </div>
          <span className={`mt-1 text-[10px] font-medium uppercase tracking-wider ${tone.text}`}>
            {tone.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={<Thermometer className="h-3.5 w-3.5" />} label="Temp" value={temperature != null ? `${temperature.toFixed(1)}°` : "—"} />
        <Stat icon={<Wind className="h-3.5 w-3.5" />} label="Vânt" value={wind_speed != null ? `${Math.round(wind_speed)} km/h` : "—"} />
        <Stat icon={<Gauge className="h-3.5 w-3.5" />} label="Presiune" value={pressure != null ? `${Math.round(pressure)} hPa` : "—"} />
      </div>
    </article>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
