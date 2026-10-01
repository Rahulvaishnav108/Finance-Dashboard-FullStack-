import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: `"Amazing food, great ambiance, and super easy booking experience."`,
    author: "Priya Sharma",
    location: "Mumbai",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqzgmjbgJxX-KrWBKvawWsDTw-I8RZqZ_wBSqP4xlNCo5stMDr6MfWdOfC2wAYZTuy-5Lc00NeUqsmz7w971M3CJ9HvtvJC-9cXybi7sLMBYKH6PaPCgfOmHnCniPtW74w4g7KU53jP1G8Os9VKLBE117r680cW-0tbodDvveZtwdMYFcOVQil7aSqOoJ5DFczaheP5qF17MA7X01YbOGBSjWeq5cIG6_8fRz1IUxMgNlLma_m63vSpcmqIF_8EruDlYkhYD6I6Na",
  },
  {
    quote: `"Found my favorite restaurant near me with great effort."`,
    author: "Rahul Mehta",
    location: "Bangalore",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdCEFjrqDd8rmrUTcgsWHRUk4wgdAvcEyQ-KWOHqQNuiR_9DVtrsMzQlzgV3yGmS-xCYSoPX8EiZhCW3Gj3tP8xa5M3jbUfJrycDilNlEQdfP7BHeiooE_Dl7mPk8vdh-QC56syzBIN5i6Tv9FjzUMJKPZUemtA_CyLqPYpTxf7XAS6mYW8nVw1AoMty4T0vlmHzkM_p7Oqaxz47VdEJ-ZHkV_qm2zx9_JPvW7SbYtHxLWIlZwY6N42t5MTEbiMwHXrhjJfZyeHlC-",
  },
  {
    quote: `"RestoHub makes dining out so much better!"`,
    author: "Anita Verma",
    location: "Delhi",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkc4TVWbzmQ-ZYdgXkFwh2Ajc0Gcn6aYkwtFKUoykHcWYbv0_WCm4NBc1-b4PkeHG_xi3zsy-4v_efxgSw4fhJ52zv0hepiNNQOnvEOy5U6A7IfriuPv1SvkoA7wbWnJt0r0Eqj_yORQzqGA8j9RZ-gOq5fj37sLamRrrFWhU1UGu0ewbGWGU5i_lqba3QnBC04rkQqapgjc0QJX4xlYW6yu3aP1WDtrHM8it70IrF5JOebleUJwgRv3A3jsYfcqCX7UPUBqAsnZHa",
  },
];

export default function LandingTestimonials(): JSX.Element {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => {
    setActiveIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const next = () => {
    setActiveIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 bg-white" data-purpose="testimonials-section">
      <div className="container mx-auto px-4 text-center">
        {/* Section Header */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">What Our Customers Say</h2>
        <p className="text-gray-500 mb-12">Real experiences from real people</p>

        {/* Testimonials Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Desktop Version: Grid */}
          <div className="hidden md:grid grid-cols-3 gap-6 text-left">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-between"
              >
                <div className="text-[#FF5722]/20 text-5xl font-serif mb-4 leading-none select-none">“</div>
                <p className="text-gray-600 italic mb-6 leading-relaxed flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <img
                    alt={t.author}
                    className="w-10 h-10 rounded-full border-2 border-[#FF5722] object-cover bg-gray-100"
                    src={t.avatar}
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{t.author}</h4>
                    <p className="text-gray-400 text-xs font-semibold">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Version: Slider Carousel */}
          <div className="md:hidden max-w-md mx-auto relative px-6">
            {/* Slider Controls */}
            <button
              onClick={prev}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FF5722] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={next}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FF5722] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="bg-gray-50 p-8 rounded-2xl text-left border border-gray-150 shadow-sm min-h-[220px] flex flex-col justify-between animate-fadeIn">
              <div className="text-[#FF5722]/20 text-5xl font-serif mb-4 leading-none select-none">“</div>
              <p className="text-gray-600 italic mb-6 leading-relaxed flex-1">
                {TESTIMONIALS[activeIdx].quote}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                <img
                  alt={TESTIMONIALS[activeIdx].author}
                  className="w-10 h-10 rounded-full border-2 border-[#FF5722] object-cover bg-gray-100"
                  src={TESTIMONIALS[activeIdx].avatar}
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{TESTIMONIALS[activeIdx].author}</h4>
                  <p className="text-gray-400 text-xs font-semibold">{TESTIMONIALS[activeIdx].location}</p>
                </div>
              </div>
            </div>

            {/* Pagination Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeIdx === idx ? "w-6 bg-[#FF5722]" : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
