import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthGate'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, History as HistoryIcon } from 'lucide-react'
import { WeatherBloomPanel } from '@/components/WeatherBloomPanel'
import ForecastGauge from '@/components/ForecastGauge'

type UserProfile = {
  email: string
  created_at: string
  last_login_at: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('email, created_at, last_login_at')
        .eq('id', user.id)
        .maybeSingle()
      if (!error && data) setUserData(data)
    }
    fetchUserData()
  }, [user])

  return (
    <div className="min-h-screen bg-mint-light">
      {/* العنوان + مقياس اليوم */}
      <div className="flex flex-col items-center p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <span className="text-pink-500">🌸</span>
          <span>FloraSat – Irbid, Jordan</span>
        </h2>
        <ForecastGauge />
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* لوحة الطقس/البلوم (اختياري) */}
        <div className="mb-6">
          <WeatherBloomPanel lat={32.55} lon={35.81} />
        </div>

        {/* Cards for navigation */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>View Historical Trends - Irbid, Jordan</CardTitle>
              <CardDescription>
                Explore pollen season patterns from 2015 to 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/historical-trends">
                <Button className="gap-2">
                  <HistoryIcon className="h-4 w-4" />
                  View Historical Data
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Trend Analysis - Coming Soon</CardTitle>
              <CardDescription>
                Currently, this platform provides data for Irbid, Jordan. We're working on scalability to allow users to upload their own location data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Soon you'll be able to upload CSV files with weather factors and EVI data to get personalized dashboards and historical trends for your location.
              </p>
              <Button className="gap-2" disabled>
                <TrendingUp className="h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
