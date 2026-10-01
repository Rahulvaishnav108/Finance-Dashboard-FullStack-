import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { StatusFilter, SortField, SortOrder, DateRange } from "../components/Transactions/Transactiontypes";
import { filterByDateRange, computeMetrics, exportToCSV } from "../utils/transactionUtils";
import TransactionMetrics from "../components/Transactions/Transactionmetrics";
import TransactionControls from "../components/Transactions/Transactioncontrols";
import TransactionTable from "../components/Transactions/Transactiontable";
import TransactionSummaryBar from "../components/Transactions/Transactionsummarybar";
import { transactionData } from "../store/Transactions";
import { useRestaurantRequestsStore } from "../store/RestaurantRequests";

interface LayoutContextType {
  darkMode: boolean;
}

export default function Transactions() {
  const { darkMode } = useOutletContext<LayoutContextType>();
  const approvedRestaurants = useRestaurantRequestsStore((state) => state.restaurants);

  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        if (customEvent.detail.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    window.addEventListener("sync-app-theme", handleThemeSync);
    return () => window.removeEventListener("sync-app-theme", handleThemeSync);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleResetAll = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDateRange("all");
  };

  const linkedTransactions = useMemo(() => {
    const existingRestaurantNames = new Set(
      transactionData.map((transaction) => transaction.restaurant.toLowerCase())
    );

    const placeholderTransactions = approvedRestaurants
      .filter(
        (restaurant) => !existingRestaurantNames.has(restaurant.name.toLowerCase())
      )
      .map((restaurant, index) => ({
        id: `ONB-${restaurant.id}`,
        restaurant: restaurant.name,
        restaurantId: restaurant.id,
        amount: 0,
        commission: 0,
        commissionRate: 0,
        paymentMethod: "UPI / Wallet" as const,
        status: "Pending" as const,
        timestamp: `2026-05-19 18:${String(30 + index).padStart(2, "0")}:00`,
        city: restaurant.location.split(",")[0] || "Onboarding",
        ordersCount: 0,
        note: "Placeholder onboarding transaction until backend order data is connected",
      }));

    return [...placeholderTransactions, ...transactionData];
  }, [approvedRestaurants]);

  const dateFiltered = useMemo(
    () => filterByDateRange(linkedTransactions, dateRange),
    [linkedTransactions, dateRange]
  );

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return dateFiltered.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(q) ||
        tx.restaurant.toLowerCase().includes(q) ||
        tx.city.toLowerCase().includes(q) ||
        tx.restaurantId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchesPayment = paymentFilter === "All" || tx.paymentMethod === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [dateFiltered, searchTerm, statusFilter, paymentFilter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === "timestamp") {
        return sortOrder === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortField === "restaurant") {
        return sortOrder === "asc"
          ? a.restaurant.localeCompare(b.restaurant)
          : b.restaurant.localeCompare(a.restaurant);
      }
      const va = a[sortField] as number;
      const vb = b[sortField] as number;
      return sortOrder === "asc" ? va - vb : vb - va;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  const metrics = useMemo(() => computeMetrics(filteredTransactions), [filteredTransactions]);
  const handleExport = () => exportToCSV(sortedTransactions, "transactions-export.csv");

  return (
    // px-4 on mobile → px-6 on desktop, slightly tighter top padding on mobile
    <div className={`min-h-screen px-4 sm:px-6 py-5 sm:py-8 transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <TransactionMetrics metrics={metrics} darkMode={darkMode} />
      <TransactionControls
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        dateRange={dateRange}
        darkMode={darkMode}
        totalCount={linkedTransactions.length}
        filteredCount={filteredTransactions.length}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPaymentChange={setPaymentFilter}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onResetAll={handleResetAll}
      />
      <TransactionTable
        transactions={sortedTransactions}
        darkMode={darkMode}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <TransactionSummaryBar
        metrics={metrics}
        darkMode={darkMode}
        filteredCount={filteredTransactions.length}
      />
    </div>
  );
}
