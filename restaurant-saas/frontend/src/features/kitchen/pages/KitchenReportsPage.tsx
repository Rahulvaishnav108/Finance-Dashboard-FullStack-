import React, { useState } from 'react';
import { REPORT_TEMPLATES } from '../store/kitchenData';

interface GeneratedReport {
  id: string;
  name: string;
  date: string;
  format: string;
  size: string;
  status: 'Ready' | 'Generating';
}

export default function KitchenReportsPage() {
  const reports = REPORT_TEMPLATES;
  const [history, setHistory] = useState<GeneratedReport[]>([
    { id: 'GEN-001', name: 'Daily Kitchen Summary', date: 'Today, 06:00 AM', format: 'PDF', size: '2.4 MB', status: 'Ready' },
    { id: 'GEN-002', name: 'Weekly Performance', date: 'June 9, 2026', format: 'Excel', size: '4.8 MB', status: 'Ready' },
    { id: 'GEN-003', name: 'Inventory Consumption', date: 'June 8, 2026', format: 'CSV', size: '1.2 MB', status: 'Ready' },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>(REPORT_TEMPLATES[0].name);
  const [dateRange, setDateRange] = useState<string>('last-7-days');
  const [fileFormat, setFileFormat] = useState<string>('PDF');
  const [generating, setGenerating] = useState<boolean>(false);

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      const newReport: GeneratedReport = {
        id: `GEN-00${history.length + 1}`,
        name: selectedTemplate,
        date: 'Just now',
        format: fileFormat,
        size: '1.8 MB',
        status: 'Ready',
      };
      setHistory(prev => [newReport, ...prev]);
      setGenerating(false);
    }, 1200);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Kitchen Reports</h2>
        <p className="text-sm text-slate-500 font-medium">Export performance statistics, kitchen logs, and inventory audit sheets</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Custom Report Configuration (Form) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm xl:col-span-1">
          <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-[20px]">tune</span>
            Generate Custom Report
          </h3>

          <form onSubmit={handleGenerateCustom} className="space-y-4 text-xs font-semibold">
            <div>
              <label htmlFor="report-select" className="block text-slate-500 mb-1.5">Report Type / Template</label>
              <select
                id="report-select"
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-orange-500"
              >
                {reports.map(r => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-range-select" className="block text-slate-500 mb-1.5">Date Range</label>
              <select
                id="date-range-select"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-orange-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            <div>
              <span className="block text-slate-500 mb-1.5">File Format</span>
              <div className="flex gap-2">
                {['PDF', 'Excel', 'CSV'].map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFileFormat(fmt)}
                    className={`flex-1 py-2 border rounded-xl text-center transition-all ${
                      fileFormat === fmt
                        ? 'bg-orange-50 text-orange-600 border-orange-200 font-bold'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        </div>

        {/* Quick Report Cards */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-[20px]">description</span>
            Report Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(template => (
              <div
                key={template.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {template.frequency}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">{template.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mb-3 leading-snug">{template.description}</p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-3 text-[10px] font-semibold text-slate-400">
                  <span>Last run: {template.lastGenerated}</span>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.name);
                      setDateRange('last-7-days');
                    }}
                    className="text-orange-500 hover:text-orange-600 font-bold"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mt-6">
        <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500 text-[20px]">history</span>
          Recently Generated Reports
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Report Name</th>
                <th className="px-4 py-3">Date Generated</th>
                <th className="px-4 py-3 text-center">Format</th>
                <th className="px-4 py-3 text-center">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} className="border-b border-slate-50 font-semibold text-slate-600 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-800">#{item.id}</td>
                  <td className="px-4 py-3 text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-slate-400">{item.date}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded font-bold uppercase text-[9px]">
                      {item.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">{item.size}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-600 rounded-full font-bold uppercase text-[9px]">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="px-2.5 py-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reports history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
