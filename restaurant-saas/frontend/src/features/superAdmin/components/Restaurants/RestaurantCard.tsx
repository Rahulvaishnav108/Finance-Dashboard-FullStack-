// components/Restaurants/RestaurantCard.tsx
// Mobile-optimized card view for restaurants

import { useState } from "react";
import {
  Mail, Phone, MapPin, Edit2, MoreVertical, Eye, Trash2,
  CheckCircle2, AlertCircle, X
} from "lucide-react";
import type { RestaurantsRow } from "./Restauranttypes";

interface RestaurantCardProps {
  restaurant: RestaurantsRow;
  darkMode: boolean;
  onView: (restaurant: RestaurantsRow) => void;
  onUpdateStatus: (id: string, status: "Active" | "Trial" | "Inactive") => void;
  onUpdatePlan: (id: string, plan: "Premium" | "Standard" | "Basic") => void;
  onDelete: (id: string) => void;
}

export default function RestaurantCard({
  restaurant,
  darkMode,
  onView,
  onUpdateStatus,
  onUpdatePlan,
  onDelete,
}: RestaurantCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  const handleStatusChange = (status: "Active" | "Trial" | "Inactive") => {
    onUpdateStatus(restaurant.id, status);
    setShowStatusMenu(false);
    setShowActions(false);
  };

  const handlePlanChange = (plan: "Premium" | "Standard" | "Basic") => {
    onUpdatePlan(restaurant.id, plan);
    setShowPlanMenu(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete restaurant "${restaurant.name}"?`)) {
      onDelete(restaurant.id);
      setShowActions(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Trial":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Inactive":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Premium":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Standard":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Basic":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        darkMode
          ? "bg-slate-900/40 border-slate-800 hover:border-slate-700"
          : "bg-white border-slate-200 hover:shadow-md"
      }`}
    >
      {/* Header with name, ID and more button */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-inherit">
        <div className="flex-1">
          <h3
            className={`font-bold text-sm leading-tight ${
              darkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {restaurant.name}
          </h3>
          <p
            className={`text-[10px] font-mono mt-1 tracking-wider ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            ID: {restaurant.id}
          </p>
        </div>
        <div className="relative ml-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className={`p-2 rounded-lg transition-all ${
              darkMode
                ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
          >
            <MoreVertical size={16} />
          </button>

          {/* Actions dropdown */}
          {showActions && (
            <>
              <button
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div
                className={`absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-20 ${
                  darkMode
                    ? "bg-slate-950 border-slate-800 shadow-black/40"
                    : "bg-white border-slate-200 shadow-slate-200"
                }`}
              >
                <button
                  onClick={() => {
                    onView(restaurant);
                    setShowActions(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 transition-colors border-b border-inherit ${
                    darkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <Eye size={13} /> View Details
                </button>

                {/* Status submenu */}
                <div>
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 transition-colors border-b border-inherit ${
                      darkMode
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <Edit2 size={13} /> Change Status
                  </button>
                  {showStatusMenu && (
                    <div
                      className={`border-l-2 ml-0 pl-0 ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                      }`}
                    >
                      <button
                        onClick={() => handleStatusChange("Active")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-emerald-500 flex items-center gap-2 transition-colors ${
                          restaurant.status === "Active"
                            ? "bg-emerald-500/10"
                            : ""
                        }`}
                      >
                        <CheckCircle2 size={11} /> Active
                      </button>
                      <button
                        onClick={() => handleStatusChange("Trial")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-orange-400 flex items-center gap-2 transition-colors ${
                          restaurant.status === "Trial"
                            ? "bg-orange-500/10"
                            : ""
                        }`}
                      >
                        <AlertCircle size={11} /> Trial
                      </button>
                      <button
                        onClick={() => handleStatusChange("Inactive")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-slate-400 flex items-center gap-2 transition-colors ${
                          restaurant.status === "Inactive"
                            ? "bg-slate-500/10"
                            : ""
                        }`}
                      >
                        <X size={11} /> Inactive
                      </button>
                    </div>
                  )}
                </div>

                {/* Plan submenu */}
                <div>
                  <button
                    onClick={() => setShowPlanMenu(!showPlanMenu)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 transition-colors border-b border-inherit ${
                      darkMode
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <Edit2 size={13} /> Change Plan
                  </button>
                  {showPlanMenu && (
                    <div
                      className={`border-l-2 ml-0 pl-0 ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                      }`}
                    >
                      <button
                        onClick={() => handlePlanChange("Premium")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-orange-500 flex items-center gap-2 transition-colors ${
                          restaurant.plan === "Premium"
                            ? "bg-orange-500/10"
                            : ""
                        }`}
                      >
                        ⭐ Premium
                      </button>
                      <button
                        onClick={() => handlePlanChange("Standard")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-amber-500 flex items-center gap-2 transition-colors ${
                          restaurant.plan === "Standard"
                            ? "bg-amber-500/10"
                            : ""
                        }`}
                      >
                        ⭐⭐ Standard
                      </button>
                      <button
                        onClick={() => handlePlanChange("Basic")}
                        className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-slate-500/5 text-blue-500 flex items-center gap-2 transition-colors ${
                          restaurant.plan === "Basic"
                            ? "bg-blue-500/10"
                            : ""
                        }`}
                      >
                        ⭐ Basic
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors mt-1"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Owner and Contact info */}
      <div className="space-y-2.5 mb-4 pb-4 border-b border-inherit">
        <div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Owner
          </p>
          <p
            className={`text-sm font-medium mt-0.5 ${
              darkMode ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {restaurant.owner}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Mail size={13} className="text-slate-400 shrink-0" />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
            {restaurant.email}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Phone size={13} className="text-slate-400 shrink-0" />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
            {restaurant.phone}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs">
          <MapPin size={13} className="text-orange-500 shrink-0 mt-0.5" />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
            {restaurant.location}
          </span>
        </div>
      </div>

      {/* Status, Plan and Revenue badges */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p
            className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Status
          </p>
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
              restaurant.status
            )}`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                restaurant.status === "Active"
                  ? "bg-emerald-500"
                  : restaurant.status === "Trial"
                  ? "bg-orange-400"
                  : "bg-slate-400"
              }`}
            />
            {restaurant.status}
          </span>
        </div>

        <div className="text-center">
          <p
            className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Plan
          </p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPlanColor(
              restaurant.plan
            )}`}
          >
            {restaurant.plan}
          </span>
        </div>

        <div className="text-center">
          <p
            className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            ARR
          </p>
          <p className="text-xs font-bold text-blue-500">{restaurant.revenue}</p>
        </div>
      </div>

      {/* Branches and quick actions */}
      <div className="flex items-center justify-between pt-2 border-t border-inherit">
        <div className="text-center flex-1">
          <p
            className={`text-[9px] font-semibold uppercase tracking-wider ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Branches
          </p>
          <p
            className={`text-xs font-bold mt-0.5 ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {restaurant.branches}
          </p>
        </div>
        <button
          onClick={() => onView(restaurant)}
          className="flex-1 ml-3 h-8 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
}