import { Thermometer, Wind, Gauge, MapPin, Fish, ArrowDown, ArrowUp, Minus, Clock, Sunrise } from "lucide-react";

export type FeedingWindow = { start: string; end: string; label?: string };

type Props = {
  name: string;
  county: string | null;
  distance_km: number | null;
  score: number | null;
  temperature: number | null;
  temperature_delta: number | null;
  pressure: number | null;
  pressure_delta: number | null;
  wind_speed: number | null;
  feeding_windows: FeedingWindow[];
  calculated_at: string | null;
  rank: number;
};

function scoreTone(score: number) {
  if (score >= 75) return { bg: "bg-[var(--color-score-high)]/15", text: "text-[var(--color-score-high)]", label: "Excellent", ring: "ring-[var(--color-score-high)]/40", solid: "bg-[var(--color-score-high)]" };
  if (score >= 50) return { bg: "bg-[var(--color-score-mid)]/15", text: "text-[var(--color-score-mid)]", label: "Good", ring: "ring-[var(--color-score-mid)]/40", solid: "bg-[var(--color-score-mid)]" };
  return { bg: "bg-[var(--color-score-low)]/15", text: "text-[var(--color-score-low)]", label: "Poor", ring: "ring-[var(--color-score-low)]/40", solid: "bg-[var(--color-score-low)]" };
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PressureTrend({ delta }: { delta: number | null }) {
  if (delta == null || Math.abs(delta) < 0.2)
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" /> steady
      </span>
    );
  // Falling pressure → carp feeding → green; rising → red
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[var(--color-score-high)]">
        <ArrowDown className="h-3 w-3" /> {delta.toFixed(1)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-score-low)]">
      <ArrowUp className="h-3 w-3" /> +{delta.toFixed(1)}
    </span>
  );
}

function TempTrend({ delta }: { delta: number | null }) {
  if (delta == null || Math.abs(delta) < 0.1) return null;
  const positive = delta > 0;
  return (
    <span className={`ml-1 inline-flex items-center gap-0.5 text-[10px] font-medium ${positive ? "text-[var(--color-score-mid)]" : "text-primary"}`}>
      {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(delta).toFixed(1)}°
    </span>
  );
}

export function LakeCard({
  name,
  county,
  distance_km,
  score,
  temperature,
  temperature_delta,
  pressure,
  pressure_delta,
  wind_speed,
  feeding_windows,
  calculated_at,
  rank,
}: Props) {
  const s = score ?? 0;
  const tone = scoreTone(s);

  return (
    <article className="glass relative overflow-hidden rounded-3xl p-5">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30 ${tone.solid}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-foreground">
              {rank}
            </span>
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {county ?? "—"}{distance_km != null ? ` · ${distance_km} km` : ""}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-lg font-semibold tracking-tight text-foreground">
            {name}
          </h3>
        </div>

        <div className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 ring-1 ${tone.bg} ${tone.ring}`}>
          <div className={`flex items-center gap-1 text-2xl font-bold leading-none ${tone.text}`}>
            <Fish className="h-4 w-4" />
            {Math.round(s)}
          </div>
          <span className={`mt-1 text-[10px] font-medium uppercase tracking-wider ${tone.text}`}>
            {tone.label}
          </span>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <Stat
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Temp"
          value={temperature != null ? `${Number(temperature).toFixed(1)}°` : "—"}
          extra={<TempTrend delta={temperature_delta} />}
        />
        <Stat
          icon={<Wind className="h-3.5 w-3.5" />}
          label="Wind"
          value={wind_speed != null ? `${Math.round(Number(wind_speed))} km/h` : "—"}
        />
        <Stat
          icon={<Gauge className="h-3.5 w-3.5" />}
          label="Pressure"
          value={pressure != null ? `${Math.round(Number(pressure))}` : "—"}
          extra={<span className="ml-1 text-[10px]"><PressureTrend delta={pressure_delta} /></span>}
        />
      </div>

      {feeding_windows.length > 0 && (
        <div className="relative mt-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Sunrise className="h-3 w-3" />
            Best feeding windows
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {feeding_windows.slice(0, 3).map((w, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/30"
              >
                {w.label && <span className="opacity-80">{w.label}</span>}
                <span>{w.start}–{w.end}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        Updated {timeAgo(calculated_at)}
      </div>
    </article>
  );
}

function Stat({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 flex items-center text-sm font-semibold text-foreground">
        {value}
        {extra}
      </div>
    </div>
  );
}
