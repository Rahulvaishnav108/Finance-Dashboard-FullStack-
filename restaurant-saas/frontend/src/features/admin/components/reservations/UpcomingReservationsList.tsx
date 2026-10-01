import React, { useState } from 'react';
import { ArrowRight, Users, X, Search } from 'lucide-react';
import { useReservationsStore, type Reservation, type ReservationStatus } from '../../store/reservations.store';

const statusStyle: Record<ReservationStatus, string> = {
  Confirmed: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  'Walk-in': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
};

const timeColor: Record<ReservationStatus, string> = {
  Confirmed: 'text-orange-500',
  Pending:   'text-amber-500',
  Cancelled: 'text-red-500',
  'Walk-in': 'text-purple-500',
};

function ReservationRow({
  r,
  onSelect,
  isSelected,
}: {
  r: Reservation;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-all ${
        isSelected
          ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${r.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}
      >
        {r.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-xs sm:text-sm font-semibold ${timeColor[r.status]}`}>{r.time}</p>
          <span
            className={`text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[r.status]}`}
          >
            {r.status}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{r.name}</p>
        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
          <Users className="w-3 h-3" />
          {r.guests} Guests • Table {r.tableId}
        </p>
      </div>
    </button>
  );
}

export function UpcomingReservationsList(): JSX.Element {
  const { upcomingReservations, allReservations, selectedGuest, setSelectedGuest, filterStatus } =
    useReservationsStore();

  const [showViewAll, setShowViewAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUpcoming = upcomingReservations.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  const filteredAll = allReservations.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Upcoming</h3>
          <button
            type="button"
            onClick={() => setShowViewAll(true)}
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {filteredUpcoming.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            No reservations match the current filter.
          </p>
        ) : (
          <div className="space-y-1">
            {filteredUpcoming.map((r) => (
              <ReservationRow
                key={r.id}
                r={r}
                isSelected={selectedGuest?.id === r.id}
                onSelect={() => setSelectedGuest(selectedGuest?.id === r.id ? null : r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── View All Modal ─── */}
      {showViewAll && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() => setShowViewAll(false)}
          />

          <div
            className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full sm:max-w-lg sm:mx-4 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-all-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 id="view-all-title" className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  All Reservations
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {filteredAll.length} reservation{filteredAll.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowViewAll(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-5 space-y-1">
              {filteredAll.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
                  No reservations found.
                </p>
              ) : (
                filteredAll.map((r) => (
                  <ReservationRow
                    key={r.id}
                    r={r}
                    isSelected={selectedGuest?.id === r.id}
                    onSelect={() => {
                      setSelectedGuest(selectedGuest?.id === r.id ? null : r);
                      setShowViewAll(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}