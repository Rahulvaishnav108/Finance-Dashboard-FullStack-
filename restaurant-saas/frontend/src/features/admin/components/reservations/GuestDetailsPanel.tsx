import React, { useState } from 'react';
import {
  Phone, Mail, Calendar, Clock, Users, Utensils, ChevronRight,
  Edit3, X, Check, History, MessageSquare,
} from 'lucide-react';
import {
  useReservationsStore,
  type ReservationStatus,
  type Reservation,
} from '../../store/reservations.store';

const statusStyle: Record<ReservationStatus, string> = {
  Confirmed: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  'Walk-in': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
};

const MOCK_HISTORY: Record<
  string,
  Array<{ date: string; occasion?: string; guests: number; total: string; note?: string }>
> = {
  r1: [
    { date: 'Apr 14, 2025', occasion: 'Anniversary Dinner', guests: 4, total: '₹3,240', note: 'Requested quiet table' },
    { date: 'Jan 20, 2025', guests: 2, total: '₹1,580' },
    { date: 'Dec 25, 2024', occasion: "New Year's Eve", guests: 4, total: '₹4,100', note: 'Complimentary dessert' },
  ],
  r2: [{ date: 'Mar 10, 2025', guests: 2, total: '₹980' }],
  r3: [
    { date: 'Feb 14, 2025', occasion: "Valentine's Day", guests: 6, total: '₹5,200' },
    { date: 'Nov 12, 2024', guests: 4, total: '₹2,800' },
  ],
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900 flex items-center justify-center mb-3 sm:mb-4">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">No guest selected</p>
      <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
        Click a reservation to view details
      </p>
    </div>
  );
}

interface EditModalProps {
  guest: Reservation;
  onClose: () => void;
  onSave: (updates: Partial<Reservation>) => void;
}

function EditModal({ guest, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    name: guest.name,
    phone: guest.phone,
    email: guest.email,
    time: guest.time,
    guests: guest.guests,
    tableId: guest.tableId,
    specialRequest: guest.specialRequest ?? '',
    occasion: guest.occasion ?? '',
    status: guest.status,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      time: form.time,
      guests: form.guests,
      tableId: form.tableId,
      specialRequest: form.specialRequest.trim() || undefined,
      occasion: form.occasion.trim() || undefined,
      status: form.status as ReservationStatus,
    });
    setSaved(true);
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
      />

      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-guest-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="edit-guest-title"
            className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-orange-500" />
            Edit Reservation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">Changes Saved!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Guest Name', field: 'name', type: 'text' },
              { label: 'Phone', field: 'phone', type: 'tel' },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Time', field: 'time', type: 'time' },
              { label: 'Occasion (optional)', field: 'occasion', type: 'text' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label
                  htmlFor={`edit-${field}`}
                  className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
                >
                  {label}
                </label>
                <input
                  id={`edit-${field}`}
                  type={type}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-800 dark:text-gray-100 transition-all"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-guests"
                  className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
                >
                  Guests
                </label>
                <input
                  id="edit-guests"
                  type="number"
                  min="1"
                  max="20"
                  value={form.guests}
                  onChange={(e) => setForm((p) => ({ ...p, guests: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-table"
                  className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
                >
                  Table
                </label>
                <select
                  id="edit-table"
                  value={form.tableId}
                  onChange={(e) => setForm((p) => ({ ...p, tableId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
                    <option key={t} value={t}>
                      Table {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-status"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
              >
                Status
              </label>
              <select
                id="edit-status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value as ReservationStatus }))
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 transition-all"
              >
                {(['Confirmed', 'Pending', 'Cancelled', 'Walk-in'] as ReservationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-specialRequest"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
              >
                Special Request
              </label>
              <textarea
                id="edit-specialRequest"
                rows={2}
                value={form.specialRequest}
                onChange={(e) => setForm((p) => ({ ...p, specialRequest: e.target.value }))}
                placeholder="Any dietary requirements or special notes..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 resize-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 sm:py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 sm:py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface HistoryModalProps {
  guest: Reservation;
  onClose: () => void;
}

function HistoryModal({ guest, onClose }: HistoryModalProps) {
  const history = MOCK_HISTORY[guest.id] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
      />

      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full sm:max-w-md sm:mx-4 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${guest.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
              {guest.avatar}
            </div>
            <div>
              <h2
                id="history-title"
                className="text-sm sm:text-base font-bold text-gray-900 dark:text-white"
              >
                {guest.name}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Visit History</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
          {[
            { label: 'Total Visits', value: String(history.length || 1) },
            {
              label: 'Total Spent',
              value: history.length
                ? '₹' +
                  history
                    .reduce((s, h) => s + parseInt(h.total.replace(/[₹,]/g, '')), 0)
                    .toLocaleString('en-IN')
                : '₹0',
            },
            {
              label: 'Avg. Party',
              value: history.length
                ? String(Math.round(history.reduce((s, h) => s + h.guests, 0) / history.length))
                : String(guest.guests),
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-900 px-3 sm:px-4 py-2.5 sm:py-3 text-center">
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {history.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <History className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No previous visits on record.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">This is their first reservation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">{h.date}</p>
                      <p className="text-xs sm:text-sm font-bold text-orange-500 flex-shrink-0">{h.total}</p>
                    </div>
                    {h.occasion && (
                      <p className="text-[11px] sm:text-xs text-purple-500 dark:text-purple-400 font-medium mt-0.5">
                        🎉 {h.occasion}
                      </p>
                    )}
                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {h.guests} guests
                    </p>
                    {h.note && (
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
                        <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 sm:py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuestDetailsPanel(): JSX.Element {
  const { selectedGuest, updateReservation } = useReservationsStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveEdits = (updates: Partial<Reservation>) => {
    if (selectedGuest) {
      updateReservation(selectedGuest.id, updates);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
          Guest Details
        </h3>

        {!selectedGuest ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${selectedGuest.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {selectedGuest.avatar}
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">
                  {selectedGuest.name}
                </p>
                <span
                  className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[selectedGuest.status]}`}
                >
                  {selectedGuest.status}
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span>{selectedGuest.phone}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{selectedGuest.email}</span>
              </div>
            </div>

            {/* Special request */}
            {selectedGuest.specialRequest && (
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-2.5 sm:p-3">
                <p className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Special Request
                </p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {selectedGuest.specialRequest}
                </p>
              </div>
            )}

            {/* Reservation details */}
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 uppercase tracking-wide">
                Reservation Details
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, text: selectedGuest.date },
                  { icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, text: selectedGuest.time },
                  { icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, text: `${selectedGuest.guests} Guests` },
                  { icon: <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, text: `Table ${selectedGuest.tableId}` },
                ].map(({ icon, text }, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {icon}
                    {text}
                  </div>
                ))}
                {selectedGuest.occasion && (
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-sm sm:text-base">🎉</span>
                    {selectedGuest.occasion}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
              >
                History
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showEdit && selectedGuest && (
        <EditModal
          guest={selectedGuest}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdits}
        />
      )}

      {showHistory && selectedGuest && (
        <HistoryModal guest={selectedGuest} onClose={() => setShowHistory(false)} />
      )}
    </>
  );
}