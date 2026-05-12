import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LakeCard } from "@/components/LakeCard";
import { Fish, RefreshCw, Waves } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Crap Live · Lacuri de pescuit lângă București" },
      {
        name: "description",
        content:
          "Top lacuri de crap din jurul Bucureștiului: scor activitate, temperatură, vânt și presiune actualizate în timp real.",
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
  if (m < 1) return "acum";
  if (m < 60) return `acum ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `acum ${h} h`;
  return new Date(iso).toLocaleDateString("ro-RO");
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
            <h1 className="text-xl font-bold leading-tight tracking-tight">Crap Live</h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Waves className="h-3 w-3" /> Lacuri lângă București
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Reîmprospătează"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </header>

      <section
        className="mb-5 rounded-2xl border border-border p-4"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Top de azi</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">
              {lakes.length} lacuri
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Actualizat</p>
            <p className="mt-0.5 text-sm font-medium">{timeAgo(lastUpdated)}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          Nu am putut încărca datele. Încearcă din nou.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {lakes.map((l, i) => (
            <li key={l.lake_id ?? i}>
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
      )}

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        Date actualizate periodic · scorul reflectă activitatea estimată a crapului
      </footer>
    </main>
  );
}
