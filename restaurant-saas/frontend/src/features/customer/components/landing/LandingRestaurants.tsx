import React from "react";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  image: string;
  time: string;
  priceLevel: string;
  rating: number;
}

export const TOP_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: "The Grand Kitchen",
    cuisine: "Italian, Continental",
    location: "Bandra West, Mumbai",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdlr-7Tsvu_2u9KHJw7rjnMJAm1hD9fUFW3DHBkdl6pajpacv5r_EN7TMlKWFZ3k3j2Ygj9yTXqY-Y-3k4bqgZHMEssmFyMS6FgayuT7aOl4RPZO3XA1LHAJmNflPPGIx0DeKzouVOtWuKAxBK4NuX3qQLzPxbNfaJy7SX1gAaz32Foy9Hmblgz6alzI4FQrP6yxnP8nI_0zPqzl42QjlMgBQIxaNDupo-UvnsGaQM9NL_By3J_9sONaXIC73e43giuvhEe7Pi8-IG",
    time: "30-40 mins",
    priceLevel: "₹₹₹",
    rating: 4.6,
  },
  {
    id: 2,
    name: "Spice Route",
    cuisine: "North Indian, Mughlai",
    location: "Andheri East, Mumbai",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBw96Q2ErxHrD2EmPKNmr2gohKON1L3CP3QGJpzCG9vtl8r0CZtFRt3W-9Mhy3phxPT576teM6jYQZlIVFNtc1Cg7rjjEyv8hYQ1JcJGtKuXncbbXXjCkYlIqNeVUfXFzNSqF8on_vc8mj_-immoEwFvMbe5NNCPPJYpidb4777Z_e1EVIAqLAjmTY_cM4grwif8YfmF3cFsU_dUJ8wqzdWRjON7chSnGTnzvptyuD-Navz_q7Ku7vrHGT_FUBw3OwWWMlDkFA9Ptvo",
    time: "25-35 mins",
    priceLevel: "₹₹",
    rating: 4.4,
  },
  {
    id: 3,
    name: "Ocean Delight",
    cuisine: "Seafood, Asian",
    location: "Juhu, Mumbai",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABkV1yu6opfT0zz0dCE3P4jMIAKlb8W2uawzU4-SonIsP0X2D_dMFu5Kks_EQOoE2DLg8oiwXBnlEFnIb1QapENZZuL-_9G6kErYMbjH8ValcWyK0eYlyZtJzYlZkHJDHxH1UkoNEGyR4-BObdFUjZgMFj96p3mhl82lHFaa46D6hWzYTiv6Epct785yQaJNf7XPRnTdTGfK5Sv6DJVO2FAMNdBFz-R8GENsgyJQxB0BzmlFcVv6Tc1Zj5Jh_UFelex5guyjLDRDRV",
    time: "20-30 mins",
    priceLevel: "₹₹₹",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Urban Bites",
    cuisine: "American, Fast Food",
    location: "Lower Parel, Mumbai",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7pcZktf03lqlalFDtj3yyK5H4YuA9nDNFNEH9jAXwAlzARCRpbcM1bwmFnP0FmCsYU-7niBFngOb4g4YKSae7CKY4sifMmm5orjeOH7tTf6Fgul3gpmLV1SzbndukTad9RJvqT17T0JquVGxh_tcz75bfRdQJeLAjeMbdjkmWuS1IUQi7B23AEi3FJwubsbjliq7ArByM5o480hZ6-yOlIh7SlCV2zkYZKWwWyHvBPvTbQSBkNQXlkPlIj-iEgOw5UlWPc9nXLSRl",
    time: "20-30 mins",
    priceLevel: "₹",
    rating: 4.3,
  },
];

type LandingRestaurantsProps = {
  searchQuery: string;
  locationQuery: string;
  onActionClick: () => void;
};

export default function LandingRestaurants({
  searchQuery,
  locationQuery,
  onActionClick,
}: LandingRestaurantsProps): JSX.Element {
  // Filtering logic
  const filteredRestaurants = TOP_RESTAURANTS.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      restaurant.location.toLowerCase().includes(locationQuery.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <section id="restaurants" className="py-16 bg-white" data-purpose="top-restaurants-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Top Restaurants</h2>
            <p className="text-gray-500 mt-1">Handpicked top-rated restaurants near you</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <a href="#restaurants" className="text-[#FF5722] hover:text-orange-600 font-bold text-sm transition-colors">
              View All Restaurants
            </a>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img
                      alt={res.name}
                      className="w-full h-full object-cover transition-transform duration-350 hover:scale-105"
                      src={res.image}
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-sm backdrop-blur-sm">
                      <span>{res.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-green-700 stroke-none" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 leading-snug mb-1 truncate">{res.name}</h3>
                    <p className="text-gray-500 text-sm mb-2 font-medium truncate">{res.cuisine}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1.5 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {res.location}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 font-semibold">
                      <span>{res.time}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-700">{res.priceLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={onActionClick}
                    className="py-2.5 border border-gray-250 hover:border-gray-400 rounded-xl text-sm font-semibold text-gray-700 transition"
                  >
                    View Menu
                  </button>
                  <button
                    type="button"
                    onClick={onActionClick}
                    className="py-2.5 bg-[#FF5722] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Book Table
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 font-medium">
            No restaurants found matching "{searchQuery}" in "{locationQuery}"
          </div>
        )}
      </div>
    </section>
  );
}
