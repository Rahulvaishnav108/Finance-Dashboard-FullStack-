import type { ExType, Exception, SourceRow, Totals } from './types';

const group = (rows: SourceRow[]) => {
  const m = new Map<string, SourceRow[]>();
  for (const r of rows) { const a = m.get(r.orderId); if (a) a.push(r); else m.set(r.orderId, [r]); }
  return m;
};
const sum = (rows: SourceRow[]) => (rows.length ? rows.reduce((a, r) => a + r.cents, 0) : null);
const RANK: Record<ExType, number> = { DUPLICATE: 0, AMOUNT_MISMATCH: 1, UNMATCHED_SALE: 2, UNMATCHED_SETTLEMENT: 2 };

/** Pure and deterministic: identical input always yields identical output and order. */
export function reconcile(sales: SourceRow[], settlements: SourceRow[]): Exception[] {
  const S = group(sales), T = group(settlements);
  const ids = new Set([...S.keys(), ...T.keys()]);
  const out: Exception[] = [];
  for (const id of ids) {
    const s = S.get(id) ?? [], t = T.get(id) ?? [];
    let type: ExType | null = null;
    if (s.length > 1 || t.length > 1) type = 'DUPLICATE'; // never pick a "correct" row
    else if (s.length && !t.length) type = s[0].method === 'cash' ? null : 'UNMATCHED_SALE'; // cash is not expected to settle
    else if (!s.length && t.length) type = 'UNMATCHED_SETTLEMENT';
    else if (s[0].cents !== t[0].cents) type = 'AMOUNT_MISMATCH'; // zero tolerance
    if (!type) continue;
    const sc = sum(s), tc = sum(t);
    out.push({ id: `${type}:${id}`, type, orderId: id, sales: s, settlements: t, salesCents: sc, settlementCents: tc, diffCents: (tc ?? 0) - (sc ?? 0), decision: 'OPEN', note: '', decidedAt: null });
  }
  const mag = (e: Exception) => Math.max(Math.abs(e.salesCents ?? 0), Math.abs(e.settlementCents ?? 0));
  return out.sort((a, b) => RANK[a.type] - RANK[b.type] || mag(b) - mag(a) || (a.orderId < b.orderId ? -1 : a.orderId > b.orderId ? 1 : 0));
}

export function computeTotals(sales: SourceRow[], settlements: SourceRow[]): Totals {
  const byMethod: Totals['byMethod'] = {};
  const slot = (m: string) => (byMethod[m] ??= { sales: 0, settled: 0 });
  let salesCents = 0, settlementCents = 0, expected = 0;
  for (const r of sales) { salesCents += r.cents; slot(r.method).sales += r.cents; if (r.method !== 'cash') expected += r.cents; }
  for (const r of settlements) { settlementCents += r.cents; slot(r.method).settled += r.cents; }
  return { salesCents, settlementCents, expectedSettlementCents: expected, diffCents: settlementCents - expected, byMethod };
}
