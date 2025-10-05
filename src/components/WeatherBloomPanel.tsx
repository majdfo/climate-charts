import { useQuery } from "@tanstack/react-query";
import { fetchTodayWeather } from "@/services/weather";
import { Card } from "@/components/ui/card";

function moodFromWeather(tMax: number | null, precip: number | null, wind: number | null) {
  if (precip && precip > 5) return { label: "Rainy", emoji: "🌧️" };
  if (wind && wind > 40) return { label: "Windy", emoji: "💨" };
  if (tMax && tMax >= 30) return { label: "Hot", emoji: "☀️" };
  return { label: "Mild", emoji: "🌤️" };
}

// ✨ حركة على الخانات
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="
        rounded-xl border bg-white/70 backdrop-blur p-4
        transform-gpu transition-all duration-300
        hover:scale-[1.03] hover:shadow-lg hover:bg-white
        will-change-transform
      "
    >
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub ? <div className="text-xs text-muted-foreground mt-0.5">{sub}</div> : null}
    </div>
  );
}

export function WeatherBloomPanel({ lat, lon }: { lat: number; lon: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["bloom-weather", lat, lon],
    queryFn: () => fetchTodayWeather(lat, lon, "auto"),
    staleTime: 15 * 60 * 1000,
  });

  const mood = data ? moodFromWeather(data.tMax, data.precipSum, data.windMax) : null;

  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <div
        className="
          group rounded-2xl p-6 md:p-8 border
          bg-gradient-to-br from-[#e0f7fa] via-[#e8f5e9] to-[#f1f8e9]
          transform-gpu transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
        "
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* ✨ نبضة خفيفة على الإيموجي عند المرور */}
            <div className="text-3xl md:text-4xl transition-transform duration-300 group-hover:scale-110">
              {mood?.emoji}
            </div>
            <div className="text-lg md:text-xl font-semibold">
              {mood?.label ?? "…"} day · {data?.date ?? ""}
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="text-xs underline opacity-80 hover:opacity-100"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isLoading && <div className="opacity-70">Loading weather…</div>}
        {isError && <div className="text-red-500 text-sm">Failed: {(error as Error)?.message}</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat label="Max Temp" value={`${fmt(data.tMax)}°C`} sub="Warmth for blooming" />
              <Stat label="Min Temp" value={`${fmt(data.tMin)}°C`} sub="Night conditions" />
              <Stat label="Precip" value={`${fmt(data.precipSum)}mm`} sub="Moisture" />
              <Stat label="Wind Max" value={`${fmt(data.windMax)}km/h`} sub="Dispersion" />
              <Stat label="Avg Humidity" value={`${fmt(data.humidityAvg)}%`} sub="Comfort index" />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Data: Open-Meteo • Styled for FloraSat phenology insights
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

function fmt(n: number | null) {
  if (n === null || Number.isNaN(n)) return "N/A";
  return Math.round(n * 10) / 10;
}

export default WeatherBloomPanel;
