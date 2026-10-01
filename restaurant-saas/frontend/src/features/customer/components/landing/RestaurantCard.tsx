import React, { useState } from 'react';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  distance: string;
  waitTime: string;
  availableTables: number;
  currentOffer?: string;
  isOpen: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onLoginOpen: () => void;
}

export default function RestaurantCard({ restaurant, onLoginOpen }: RestaurantCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [heartBounce, setHeartBounce] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 250);
  };

  return (
    <div
      className="landing-card-hover landing-shiny flex flex-col bg-white overflow-hidden"
      style={{
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Image Container */}
      <div className="landing-img-overlay-wrap relative h-[200px] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="landing-img-professional w-full h-full object-cover"
          loading="lazy"
        />

        {/* Open/Closed Badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold"
          style={{
            borderRadius: '999px',
            backgroundColor: restaurant.isOpen ? 'rgba(76,175,80,0.9)' : 'rgba(220,53,69,0.9)',
            color: '#FFFFFF',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{
              backgroundColor: '#FFFFFF',
            }}
          />
          {restaurant.isOpen ? 'Open Now' : 'Closed'}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all duration-150 ${
            heartBounce ? 'landing-heart-bounce' : ''
          }`}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className="w-[18px] h-[18px]"
            style={{
              color: isFav ? '#FF6B1A' : '#666666',
              fill: isFav ? '#FF6B1A' : 'none',
            }}
          />
        </button>

        {/* Offer Badge */}
        {restaurant.currentOffer && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1 text-[11px] font-semibold text-white"
            style={{
              backgroundColor: '#FF6B1A',
              borderRadius: '999px',
            }}
          >
            {restaurant.currentOffer}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[18px] sm:text-[20px] font-semibold leading-tight truncate landing-font-hero" style={{ color: '#222222' }}>
            {restaurant.name}
          </h3>
          <div
            className="flex items-center gap-1 px-2 py-1 shrink-0"
            style={{
              backgroundColor: '#E8F5E9',
              borderRadius: '8px',
            }}
          >
            <Star className="w-[13px] h-[13px]" style={{ color: '#4CAF50', fill: '#4CAF50' }} />
            <span className="text-[13px] font-bold" style={{ color: '#4CAF50' }}>
              {restaurant.rating}
            </span>
          </div>
        </div>

        {/* Cuisine */}
        <p className="text-[14px] mt-1 truncate" style={{ color: '#666666' }}>
          {restaurant.cuisine}
        </p>

        {/* Location + Distance */}
        <div className="flex items-center gap-1.5 mt-2 text-[13px]" style={{ color: '#666666' }}>
          <MapPin className="w-[14px] h-[14px] shrink-0" style={{ color: '#999999' }} />
          <span className="truncate">{restaurant.location}</span>
          <span className="shrink-0">• {restaurant.distance}</span>
        </div>

        {/* Divider */}
        <div className="my-3" style={{ borderTop: '1px solid #E5E7EB' }} />

        {/* Info Row */}
        <div className="flex items-center gap-4 text-[13px]" style={{ color: '#666666' }}>
          <span className="flex items-center gap-1">
            <Clock className="w-[13px] h-[13px]" style={{ color: '#999999' }} />
            {restaurant.waitTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-[13px] h-[13px]" style={{ color: '#999999' }} />
            {restaurant.availableTables} tables
          </span>
          <span className="font-medium" style={{ color: '#FF6B1A' }}>
            {restaurant.priceLevel}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onLoginOpen}
            className="h-[42px] text-[13px] font-semibold transition-all duration-150 landing-btn-press landing-focus-ring"
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              color: '#222222',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6B1A';
              e.currentTarget.style.color = '#FF6B1A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.color = '#222222';
            }}
          >
            View Menu
          </button>
          <button
            onClick={onLoginOpen}
            className="h-[42px] text-[13px] font-semibold text-white transition-colors duration-150 landing-btn-press landing-focus-ring"
            style={{
              backgroundColor: '#FF6B1A',
              borderRadius: '14px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E65A0A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF6B1A'; }}
          >
            Reserve Table
          </button>
        </div>
      </div>
    </div>
  );
}
