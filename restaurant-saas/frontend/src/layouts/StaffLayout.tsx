import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StaffSearchProvider } from '../features/staff/components/dashboard/StaffSearchContext';
import StaffSidebar from '../features/staff/components/dashboard/StaffSidebar';
import StaffTopBar from '../features/staff/components/dashboard/StaffTopBar';

export default function StaffLayout(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('staff-sidebar-collapsed');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  return (
    <StaffSearchProvider>
      <div className="flex min-h-screen bg-sd-surface text-sd-on-surface font-sans staff-panel">
        {/* Sidebar */}
        <StaffSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => {
            const next = !sidebarCollapsed;
            setSidebarCollapsed(next);
            localStorage.setItem('staff-sidebar-collapsed', String(next));
          }}
          onItemClick={() => {
            if (window.innerWidth < 1024) {
              setSidebarCollapsed(true);
              localStorage.setItem('staff-sidebar-collapsed', 'true');
            }
          }}
        />

        {/* Mobile Backdrop when Sidebar is expanded */}
        {!sidebarCollapsed && (
          <button
            className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 w-full h-full border-none outline-none cursor-default"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Close sidebar"
          />
        )}

        {/* Main Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-[72px]' : 'ml-[72px] lg:ml-64'
          }`}
        >
          <StaffTopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </StaffSearchProvider>
  );
}