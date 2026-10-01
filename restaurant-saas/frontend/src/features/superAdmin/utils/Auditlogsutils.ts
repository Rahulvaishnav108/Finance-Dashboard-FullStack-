import { LogType } from"../store/AuditLogs";

export const getBadgeStyles = (type: LogType, darkMode: boolean): string => {
  switch (type) {
    case 'Admin':
      return darkMode
        ? 'bg-red-950/40 text-red-400 border-red-900/40'
        : 'bg-red-50 text-red-600 border-red-100';
    case 'Restaurant':
      return darkMode
        ? 'bg-blue-950/40 text-blue-400 border-blue-900/40'
        : 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Subscription':
      return darkMode
        ? 'bg-purple-950/40 text-purple-400 border-purple-900/40'
        : 'bg-purple-50 text-purple-600 border-purple-100';
    default:
      return darkMode
        ? 'bg-slate-800 text-slate-400 border-slate-700'
        : 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

export const exportLogsAsCSV = (logs: { type: string; action: string; performedBy: string; target: string; details: string; ipAddress: string; timestamp: string }[]) => {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    ['Type,Action,Performed By,Target,Details,IP Address,Timestamp'].join(',') +
    '\n' +
    logs
      .map(
        (e) =>
          `"${e.type}","${e.action}","${e.performedBy}","${e.target}","${e.details}","${e.ipAddress}","${e.timestamp}"`
      )
      .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'audit_logs.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};