import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { AdminTopbar } from '../features/admin/components/AdminTopbar';
import { AdminSearchProvider } from '../features/admin/context/Adminsearchcontext';
import { AdminNotificationsProvider } from '../features/admin/context/Adminnotificationscontext';

export default function AdminLayout(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-collapsed');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('admin-sidebar-collapsed', String(next));
  };

  const handleCloseSidebar = () => {
    setSidebarCollapsed(true);
    localStorage.setItem('admin-sidebar-collapsed', 'true');
  };

  return (
    <AdminNotificationsProvider>
      <AdminSearchProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-gray-50 font-sans admin-panel">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
            onItemClick={() => {
              if (window.innerWidth < 1024) {
                handleCloseSidebar();
              }
            }}
          />

          {/* Mobile Backdrop when Sidebar is expanded */}
          {!sidebarCollapsed && (
            <button
              className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 w-full h-full border-none outline-none cursor-default"
              onClick={handleCloseSidebar}
              aria-label="Close sidebar"
            />
          )}

          {/* Main Area */}
          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              sidebarCollapsed ? 'ml-[72px]' : 'ml-[72px] lg:ml-64'
            }`}
          >
            <AdminTopbar onMenuToggle={handleToggleSidebar} />

            <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </AdminSearchProvider>
    </AdminNotificationsProvider>
  );
}