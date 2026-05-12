import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Fish, Thermometer, Wind, Gauge, MapPin, Clock, Calendar as CalendarIcon, X } from "lucide-react";

type Lake = {
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

function scoreTone(score: number) {
  if (score >= 75)
    return { text: "text-[var(--color-score-high)]", bg: "bg-[var(--color-score-high)]/15", ring: "ring-[var(--color-score-high)]/40", label: "Excelent" };
  if (score >= 55)
    return { text: "text-[var(--color-score-mid)]", bg: "bg-[var(--color-score-mid)]/15", ring: "ring-[var(--color-score-mid)]/40", label: "Bun" };
  return { text: "text-[var(--color-score-low)]", bg: "bg-[var(--color-score-low)]/15", ring: "ring-[var(--color-score-low)]/40", label: "Slab" };
}

export function LakeDetailSheet({
  lake,
  selectedDate,
  open,
  onOpenChange,
}: {
  lake: Lake | null;
  selectedDate: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const s = lake?.score ?? 0;
  const tone = scoreTone(s);
  const dateLabel = new Date(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const calcLabel = lake?.calculated_at
    ? new Date(lake.calculated_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border">
        <div className="mx-auto w-full max-w-xl px-5 pb-8 pt-2">
          <DrawerHeader className="px-0 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {lake?.county ?? "—"} · {lake?.distance_km ?? "—"} km
                  </span>
                </div>
                <DrawerTitle className="mt-1.5 truncate text-2xl">
                  {lake?.name ?? "—"}
                </DrawerTitle>
                <DrawerDescription className="mt-1 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Forecast for {dateLabel}
                </DrawerDescription>
              </div>
              <DrawerClose className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Score hero */}
          <div
            className={`mb-4 flex items-center justify-between rounded-2xl p-5 ring-1 ${tone.bg} ${tone.ring}`}
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Carp activity
              </p>
              <p className={`mt-1 text-5xl font-bold leading-none ${tone.text}`}>
                {Math.round(s)}
              </p>
              <p className={`mt-2 text-xs font-semibold uppercase tracking-wider ${tone.text}`}>
                {tone.label}
              </p>
            </div>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tone.bg} ${tone.text}`}
            >
              <Fish className="h-8 w-8" />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <BigStat
              icon={<Thermometer className="h-4 w-4" />}
              label="Temperature"
              value={lake?.temperature != null ? `${Number(lake.temperature).toFixed(1)}°` : "—"}
              unit="C"
            />
            <BigStat
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={lake?.wind_speed != null ? `${Math.round(Number(lake.wind_speed))}` : "—"}
              unit="km/h"
            />
            <BigStat
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={lake?.pressure != null ? `${Math.round(Number(lake.pressure))}` : "—"}
              unit="hPa"
            />
          </div>

          {/* Calculated time */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last calculated
            </span>
            <span className="font-medium text-foreground">{calcLabel}</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function BigStat({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border p-3"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold leading-none text-foreground">{value}</span>
        <span className="text-[10px] font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
