import React, { useState, useRef } from 'react';
import { Copy, Check, Tag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Offer {
  id: number;
  discount: string;
  condition: string;
  code: string;
  validity: string;
  gradient: string;
  image: string;
}

const OFFERS: Offer[] = [
  {
    id: 1, discount: 'FLAT 20% OFF', condition: 'On all orders above ₹499',
    code: 'RESTO20', validity: 'Valid till 31 July',
    gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 50%, #1A1008 100%)',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop',
  },
  {
    id: 2, discount: 'FLAT 25% OFF', condition: 'On your first reservation',
    code: 'FIRST25', validity: 'Valid till 15 Aug',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #0F0F0F 100%)',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
  },
  {
    id: 3, discount: 'Buy 1 Get 1 Free', condition: 'On selected dishes',
    code: 'BOGO', validity: 'Valid till 20 July',
    gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
  },
  {
    id: 4, discount: 'Free Dessert', condition: 'On orders above ₹599',
    code: 'SWEET', validity: 'Valid till 25 July',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
  },
  {
    id: 5, discount: '₹150 CASHBACK', condition: 'Pay via UPI or Wallet',
    code: 'CASH150', validity: 'Valid till 10 Aug',
    gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop',
  },
  {
    id: 6, discount: 'FREE DELIVERY', condition: 'On all orders above ₹299',
    code: 'FREEDEL', validity: 'Valid till 5 Aug',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop',
  },
];

export default function OffersDeals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -340 : 340,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="offers"
      className="py-12 sm:py-16 relative overflow-hidden"
      style={{ backgroundColor: '#FFF8F3' }}
    >
      {/* ── 2D Illustrated Background Objects ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Food illustrations scattered across BG */}
        {[
          { emoji: '🍕', top: '8%', left: '6%', size: 60, rotate: -15, delay: 0 },
          { emoji: '🍽️', top: '65%', right: '5%', size: 55, rotate: 12, delay: 1.2 },
          { emoji: '🍴', top: '20%', right: '10%', size: 50, rotate: 20, delay: 0.5 },
          { emoji: '☕', bottom: '12%', left: '8%', size: 48, rotate: -10, delay: 1.8 },
          { emoji: '🍔', top: '45%', left: '3%', size: 52, rotate: 8, delay: 0.8 },
          { emoji: '🧁', bottom: '20%', right: '12%', size: 44, rotate: -20, delay: 1.5 },
          { emoji: '🥗', top: '75%', left: '18%', size: 46, rotate: 15, delay: 2 },
          { emoji: '🍜', top: '10%', right: '22%', size: 42, rotate: -8, delay: 0.3 },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute landing-bg-particle select-none"
            style={{
              top: item.top, left: item.left, right: (item as any).right, bottom: (item as any).bottom,
              fontSize: `${item.size}px`,
              transform: `rotate(${item.rotate}deg)`,
              opacity: 0.08,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.emoji}
          </div>
        ))}
        {/* Gradient orb */}
        <div
          className="absolute landing-glow-orb"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,26,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            {/* Visible pill badge like Trending labels */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,26,0.12), rgba(255,107,26,0.06))',
                borderRadius: '999px',
                border: '1px solid rgba(255,107,26,0.2)',
              }}
            >
              <Sparkles className="w-[15px] h-[15px]" style={{ color: '#FF6B1A' }} />
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#FF6B1A' }}>
                Limited Time Deals
              </span>
            </div>
            <h2
              className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
              style={{ color: '#222222' }}
            >
              Exclusive Offers <span style={{ color: '#FF6B1A' }}>For You</span>
            </h2>
            <p className="text-[15px] mt-1" style={{ color: '#666666' }}>
              Save more with our curated deals and discounts
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Offers Row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto landing-hide-scrollbar pb-2"
        >
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
    } catch {
      /* fallback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-w-[320px] sm:min-w-[360px] flex-1 overflow-hidden landing-card-hover landing-shiny"
      style={{
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Card — single dark section with food image */}
      <div
        className="relative overflow-hidden landing-shiny-bright"
        style={{
          background: offer.gradient,
          minHeight: '200px',
          display: 'flex',
        }}
      >
        {/* Left: Text content */}
        <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-[14px] h-[14px] text-white opacity-80" />
              <span className="text-[11px] font-medium text-white opacity-70 uppercase tracking-wider">
                Limited Offer
              </span>
            </div>
            <h3 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight">
              {offer.discount}
            </h3>
            <p className="text-[13px] text-white opacity-60 mt-1.5">
              {offer.condition}
            </p>
          </div>

          {/* Coupon code inline */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 mt-4 px-3 py-2 self-start text-[12px] font-bold transition-all duration-150 ${copied ? 'landing-copy-flash' : ''}`}
            style={{
              borderRadius: '10px',
              border: '1px dashed rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
            }}
          >
            {copied ? (
              <>
                <Check className="w-[13px] h-[13px]" style={{ color: '#4CAF50' }} />
                <span style={{ color: '#4CAF50' }}>Copied!</span>
              </>
            ) : (
              <>
                <span className="tracking-widest opacity-70" style={{ fontSize: '11px' }}>Code:</span>
                <span className="tracking-widest">{offer.code}</span>
                <Copy className="w-[13px] h-[13px] opacity-60" />
              </>
            )}
          </button>
        </div>

        {/* Right: Food image */}
        <div className="w-[140px] sm:w-[160px] shrink-0 relative">
          <img
            src={offer.image}
            alt="offer dish"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
            }}
          />
        </div>

        {/* Decorative circles */}
        <div
          className="absolute -right-4 -top-4 w-[100px] h-[100px] rounded-full opacity-[0.05]"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>

      {/* Bottom strip — validity */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.9)' }}
      >
        <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {offer.validity}
        </span>
        <span className="text-[12px] font-semibold" style={{ color: '#FF6B1A' }}>
          Apply Now →
        </span>
      </div>
    </div>
  );
}
