import { describe, expect, it } from 'vitest';
import { MAX_BYTES, parseCsv } from './csv';
import { parseCents, fmt } from './money';
import { computeTotals, reconcile } from './reconcile';
import { banner } from './status';
import { buildReport, cell } from './export';
import { reducer, initial } from '../state/reducer';
import { DEMO } from '../demo/demo';

const load = () => ({ s: parseCsv(DEMO.sales, 'sales', DEMO.date, 's.csv'), t: parseCsv(DEMO.settlements, 'settlements', DEMO.date, 't.csv') });
const key = (ex: ReturnType<typeof reconcile>) => ex.map((e) => [e.type, e.orderId, e.diffCents]);

describe('money', () => {
  it('parses to cents without float error', () => { expect(parseCents('0.10')).toEqual({ cents: 10 }); expect(parseCents('19.99')).toEqual({ cents: 1999 }); });
  it('rejects bad amounts', () => { for (const v of ['', '-1', '1.234', 'abc']) expect('error' in parseCents(v)).toBe(true); });
  it('formats', () => { expect(fmt(-100)).toBe('-1.00'); expect(fmt(5)).toBe('0.05'); });
});
describe('validation', () => {
  it('names missing columns', () => { const r = parseCsv('order_id,sale_time,payment_method\nA1,2026-10-03T10:00:00,card', 'sales', DEMO.date, 'x.csv'); expect(r.ok).toBe(false); expect(r.fatal).toContain('amount'); });
  it('rejects empty and non-csv', () => { expect(parseCsv('', 'sales', DEMO.date, 'x.csv').ok).toBe(false); expect(parseCsv('a', 'sales', DEMO.date, 'x.txt').ok).toBe(false); });
  it('rejects files over the size limit', () => { expect(parseCsv('data', 'sales', DEMO.date, 'x.csv', MAX_BYTES + 1).fatal).toContain('larger than 5 MB'); });
  it('reports invalid rows and handles BOM', () => {
    const r = parseCsv('\uFEFForder_id,sale_time,payment_method,amount\nA1,2026-10-03T10:00:00,card,5.00\nA2,bad,card,-3', 'sales', DEMO.date, 'x.csv');
    expect(r.rows).toHaveLength(1); expect(r.errors.map((e) => e.field)).toEqual(['sale_time', 'amount']);
  });
  it('rejects cash in settlements', () => { expect(parseCsv('order_id,settled_at,payment_method,amount\nA1,2026-10-03T10:00:00,cash,5', 'settlements', DEMO.date, 'x.csv').errors).toHaveLength(1); });
});
describe('reconcile', () => {
  it('finds exactly the seeded exceptions in order', () => {
    const { s, t } = load(); const ex = reconcile(s.rows, t.rows);
    expect(key(ex)).toEqual([['DUPLICATE', 'A107', 6000 * -0 + 12000 - 6000], ['AMOUNT_MISMATCH', 'A109', -100], ['UNMATCHED_SALE', 'A108', -2800], ['UNMATCHED_SETTLEMENT', 'Z900', 1999]]);
  });
  it('is deterministic regardless of input order', () => { const { s, t } = load(); expect(key(reconcile(s.rows, t.rows))).toEqual(key(reconcile([...s.rows].reverse(), [...t.rows].reverse()))); });
  it('does not flag cash sales', () => { const { s, t } = load(); expect(reconcile(s.rows, t.rows).some((e) => e.orderId === 'A110')).toBe(false); });
  it('computes totals', () => { const { s, t } = load(); const x = computeTotals(s.rows, t.rows); expect([x.salesCents, x.settlementCents, x.diffCents, x.byMethod.cash.sales]).toEqual([29500, 33399, 5099, 1200]); });
});
describe('status and workflow', () => {
  it('never says Balanced with open exceptions', () => {
    const { s, t } = load(); const ex = reconcile(s.rows, t.rows); const tot = computeTotals(s.rows, t.rows);
    expect(banner(tot, ex)).toBe('Needs review');
    expect(banner(tot, ex.map((e) => ({ ...e, decision: 'ACKNOWLEDGED' as const })))).toBe('Reviewed with exceptions');
    expect(banner({ ...tot, diffCents: 0 }, [])).toBe('Balanced');
  });
  it('gates confirmation and locks after', () => {
    let st = reducer(initial, { t: 'DEMO', date: DEMO.date, sales: DEMO.sales, settlements: DEMO.settlements });
    st = reducer(st, { t: 'RUN' }); expect(st.exceptions).toHaveLength(4);
    expect(reducer(st, { t: 'CONFIRM', reviewer: 'M', at: 'x' }).status).not.toBe('CONFIRMED');
    expect(reducer(st, { t: 'DECIDE', id: st.exceptions[0].id, decision: 'RESOLVED', note: ' ' })).toBe(st);
    for (const e of st.exceptions) st = reducer(st, { t: 'DECIDE', id: e.id, decision: 'ACKNOWLEDGED', note: 'checked' });
    st = reducer(st, { t: 'CONFIRM', reviewer: 'Maya', at: '2026-10-04T00:00:00Z' }); expect(st.status).toBe('CONFIRMED');
    expect(reducer(st, { t: 'RUN' })).toBe(st);
  });
  it('blocks reconciliation when either uploaded file has invalid rows', () => {
    let st = reducer(initial, { t: 'LOAD', kind: 'sales', name: 'sales.csv', text: 'order_id,sale_time,payment_method,amount\nA1,2026-10-03T12:00:00,card,1.00\nA2,2026-10-03T12:00:00,cash,bad' });
    st = reducer(st, { t: 'LOAD', kind: 'settlements', name: 'settlements.csv', text: 'order_id,settled_at,payment_method,amount\nA1,2026-10-03T12:00:00,card,1.00' });
    expect(st.sales?.errors).toHaveLength(1);
    expect(st.status).toBe('DRAFT');
    expect(reducer(st, { t: 'RUN' })).toBe(st);
  });
});
describe('export', () => {
  it('neutralises formulas but keeps negative numbers numeric', () => {
    expect(cell('=SUM(A1)')).toBe("'=SUM(A1)"); expect(cell('-1.00', false)).toBe('-1.00'); expect(cell('a,"b"')).toBe('"a,""b"""');
  });
  it('builds a dated report with decisions', () => {
    const { s, t } = load(); const ex = reconcile(s.rows, t.rows).map((e) => ({ ...e, decision: 'RESOLVED' as const, note: '=evil', decidedAt: 'T' }));
    const csv = buildReport({ businessDate: DEMO.date, totals: computeTotals(s.rows, t.rows), exceptions: ex, banner: 'Reviewed with exceptions', reviewer: 'Maya', confirmedAt: 'T' });
    expect(csv).toContain("'=evil"); expect(csv).toContain('AMOUNT_MISMATCH,A109'); expect(csv).toContain('Reviewed with exceptions');
  });
});
