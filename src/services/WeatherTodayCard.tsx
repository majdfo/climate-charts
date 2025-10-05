import { useQuery } from "@tanstack/react-query";
import { fetchTodayWeather } from "@/services/weather";

export function WeatherTodayCard({ lat, lon, title = "Today's Weather" }:{
  lat: number;
  lon: number;
  title?: string;
}) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["weather-today", lat, lon],
    queryFn: () => fetchTodayWeather(lat, lon, { timezone: "auto" }),
    staleTime: 1000 * 60 * 15, // 15 دقيقة
  });

  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => refetch()}
          className="text-sm underline opacity-80 hover:opacity-100"
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading && <div className="opacity-70">Loading weather…</div>}
      {isError && (
        <div className="text-red-500 text-sm">
          Failed to load weather: {(error as Error)?.message}
        </div>
      )}

      {data && !isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Stat label="Max Temp" value={fmtNum(data.tMax, "°C")} />
          <Stat label="Min Temp" value={fmtNum(data.tMin, "°C")} />
          <Stat label="Precipitation" value={fmtNum(data.precipSum, "mm")} />
          <Stat label="Wind Max" value={fmtNum(data.windMax, "km/h")} />
          <Stat label="Avg Humidity" value={fmtNum(data.humidityAvg, "%")} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }:{ label:string; value:string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs uppercase opacity-70">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function fmtNum(n: number | null, suffix = "") {
  if (n === null || Number.isNaN(n)) return "N/A";
  return `${Math.round(n * 10) / 10}${suffix}`;
}
