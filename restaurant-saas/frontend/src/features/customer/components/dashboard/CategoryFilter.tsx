import React from 'react';
import { useSearch, CATEGORIES } from './SearchContext';

export default function CategoryFilter() {
  const { activeCategory, setActiveCategory } = useSearch();

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 sd-no-scrollbar">
      {CATEGORIES.map(({ name, icon }) => {
        const isActive = activeCategory === name;
        return (
          <button
            key={name}
            onClick={() => setActiveCategory(name)}
            className={`flex flex-col items-center justify-center min-w-[72px] h-[80px] rounded-[10px] transition-all shrink-0 ${
              isActive
                ? 'bg-sd-primary-container text-white shadow-lg shadow-sd-primary-container/20 hover:scale-105'
                : 'bg-sd-surface border border-sd-surface-variant text-sd-on-surface-variant hover:bg-sd-surface-container hover:border-sd-primary/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full ${isActive ? 'bg-white/20' : ''} flex items-center justify-center mb-1`}>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
            </div>
            <span className="text-[11px] font-semibold font-sans">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
