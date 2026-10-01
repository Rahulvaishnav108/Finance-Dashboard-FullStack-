import React, { useState, useEffect, useRef } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  isLive?: boolean;
  emoji: string;
  accent: string;
}

const STATS: StatItem[] = [
  { value: 120, suffix: '+', label: 'Tables Available Now', isLive: true, emoji: '🪑', accent: '#4CAF50' },
  { value: 85, suffix: '', label: 'Restaurants Open', isLive: true, emoji: '🍽️', accent: '#FF6B1A' },
  { value: 15, suffix: ' min', prefix: '~', label: 'Average Wait Time', emoji: '⏱️', accent: '#2196F3' },
  { value: 340, suffix: '+', label: 'Reservations Today', emoji: '📋', accent: '#9C27B0' },
  { value: 50, suffix: '+', label: 'Offers Running', isLive: true, emoji: '🎁', accent: '#E91E63' },
  { value: 4.8, suffix: '★', label: 'Average Rating', emoji: '⭐', accent: '#FF9800' },
];

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration, trigger, isDecimal]);

  return count;
}

export default function LiveAvailabilityStrip() {
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Duplicate stats for seamless marquee
  const allStats = [...STATS, ...STATS];

  return (
    <section
      ref={ref}
      className="py-6 sm:py-8 landing-marquee"
      style={{
        background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1008 50%, #0F0F0F 100%)',
        borderTop: '1px solid rgba(255,107,26,0.15)',
        borderBottom: '1px solid rgba(255,107,26,0.15)',
      }}
    >
      <div className="landing-marquee-content">
        {allStats.map((stat, idx) => (
          <StampCard key={`${stat.label}-${idx}`} stat={stat} isVisible={isVisible} delay={idx % STATS.length} />
        ))}
      </div>
    </section>
  );
}

function StampCard({ stat, isVisible, delay }: { stat: StatItem; isVisible: boolean; delay: number }) {
  const count = useCountUp(stat.value, 1500, isVisible);

  return (
    <div
      className={`landing-stamp-float mx-4 sm:mx-6 shrink-0 flex items-center gap-3 px-5 py-3.5`}
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(8px)',
        animationDelay: `${delay * 0.5}s`,
        minWidth: '200px',
      }}
    >
      {/* Emoji Badge */}
      <div
        className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0 text-[20px]"
        style={{
          background: `${stat.accent}15`,
          border: `1px solid ${stat.accent}30`,
        }}
      >
        {stat.emoji}
      </div>

      <div>
        <div className="flex items-center gap-2">
          {stat.isLive && (
            <span
              className="landing-pulse-dot w-[6px] h-[6px] rounded-full shrink-0"
              style={{ backgroundColor: stat.accent }}
            />
          )}
          <span
            className="text-[24px] sm:text-[28px] font-bold tabular-nums"
            style={{ color: stat.accent }}
          >
            {stat.prefix || ''}{count}{stat.suffix}
          </span>
        </div>
        <span className="text-[12px] font-medium block mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {stat.label}
        </span>
      </div>
    </div>
  );
}
