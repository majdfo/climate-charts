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

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
      {/* Half circle gauge for today - LEFT SIDE */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-96 h-48 flex items-center justify-center">
          <svg width="380" height="200" viewBox="0 0 380 200" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 50 170 A 140 140 0 0 1 330 170"
              stroke="#e5e7eb"
              strokeWidth="28"
              fill="none"
              strokeLinecap="round"
            />
            {/* Foreground colored arc */}
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
          </svg>
          <div className="absolute top-20 text-center">
            <div className="text-6xl font-bold mb-1" style={{
              color: sev === 'Low' ? '#22c55e' : sev === 'Medium' ? '#facc15' : '#ef4444'
            }}>
              {sev}
            </div>
            {today.score !== undefined && (
              <div className="text-2xl font-semibold text-muted-foreground">
                {Math.round(today.score)}%
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {dayjs(today.date).format('MMM D, YYYY')}
        </div>
      </div>

      {/* Daily forecasts - RIGHT SIDE */}
      <div className="flex-1 w-full space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">7-Day Forecast</h3>
        {forecast.map((f) => {
          const dayColor =
            f.severity === 'Low' ? 'text-green-600' :
            f.severity === 'Medium' ? 'text-yellow-600' :
            'text-red-600'

          return (
            <div
              key={f.date}
              className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border min-w-[500px]"
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
    </div>
  )
}

// import { useEffect, useState } from 'react'
// import { supabase } from '@/integrations/supabase/client'
// import dayjs from 'dayjs'

// type Forecast = {
//   date: string
//   severity: 'Low' | 'Medium' | 'High' | string
//   unit: string
//   lat: number
//   lon: number
// }

// export default function ForecastGauge() {
//   const [forecast, setForecast] = useState<Forecast[]>([])
//   const [loading, setLoading] = useState(true)

//   const { data, error } = await supabase
//   .from('public.pollen_forecast_daily')
//   .select('*')
//   .order('date', { ascending: true })
//   .limit(7)

// console.log('rows:', data?.length, data?.[0], 'error:', error)

//   useEffect(() => {
//     async function loadForecast() {
//       const today = dayjs().format('YYYY-MM-DD')
//       const { data, error } = await supabase
//         .from('pollen_forecast_daily')
//         .select('date, lat, lon, score, severity, unit')
//         .gte('date', today)
//         .order('date', { ascending: true })
//         .limit(7)
      
//       console.log({ error, rows: data?.length, first: data?.[0] })

//       if (error) console.error(error)
//       setForecast(data ?? [])
//       setLoading(false)
//     }
//     loadForecast()
//   }, [])

//   if (loading) return <div>Loading…</div>
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
//             stroke="hsl(var(--muted))"
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
//           <div className="text-sm text-muted-foreground mt-1">{dayjs(today.date).format('MMM D, YYYY')}</div>
//         </div>
//       </div>

//       {/* Next days forecast */}
//       <div className="w-full max-w-md mt-8 space-y-2">
//         <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Next Days</h3>
//         {forecast.slice(1).map((f) => {
//           const dayColor = 
//             f.severity === 'Low' ? 'text-green-600' : 
//             f.severity === 'Medium' ? 'text-yellow-600' : 
//             'text-red-600';
          
//           return (
//             <div
//               key={f.date}
//               className="flex justify-between items-center p-4 bg-card rounded-lg shadow-sm border"
//             >
//               <span className="font-semibold">{dayjs(f.date).format('dddd, MMM D')}</span>
//               <span className={`font-bold ${dayColor}`}>{f.severity}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   )
// }
