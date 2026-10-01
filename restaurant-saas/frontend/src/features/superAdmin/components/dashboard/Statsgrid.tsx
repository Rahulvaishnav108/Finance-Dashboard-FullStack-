import { TrendingUp, TrendingDown } from "lucide-react";
import { stats } from "../../store/Superadmindashboard";
import { useRestaurantRequestsStore } from "../../store/RestaurantRequests";

interface StatItem {
  title: string;
  value: string | number;
  growth: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  lightColor: string;
  darkColor: string;
}

interface StatsGridProps {
  darkMode: boolean;
}

export default function StatsGrid({ darkMode }: StatsGridProps) {
  const restaurantCount = useRestaurantRequestsStore(
    (state) => state.restaurants.length
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
      {(stats as StatItem[]).map((stat) => {
        const Icon = stat.icon;
        const isPositive = !stat.growth.startsWith("-");
        const value =
          stat.title === "Total Restaurants" ? restaurantCount : stat.value;

        return (
          <div
            key={stat.title}
            className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-lg group ${
              darkMode
                ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60"
                : "bg-white border-slate-200/60 shadow-sm hover:shadow-slate-200/60 hover:border-slate-300/60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <p
                  className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase truncate ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {stat.title}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  {value}
                </h3>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold pt-1 ${
                    isPositive ? "text-emerald-500" : "text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  <span>{stat.growth} vs last month</span>
                </div>
              </div>

              <div
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  darkMode ? stat.darkColor : stat.lightColor
                }`}
              >
                <Icon size={17} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
