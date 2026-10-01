// pages/Subscriptions.tsx
// Main orchestrator — all state lives here; components are pure/presentational.

import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";

import type {
  RestaurantNode,
  StatusFilter,
  TierFilter,
  SortField,
  SortOrder,
  PlanType,
  StatusType,
  NewRestaurantForm,
} from "../components/Subscriptions/Subcriptiontypes";

import { restaurantData } from "../store/Subscriptions";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";
import { computeTierMetrics, exportToCSV, parseRevenue, generateId, formatCurrency } from "../utils/Subscriptionutils";

import TierCards from "../components/Subscriptions/Tiercards";
import SubscriptionControls from "../components/Subscriptions/Subscriptioncontrols";
import SubscriptionTable from "../components/Subscriptions/Subcriptiontable";
import ViewModal from "../components/Subscriptions/Viewmodal";
import AddRestaurantModal from "../components/Subscriptions/Addrestaurantmodal";

const EMPTY_FORM: NewRestaurantForm = {
  name: "", owner: "", email: "", phone: "",
  location: "", plan: "Basic", status: "Trial",
  revenue: "₹0", branches: 1, tags: "",
};

const PLAN_ORDER: Record<PlanType, number> = { Basic: 0, Standard: 1, Premium: 2, Enterprise: 3 };
const STATUS_ORDER: Record<StatusType, number> = { Active: 0, Trial: 1, Inactive: 2 };

export default function Subscriptions() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved ? saved === "dark" : false;
    }
    return false;
  });

  // ── Modal state ───────────────────────────────────────────────────────────
  const [viewingNode, setViewingNode] = useState<RestaurantNode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewRestaurantForm>(EMPTY_FORM);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ darkMode: boolean }>;
      if (ce.detail !== undefined) setDarkMode(ce.detail.darkMode);
    };
    window.addEventListener("sync-app-theme", handler);
    return () => window.removeEventListener("sync-app-theme", handler);
  }, []);

  // Global Escape closes all modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewingNode(null);
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Data state ────────────────────────────────────────────────────────────
  const [restaurants, setRestaurants] = useState<RestaurantNode[]>(restaurantData);
  const approvedRestaurants = useRestaurantRequestsStore((state) => state.restaurants);
  const updateApprovedRestaurantStatus = useRestaurantRequestsStore(
    (state) => state.updateRestaurantStatus
  );
  const updateApprovedRestaurantPlan = useRestaurantRequestsStore(
    (state) => state.updateRestaurantPlan
  );
  const deleteApprovedRestaurant = useRestaurantRequestsStore(
    (state) => state.deleteRestaurant
  );

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [tierFilter, setTierFilter] = useState<TierFilter>("All");

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const updateStatus = (id: string, status: StatusType) => {
    updateApprovedRestaurantStatus(id, status);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updatePlan = (id: string, plan: PlanType) => {
    if (plan !== "Enterprise") updateApprovedRestaurantPlan(id, plan);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, plan } : r)));
  };

  const deleteNode = (id: string) => {
    deleteApprovedRestaurant(id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.owner.trim()) return;

    const newNode: RestaurantNode = {
      id: generateId(),
      name: formData.name.trim(),
      owner: formData.owner.trim(),
      email: formData.email.trim() || "info@restaurant.com",
      phone: formData.phone.trim() || "+1 (555) 000-0000",
      location: formData.location.trim() || "Location TBD",
      plan: formData.plan,
      status: formData.status,
      revenue: formData.revenue.startsWith("₹") ? formData.revenue : `₹${formData.revenue}`,
      branches: Math.max(1, Number(formData.branches) || 1),
      joinedDate: new Date().toISOString().slice(0, 10),
      lastActive: new Date().toISOString().slice(0, 10),
      tags: formData.tags
        ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
    };

    setRestaurants((prev) => [newNode, ...prev]);
    setIsAddModalOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTierFilter("All");
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const linkedRestaurants = useMemo<RestaurantNode[]>(() => {
    const existingKeys = new Set(
      restaurants.flatMap((restaurant) => [
        restaurant.id.toLowerCase(),
        restaurant.name.toLowerCase(),
      ])
    );

    const approvedSubscriptionRows = approvedRestaurants
      .filter(
        (restaurant) =>
          !existingKeys.has(restaurant.id.toLowerCase()) &&
          !existingKeys.has(restaurant.name.toLowerCase())
      )
      .map<RestaurantNode>((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        owner: restaurant.owner,
        email: restaurant.email,
        phone: restaurant.phone,
        location: restaurant.location,
        plan: restaurant.plan,
        status: restaurant.status,
        revenue: restaurant.revenue,
        branches: restaurant.branches,
        joinedDate: new Date().toISOString().slice(0, 10),
        lastActive: new Date().toISOString().slice(0, 10),
        tags: ["New Request", "Placeholder"],
      }));

    return [...approvedSubscriptionRows, ...restaurants];
  }, [approvedRestaurants, restaurants]);

  const tierMetrics = useMemo(() => computeTierMetrics(linkedRestaurants), [linkedRestaurants]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return linkedRestaurants.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchTier = tierFilter === "All" || r.plan === tierFilter;
      return matchSearch && matchStatus && matchTier;
    });
  }, [linkedRestaurants, searchQuery, statusFilter, tierFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":     return dir * a.name.localeCompare(b.name);
        case "revenue":  return dir * (parseRevenue(a.revenue) - parseRevenue(b.revenue));
        case "branches": return dir * (a.branches - b.branches);
        case "plan":     return dir * (PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan]);
        case "status":   return dir * (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        default:         return 0;
      }
    });
  }, [filtered, sortField, sortOrder]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen px-6 py-8 transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Subscriptions
          </h1>
          <p className={`text-sm mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Manage restaurant accounts, plans, and billing across the platform.
          </p>
        </div>

        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shrink-0 ${
          darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <BarChart3 size={15} className="text-orange-500" />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Platform MRR</span>
          <span className="text-emerald-500 font-extrabold text-sm">
            {formatCurrency(tierMetrics.totalRevenue)}
          </span>
        </div>
      </div>

      {/* Tier Cards */}
      <TierCards
        metrics={tierMetrics}
        tierFilter={tierFilter}
        darkMode={darkMode}
        onTierChange={setTierFilter}
      />

      {/* Controls */}
      <SubscriptionControls
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        tierFilter={tierFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        darkMode={darkMode}
        totalCount={linkedRestaurants.length}
        filteredCount={filtered.length}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={handleSort}
        onExport={() => exportToCSV(sorted)}
        onResetAll={handleResetAll}
        onAddClick={() => { setFormData(EMPTY_FORM); setIsAddModalOpen(true); }}
      />

      {/* Table */}
      <SubscriptionTable
        restaurants={sorted}
        darkMode={darkMode}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        tierFilter={tierFilter}
        onView={setViewingNode}
        onUpdateStatus={updateStatus}
        onUpdatePlan={updatePlan}
        onDelete={deleteNode}
        onResetFilters={handleResetAll}
      />

      {/* Summary footer */}
      <div className={`mt-4 px-5 py-3 rounded-xl border flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs ${
        darkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-slate-50 border-slate-200/60"
      }`}>
        <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
          Showing <span className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{sorted.length}</span> of{" "}
          <span className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{linkedRestaurants.length}</span> restaurants
        </span>
        <div className={`h-4 w-px ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />
        <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
          <span className="font-bold text-emerald-500">{filtered.filter(r => r.status === "Active").length}</span> active ·{" "}
          <span className="font-bold text-amber-500">{filtered.filter(r => r.status === "Trial").length}</span> trial ·{" "}
          <span className={`font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{filtered.filter(r => r.status === "Inactive").length}</span> inactive
        </span>
        <div className={`h-4 w-px ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />
        <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
          Revenue in view: <span className="font-bold text-blue-500">
            {formatCurrency(filtered.reduce((s, r) => s + parseRevenue(r.revenue), 0))}
          </span>
        </span>
      </div>

      {/* View Modal */}
      {viewingNode && (
        <ViewModal
          restaurant={viewingNode}
          darkMode={darkMode}
          onClose={() => setViewingNode(null)}
          onEditClick={() => {
            setViewingNode(null);
          }}
        />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddRestaurantModal
          darkMode={darkMode}
          formData={formData}
          onChange={(partial) => setFormData((prev) => ({ ...prev, ...partial }))}
          onSubmit={handleAddSubmit}
          onClose={() => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); }}
        />
      )}

    </div>
  );
}
