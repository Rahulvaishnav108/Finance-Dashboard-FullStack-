'use strict';

/**
 * Convert an array of flat objects to a CSV string.
 * Handles commas, quotes, and newlines inside field values.
 */
function toCSV(rows, columns) {
  if (!rows.length) return columns.join(',') + '\n';

  const escape = val => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Wrap in quotes if it contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const header = columns.join(',');
  const body   = rows.map(row =>
    columns.map(col => escape(row[col])).join(',')
  ).join('\n');

  return header + '\n' + body + '\n';
}

module.exports = { toCSV };
