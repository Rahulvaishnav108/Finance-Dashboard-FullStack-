import React from 'react';
import { Download, CalendarDays, ChevronDown } from 'lucide-react';
import { useReportsStore, exportReportsAsCSV } from '../store/reports.store';
import type { DateRange } from '../store/reports.store';
import { ReportStatCards } from '../components/reports/ReportStatCards';
import { RevenueOverview } from '../components/reports/RevenueOverview';
import { OrdersTrend, SalesByChannel } from '../components/reports/ReportCharts';
import { PeakHours, TopSellingItems, RevenueByCategory } from '../components/reports/ReportWidgets';
import { DailySummary, InsightsPanel, ReportShortcuts } from '../components/reports/ReportBottom';
import { CalendarPanel } from '../components/reports/CalendarPanel';

const GLOBAL_RANGES: DateRange[] = ['Daily', 'Weekly', 'Monthly'];

export default function ReportsPage(): JSX.Element {
  const {
    isCalendarOpen, setIsCalendarOpen,
    globalRange, setGlobalRange,
    getDateLabel,
  } = useReportsStore();

  function handleExport() {
    exportReportsAsCSV(useReportsStore.getState());
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track performance, analyze trends, and make data-driven decisions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Global range toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {GLOBAL_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setGlobalRange(r)}
                className={`text-xs px-3 py-2 font-semibold transition-colors ${
                  globalRange === r
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{getDateLabel()}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isCalendarOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isCalendarOpen && <CalendarPanel />}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">Export Report</span>
            <span className="xs:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <ReportStatCards />

      {/* Row 1: Revenue + Orders + Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4">
        <RevenueOverview />
        <OrdersTrend />
        <SalesByChannel />
      </div>

      {/* Row 2: Peak hours + Top items + Revenue by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <PeakHours />
        <TopSellingItems />
        <RevenueByCategory />
      </div>

      {/* Row 3: Daily summary + Insights sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          <DailySummary />
        </div>
        <div className="space-y-4">
          <ReportShortcuts />
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}