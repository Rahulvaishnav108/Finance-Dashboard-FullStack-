import Papa from 'papaparse';
import { parseCents } from './money';
import type { FileKind, Method, ParseResult, RowIssue, SourceRow } from './types';

export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 10000;
const METHODS: Record<FileKind, Method[]> = { sales: ['card', 'cash', 'other'], settlements: ['card', 'other'] };

export function parseCsv(text: string, file: FileKind, businessDate: string, fileName = 'file.csv', bytes = text.length): ParseResult {
  const base = { fileName, rows: [] as SourceRow[], errors: [] as RowIssue[], warnings: [] as RowIssue[] };
  const fail = (fatal: string): ParseResult => ({ ok: false, fatal, ...base });
  if (!/\.csv$/i.test(fileName)) return fail(`${fileName} is not a .csv file. Export your data as CSV and upload it again.`);
  if (bytes > MAX_BYTES) return fail('File is larger than 5 MB. Export a single business day and upload again.');
  if (!text.trim()) return fail("File is empty. Export the day's data and upload again.");
  const p = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: 'greedy', transformHeader: (h) => h.trim() });
  const timeCol = file === 'sales' ? 'sale_time' : 'settled_at';
  const need = ['order_id', timeCol, 'payment_method', 'amount'];
  const missing = need.filter((h) => !(p.meta.fields ?? []).includes(h));
  if (missing.length) return fail(`Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Required headers: ${need.join(', ')}.`);
  if (p.data.length === 0) return fail('File has headers but no data rows.');
  if (p.data.length > MAX_ROWS) return fail(`File has more than ${MAX_ROWS} rows. Split it and upload one day at a time.`);

  p.data.forEach((raw, i) => {
    const rowNumber = i + 2;
    const bad = (field: string, reason: string) => base.errors.push({ file, rowNumber, field, reason });
    const orderId = (raw.order_id ?? '').trim();
    const time = (raw[timeCol] ?? '').trim();
    const method = (raw.payment_method ?? '').trim() as Method;
    const amt = parseCents(raw.amount ?? '');
    let ok = true;
    if (!orderId) { bad('order_id', 'Order ID is empty.'); ok = false; }
    if (!time || Number.isNaN(Date.parse(time))) { bad(timeCol, 'Not a valid ISO 8601 date-time, e.g. 2026-10-03T12:05:00.'); ok = false; }
    if (!METHODS[file].includes(method)) { bad('payment_method', `Must be one of: ${METHODS[file].join(', ')}.`); ok = false; }
    if ('error' in amt) { bad('amount', amt.error); ok = false; }
    if (!ok || 'error' in amt) return;
    if (file === 'sales' && time.slice(0, 10) !== businessDate)
      base.warnings.push({ file, rowNumber, field: timeCol, reason: `Sale time is outside business date ${businessDate}. The row is still included.` });
    base.rows.push({ file, rowNumber, raw, orderId, cents: amt.cents, method, time });
  });
  return base.rows.length
    ? { ok: true, ...base }
    : { ok: false, fatal: 'No valid rows found. Fix the rows listed below and upload again.', ...base };
}
