import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Crown, TrendingUp } from 'lucide-react';
import RestaurantCard, { type Restaurant } from './RestaurantCard';

const RESTAURANTS: Restaurant[] = [
  {
    id: 1, name: 'The Grand Kitchen', cuisine: 'Italian, Continental',
    location: 'Bandra West, Mumbai', image: '/images/landing/restaurant-1.png',
    rating: 4.5, reviewCount: 234, priceLevel: '₹₹₹', distance: '2.3 km',
    waitTime: '15 min', availableTables: 4, currentOffer: '20% OFF first visit', isOpen: true,
  },
  {
    id: 2, name: 'Spice Route', cuisine: 'North Indian, Mughlai',
    location: 'Andheri East, Mumbai', image: '/images/landing/restaurant-2.png',
    rating: 4.7, reviewCount: 567, priceLevel: '₹₹', distance: '1.8 km',
    waitTime: '10 min', availableTables: 6, currentOffer: 'Free Dessert', isOpen: true,
  },
  {
    id: 3, name: 'Ocean Delight', cuisine: 'Seafood, Asian',
    location: 'Juhu, Mumbai', image: '/images/landing/restaurant-3.png',
    rating: 4.6, reviewCount: 389, priceLevel: '₹₹₹', distance: '3.1 km',
    waitTime: '20 min', availableTables: 2, isOpen: true,
  },
  {
    id: 4, name: 'Urban Bites', cuisine: 'American, Cafe',
    location: 'Lower Parel, Mumbai', image: '/images/landing/restaurant-4.png',
    rating: 4.4, reviewCount: 198, priceLevel: '₹', distance: '0.8 km',
    waitTime: '5 min', availableTables: 8, currentOffer: 'Buy 1 Get 1', isOpen: true,
  },
  {
    id: 5, name: 'Bella Italia', cuisine: 'Italian, Pizza',
    location: 'Powai, Mumbai', image: '/images/landing/restaurant-1.png',
    rating: 4.3, reviewCount: 156, priceLevel: '₹₹', distance: '4.2 km',
    waitTime: '12 min', availableTables: 5, currentOffer: '15% OFF weekdays', isOpen: true,
  },
  {
    id: 6, name: 'Dragon Palace', cuisine: 'Chinese, Thai',
    location: 'Colaba, Mumbai', image: '/images/landing/restaurant-3.png',
    rating: 4.5, reviewCount: 312, priceLevel: '₹₹₹', distance: '5.0 km',
    waitTime: '25 min', availableTables: 3, isOpen: true,
  },
  {
    id: 7, name: 'The Coffee House', cuisine: 'Cafe, Bakery',
    location: 'Dadar, Mumbai', image: '/images/landing/restaurant-4.png',
    rating: 4.2, reviewCount: 89, priceLevel: '₹', distance: '1.5 km',
    waitTime: '0 min', availableTables: 12, isOpen: true,
  },
  {
    id: 8, name: 'Royal Biryani House', cuisine: 'Hyderabadi, Mughlai',
    location: 'Kurla, Mumbai', image: '/images/landing/restaurant-2.png',
    rating: 4.8, reviewCount: 678, priceLevel: '₹₹', distance: '2.0 km',
    waitTime: '30 min', availableTables: 1, currentOffer: 'Flat ₹100 OFF', isOpen: true,
  },
];

interface TrendingRestaurantsProps {
  onLoginOpen: () => void;
}

function ScrollableRow({ restaurants, onLoginOpen, rowRef }: {
  restaurants: Restaurant[];
  onLoginOpen: () => void;
  rowRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={rowRef as React.RefObject<HTMLDivElement>}
      className="flex gap-5 overflow-x-auto landing-hide-scrollbar pb-2"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="min-w-[300px] sm:min-w-[320px] lg:min-w-[340px] flex-shrink-0"
          style={{ scrollSnapAlign: 'start' }}
        >
          <RestaurantCard restaurant={restaurant} onLoginOpen={onLoginOpen} />
        </div>
      ))}
    </div>
  );
}

export default function TrendingRestaurants({ onLoginOpen }: TrendingRestaurantsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isParticlesActive, setIsParticlesActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollRow = (rowRef: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir === 'left' ? -350 : 350, behavior: 'smooth' });
    }
  };

  const handleViewAllHover = () => {
    setIsParticlesActive(true);
    setTimeout(() => setIsParticlesActive(false), 700);
  };

  const row1 = RESTAURANTS.slice(0, 4);
  const row2 = RESTAURANTS.slice(4, 8);

  return (
    <section
      id="restaurants"
      className={`py-12 sm:py-16 ${isVisible ? '' : ''}`}
      ref={ref}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold landing-font-hero"
              style={{ color: '#222222' }}
            >
              Trending <span style={{ color: '#FF6B1A' }}>Restaurants</span>
            </h2>
            <p className="text-[15px] mt-1" style={{ color: '#666666' }}>
              Handpicked top-rated restaurants near you
            </p>
          </div>

          {/* View All Button with Particles */}
          <div className="relative hidden sm:block">
            <button
              onMouseEnter={handleViewAllHover}
              className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold transition-all duration-200 landing-btn-vibrate-hover landing-btn-premium landing-focus-ring"
              style={{
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #FF6B1A, #E65A0A)',
                borderRadius: '14px',
              }}
            >
              View All
              <ChevronRight className="w-[16px] h-[16px]" />
            </button>

            {/* Particles */}
            <div className={`absolute inset-0 pointer-events-none ${isParticlesActive ? 'landing-particles-active' : ''}`}>
              <span className="landing-particle" style={{ top: '50%', left: '50%' }} />
              <span className="landing-particle" style={{ top: '30%', left: '40%', background: '#FF8C42' }} />
              <span className="landing-particle" style={{ top: '60%', left: '60%', background: '#E65A0A' }} />
              <span className="landing-particle" style={{ top: '20%', left: '70%', width: '4px', height: '4px' }} />
              <span className="landing-particle" style={{ top: '70%', left: '30%', background: '#FFB74D', width: '3px', height: '3px' }} />
              <span className="landing-particle" style={{ top: '40%', left: '80%', background: '#FF6B1A', width: '6px', height: '6px' }} />
            </div>
          </div>
        </div>

        {/* Row 1 */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 px-4 py-1.5" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.1), rgba(255,107,26,0.05))', borderRadius: '999px', border: '1px solid rgba(255,107,26,0.15)' }}>
              <Crown className="w-[15px] h-[15px]" style={{ color: '#FF6B1A' }} />
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#FF6B1A' }}>
                Featured Selection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollRow(row1Ref, 'left')}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-150"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
                aria-label="Scroll row 1 left"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                onClick={() => scrollRow(row1Ref, 'right')}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-150"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
                aria-label="Scroll row 1 right"
              >
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
          <ScrollableRow restaurants={row1} onLoginOpen={onLoginOpen} rowRef={row1Ref} />
        </div>

        {/* Row 2 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 px-4 py-1.5" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.1), rgba(255,107,26,0.05))', borderRadius: '999px', border: '1px solid rgba(255,107,26,0.15)' }}>
              <TrendingUp className="w-[15px] h-[15px]" style={{ color: '#FF6B1A' }} />
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#FF6B1A' }}>
                Popular Near You
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollRow(row2Ref, 'left')}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-150"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
                aria-label="Scroll row 2 left"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                onClick={() => scrollRow(row2Ref, 'right')}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-150"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
                aria-label="Scroll row 2 right"
              >
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
          <ScrollableRow restaurants={row2} onLoginOpen={onLoginOpen} rowRef={row2Ref} />
        </div>

        {/* Mobile View All */}
        <div className="sm:hidden mt-6 text-center">
          <button
            className="text-[14px] font-semibold px-6 py-3 transition-colors duration-150 landing-btn-premium"
            style={{
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #FF6B1A, #E65A0A)',
              borderRadius: '14px',
            }}
          >
            View All Restaurants
          </button>
        </div>
      </div>
    </section>
  );
}
