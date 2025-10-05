import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import dayjs from 'dayjs'

type Forecast = {
  date: string
  severity: 'Low' | 'Medium' | 'High' | string
  unit: string
  lat: number
  lon: number
}

export default function ForecastGauge() {
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForecast() {
      const today = dayjs().format('YYYY-MM-DD')
      const { data, error } = await supabase
        .from('pollen_forecast_daily')
        .select('date, lat, lon, score, severity, unit')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(7)
      
      console.log({ error, rows: data?.length, first: data?.[0] })

      if (error) console.error(error)
      setForecast(data ?? [])
      setLoading(false)
    }
    loadForecast()
  }, [])

  if (loading) return <div>Loading…</div>
  if (!forecast.length) return <div>No data for today.</div>

  const today = forecast[0]
  const sev = today.severity
  const sevVal =
    sev === 'Low' ? 2 :
    sev === 'Medium' ? 5 :
    sev === 'High' ? 8 : 10

  return (
    <div className="flex flex-col items-center">
      {/* Half circle gauge for today */}
      <div className="relative w-72 h-40 flex items-end justify-center">
        <svg width="280" height="160" viewBox="0 0 280 160" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 40 140 A 100 100 0 0 1 240 140"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />
          {/* Foreground colored arc */}
          <path
            d="M 40 140 A 100 100 0 0 1 240 140"
            stroke="url(#pollenGradient)"
            strokeWidth="20"
            fill="none"
            strokeDasharray={`${(sevVal / 10) * 314}, 314`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="pollenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute bottom-8 text-center">
          <div className="text-5xl font-bold" style={{
            color: sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'
          }}>
            {sev}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{dayjs(today.date).format('MMM D, YYYY')}</div>
        </div>
      </div>

      {/* Next days forecast */}
      <div className="w-full max-w-md mt-8 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Next Days</h3>
        {forecast.slice(1).map((f) => {
          const dayColor = 
            f.severity === 'Low' ? 'text-green-600' : 
            f.severity === 'Medium' ? 'text-yellow-600' : 
            'text-red-600';
          
          return (
            <div
              key={f.date}
              className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border"
            >
              <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
              <span className={`font-bold ${dayColor}`}>{f.severity}</span>
            </div>
          );
        })}
      </div>
    </div>
  )
}
