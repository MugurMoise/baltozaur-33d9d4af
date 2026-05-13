-- Add trend and feeding window columns to lake_scores
ALTER TABLE public.lake_scores
  ADD COLUMN IF NOT EXISTS temperature_delta numeric,
  ADD COLUMN IF NOT EXISTS pressure_delta numeric,
  ADD COLUMN IF NOT EXISTS feeding_windows jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Recreate the latest_lake_scores view to expose lat/lon and new fields
DROP VIEW IF EXISTS public.latest_lake_scores;

CREATE VIEW public.latest_lake_scores
WITH (security_invoker = true) AS
SELECT
  l.id AS lake_id,
  l.name,
  l.county,
  l.distance_km,
  l.latitude AS lat,
  l.longitude AS lon,
  s.score,
  s.temperature,
  s.temperature_delta,
  s.pressure,
  s.pressure_delta,
  s.wind_speed,
  s.feeding_windows,
  s.calculated_at
FROM public.lakes l
JOIN LATERAL (
  SELECT score, temperature, temperature_delta, pressure, pressure_delta,
         wind_speed, feeding_windows, calculated_at
  FROM public.lake_scores
  WHERE lake_id = l.id
  ORDER BY calculated_at DESC
  LIMIT 1
) s ON true;

-- Backfill realistic deltas and feeding windows for the latest row per lake
WITH latest AS (
  SELECT DISTINCT ON (lake_id) id, lake_id
  FROM public.lake_scores
  ORDER BY lake_id, calculated_at DESC
)
UPDATE public.lake_scores ls
SET
  temperature_delta = ROUND((random() * 4 - 2)::numeric, 1),
  pressure_delta    = ROUND((random() * 6 - 3)::numeric, 1),
  feeding_windows   = jsonb_build_array(
    jsonb_build_object('start', '05:30', 'end', '08:00', 'label', 'Dawn'),
    jsonb_build_object('start', '19:00', 'end', '21:30', 'label', 'Dusk')
  )
FROM latest
WHERE ls.id = latest.id;