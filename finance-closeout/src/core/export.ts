import { fmt } from './money';
import type { Banner, Exception, Totals } from './types';

/** Neutralise spreadsheet formulas and quote when needed. Text fields only. */
export function cell(v: string | number, text = true): string {
  let s = String(v);
  if (text && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const line = (a: (string | number)[], numeric: number[] = []) => a.map((v, i) => cell(v, !numeric.includes(i))).join(',');
export const reportName = (date: string) => `closeout_${date}.csv`;

export interface ReportInput { businessDate: string; totals: Totals; exceptions: Exception[]; banner: Banner; reviewer: string; confirmedAt: string }

export function buildReport(r: ReportInput): string {
  const count = (t: string) => r.exceptions.filter((e) => e.type === t).length;
  const cash = r.totals.byMethod.cash?.sales ?? 0;
  const summary: [string, string | number][] = [
    ['business_date', r.businessDate], ['status', r.banner], ['sales_total', fmt(r.totals.salesCents)],
    ['cash_sales_not_expected_to_settle', fmt(cash)], ['expected_settlement', fmt(r.totals.expectedSettlementCents)],
    ['settlement_total', fmt(r.totals.settlementCents)], ['difference', fmt(r.totals.diffCents)],
    ['exceptions_total', r.exceptions.length], ['duplicates', count('DUPLICATE')], ['amount_mismatches', count('AMOUNT_MISMATCH')],
    ['unmatched_sales', count('UNMATCHED_SALE')], ['unmatched_settlements', count('UNMATCHED_SETTLEMENT')],
    ['reviewer', r.reviewer], ['confirmed_at', r.confirmedAt],
  ];
  const rows = [line(['section', 'summary']), ...summary.map(([k, v]) => line([k, v], typeof v === 'number' || /^-?\d+\.\d\d$/.test(String(v)) ? [1] : []))];
  rows.push('', line(['section', 'exceptions']));
  rows.push(line(['type', 'order_id', 'source', 'sales_amount', 'settlement_amount', 'difference', 'decision', 'note', 'decided_at']));
  for (const e of r.exceptions) {
    const src = [...e.sales.map((x) => `sales row ${x.rowNumber}`), ...e.settlements.map((x) => `settlements row ${x.rowNumber}`)].join('; ');
    rows.push(line([e.type, e.orderId, src, e.salesCents === null ? '' : fmt(e.salesCents), e.settlementCents === null ? '' : fmt(e.settlementCents), fmt(e.diffCents), e.decision, e.note, e.decidedAt ?? ''], [3, 4, 5]));
  }
  return rows.join('\r\n') + '\r\n';
}
