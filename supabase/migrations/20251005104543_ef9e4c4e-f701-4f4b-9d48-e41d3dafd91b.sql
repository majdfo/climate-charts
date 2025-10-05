-- Create pollen forecast table for 7-day predictions
CREATE TABLE IF NOT EXISTS public.pollen_forecast (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  lat NUMERIC(7,4) NOT NULL,
  lon NUMERIC(7,4) NOT NULL,
  score NUMERIC NOT NULL,              -- من 0 إلى 100
  severity TEXT NOT NULL,              -- Low / Medium / High
  unit TEXT DEFAULT 'index_0_100',
  generated_at TIMESTAMPTZ,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (date, lat, lon)
);

-- Enable RLS on pollen forecast table
ALTER TABLE public.pollen_forecast ENABLE ROW LEVEL SECURITY;

-- Allow public read access (frontend needs to read)
CREATE POLICY "public read forecast"
  ON public.pollen_forecast
  FOR SELECT
  USING (true);