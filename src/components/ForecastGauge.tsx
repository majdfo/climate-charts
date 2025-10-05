import { useEffect, useState, useMemo } from 'react'
import Papa from 'papaparse'
import dayjs from 'dayjs'

type Forecast = {
  date: string
  severity: 'Low' | 'Medium' | 'High' | string
  unit?: string
  lat?: number
  lon?: number
  score?: number | string // CSV may parse numbers as strings
}

const severityToPct = (sev: string) =>
  sev === 'Low' ? 25 : sev === 'Medium' ? 55 : sev === 'High' ? 85 : 100

export default function ForecastGauge() {
  const [rows, setRows] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Papa.parse('/pollen_forecast_daily_rows.csv', {
      download: true,
      header: true,
      complete: (res) => {
        const data = (res.data as Forecast[])
          .map(r => ({
            ...r,
            // coerce score to number if present
            score: r.score !== undefined && r.score !== null && r.score !== '' ? Number(r.score) : undefined,
          }))
          .filter(r => !!r.date)
          .sort((a, b) => (a.date! < b.date! ? -1 : 1))
        // keep today and forward
        const today = dayjs().format('YYYY-MM-DD')
        const future = data.filter(r => r.date >= today)
        setRows(future.length ? future : data) // fallback to all if no future rows
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
  const pct = Math.max(0, Math.min(100, today.score ?? severityToPct(today.severity)))
  const severity = today.severity

  // Gauge geometry (bigger)
  const R = 140                       // radius
  const W = 2 * R + 80                // svg width with margins
  const H = R + 80                    // svg height with bottom margin
  const cxLeft = 40                   // left margin
  const yBase = R + 40
  const x1 = cxLeft
  const x2 = cxLeft + 2 * R
  const halfCirc = Math.PI * R        // used for strokeDasharray

  const arcPath = `M ${x1} ${yBase} A ${R} ${R} 0 0 1 ${x2} ${yBase}`

  const sevColor = useMemo(() => {
    if (severity === 'Low') return '#22c55e'
    if (severity === 'Medium') return '#f59e0b'
    if (severity === 'High') return '#ef4444'
    return '#ef4444'
  }, [severity])

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: Big half-circle gauge */}
        <div className="flex justify-start">
          <div className="relative" style={{ width: W, height: H }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
              {/* background arc */}
              <path
                d={arcPath}
                stroke="#e5e7eb"
                strokeWidth="26"
                fill="none"
                strokeLinecap="round"
              />
              {/* foreground arc filled by percent */}
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

            {/* labels inside/under gauge */}
            <div className="absolute left-0 right-0 -top-2 flex flex-col items-center pointer-events-none">
              <div
                className="text-6xl font-extrabold leading-none"
                style={{ color: sevColor }}
              >
                {severity}
              </div>
              <div className="mt-1 text-2xl font-bold text-zinc-800">
                {Math.round(pct)}%
              </div>
              <div className="text-sm text-zinc-500">
                {dayjs(today.date).format('MMM D, YYYY')}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Next days list */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Next Days</h3>
          <div className="space-y-3">
            {rows.slice(1).map(d => {
              const dpct = Math.max(0, Math.min(100, d.score ?? severityToPct(d.severity)))
              const color =
                d.severity === 'Low' ? 'text-green-600' :
                d.severity === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              return (
                <div
                  key={d.date}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border"
                >
                  <div className="font-medium">
                    {dayjs(d.date).format('dddd, MMM D')}
                  </div>
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

// import { useEffect, useState } from 'react'
// import Papa from 'papaparse'
// import dayjs from 'dayjs'

// type Forecast = {
//   date: string
//   severity: 'Low' | 'Medium' | 'High' | string
//   unit: string
//   lat: number
//   lon: number
//   score?: number
// }

// export default function ForecastGauge() {
//   const [forecast, setForecast] = useState<Forecast[]>([])
//   const [loading, setLoading] = useState(true)
//   const [errMsg, setErrMsg] = useState<string | null>(null)

//   useEffect(() => {
//     (async () => {
//       try {
//         const response = await fetch('/pollen_forecast_daily_rows.csv')
//         const csvText = await response.text()
        
//         Papa.parse(csvText, {
//           header: true,
//           dynamicTyping: true,
//           complete: (results) => {
//             const data = results.data as Forecast[]
//             const validData = data.filter(row => row.date && row.severity)
//             setForecast(validData)
//             setLoading(false)
//           },
//           error: (error) => {
//             setErrMsg(error.message)
//             setLoading(false)
//           }
//         })
//       } catch (e: any) {
//         setErrMsg(e?.message || 'Unknown error')
//         setLoading(false)
//       }
//     })()
//   }, [])

//   if (loading) return <div>Loading…</div>
//   if (errMsg) return <div className="p-3 text-red-600">Error: {errMsg}</div>
//   if (!forecast.length) return <div>No data for today.</div>

//   const today = forecast[0]
//   const sev = today.severity
//   const sevVal =
//     sev === 'Low' ? 2 :
//     sev === 'Medium' ? 5 :
//     sev === 'High' ? 8 : 10

//   return (
//     <div className="flex flex-col items-center">
//       {/* Half circle gauge for today */}
//       <div className="relative w-72 h-40 flex items-end justify-center">
//         <svg width="280" height="160" viewBox="0 0 280 160" className="overflow-visible">
//           {/* Background arc */}
//           <path
//             d="M 40 140 A 100 100 0 0 1 240 140"
//             stroke="#e5e7eb"            // use a fixed color instead of var(--muted) for reliability
//             strokeWidth="20"
//             fill="none"
//             strokeLinecap="round"
//           />
//           {/* Foreground colored arc */}
//           <path
//             d="M 40 140 A 100 100 0 0 1 240 140"
//             stroke="url(#pollenGradient)"
//             strokeWidth="20"
//             fill="none"
//             strokeDasharray={`${(sevVal / 10) * 314}, 314`}
//             strokeLinecap="round"
//           />
//           <defs>
//             <linearGradient id="pollenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//               <stop offset="0%" stopColor="#22c55e" />
//               <stop offset="50%" stopColor="#facc15" />
//               <stop offset="100%" stopColor="#ef4444" />
//             </linearGradient>
//           </defs>
//         </svg>
//         <div className="absolute bottom-8 text-center">
//           <div className="text-5xl font-bold" style={{
//             color: sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'
//           }}>
//             {sev}
//           </div>
//           <div className="text-sm text-muted-foreground mt-1">
//             {dayjs(today.date).format('MMM D, YYYY')}
//           </div>
//         </div>
//       </div>

//       {/* Next days forecast */}
//       <div className="w-full max-w-md mt-8 space-y-2">
//         <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Next Days</h3>
//         {forecast.slice(1).map((f) => {
//           const dayColor =
//             f.severity === 'Low' ? 'text-green-600' :
//             f.severity === 'Medium' ? 'text-yellow-600' :
//             'text-red-600'

//           return (
//             <div
//               key={f.date}
//               className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border"
//             >
//               <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
//               <span className={`font-bold ${dayColor}`}>{f.severity}</span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // import { useEffect, useState } from 'react'
// // import { supabase } from '@/integrations/supabase/client'
// // import dayjs from 'dayjs'

// // type Forecast = {
// //   date: string
// //   severity: 'Low' | 'Medium' | 'High' | string
// //   unit: string
// //   lat: number
// //   lon: number
// // }

// // export default function ForecastGauge() {
// //   const [forecast, setForecast] = useState<Forecast[]>([])
// //   const [loading, setLoading] = useState(true)

// //   const { data, error } = await supabase
// //   .from('public.pollen_forecast_daily')
// //   .select('*')
// //   .order('date', { ascending: true })
// //   .limit(7)

// // console.log('rows:', data?.length, data?.[0], 'error:', error)

// //   useEffect(() => {
// //     async function loadForecast() {
// //       const today = dayjs().format('YYYY-MM-DD')
// //       const { data, error } = await supabase
// //         .from('pollen_forecast_daily')
// //         .select('date, lat, lon, score, severity, unit')
// //         .gte('date', today)
// //         .order('date', { ascending: true })
// //         .limit(7)
      
// //       console.log({ error, rows: data?.length, first: data?.[0] })

// //       if (error) console.error(error)
// //       setForecast(data ?? [])
// //       setLoading(false)
// //     }
// //     loadForecast()
// //   }, [])

// //   if (loading) return <div>Loading…</div>
// //   if (!forecast.length) return <div>No data for today.</div>

// //   const today = forecast[0]
// //   const sev = today.severity
// //   const sevVal =
// //     sev === 'Low' ? 2 :
// //     sev === 'Medium' ? 5 :
// //     sev === 'High' ? 8 : 10

// //   return (
// //     <div className="flex flex-col items-center">
// //       {/* Half circle gauge for today */}
// //       <div className="relative w-72 h-40 flex items-end justify-center">
// //         <svg width="280" height="160" viewBox="0 0 280 160" className="overflow-visible">
// //           {/* Background arc */}
// //           <path
// //             d="M 40 140 A 100 100 0 0 1 240 140"
// //             stroke="hsl(var(--muted))"
// //             strokeWidth="20"
// //             fill="none"
// //             strokeLinecap="round"
// //           />
// //           {/* Foreground colored arc */}
// //           <path
// //             d="M 40 140 A 100 100 0 0 1 240 140"
// //             stroke="url(#pollenGradient)"
// //             strokeWidth="20"
// //             fill="none"
// //             strokeDasharray={`${(sevVal / 10) * 314}, 314`}
// //             strokeLinecap="round"
// //           />
// //           <defs>
// //             <linearGradient id="pollenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
// //               <stop offset="0%" stopColor="#22c55e" />
// //               <stop offset="50%" stopColor="#facc15" />
// //               <stop offset="100%" stopColor="#ef4444" />
// //             </linearGradient>
// //           </defs>
// //         </svg>
// //         <div className="absolute bottom-8 text-center">
// //           <div className="text-5xl font-bold" style={{
// //             color: sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'
// //           }}>
// //             {sev}
// //           </div>
// //           <div className="text-sm text-muted-foreground mt-1">{dayjs(today.date).format('MMM D, YYYY')}</div>
// //         </div>
// //       </div>

// //       {/* Next days forecast */}
// //       <div className="w-full max-w-md mt-8 space-y-2">
// //         <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Next Days</h3>
// //         {forecast.slice(1).map((f) => {
// //           const dayColor = 
// //             f.severity === 'Low' ? 'text-green-600' : 
// //             f.severity === 'Medium' ? 'text-yellow-600' : 
// //             'text-red-600';
          
// //           return (
// //             <div
// //               key={f.date}
// //               className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border"
// //             >
// //               <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
// //               <span className={`font-bold ${dayColor}`}>{f.severity}</span>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   )
// // }
