import React, { useState } from 'react';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';

interface Reservation {
  id: number;
  name: string;
  pax: number;
  time: string;
  phone: string;
  status: 'Confirmed' | 'Seated' | 'Cancelled';
  type: 'Reservation' | 'Walk-in';
  queueNo?: number;
}

export default function StaffReservationsPage() {
  const { query } = useStaffSearch();
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 1, name: 'Ananya Roy', pax: 4, time: '07:30 PM', phone: '+91 98765 43210', status: 'Confirmed', type: 'Reservation' },
    { id: 2, name: 'Vikram Singh', pax: 2, time: '08:00 PM', phone: '+91 87654 32109', status: 'Confirmed', type: 'Reservation' },
    { id: 3, name: 'Siddharth Sen', pax: 5, time: '15 mins wait', phone: '+91 76543 21098', status: 'Confirmed', type: 'Walk-in', queueNo: 1 },
    { id: 4, name: 'Megha Gupta', pax: 3, time: '25 mins wait', phone: '+91 65432 10987', status: 'Confirmed', type: 'Walk-in', queueNo: 2 },
    { id: 5, name: 'Kabir Mehta', pax: 6, time: '09:00 PM', phone: '+91 54321 09876', status: 'Confirmed', type: 'Reservation' },
  ]);

  // Form states for adding walk-in
  const [walkinName, setWalkinName] = useState('');
  const [walkinPax, setWalkinPax] = useState('2');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) return;

    const nextQueueNo = reservations.filter(r => r.type === 'Walk-in').length + 1;
    const newWalkin: Reservation = {
      id: Math.random(),
      name: walkinName,
      pax: parseInt(walkinPax, 10),
      time: 'Just added',
      phone: walkinPhone,
      status: 'Confirmed',
      type: 'Walk-in',
      queueNo: nextQueueNo
    };

    setReservations([...reservations, newWalkin]);
    setWalkinName('');
    setWalkinPhone('');
    setShowAddForm(false);
  };

  const updateStatus = (id: number, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = reservations.filter(r =>
    r.status === 'Confirmed' && (
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.phone.includes(query) ||
      r.type.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Reservations & Walk-in Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage table bookings and queue waitlist.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-dine-orange hover:bg-dine-orange/90 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">{showAddForm ? 'close' : 'add'}</span>
          {showAddForm ? 'Cancel Form' : 'Register Walk-in'}
        </button>
      </div>

      {/* Walk-in Form Modal/Card */}
      {showAddForm && (
        <form onSubmit={addWalkin} className="bg-white border border-slate-150 p-6 rounded-2xl shadow-soft space-y-4 max-w-xl animate-fadeIn">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">Walk-in Registry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="walkin-name" className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-sans">Guest Name</label>
              <input
                id="walkin-name"
                type="text"
                required
                value={walkinName}
                onChange={e => setWalkinName(e.target.value)}
                placeholder="Name"
                className="w-full text-xs font-sans p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="walkin-pax" className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-sans">Number of Guests</label>
              <select
                id="walkin-pax"
                value={walkinPax}
                onChange={e => setWalkinPax(e.target.value)}
                className="w-full text-xs font-sans p-2 border border-slate-200 rounded-xl"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n.toString()}>{n} Pax</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="walkin-phone" className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-sans">Phone Number</label>
              <input
                id="walkin-phone"
                type="tel"
                required
                value={walkinPhone}
                onChange={e => setWalkinPhone(e.target.value)}
                placeholder="+91..."
                className="w-full text-xs font-sans p-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-dine-orange hover:bg-dine-orange/95 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all"
          >
            Add to Waitlist
          </button>
        </form>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waitlist Queue (1/3) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-105">
            <span className="material-symbols-outlined text-dine-orange">groups</span>
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 font-sans">Walk-in Waitlist</h2>
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {filtered.filter(r => r.type === 'Walk-in').length > 0 ? (
              filtered.filter(r => r.type === 'Walk-in').map(q => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-dine-orange text-white font-black text-xs flex items-center justify-center font-sans">
                        {q.queueNo}
                      </span>
                      <span className="font-extrabold text-xs text-slate-850 dark:text-slate-200 font-sans">{q.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-1">Pax: {q.pax} • Wait: {q.time}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateStatus(q.id, 'Seated')}
                      className="bg-green-500 hover:bg-green-655 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all"
                    >
                      Seat
                    </button>
                    <button
                      onClick={() => updateStatus(q.id, 'Seated')}
                      className="border border-slate-100 text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-all"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-450 text-center py-8">Waitlist is currently empty.</p>
            )}
          </div>
        </div>

        {/* Reservations (2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-dine-orange">book_online</span>
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 font-sans">Today&apos;s Bookings</h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <th className="py-3">Guest</th>
                  <th className="py-3">Pax</th>
                  <th className="py-3">Booking Time</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-55">
                {filtered.filter(r => r.type === 'Reservation').length > 0 ? (
                  filtered.filter(r => r.type === 'Reservation').map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 text-xs font-sans">{res.name}</td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs font-sans">{res.pax} Pax</td>
                      <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-350 text-xs font-sans">{res.time}</td>
                      <td className="py-3.5 text-slate-450 dark:text-slate-400 text-xs font-sans">{res.phone}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => updateStatus(res.id, 'Seated')}
                            className="bg-dine-orange hover:bg-dine-orange/95 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all"
                          >
                            Seat Guest
                          </button>
                          <button
                            onClick={() => updateStatus(res.id, 'Seated')}
                            className="border border-slate-100 text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-all"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                      No matching reservations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
