import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchWeatherData, WeatherData } from '@/services/weather';
import { Cloud, Droplets, Thermometer } from 'lucide-react';

interface WeatherTodayCardProps {
  lat: number;
  lon: number;
  title?: string;
}

export function WeatherTodayCard({ lat, lon, title = "Today's Weather" }: WeatherTodayCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherData(lat, lon);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading weather...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Unable to load weather data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <span className="text-3xl font-bold">{weather.temp}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground capitalize">{weather.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Humidity: {weather.humidity}%</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">Feels like {weather.feels_like}°C</p>
            <p className="text-sm text-muted-foreground">H: {weather.temp_max}° L: {weather.temp_min}°</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
