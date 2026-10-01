import React, { useState, useRef } from 'react';
import { useCustomerStore } from '../store/customer.store';
import { useReservationsStore, Reservation } from '../../admin/store/reservations.store';

const TIME_SLOTS = [
  { time: '06:00 PM', status: 'available' },
  { time: '06:30 PM', status: 'available' },
  { time: '07:00 PM', status: 'available' },
  { time: '07:30 PM', status: 'available' },
  { time: '08:00 PM', status: 'available' },
  { time: '08:30 PM', status: 'limited' },
  { time: '09:00 PM', status: 'limited' },
  { time: '09:30 PM', status: 'available' },
];

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTomorrowStr = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};
const getRandomTableId = () => Math.floor(Math.random() * 12) + 1;

export default function CustomerReservationPage() {
  const { profile, addNotification } = useCustomerStore();
  const { allReservations, addReservation, updateReservation, updateReservationStatus } = useReservationsStore();
  const formRef = useRef<HTMLFormElement>(null);

  const [todayStr] = useState(getTodayStr);
  const [tomorrowStr] = useState(getTomorrowStr);

  const [guests, setGuests] = useState('2 Guests');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('07:00 PM');
  const [area, setArea] = useState('Any Preference');
  const [specialRequest, setSpecialRequest] = useState('');
  const [dateTab, setDateTab] = useState<'today' | 'tomorrow' | 'custom'>('today');

  // Track modification state
  const [modifyingId, setModifyingId] = useState<string | null>(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter reservations for current customer
  const customerReservations = allReservations.filter(
    (res) => res.email.toLowerCase() === profile.email.toLowerCase()
  );

  const handleDateTabChange = (tab: 'today' | 'tomorrow' | 'custom') => {
    setDateTab(tab);
    if (tab === 'today') {
      setDate(todayStr);
    } else if (tab === 'tomorrow') {
      setDate(tomorrowStr);
    }
  };

  const handleDateInputChange = (newDate: string) => {
    setDate(newDate);
    if (newDate === todayStr) {
      setDateTab('today');
    } else if (newDate === tomorrowStr) {
      setDateTab('tomorrow');
    } else {
      setDateTab('custom');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const guestCount = parseInt(guests) || 2;

    if (modifyingId) {
      updateReservation(modifyingId, {
        guests: guestCount,
        date,
        time,
        occasion: area,
        specialRequest,
      });
      addNotification(
        'Reservation Updated! 📅',
        `Your reservation has been modified to ${guestCount} guests on ${formatDateReadable(date)} at ${time}.`,
        'info',
        '/customer/reservations'
      );
      showToast('Reservation updated successfully!', 'success');
      setModifyingId(null);
    } else {
      const newRes = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        time,
        guests: guestCount,
        tableId: getRandomTableId(),
        status: 'Confirmed' as const,
        date,
        specialRequest,
        occasion: area,
        avatar: profile.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
        avatarColor: 'bg-orange-500',
      };
      addReservation(newRes);
      addNotification(
        'Reservation Confirmed! 📅',
        `Your table reservation for ${guestCount} guests on ${formatDateReadable(date)} at ${time} is confirmed.`,
        'info',
        '/customer/reservations'
      );
      showToast('Table reserved successfully!', 'success');
    }

    // Reset inputs
    setGuests('2 Guests');
    setDate(todayStr);
    setTime('07:00 PM');
    setArea('Any Preference');
    setSpecialRequest('');
    setDateTab('today');
  };

  const handleModify = (res: Reservation) => {
    setModifyingId(res.id);
    setGuests(`${res.guests} Guests`);
    setDate(res.date);
    setTime(res.time);
    setArea(res.occasion || 'Any Preference');
    setSpecialRequest(res.specialRequest || '');

    if (res.date === todayStr) {
      setDateTab('today');
    } else if (res.date === tomorrowStr) {
      setDateTab('tomorrow');
    } else {
      setDateTab('custom');
    }

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    showToast('Loaded reservation details', 'info');
  };

  const handleCancel = (id: string) => {
    updateReservationStatus(id, 'Cancelled');
    addNotification(
      'Reservation Cancelled 📅',
      `Your table reservation has been cancelled.`,
      'info',
      '/customer/reservations'
    );
    showToast('Reservation cancelled', 'info');
    if (modifyingId === id) {
      setModifyingId(null);
      setGuests('2 Guests');
      setDate(todayStr);
      setTime('07:00 PM');
      setArea('Any Preference');
      setSpecialRequest('');
      setDateTab('today');
    }
  };

  const formatDateReadable = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border shadow-xl animate-fade-in transition-all font-sans text-sm ${
          toastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="font-bold">{toastMessage.text}</span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Table Reservation</h2>
        <p className="text-sm text-sd-on-surface-variant font-sans">Reserve your table and enjoy a great dining experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Booking Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-sd-surface-variant sd-food-card-shadow">
            <h3 className="text-base font-bold text-sd-on-surface mb-5 font-sans">
              {modifyingId ? 'Modify Your Booking' : 'Book Your Table'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guests */}
              <div className="space-y-1.5">
                <label htmlFor="guests-select" className="text-xs font-semibold text-sd-on-surface-variant font-sans">Number of Guests</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sd-outline text-[20px]">group</span>
                  <select
                    id="guests-select"
                    className="w-full h-12 pl-10 pr-4 bg-sd-surface rounded-xl border border-sd-surface-variant focus:border-sd-primary-container focus:ring-1 focus:ring-sd-primary-container appearance-none text-sm font-sans"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option>2 Guests</option>
                    <option>4 Guests</option>
                    <option>6 Guests</option>
                    <option>8 Guests</option>
                    <option>10 Guests</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-sd-outline text-[18px]">expand_more</span>
                </div>
              </div>
              {/* Date */}
              <div className="space-y-1.5">
                <label htmlFor="date-input" className="text-xs font-semibold text-sd-on-surface-variant font-sans">Date</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sd-outline text-[20px] pointer-events-none">calendar_today</span>
                  <input
                    id="date-input"
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-sd-surface rounded-xl border border-sd-surface-variant focus:border-sd-primary-container focus:ring-1 focus:ring-sd-primary-container text-sm font-sans cursor-pointer"
                  />
                </div>
              </div>
              {/* Time */}
              <div className="space-y-1.5">
                <label htmlFor="time-select" className="text-xs font-semibold text-sd-on-surface-variant font-sans">Time</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sd-outline text-[20px]">schedule</span>
                  <select
                    id="time-select"
                    className="w-full h-12 pl-10 pr-4 bg-sd-surface rounded-xl border border-sd-surface-variant focus:border-sd-primary-container focus:ring-1 focus:ring-sd-primary-container appearance-none text-sm font-sans"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    <option>06:00 PM</option>
                    <option>06:30 PM</option>
                    <option>07:00 PM</option>
                    <option>07:30 PM</option>
                    <option>08:00 PM</option>
                    <option>08:30 PM</option>
                    <option>09:00 PM</option>
                    <option>09:30 PM</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-sd-outline text-[18px]">expand_more</span>
                </div>
              </div>
              {/* Area */}
              <div className="space-y-1.5">
                <label htmlFor="area-select" className="text-xs font-semibold text-sd-on-surface-variant font-sans">Area Preference <span className="text-sd-outline font-normal">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sd-outline text-[20px]">chair</span>
                  <select
                    id="area-select"
                    className="w-full h-12 pl-10 pr-4 bg-sd-surface rounded-xl border border-sd-surface-variant focus:border-sd-primary-container focus:ring-1 focus:ring-sd-primary-container appearance-none text-sm font-sans"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    <option>Any Preference</option>
                    <option>Indoor</option>
                    <option>Outdoor / Terrace</option>
                    <option>Private Room</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-sd-outline text-[18px]">expand_more</span>
                </div>
              </div>
              {/* Special Request */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="special-request-textarea" className="text-xs font-semibold text-sd-on-surface-variant font-sans">Special Request <span className="text-sd-outline font-normal">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-4 material-symbols-outlined text-sd-outline text-[20px]">edit_note</span>
                  <textarea
                    id="special-request-textarea"
                    className="w-full min-h-[100px] pt-4 pl-10 pr-4 bg-sd-surface rounded-xl border border-sd-surface-variant focus:border-sd-primary-container focus:ring-1 focus:ring-sd-primary-container resize-none text-sm font-sans"
                    placeholder="E.g. Birthday celebration, High chair, Window seat"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-between items-center">
              <div>
                {modifyingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setModifyingId(null);
                      setGuests('2 Guests');
                      setDate(todayStr);
                      setTime('07:00 PM');
                      setArea('Any Preference');
                      setSpecialRequest('');
                      setDateTab('today');
                      showToast('Cancelled modifications', 'info');
                    }}
                    className="px-4 py-2 border border-sd-outline text-sd-on-surface-variant rounded-xl text-xs font-bold hover:bg-sd-surface-variant/30 transition-all font-sans"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-sd-primary-container text-white px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-sd-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all font-sans"
              >
                {modifyingId ? 'Update Reservation' : 'Confirm Reservation'}
              </button>
            </div>
          </form>

          {/* Time Slots */}
          <section className="bg-white rounded-2xl p-6 border border-sd-surface-variant sd-food-card-shadow">
            <div className="flex justify-between items-end mb-5">
              <div>
                <h3 className="text-base font-bold text-sd-on-surface font-sans">Available Time Slots</h3>
                <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">{formatDateReadable(date)}</p>
              </div>
              <div className="flex bg-sd-surface rounded-lg p-1 border border-sd-surface-variant">
                {(['today', 'tomorrow', 'custom'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleDateTabChange(tab)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize font-sans transition-all ${
                      dateTab === tab ? 'bg-white shadow-sm text-sd-primary' : 'text-sd-on-surface-variant hover:bg-sd-surface-variant'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map(({ time: slotTime, status }) => {
                const isSelected = time === slotTime;
                const isLimited = status === 'limited';
                return (
                  <button
                    key={slotTime}
                    type="button"
                    onClick={() => setTime(slotTime)}
                    className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-2 border-sd-primary-container bg-sd-primary-container/5 shadow-md'
                        : 'border border-sd-surface-variant hover:border-sd-primary'
                    }`}
                  >
                    <span className={`text-sm font-bold font-sans ${isSelected ? 'text-sd-primary' : ''}`}>{slotTime}</span>
                    <span className={`text-[10px] uppercase font-bold font-sans ${isLimited ? 'text-sd-primary' : 'text-sd-secondary'}`}>
                      {isLimited ? 'Limited' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Benefits */}
          <section className="bg-white rounded-2xl p-5 border border-sd-surface-variant sd-food-card-shadow">
            <h3 className="text-base font-bold text-sd-on-surface mb-4 font-sans">Why Reserve with Us?</h3>
            <div className="space-y-3">
              {[
                { icon: 'verified_user', label: 'Guaranteed Seating', desc: 'Your table will be reserved and ready for you.', color: 'bg-green-100 text-green-600' },
                { icon: 'alarm', label: 'No Waiting', desc: 'Skip the wait and enjoy your time.', color: 'bg-orange-100 text-orange-600' },
                { icon: 'card_giftcard', label: 'Special Occasions', desc: 'Celebrate your special moments with us.', color: 'bg-purple-100 text-purple-600' },
                { icon: 'star', label: 'Best Experience', desc: 'Enjoy personalized service for a memorable dining.', color: 'bg-blue-100 text-blue-600' },
              ].map(({ icon, label, desc, color }) => (
                <div key={label} className="flex items-start gap-3 p-3 hover:bg-sd-surface-container-low rounded-xl transition-colors cursor-pointer group">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold font-sans">{label}</h4>
                    <p className="text-xs text-sd-on-surface-variant font-sans">{desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-sd-outline text-[18px] self-center group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              ))}
            </div>
          </section>

          {/* Existing Reservations list */}
          <section className="bg-white rounded-2xl border border-sd-surface-variant sd-food-card-shadow overflow-hidden">
            <div className="px-5 py-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-sd-on-surface font-sans">Your Reservations</h3>
              <span className="text-xs font-bold text-sd-primary cursor-pointer font-sans">
                ({customerReservations.length})
              </span>
            </div>
            <div className="px-5 pb-5">
              {customerReservations.length > 0 ? (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 sd-custom-scrollbar">
                  {customerReservations.map((res) => (
                    <div key={res.id} className="border border-sd-surface-variant rounded-2xl overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-sd-primary-fixed via-sd-primary-fixed-dim to-sd-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-sd-primary/30">restaurant</span>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs font-sans">{formatDateReadable(res.date)}</h4>
                            <div className="flex gap-3 mt-1">
                              <div className="flex items-center gap-1 text-sd-on-surface-variant text-[10px] font-sans">
                                <span className="material-symbols-outlined text-[12px]">schedule</span> {res.time}
                              </div>
                              <div className="flex items-center gap-1 text-sd-on-surface-variant text-[10px] font-sans">
                                <span className="material-symbols-outlined text-[12px]">group</span> {res.guests} Guests
                              </div>
                            </div>
                            {res.occasion && res.occasion !== 'Any Preference' && (
                              <div className="mt-1 text-[10px] text-sd-primary font-semibold font-sans">
                                Preference: {res.occasion}
                              </div>
                            )}
                            {res.specialRequest && (
                              <p className="mt-1.5 text-[10px] text-sd-on-surface-variant italic font-sans max-w-[170px] truncate" title={res.specialRequest}>
                                &ldquo;{res.specialRequest}&rdquo;
                              </p>
                            )}
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase font-sans ${
                            res.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            res.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>{res.status}</span>
                        </div>
                        {res.status !== 'Cancelled' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleModify(res)}
                              className="flex-1 py-1.5 border border-sd-surface-variant rounded-lg text-[10px] font-bold hover:bg-sd-surface-container transition-colors font-sans"
                            >
                              Modify
                            </button>
                            <button
                              onClick={() => handleCancel(res.id)}
                              className="flex-1 py-1.5 border border-sd-error/20 text-sd-error rounded-lg text-[10px] font-bold hover:bg-sd-error/5 transition-colors font-sans"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-sd-surface-variant rounded-2xl p-6 text-center text-sd-on-surface-variant/60 font-sans">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">calendar_today</span>
                  <p className="text-xs font-semibold">No upcoming reservations</p>
                  <p className="text-[10px] mt-0.5">Use the form to book your table</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
