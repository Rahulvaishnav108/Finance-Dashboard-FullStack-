import React from 'react';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';

interface TurnoverStat {
  table: string;
  avgTimeMin: number;
  todayTurns: number;
  rating: 'Fast' | 'Normal' | 'Slow';
}

export default function StaffTableTurnoverPage() {
  const { query } = useStaffSearch();

  const turnoverData: TurnoverStat[] = [
    { table: 'Table 1', avgTimeMin: 42, todayTurns: 6, rating: 'Fast' },
    { table: 'Table 2', avgTimeMin: 58, todayTurns: 4, rating: 'Normal' },
    { table: 'Table 3', avgTimeMin: 48, todayTurns: 5, rating: 'Fast' },
    { table: 'Table 4', avgTimeMin: 72, todayTurns: 3, rating: 'Slow' },
    { table: 'Table 5', avgTimeMin: 65, todayTurns: 3, rating: 'Normal' },
    { table: 'Table 6', avgTimeMin: 50, todayTurns: 5, rating: 'Normal' },
    { table: 'Table 7', avgTimeMin: 38, todayTurns: 7, rating: 'Fast' },
    { table: 'Table 8', avgTimeMin: 80, todayTurns: 2, rating: 'Slow' },
  ];

  const filteredData = turnoverData.filter(d =>
    d.table.toLowerCase().includes(query.toLowerCase()) ||
    d.rating.toLowerCase().includes(query.toLowerCase())
  );

  const overallAvg = Math.round(turnoverData.reduce((acc, c) => acc + c.avgTimeMin, 0) / turnoverData.length);
  const totalTurns = turnoverData.reduce((acc, c) => acc + c.todayTurns, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Table Turnover</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track table efficiency and average guest dining duration.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase font-sans">Avg Dining Duration</p>
          <p className="text-2xl font-black text-dine-orange font-sans mt-1">{overallAvg} Mins</p>
          <p className="text-[10px] text-slate-400 font-sans mt-2">Optimal target is 45-50 mins</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase font-sans">Total Turnovers Today</p>
          <p className="text-2xl font-black text-green-605 dark:text-green-455 font-sans mt-1">{totalTurns} Cycles</p>
          <p className="text-[10px] text-slate-400 font-sans mt-2">Increased by 12% from last week</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase font-sans">Turn Efficiency Rating</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-sans mt-1">Excellent</p>
          <p className="text-[10px] text-slate-400 font-sans mt-2">Zone A is leading this shift</p>
        </div>
      </div>

      {/* Turnover Chart Table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 font-sans mb-4">Efficiency by Table</h2>

        <div className="space-y-5">
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">{d.table}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({d.todayTurns} turns today)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-sans text-slate-700 dark:text-slate-350">{d.avgTimeMin} mins</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      d.rating === 'Fast' ? 'bg-green-50 text-green-650 dark:bg-green-950/40 dark:text-green-400' :
                      d.rating === 'Normal' ? 'bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-400' :
                      'bg-orange-50 text-dine-orange dark:bg-orange-950/40'
                    }`}>{d.rating}</span>
                  </div>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.rating === 'Fast' ? 'bg-green-500' :
                      d.rating === 'Normal' ? 'bg-blue-500' : 'bg-dine-orange'
                    }`}
                    style={{ width: `${Math.min(100, (d.avgTimeMin / 90) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No matching table efficiency records.</p>
          )}
        </div>
      </div>
    </div>
  );
}
