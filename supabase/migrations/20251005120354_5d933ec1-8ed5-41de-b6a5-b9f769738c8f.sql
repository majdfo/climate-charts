-- Drop existing unique constraint and modify columns
ALTER TABLE public.pollen_forecast 
  DROP CONSTRAINT IF EXISTS pollen_forecast_date_lat_lon_key;

-- Change lat/lon to double precision
ALTER TABLE public.pollen_forecast 
  ALTER COLUMN lat TYPE double precision,
  ALTER COLUMN lon TYPE double precision,
  ALTER COLUMN score TYPE double precision;

-- Rename created_at to inserted_at
ALTER TABLE public.pollen_forecast 
  RENAME COLUMN created_at TO inserted_at;

-- Add updated_at column
ALTER TABLE public.pollen_forecast 
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create unique index for upsert on (date, lat, lon)
CREATE UNIQUE INDEX IF NOT EXISTS uq_pollen_forecast_date_lat_lon
  ON public.pollen_forecast (date, lat, lon);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_pollen_forecast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pollen_forecast_updated_at
  BEFORE UPDATE ON public.pollen_forecast
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pollen_forecast_updated_at();