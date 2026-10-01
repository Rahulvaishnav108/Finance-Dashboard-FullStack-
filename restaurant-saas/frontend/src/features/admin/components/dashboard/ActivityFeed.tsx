import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const activities = [
  { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'Order #1042 marked as served', time: '2 min ago' },
  { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'Table 8 requested assistance', time: '5 min ago' },
  { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'New reservation: Sat 8 PM, party of 4', time: '10 min ago' },
  { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30', text: 'Order #1038 cancelled by customer', time: '25 min ago' },
  { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'Inventory restocked: Olive Oil', time: '1 hr ago' },
];

export function ActivityFeed(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 transition-colors duration-200">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Live Activity</h3>
      <div className="space-y-3">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{item.text}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}