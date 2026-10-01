import React, { useState } from 'react';
import { useCart } from './CartContext';
import type { MenuItem } from './SearchContext';

interface Props {
  item: MenuItem;
}

export default function FoodCard({ item }: Props) {
  const { addItem } = useCart();
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white rounded-[10px] overflow-hidden border border-sd-outline-variant hover:shadow-xl transition-all group flex flex-col sd-food-card-shadow">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-sd-surface-container">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-sd-on-surface-variant/30">restaurant</span>
          </div>
        )}
        {item.badge && (
          <div className="absolute top-3 left-3 bg-sd-primary-container text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg font-sans">
            {item.badge}
          </div>
        )}
        <button
          onClick={() => setIsFav(!isFav)}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${isFav ? 'text-red-500' : 'text-sd-on-surface'}`}
            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {item.isVeg ? (
              <div className="w-4 h-4 border-2 border-green-700 rounded-none flex items-center justify-center shrink-0" style={{ borderRadius: '0px' }} title="Veg">
                <div className="w-2 h-2 rounded-full bg-green-700" />
              </div>
            ) : (
              <div className="w-4 h-4 border-2 border-red-700 rounded-none flex items-center justify-center shrink-0" style={{ borderRadius: '0px' }} title="Non-Veg">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-700" />
              </div>
            )}
            <h4 className="text-base font-bold text-sd-on-surface font-sans leading-tight">{item.name}</h4>
          </div>
          <div className="flex items-center gap-1 text-sd-secondary font-bold shrink-0 ml-2">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-xs font-sans">
              {item.rating} ({item.reviews})
            </span>
          </div>
        </div>
        <p className="text-sm text-sd-on-surface-variant mb-4 line-clamp-2 font-sans">{item.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <div className="text-lg font-bold text-sd-primary font-sans">₹{item.price}</div>
          <button
            onClick={() =>
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
              })
            }
            className="bg-white border-2 border-sd-primary-container text-sd-primary-container hover:bg-sd-primary-container hover:text-white px-6 py-2 rounded-[5px] text-sm font-bold transition-all active:scale-95 font-sans"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
