import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSearch } from '../components/dashboard/SearchContext';
import FoodCard from '../components/dashboard/FoodCard';
import CategoryFilter from '../components/dashboard/CategoryFilter';
import QuickActions from '../components/dashboard/QuickActions';
import { useCustomerStore } from '../store/customer.store';
import { apiClient } from '../../../shared/services/apiClient';
import { useAuth } from '../../../auth/AuthProvider';

const CAROUSEL_SLIDES = [
  {
    tag: "Today's Special",
    title: "Delicious food delivered to your table",
    desc: "Fresh, hot & made for you with the finest ingredients.",
    link: "/customer/menu",
    buttonText: "Order Now",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGtNpJIABfHBSUxs1rtXkf40UZs4dyGWwvfNutUy2EsY7p1HA79fNZe_xbenHUzeaydKEZ1wlnS0QiaigaySy6aWezO43K_ZpZWKVJ4IE4fxOcJ4uTyD3ODFudCn0hTtemF89vLqsR3TNFwBjDIhZUJyoyRgyxLP0tUx4mmBHf_hLN1tE1r6lyiuM1pxxdBjfiQoW5cR3XnyfHYNUqV-vgrevyU8h6i7QVaJho7t3i03uWI2N_OMVDkTYOR2dAk_XafXFSqTt-SYc",
    bgColor: "bg-[#FFF2EA] dark:bg-[#2A1B14] border-sd-surface-variant/40 dark:border-sd-primary/10",
  },
  {
    tag: "Limited Time",
    title: "Get 20% OFF on first table order!",
    desc: "Redeem welcome offers and coupons instantly on checkout.",
    link: "/customer/menu",
    buttonText: "Claim Discount",
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=500&q=80",
    bgColor: "bg-[#EBF7F2] dark:bg-[#11231a] border-sd-surface-variant/40 dark:border-sd-secondary/10",
  },
  {
    tag: "Chef's Special",
    title: "Try our new Paneer Tikka Feast",
    desc: "Slow grilled cottage cheese marinated in authentic spices.",
    link: "/customer/menu",
    buttonText: "Order Feast",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYb2-VbtsIQSwf2j0m8Dti6DsxSryM6aCxHu3wqIKIIyrZfz9HxcuopTHZ1x-GBX279YOkoo0dJbtg1_hZEFJBcziVdbk--CLHKqRTDrRaBjw8Qnl8KlKULxwwoBC7Nq6T5HmQc9uIOPm4NdwH-29qZ1Bhso9i6KCIcQYGfKNTZ_daeDEjm_KukodOLxX56T71u5ef1KaM1y7Eow0uvSVtG72fAPBbEfSeZN43xE27p7YJ7maE_rNHwwD9zei_J47F9cbugSlfw_k",
    bgColor: "bg-[#FFF8EA] dark:bg-[#2c2314] border-sd-surface-variant/40 dark:border-sd-tertiary/10",
  }
];

// Slides list for infinite loop: [Clone of Last, Slide 1, Slide 2, Slide 3, Clone of First]
const INFINITE_SLIDES = [
  CAROUSEL_SLIDES[CAROUSEL_SLIDES.length - 1],
  ...CAROUSEL_SLIDES,
  CAROUSEL_SLIDES[0]
];

export default function CustomerHomePage() {
  const { diningSession } = useCustomerStore();
  const { filteredItems, vegOnly, setVegOnly, spicyOnly, setSpicyOnly } = useSearch();
  const { profile } = useCustomerStore();

  const getGreetingText = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Hello';
  }, []);

  const [greeting, setGreeting] = useState(getGreetingText);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreetingText());
    }, 60000);
    return () => clearInterval(interval);
  }, [getGreetingText]);

  // Start at index 1 (which is Slide 1)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Carousel auto-slide effect
  const handleNextSlide = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNextSlide]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(CAROUSEL_SLIDES.length);
    } else if (currentIndex === CAROUSEL_SLIDES.length + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const recommended = filteredItems.slice(0, 8);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isTransitioning) return;
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  if (!diningSession) return null;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sd-on-surface font-sans">{greeting}, {profile.name.split(' ')[0]}! (Table {diningSession.tableNumber}) 👋</h2>
        <p className="text-sm text-sd-on-surface-variant font-sans">What would you like to order today?</p>
      </div>

      {/* Hero Banner Carousel */}
      <section className="mb-8 relative group/carousel">
        <div className="relative overflow-hidden rounded-[2rem] h-48 md:h-64 border border-sd-surface-variant/40">

          {/* Slides Track */}
          <div
            className={`flex h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : 'transition-none'}`}
            style={{
              width: `${INFINITE_SLIDES.length * 100}%`,
              transform: `translateX(-${currentIndex * (100 / INFINITE_SLIDES.length)}%)`
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {INFINITE_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-6 md:px-12 relative overflow-hidden h-full ${slide.bgColor}`}
                style={{ width: `${100 / INFINITE_SLIDES.length}%` }}
              >
                <div className="relative z-10 w-3/5 sm:w-1/2 flex flex-col items-start text-left shrink-0">
                  <span className="inline-block px-3 py-1 bg-sd-primary/10 text-sd-primary font-bold text-[10px] sm:text-xs rounded-full mb-2 font-sans">
                    {slide.tag}
                  </span>
                  <h3 className="text-sm sm:text-3xl font-bold text-sd-on-surface dark:text-white leading-tight mb-2 font-sans">
                    {slide.title}
                  </h3>
                  <p className="text-xs md:text-sm text-sd-on-surface-variant dark:text-neutral-300 mb-4 hidden sm:block font-sans">
                    {slide.desc}
                  </p>
                  <Link
                    to={slide.link}
                    className="inline-block bg-sd-primary text-white px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-sm hover:shadow-lg transition-all active:scale-95 font-sans"
                  >
                    {slide.buttonText}
                  </Link>
                </div>

                {/* Mobile & Desktop: Visible Image */}
                <div className="flex relative w-2/5 sm:w-1/2 h-full items-center justify-end shrink-0">
                  {slide.image && (
                    <img
                      alt={slide.title}
                      className="h-[80%] sm:h-[110%] max-h-[140px] sm:max-h-[280px] w-auto object-contain drop-shadow-2xl translate-x-2 sm:translate-x-4 rotate-3"
                      src={slide.image}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-sd-surface-variant/40 hover:shadow-md text-sd-on-surface dark:text-white flex items-center justify-center transition-all z-20 sm:opacity-0 sm:group-hover/carousel:opacity-100"
            title="Previous Slide"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-sd-surface-variant/40 hover:shadow-md text-sd-on-surface dark:text-white flex items-center justify-center transition-all z-20 sm:opacity-0 sm:group-hover/carousel:opacity-100"
            title="Next Slide"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {CAROUSEL_SLIDES.map((_, idx) => {
              // Convert infinite index back to real slide index
              let isActive = false;
              if (currentIndex === 0) isActive = idx === CAROUSEL_SLIDES.length - 1;
              else if (currentIndex === CAROUSEL_SLIDES.length + 1) isActive = idx === 0;
              else isActive = currentIndex - 1 === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx + 1)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'w-6 bg-sd-primary' : 'w-1.5 bg-sd-primary/30'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Roadmap (Single Row - Minimal Frameless Design) */}
      <section className="mb-8 relative py-4">
        {/* Dashed Roadmap line behind steps */}
        <div className="absolute top-[2.25rem] sm:top-[2.75rem] left-[12%] right-[12%] h-[1px] border-t-2 border-dashed border-sd-outline-variant dark:border-sd-outline-variant/30 pointer-events-none" />

        <div className="flex justify-between items-start w-full relative z-10">
          {[
            { icon: 'verified', label: 'Best Offers', desc: 'Exciting deals', color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
            { icon: 'ecg_heart', label: 'Fresh Food', desc: 'Hygienic & tasty', color: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400' },
            { icon: 'location_on', label: 'Live Tracking', desc: 'Track your order', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
            { icon: 'bolt', label: 'Fast Delivery', desc: 'On-time service', color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' },
          ].map(({ icon, label, desc, color }) => (
            <div key={label} className="flex flex-col items-center text-center flex-1 relative px-1 sm:px-2 group">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${color} flex items-center justify-center shrink-0 ring-4 ring-sd-surface dark:ring-sd-surface-container/5 z-20 group-hover:scale-105 transition-transform shadow-sm relative`}>
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">{icon}</span>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <p className="text-[10px] sm:text-sm font-bold font-sans text-sd-on-surface whitespace-nowrap">{label}</p>
                <p className="text-[9px] sm:text-[11px] text-sd-on-surface-variant font-sans mt-0.5 max-w-[120px] mx-auto hidden xs:block truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions — extra features */}
      <QuickActions />

      {/* Categories */}
      <section className="mb-4 mt-6">
        <CategoryFilter />
      </section>

      {/* Sub-filters (Styled like /menu sub-filter bar) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-sd-surface-variant pb-4 mb-6 px-1">
        <div>
          <h3 className="text-base font-bold text-sd-on-surface font-sans">Recommended for you</h3>
          <p className="text-xs text-sd-on-surface-variant font-sans">Handpicked dishes based on your taste</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Veg Mode Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm font-semibold text-sd-on-surface-variant font-sans">Veg Mode</span>
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                vegOnly ? 'bg-sd-secondary/20' : 'bg-sd-surface-variant'
              }`}
            >
              <input
                className="sr-only peer"
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              <div
                className={`absolute left-0.5 h-4 w-4 rounded-full shadow-sm transition-all ${
                  vegOnly ? 'translate-x-4 bg-sd-secondary' : 'bg-white'
                }`}
              />
            </div>
          </label>

          {/* Extra Spicy Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="material-symbols-outlined text-sd-primary text-[18px]">local_fire_department</span>
            <span className="text-sm font-semibold text-sd-on-surface-variant font-sans">Extra Spicy</span>
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                spicyOnly ? 'bg-sd-primary/20' : 'bg-sd-surface-variant'
              }`}
            >
              <input
                className="sr-only peer"
                type="checkbox"
                checked={spicyOnly}
                onChange={(e) => setSpicyOnly(e.target.checked)}
              />
              <div
                className={`absolute left-0.5 h-4 w-4 rounded-full shadow-sm transition-all ${
                  spicyOnly ? 'translate-x-4 bg-sd-primary' : 'bg-white'
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Recommended */}
      <section className="mb-8 food-grid-container">
        <div className="cq-food-grid-5">
          {recommended.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/customer/menu"
            className="px-6 py-2.5 border-2 border-sd-primary text-sd-primary hover:bg-sd-primary hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 font-sans"
          >
            View All Menu
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
