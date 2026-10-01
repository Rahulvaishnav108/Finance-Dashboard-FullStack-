import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../app/providers/ThemeProvider";
import Navbar from "../features/superAdmin/components/dashboard/Navbar";
import Sidebar from "../features/superAdmin/components/Sidebar";

export default function SuperAdminLayout() {
  // Removed unused signOut variable
  useAuth();

  const { theme: themePreference, setTheme: setThemePreference } = useTheme();

  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (themePreference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [themePreference]);

  const darkMode = themePreference === "dark" || (themePreference === "system" && isSystemDark);

  // Sync state changes with the custom event for any sub-components
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
    window.dispatchEvent(
      new CustomEvent("sync-app-theme", { detail: { darkMode } })
    );
  }, [darkMode]);

  // ── Sidebar collapsed state (persisted) ──────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("superadmin-sidebar-collapsed");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("superadmin-sidebar-collapsed", String(next));
  };

  // ── Mobile sidebar drawer state ──────────────────────────────────────────
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close drawer on window resize to desktop breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // ── Theme toggle ─────────────────────────────────────────────────────────
  const toggleTheme = () => {
    const nextPref = themePreference === "dark" ? "light" : "dark";
    setThemePreference(nextPref);
  };

  return (
    <div
      className={`flex min-h-screen font-sans antialiased transition-colors duration-300 superadmin-panel ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <Sidebar
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <main
        className={`flex-1 min-w-0 flex flex-col overflow-y-auto pt-16 h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        }`}
      >
        {/* ── NAVBAR ────────────────────────────────────────────────────── */}
        <Navbar
          darkMode={darkMode}
          onThemeToggle={toggleTheme}
          onMobileMenuToggle={() => setMobileSidebarOpen((v) => !v)}
          mobileMenuOpen={mobileSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
        <div className="flex-1">
          <Outlet context={{ darkMode, themePreference, setThemePreference }} />
        </div>
      </main>
    </div>
  );
}