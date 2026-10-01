// AlertsDashboard.tsx  ← main page component
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAlerts } from '../hooks/usealerts';
import Header from '../components/Alerts/Header';
import StatsGrid from '../components/Alerts/Statsgrid';
import Toolbar from '../components/Alerts/Toolbar';
import AlertCard from '../components/Alerts/Alertcard';
import EmptyState from '../components/Alerts/Emptystate';
import { cx } from '../utils/Alertutils';
export default function AlertsDashboard() {
  const { darkMode, toggleTheme } = useOutletContext<{ darkMode: boolean; toggleTheme: () => void }>();

  const {
    alerts,
    filteredAlerts,
    stats,
    activeFilter,
    setActiveFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    dismissAlert,
    acknowledgeAlert,
    resolveAlert,
    markAllRead,
    dismissAll,
  } = useAlerts();

  // Determine empty state type
  const emptyType = alerts.length === 0
    ? 'all-clear'
    : searchQuery.trim()
      ? 'no-results'
      : 'filtered-empty';

  return (
    <div className={cx(
      'min-h-screen font-sans antialiased transition-colors duration-300 py-6',
      darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} newCount={stats.new} />
        <StatsGrid stats={stats} darkMode={darkMode} />
        <Toolbar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMarkAllRead={markAllRead}
          onDismissAll={dismissAll}
          newCount={stats.new}
          darkMode={darkMode}
        />

        {/* Alert list */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                darkMode={darkMode}
                onDismiss={dismissAlert}
                onAcknowledge={acknowledgeAlert}
                onResolve={resolveAlert}
              />
            ))
          ) : (
            <EmptyState
              type={emptyType}
              darkMode={darkMode}
              onReset={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            />
          )}
        </div>

        {/* Result count */}
        {filteredAlerts.length > 0 && (
          <p className={cx(
            'text-center text-xs font-medium mt-8',
            darkMode ? 'text-slate-600' : 'text-gray-400'
          )}>
            Showing {filteredAlerts.length} of {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}