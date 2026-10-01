// src/features/superAdmin/pages/SuperadminDashboard.tsx

import { useOutletContext, useSearchParams } from "react-router-dom";
import StatsGrid from "../components/dashboard/Statsgrid";
import RevenueChart from "../components/dashboard/RevenueChart";
import RestaurantStatusPie from "../components/dashboard/Restaurantstatuspie";
import TopRestaurantsTable from "../components/dashboard/TopRestaurantsTable";
import {
  Activity,
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";

interface OutletContext {
  darkMode: boolean;
}

export default function SuperAdminDashboard() {
  // ✅ Reads darkMode directly from the layout via Outlet context —
  //    no need for local state or event listeners.
  const { darkMode } = useOutletContext<OutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestsOpen = searchParams.get("requests") === "new";
  const requests = useRestaurantRequestsStore((state) => state.requests);
  const approveRequest = useRestaurantRequestsStore((state) => state.approveRequest);
  const denyRequest = useRestaurantRequestsStore((state) => state.denyRequest);

  const closeRequests = () => {
    setSearchParams({});
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`min-h-full font-sans antialiased transition-colors duration-300 ${
        darkMode ? "text-slate-50" : "text-slate-900"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  darkMode
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200"
                }`}
              >
                <Activity size={9} className="animate-pulse" />
                Live
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h2>
            <p
              className={`mt-1 text-xs sm:text-sm ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {dateString} · Last synced at {timeString}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSearchParams({ requests: "new" })}
              className={`relative self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                darkMode
                  ? "border-orange-500/30 text-orange-300 bg-orange-500/10 hover:bg-orange-500/15"
                  : "border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100"
              }`}
            >
              <Building2 size={13} />
              New Requests
              {requests.length > 0 && (
                <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-orange-600 text-white text-[10px] flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => window.location.reload()}
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                darkMode
                  ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800/40"
                  : "border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── STATS ROW ───────────────────────────────────────────────── */}
        <StatsGrid darkMode={darkMode} />

        {/* ── CHARTS ROW ──────────────────────────────────────────────── */}
        {/*
          On mobile:  single column stack.
          On lg+:     revenue chart takes 2/3, pie takes 1/3.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <RevenueChart darkMode={darkMode} />
          <RestaurantStatusPie darkMode={darkMode} />
        </div>

        {/* ── TOP RESTAURANTS TABLE ────────────────────────────────────── */}
        <TopRestaurantsTable darkMode={darkMode} />

        {/* ── FOOTER NOTE ─────────────────────────────────────────────── */}
        <p
          className={`text-center text-[10px] pb-2 ${
            darkMode ? "text-slate-700" : "text-slate-300"
          }`}
        >
          Super Admin HQ · All data reflects live platform telemetry
        </p>
      </div>

      {requestsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-4xl max-h-[86vh] overflow-hidden rounded-2xl border shadow-2xl ${
              darkMode
                ? "bg-slate-950 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div>
                <h3 className="text-lg font-bold">New Restaurant Requests</h3>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Review restaurants requesting access to the automation service.
                </p>
              </div>
              <button
                onClick={closeRequests}
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  darkMode
                    ? "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Close new requests"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(86vh-88px)]">
              {requests.length === 0 ? (
                <div
                  className={`rounded-xl border px-4 py-10 text-center ${
                    darkMode
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <Building2
                    size={28}
                    className={`mx-auto mb-3 ${
                      darkMode ? "text-slate-600" : "text-slate-300"
                    }`}
                  />
                  <p className="text-sm font-semibold">No pending requests</p>
                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Approved restaurants are added to Restaurant Management.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className={`rounded-xl border p-4 ${
                        darkMode
                          ? "bg-slate-900/50 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {request.name}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            Owner: {request.owner}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            darkMode
                              ? "bg-orange-500/10 text-orange-300"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {request.plan}
                        </span>
                      </div>

                      <p
                        className={`mt-3 text-xs leading-relaxed ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {request.message}
                      </p>

                      <div className="mt-4 space-y-2 text-xs">
                        <p className="flex items-center gap-2">
                          <Mail size={13} className="text-orange-500" />
                          <span className="truncate">{request.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-orange-500" />
                          <span>{request.phone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={13} className="text-orange-500" />
                          <span className="truncate">{request.location}</span>
                        </p>
                      </div>

                      <div
                        className={`mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                          darkMode ? "border-slate-800" : "border-slate-200"
                        }`}
                      >
                        <span
                          className={`text-[11px] ${
                            darkMode ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          Requested {request.requestedAt}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => denyRequest(request.id)}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
                              darkMode
                                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                                : "border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <X size={13} />
                            Deny
                          </button>
                          <button
                            onClick={() => approveRequest(request.id)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check size={13} />
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
