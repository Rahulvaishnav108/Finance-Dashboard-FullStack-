import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function RestaurantInfoCard(): JSX.Element {
  const { restaurant, editingRestaurant, setEditingRestaurant, updateRestaurant } = useSettingsStore();
  const [draft, setDraft] = useState({ ...restaurant });

  function handleSave() {
    updateRestaurant(draft);
    setEditingRestaurant(false);
  }

  function handleCancel() {
    setDraft({ ...restaurant });
    setEditingRestaurant(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Restaurant Information</h3>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900 flex items-center justify-center flex-shrink-0">
          <Store className="w-7 h-7 text-green-500 dark:text-green-400" />
        </div>

        {/* Fields */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Restaurant Name">
            {editingRestaurant
              ? <input className={inputCls} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
              : <Value>{restaurant.name}</Value>}
          </Field>
          <Field label="Restaurant Type">
            {editingRestaurant
              ? <input className={inputCls} value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} />
              : <Value>{restaurant.type}</Value>}
          </Field>
          <Field label="Cuisine">
            {editingRestaurant
              ? <input className={inputCls} value={draft.cuisine} onChange={e => setDraft(d => ({ ...d, cuisine: e.target.value }))} />
              : <Value>{restaurant.cuisine}</Value>}
          </Field>
          <Field label="Phone Number">
            {editingRestaurant
              ? <input className={inputCls} value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
              : <Value>{restaurant.phone}</Value>}
          </Field>
          <Field label="Address" className="sm:col-span-2">
            {editingRestaurant
              ? <input className={inputCls} value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
              : <Value>{restaurant.address}</Value>}
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
        {editingRestaurant ? (
          <>
            <button onClick={handleCancel} className={secondaryBtn}>Cancel</button>
            <button onClick={handleSave} className={primaryBtn}>Save Changes</button>
          </>
        ) : (
          <button onClick={() => setEditingRestaurant(true)} className={primaryBtn}>Edit Information</button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{children}</p>;
}

const inputCls =
  'w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 focus:border-orange-300 dark:focus:border-orange-600 transition-all';

const primaryBtn =
  'px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors';

const secondaryBtn =
  'px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors';