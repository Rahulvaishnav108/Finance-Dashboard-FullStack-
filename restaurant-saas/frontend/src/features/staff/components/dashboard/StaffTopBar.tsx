import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffSearch } from './StaffSearchContext';
import { useStaffProfile } from '../../hooks/useStaffProfile';

export default function StaffTopBar() {
  const { query, setQuery } = useStaffSearch();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { profile } = useStaffProfile();
  const navigate = useNavigate();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  if (mobileSearchOpen) {
    return (
      <header className="h-16 flex items-center px-4 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0 dark:bg-sd-surface-container dark:border-sd-outline-variant/40">
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => { setMobileSearchOpen(false); setQuery(''); }} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-sd-surface-variant rounded-full">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-sd-surface-container-low border border-slate-200 dark:border-sd-outline-variant/40 rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-slate-400 mr-2 text-[18px]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full font-sans text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-650">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0 dark:bg-sd-surface-container dark:border-sd-outline-variant/40">
      {/* Left side: Stats & Time Info */}
      <div className="hidden md:flex gap-8 lg:gap-12 items-center">
        <div>
          <p className="text-[10px] text-slate-400 font-sans mb-0.5">Time</p>
          <p className="text-lg font-bold text-dine-orange font-sans">{timeStr}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-sans mb-0.5">Date</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-sans">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-xs border border-green-100 dark:border-green-900/30 font-sans">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE SHIFT
          </div>
        </div>
        <div className="hidden xl:flex gap-8 border-l border-slate-200 dark:border-sd-outline-variant/40 pl-8">
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5 font-sans">My Tables</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-sans">1, 2, 3, 4</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5 font-sans">Active Tasks</p>
            <p className="text-lg font-bold text-dine-orange font-sans">5 Pending</p>
          </div>
        </div>
      </div>

      {/* Mobile view brand name */}
      <div className="flex md:hidden items-center gap-2">
        <div className="bg-dine-light-orange p-1.5 rounded-lg">
          <span className="material-symbols-outlined text-dine-orange text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 font-sans">DineEase</span>
      </div>

      {/* Right side: Search input, notifications, and profile avatar */}
      <div className="flex items-center gap-3">
        {/* Desktop Search Input */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-sd-outline-variant/40 rounded-full text-sm bg-slate-50 dark:bg-sd-surface-container-low focus:outline-none focus:ring-2 focus:ring-dine-orange w-48 font-sans text-slate-800 dark:text-slate-200"
            placeholder="Search panels..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Mobile Search Icon Toggle */}
        <button onClick={() => setMobileSearchOpen(true)} className="flex md:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-sd-surface-variant rounded-full">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-sd-surface-variant rounded-full transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">5</span>
        </button>

        {/* Profile Avatar (placed on top-right) */}
        <button
          onClick={() => navigate('/staff/profile')}
          className="w-9 h-9 rounded-full bg-dine-orange/15 hover:bg-dine-orange/20 flex items-center justify-center text-dine-orange font-bold text-xs cursor-pointer hover:ring-2 hover:ring-dine-orange transition-all overflow-hidden focus:outline-none"
          title="View Profile"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
          )}
        </button>
      </div>
    </header>
  );
}
