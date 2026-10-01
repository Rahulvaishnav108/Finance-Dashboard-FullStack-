import React, { useState } from 'react';
import {
  Search, MapPin, Calendar, Clock, Users,
  CheckCircle, Shield, Smartphone, Gift, Headphones, TrendingUp
} from 'lucide-react';

interface HeroSectionProps {
  onLoginOpen: () => void;
}

const TRENDING_SEARCHES = ['Pizza', 'Buffet', 'Cafe', 'Seafood', 'Fine Dining'];
const SEARCH_TABS = ['Restaurants', 'Dishes', 'Cuisine', 'Location'] as const;

const TRUST_BADGES = [
  { icon: CheckCircle, label: 'Instant Reservations' },
  { icon: Shield, label: 'Verified Restaurants' },
  { icon: Smartphone, label: 'Digital Dining' },
  { icon: Gift, label: 'Exclusive Rewards' },
  { icon: Headphones, label: '24/7 Support' },
];

export default function HeroSection({ onLoginOpen }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<typeof SEARCH_TABS[number]>('Restaurants');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section
      id="home"
      className="relative min-h-[680px] flex flex-col justify-center overflow-hidden"
      style={{
        background: `linear-gradient(90deg, rgba(15,15,15,0.88) 0%, rgba(15,15,15,0.4) 100%), url('/images/landing/hero.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Spacer for fixed navbar */}
      <div className="h-[72px] shrink-0" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-12 lg:py-16 flex-1 flex items-center">
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16">

          {/* Left Content */}
          <div className="flex-1 max-w-[640px]">
            <h1
              className="text-[36px] sm:text-[48px] lg:text-[60px] xl:text-[64px] font-bold leading-[1.1] tracking-tight text-white landing-font-hero"
            >
              Find the best{' '}
              <br className="hidden sm:block" />
              restaurants{' '}
              <span className="italic" style={{ color: '#FF6B1A' }}>near you</span>
            </h1>

            <p
              className="mt-5 text-[16px] sm:text-[18px] leading-relaxed max-w-[520px]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Explore top restaurants, check availability, book a table or order instantly.
            </p>

            {/* Smart Search Module */}
            <div
              className="mt-8 p-4 sm:p-5 w-full max-w-[540px]"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
            >
              {/* Search Tabs */}
              <div className="flex gap-1 mb-3">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 text-[13px] font-medium transition-all duration-150 landing-btn-press"
                    style={{
                      borderRadius: '999px',
                      backgroundColor: activeTab === tab ? '#FF6B1A' : 'transparent',
                      color: activeTab === tab ? '#FFFFFF' : '#666666',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div
                className="flex items-center gap-3 px-4 h-[48px]"
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '14px',
                }}
              >
                <Search className="w-[18px] h-[18px] shrink-0" style={{ color: '#666666' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search for ${activeTab.toLowerCase()}...`}
                  className="flex-1 bg-transparent border-none outline-none text-[14px] placeholder:text-[#999999]"
                  style={{ color: '#222222' }}
                  aria-label={`Search for ${activeTab.toLowerCase()}`}
                />
                <button
                  className="px-4 h-[36px] text-[13px] font-semibold text-white shrink-0 transition-colors duration-150 landing-btn-press"
                  style={{ backgroundColor: '#FF6B1A', borderRadius: '10px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E65A0A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF6B1A'; }}
                >
                  Search
                </button>
              </div>

              {/* Trending Searches */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <TrendingUp className="w-[14px] h-[14px]" style={{ color: '#666666' }} />
                <span className="text-[12px] font-medium" style={{ color: '#666666' }}>Trending:</span>
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    className="px-3 py-1 text-[12px] font-medium transition-all duration-150"
                    style={{
                      borderRadius: '999px',
                      border: '1px solid #E5E7EB',
                      color: '#666666',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B1A';
                      e.currentTarget.style.color = '#FF6B1A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#666666';
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Reservation Widget */}
          <div
            className="w-full lg:w-[400px] xl:w-[420px] shrink-0 p-6 sm:p-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.97)',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 className="text-[22px] font-bold" style={{ color: '#222222' }}>
              Book a Table
            </h3>
            <p className="text-[14px] mt-1" style={{ color: '#666666' }}>
              Find available tables instantly
            </p>

            <div className="space-y-3 mt-5">
              {/* Restaurant Dropdown */}
              <div>
                <label className="text-[12px] font-medium mb-1 block" style={{ color: '#666666' }}>
                  Restaurant
                </label>
                <div
                  className="flex items-center gap-2 px-3 h-[48px]"
                  style={{ border: '1px solid #E5E7EB', borderRadius: '14px' }}
                >
                  <MapPin className="w-[16px] h-[16px] shrink-0" style={{ color: '#FF6B1A' }} />
                  <select
                    className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium appearance-none cursor-pointer"
                    style={{ color: '#222222' }}
                    defaultValue=""
                    aria-label="Select Restaurant"
                  >
                    <option value="" disabled>Select a restaurant</option>
                    <optgroup label="📍 Bandra, Mumbai">
                      <option>Café Mondegar — Bandra West</option>
                      <option>The Table — Bandra West</option>
                      <option>Bastian — Bandra West</option>
                    </optgroup>
                    <optgroup label="📍 Andheri, Mumbai">
                      <option>Burma Burma — Andheri West</option>
                      <option>The Brasserie — Andheri East</option>
                      <option>Pa Pa Ya — Andheri West</option>
                    </optgroup>
                    <optgroup label="📍 Colaba, Mumbai">
                      <option>Leopold Café — Colaba</option>
                      <option>Indigo Deli — Colaba</option>
                    </optgroup>
                    <optgroup label="📍 Lower Parel">
                      <option>Toit — Lower Parel</option>
                      <option>Bayroute — Lower Parel</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: 'Date', placeholder: 'Today' },
                  { icon: Clock, label: 'Time', placeholder: '7:00 PM' },
                  { icon: Users, label: 'Guests', placeholder: '2 People' },
                  { icon: MapPin, label: 'Location', placeholder: 'Mumbai' },
                ].map(({ icon: Icon, label, placeholder }) => (
                  <div key={label}>
                    <label className="text-[12px] font-medium mb-1 block" style={{ color: '#666666' }}>
                      {label}
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 h-[48px] transition-colors duration-150"
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '14px',
                      }}
                    >
                      <Icon className="w-[16px] h-[16px] shrink-0" style={{ color: '#FF6B1A' }} />
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium placeholder:text-[#999999]"
                        style={{ color: '#222222' }}
                        aria-label={label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onLoginOpen}
              className="w-full h-[52px] mt-5 text-[15px] font-semibold text-white transition-colors duration-150 landing-btn-press"
              style={{ backgroundColor: '#FF6B1A', borderRadius: '14px' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E65A0A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF6B1A'; }}
            >
              Find Available Tables
            </button>

            <p className="text-center text-[12px] mt-3" style={{ color: '#666666' }}>
              Free cancellation • Instant confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div
        className="shrink-0 py-4 landing-hide-scrollbar overflow-x-auto"
        style={{
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center gap-8 lg:justify-between min-w-max lg:min-w-0">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Icon className="w-[16px] h-[16px]" style={{ color: '#FF6B1A' }} />
              </div>
              <span className="text-[13px] font-semibold text-white whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
