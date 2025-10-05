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

export default function ForecastGauge() {
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

  // —— Gauge geometry (matches your SVG path) ——
  const cx = 190   // center x of the semicircle
  const cy = 170   // center y of the semicircle
  const R  = 140   // radius (must match the arc)
  const pct = Math.max(0, Math.min(100, Math.round(today.score ?? 0)))

  // Map 0..100% -> 180..0 degrees (left end -> right end)
  const angleDeg = 180 - (pct / 100) * 180
  const angleRad = (angleDeg * Math.PI) / 180
  const markerX = cx + R * Math.cos(angleRad)
  const markerY = cy - R * Math.sin(angleRad)

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* LEFT: Title + Gauge */}
      <div className="flex flex-col items-start">
        {/* العنوانين نفس الحجم */}
        <h2 className="text-2xl font-semibold flex items-center gap-3 mb-2">
          <span>Today&apos;s Forecast</span>
          <span>Allergy Severity Meter</span>
        </h2>

        {/* Half circle gauge */}
        <div className="relative w-96 h-48">
          <svg width="380" height="200" viewBox="0 0 380 200" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 50 170 A 140 140 0 0 1 330 170"
              stroke="#e5e7eb"
              strokeWidth="28"
              fill="none"
              strokeLinecap="round"
            />
            {/* Foreground colored arc (severity fill length) */}
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

            {/* Marker at the end of the current PERCENTAGE (today.score) */}
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

          {/* Severity word in center (Medium/High/Low) */}
          <div className="absolute left-1/2 top-[88px] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div
              className="text-4xl font-bold mb-1"
              style={{
                color: sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'
              }}
            >
              {sev}
            </div>
          </div>
        </div>

        {/* Date under gauge */}
        <div className="text-sm text-muted-foreground mt-2">
          {dayjs(today.date).format('MMM D, YYYY')}
        </div>
      </div>

      {/* RIGHT: Daily forecasts */}
      <div className="flex-1 w-full space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-1 px-1">7-Day Forecast</h3>

        {/* عنوان Pollen Emission Percentage مرة واحدة فقط فوق الكروت */}
        <div className="flex justify-end">
          <span className="text-[11px] leading-none tracking-wide uppercase opacity-70">
            Pollen Emission Percentage
          </span>
        </div>

        {forecast.map((f) => {
          const dayColor =
            f.severity === 'Low' ? 'text-green-600' :
            f.severity === 'Medium' ? 'text-yellow-600' :
            'text-red-600'

          return (
            <div
              key={f.date}
              className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border min-w-[320px]"
            >
              <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
              <div className="flex items-center gap-4">
                {/* بس الرقم ٪ بدون لابل داخل الكارد */}
                {f.score !== undefined && (
                  <span className="text-sm text-muted-foreground">{Math.round(f.score)}%</span>
                )}
                <span className={`font-bold ${dayColor}`}>{f.severity}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
