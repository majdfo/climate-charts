import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, BarChart3, Calendar, Upload } from 'lucide-react'

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
            <div className="rounded-full bg-primary/10 p-6">
              <TrendingUp className="h-16 w-16 text-primary" />
            </div>
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            Seasonal Trend Analysis
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Upload your data, detect seasonal patterns, and compare trends across years
          </p>

          <Button size="lg" onClick={signInWithGoogle} className="gap-2 text-lg px-8 py-6">
            Continue with Google
          </Button>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Upload CSV Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import your time-series data with flexible column mapping
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Detect Seasons</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically identify season start, end, and duration
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">Compare Years</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize trends and identify peak bloom years
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
