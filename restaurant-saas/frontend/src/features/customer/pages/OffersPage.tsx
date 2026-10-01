import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Tag, Sparkles, Clock, Star, Gift, Zap, Percent } from 'lucide-react';
import '../components/landing/landing.css';
import LandingFooter from '../components/landing/LandingFooter';

interface Offer {
  id: number;
  discount: string;
  condition: string;
  code: string;
  validity: string;
  category: string;
  image: string;
  gradient: string;
  hot?: boolean;
}

const CATEGORIES = ['All', 'Food Deals', 'First Order', 'Combo', 'Premium', 'Weekend'];

const OFFERS: Offer[] = [
  { id: 1, discount: 'FLAT 20% OFF', condition: 'On all orders above ₹499', code: 'RESTO20', validity: 'Valid till 31 July', category: 'Food Deals', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)', hot: true },
  { id: 2, discount: 'FLAT 25% OFF', condition: 'On your first reservation', code: 'FIRST25', validity: 'Valid till 15 Aug', category: 'First Order', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' },
  { id: 3, discount: 'Buy 1 Get 1 Free', condition: 'On selected dishes', code: 'BOGO', validity: 'Valid till 20 July', category: 'Combo', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)', hot: true },
  { id: 4, discount: 'Free Dessert', condition: 'On orders above ₹599', code: 'SWEET', validity: 'Valid till 25 July', category: 'Food Deals', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' },
  { id: 5, discount: '₹150 CASHBACK', condition: 'Pay via UPI or Wallet', code: 'CASH150', validity: 'Valid till 10 Aug', category: 'Premium', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)' },
  { id: 6, discount: 'FREE DELIVERY', condition: 'On all orders above ₹299', code: 'FREEDEL', validity: 'Valid till 5 Aug', category: 'Food Deals', image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)', hot: true },
  { id: 7, discount: '30% OFF on Weekends', condition: 'Dine-in only, Sat & Sun', code: 'WKND30', validity: 'Valid till 30 Aug', category: 'Weekend', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)' },
  { id: 8, discount: 'Family Feast ₹999', condition: 'Meal for 4 at select restaurants', code: 'FAM999', validity: 'Valid till 15 Aug', category: 'Combo', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' },
  { id: 9, discount: 'Premium ₹500 OFF', condition: 'On orders above ₹2000', code: 'PREM500', validity: 'Valid till 20 Aug', category: 'Premium', image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&auto=format&fit=crop', gradient: 'linear-gradient(135deg, #1A1008 0%, #2D1F10 100%)' },
];

export default function OffersPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleCopy = async (id: number, code: string) => {
    try { await navigator.clipboard.writeText(code); } catch { /* */ }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = activeCategory === 'All' ? OFFERS : OFFERS.filter((o) => o.category === activeCategory);

  return (
    <div className="min-h-screen landing-font-inter" style={{ background: '#FFF8F3', color: '#222222' }}>

      {/* ── Top Bar ────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,248,243,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,107,26,0.1)' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-[64px] flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ backgroundColor: 'rgba(255,107,26,0.08)', border: '1px solid rgba(255,107,26,0.15)' }}
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-[18px] h-[18px]" style={{ color: '#FF6B1A' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B1A' }}>
              <span className="material-symbols-outlined text-[15px] font-bold text-white block">restaurant</span>
            </div>
            <span className="font-bold text-[18px]" style={{ color: '#222222' }}>Resto<span style={{ color: '#FF6B1A' }}>Hub</span></span>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section
        className="relative py-16 sm:py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(255,240,225,0.93) 0%, rgba(255,232,214,0.95) 100%), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Floating illustrated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { emoji: '🎁', top: '8%', left: '5%', size: 52, rotate: -15, delay: 0 },
            { emoji: '🏷️', top: '60%', right: '6%', size: 48, rotate: 12, delay: 1 },
            { emoji: '💰', top: '20%', right: '10%', size: 44, rotate: -10, delay: 0.5 },
            { emoji: '🎉', bottom: '12%', left: '8%', size: 50, rotate: 8, delay: 1.5 },
            { emoji: '✨', top: '45%', left: '3%', size: 40, rotate: 20, delay: 0.8 },
            { emoji: '🔥', bottom: '20%', right: '14%', size: 46, rotate: -18, delay: 1.3 },
            { emoji: '🍕', top: '70%', left: '18%', size: 42, rotate: 15, delay: 2 },
            { emoji: '🍰', top: '10%', right: '22%', size: 38, rotate: -5, delay: 0.3 },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute select-none landing-stamp-float"
              style={{
                top: item.top, left: item.left, right: (item as any).right, bottom: (item as any).bottom,
                fontSize: `${item.size}px`,
                transform: `rotate(${item.rotate}deg)`,
                opacity: 0.06,
                animationDelay: `${item.delay}s`,
              }}
            >{item.emoji}</div>
          ))}
          {/* Glow orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full landing-glow-orb" style={{ background: 'radial-gradient(circle, rgba(255,107,26,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.15), rgba(255,107,26,0.06))', borderRadius: '999px', border: '1px solid rgba(255,107,26,0.25)' }}>
            <Sparkles className="w-[15px] h-[15px]" style={{ color: '#FF6B1A' }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#FF6B1A' }}>Exclusive Deals</span>
          </div>
          <h1 className="text-[32px] sm:text-[42px] lg:text-[56px] font-bold landing-font-hero leading-[1.1]" style={{ color: '#222222' }}>
            Offers & <span className="italic" style={{ color: '#FF6B1A' }}>Deals</span>
          </h1>
          <p className="text-[15px] sm:text-[17px] mt-3 max-w-[500px] mx-auto" style={{ color: '#666666' }}>
            Save more with our handpicked restaurant deals and discount codes
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
            {[
              { value: `${OFFERS.length}+`, label: 'Active Offers' },
              { value: '40%', label: 'Max Savings' },
              { value: '100+', label: 'Restaurants' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[22px] sm:text-[28px] font-bold" style={{ color: '#FF6B1A' }}>{stat.value}</div>
                <div className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: '#888888' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Tabs ────────────────────────────── */}
      <div className="sticky top-[64px] z-40" style={{ background: 'rgba(255,248,243,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,107,26,0.08)' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3 flex items-center gap-2.5 overflow-x-auto landing-hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap px-4 py-2 text-[13px] font-semibold shrink-0 transition-all duration-150"
                style={{
                  borderRadius: '999px',
                  border: `1px solid ${isActive ? '#FF6B1A' : '#E5E7EB'}`,
                  backgroundColor: isActive ? '#FF6B1A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#666666',
                  boxShadow: isActive ? '0 2px 12px rgba(255,107,26,0.3)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Offers Grid ──────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((offer) => (
            <div
              key={offer.id}
              className="landing-card-hover landing-shiny overflow-hidden"
              style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            >
              {/* Card with food image */}
              <div className="relative overflow-hidden flex" style={{ background: offer.gradient, minHeight: '190px' }}>
                {/* Left text */}
                <div className="flex-1 p-5 flex flex-col justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {offer.hot ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase" style={{ backgroundColor: 'rgba(255,87,34,0.2)', color: '#FF5722' }}>
                          <Zap className="w-[10px] h-[10px]" /> HOT
                        </span>
                      ) : (
                        <Tag className="w-[13px] h-[13px] text-white opacity-60" />
                      )}
                    </div>
                    <h3 className="text-[20px] sm:text-[24px] font-bold text-white leading-tight">{offer.discount}</h3>
                    <p className="text-[12px] text-white opacity-50 mt-1">{offer.condition}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleCopy(offer.id, offer.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all duration-150"
                      style={{ borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                    >
                      {copiedId === offer.id ? (
                        <><Check className="w-[12px] h-[12px]" style={{ color: '#4CAF50' }} /><span style={{ color: '#4CAF50' }}>Copied!</span></>
                      ) : (
                        <><span className="tracking-widest opacity-60" style={{ fontSize: '10px' }}>Code:</span><span className="tracking-widest">{offer.code}</span><Copy className="w-[12px] h-[12px] opacity-60" /></>
                      )}
                    </button>
                  </div>
                </div>
                {/* Right image */}
                <div className="w-[130px] sm:w-[150px] shrink-0 relative">
                  <img src={offer.image} alt="offer" className="absolute inset-0 w-full h-full object-cover" loading="lazy" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)' }} />
                </div>
              </div>
              {/* Bottom strip */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.9)' }}>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Clock className="w-[12px] h-[12px]" /> {offer.validity}
                </span>
                <span className="text-[12px] font-semibold" style={{ color: '#FF6B1A' }}>Apply Now →</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[18px] font-semibold">No offers found</p>
            <p className="text-[14px] mt-2" style={{ color: '#666666' }}>Check back later for new deals!</p>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
