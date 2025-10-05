import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthGate';
import { Button } from '@/components/ui/button';
import { TrendingUp, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span>TrendView</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/trends">
              <Button variant="ghost">Trends</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
