import React, { useMemo, useState, useEffect } from 'react';

import { LogType, initialLogs } from "../store/AuditLogs";
import { exportLogsAsCSV } from "../utils/Auditlogsutils";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";

import AuditLogsHeader from "../components/Audit/Auditlogsheader";
import AuditLogsKPICards from "../components/Audit/Auditlogskpicards";
import AuditLogsFilterBar from "../components/Audit/Auditlogsfilterbar";
import AuditLogsTable from "../components/Audit/Auditlogstable";
import AuditLogsMobileCards from "../components/Audit/Auditlogsmobilecards";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<LogType | 'All'>('All');
  const approvedRestaurants = useRestaurantRequestsStore((state) => state.restaurants);

  // Dark mode: initialise from localStorage, default to dark
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  // Sync theme when a global "sync-app-theme" event fires (e.g. from Layout sidebar)
  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.darkMode !== undefined) {
        setDarkMode(customEvent.detail.darkMode);
      }
    };
    window.addEventListener('sync-app-theme', handleThemeSync);
    return () => window.removeEventListener('sync-app-theme', handleThemeSync);
  }, []);

  // Keep <html> class in sync for Tailwind dark: variants
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // --- Derived data ---
  const linkedLogs = useMemo(() => {
    const existingTargets = new Set(
      initialLogs.map((log) => log.target.toLowerCase())
    );

    const onboardingLogs = approvedRestaurants
      .filter((restaurant) => !existingTargets.has(restaurant.name.toLowerCase()))
      .map((restaurant, index) => ({
        id: `request-${restaurant.id}`,
        type: 'Restaurant' as LogType,
        action: 'Restaurant Request Approved',
        performedBy: 'Super Admin',
        target: restaurant.name,
        details: `Placeholder audit entry for ${restaurant.plan} onboarding until backend audit events are connected`,
        ipAddress: 'Frontend Placeholder',
        timestamp: `2026-06-25 ${String(12 + index).padStart(2, '0')}:00`,
      }));

    return [...onboardingLogs, ...initialLogs];
  }, [approvedRestaurants]);

  const filteredLogs = linkedLogs.filter((log) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(query) ||
      log.performedBy.toLowerCase().includes(query) ||
      log.target.toLowerCase().includes(query);
    const matchesType = selectedType === 'All' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => exportLogsAsCSV(filteredLogs);

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-300 px-4 sm:px-6 py-6 sm:py-8 ${
        darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* 1. Page header + export button */}
        <AuditLogsHeader darkMode={darkMode} onExport={handleExport} />

        {/* 2. KPI summary cards */}
        <AuditLogsKPICards darkMode={darkMode} logs={linkedLogs} />

        {/* 3. Search & type-filter bar */}
        <AuditLogsFilterBar
          darkMode={darkMode}
          searchTerm={searchTerm}
          selectedType={selectedType}
          onSearchChange={setSearchTerm}
          onTypeChange={setSelectedType}
        />

        {/* 4. Data table / card list */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          {/* Desktop table */}
          <AuditLogsTable darkMode={darkMode} logs={filteredLogs} />

          {/* Mobile card list */}
          <AuditLogsMobileCards darkMode={darkMode} logs={filteredLogs} />
        </div>

      </div>
    </div>
  );
}
