-- Create pollen_forecast_daily table
CREATE TABLE IF NOT EXISTS public.pollen_forecast_daily (
  date DATE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  severity TEXT NOT NULL,
  unit TEXT DEFAULT 'index_0_100',
  generated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pfd UNIQUE (date, lat, lon)
);

-- Enable RLS
ALTER TABLE public.pollen_forecast_daily ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "public read daily forecast" 
ON public.pollen_forecast_daily 
FOR SELECT 
USING (true);