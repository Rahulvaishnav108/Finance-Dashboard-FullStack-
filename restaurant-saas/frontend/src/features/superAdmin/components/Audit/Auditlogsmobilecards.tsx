import React from 'react';
import { User, Calendar, ShieldAlert } from 'lucide-react';
import { LogItem } from "../../store/AuditLogs";
import { getBadgeStyles } from "../../utils/Auditlogsutils";

interface AuditLogsMobileCardsProps {
  darkMode: boolean;
  logs: LogItem[];
}

export default function AuditLogsMobileCards({ darkMode, logs }: AuditLogsMobileCardsProps) {
  return (
    <div
      className={`md:hidden ${
        darkMode ? 'divide-y divide-slate-800' : 'divide-y divide-slate-100'
      }`}
    >
      {logs.length > 0 ? (
        logs.map((log) => (
          <div
            key={log.id}
            className={`p-4 space-y-3 ${
              darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
            } transition`}
          >
            {/* Top row: badge + timestamp */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${getBadgeStyles(
                  log.type,
                  darkMode
                )}`}
              >
                {log.type}
              </span>
              <div
                className={`flex items-center gap-1.5 text-[10px] ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {log.timestamp}
              </div>
            </div>

            {/* Action + Details */}
            <div>
              <h3
                className={`font-semibold text-sm ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}
              >
                {log.action}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {log.details}
              </p>
            </div>

            {/* Performed By + Target */}
            <div
              className={`flex justify-between items-center pt-2 text-xs border-t ${
                darkMode ? 'border-slate-800' : 'border-slate-50'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">By:</span> {log.performedBy}
              </div>
              <div
                className={`flex items-center gap-1 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span className="text-slate-400">Target:</span> {log.target}
              </div>
            </div>

            {/* IP Address */}
            <div
              className={`flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-lg w-fit ${
                darkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-400 bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              IP: {log.ipAddress}
            </div>
          </div>
        ))
      ) : (
        <div className="px-6 py-12 text-center text-slate-500 text-sm">
          No logs found matching your criteria.
        </div>
      )}
    </div>
  );
}