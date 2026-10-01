import React from 'react';
import { Download } from 'lucide-react';

interface AuditLogsHeaderProps {
  darkMode: boolean;
  onExport: () => void;
}

export default function AuditLogsHeader({ darkMode, onExport }: AuditLogsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Audit Logs</h1>
        <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Complete activity tracking and security monitoring
        </p>
      </div>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-5 py-3 rounded-xl font-medium text-sm shadow-sm transition-all shadow-orange-600/10 w-full sm:w-auto"
      >
        <Download className="w-4 h-4" />
        Export Logs
      </button>
    </div>
  );
}