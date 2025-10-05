import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import dayjs from 'dayjs'

type Forecast = {
  date: string
  severity: 'Low' | 'Medium' | 'High' | string
  unit: string
  lat: number
  lon: number
  score?: number
}

export default function PollenDashboard() {
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/pollen_forecast_daily_rows.csv')
        const csvText = await response.text()
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data as Forecast[]
            const validData = data.filter(row => row.date && row.severity)
            setForecast(validData)
            setLoading(false)
          },
          error: (error) => {
            setErrMsg(error.message)
            setLoading(false)
          }
        })
      } catch (e: any) {
        setErrMsg(e?.message || 'Unknown error')
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div>Loading…</div>
  if (errMsg) return <div className="p-3 text-red-600">Error: {errMsg}</div>
  if (!forecast.length) return <div>No data for today.</div>

  const today = forecast[0]
  const sev = today.severity
  const sevVal =
    sev === 'Low' ? 2 :
    sev === 'Medium' ? 5 :
    sev === 'High' ? 8 : 10

  const cx = 190, cy = 170, R = 140
  const pct = Math.max(0, Math.min(100, Math.round(today.score ?? 0)))

  const angleDeg = 180 - (pct / 100) * 180
  const angleRad = (angleDeg * Math.PI) / 180

  const markerR = R - 6
  const markerX = cx + markerR * Math.cos(angleRad)
  const markerY = cy - markerR * Math.sin(angleRad) + 4

  const sevColor = sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      {/* العنوان الكبير فوق */}
      <h1 className="text-5xl font-extrabold text-center mb-6">
        🌸 FloraSat – Irbid, Jordan
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Today gauge */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-3 mb-3 justify-center lg:justify-start">
            <span>Today&apos;s Forecast</span>
            <span>Allergy Severity Meter</span>
          </h2>

          {/* Gauge */}
          <div className="relative w-96 h-48 mx-auto lg:mx-0">
            <svg width="380" height="200" viewBox="0 0 380 200" className="overflow-visible">
              {/* Background arc */}
              <path
                d="M 50 170 A 140 140 0 0 1 330 170"
                stroke="#e5e7eb"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
              />
              {/* Foreground arc */}
              <path
                d="M 50 170 A 140 140 0 0 1 330 170"
                stroke="url(#pollenGradient)"
                strokeWidth="28"
                fill="none"
                strokeDasharray={`${(sevVal / 10) * 440}, 440`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="pollenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Marker */}
              <g>
                <circle cx={markerX} cy={markerY} r="16" className="fill-white drop-shadow" />
                <text
                  x={markerX}
                  y={markerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-800 text-[10px] font-semibold"
                >
                  {`${pct}%`}
                </text>
              </g>
            </svg>

            {/* Severity word */}
            <div className="absolute left-1/2 top-[88px] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-4xl font-extrabold mb-1" style={{ color: sevColor }}>
                {sev}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: List */}
        <section className="w-full">
          {/* العنوانين على طرفين */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] leading-none tracking-wide uppercase opacity-70">
              7-Day Forecast
            </span>
            <span className="text-[11px] leading-none tracking-wide uppercase opacity-70">
              Pollen Emission Percentage
            </span>
          </div>

          <div className="space-y-2">
            {forecast.map((f) => {
              const dayColor =
                f.severity === 'Low' ? 'text-green-600' :
                f.severity === 'Medium' ? 'text-yellow-600' :
                'text-red-600'

              return (
                <div
                  key={f.date}
                  className="flex justify-between items-center p-4 bg-card rounded-lg border min-w-[320px] transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
                  <div className="flex items-center gap-4">
                    {f.score !== undefined && (
                      <span className="text-sm text-muted-foreground">{Math.round(f.score)}%</span>
                    )}
                    <span className={`font-bold ${dayColor}`}>{f.severity}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
