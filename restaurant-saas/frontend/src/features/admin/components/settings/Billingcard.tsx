import React from 'react';
import { CreditCard } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function BillingCard(): JSX.Element {
  const { billing } = useSettingsStore();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Billing &amp; Subscription</h3>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        </div>

        {/* Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Current Plan">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{billing.plan}</p>
          </Field>
          <div className="hidden sm:block" /> {/* spacer */}
          <Field label="Billing Cycle">
            <p className="text-sm text-gray-700 dark:text-gray-300">{billing.cycle}</p>
          </Field>
          <Field label="Next Billing Date">
            <p className="text-sm text-gray-700 dark:text-gray-300">{billing.nextBillingDate}</p>
          </Field>
          <Field label="Amount">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{billing.amount}</p>
          </Field>
          <Field label="Payment Method">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">{billing.paymentMethod}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">•••• {billing.cardLast4}</span>
            </div>
          </Field>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
          Manage Billing
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}