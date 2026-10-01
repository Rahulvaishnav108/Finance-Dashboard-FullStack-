import { useState } from "react";
import {
  Eye, Edit2, MoreVertical, Mail, Phone, MapPin,
  CheckCircle2, AlertCircle, X, Trash2, SlidersHorizontal,
  Crown, Zap, Package, Building2, GitBranch, ChevronDown
} from "lucide-react";
import type { RestaurantNode, PlanType, StatusType } from "./Subcriptiontypes";
import { PLAN_COLORS } from "../../store/Subscriptions";

interface SubscriptionTableProps {
  restaurants: RestaurantNode[];
  darkMode: boolean;
  searchQuery: string;
  statusFilter: string;
  tierFilter: string;
  onView: (row: RestaurantNode) => void;
  onUpdateStatus: (id: string, status: StatusType) => void;
  onUpdatePlan: (id: string, plan: PlanType) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  Basic:      <Package size={12} />,
  Standard:   <Zap size={12} />,
  Premium:    <Crown size={12} />,
  Enterprise: <Building2 size={12} />,
};

const TAG_STYLES: Record<string, string> = {
  "Top Earner":   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Enterprise":   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Multi-branch": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "New":          "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Churned":      "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ── Shared edit dropdown content ─────────────────────────────────────────────
function EditDropdownContent({
  row, darkMode,
  onStatusUpdate, onPlanUpdate, onClose,
}: {
  row: RestaurantNode; darkMode: boolean;
  onStatusUpdate: (id: string, s: StatusType) => void;
  onPlanUpdate: (id: string, p: PlanType) => void;
  onClose: () => void;
}) {
  return (
    <div className={`w-52 rounded-xl border p-2 shadow-2xl ${
      darkMode ? "bg-slate-950 border-slate-800 shadow-black/50" : "bg-white border-slate-200 shadow-slate-200"
    }`}>
      <p className={`text-[10px] font-bold uppercase px-2 py-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        Set Status
      </p>
      {(["Active", "Trial", "Inactive"] as StatusType[]).map((s) => (
        <button
          key={s}
          onClick={() => { onStatusUpdate(row.id, s); onClose(); }}
          className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${
            row.status === s
              ? s === "Active" ? "text-emerald-500" : s === "Trial" ? "text-amber-500" : "text-slate-400"
              : darkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {s === "Active" && <CheckCircle2 size={12} className="text-emerald-500" />}
          {s === "Trial" && <AlertCircle size={12} className="text-amber-500" />}
          {s === "Inactive" && <X size={12} className="text-slate-400" />}
          {s}
          {row.status === s && <span className="ml-auto text-[9px] text-orange-500 font-bold">CURRENT</span>}
        </button>
      ))}

      <div className={`h-px my-1.5 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />

      <p className={`text-[10px] font-bold uppercase px-2 py-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        Change Plan
      </p>
      {(["Basic", "Standard", "Premium", "Enterprise"] as PlanType[]).map((p) => (
        <button
          key={p}
          onClick={() => { onPlanUpdate(row.id, p); onClose(); }}
          className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${
            row.plan === p ? PLAN_COLORS[p].text : darkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <span className={PLAN_COLORS[p].text}>{PLAN_ICONS[p]}</span>
          {p}
          {row.plan === p && <span className="ml-auto text-[9px] text-orange-500 font-bold">CURRENT</span>}
        </button>
      ))}
    </div>
  );
}

// ── Mobile card for a single restaurant ──────────────────────────────────────
function MobileRestaurantCard({
  row, darkMode, onView, onUpdateStatus, onUpdatePlan, onDelete,
}: {
  row: RestaurantNode; darkMode: boolean;
  onView: (r: RestaurantNode) => void;
  onUpdateStatus: (id: string, s: StatusType) => void;
  onUpdatePlan: (id: string, p: PlanType) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const planColors = PLAN_COLORS[row.plan];

  return (
    <div className={`rounded-2xl border transition-all ${
      darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/80 shadow-sm"
    }`}>
      {/* Card header — always visible */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-sm leading-tight truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded ${
                darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
              }`}>
                {row.id}
              </span>
              <span className={`flex items-center gap-0.5 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                <GitBranch size={10} />{row.branches}
              </span>
              {(row.tags ?? []).slice(0, 2).map((tag) => (
                <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TAG_STYLES[tag] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Revenue + status */}
          <div className="text-right shrink-0">
            <div className={`font-extrabold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>
              {row.revenue}
            </div>
            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              row.status === "Active"
                ? "bg-emerald-500/10 text-emerald-500"
                : row.status === "Trial"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-slate-500/10 text-slate-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                row.status === "Active" ? "bg-emerald-500 animate-pulse"
                  : row.status === "Trial" ? "bg-amber-400" : "bg-slate-400"
              }`} />
              {row.status}
            </span>
          </div>
        </div>

        {/* Plan + owner row */}
        <div className="flex items-center justify-between mt-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${planColors.text} ${planColors.border}`}>
            {PLAN_ICONS[row.plan]}
            {row.plan}
          </span>
          <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {row.owner}
          </span>
        </div>
      </div>

      {/* Expandable contact + location */}
      {expanded && (
        <div className={`px-4 pb-4 space-y-2.5 border-t ${darkMode ? "border-slate-800" : "border-slate-100"} pt-3`}>
          <a href={`mailto:${row.email}`} className={`flex items-center gap-2 text-xs font-medium hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <Mail size={12} className="shrink-0" />{row.email}
          </a>
          <a href={`tel:${row.phone}`} className={`flex items-center gap-2 text-xs font-medium hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <Phone size={12} className="shrink-0" />{row.phone}
          </a>
          <div className={`flex items-start gap-1.5 text-xs font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            <MapPin size={12} className="shrink-0 text-orange-500 mt-0.5" />
            <span>{row.location}</span>
          </div>
          <div className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Joined: <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{row.joinedDate}</span>
            {" · "}Last active: <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{row.lastActive}</span>
          </div>
        </div>
      )}

      {/* Card footer actions */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-t ${darkMode ? "border-slate-800/80" : "border-slate-100"}`}>
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
            darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Less" : "Details"}
        </button>

        <div className="flex items-center gap-1">
          {/* View */}
          <button
            onClick={() => onView(row)}
            className={`p-1.5 rounded-lg transition-all hover:text-orange-500 hover:bg-orange-500/5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
            title="View details"
          >
            <Eye size={14} />
          </button>

          {/* Edit dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowMore(false); setShowEdit((v) => !v); }}
              className={`p-1.5 rounded-lg transition-all ${
                showEdit ? "text-orange-500 bg-orange-500/10"
                  : `hover:text-orange-500 hover:bg-orange-500/5 ${darkMode ? "text-slate-500" : "text-slate-400"}`
              }`}
              title="Edit status or plan"
            >
              <Edit2 size={14} />
            </button>
            {showEdit && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setShowEdit(false)} aria-label="Close" />
                <div className="absolute right-0 bottom-full mb-2 z-20">
                  <EditDropdownContent
                    row={row} darkMode={darkMode}
                    onStatusUpdate={onUpdateStatus}
                    onPlanUpdate={onUpdatePlan}
                    onClose={() => setShowEdit(false)}
                  />
                </div>
              </>
            )}
          </div>

          {/* More */}
          <div className="relative">
            <button
              onClick={() => { setShowEdit(false); setShowMore((v) => !v); }}
              className={`p-1.5 rounded-lg transition-all ${
                showMore ? "text-orange-500 bg-orange-500/10"
                  : `hover:text-orange-500 hover:bg-orange-500/5 ${darkMode ? "text-slate-500" : "text-slate-400"}`
              }`}
              title="More options"
            >
              <MoreVertical size={14} />
            </button>
            {showMore && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMore(false)} aria-label="Close" />
                <div className={`absolute right-0 bottom-full mb-2 w-44 rounded-xl border p-1.5 shadow-2xl z-20 ${
                  darkMode ? "bg-slate-950 border-slate-800 shadow-black/50" : "bg-white border-slate-200 shadow-slate-200"
                }`}>
                  <button onClick={() => { onView(row); setShowMore(false); }} className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}>
                    <Eye size={13} /> View Profile
                  </button>
                  <button onClick={() => { setShowMore(false); setShowEdit(true); }} className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}>
                    <Edit2 size={13} /> Edit Plan / Status
                  </button>
                  <div className={`h-px my-1 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
                  <button onClick={() => { onDelete(row.id); setShowMore(false); }} className="w-full text-left px-2.5 py-2 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center gap-2 transition-colors">
                    <Trash2 size={13} /> Remove Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ darkMode, label, onResetFilters }: { darkMode: boolean; label: string; onResetFilters: () => void }) {
  return (
    <div className="py-16 text-center px-4">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
        darkMode ? "bg-slate-900 text-slate-500" : "bg-slate-100 text-slate-400"
      }`}>
        <SlidersHorizontal size={22} />
      </div>
      <h4 className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
        No restaurants found
      </h4>
      <p className={`text-xs mt-1 max-w-xs mx-auto ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        No results for &quot;{label}&quot;.
      </p>
      <button
        onClick={onResetFilters}
        className="mt-5 px-4 py-2 text-xs font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10"
      >
        Clear All Filters
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SubscriptionTable({
  restaurants, darkMode, searchQuery, statusFilter, tierFilter,
  onView, onUpdateStatus, onUpdatePlan, onDelete, onResetFilters,
}: SubscriptionTableProps) {
  const [editDropdownId, setEditDropdownId] = useState<string | null>(null);
  const [moreDropdownId, setMoreDropdownId] = useState<string | null>(null);

  const closeAll = () => { setEditDropdownId(null); setMoreDropdownId(null); };

  const emptyLabel = searchQuery || statusFilter !== "All" && statusFilter || tierFilter !== "All" && tierFilter || "current filters";

  if (restaurants.length === 0) {
    return (
      <div className={`rounded-2xl border transition-all ${
        darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/70 shadow-sm"
      }`}>
        <EmptyState darkMode={darkMode} label={String(emptyLabel)} onResetFilters={onResetFilters} />
      </div>
    );
  }

  return (
    <>
      {/* ── MOBILE: stacked cards (hidden on lg+) ───────────────────────── */}
      <div className="lg:hidden space-y-3">
        {restaurants.map((row) => (
          <MobileRestaurantCard
            key={row.id}
            row={row}
            darkMode={darkMode}
            onView={onView}
            onUpdateStatus={onUpdateStatus}
            onUpdatePlan={onUpdatePlan}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* ── DESKTOP: full table (hidden below lg) ───────────────────────── */}
      <div className={`hidden lg:block rounded-2xl border overflow-visible transition-all ${
        darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/70 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className={`border-b border-inherit text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? "bg-slate-950/50 text-slate-400 border-slate-900" : "bg-slate-50 text-slate-400 border-slate-200/80"
              }`}>
                <th className="py-3.5 px-5">Restaurant</th>
                <th className="py-3.5 px-5">Owner</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Plan</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Revenue</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y text-sm ${darkMode ? "divide-slate-900/80" : "divide-slate-100"}`}>
              {restaurants.map((row) => {
                const planColors = PLAN_COLORS[row.plan];
                return (
                  <tr
                    key={row.id}
                    className={`group transition-colors ${darkMode ? "hover:bg-slate-900/30" : "hover:bg-slate-50/60"}`}
                  >
                    {/* Name + ID + Branches + Tags */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className={`font-bold text-[13px] leading-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {row.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded ${
                          darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                        }`}>
                          {row.id}
                        </span>
                        <span className={`flex items-center gap-0.5 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          <GitBranch size={10} />{row.branches}
                        </span>
                        {(row.tags ?? []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TAG_STYLES[tag] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className={`py-4 px-5 font-medium whitespace-nowrap text-sm ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                      {row.owner}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <a href={`mailto:${row.email}`} className={`flex items-center gap-2 text-xs font-medium hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <Mail size={12} className="shrink-0" />{row.email}
                      </a>
                      <a href={`tel:${row.phone}`} className={`flex items-center gap-2 text-xs font-medium mt-1.5 hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <Phone size={12} className="shrink-0" />{row.phone}
                      </a>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-5">
                      <div className={`flex items-start gap-1.5 text-xs font-medium max-w-[170px] ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        <MapPin size={12} className="shrink-0 text-orange-500 mt-0.5" />
                        <span>{row.location}</span>
                      </div>
                    </td>

                    {/* Plan Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${planColors.text} ${planColors.border} ${planColors.icon.replace("text-", "bg-").replace("400", "500/10")}`}>
                        {PLAN_ICONS[row.plan]}
                        {row.plan}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        row.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : row.status === "Trial"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-slate-500/10 text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === "Active" ? "bg-emerald-500 animate-pulse" : row.status === "Trial" ? "bg-amber-400" : "bg-slate-400"
                        }`} />
                        {row.status}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className={`py-4 px-5 font-extrabold text-right whitespace-nowrap ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {row.revenue}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 whitespace-nowrap text-center relative overflow-visible">
                      <div className="flex items-center justify-center gap-1.5">

                        <button
                          onClick={() => { closeAll(); onView(row); }}
                          title="View details"
                          className={`p-1.5 rounded-lg transition-all hover:text-orange-500 hover:bg-orange-500/5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => { setMoreDropdownId(null); setEditDropdownId(editDropdownId === row.id ? null : row.id); }}
                            title="Edit status or plan"
                            className={`p-1.5 rounded-lg transition-all ${
                              editDropdownId === row.id
                                ? "text-orange-500 bg-orange-500/10"
                                : `hover:text-orange-500 hover:bg-orange-500/5 ${darkMode ? "text-slate-500" : "text-slate-400"}`
                            }`}
                          >
                            <Edit2 size={14} />
                          </button>

                          {editDropdownId === row.id && (
                            <>
                              <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setEditDropdownId(null)} aria-label="Close dropdown" />
                              <div className="absolute right-0 mt-2 z-20">
                                <EditDropdownContent
                                  row={row} darkMode={darkMode}
                                  onStatusUpdate={onUpdateStatus}
                                  onPlanUpdate={onUpdatePlan}
                                  onClose={() => setEditDropdownId(null)}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* More dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => { setEditDropdownId(null); setMoreDropdownId(moreDropdownId === row.id ? null : row.id); }}
                            title="More options"
                            className={`p-1.5 rounded-lg transition-all ${
                              moreDropdownId === row.id
                                ? "text-orange-500 bg-orange-500/10"
                                : `hover:text-orange-500 hover:bg-orange-500/5 ${darkMode ? "text-slate-500" : "text-slate-400"}`
                            }`}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {moreDropdownId === row.id && (
                            <>
                              <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setMoreDropdownId(null)} aria-label="Close dropdown" />
                              <div className={`absolute right-0 mt-2 w-44 rounded-xl border p-1.5 shadow-2xl z-20 ${
                                darkMode ? "bg-slate-950 border-slate-800 shadow-black/50" : "bg-white border-slate-200 shadow-slate-200"
                              }`}>
                                <button onClick={() => { closeAll(); onView(row); }} className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}>
                                  <Eye size={13} /> View Profile
                                </button>
                                <button onClick={() => { setMoreDropdownId(null); setEditDropdownId(row.id); }} className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg hover:bg-slate-500/5 flex items-center gap-2 ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}>
                                  <Edit2 size={13} /> Edit Plan / Status
                                </button>
                                <div className={`h-px my-1 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
                                <button onClick={() => { onDelete(row.id); closeAll(); }} className="w-full text-left px-2.5 py-2 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center gap-2 transition-colors">
                                  <Trash2 size={13} /> Remove Account
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
