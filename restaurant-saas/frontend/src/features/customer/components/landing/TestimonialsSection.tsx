import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: 'The reservation system is incredibly smooth. Found a great restaurant and booked a table in seconds. RestoHub is a game changer!',
    author: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
  },
  {
    id: 2,
    quote: 'Love the QR ordering! No more waiting for menus or the waiter. The whole experience feels premium and seamless.',
    author: 'Rahul Mehta',
    location: 'Bangalore',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
  },
  {
    id: 3,
    quote: 'Best dining platform I have used. The exclusive offers are amazing and the loyalty rewards keep me coming back every week!',
    author: 'Anita Kapoor',
    location: 'Delhi',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop',
  },
  {
    id: 4,
    quote: 'Real-time order tracking is a game changer. I always know exactly when my food is ready. No more guessing!',
    author: 'Vikram Singh',
    location: 'Pune',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop',
  },
  {
    id: 5,
    quote: 'The digital menu with photos, filters and descriptions makes ordering so much easier. Highly recommended to everyone!',
    author: 'Sneha Patel',
    location: 'Ahmedabad',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-[15px] h-[15px]"
          style={{
            color: i < rating ? '#FF6B1A' : '#E5E7EB',
            fill: i < rating ? '#FF6B1A' : '#E5E7EB',
          }}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t, className = '', style = {} }: { t: Testimonial; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`landing-shiny landing-card-hover flex flex-col bg-white p-6 relative overflow-hidden ${className}`}
      style={{
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {/* Decorative quote mark */}
      <div
        className="absolute top-4 right-5 pointer-events-none select-none"
        style={{ color: 'rgba(255,107,26,0.08)' }}
      >
        <Quote className="w-[40px] h-[40px]" />
      </div>

      <StarRating rating={t.rating} />

      <p
        className="text-[14px] sm:text-[15px] mt-4 leading-relaxed flex-1 relative z-10 italic"
        style={{ color: '#444444' }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>

      <div
        className="flex items-center gap-3 mt-5 pt-4"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <img
          src={t.avatar}
          alt={t.author}
          className="w-[44px] h-[44px] rounded-full object-cover shrink-0"
          loading="lazy"
        />
        <div>
          <p className="text-[15px] font-semibold" style={{ color: '#222222' }}>{t.author}</p>
          <p className="text-[13px]" style={{ color: '#666666' }}>{t.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const next = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, isPaused]);

  // Scroll trigger for swipe-in animation
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
      className="py-12 sm:py-16"
      style={{ backgroundColor: '#F8F8F8' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={ref}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
            style={{ color: '#222222' }}
          >
            What Our Customers <span style={{ color: '#FF6B1A' }}>Say</span>
          </h2>
          <p className="text-[15px] mt-2" style={{ color: '#666666' }}>
            Real experiences from real people
          </p>
        </div>

        {/* Desktop: All 5 testimonials with swipe-in animation */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {/* Row 1: 3 cards */}
          {TESTIMONIALS.slice(0, 3).map((t, i) => {
            // Odd index (0, 2) from left, Even index (1) from right
            const fromLeft = i % 2 === 0;
            const swipeClass = fromLeft ? 'landing-swipe-left' : 'landing-swipe-right';
            return (
              <TestimonialCard
                key={t.id}
                t={t}
                className={`${swipeClass} ${isVisible ? 'is-swiped' : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            );
          })}
        </div>
        {/* Row 2: 2 cards centered */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-6">
          <div /> {/* Spacer */}
          {TESTIMONIALS.slice(3, 5).map((t, i) => {
            const fromLeft = i % 2 === 0;
            const swipeClass = fromLeft ? 'landing-swipe-right' : 'landing-swipe-left';
            return (
              <TestimonialCard
                key={t.id}
                t={t}
                className={`${swipeClass} ${isVisible ? 'is-swiped' : ''}`}
                style={{ animationDelay: `${(i + 3) * 150}ms` }}
              />
            );
          })}
        </div>

        {/* Mobile/Tablet: Carousel */}
        <div className="lg:hidden">
          <div className="landing-slide-in" key={activeIdx}>
            <TestimonialCard t={TESTIMONIALS[activeIdx]} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={prev}
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-150 landing-btn-press"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#222222',
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-[20px] h-[20px]" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIdx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: i === activeIdx ? '#FF6B1A' : '#E5E7EB',
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-150 landing-btn-press"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#222222',
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
