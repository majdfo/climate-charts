import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthGate'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { TrendingUp, Calendar } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50">
      {/* العنوان + مقياس اليوم */}
      <div className="flex flex-col items-center p-6">
        <h1 className="text-xl font-bold mb-4">🌸 BloomWatch – Irbid</h1>
        <ForecastGauge />
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* لوحة الطقس/البلوم (اختياري) */}
        <div className="mb-6">
          <WeatherBloomPanel lat={32.55} lon={35.81} />
        </div>

        {/* بطاقات معلومات الحساب */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Login</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.last_login_at
                  ? new Date(userData.last_login_at).toLocaleDateString()
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.created_at
                  ? new Date(userData.created_at).toLocaleDateString()
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* زر الانتقال للـ Trends */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Get Started with Trend Analysis</CardTitle>
            <CardDescription>
              Upload your data and start analyzing seasonal patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/trends">
              <Button className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Go to Trends
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
