import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })

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
      {/* مقياس اليوم */}
      <div className="relative w-60 h-60 flex items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" stroke="#e5e7eb" strokeWidth="15" fill="none" />
          <path
            d="M120,120 m0,-100 a100,100 0 1,1 0.1,0"
            stroke="url(#pollenGradient)"
            strokeWidth="15"
            fill="none"
            strokeDasharray={`${(sevVal / 10) * 628}, 628`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="pollenGradient">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold text-green-800">{sev}</div>
          <div className="text-sm text-gray-600">{today.date}</div>
        </div>
      </div>

      {/* الأيام القادمة */}
      <div className="w-full max-w-sm mt-6">
        {forecast.map((f) => (
          <div
            key={f.date}
            className="flex justify-between items-center p-3 mb-2 bg-white rounded-2xl shadow-sm"
          >
            <span className="font-semibold">{dayjs(f.date).format('dddd')}</span>
            <span className="text-green-700">{f.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
