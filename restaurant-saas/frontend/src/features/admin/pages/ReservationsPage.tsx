import React, { useState } from 'react';
import { CalendarDays, Filter, Plus, ChevronDown, X, Check } from 'lucide-react';
import { ReservationStatCards } from '../components/reservations/ReservationStatCards';
import { ReservationCalendar } from '../components/reservations/ReservationCalendar';
import { UpcomingReservationsList } from '../components/reservations/UpcomingReservationsList';
import { TableAvailabilityGrid } from '../components/reservations/TableAvailabilityGrid';
import { GuestDetailsPanel } from '../components/reservations/GuestDetailsPanel';
import { TimeSlotsOverview } from '../components/reservations/TimeSlotsOverview';
import { ReservationAnalyticsBar } from '../components/reservations/ReservationAnalyticsBar';
import { useReservationsStore, type ReservationStatus } from '../store/reservations.store';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500',
  'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
];

const STATUS_OPTIONS: Array<'All' | ReservationStatus> = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Walk-in'];

const DATES = [
  'Today, May 20',
  'Tomorrow, May 21',
  'May 22, 2025',
  'May 23, 2025',
  'May 24, 2025',
  'May 25, 2025',
  'May 26, 2025',
];

export default function ReservationsPage(): JSX.Element {
  const { selectedDate, setSelectedDate, filterStatus, setFilterStatus, filterTime, setFilterTime, addReservation } =
    useReservationsStore();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    tableId: 2,
    specialRequest: '',
    occasion: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [localFilterStatus, setLocalFilterStatus] = useState<'All' | ReservationStatus>(filterStatus);
  const [localFilterTime, setLocalFilterTime] = useState(filterTime);

  const handleFormChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleCreateReservation = () => {
    if (!form.name.trim()) { setFormError('Guest name is required.'); return; }
    if (!form.phone.trim()) { setFormError('Phone number is required.'); return; }
    if (!form.date) { setFormError('Please select a date.'); return; }
    if (!form.time) { setFormError('Please select a time.'); return; }

    const initials = form.name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    addReservation({
      name: form.name.trim(),
      avatar: initials,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      time: form.time,
      guests: form.guests,
      tableId: form.tableId,
      status: 'Pending',
      date: form.date,
      phone: form.phone.trim(),
      email: form.email.trim(),
      specialRequest: form.specialRequest.trim() || undefined,
      occasion: form.occasion.trim() || undefined,
    });

    setFormSuccess(true);
    setTimeout(() => {
      setShowNewModal(false);
      setFormSuccess(false);
      setForm({ name: '', phone: '', email: '', date: '', time: '', guests: 2, tableId: 2, specialRequest: '', occasion: '' });
    }, 1200);
  };

  const handleApplyFilter = () => {
    setFilterStatus(localFilterStatus);
    setFilterTime(localFilterTime);
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setLocalFilterStatus('All');
    setLocalFilterTime('');
    setFilterStatus('All');
    setFilterTime('');
    setShowFilterModal(false);
  };

  const isFilterActive = filterStatus !== 'All' || filterTime !== '';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Reservations</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage all restaurant reservations and table bookings
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0">
          {/* Date Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowDateModal((v) => !v); setShowFilterModal(false); }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <span className="max-w-[90px] sm:max-w-none truncate">{selectedDate}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
            </button>

            {showDateModal && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-30 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-2 w-52">
                {DATES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setSelectedDate(d); setShowDateModal(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      selectedDate === d
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {d}
                    {selectedDate === d && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowFilterModal((v) => !v); setShowDateModal(false); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
                isFilterActive
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-600'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Filter
              {isFilterActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              )}
            </button>

            {showFilterModal && (
              <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Filter Reservations</p>
                  <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setLocalFilterStatus(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          localFilterStatus === s
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Time (from)</p>
                  <input
                    type="time"
                    value={localFilterTime}
                    onChange={(e) => setLocalFilterTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="flex-1 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Reservation */}
          <button
            type="button"
            onClick={() => { setShowNewModal(true); setShowDateModal(false); setShowFilterModal(false); }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">New </span>Reservation
          </button>
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {(showDateModal || showFilterModal) && (
        <button
          type="button"
          aria-label="Close dropdown"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => { setShowDateModal(false); setShowFilterModal(false); }}
        />
      )}

      {/* Stats */}
      <ReservationStatCards />

      {/* Main grid — stacks on mobile, 12-col on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="md:col-span-1 lg:col-span-4">
          <ReservationCalendar />
        </div>
        <div className="md:col-span-1 lg:col-span-3">
          <UpcomingReservationsList />
        </div>
        <div className="md:col-span-1 lg:col-span-3">
          <TableAvailabilityGrid />
        </div>
        <div className="md:col-span-1 lg:col-span-2">
          <GuestDetailsPanel />
        </div>
      </div>

      {/* Time Slots + Analytics */}
      <TimeSlotsOverview />
      <ReservationAnalyticsBar />

      {/* ─── New Reservation Modal ─── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() => { setShowNewModal(false); setFormError(''); setFormSuccess(false); }}
          />

          <div
            className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-reservation-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="new-reservation-title" className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                New Reservation
              </h2>
              <button
                type="button"
                onClick={() => { setShowNewModal(false); setFormError(''); setFormSuccess(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">Reservation Created!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Added to upcoming reservations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Guest Name', field: 'name', placeholder: 'Enter full name', type: 'text' },
                  { label: 'Phone', field: 'phone', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                  { label: 'Email', field: 'email', placeholder: 'guest@email.com', type: 'email' },
                  { label: 'Date', field: 'date', placeholder: '', type: 'date' },
                  { label: 'Time', field: 'time', placeholder: '', type: 'time' },
                  { label: 'Occasion (optional)', field: 'occasion', placeholder: 'e.g. Anniversary, Birthday', type: 'text' },
                ].map(({ label, field, placeholder, type }) => {
                  const fieldId = `new-res-${field}`;
                  return (
                    <div key={field}>
                      <label htmlFor={fieldId} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {label}
                      </label>
                      <input
                        id={fieldId}
                        type={type}
                        placeholder={placeholder}
                        value={form[field as keyof typeof form] as string}
                        onChange={(e) => handleFormChange(field, e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 dark:focus:border-orange-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 transition-all"
                      />
                    </div>
                  );
                })}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-res-guests" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Guests
                    </label>
                    <input
                      id="new-res-guests"
                      type="number"
                      min="1"
                      max="20"
                      value={form.guests}
                      onChange={(e) => handleFormChange('guests', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 text-gray-800 dark:text-gray-100 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-res-table" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Table
                    </label>
                    <select
                      id="new-res-table"
                      value={form.tableId}
                      onChange={(e) => handleFormChange('tableId', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 transition-all"
                    >
                      {[2, 4, 6, 8, 10, 11, 12].map((t) => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="new-res-special-request" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Special Request
                  </label>
                  <textarea
                    id="new-res-special-request"
                    rows={2}
                    placeholder="Any dietary requirements or special notes..."
                    value={form.specialRequest}
                    onChange={(e) => handleFormChange('specialRequest', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 resize-none transition-all"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">{formError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowNewModal(false); setFormError(''); }}
                    className="flex-1 py-2.5 sm:py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReservation}
                    className="flex-1 py-2.5 sm:py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
                  >
                    Create Reservation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}