import { TrendingUp, Star } from "lucide-react";
import { useMemo } from "react";
import { restaurants } from "../../store/Superadmindashboard";
import { useRestaurantRequestsStore } from "../../store/RestaurantRequests";

interface Restaurant {
  name: string;
  orders: number;
  revenue: string;
  growth: string;
}

interface TopRestaurantsTableProps {
  darkMode: boolean;
}

export default function TopRestaurantsTable({ darkMode }: TopRestaurantsTableProps) {
  const restaurantRows = useRestaurantRequestsStore((state) => state.restaurants);
  const topRestaurants = useMemo<Restaurant[]>(() => {
    const existing = new Set(restaurants.map((restaurant) => restaurant.name));
    const approvedRestaurants = restaurantRows
      .filter((restaurant) => !existing.has(restaurant.name))
      .slice(0, 3)
      .map((restaurant) => ({
        name: restaurant.name,
        orders: 0,
        revenue: restaurant.revenue,
        growth: "New",
      }));

    return [...approvedRestaurants, ...restaurants].slice(0, 5);
  }, [restaurantRows]);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm shadow-slate-100/40"
      }`}
    >
      {/* Card header */}
      <div
        className={`px-4 sm:px-5 py-4 border-b flex items-center justify-between ${
          darkMode ? "border-slate-800/80" : "border-slate-200/60"
        }`}
      >
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            Top Performing Restaurants
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Ranked by gross revenue this month
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            darkMode
              ? "text-orange-400 border-orange-500/20 bg-orange-500/10"
              : "text-orange-600 border-orange-200 bg-orange-50"
          }`}
        >
          Live
        </span>
      </div>

      {/* ── DESKTOP TABLE (sm+) ───────────────────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr
              className={`border-b uppercase font-semibold tracking-wider text-[10px] ${
                darkMode
                  ? "bg-slate-950/50 text-slate-500 border-slate-800/60"
                  : "bg-slate-50 text-slate-400 border-slate-200/60"
              }`}
            >
              <th className="py-3 px-5">#</th>
              <th className="py-3 px-5">Restaurant</th>
              <th className="py-3 px-5">Orders</th>
              <th className="py-3 px-5">Gross Revenue</th>
              <th className="py-3 px-5 text-right">Growth Rate</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              darkMode ? "divide-slate-800/40" : "divide-slate-200/60"
            }`}
          >
            {topRestaurants.map((restaurant, idx) => (
              <tr
                key={restaurant.name}
                className={`transition-colors ${
                  darkMode
                    ? "hover:bg-slate-800/20"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Rank */}
                <td className="py-3.5 px-5">
                  {idx === 0 ? (
                    <Star
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ) : (
                    <span
                      className={`font-bold text-sm ${
                        darkMode ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </td>
                {/* Name */}
                <td className="py-3.5 px-5 font-semibold text-sm">
                  {restaurant.name}
                </td>
                {/* Orders */}
                <td
                  className={`py-3.5 px-5 font-medium ${
                    darkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {restaurant.orders.toLocaleString()}
                </td>
                {/* Revenue */}
                <td
                  className={`py-3.5 px-5 font-semibold ${
                    darkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {restaurant.revenue}
                </td>
                {/* Growth */}
                <td className="py-3.5 px-5 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                    <TrendingUp size={11} />
                    {restaurant.growth}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS (< sm) ───────────────────────────────────────────── */}
      <div
        className={`sm:hidden divide-y ${
          darkMode ? "divide-slate-800/40" : "divide-slate-200/60"
        }`}
      >
        {topRestaurants.map((restaurant, idx) => (
          <div
            key={restaurant.name}
            className={`p-4 flex items-center gap-3 transition-colors ${
              darkMode ? "hover:bg-slate-800/20" : "hover:bg-slate-50"
            }`}
          >
            {/* Rank badge */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                idx === 0
                  ? "bg-amber-500/15"
                  : darkMode
                  ? "bg-slate-800"
                  : "bg-slate-100"
              }`}
            >
              {idx === 0 ? (
                <Star size={14} className="text-amber-400 fill-amber-400" />
              ) : (
                <span
                  className={`text-xs font-bold ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>
              )}
            </div>

            {/* Name + orders */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {restaurant.name}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {restaurant.orders.toLocaleString()} orders
              </p>
            </div>

            {/* Revenue + growth */}
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-bold ${
                  darkMode ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {restaurant.revenue}
              </p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5 justify-end mt-0.5">
                <TrendingUp size={10} />
                {restaurant.growth}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
