import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, ChevronDown, Search, Filter, Flame, Crown, TrendingUp, Utensils } from 'lucide-react';
import '../components/landing/landing.css';
import LandingFooter from '../components/landing/LandingFooter';

const AREAS = ['All Areas', 'Bandra', 'Andheri', 'Colaba', 'Lower Parel', 'Juhu', 'Powai', 'Dadar'];
const CUISINES = ['All', 'Indian', 'Italian', 'Chinese', 'Japanese', 'Continental', 'Mexican', 'Thai'];
const SORT_OPTIONS = ['Relevance', 'Rating: High to Low', 'Distance', 'Cost: Low to High', 'Cost: High to Low'];

interface RestaurantData {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  area: string;
  distance: string;
  time: string;
  priceRange: string;
  tables: number;
  offer?: string;
  image: string;
  veg: boolean;
  tags: string[];
}

const RESTAURANTS: RestaurantData[] = [
  { id: 1, name: 'Burger Barn', cuisine: 'Fast Food, Burgers, American', rating: 4.3, reviews: 645, area: 'Bandra', distance: '0.6 km', time: '5-10 mins', priceRange: '₹300-500', tables: 15, offer: 'Flat 15% OFF', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop', veg: false, tags: ['Popular', 'Family'] },
  { id: 2, name: 'Café Heights', cuisine: 'Cafe, Italian, Continental', rating: 4.3, reviews: 645, area: 'Andheri', distance: '0.5 km', time: '15-30 mins', priceRange: '₹400-700', tables: 8, offer: 'Flat 15% OFF', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&fit=crop', veg: false, tags: ['Trending', 'Date Night'] },
  { id: 3, name: 'Spice Garden', cuisine: 'Indian, North Indian, Mughlai', rating: 4.6, reviews: 1200, area: 'Colaba', distance: '1.2 km', time: '20-35 mins', priceRange: '₹500-900', tables: 12, offer: '20% OFF on first order', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop', veg: false, tags: ['Top Rated', 'Fine Dining'] },
  { id: 4, name: 'Green Leaf', cuisine: 'Vegan, Healthy, Salads', rating: 4.5, reviews: 380, area: 'Juhu', distance: '2.1 km', time: '15-25 mins', priceRange: '₹250-450', tables: 6, image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&auto=format&fit=crop', veg: true, tags: ['Pure Veg', 'Healthy'] },
  { id: 5, name: 'Tokyo Express', cuisine: 'Japanese, Sushi, Asian', rating: 4.7, reviews: 890, area: 'Lower Parel', distance: '3.0 km', time: '25-40 mins', priceRange: '₹800-1500', tables: 4, offer: 'Free Miso Soup', image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&auto=format&fit=crop', veg: false, tags: ['Premium', 'Top Rated'] },
  { id: 6, name: 'Pizza Paradise', cuisine: 'Italian, Pizza, Pasta', rating: 4.2, reviews: 520, area: 'Powai', distance: '1.8 km', time: '20-30 mins', priceRange: '₹350-600', tables: 10, offer: 'Buy 1 Get 1', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop', veg: false, tags: ['Popular', 'Family'] },
  { id: 7, name: 'Tandoori Nights', cuisine: 'Indian, Tandoori, Kebabs', rating: 4.4, reviews: 710, area: 'Bandra', distance: '0.8 km', time: '10-20 mins', priceRange: '₹400-800', tables: 18, image: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=400&auto=format&fit=crop', veg: false, tags: ['Trending', 'Non-Veg'] },
  { id: 8, name: 'The Veg Table', cuisine: 'South Indian, Dosa, Thali', rating: 4.1, reviews: 290, area: 'Dadar', distance: '2.5 km', time: '15-25 mins', priceRange: '₹200-350', tables: 20, offer: 'Flat ₹50 OFF', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop', veg: true, tags: ['Pure Veg', 'Budget'] },
  { id: 9, name: 'China Box', cuisine: 'Chinese, Asian, Wok', rating: 4.0, reviews: 450, area: 'Andheri', distance: '1.0 km', time: '15-20 mins', priceRange: '₹300-550', tables: 7, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&auto=format&fit=crop', veg: false, tags: ['Quick Bites'] },
];

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [vegOnly, setVegOnly] = useState(false);

  const navigate = useNavigate();

  const filtered = RESTAURANTS.filter((r) => {
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedArea !== 'All Areas' && r.area !== selectedArea) return false;
    if (selectedCuisine !== 'All' && !r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())) return false;
    if (vegOnly && !r.veg) return false;
    return true;
  });

  return (
    <div className="min-h-screen landing-font-inter" style={{ background: 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)', color: '#FFFFFF' }}>

      {/* ── Top Bar with Back Arrow ────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-[64px] flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B1A' }}>
              <span className="material-symbols-outlined text-[15px] font-bold text-white block">restaurant</span>
            </div>
            <span className="font-bold text-[18px] text-white">Resto<span style={{ color: '#FF6B1A' }}>Hub</span></span>
          </div>
          <div className="ml-auto text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {filtered.length} restaurants found
          </div>
        </div>
      </header>

      {/* ── Hero Banner ──────────────────────────────────── */}
      <section
        className="relative py-16 sm:py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(15,12,8,0.92) 0%, rgba(15,15,15,0.85) 50%, rgba(15,12,8,0.92) 100%), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Floating food emoji illustrations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { emoji: '🍕', top: '8%', left: '5%', size: 55, rotate: -15, delay: 0 },
            { emoji: '🍔', top: '65%', right: '6%', size: 50, rotate: 12, delay: 1.2 },
            { emoji: '🍣', top: '20%', right: '12%', size: 48, rotate: -8, delay: 0.5 },
            { emoji: '☕', bottom: '10%', left: '8%', size: 45, rotate: 10, delay: 1.8 },
            { emoji: '🥗', top: '50%', left: '3%', size: 42, rotate: 18, delay: 0.8 },
            { emoji: '🍜', bottom: '18%', right: '15%', size: 44, rotate: -12, delay: 1.5 },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute select-none landing-stamp-float"
              style={{
                top: item.top, left: item.left, right: (item as any).right, bottom: (item as any).bottom,
                fontSize: `${item.size}px`,
                transform: `rotate(${item.rotate}deg)`,
                opacity: 0.08,
                animationDelay: `${item.delay}s`,
              }}
            >{item.emoji}</div>
          ))}
          {/* Glowing orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full landing-glow-orb" style={{ background: 'radial-gradient(circle, rgba(255,107,26,0.1) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.15), rgba(255,107,26,0.06))', borderRadius: '999px', border: '1px solid rgba(255,107,26,0.2)' }}>
            <Crown className="w-[14px] h-[14px]" style={{ color: '#FF6B1A' }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#FF6B1A' }}>Handpicked For You</span>
          </div>

          <h1 className="text-[32px] sm:text-[42px] lg:text-[56px] font-bold landing-font-hero leading-[1.1]">
            Top Restaurants <span className="italic" style={{ color: '#FF6B1A' }}>Near you</span>
          </h1>
          <p className="text-[15px] sm:text-[17px] mt-3 max-w-[500px] mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Handpicked restaurants for the best dining experience
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
            {[
              { value: `${RESTAURANTS.length * 12}+`, label: 'Restaurants' },
              { value: '4.5+', label: 'Avg Rating' },
              { value: 'Live', label: 'Availability' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[22px] sm:text-[28px] font-bold" style={{ color: '#FF6B1A' }}>{stat.value}</div>
                <div className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="sticky top-[64px] z-40" style={{ background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3 flex items-center gap-3 overflow-x-auto landing-hide-scrollbar">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 h-[40px] shrink-0 min-w-[200px]" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Search className="w-[15px] h-[15px]" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-white/30"
            />
          </div>

          {/* Area */}
          <div className="flex items-center gap-1.5 px-3 h-[40px] shrink-0" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <MapPin className="w-[14px] h-[14px]" style={{ color: '#FF6B1A' }} />
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="bg-transparent outline-none text-[13px] text-white cursor-pointer appearance-none pr-4" style={{ backgroundImage: 'none' }}>
              {AREAS.map((a) => <option key={a} value={a} style={{ background: '#1A1A1A' }}>{a}</option>)}
            </select>
            <ChevronDown className="w-[13px] h-[13px] -ml-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>

          {/* Cuisine */}
          <div className="flex items-center gap-1.5 px-3 h-[40px] shrink-0" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Utensils className="w-[14px] h-[14px]" style={{ color: '#FF6B1A' }} />
            <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} className="bg-transparent outline-none text-[13px] text-white cursor-pointer appearance-none pr-4">
              {CUISINES.map((c) => <option key={c} value={c} style={{ background: '#1A1A1A' }}>{c}</option>)}
            </select>
            <ChevronDown className="w-[13px] h-[13px] -ml-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 px-3 h-[40px] shrink-0" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Filter className="w-[14px] h-[14px]" style={{ color: '#FF6B1A' }} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent outline-none text-[13px] text-white cursor-pointer appearance-none pr-4">
              {SORT_OPTIONS.map((s) => <option key={s} value={s} style={{ background: '#1A1A1A' }}>{s}</option>)}
            </select>
            <ChevronDown className="w-[13px] h-[13px] -ml-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>

          {/* Veg Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className="flex items-center gap-1.5 px-3 h-[40px] shrink-0 text-[13px] font-medium transition-all duration-150"
            style={{
              borderRadius: '12px',
              border: `1px solid ${vegOnly ? '#4CAF50' : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: vegOnly ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
              color: vegOnly ? '#4CAF50' : 'rgba(255,255,255,0.6)',
            }}
          >
            🌿 Veg Only
          </button>
        </div>
      </div>

      {/* ── Restaurant Grid ──────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group landing-card-hover landing-shiny overflow-hidden"
              style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                {r.tables > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full" style={{ backgroundColor: 'rgba(76,175,80,0.9)', color: '#FFFFFF' }}>
                    {r.tables} Tables Available
                  </span>
                )}
                {r.tags.length > 0 && (
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {r.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase" style={{ backgroundColor: 'rgba(255,107,26,0.85)', color: '#FFF' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[18px] font-bold text-white leading-tight">{r.name}</h3>
                  <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,107,26,0.15)' }}>
                    <Star className="w-[13px] h-[13px] fill-current" style={{ color: '#FF6B1A' }} />
                    <span className="text-[13px] font-bold" style={{ color: '#FF6B1A' }}>{r.rating}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>({r.reviews})</span>
                  </div>
                </div>

                <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.cuisine}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{r.area} • {r.priceRange}</p>

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <Clock className="w-[13px] h-[13px]" style={{ color: '#FF6B1A' }} /> {r.time}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <MapPin className="w-[13px] h-[13px]" style={{ color: '#FF6B1A' }} /> {r.distance}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {r.offer ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#4CAF50' }}>
                      <Flame className="w-[13px] h-[13px]" /> {r.offer}
                    </span>
                  ) : <span />}
                  <button
                    className="px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 landing-btn-premium"
                    style={{ background: 'linear-gradient(135deg, #FF6B1A, #E65A0A)', borderRadius: '10px' }}
                  >
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[18px] font-semibold text-white">No restaurants found</p>
            <p className="text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
