import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CUISINES = [
  { name: 'All', emoji: '🍽️' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'North Indian', emoji: '🍛' },
  { name: 'Chinese', emoji: '🍜' },
  { name: 'Italian', emoji: '🍝' },
  { name: 'Cafe', emoji: '☕' },
  { name: 'Desserts', emoji: '🧁' },
  { name: 'Fine Dining', emoji: '🥂' },
  { name: 'Buffet', emoji: '🍱' },
  { name: 'Seafood', emoji: '🦐' },
  { name: 'Street Food', emoji: '🌮' },
  { name: 'Healthy', emoji: '🥗' },
];

export default function CuisineExplorer() {
  const [active, setActive] = useState('All');
  const [vibratingId, setVibratingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (name: string) => {
    setActive(name);
    setVibratingId(name);
    setTimeout(() => setVibratingId(null), 300);
  };


  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
            style={{ color: '#222222' }}
          >
            Explore <span style={{ color: '#FF6B1A' }}>Cuisines</span>
          </h2>
          <p className="text-[15px] mt-1" style={{ color: '#666666' }}>
            What are you craving today?
          </p>
        </div>

        {/* Scrollable Chips */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] rounded-full items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: '#222222',
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto landing-hide-scrollbar py-2 px-1"
          >
            {CUISINES.map((cuisine) => {
              const isActive = active === cuisine.name;
              return (
                <button
                  key={cuisine.name}
                  onClick={() => handleSelect(cuisine.name)}
                  className={`flex items-center gap-2.5 px-5 sm:px-6 py-3 text-[14px] font-medium whitespace-nowrap shrink-0 transition-all duration-300 landing-btn-press ${
                    isActive ? 'landing-chip-active' : ''
                  } ${vibratingId === cuisine.name ? 'landing-btn-vibrate-hover' : ''
                  }`}
                  style={{
                    borderRadius: '999px',
                    backgroundColor: isActive ? '#FF6B1A' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#222222',
                    border: `1px solid ${isActive ? 'transparent' : '#E5E7EB'}`,
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#FF6B1A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span className="text-[20px]">{cuisine.emoji}</span>
                  <span>{cuisine.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] rounded-full items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: '#222222',
            }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
