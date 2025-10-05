import { useEffect, useState, useMemo } from 'react'
import Papa from 'papaparse'
import dayjs from 'dayjs'

type Forecast = {
  date: string
  severity: 'Low' | 'Medium' | 'High' | string
  unit?: string
  lat?: number
  lon?: number
  score?: number | string
}

const severityToPct = (sev: string) =>
  sev === 'Low' ? 25 : sev === 'Medium' ? 55 : sev === 'High' ? 85 : 100

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))

export default function ForecastGauge() {
  const [rows, setRows] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use Vite base in case the app runs under a sub-path
    const csvUrl = `${import.meta.env.BASE_URL}pollen_forecast_daily_rows.csv`

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (res) => {
        const data = (res.data as Forecast[])
          .map(r => ({
            ...r,
            score:
              r.score !== undefined && r.score !== null && r.score !== ''
                ? Number(r.score)
                : undefined,
          }))
          .filter(r => !!r.date)
          .sort((a, b) => (a.date! < b.date! ? -1 : 1))

        const today = dayjs().format('YYYY-MM-DD')
        const future = data.filter(r => r.date >= today)

        setRows(future.length ? future : data)
        setLoading(false)
      },
      error: (err) => {
        console.error('CSV parse error', err)
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="p-4">Loading…</div>
  if (!rows.length) return <div className="p-4">No data available.</div>

  const today = rows[0]
  const severity = today.severity
  const pctRaw = today.score != null ? Number(today.score) : severityToPct(severity)
  const pct = clamp(pctRaw)

  // Gauge geometry (bigger, left-aligned)
  const R = 140
  const W = 2 * R + 80
  const H = R + 80
  const cxLeft = 40
  const yBase = R + 40
  const x1 = cxLeft
  const x2 = cxLeft + 2 * R
  const halfCirc = Math.PI * R
  const arcPath = `M ${x1} ${yBase} A ${R} ${R} 0 0 1 ${x2} ${yBase}`

  const sevColor = useMemo(() => {
    if (severity === 'Low') return '#22c55e'
    if (severity === 'Medium') return '#f59e0b'
    if (severity === 'High') return '#ef4444'
    return '#ef4444'
  }, [severity])

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: Big half-circle gauge */}
        <div className="flex justify-start">
          <div className="relative" style={{ width: W, height: H }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
              <path d={arcPath} stroke="#e5e7eb" strokeWidth="26" fill="none" strokeLinecap="round" />
              <path
                d={arcPath}
                stroke="url(#grad)"
                strokeWidth="26"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * halfCirc}, ${halfCirc}`}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute left-0 right-0 -top-2 flex flex-col items-center pointer-events-none">
              <div className="text-6xl font-extrabold leading-none" style={{ color: sevColor }}>
                {severity}
              </div>
              <div className="mt-1 text-2xl font-bold text-zinc-800">{Math.round(pct)}%</div>
              <div className="text-sm text-zinc-500">{dayjs(today.date).format('MMM D, YYYY')}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Next days list */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Next Days</h3>
          <div className="space-y-3">
            {rows.slice(1).map(d => {
              const dpct = clamp(d.score != null ? Number(d.score) : severityToPct(d.severity))
              const color =
                d.severity === 'Low' ? 'text-green-600' :
                d.severity === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              return (
                <div key={d.date} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border">
                  <div className="font-medium">{dayjs(d.date).format('dddd, MMM D')}</div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${color}`}>{d.severity}</span>
                    <span className="text-zinc-700 font-bold">{Math.round(dpct)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
