import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LakeCard, type FeedingWindow } from "@/components/LakeCard";
import { LakeDetailSheet } from "@/components/LakeDetailSheet";
import { LakesMap, type MapLake } from "@/components/LakesMap";
import { Fish, RefreshCw, Waves, Trophy, Sparkles, Map as MapIcon, Calendar as CalendarIcon } from "lucide-react";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isoDate(d: Date) {
  return startOfDay(d).toISOString();
}
function buildDateOptions() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Top Carp Lakes Near Bucharest" },
      {
        name: "description",
        content:
          "Live carp activity scores, weather trends and feeding windows for the best fishing lakes around Bucharest.",
      },
    ],
  }),
});

export type Lake = {
  lake_id: string;
  name: string;
  county: string | null;
  distance_km: number | null;
  lat: number | null;
  lon: number | null;
  score: number | null;
  temperature: number | null;
  temperature_delta: number | null;
  pressure: number | null;
  pressure_delta: number | null;
  wind_speed: number | null;
  feeding_windows: FeedingWindow[];
  calculated_at: string | null;
};

function parseFeedingWindows(raw: unknown): FeedingWindow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((w): w is FeedingWindow => !!w && typeof w === "object" && "start" in w && "end" in w)
    .map((w) => ({ start: String(w.start), end: String(w.end), label: w.label ? String(w.label) : undefined }));
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

function Home() {
  const [activeLake, setActiveLake] = useState<Lake | null>(null);
  const dateOptions = buildDateOptions();
  const [selectedDate, setSelectedDate] = useState<string>(isoDate(new Date()));
  const isToday = selectedDate === isoDate(new Date());

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["lake_scores_by_date", selectedDate],
    queryFn: async () => {
      const start = new Date(selectedDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("lake_scores")
        .select(
          "lake_id, score, temperature, temperature_delta, pressure, pressure_delta, wind_speed, feeding_windows, calculated_at, lakes(name, county, distance_km, latitude, longitude)",
        )
        .gte("calculated_at", start.toISOString())
        .lt("calculated_at", end.toISOString())
        .order("calculated_at", { ascending: false });
      if (error) throw error;

      // Dedupe by lake_id (keep latest within day)
      const seen = new Set<string>();
      const rows: Lake[] = [];
      for (const r of data ?? []) {
        if (!r.lake_id || seen.has(r.lake_id)) continue;
        seen.add(r.lake_id);
        const lk = (r as any).lakes ?? {};
        rows.push({
          lake_id: r.lake_id as string,
          name: lk.name ?? "—",
          county: lk.county ?? null,
          distance_km: lk.distance_km != null ? Number(lk.distance_km) : null,
          lat: lk.latitude != null ? Number(lk.latitude) : null,
          lon: lk.longitude != null ? Number(lk.longitude) : null,
          score: r.score != null ? Number(r.score) : null,
          temperature: r.temperature != null ? Number(r.temperature) : null,
          temperature_delta: r.temperature_delta != null ? Number(r.temperature_delta) : null,
          pressure: r.pressure != null ? Number(r.pressure) : null,
          pressure_delta: r.pressure_delta != null ? Number(r.pressure_delta) : null,
          wind_speed: r.wind_speed != null ? Number(r.wind_speed) : null,
          feeding_windows: parseFeedingWindows(r.feeding_windows),
          calculated_at: r.calculated_at,
        });
      }

      rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      return rows;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const lakes = data ?? [];
  const lastUpdated = lakes
    .map((l) => l.calculated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  const topLakes = lakes.slice(0, 3);
  const bestConditions = lakes.filter((l) => (l.score ?? 0) >= 75);

  const mapLakes: MapLake[] = lakes
    .filter((l) => l.lat != null && l.lon != null)
    .map((l) => ({
      id: l.lake_id,
      name: l.name,
      county: l.county,
      distance_km: l.distance_km,
      latitude: l.lat as number,
      longitude: l.lon as number,
      score: l.score,
      temperature: l.temperature,
      wind_speed: l.wind_speed,
      pressure: l.pressure,
    }));

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 pb-16 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Fish className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              Carp Lakes Near Bucharest
            </h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Waves className="h-3 w-3" /> Live conditions · auto-refresh 60s
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="glass inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Date selector */}
      <section className="-mx-4 mb-6 px-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <CalendarIcon className="h-3 w-3" /> Forecast day
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dateOptions.map((d, i) => {
            const iso = isoDate(d);
            const active = iso === selectedDate;
            const today = i === 0;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`glass flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2 transition ${
                  active
                    ? "bg-primary text-primary-foreground ring-1 ring-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">
                  {today ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span className="text-base font-semibold">{d.getDate()}</span>
                <span className="text-[10px]">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass mb-6 rounded-3xl p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Lakes tracked</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">{lakes.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Last updated</p>
            <p className="mt-0.5 text-sm font-medium">{timeAgo(lastUpdated)}</p>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="mb-7">
        <SectionHeader
          icon={<MapIcon className="h-4 w-4 text-primary" />}
          title="Lakes Map"
          subtitle="Markers colored by activity score"
        />
        <div className="glass mt-3 h-[320px] w-full overflow-hidden rounded-3xl p-1">
          {mapLakes.length > 0 ? (
            <LakesMap lakes={mapLakes} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No coordinates available.
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <LegendDot color="var(--color-score-high)" label="> 75" />
          <LegendDot color="var(--color-score-mid)" label="50–75" />
          <LegendDot color="var(--color-score-low)" label="< 50" />
        </div>
      </section>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          Could not load data. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : lakes.length === 0 ? (
        <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
          No lakes with forecast data yet.
        </div>
      ) : (
        <>
          {topLakes.length > 0 && (
            <section className="mb-7">
              <SectionHeader
                icon={<Trophy className="h-4 w-4 text-[var(--color-score-mid)]" />}
                title="Top Lakes"
                subtitle="Highest scoring spots right now"
              />
              <ul className="mt-3 space-y-3">
                {topLakes.map((l, i) => (
                  <li key={`top-${l.lake_id}`}>
                    <LakeCardButton lake={l} rank={i + 1} onSelect={setActiveLake} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionHeader
              icon={<Sparkles className="h-4 w-4 text-[var(--color-score-high)]" />}
              title="Best Fishing Conditions"
              subtitle={
                bestConditions.length
                  ? `${bestConditions.length} lake${bestConditions.length > 1 ? "s" : ""} in excellent shape`
                  : "No lakes in peak condition"
              }
            />
            {bestConditions.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {bestConditions.map((l, i) => (
                  <li key={`best-${l.lake_id}`}>
                    <LakeCardButton lake={l} rank={i + 1} onSelect={setActiveLake} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="glass mt-3 rounded-3xl p-5 text-sm text-muted-foreground">
                Conditions are average — check back later.
              </div>
            )}
          </section>

          <section className="mt-7">
            <SectionHeader
              icon={<Fish className="h-4 w-4 text-primary" />}
              title="All Lakes"
              subtitle="Sorted by carp activity score"
            />
            <ul className="mt-3 space-y-3">
              {lakes.map((l, i) => (
                <li key={`all-${l.lake_id}`}>
                  <LakeCardButton lake={l} rank={i + 1} onSelect={setActiveLake} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        Auto-refreshes every 60 seconds · score reflects estimated carp activity
      </footer>

      <LakeDetailSheet
        lake={activeLake}
        open={activeLake !== null}
        onOpenChange={(v) => !v && setActiveLake(null)}
      />
    </main>
  );
}

function LakeCardButton({
  lake,
  rank,
  onSelect,
}: {
  lake: Lake;
  rank: number;
  onSelect: (l: Lake) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lake)}
      className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-3xl"
    >
      <LakeCard
        name={lake.name}
        county={lake.county}
        distance_km={lake.distance_km}
        score={lake.score}
        temperature={lake.temperature}
        temperature_delta={lake.temperature_delta}
        pressure={lake.pressure}
        pressure_delta={lake.pressure_delta}
        wind_speed={lake.wind_speed}
        feeding_windows={lake.feeding_windows}
        calculated_at={lake.calculated_at}
        rank={rank}
      />
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
