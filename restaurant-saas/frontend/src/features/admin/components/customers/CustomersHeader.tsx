import React, { useState } from 'react';
import { Plus, Upload, X, Check } from 'lucide-react';
import { useCustomersStore, type LoyaltyTier, type CustomerStatus } from '../../store/customers.store';

const TIERS: LoyaltyTier[] = ['Bronze', 'Silver', 'Gold'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  loyaltyTier: LoyaltyTier;
  status: CustomerStatus;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  loyaltyTier: 'Bronze',
  status: 'Active',
};

export function CustomersHeader() {
  const { addCustomer } = useCustomersStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [error, setError]         = useState('');
  const [saved, setSaved]         = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setError('');
  };

  const handleSubmit = () => {
    if (!form.name.trim())  { setError('Full name is required.');      return; }
    if (!form.phone.trim()) { setError('Phone number is required.');   return; }
    if (!form.email.trim()) { setError('Email address is required.');  return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email address.'); return; }

    const initials = form.name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    addCustomer({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      avatar: initials,
      loyaltyTier: form.loyaltyTier,
      status: form.status,
    });

    setSaved(true);
    setTimeout(() => {
      setShowModal(false);
      setSaved(false);
      setForm(EMPTY_FORM);
      setError('');
    }, 1200);
  };

  const handleClose = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setError('');
    setSaved(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage customer relationships and view their activity
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <span className="hidden sm:inline">Import Customers</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* ─── Add Customer Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={handleClose}
          />

          <div
            className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2
                id="add-customer-title"
                className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-orange-500" />
                Add New Customer
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saved ? (
              <div className="flex flex-col items-center py-8 sm:py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">Customer Added!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {form.name} has been added to your customers list.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fields */}
                {(
                  [
                    { label: 'Full Name',     field: 'name',  type: 'text',  placeholder: 'e.g. Priya Sharma' },
                    { label: 'Email Address', field: 'email', type: 'email', placeholder: 'customer@email.com' },
                    { label: 'Phone Number',  field: 'phone', type: 'tel',   placeholder: '+91 XXXXX XXXXX' },
                  ] as Array<{ label: string; field: keyof FormState; type: string; placeholder: string }>
                ).map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label
                      htmlFor={`field-${field}`}
                      className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
                    >
                      {label}
                    </label>
                    <input
                      id={`field-${field}`}
                      type={type}
                      placeholder={placeholder}
                      value={form[field] as string}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                ))}

                {/* Loyalty Tier */}
                <div>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Loyalty Tier
                  </span>
                  <div className="flex gap-2">
                    {TIERS.map((tier) => {
                      const activeColors: Record<LoyaltyTier, string> = {
                        Bronze: 'border-orange-300 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
                        Silver: 'border-gray-400 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                        Gold:   'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400',
                      };
                      const inactive =
                        'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800';
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleChange('loyaltyTier', tier)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            form.loyaltyTier === tier ? activeColors[tier] : inactive
                          }`}
                        >
                          {tier === 'Gold'   && '🥇 '}
                          {tier === 'Silver' && '🥈 '}
                          {tier === 'Bronze' && '🥉 '}
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Status
                  </span>
                  <div className="flex gap-2">
                    {(['Active', 'Inactive'] as CustomerStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleChange('status', s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          form.status === s
                            ? s === 'Active'
                              ? 'border-green-300 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                              : 'border-red-300 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}