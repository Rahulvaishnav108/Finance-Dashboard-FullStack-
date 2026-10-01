// components/Restaurants/RestaurantTable.tsx
// Responsive table component that switches between table and card view

import { useState, useEffect } from "react";
import {
  Eye, Edit2, MoreVertical, Mail, Phone, MapPin,
  Search, CheckCircle2, AlertCircle, X, Trash2
} from "lucide-react";
import type { RestaurantsRow } from "./Restauranttypes";
import RestaurantCard from "./RestaurantCard";

interface RestaurantTableProps {
  restaurants: RestaurantsRow[];
  darkMode: boolean;
  searchQuery: string;
  statusFilter: string;
  onView: (row: RestaurantsRow) => void;
  onUpdateStatus: (id: string, status: "Active" | "Trial" | "Inactive") => void;
  onUpdatePlan: (id: string, plan: "Premium" | "Standard" | "Basic") => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

// Extracted outside of render to prevent recreation on every state update
interface EmptyStateProps {
  darkMode: boolean;
  searchQuery: string;
  statusFilter: string;
  onResetFilters: () => void;
}

function EmptyState({ darkMode, searchQuery, statusFilter, onResetFilters }: EmptyStateProps) {
  return (
    <div className="py-14 text-center px-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400"}`}>
        <Search size={18} />
      </div>
      <h4 className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
        No matched operations found
      </h4>
      <p className={`text-xs mt-1 max-w-xs mx-auto ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        No system accounts match the current query parameter: &quot;{searchQuery || statusFilter}&quot;.
      </p>
      <button
        onClick={onResetFilters}
        className="mt-4 px-3 py-1.5 text-xs font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10"
      >
        Reset All Filters
      </button>
    </div>
  );
}

export default function RestaurantTable({
  restaurants,
  darkMode,
  searchQuery,
  statusFilter,
  onView,
  onUpdateStatus,
  onUpdatePlan,
  onDelete,
  onResetFilters,
}: RestaurantTableProps) {
  const [activeActionRow, setActiveActionRow] = useState<string | null>(null);
  const [activeMoreRow, setActiveMoreRow] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleUpdateStatus = (id: string, status: "Active" | "Trial" | "Inactive") => {
    onUpdateStatus(id, status);
    setActiveActionRow(null);
    setActiveMoreRow(null);
  };

  const handleUpdatePlan = (id: string, plan: "Premium" | "Standard" | "Basic") => {
    onUpdatePlan(id, plan);
    setActiveActionRow(null);
    setActiveMoreRow(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setActiveActionRow(null);
    setActiveMoreRow(null);
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className={`rounded-2xl border transition-all ${
        darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/70 shadow-sm"
      }`}>
        {restaurants.length > 0 ? (
          <div className="p-3 space-y-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                darkMode={darkMode}
                onView={onView}
                onUpdateStatus={handleUpdateStatus}
                onUpdatePlan={handleUpdatePlan}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            darkMode={darkMode}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onResetFilters={onResetFilters}
          />
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className={`rounded-2xl border transition-all ${
      darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/70 shadow-sm"
    }`}>
      <div className="overflow-x-auto w-full rounded-2xl">
        {restaurants.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b border-inherit text-xs font-semibold uppercase tracking-wider ${
                darkMode
                  ? "bg-slate-950/40 text-slate-400 border-slate-900"
                  : "bg-slate-50/70 text-slate-400 border-slate-200/80"
              }`}>
                <th className="py-4 px-6 font-semibold">Restaurant Node</th>
                <th className="py-4 px-6 font-semibold">Owner</th>
                <th className="py-4 px-6 font-semibold">Contact</th>
                <th className="py-4 px-6 font-semibold">Geographic Coordinates</th>
                <th className="py-4 px-6 font-semibold">Tier Bracket</th>
                <th className="py-4 px-6 font-semibold">System Health</th>
                <th className="py-4 px-6 font-semibold">Gross ARR</th>
                <th className="py-4 px-6 font-semibold text-center">Operations</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${darkMode ? "divide-slate-900" : "divide-slate-100"}`}>
              {restaurants.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${darkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/40"}`}
                >
                  {/* Name & ID */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className={`font-bold leading-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                      {row.name}
                    </div>
                    <div className={`text-[11px] mt-1 font-mono tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      ID: {row.id}
                    </div>
                  </td>

                  {/* Owner */}
                  <td className={`py-4 px-6 font-medium whitespace-nowrap ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                    {row.owner}
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className={`flex items-center gap-2 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <Mail size={13} className="shrink-0 text-slate-400" />
                      <span>{row.email}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium mt-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <Phone size={13} className="shrink-0 text-slate-400" />
                      <span>{row.phone}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className={`flex items-start gap-1.5 text-xs font-medium max-w-[170px] whitespace-normal ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      <MapPin size={13} className="shrink-0 text-orange-500 mt-0.5" />
                      <span>{row.location}</span>
                    </div>
                  </td>

                  {/* Plan Badge */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      row.plan === "Premium"
                        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                        : row.plan === "Standard"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    }`}>
                      {row.plan}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      row.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : row.status === "Trial"
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        row.status === "Active" ? "bg-emerald-500" : row.status === "Trial" ? "bg-orange-400" : "bg-slate-400"
                      }`} />
                      {row.status}
                    </span>
                  </td>

                  {/* Revenue */}
                  <td className={`py-4 px-6 whitespace-nowrap font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                    {row.revenue}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    <div className={`flex items-center justify-center gap-3 ${darkMode ? "text-slate-500 hover:text-slate-400" : "text-slate-400 hover:text-slate-505"}`}>
                      {/* View */}
                      <button
                        onClick={() => onView(row)}
                        className="p-1 hover:text-orange-500 rounded-md hover:bg-slate-500/5 transition-all"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit Dropdown */}
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => {
                            setActiveMoreRow(null);
                            setActiveActionRow(activeActionRow === row.id ? null : row.id);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-500/5 transition-all ${
                            activeActionRow === row.id ? "text-orange-500 bg-orange-500/5" : "hover:text-orange-500"
                          }`}
                          title="Edit Node Parameters"
                          aria-expanded={activeActionRow === row.id}
                        >
                          <Edit2 size={14} />
                        </button>

                        {activeActionRow === row.id && (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-30 cursor-default bg-transparent w-full h-full"
                              onClick={() => setActiveActionRow(null)}
                              aria-label="Close dropdown"
                            />
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border p-2 shadow-xl z-40 text-left ${
                              darkMode ? "bg-slate-950 border-slate-800 shadow-black/40" : "bg-white border-slate-200 shadow-slate-200"
                            }`}>
                              <p className={`text-[10px] font-bold uppercase px-2.5 py-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                Set Status
                              </p>
                              <button
                                onClick={() => handleUpdateStatus(row.id, "Active")}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-500/5 text-emerald-500 flex items-center gap-1.5"
                              >
                                <CheckCircle2 size={12} /> Active
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(row.id, "Trial")}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-500/5 text-orange-400 flex items-center gap-1.5"
                              >
                                <AlertCircle size={12} /> Trial
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(row.id, "Inactive")}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-500/5 text-slate-400 flex items-center gap-1.5"
                              >
                                <X size={12} /> Inactive
                              </button>

                              <div className="h-px my-1.5 bg-slate-200 dark:bg-slate-800" />

                              <p className={`text-[10px] font-bold uppercase px-2.5 py-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                Change Tier Plan
                              </p>
                              <button
                                onClick={() => handleUpdatePlan(row.id, "Premium")}
                                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-500/5 ${darkMode ? "text-slate-300 hover:text-slate-100" : "text-slate-700 hover:text-slate-900"}`}
                              >
                                Premium Tier
                              </button>
                              <button
                                onClick={() => handleUpdatePlan(row.id, "Standard")}
                                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-500/5 ${darkMode ? "text-slate-300 hover:text-slate-100" : "text-slate-700 hover:text-slate-900"}`}
                              >
                                Standard Tier
                              </button>
                              <button
                                onClick={() => handleUpdatePlan(row.id, "Basic")}
                                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-500/5 ${darkMode ? "text-slate-300 hover:text-slate-100" : "text-slate-700 hover:text-slate-900"}`}
                              >
                                Basic Tier
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* More Dropdown */}
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => {
                            setActiveActionRow(null);
                            setActiveMoreRow(activeMoreRow === row.id ? null : row.id);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-500/5 transition-all ${
                            activeMoreRow === row.id ? "text-orange-500 bg-orange-500/5" : "hover:text-orange-500"
                          }`}
                          title="More Operations"
                          aria-expanded={activeMoreRow === row.id}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {activeMoreRow === row.id && (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-30 cursor-default bg-transparent w-full h-full"
                              onClick={() => setActiveMoreRow(null)}
                              aria-label="Close dropdown"
                            />
                            <div className={`absolute right-0 mt-2 w-44 rounded-xl border p-1.5 shadow-xl z-40 text-left ${
                              darkMode ? "bg-slate-950 border-slate-800 shadow-black/40" : "bg-white border-slate-200 shadow-slate-200"
                            }`}>
                              <button
                                onClick={() => { onView(row); setActiveMoreRow(null); }}
                                className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                              >
                                <Eye size={13} /> Quick Preview
                              </button>
                              <button
                                onClick={() => { setActiveActionRow(row.id); setActiveMoreRow(null); }}
                                className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                              >
                                <Edit2 size={13} /> Adjust Tiers
                              </button>

                              <div className="h-px my-1 bg-slate-200 dark:bg-slate-800" />

                              <button
                                onClick={() => handleDelete(row.id)}
                                className="w-full text-left px-2.5 py-2 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={13} /> Delete Account
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            darkMode={darkMode}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onResetFilters={onResetFilters}
          />
        )}
      </div>
    </div>
  );
}