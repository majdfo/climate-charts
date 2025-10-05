import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthGate';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, User } from 'lucide-react';
import { WeatherTodayCard } from '@/components/WeatherTodayCard';

interface UserProfile {
  email: string;
  created_at: string;
  last_login_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, created_at, last_login_at')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) setUserData(data);
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to TrendView</p>
      </div>

      {/* user info cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.email}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData?.last_login_at ? new Date(userData.last_login_at).toLocaleDateString() : 'N/A'}
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
              {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* weather today card */}
      <div className="mt-6">
        {/* إحداثيات إربد (بتقدري تبدّليها لاحقًا من بروفايل المستخدم) */}
        <WeatherTodayCard lat={32.55} lon={35.81} title="Today's Weather (Irbid)" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Get Started with Trend Analysis</CardTitle>
          <CardDescription>Upload your data and start analyzing seasonal patterns</CardDescription>
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
  );
}
