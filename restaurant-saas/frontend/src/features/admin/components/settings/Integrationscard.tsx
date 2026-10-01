import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function IntegrationsCard(): JSX.Element {
  const { integrations, toggleIntegration } = useSettingsStore();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Integrations</h3>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <button
            key={integration.id}
            onClick={() => toggleIntegration(integration.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: integration.color + '22', border: `1px solid ${integration.color}33` }}
            >
              {integration.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{integration.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{integration.description}</p>
            </div>

            {/* Status */}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
                integration.status === 'Connected'
                  ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {integration.status}
            </span>

            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
          Manage Integrations
        </button>
      </div>
    </div>
  );
}