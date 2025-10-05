import { Link, NavLink } from "react-router-dom";
import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="font-semibold tracking-wide">
          <span className="text-primary">🌱 TrendView</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/trends"
            className={({ isActive }) =>
              isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            }
          >
            Trends
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* أي أزرار إضافية تحبيها */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
