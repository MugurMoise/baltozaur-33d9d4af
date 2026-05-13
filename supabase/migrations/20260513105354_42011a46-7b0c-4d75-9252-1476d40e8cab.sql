
INSERT INTO public.lakes (name, county, distance_km, latitude, longitude) VALUES
('Lacul Herăstrău', 'București', 5, 44.4795, 26.0834),
('Lacul Floreasca', 'București', 6, 44.4667, 26.1000),
('Lacul Tei', 'București', 7, 44.4633, 26.1167),
('Lacul Morii', 'București', 8, 44.4500, 26.0167),
('Balta Dridu', 'Ialomița', 45, 44.6500, 26.4333),
('Lacul Bungetu', 'Dâmbovița', 60, 44.9000, 25.6500),
('Lacul Frasinu', 'Buzău', 110, 45.0833, 26.9833),
('Lacul Amara', 'Ialomița', 130, 44.6000, 27.3167),
('Balta Greaca', 'Giurgiu', 50, 44.1167, 26.3500),
('Lacul Bâlbâcioasa', 'Călărași', 65, 44.3500, 26.6500),
('Lacul Bungetu Mic', 'Prahova', 80, 44.9500, 26.0167),
('Balta Vlăsia', 'Ilfov', 22, 44.6000, 26.0667);

INSERT INTO public.lake_scores (lake_id, score, temperature, pressure, wind_speed, calculated_at)
SELECT 
  l.id,
  round((random()*78 + 20)::numeric, 1),
  round((random()*10 + 15)::numeric, 1),
  round((random()*18 + 1005)::numeric, 1),
  round((random()*22 + 3)::numeric, 1),
  now() + (d || ' days')::interval
FROM public.lakes l
CROSS JOIN generate_series(0,6) d
WHERE l.created_at > now() - interval '1 minute';
