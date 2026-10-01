import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthProvider";

type LandingHeaderProps = {
  onLoginClick: () => void;
};

export default function LandingHeader({ onLoginClick }: LandingHeaderProps): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Restaurants", href: "#restaurants" },
    { label: "Dishes", href: "#dishes" },
    { label: "Offers", href: "#offers" },
  ];

  if (isAuthenticated && user) {
    navLinks.push({
      label: "Dashboard",
      href: "/customer",
    });
  }

  const handleDashboardClick = () => {
    navigate("/customer");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" data-purpose="site-header">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2" data-purpose="brand-logo">
          <div className="bg-[#FF5722] p-1.5 rounded-lg flex items-center justify-center">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Resto<span className="text-[#FF5722]">Hub</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 font-semibold text-gray-600">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith('#');
            if (isHash) {
              return (
                <a
                  key={link.label}
                  className="hover:text-[#FF5722] transition-colors"
                  href={link.href}
                >
                  {link.label}
                </a>
              );
            } else {
              return (
                <Link
                  key={link.label}
                  className="hover:text-[#FF5722] transition-colors"
                  to={link.href}
                >
                  {link.label}
                </Link>
              );
            }
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <button
              onClick={handleDashboardClick}
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-md shadow-orange-500/10 active:scale-95"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-md shadow-orange-500/10 active:scale-95"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3">
          {isAuthenticated && user ? (
            <button
              onClick={handleDashboardClick}
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              Login
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="bg-white border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl flex flex-col transform origin-top transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              const isHash = link.href.startsWith('#');
              if (isHash) {
                return (
                  <a
                    key={link.label}
                    className="text-gray-800 hover:text-[#FF5722] font-semibold text-lg py-2 border-b border-gray-50 last:border-0"
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={link.label}
                    className="text-gray-800 hover:text-[#FF5722] font-semibold text-lg py-2 border-b border-gray-50 last:border-0"
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              }
            })}
          </div>
        </div>
      )}
    </header>
  );
}
