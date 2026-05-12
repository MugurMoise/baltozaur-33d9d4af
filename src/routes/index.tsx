import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LakeCard } from "@/components/LakeCard";
import { Fish, RefreshCw, Waves, Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Top Carp Lakes Near Bucharest" },
      {
        name: "description",
        content:
          "Live carp activity scores, temperature, wind and pressure for the best fishing lakes around Bucharest.",
      },
    ],
  }),
});

type Row = {
  lake_id: string | null;
  name: string | null;
  county: string | null;
  distance_km: number | null;
  score: number | null;
  temperature: number | null;
  pressure: number | null;
  wind_speed: number | null;
  calculated_at: string | null;
};

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
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["latest_lake_scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("latest_lake_scores")
        .select("*")
        .order("score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const lakes = data ?? [];
  const lastUpdated = lakes
    .map((l) => l.calculated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  const topLakes = lakes.slice(0, 3);
  const bestConditions = lakes.filter((l) => (l.score ?? 0) >= 75);

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
              Top Carp Lakes Near Bucharest
            </h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Waves className="h-3 w-3" /> Live fishing conditions
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </header>

      <section
        className="mb-6 rounded-2xl border border-border p-4"
        style={{ background: "var(--gradient-card)" }}
      >
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

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          Could not load data. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
          ))}
        </div>
      ) : (
        <>
          {topLakes.length > 0 && (
            <section className="mb-7">
              <SectionHeader
                icon={<Trophy className="h-4 w-4 text-[var(--color-score-mid)]" />}
                title="Top Lakes Today"
                subtitle="Highest scoring spots right now"
              />
              <ul className="mt-3 space-y-3">
                {topLakes.map((l, i) => (
                  <li key={l.lake_id ?? `top-${i}`}>
                    <LakeCard
                      name={l.name ?? "—"}
                      county={l.county}
                      distance_km={l.distance_km}
                      score={l.score}
                      temperature={l.temperature}
                      pressure={l.pressure}
                      wind_speed={l.wind_speed}
                      rank={i + 1}
                    />
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
                  : "No lakes in peak condition right now"
              }
            />
            {bestConditions.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {bestConditions.map((l, i) => (
                  <li key={l.lake_id ?? `best-${i}`}>
                    <LakeCard
                      name={l.name ?? "—"}
                      county={l.county}
                      distance_km={l.distance_km}
                      score={l.score}
                      temperature={l.temperature}
                      pressure={l.pressure}
                      wind_speed={l.wind_speed}
                      rank={i + 1}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="mt-3 rounded-2xl border border-border p-5 text-sm text-muted-foreground"
                style={{ background: "var(--gradient-card)" }}
              >
                Conditions are average today — check back later.
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
                <li key={l.lake_id ?? `all-${i}`}>
                  <LakeCard
                    name={l.name ?? "—"}
                    county={l.county}
                    distance_km={l.distance_km}
                    score={l.score}
                    temperature={l.temperature}
                    pressure={l.pressure}
                    wind_speed={l.wind_speed}
                    rank={i + 1}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        Updated periodically · score reflects estimated carp activity
      </footer>
    </main>
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
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
