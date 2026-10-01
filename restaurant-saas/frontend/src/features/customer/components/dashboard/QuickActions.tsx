import React, { useState } from 'react';
import { useCustomerStore } from '../../store/customer.store';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const ACTIONS: QuickAction[] = [
  { icon: 'receipt_long', label: 'Request Bill', description: 'Get your bill at the table', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-950/40' },
  { icon: 'restaurant', label: 'Extra Cutlery', description: 'Request additional cutlery', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-950/40' },
  { icon: 'water_drop', label: 'Call for Water', description: 'Request water service', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-950/40' },
  { icon: 'layers', label: 'Extra Napkins', description: 'Request extra napkins', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950/40' },
  { icon: 'cleaning_services', label: 'Cleaning Staff', description: 'Request table cleaning', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-950/40' },
  { icon: 'support_agent', label: 'Call Waiter', description: 'Request waiter assistance', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-950/40' },
  { icon: 'edit_note', label: 'Additional Request', description: 'Write a custom request to staff', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-950/40' },
];

export default function QuickActions() {
  const { requestService } = useCustomerStore();
  const [sentActions, setSentActions] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState('');

  // Modal State for Writing Request
  const [activeActionForModal, setActiveActionForModal] = useState<QuickAction | null>(null);
  const [requestNotes, setRequestNotes] = useState('');

  function handleActionClick(action: QuickAction) {
    setActiveActionForModal(action);
    setRequestNotes('');
  }

  function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeActionForModal) return;

    const action = activeActionForModal;
    const isAdditionalRequest = action.label === 'Additional Request';

    if (isAdditionalRequest && !requestNotes.trim()) {
      return; // Notes required for additional requests
    }

    // Submit to Zustand store
    requestService({
      id: action.label.toLowerCase().replace(/\s+/g, '-'),
      label: action.label,
      description: requestNotes.trim() ? `Notes: ${requestNotes}` : action.description,
      type: action.label === 'Call Waiter' ? 'waiter' : action.label === 'Call for Water' ? 'water' : action.label === 'Cleaning Staff' ? 'cleaning' : 'other',
    });

    setSentActions((prev) => new Set(prev).add(action.label));

    const displayMsg = requestNotes.trim()
      ? `✅ ${action.label} sent: "${requestNotes}"`
      : `✅ ${action.label} request sent to staff!`;

    setToastMsg(displayMsg);
    setActiveActionForModal(null);

    // Clear Toast
    setTimeout(() => setToastMsg(''), 4000);

    // Auto-reset after 30s so user can re-request
    setTimeout(() => {
      setSentActions((prev) => {
        const next = new Set(prev);
        next.delete(action.label);
        return next;
      });
    }, 30000);
  }

  return (
    <>
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-base font-bold text-sd-on-surface font-sans">Quick Actions</h3>
            <p className="text-xs text-sd-on-surface-variant font-sans">Tap to request service at your table</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {ACTIONS.map((action) => {
            const isSent = sentActions.has(action.label);
            return (
              <button
                key={action.label}
                onClick={() => !isSent && handleActionClick(action)}
                disabled={isSent}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${
                  isSent
                    ? 'border-sd-secondary/30 dark:border-green-800/30 bg-sd-secondary-container/10 dark:bg-green-950/20 cursor-default'
                    : 'border-sd-outline-variant dark:border-sd-outline-variant/40 bg-white dark:bg-sd-surface-container hover:shadow-md hover:border-sd-primary/30 active:scale-95'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                    isSent ? 'bg-sd-secondary-container/20 dark:bg-green-950/40' : action.bgColor
                  } ${!isSent ? 'group-hover:scale-110' : ''}`}
                >
                  <span
                    className={`material-symbols-outlined text-[24px] ${isSent ? 'text-sd-secondary dark:text-green-400' : action.color}`}
                    style={{ fontVariationSettings: isSent ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isSent ? 'check_circle' : action.icon}
                  </span>
                </div>
                <span className={`text-xs font-bold font-sans ${isSent ? 'text-sd-secondary dark:text-green-400' : 'text-sd-on-surface'}`}>
                  {isSent ? 'Sent!' : action.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Action Request Modal with Notes */}
      {activeActionForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant w-full max-w-md overflow-hidden shadow-2xl p-6 animate-scaleIn">
            <h3 className="font-bold text-lg font-sans text-sd-on-surface flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined ${activeActionForModal.color}`}>{activeActionForModal.icon}</span>
              {activeActionForModal.label}
            </h3>

            <p className="text-xs text-sd-on-surface-variant font-sans mb-4">
              {activeActionForModal.label === 'Additional Request'
                ? 'Please type your custom request details below so our table staff can assist you.'
                : 'You can add specific details to this request below (optional).'}
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label htmlFor="requestNotes" className="block text-xs font-bold text-sd-on-surface-variant uppercase tracking-wider mb-1 font-sans">
                  {activeActionForModal.label === 'Additional Request' ? 'Request Details *' : 'Optional Notes'}
                </label>
                <textarea
                  id="requestNotes"
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sd-surface-variant focus:outline-none focus:ring-2 focus:ring-sd-primary focus:border-sd-primary font-sans text-sm bg-transparent dark:text-white"
                  placeholder={
                    activeActionForModal.label === 'Extra Cutlery'
                      ? 'e.g., 2 forks, 1 extra plate'
                      : activeActionForModal.label === 'Call for Water'
                      ? 'e.g., Warm water, extra glass'
                      : activeActionForModal.label === 'Extra Napkins'
                      ? 'e.g., 4 extra napkins, wet wipes'
                      : activeActionForModal.label === 'Additional Request'
                      ? 'e.g., Please bring a baby high chair to table 4'
                      : 'Type notes here...'
                  }
                  required={activeActionForModal.label === 'Additional Request'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveActionForModal(null)}
                  className="px-4 py-2.5 border border-sd-surface-variant hover:bg-sd-surface-container rounded-xl text-xs font-bold font-sans transition-all text-sd-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sd-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-sd-inverse-surface text-white px-6 py-3 rounded-2xl shadow-xl z-[100] animate-fadeIn font-sans text-sm font-semibold max-w-[90vw] text-center">
          {toastMsg}
        </div>
      )}
    </>
  );
}
