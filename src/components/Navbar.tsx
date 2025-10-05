import { useAuth } from "@/auth/AuthGate";
import { motion } from "framer-motion";
import { UserMenu } from "@/components/UserMenu";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="w-full bg-gradient-to-r from-green-100 to-emerald-200 shadow-md px-6 py-3 flex justify-between items-center backdrop-blur-md">
      {/* Logo */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-2xl">🌸</span>
        <h1 className="text-xl md:text-2xl font-bold text-green-700 tracking-tight">
          BloomWatch
        </h1>
      </motion.div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Weather Info (optional small teaser) */}
        <motion.div
          className="hidden md:flex flex-col text-sm text-green-800 font-medium"
          whileHover={{ scale: 1.05 }}
        >
          <span className="leading-none">Tracking pollen & bloom trends</span>
          <span className="text-xs text-green-600 italic">
            Powered by NASA Earth Data
          </span>
        </motion.div>

        {/* User circle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer rounded-full bg-white border-2 border-green-400 w-10 h-10 flex items-center justify-center shadow-sm hover:shadow-lg"
        >
          <UserMenu />
          {!user?.email && (
            <span className="text-green-700 font-bold">?</span>
          )}
        </motion.div>
      </div>
    </nav>
  );
}
