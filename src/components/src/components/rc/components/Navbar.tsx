import { UserMenu } from "@/components/UserMenu";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
      <h1 className="text-lg font-semibold text-sky-700">TrendView</h1>
      <div className="flex items-center gap-4">
        {/* باقي الروابط مثل Dashboard / Trends */}
        <UserMenu />
      </div>
    </div>
  );
}
