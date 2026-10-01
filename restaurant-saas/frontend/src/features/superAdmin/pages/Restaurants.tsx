// pages/Restaurants.tsx
// Fully responsive restaurants management page

import { useState, useEffect, useMemo } from "react";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";
import type {
  RestaurantsRow,
  StatusFilter,
  NewRestaurantForm,
} from "../components/Restaurants/Restauranttypes";

import MetricCards from "../components/Restaurants/Metriccards";
import FilterBar from "../components/Restaurants/Filterbar";
import RestaurantTable from "../components/Restaurants/RestaurantTable";
import ViewModal from "../components/Restaurants/Viewmodal";
import AddRestaurantModal from "../components/Restaurants/AddRestaurantModal";

const DEFAULT_FORM: NewRestaurantForm = {
  name: "",
  owner: "",
  email: "",
  phone: "",
  location: "",
  plan: "Basic",
  status: "Trial",
  revenue: "₹0",
  branches: 1,
};

export default function Restaurant() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved ? saved === "dark" : false;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const restaurants = useRestaurantRequestsStore((state) => state.restaurants);
  const addRestaurant = useRestaurantRequestsStore((state) => state.addRestaurant);
  const updateRestaurantStatus = useRestaurantRequestsStore(
    (state) => state.updateRestaurantStatus
  );
  const updateRestaurantPlan = useRestaurantRequestsStore(
    (state) => state.updateRestaurantPlan
  );
  const deleteRestaurantById = useRestaurantRequestsStore(
    (state) => state.deleteRestaurant
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<RestaurantsRow | null>(null);
  const [newRestaurant, setNewRestaurant] = useState<NewRestaurantForm>(DEFAULT_FORM);

  // Sync dark mode from parent layout
  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const custom = e as CustomEvent<{ darkMode: boolean }>;
      if (custom.detail !== undefined) setDarkMode(custom.detail.darkMode);
    };
    window.addEventListener("sync-app-theme", handleThemeSync);
    return () => window.removeEventListener("sync-app-theme", handleThemeSync);
  }, []);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setViewingRestaurant(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => ({
    total: restaurants.length,
    active: restaurants.filter((r) => r.status === "Active").length,
    trial: restaurants.filter((r) => r.status === "Trial").length,
    branches: restaurants.reduce((acc, r) => acc + r.branches, 0),
  }), [restaurants]);

  // Filter restaurants based on search and status
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [restaurants, searchQuery, statusFilter]);

  // Update restaurant status
  const updateStatus = (id: string, status: "Active" | "Trial" | "Inactive") =>
    updateRestaurantStatus(id, status);

  // Update restaurant plan
  const updatePlan = (id: string, plan: "Premium" | "Standard" | "Basic") =>
    updateRestaurantPlan(id, plan);

  // Delete restaurant
  const deleteRestaurant = (id: string) =>
    deleteRestaurantById(id);

  // Handle form submission for new restaurant
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurant.name || !newRestaurant.owner) return;

    const row: RestaurantsRow = {
      id: `RST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newRestaurant.name,
      owner: newRestaurant.owner,
      email: newRestaurant.email || "info@restaurant.com",
      phone: newRestaurant.phone || "+1 (555) 000-0000",
      location: newRestaurant.location || "Remote Deployment Location",
      plan: newRestaurant.plan,
      status: newRestaurant.status,
      revenue: newRestaurant.revenue.startsWith("₹")
        ? newRestaurant.revenue
        : `₹${newRestaurant.revenue}`,
      branches: Number(newRestaurant.branches) || 1,
    };

    addRestaurant(row);
    setIsModalOpen(false);
    setNewRestaurant(DEFAULT_FORM);
  };

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Restaurant Management
        </h1>
        <p
          className={`text-sm mt-1 ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Monitor and manage all restaurant accounts
        </p>
      </div>

      {/* Metric Cards */}
      <MetricCards
        metrics={metrics}
        statusFilter={statusFilter}
        darkMode={darkMode}
        onFilterChange={setStatusFilter}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        darkMode={darkMode}
        onSearchChange={setSearchQuery}
        onResetFilter={() => setStatusFilter("All")}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Restaurant Table/Cards */}
      <RestaurantTable
        restaurants={filteredRestaurants}
        darkMode={darkMode}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onView={setViewingRestaurant}
        onUpdateStatus={updateStatus}
        onUpdatePlan={updatePlan}
        onDelete={deleteRestaurant}
        onResetFilters={() => {
          setSearchQuery("");
          setStatusFilter("All");
        }}
      />

      {/* View Restaurant Modal */}
      {viewingRestaurant && (
        <ViewModal
          restaurant={viewingRestaurant}
          darkMode={darkMode}
          onClose={() => setViewingRestaurant(null)}
        />
      )}

      {/* Add Restaurant Modal */}
      {isModalOpen && (
        <AddRestaurantModal
          darkMode={darkMode}
          formData={newRestaurant}
          onChange={(data) => setNewRestaurant((prev) => ({ ...prev, ...data }))}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
