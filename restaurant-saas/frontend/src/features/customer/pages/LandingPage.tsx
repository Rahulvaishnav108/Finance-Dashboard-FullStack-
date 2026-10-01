import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import {
  LandingNavbar,
  HeroSection,
  LiveAvailabilityStrip,
  CuisineExplorer,
  TrendingRestaurants,
  TrendingDishes,
  OffersDeals,
  DigitalDiningJourney,
  WhyChooseSection,
  BlogSection,
  TestimonialsSection,
  LandingFooter
} from '../components/landing';
import '../components/landing/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const openLogin = () => {
    navigate('/auth/customer');
  };

  return (
    <div className="landing-page-container min-h-screen bg-neutral-50 font-sans relative overflow-hidden">
      <LandingNavbar onLoginOpen={openLogin} />

      <HeroSection onLoginOpen={openLogin} />

      <LiveAvailabilityStrip />

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <CuisineExplorer />
      </div>

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <TrendingRestaurants onLoginOpen={openLogin} />
      </div>

      <TrendingDishes onLoginOpen={openLogin} />



      <OffersDeals />

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <DigitalDiningJourney />
      </div>

      <WhyChooseSection />



      <div style={{ backgroundColor: '#FFFFFF' }}>
        <BlogSection />
      </div>

      <TestimonialsSection />

      <LandingFooter />

      {/* Floating QR Scanner Button */}
      {/* Desktop: Right center */}
      <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <button
          className="group flex flex-col items-center gap-2 p-4 transition-all duration-300 hover:scale-105"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(15,15,15,0.75) 0%, rgba(30,20,10,0.7) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,107,26,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 20px rgba(255,107,26,0.1)',
          }}
          aria-label="Scan QR Code"
        >
          <div
            className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #FF6B1A 0%, #E65A0A 100%)',
              boxShadow: '0 4px 15px rgba(255,107,26,0.4)',
            }}
          >
            <QrCode className="w-[24px] h-[24px] text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white opacity-70">
            Scan QR
          </span>
        </button>
      </div>

      {/* Mobile: Bottom center */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          className="flex items-center justify-center w-[60px] h-[60px] transition-all duration-300"
          style={{
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20,15,10,0.8) 0%, rgba(30,20,10,0.75) 100%)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            border: '1.5px solid rgba(255,107,26,0.3)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.3), 0 0 24px rgba(255,107,26,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
          aria-label="Scan QR Code"
        >
          <QrCode className="w-[26px] h-[26px]" style={{ color: '#FF6B1A' }} />
        </button>
      </div>
    </div>
  );
}
