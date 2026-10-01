import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: number;
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    category: 'Restaurant Tips',
    title: '5 Tips to Improve Your Restaurant Experience',
    description: 'Simple yet powerful ways to create memorable dining moments that keep customers coming back.',
    date: 'May 12, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    category: 'Trends',
    title: 'Top Restaurant Trends to Watch in 2025',
    description: 'Stay ahead with the latest restaurant industry innovations and what they mean for diners.',
    date: 'May 10, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    category: 'Food & Culture',
    title: 'Exploring the Rise of Local Cuisines',
    description: 'Why local flavors and regional cooking styles are winning hearts across the globe.',
    date: 'May 8, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    category: 'Technology',
    title: 'How QR Ordering is Revolutionizing Dining',
    description: 'The shift from traditional menus to contactless digital ordering and what it means for you.',
    date: 'May 5, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    category: 'Health & Wellness',
    title: 'Eating Healthy When Dining Out: A Complete Guide',
    description: 'Make smarter choices at restaurants without sacrificing taste or enjoyment.',
    date: 'May 3, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop',
  },
  {
    id: 6,
    category: 'Sustainability',
    title: 'Farm-to-Table: The Future of Restaurant Sourcing',
    description: 'How sustainable sourcing is changing the way restaurants operate and diners eat.',
    date: 'Apr 28, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&auto=format&fit=crop',
  },
  {
    id: 7,
    category: 'Lifestyle',
    title: 'Best Date Night Restaurants in Every City',
    description: 'Curated picks for romantic dinners that will make your evening truly special.',
    date: 'Apr 25, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&auto=format&fit=crop',
  },
];

export default function BlogSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % BLOG_POSTS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIdx((prev) => (prev === 0 ? BLOG_POSTS.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, isPaused]);

  // Get visible cards: prev, active, next (for center-focus effect)
  const getVisibleIndices = () => {
    const total = BLOG_POSTS.length;
    const indices: number[] = [];
    for (let i = -2; i <= 2; i++) {
      indices.push((activeIdx + i + total) % total);
    }
    return indices;
  };

  const visibleIndices = getVisibleIndices();

  return (
    <section
      id="blog"
      className="py-12 sm:py-16 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
              style={{ color: '#222222' }}
            >
              From Our <span style={{ color: '#FF6B1A' }}>Blog</span>
            </h2>
            <p className="text-[15px] mt-1" style={{ color: '#666666' }}>
              Tips, trends, and stories for food lovers
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={prev}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
              aria-label="Previous blog"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={next}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#222222' }}
              aria-label="Next blog"
            >
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
            <button
              className="flex items-center gap-1 text-[14px] font-semibold transition-colors duration-150 ml-2"
              style={{ color: '#FF6B1A' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E65A0A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#FF6B1A'; }}
            >
              View All Blogs
              <ArrowRight className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>

        {/* Carousel — Center Focus */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-6 relative min-h-[380px]">
          {visibleIndices.map((postIdx, i) => {
            const post = BLOG_POSTS[postIdx];
            const offset = i - 2; // -2, -1, 0, 1, 2
            const isCenter = offset === 0;
            const isAdjacent = Math.abs(offset) === 1;
            const isFar = Math.abs(offset) === 2;

            return (
              <div
                key={`${post.id}-${i}`}
                role="button"
                tabIndex={0}
                className="landing-shiny flex flex-col bg-white overflow-hidden cursor-pointer absolute transition-all duration-500 ease-out"
                style={{
                  borderRadius: '20px',
                  border: isCenter ? '1px solid rgba(255,107,26,0.2)' : '1px solid #E5E7EB',
                  boxShadow: isCenter
                    ? '0 12px 40px rgba(0,0,0,0.12)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  width: isCenter ? '380px' : isAdjacent ? '320px' : '280px',
                  transform: `translateX(${offset * (isCenter ? 0 : isAdjacent ? 340 : 620)}px) scale(${isCenter ? 1 : isAdjacent ? 0.9 : 0.8})`,
                  opacity: isFar ? 0.4 : isAdjacent ? 0.7 : 1,
                  zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                  pointerEvents: isCenter ? 'auto' : 'none',
                }}
                onClick={() => {
                  if (!isCenter) setActiveIdx(postIdx);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!isCenter) setActiveIdx(postIdx);
                  }
                }}
              >
                {/* Image */}
                <div className="landing-img-overlay-wrap shrink-0" style={{ height: isCenter ? '200px' : '160px' }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="landing-img-professional w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Category badge */}
                  <span
                    className="absolute bottom-3 left-3 z-10 px-3 py-1 text-[12px] font-semibold text-white"
                    style={{ backgroundColor: '#FF6B1A', borderRadius: '999px' }}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="font-semibold leading-snug line-clamp-2"
                    style={{ color: '#222222', fontSize: isCenter ? '18px' : '15px' }}
                  >
                    {post.title}
                  </h3>
                  {isCenter && (
                    <p
                      className="text-[14px] mt-2 leading-relaxed line-clamp-2 flex-1"
                      style={{ color: '#666666' }}
                    >
                      {post.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid #E5E7EB' }}
                  >
                    <div className="flex items-center gap-3 text-[12px]" style={{ color: '#666666' }}>
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-[11px] h-[11px]" />
                        {post.readTime}
                      </span>
                    </div>
                    {isCenter && (
                      <span
                        className="flex items-center gap-1 text-[13px] font-semibold"
                        style={{ color: '#FF6B1A' }}
                      >
                        Read More
                        <ArrowRight className="w-[13px] h-[13px]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {BLOG_POSTS.map((_, i) => (
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
              aria-label={`Go to blog ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
