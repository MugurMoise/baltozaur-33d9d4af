
ALTER TABLE public.lakes ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;

UPDATE public.lakes SET latitude=44.7050, longitude=26.1850 WHERE name='Lacul Snagov';
UPDATE public.lakes SET latitude=44.4283, longitude=26.2833 WHERE name='Lacul Cernica';
UPDATE public.lakes SET latitude=44.4500, longitude=26.2167 WHERE name='Lacul Pantelimon';
UPDATE public.lakes SET latitude=44.4500, longitude=26.7833 WHERE name='Lacul Mostiștea';
UPDATE public.lakes SET latitude=44.6500, longitude=26.2333 WHERE name='Lacul Căldărușani';
UPDATE public.lakes SET latitude=44.1700, longitude=26.1500 WHERE name='Balta Comana';
UPDATE public.lakes SET latitude=44.5667, longitude=25.9500 WHERE name='Lacul Buftea';
UPDATE public.lakes SET latitude=44.2000, longitude=27.3000 WHERE name='Balta Iezer';
