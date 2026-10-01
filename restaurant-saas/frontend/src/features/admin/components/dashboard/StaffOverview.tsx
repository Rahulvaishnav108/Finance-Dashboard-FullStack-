import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboard.store';

const avatarColors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'];

export function StaffOverview() {
  const { staffMembers } = useDashboardStore();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Staff Overview</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {staffMembers.map((member, i) => (
          <div key={member.id} className="flex flex-col items-center gap-2 text-center">
            <div className={`w-14 h-14 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold`}>
              {member.avatar}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{member.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{member.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'On Duty' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className={`text-[11px] font-medium ${member.status === 'On Duty' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}