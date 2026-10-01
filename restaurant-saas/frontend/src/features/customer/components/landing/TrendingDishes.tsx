import React from 'react';
import { Star, Clock, Plus } from 'lucide-react';

interface Dish {
  id: number;
  name: string;
  price: number;
  rating: number;
  prepTime: string;
  image: string;
}

const DISHES: Dish[] = [
  { id: 1, name: 'Margherita Pizza', price: 349, rating: 4.5, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format' },
  { id: 2, name: 'Butter Chicken', price: 399, rating: 4.8, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format' },
  { id: 3, name: 'Veg Biryani', price: 299, rating: 4.6, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&auto=format' },
  { id: 4, name: 'Classic Burger', price: 249, rating: 4.4, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format' },
  { id: 5, name: 'Caesar Salad', price: 199, rating: 4.3, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format' },
  { id: 6, name: 'Chocolate Lava Cake', price: 249, rating: 4.7, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&auto=format' },
];

const MARQUEE_TEXT = '✦ POPULAR  ✦ TRENDING  ✦ BEST SELLER  ✦ CHEF SPECIAL  ✦ MUST TRY  ✦ TOP RATED  ✦ SIGNATURE  ✦ FAN FAVORITE  ';

interface TrendingDishesProps {
  onLoginOpen: () => void;
}

function MarqueeStrip({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className="landing-marquee py-2.5 sm:py-3"
      style={{
        background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1008 100%)',
      }}
    >
      <div className={reverse ? 'landing-marquee-content-reverse' : 'landing-marquee-content'}>
        {/* Duplicate the text 4 times for seamless loop */}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="text-[12px] sm:text-[13px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap mx-0"
            style={{
              background: 'linear-gradient(90deg, #FF6B1A, #FFB74D, #FF6B1A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrendingDishes({ onLoginOpen }: TrendingDishesProps) {
  return (
    <section className="py-0">
      {/* Top Marquee Strip */}
      <MarqueeStrip />

      {/* Main Content */}
      <div className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: '#F0FFF4' }}>
        {/* 2D Illustrated BG Objects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { emoji: '🥬', top: '10%', left: '4%', size: 55, rotate: -12 },
            { emoji: '🍳', top: '60%', right: '6%', size: 50, rotate: 18 },
            { emoji: '🥑', top: '25%', right: '8%', size: 48, rotate: -8 },
            { emoji: '🍲', bottom: '15%', left: '7%', size: 52, rotate: 10 },
            { emoji: '🥘', top: '70%', left: '20%', size: 44, rotate: -15 },
            { emoji: '🌶️', top: '5%', right: '20%', size: 40, rotate: 25 },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute select-none landing-bg-particle"
              style={{
                top: item.top, left: item.left, right: (item as any).right, bottom: (item as any).bottom,
                fontSize: `${item.size}px`,
                transform: `rotate(${item.rotate}deg)`,
                opacity: 0.07,
                animationDelay: `${i * 0.6}s`,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
                style={{ color: '#222222' }}
              >
                Popular <span style={{ color: '#FF6B1A' }}>Dishes</span>
              </h2>
              <p className="text-[15px] mt-1" style={{ color: '#666666' }}>
                Most loved dishes by our customers
              </p>
            </div>
            <button
              className="hidden sm:flex items-center gap-1 text-[14px] font-semibold transition-colors duration-150 landing-btn-premium px-4 py-2"
              style={{ color: '#FF6B1A', borderRadius: '10px' }}
            >
              View All Dishes →
            </button>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {DISHES.map((dish) => (
              <DishCard key={dish.id} dish={dish} onLoginOpen={onLoginOpen} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Marquee Strip — reverse direction */}
      <MarqueeStrip reverse />
    </section>
  );
}

function DishCard({ dish, onLoginOpen }: { dish: Dish; onLoginOpen: () => void }) {
  return (
    <div
      className="landing-card-hover landing-shiny flex flex-col bg-white overflow-hidden"
      style={{
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Image */}
      <div className="relative h-[140px] sm:h-[160px] overflow-hidden landing-img-overlay-wrap">
        <img
          src={dish.image}
          alt={dish.name}
          className="landing-img-professional w-full h-full object-cover"
          loading="lazy"
        />
        {/* Rating Badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 z-10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
          }}
        >
          <Star className="w-[12px] h-[12px]" style={{ color: '#FF6B1A', fill: '#FF6B1A' }} />
          <span className="text-[12px] font-bold" style={{ color: '#222222' }}>
            {dish.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col relative">
        <h4 className="text-[14px] sm:text-[15px] font-semibold truncate" style={{ color: '#222222' }}>
          {dish.name}
        </h4>

        <p className="text-[16px] sm:text-[18px] font-bold mt-1" style={{ color: '#FF6B1A' }}>
          ₹{dish.price}
        </p>

        <div className="flex items-center gap-1 mt-1.5 text-[12px]" style={{ color: '#666666' }}>
          <Clock className="w-[12px] h-[12px]" style={{ color: '#999999' }} />
          <span>{dish.prepTime}</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onLoginOpen}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center text-white transition-all duration-150 landing-btn-press"
          style={{
            backgroundColor: '#FF6B1A',
            boxShadow: '0 2px 8px rgba(255,107,26,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E65A0A';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6B1A';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={`Add ${dish.name} to cart`}
        >
          <Plus className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}
