// Open-Meteo: https://open-meteo.com/en/docs
export type TodayWeather = {
  date: string;
  tMax: number | null;
  tMin: number | null;
  precipSum: number | null;     // mm
  windMax: number | null;       // km/h
  humidityAvg: number | null;   // %
};

function avg(nums: number[]) {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round((s / nums.length) * 10) / 10;
}

export async function fetchTodayWeather(
  lat: number,
  lon: number,
  opts?: { timezone?: string }
): Promise<TodayWeather> {
  const timezone = opts?.timezone ?? "auto";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    hourly: "relative_humidity_2m",
    timezone,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const json = await res.json();

  // اليوم حسب المنطقة الزمنية الراجعة من الخدمة
  const today = (json.daily?.time?.[0] ?? new Date().toISOString().slice(0, 10)) as string;

  // daily arrays متوازية بالفهرسة
  const idx = json.daily?.time?.findIndex((d: string) => d === today) ?? 0;

  const tMax = json.daily?.temperature_2m_max?.[idx] ?? null;
  const tMin = json.daily?.temperature_2m_min?.[idx] ?? null;
  const precipSum = json.daily?.precipitation_sum?.[idx] ?? null;
  const windMax = json.daily?.wind_speed_10m_max?.[idx] ?? null;

  // احسب متوسط رطوبة اليوم من السلاسل الساعة
  let humidityAvg: number | null = null;
  if (Array.isArray(json.hourly?.time) && Array.isArray(json.hourly?.relative_humidity_2m)) {
    const hoursToday: number[] = [];
    for (let i = 0; i < json.hourly.time.length; i++) {
      const t: string = json.hourly.time[i]; // "YYYY-MM-DDTHH:00"
      if (t.startsWith(today)) {
        const v = json.hourly.relative_humidity_2m[i];
        if (typeof v === "number") hoursToday.push(v);
      }
    }
    humidityAvg = avg(hoursToday);
  }

  return {
    date: today,
    tMax: tMax ?? null,
    tMin: tMin ?? null,
    precipSum: precipSum ?? null,
    windMax: windMax ?? null,
    humidityAvg,
  };
}
