import React from 'react';
import { User } from 'lucide-react';
import { LogItem } from "../../store/AuditLogs";
import { getBadgeStyles } from "../../utils/Auditlogsutils";

interface AuditLogsTableProps {
  darkMode: boolean;
  logs: LogItem[];
}

const COLUMNS = ['Type', 'Action', 'Performed By', 'Target', 'Details', 'IP Address', 'Timestamp'];

export default function AuditLogsTable({ darkMode, logs }: AuditLogsTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className={`border-b text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}
          >
            {COLUMNS.map((col) => (
              <th key={col} className="px-6 py-4">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={`divide-y text-sm ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}
        >
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr
                key={log.id}
                className={`${
                  darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                } transition`}
              >
                {/* Type Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full border text-xs font-medium ${getBadgeStyles(
                      log.type,
                      darkMode
                    )}`}
                  >
                    {log.type}
                  </span>
                </td>

                {/* Action */}
                <td
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {log.action}
                </td>

                {/* Performed By */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`flex items-center gap-2.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    {log.performedBy}
                  </div>
                </td>

                {/* Target */}
                <td
                  className={`px-6 py-4 whitespace-nowrap ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {log.target}
                </td>

                {/* Details */}
                <td
                  className={`px-6 py-4 max-w-xs truncate ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {log.details}
                </td>

                {/* IP Address */}
                <td
                  className={`px-6 py-4 font-mono text-xs whitespace-nowrap ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {log.ipAddress}
                </td>

                {/* Timestamp */}
                <td
                  className={`px-6 py-4 text-xs whitespace-nowrap ${
                    darkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {log.timestamp}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                No logs found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}