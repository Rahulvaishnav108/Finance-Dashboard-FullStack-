import React from "react";
import { Star, ArrowRight } from "lucide-react";

export interface Dish {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
}

export const TOP_DISHES: Dish[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    price: "$14.99",
    rating: 4.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpmx4Bkk_gyFui05O8n_SeInd18uTFu2pdRmDrAiYolSF8zluxrdOKwDEDEryr_XMhGSReb0B0BSUKf8Oko6zpkE4w_KqH5uDzehYJOXfx0uUAVIHL9IRM6atzWSsXpMfNtxUf1oDBjKNTMTyV-aNCkmciNaBNz-NeZXqaqSgyBrY35Id4UYAbztaJr-mgQno_sTVZL3oZcIkq8zjUdKDeD7HQuOS67SO6G-dtbavD7r0tJ5EWfGyvVDBE2VMZT-X1xzjxgo_NkZ8F",
  },
  {
    id: 2,
    name: "Classic Burger",
    price: "$12.49",
    rating: 4.6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS8pZKVTWabWQZ-bCvBomJchws0y7j1UoX0eRjyQguvtv3FxapFdGtVz7tONLceUg93uZs-gUBI0xWelBn0-eTCYddC6ynjuC5zu0uPg8JLwK-XwP21QvnZzBTm4-FdjK2JrcfjO2dCLTGqwzKyJxEtD-1nkzDgPhGu3ZSaKy-Z2wJOjGsRd8OMK9mcO6dOO29GiklDepS6B9luaVRe6WqFMHNFeoaE9MG3VM6sb2Z4WFRUbV4odx6ORKDMrw6_FFNa9fhBdvAg6WC",
  },
  {
    id: 3,
    name: "Creamy Alfredo Pasta",
    price: "$13.99",
    rating: 4.7,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJGUaPhR610HcnTPQ9EZLHqqktSUBcmE8Ui3fyLFEwkbayWHldzjEbCxeTo5LuJpF5E_YtWh5CYuYaCVbdiWfTc72MD74__2exzRFvhy3yWbw8qw6Rn_3TuBV61Wlyx3rpk2aHkM2PU3sXbUChvNXmT5UouYVWs357UuTiyLExdKeBBviHqIPpV2FpyZh5A4q3cmAf5_9CC1NXsXLa091lJTydEoa2m_MEDKDbiLn31mbzsHWDT786y78Jmra2qHBfI0EgolTMqOTX",
  },
  {
    id: 4,
    name: "Caesar Salad",
    price: "$9.99",
    rating: 4.4,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFf6YEmtflB9l4_wJ6E2pwX2OAvdjWx7xurggSEZg4Z0G_5yyhfzdaVvisdMXc1kCLtTcVngNmVYQ9ajPtNZ1kpVKq5LBQ98o5Q9ZQ-DZQHytWAHzRqtmtlBmzj2YjCDjJpISy5Z-mUNFJHZo88IKw1I3S8DKlbTwZBioaagzElxajzVHe9ZJAOhFloVILHtjRXsW3jxpnMuDBHd5j8WBdDugjVHAstFlFE0bDGM3zbqfq6NRc3ieLvj4AXcULzueUzMcXIFH4fTLB",
  },
  {
    id: 5,
    name: "Hyderabadi Biryani",
    price: "$11.99",
    rating: 4.6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrNY2xTEg4xEiAphlBAdh9KiV38SnIvBei94Bt9hFZC8ojGFFmFFdYVBZ5lvRj8DEpA0BhJBDeur9dnnZXPZXVDWcLGVsVipN7TqvmGsydJJrjtKB7abmC7tuar9Viso_VTjjGxBIsXZw_ZnEVFD--e54_jYMvJzx22R60PJmw6yutL2SxlxIodeKcqZ07HhLUUKpugM3GWGoopak_Cj7gkklprr_0pKLV-XmcVRjEgzF7oa2Ei7rrEM9QmjgaVK0bZ-_42WuwFil",
  },
];

type LandingDishesProps = {
  searchQuery: string;
  onActionClick: () => void;
};

export default function LandingDishes({ searchQuery, onActionClick }: LandingDishesProps): JSX.Element {
  // Filter dishes based on query
  const filteredDishes = TOP_DISHES.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="dishes" className="py-16 bg-gray-50/70 border-t border-b border-gray-100" data-purpose="top-dishes-section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Top Dishes</h2>
            <p className="text-gray-500 mt-1">Most loved dishes by foodies</p>
          </div>
          <a
            href="#dishes"
            className="text-[#FF5722] hover:text-orange-600 font-bold text-sm flex items-center gap-1 transition-colors"
          >
            View All Dishes
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Scrollable Container / Flex */}
        {filteredDishes.length > 0 ? (
          <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="min-w-[260px] max-w-[280px] bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between snap-start"
              >
                <div>
                  <div className="h-36 overflow-hidden rounded-xl bg-gray-100 mb-4">
                    <img
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-350 hover:scale-105"
                      src={dish.image}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-gray-800 text-base leading-tight truncate">{dish.name}</h4>
                    <span className="text-gray-600 text-xs font-bold shrink-0">{dish.rating}</span>
                  </div>

                  {/* Star Rating Icons */}
                  <div className="flex text-amber-500 mb-4">
                    {[...Array(5)].map((_, i) => {
                      const filled = i < Math.floor(dish.rating);
                      return (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${filled ? "fill-current" : "text-gray-200 fill-none"}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <span className="font-extrabold text-gray-900 text-lg">{dish.price}</span>
                  <button
                    type="button"
                    onClick={onActionClick}
                    className="text-[#FF5722] text-xs font-bold border border-[#FF5722] hover:bg-[#FF5722] hover:text-white px-4 py-2 rounded-xl transition"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 font-medium">
            No dishes found matching "{searchQuery}"
          </div>
        )}
      </div>
    </section>
  );
}
