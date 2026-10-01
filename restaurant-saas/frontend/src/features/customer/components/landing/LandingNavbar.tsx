import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronRight } from 'lucide-react';
import './landing.css';

interface LandingNavbarProps {
  onLoginOpen: () => void;
}

interface NavLink {
  label: string;
  href: string;
  requiresAuth: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Restaurants', href: '/customer/restaurants', requiresAuth: false },
  { label: 'Reservations', href: '/customer/reservations', requiresAuth: true },
  { label: 'Offers', href: '/customer/offers', requiresAuth: false },
];

export default function LandingNavbar({ onLoginOpen }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, link: NavLink) => {
    e.preventDefault();
    if (link.requiresAuth) {
      onLoginOpen();
    } else {
      navigate(link.href);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'landing-navbar-scrolled' : ''
        }`}
        style={{
          background: isScrolled
            ? undefined
            : 'linear-gradient(135deg, rgba(15,15,15,0.85) 0%, rgba(30,20,10,0.75) 50%, rgba(15,15,15,0.85) 100%)',
          backdropFilter: isScrolled ? undefined : 'blur(12px) saturate(150%)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 landing-focus-ring">
            <div
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#FF6B1A', boxShadow: '0 0 14px rgba(255,107,26,0.35)' }}
            >
              <span className="material-symbols-outlined text-[18px] font-bold text-white block">restaurant</span>
            </div>
            <span className="font-bold text-[20px] tracking-tight text-white">
              Resto<span style={{ color: '#FF6B1A' }}>Hub</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="landing-nav-capsule text-[14px] font-medium landing-focus-ring relative z-10 flex items-center gap-1.5"
                style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B1A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                {link.label}
                {link.requiresAuth && (
                  <span
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ backgroundColor: 'rgba(255,107,26,0.5)' }}
                    title="Login required"
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors duration-150 landing-focus-ring"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              className="hidden sm:flex w-[40px] h-[40px] rounded-full items-center justify-center transition-colors duration-150 landing-focus-ring relative"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span
                className="absolute top-[8px] right-[8px] w-[8px] h-[8px] rounded-full landing-pulse-dot"
                style={{ backgroundColor: '#FF6B1A' }}
              />
            </button>

            <button
              onClick={onLoginOpen}
              className="hidden sm:flex items-center gap-2 px-5 h-[42px] text-[14px] font-semibold text-white transition-all duration-150 landing-btn-premium landing-focus-ring"
              style={{
                background: 'linear-gradient(135deg, #FF6B1A 0%, #E65A0A 100%)',
                borderRadius: '14px',
                boxShadow: '0 4px 15px rgba(255,107,26,0.3)',
              }}
            >
              Login / Sign Up
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors duration-150 landing-focus-ring"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-[20px] h-[20px]" /> : <Menu className="w-[20px] h-[20px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1008 100%)' }}
        >
          <div className="flex items-center justify-between px-6 h-[72px]">
            <a href="/" className="flex items-center gap-2.5">
              <div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FF6B1A' }}
              >
                <span className="material-symbols-outlined text-[18px] font-bold text-white block">restaurant</span>
              </div>
              <span className="font-bold text-[20px] tracking-tight text-white">
                Resto<span style={{ color: '#FF6B1A' }}>Hub</span>
              </span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              aria-label="Close menu"
            >
              <X className="w-[20px] h-[20px]" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center px-8 overflow-y-auto py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between py-3.5 text-[20px] font-semibold text-white border-b transition-colors duration-150"
                style={{ borderColor: 'rgba(255,255,255,0.1)', textDecoration: 'none' }}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.requiresAuth && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}>
                      Login
                    </span>
                  )}
                </span>
                <ChevronRight className="w-[18px] h-[18px]" style={{ color: '#FF6B1A' }} />
              </a>
            ))}
          </nav>

          <div className="px-8 pb-8 shrink-0">
            <button
              onClick={() => { onLoginOpen(); setIsMobileMenuOpen(false); }}
              className="w-full h-[52px] text-[16px] font-semibold text-white landing-btn-premium"
              style={{ background: 'linear-gradient(135deg, #FF6B1A 0%, #E65A0A 100%)', borderRadius: '14px' }}
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      )}
    </>
  );
}
