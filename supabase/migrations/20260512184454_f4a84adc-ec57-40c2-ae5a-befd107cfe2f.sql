
-- Seed daily forecast scores for next 7 days for each lake
INSERT INTO public.lake_scores (lake_id, score, temperature, pressure, wind_speed, calculated_at)
SELECT
  l.id,
  GREATEST(20, LEAST(95, 50 + (random() * 50)::int - d * 3 + (hashtext(l.name) % 20)))::numeric(5,2) AS score,
  (15 + random() * 12 + (d % 3))::numeric(4,1) AS temperature,
  (1005 + random() * 20)::numeric(6,1) AS pressure,
  (3 + random() * 18)::numeric(4,1) AS wind_speed,
  (date_trunc('day', now()) + (d || ' days')::interval + interval '9 hours')
FROM public.lakes l
CROSS JOIN generate_series(1, 6) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM public.lake_scores s
  WHERE s.lake_id = l.id
    AND s.calculated_at::date = (date_trunc('day', now()) + (d || ' days')::interval)::date
);

-- View: scores for a specific date (one row per lake, the latest within that day)
CREATE OR REPLACE VIEW public.lake_scores_by_day
WITH (security_invoker=true) AS
SELECT
  l.id AS lake_id,
  l.name,
  l.county,
  l.distance_km,
  s.score,
  s.temperature,
  s.pressure,
  s.wind_speed,
  s.calculated_at,
  s.calculated_at::date AS score_date
FROM public.lakes l
JOIN LATERAL (
  SELECT * FROM public.lake_scores ls
  WHERE ls.lake_id = l.id
  ORDER BY ls.calculated_at DESC
) s ON true;
