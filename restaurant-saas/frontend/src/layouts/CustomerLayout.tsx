import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { CartProvider } from '../features/customer/components/dashboard/CartContext';
import { SearchProvider } from '../features/customer/components/dashboard/SearchContext';
import CustomerSidebar from '../features/customer/components/dashboard/CustomerSidebar';
import CustomerTopBar from '../features/customer/components/dashboard/CustomerTopBar';
import CustomerBottomNav from '../features/customer/components/dashboard/CustomerBottomNav';
import CartSidebar from '../features/customer/components/dashboard/CartSidebar';
import { useCustomerStore } from '../features/customer/store/customer.store';
import { useAuth } from '../auth/AuthProvider';
import { apiClient } from '../shared/services/apiClient';

export default function CustomerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const qrToken = searchParams.get('qr_token');
  const { diningSession, setDiningSession, checkSessionInactivity, tableCode, setTableCode } = useCustomerStore();
  const { signInAs } = useAuth();

  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');

  // Sync table parameter if present
  useEffect(() => {
    const tableIdParam = searchParams.get('tableId') || searchParams.get('table');
    if (tableIdParam) {
      const parsed = parseInt(tableIdParam, 10);
      if (!isNaN(parsed)) {
        setTableCode(`T${String(parsed).padStart(2, '0')}`);
      } else {
        setTableCode(tableIdParam.toUpperCase());
      }
    } else if (tableCode === 'T06') {
      setTableCode('T07');
    }
  }, [searchParams, tableCode, setTableCode]);

  useEffect(() => {
    document.title = 'Smart-Dining';
  }, []);

  // Inactivity check
  useEffect(() => {
    checkSessionInactivity();
    const interval = setInterval(() => {
      checkSessionInactivity();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkSessionInactivity]);

  // Init session from URL token
  useEffect(() => {
    if (qrToken) {
      const initSession = async () => {
        setLoadingSession(true);
        setSessionError(null);
        try {
          const res = await apiClient.post('/public/table-session/init', { token: qrToken });
          const data = res.data?.data || res.data;

          if (data && data.sessionToken) {
            setDiningSession({
              sessionId: data.session?.session_id || '',
              restaurantId: data.session?.restaurant?.id || '',
              restaurantName: data.session?.restaurant?.name || 'Restaurant',
              tableId: data.session?.table?.id || '',
              tableNumber: data.session?.table?.table_no || 'Unknown Table',
              customerName: 'Guest',
              sessionToken: data.sessionToken,
              expiresAt: data.session?.expires_at || '',
              status: 'ACTIVE',
            });

            signInAs('customer');

            // Clean query params
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('qr_token');
            setSearchParams(newParams);
          }
        } catch (err: any) {
          setSessionError(err.response?.data?.message || 'Failed to initialize session');
        } finally {
          setLoadingSession(false);
        }
      };
      initSession();
    }
  }, [qrToken, setDiningSession, signInAs, searchParams, setSearchParams]);

  const [prevPath, setPrevPath] = useState(location.pathname);

  // Show cart panel only on home/menu pages
  const showCartPanel = ['/customer/home', '/customer/menu', '/customer'].some((p) =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  );
  const cartVisible =
    showCartPanel &&
    !location.pathname.includes('/checkout') &&
    !location.pathname.includes('/orders') &&
    !location.pathname.includes('/reservations') &&
    !location.pathname.includes('/feedback') &&
    !location.pathname.includes('/profile');

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    if (!cartVisible) {
      setCartOpen(false);
    }
  }

  const requiresSession = ['/customer/home', '/customer/menu'].some((p) =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  ) || location.pathname === '/customer' || location.pathname === '/customer/';

  return (
    <CartProvider>
      <SearchProvider>
        <div className="flex h-screen overflow-hidden bg-sd-surface customer-panel">
          <CustomerSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
            }`}
          >
            <CustomerTopBar onToggleCart={() => setCartOpen(!cartOpen)} />

            <main className="flex-1 overflow-hidden h-full">
              {!diningSession && requiresSession ? (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

                  <div className="max-w-md w-full bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center relative z-10">
                    <div className="mb-6 relative mx-auto w-32 h-32 bg-orange-50 dark:bg-orange-950/20 rounded-2xl flex items-center justify-center border border-orange-100 dark:border-orange-900/30 overflow-hidden">
                      <span className="material-symbols-outlined text-[64px] text-orange-500 animate-pulse">qr_code_scanner</span>
                      <div className="absolute left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2 font-display">Scan Table QR</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-sans">
                      Please scan the QR code located on your table to initialize your dining session. This will allow you to browse our menu, place orders directly, and request table service.
                    </p>

                    {sessionError && (
                      <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30 mb-6 font-sans">
                        {sessionError}
                      </div>
                    )}

                    {loadingSession ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
                        <p className="text-xs text-slate-400 dark:text-zinc-500 font-sans">Verifying table session...</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (manualToken.trim()) {
                            setSearchParams({ qr_token: manualToken.trim() });
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="flex flex-col items-stretch text-left">
                          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                            Testing Fallback: Enter Token Manually
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. t1-token"
                              value={manualToken}
                              onChange={(e) => setManualToken(e.target.value)}
                              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-sm font-sans"
                            />
                            <button
                              type="submit"
                              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm font-sans flex items-center justify-center"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scan {
                      0%, 100% { top: 10%; }
                      50% { top: 90%; }
                    }
                  `}} />
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </div>

          {!location.pathname.includes('/checkout') && (
            <CartSidebar
              isOpen={cartOpen}
              onClose={() => setCartOpen(!cartOpen)}
              isPersistent={cartVisible}
            />
          )}

          <CustomerBottomNav />
        </div>
      </SearchProvider>
    </CartProvider>
  );
}
