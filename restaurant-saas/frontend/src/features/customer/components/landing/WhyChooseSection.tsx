import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarCheck, Radio, Smartphone, Eye,
  Tag, Shield, Award, Headphones
} from 'lucide-react';

const LEFT_FEATURES = [
  { icon: CalendarCheck, title: 'Instant Reservations', desc: 'Book your table in seconds with real-time availability', accent: '#FF6B1A' },
  { icon: Radio, title: 'Live Availability', desc: 'See which restaurants have tables right now', accent: '#4CAF50' },
  { icon: Smartphone, title: 'Digital Menu', desc: 'Browse menus with filters, photos, and updates', accent: '#2196F3' },
  { icon: Eye, title: 'Live Order Tracking', desc: 'Watch your food being prepared in real-time', accent: '#9C27B0' },
];

const RIGHT_FEATURES = [
  { icon: Tag, title: 'Smart Offers', desc: 'Personalized deals based on your preferences', accent: '#E91E63' },
  { icon: Shield, title: 'Secure Payments', desc: 'Pay safely with multiple payment options', accent: '#00BCD4' },
  { icon: Award, title: 'Loyalty Rewards', desc: 'Earn points and unlock exclusive rewards', accent: '#FF9800' },
  { icon: Headphones, title: 'Service Requests', desc: 'Request anything from your table with one tap', accent: '#607D8B' },
];

export default function WhyChooseSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{ backgroundColor: '#F8F8F8' }}
      ref={ref}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
            style={{ color: '#222222' }}
          >
            Why Choose <span style={{ color: '#FF6B1A' }}>RestoHub</span>
          </h2>
          <p className="text-[15px] mt-2 max-w-[480px] mx-auto" style={{ color: '#666666' }}>
            Everything you need for the perfect dining experience
          </p>
        </div>

        {/* Desktop: Hemisphere Layout */}
        <div className="hidden lg:flex items-center justify-center gap-12 relative min-h-[520px]">

          {/* Left Hemisphere — Rotating Half Circle */}
          <div className="relative w-[340px] h-[500px] flex-shrink-0">
            {/* Dashed arc */}
            <div
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] pointer-events-none"
              style={{
                borderRadius: '50%',
                border: '2px dashed rgba(255,107,26,0.12)',
              }}
            >
              {/* Spinning accent arc */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: '50%',
                  border: '2.5px solid transparent',
                  borderTopColor: 'rgba(255,107,26,0.25)',
                  borderRightColor: 'rgba(255,107,26,0.1)',
                  animation: 'landing-hemisphere-spin 10s linear infinite',
                }}
              />
            </div>

            {/* Cards on left arc with continuous float */}
            {LEFT_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              const positions = [
                { top: '2%', right: '20px' },
                { top: '27%', right: '-10px' },
                { top: '52%', right: '-10px' },
                { top: '77%', right: '20px' },
              ];
              const pos = positions[idx];

              return (
                <div
                  key={feature.title}
                  className={`absolute landing-shiny landing-stamp-float ${
                    isVisible ? 'landing-serve-left is-served' : 'landing-serve-left'
                  }`}
                  style={{
                    ...pos,
                    width: '250px',
                    borderRadius: '18px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.07)',
                    padding: '16px 18px',
                    animationDelay: `${idx * 0.6}s`,
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${feature.accent}50`;
                    e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.1), 0 0 0 1px ${feature.accent}20`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.07)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${feature.accent}12`, border: `1px solid ${feature.accent}20` }}
                    >
                      <Icon className="w-[20px] h-[20px]" style={{ color: feature.accent }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold" style={{ color: '#222222' }}>
                        {feature.title}
                      </h4>
                      <p className="text-[12px] mt-1 leading-snug" style={{ color: '#888888' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  {/* Accent bar */}
                  <div
                    className="absolute top-0 left-[18px] w-[30px] h-[3px] rounded-b-full"
                    style={{ backgroundColor: feature.accent, opacity: 0.7 }}
                  />
                </div>
              );
            })}
          </div>

          {/* Center Brand Circle */}
          <div className="relative flex items-center justify-center z-20 mx-4">
            <div
              className="w-[110px] h-[110px] rounded-full flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF6B1A 0%, #E65A0A 100%)',
                boxShadow: '0 8px 30px rgba(255,107,26,0.35)',
              }}
            >
              <span className="material-symbols-outlined text-[28px] text-white block">restaurant</span>
              <span className="text-[9px] font-bold text-white mt-1 tracking-[0.15em] uppercase">RestoHub</span>
            </div>
            <div
              className="absolute rounded-full landing-pulse-dot"
              style={{
                width: '140px', height: '140px',
                top: '-15px', left: '-15px',
                border: '2px solid rgba(255,107,26,0.15)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: '170px', height: '170px',
                top: '-30px', left: '-30px',
                border: '1px dashed rgba(255,107,26,0.08)',
                animation: 'landing-hemisphere-spin 15s linear infinite reverse',
              }}
            />
          </div>

          {/* Right Hemisphere — Rotating Half Circle */}
          <div className="relative w-[340px] h-[500px] flex-shrink-0">
            {/* Dashed arc */}
            <div
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] pointer-events-none"
              style={{
                borderRadius: '50%',
                border: '2px dashed rgba(255,107,26,0.12)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: '50%',
                  border: '2.5px solid transparent',
                  borderBottomColor: 'rgba(255,107,26,0.25)',
                  borderLeftColor: 'rgba(255,107,26,0.1)',
                  animation: 'landing-hemisphere-spin 10s linear infinite reverse',
                }}
              />
            </div>

            {/* Cards on right arc with continuous float */}
            {RIGHT_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              const positions = [
                { top: '2%', left: '20px' },
                { top: '27%', left: '-10px' },
                { top: '52%', left: '-10px' },
                { top: '77%', left: '20px' },
              ];
              const pos = positions[idx];

              return (
                <div
                  key={feature.title}
                  className={`absolute landing-shiny landing-stamp-float ${
                    isVisible ? 'landing-serve-right is-served' : 'landing-serve-right'
                  }`}
                  style={{
                    ...pos,
                    width: '250px',
                    borderRadius: '18px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.07)',
                    padding: '16px 18px',
                    animationDelay: `${(idx + 2) * 0.6}s`,
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${feature.accent}50`;
                    e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.1), 0 0 0 1px ${feature.accent}20`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.07)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${feature.accent}12`, border: `1px solid ${feature.accent}20` }}
                    >
                      <Icon className="w-[20px] h-[20px]" style={{ color: feature.accent }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold" style={{ color: '#222222' }}>
                        {feature.title}
                      </h4>
                      <p className="text-[12px] mt-1 leading-snug" style={{ color: '#888888' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute top-0 right-[18px] w-[30px] h-[3px] rounded-b-full"
                    style={{ backgroundColor: feature.accent, opacity: 0.7 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: 2-col grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...LEFT_FEATURES, ...RIGHT_FEATURES].map((feature, idx) => {
            const Icon = feature.icon;
            const fromLeft = idx < 4;
            return (
              <div
                key={feature.title}
                className={`landing-card-hover landing-shiny bg-white p-5 ${
                  fromLeft ? 'landing-serve-left' : 'landing-serve-right'
                } ${isVisible ? 'is-served' : ''}`}
                style={{
                  borderRadius: '18px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${feature.accent}12`, border: `1px solid ${feature.accent}20` }}
                  >
                    <Icon className="w-[20px] h-[20px]" style={{ color: feature.accent }} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold" style={{ color: '#222222' }}>
                      {feature.title}
                    </h4>
                    <p className="text-[13px] mt-1 leading-relaxed" style={{ color: '#888888' }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hemisphere spin keyframe */}
      <style>{`
        @keyframes landing-hemisphere-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
