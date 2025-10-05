import { useQuery } from "@tanstack/react-query";
import { fetchTodayWeather } from "@/services/weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeatherTodayCard({
  lat,
  lon,
  title = "Today's Weather",
}: {
  lat: number;
  lon: number;
  title?: string;
}) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["weather-today", lat, lon],
    queryFn: () => fetchTodayWeather(lat, lon, "auto"),
    staleTime: 15 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <button
          onClick={() => refetch()}
          className="text-xs underline opacity-80 hover:opacity-100"
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="opacity-70">Loading weather…</div>}
        {isError && (
          <div className="text-sm text-red-500">Failed: {(error as Error)?.message}</div>
        )}
        {data && !isLoading && !isError && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Max Temp" value={fmt(data.tMax, "°C")} />
            <Stat label="Min Temp" value={fmt(data.tMin, "°C")} />
            <Stat label="Precip" value={fmt(data.precipSum, "mm")} />
            <Stat label="Wind Max" value={fmt(data.windMax, "km/h")} />
            <Stat label="Avg Humidity" value={fmt(data.humidityAvg, "%")} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[11px] uppercase opacity-70">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function fmt(n: number | null, s = "") {
  if (n === null || Number.isNaN(n)) return "N/A";
  return `${Math.round(n * 10) / 10}${s}`;
}
