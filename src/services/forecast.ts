import { supabase } from '@/integrations/supabase/client';

export type ForecastRow = {
  date: string;
  lat: number;
  lon: number;
  index_0_100: number | null;
  severity: string | null;
};

export async function fetchNext7Days(lat: number, lon: number) {
  const today = new Date();
  const end = new Date(Date.now() + 7 * 864e5);
  const from = today.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('pollen_forecast_daily')
    .select('date, lat, lon, index_0_100, severity')
    .eq('lat', lat)
    .eq('lon', lon)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ForecastRow[];
}

