// src/features/superAdmin/components/Analytics/Analyticsorderstable.tsx
import React from "react";
import {
  Utensils,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import { PlatformOrder, OrderStatus } from "../../store/Analytics";

const STATUS_TABS = ["All", "Settled", "Processing", "Disputed"] as const;

interface AnalyticsOrdersTableProps {
  darkMode: boolean;
  orders: PlatformOrder[];
  searchQuery: string;
  statusTab: string;
  onSearchChange: (v: string) => void;
  onTabChange: (tab: string) => void;
}

const statusConfig: Record<
  OrderStatus,
  { color: string; bg: string; Icon: React.ElementType }
> = {
  Settled: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    Icon: CheckCircle2,
  },
  Processing: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    Icon: Clock,
  },
  Disputed: {
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    Icon: XCircle,
  },
};

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const { color, bg, Icon } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${bg} ${color}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
}

/** Mobile card view – shown below md breakpoint */
function MobileOrderCard({
  order,
  darkMode,
}: {
  order: PlatformOrder;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border space-y-3 ${
        darkMode
          ? "bg-slate-900/60 border-slate-800/80"
          : "bg-slate-50 border-slate-200/70"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate">
            {order.restaurant}
          </p>
          <p
            className={`font-mono text-[11px] mt-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {order.id}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Gross Vol
          </p>
          <p className="font-bold">₹{order.grossAmount.toLocaleString()}</p>
        </div>
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Commission
          </p>
          <p className="font-bold text-orange-500">+₹{order.commission}</p>
        </div>
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Channel
          </p>
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {order.type}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <p
        className={`text-[11px] ${
          darkMode ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {order.timestamp}
      </p>
    </div>
  );
}

export default function AnalyticsOrdersTable({
  darkMode,
  orders,
  searchQuery,
  statusTab,
  onSearchChange,
  onTabChange,
}: AnalyticsOrdersTableProps) {
  const inputCls = [
    "pl-9 pr-9 py-2 text-xs rounded-lg outline-none border transition-all w-full sm:min-w-[220px]",
    "focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50",
    darkMode
      ? "bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400",
  ].join(" ");

  const TABLE_COLS = [
    { key: "id",          label: "Node Hash",            align: "left" },
    { key: "restaurant",  label: "Restaurant",           align: "left" },
    { key: "type",        label: "Channel",              align: "left" },
    { key: "grossAmount", label: "Gross Vol",            align: "right" },
    { key: "commission",  label: "10% Platform Cut",     align: "right" },
    { key: "status",      label: "Cluster Health",       align: "left" },
    { key: "timestamp",   label: "Activity Log",         align: "right" },
  ];

  return (
    <div
      className={[
        "rounded-xl border",
        darkMode
          ? "bg-slate-900/20 border-slate-800/80 shadow-xl shadow-black/10"
          : "bg-white border-slate-200/70 shadow-sm",
      ].join(" ")}
    >
      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Title */}
          <div className="min-w-0">
            <h3
              className={`text-base font-bold tracking-tight flex items-center gap-2 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              <Utensils size={16} className="text-orange-500 flex-shrink-0" />
              Connected Restaurant Outlets
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Real-time clearing node balance configurations and fee streams.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search
                size={13}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search restaurants…"
                className={inputCls}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div
              className={`inline-flex p-1 rounded-lg border gap-0.5 ${
                darkMode
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={[
                    "px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all duration-150",
                    statusTab === tab
                      ? "bg-orange-500 text-white shadow-sm"
                      : darkMode
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white",
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p
          className={`text-[11px] mt-3 font-medium ${
            darkMode ? "text-slate-600" : "text-slate-400"
          }`}
        >
          Showing{" "}
          <span
            className={darkMode ? "text-slate-400" : "text-slate-600"}
          >
            {orders.length}
          </span>{" "}
          records
          {statusTab !== "All" && (
            <span>
              {" "}
              ·{" "}
              <span
                className={darkMode ? "text-slate-400" : "text-slate-600"}
              >
                {statusTab}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* ── Desktop table (md+) ────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr
              className={`border-b border-inherit ${
                darkMode ? "bg-slate-950/60" : "bg-slate-50"
              }`}
            >
              {TABLE_COLS.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "py-3 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap select-none",
                    col.align === "right" ? "text-right" : "text-left",
                    darkMode ? "text-slate-500" : "text-slate-400",
                  ].join(" ")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className={`divide-y ${
              darkMode ? "divide-slate-800/50" : "divide-slate-100"
            }`}
          >
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className={`transition-colors duration-100 ${
                    darkMode
                      ? "hover:bg-slate-900/50"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Node hash */}
                  <td
                    className={`py-3.5 px-4 font-mono text-[11px] font-bold ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {order.id}
                  </td>

                  {/* Restaurant */}
                  <td className="py-3.5 px-4 font-semibold text-sm whitespace-nowrap">
                    {order.restaurant}
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        darkMode
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.type}
                    </span>
                  </td>

                  {/* Gross vol */}
                  <td className="py-3.5 px-4 font-bold text-right whitespace-nowrap tabular-nums">
                    ₹{order.grossAmount.toLocaleString()}
                  </td>

                  {/* Commission */}
                  <td className="py-3.5 px-4 font-bold text-right text-orange-500 whitespace-nowrap tabular-nums">
                    +₹{order.commission}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Timestamp */}
                  <td
                    className={`py-3.5 px-4 text-right whitespace-nowrap text-[11px] font-medium ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {order.timestamp}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search
                      size={28}
                      className={darkMode ? "text-slate-700" : "text-slate-300"}
                    />
                    <p
                      className={`text-sm font-semibold ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      No records match your criteria
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      Try adjusting your search or status filter
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list (< md) ────────────────────────────────── */}
      <div className="md:hidden p-4 space-y-3">
        {orders.length > 0 ? (
          orders.map((order) => (
            <MobileOrderCard
              key={order.id}
              order={order}
              darkMode={darkMode}
            />
          ))
        ) : (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <Search
              size={28}
              className={darkMode ? "text-slate-700" : "text-slate-300"}
            />
            <p
              className={`text-sm font-semibold ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              No records match your criteria
            </p>
            <p
              className={`text-xs ${
                darkMode ? "text-slate-600" : "text-slate-300"
              }`}
            >
              Try adjusting your search or status filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}