// src/features/superAdmin/pages/Analytics.tsx
import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  metricsData,
  barSeries,
  distributionSeries,
  mockPlatformOrders,
} from "../store/Analytics";
import { exportOrdersAsCSV } from "../utils/Analyticsutils";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";

import AnalyticsHeader     from "../components/Analytics/Analyticsheader";
import AnalyticsKPICards   from "../components/Analytics/Analyticskpicards";
import AnalyticsBarChart   from "../components/Analytics/Analyticsbarchart";
import AnalyticsPieChart   from "../components/Analytics/Analyticspiechart";
import AnalyticsOrdersTable from "../components/Analytics/Analyticsorderstable";

interface LayoutContextType {
  darkMode: boolean;
}

export default function Analytics() {
  const { darkMode } = useOutletContext<LayoutContextType>();
  const approvedRestaurants = useRestaurantRequestsStore((state) => state.restaurants);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab]     = useState("All");

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────
  const linkedPlatformOrders = useMemo(() => {
    const existingRestaurantNames = new Set(
      mockPlatformOrders.map((order) => order.restaurant.toLowerCase())
    );

    const placeholderOrders = approvedRestaurants
      .filter(
        (restaurant) => !existingRestaurantNames.has(restaurant.name.toLowerCase())
      )
      .map((restaurant, index) => ({
        id: `#ONB${restaurant.id.replace(/[^0-9]/g, "") || index}`,
        restaurant: restaurant.name,
        type: "Onboarding",
        grossAmount: 0,
        commission: 0,
        status: "Processing" as const,
        timestamp: "Awaiting backend sync",
      }));

    return [...placeholderOrders, ...mockPlatformOrders];
  }, [approvedRestaurants]);

  const analyticsMetrics = useMemo(
    () =>
      metricsData.map((metric) =>
        metric.label === "Total Restaurants"
          ? {
              ...metric,
              current: linkedPlatformOrders.length.toLocaleString(),
              shift: `${approvedRestaurants.length} linked locally`,
            }
          : metric
      ),
    [approvedRestaurants.length, linkedPlatformOrders.length]
  );

  const totalVolume = linkedPlatformOrders.reduce(
    (acc, o) => acc + o.grossAmount,
    0,
  );
  const totalCommission = linkedPlatformOrders.reduce(
    (acc, o) => acc + o.commission,
    0,
  );
  const averageOrderValue = Math.round(
    totalVolume / linkedPlatformOrders.length,
  );

  const filteredOrders = linkedPlatformOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.restaurant.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q);
    const matchesTab =
      statusTab === "All" || order.status === statusTab;
    return matchesSearch && matchesTab;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSync = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleExport  = () => exportOrdersAsCSV(filteredOrders);
  const handleOnboard = () =>
    alert("System Diagnostics: All Server Clusters Operational.");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <main className="w-full px-4 sm:px-6 xl:px-8 py-6 sm:py-8 max-w-[1600px] mx-auto space-y-6">

        {/* 1 ── Page header */}
        <AnalyticsHeader
          darkMode={darkMode}
          isRefreshing={isRefreshing}
          onSync={handleSync}
          onExport={handleExport}
          onOnboard={handleOnboard}
        />

        {/* 2 ── KPI summary cards */}
        <AnalyticsKPICards
          darkMode={darkMode}
          metrics={analyticsMetrics}
          totalVolume={totalVolume}
          totalCommission={totalCommission}
          averageOrderValue={averageOrderValue}
        />

        {/* 3 ── Charts row
              Mobile  : stacked (1 col)
              Tablet  : 2 cols (bar takes more space)
              Desktop : bar = 2/3 | pie = 1/3
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bar chart spans 2 cols on md+ */}
          <div className="md:col-span-2">
            <AnalyticsBarChart darkMode={darkMode} data={barSeries} />
          </div>

          {/* Pie chart */}
          <div className="md:col-span-1">
            <AnalyticsPieChart
              darkMode={darkMode}
              data={distributionSeries}
            />
          </div>
        </div>

        {/* 4 ── Orders table */}
        <AnalyticsOrdersTable
          darkMode={darkMode}
          orders={filteredOrders}
          searchQuery={searchQuery}
          statusTab={statusTab}
          onSearchChange={setSearchQuery}
          onTabChange={setStatusTab}
        />

      </main>
    </div>
  );
}
