import React from "react";
import { Search, MapPin, Compass, ArrowRight, BookOpen } from "lucide-react";

type LandingHeroProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationQuery: string;
  setLocationQuery: (query: string) => void;
  onSearch: () => void;
};

export default function LandingHero({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch,
}: LandingHeroProps): JSX.Element {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section
      className="relative py-20 lg:py-32 text-white flex flex-col justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/Landing-Hero.png')" }}
      data-purpose="hero-banner"
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Discover Great Food <br />
            <span className="text-[#FF5722]">Near</span> You
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-xl font-medium">
            Explore top restaurants, book your table, and enjoy exclusive offers all in one place.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl mb-8 max-w-4xl border border-gray-150"
            data-purpose="hero-search"
          >
            {/* Term Search */}
            <div className="flex-1 flex items-center px-4 py-2 w-full">
              <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input
                className="w-full border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 py-2 outline-none font-medium bg-transparent"
                placeholder="Search for restaurants, cuisines or dishes..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200"></div>

            {/* Location Search */}
            <div className="flex-1 flex items-center px-4 py-2 w-full">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input
                className="w-full border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 py-2 outline-none font-semibold bg-transparent"
                placeholder="Location (e.g. Bandra West, Mumbai)"
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 w-full md:w-auto justify-center transition-all active:scale-95 shadow-md shadow-orange-500/20"
            >
              Search
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#restaurants"
              className="bg-[#FF5722] hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/10"
            >
              Explore Restaurants
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#dishes"
              className="bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Explore Menu
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-white text-sm opacity-90 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-5 h-5 text-[#FF5722]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                ></path>
              </svg>
              Verified Restaurants
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-5 h-5 text-[#FF5722]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                <path
                  clipRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  fillRule="evenodd"
                ></path>
              </svg>
              Easy Reservations
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-5 h-5 text-[#FF5722]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  fillRule="evenodd"
                ></path>
              </svg>
              Exclusive Offers
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-5 h-5 text-[#FF5722]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
