export type TodayWeather = {
  date: string;
  tMax: number | null;
  tMin: number | null;
  precipSum: number | null;   // mm
  windMax: number | null;     // km/h
  humidityAvg: number | null; // %
};

const avg = (arr: number[]) =>
  arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

export async function fetchTodayWeather(
  lat: number,
  lon: number,
  timezone: string = "auto"
): Promise<TodayWeather> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    hourly: "relative_humidity_2m",
    timezone,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const json = await res.json();

  const today: string = json.daily?.time?.[0] ?? new Date().toISOString().slice(0, 10);
  const i = json.daily?.time?.findIndex((d: string) => d === today) ?? 0;

  const tMax = json.daily?.temperature_2m_max?.[i] ?? null;
  const tMin = json.daily?.temperature_2m_min?.[i] ?? null;
  const precipSum = json.daily?.precipitation_sum?.[i] ?? null;
  const windMax = json.daily?.wind_speed_10m_max?.[i] ?? null;

  let humidityAvg: number | null = null;
  if (Array.isArray(json.hourly?.time) && Array.isArray(json.hourly?.relative_humidity_2m)) {
    const hours: number[] = [];
    for (let k = 0; k < json.hourly.time.length; k++) {
      const t: string = json.hourly.time[k]; // "YYYY-MM-DDTHH:00"
      if (t.startsWith(today)) {
        const v = json.hourly.relative_humidity_2m[k];
        if (typeof v === "number") hours.push(v);
      }
    }
    humidityAvg = avg(hours);
  }

  return { date: today, tMax, tMin, precipSum, windMax, humidityAvg };
}
