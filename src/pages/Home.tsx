import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Flower2, CloudSun, TrendingUp } from 'lucide-react'

export default function Home() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-pink-100 p-6">
              <Flower2 className="h-16 w-16 text-pink-400" />
            </div>
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            FloraSat
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Track pollen forecasts, weather conditions, and bloom trends for Irbid, Jordan
          </p>

          <Button size="lg" onClick={signInWithGoogle} className="gap-2 text-lg px-8 py-6">
            Continue with Google
          </Button>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <Flower2 className="h-10 w-10 text-pink-400" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Pollen Forecasts</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time pollen level predictions powered by NASA Earth Data
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <CloudSun className="h-10 w-10 text-pink-400" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Weather Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Current weather conditions and forecasts for Irbid, Jordan
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <TrendingUp className="h-10 w-10 text-pink-400" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Historical Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze bloom patterns and seasonal trends from 2015-2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
