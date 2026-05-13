import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LakesMap, type MapLake } from "@/components/LakesMap";
import { ArrowLeft, MapPin, Calendar as CalendarIcon } from "lucide-react";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "Map · Top Carp Lakes Near Bucharest" },
      { name: "description", content: "Interactive map of carp fishing lakes around Bucharest with live activity scores." },
    ],
  }),
});

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function buildDateOptions() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

type ScoreRow = {
  lake_id: string;
  score: number;
  temperature: number;
  pressure: number;
  wind_speed: number;
  calculated_at: string;
  lakes: {
    name: string;
    county: string | null;
    distance_km: number | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
};

function MapPage() {
  const dateOptions = useMemo(buildDateOptions, []);
  const [selectedDate, setSelectedDate] = useState(isoDate(dateOptions[0]));

  const { data, isLoading } = useQuery({
    queryKey: ["lakes_map", selectedDate],
    queryFn: async () => {
      const start = new Date(selectedDate + "T00:00:00");
      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      const { data, error } = await supabase
        .from("lake_scores")
        .select("lake_id, score, temperature, pressure, wind_speed, calculated_at, lakes(name, county, distance_km, latitude, longitude)")
        .gte("calculated_at", start.toISOString())
        .lt("calculated_at", end.toISOString())
        .order("calculated_at", { ascending: false });
      if (error) throw error;

      const seen = new Set<string>();
      const out: MapLake[] = [];
      for (const r of (data ?? []) as ScoreRow[]) {
        if (seen.has(r.lake_id)) continue;
        if (r.lakes?.latitude == null || r.lakes?.longitude == null) continue;
        seen.add(r.lake_id);
        out.push({
          id: r.lake_id,
          name: r.lakes.name,
          county: r.lakes.county,
          distance_km: r.lakes.distance_km,
          latitude: Number(r.lakes.latitude),
          longitude: Number(r.lakes.longitude),
          score: r.score,
          temperature: r.temperature,
          wind_speed: r.wind_speed,
          pressure: r.pressure,
        });
      }
      return out;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const lakes = data ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-6 pt-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </span>
          <h1 className="text-base font-bold tracking-tight">Lakes Map</h1>
        </div>
      </header>

      <section className="mb-3">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" /> Forecast date
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {dateOptions.map((d, i) => {
              const iso = isoDate(d);
              const active = iso === selectedDate;
              const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`flex min-w-[60px] shrink-0 flex-col items-center rounded-2xl border px-3 py-2 transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {i === 0 ? "Today" : weekday}
                  </span>
                  <span className={`mt-0.5 text-base font-bold leading-none ${active ? "" : "text-foreground"}`}>
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="relative h-[68vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-card/60" />
        ) : (
          <LakesMap lakes={lakes} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <LegendDot color="var(--color-score-high)" label="Excellent (75+)" />
        <LegendDot color="var(--color-score-mid)" label="Good (50–74)" />
        <LegendDot color="var(--color-score-low)" label="Poor (<50)" />
      </div>
    </main>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
