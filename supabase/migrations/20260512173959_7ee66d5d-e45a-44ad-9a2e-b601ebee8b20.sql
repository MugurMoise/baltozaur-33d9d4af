
CREATE TABLE public.lakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  county text NOT NULL,
  distance_km numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lake_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lake_id uuid NOT NULL REFERENCES public.lakes(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  temperature numeric NOT NULL,
  pressure numeric NOT NULL,
  wind_speed numeric NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lake_scores_lake_calc ON public.lake_scores(lake_id, calculated_at DESC);

ALTER TABLE public.lakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lake_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lakes are viewable by everyone"
  ON public.lakes FOR SELECT USING (true);

CREATE POLICY "Lake scores are viewable by everyone"
  ON public.lake_scores FOR SELECT USING (true);

CREATE OR REPLACE VIEW public.latest_lake_scores
WITH (security_invoker = true) AS
SELECT
  l.id AS lake_id,
  l.name,
  l.county,
  l.distance_km,
  s.score,
  s.temperature,
  s.pressure,
  s.wind_speed,
  s.calculated_at
FROM public.lakes l
JOIN LATERAL (
  SELECT score, temperature, pressure, wind_speed, calculated_at
  FROM public.lake_scores
  WHERE lake_id = l.id
  ORDER BY calculated_at DESC
  LIMIT 1
) s ON true;

-- Seed lakes
INSERT INTO public.lakes (name, county, distance_km) VALUES
  ('Lacul Snagov', 'Ilfov', 35),
  ('Lacul Cernica', 'Ilfov', 18),
  ('Lacul Pantelimon', 'Ilfov', 12),
  ('Lacul Mostiștea', 'Călărași', 55),
  ('Lacul Căldărușani', 'Ilfov', 40),
  ('Balta Comana', 'Giurgiu', 32),
  ('Lacul Buftea', 'Ilfov', 25),
  ('Balta Iezer', 'Călărași', 70);

-- Seed latest scores
INSERT INTO public.lake_scores (lake_id, score, temperature, pressure, wind_speed, calculated_at)
SELECT id,
  CASE name
    WHEN 'Lacul Snagov' THEN 87
    WHEN 'Lacul Cernica' THEN 76
    WHEN 'Lacul Pantelimon' THEN 54
    WHEN 'Lacul Mostiștea' THEN 91
    WHEN 'Lacul Căldărușani' THEN 68
    WHEN 'Balta Comana' THEN 82
    WHEN 'Lacul Buftea' THEN 45
    WHEN 'Balta Iezer' THEN 73
  END,
  CASE name
    WHEN 'Lacul Snagov' THEN 18.4
    WHEN 'Lacul Cernica' THEN 19.1
    WHEN 'Lacul Pantelimon' THEN 20.2
    WHEN 'Lacul Mostiștea' THEN 17.8
    WHEN 'Lacul Căldărușani' THEN 18.9
    WHEN 'Balta Comana' THEN 19.5
    WHEN 'Lacul Buftea' THEN 21.0
    WHEN 'Balta Iezer' THEN 18.2
  END,
  CASE name
    WHEN 'Lacul Snagov' THEN 1015
    WHEN 'Lacul Cernica' THEN 1013
    WHEN 'Lacul Pantelimon' THEN 1011
    WHEN 'Lacul Mostiștea' THEN 1016
    WHEN 'Lacul Căldărușani' THEN 1014
    WHEN 'Balta Comana' THEN 1015
    WHEN 'Lacul Buftea' THEN 1010
    WHEN 'Balta Iezer' THEN 1013
  END,
  CASE name
    WHEN 'Lacul Snagov' THEN 8
    WHEN 'Lacul Cernica' THEN 12
    WHEN 'Lacul Pantelimon' THEN 18
    WHEN 'Lacul Mostiștea' THEN 6
    WHEN 'Lacul Căldărușani' THEN 14
    WHEN 'Balta Comana' THEN 9
    WHEN 'Lacul Buftea' THEN 22
    WHEN 'Balta Iezer' THEN 11
  END,
  now()
FROM public.lakes;
