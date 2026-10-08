import { parseCsv } from '../core/csv';
import { computeTotals, reconcile } from '../core/reconcile';
import type { CloseoutStatus, Decision, Exception, FileKind, ParseResult, Totals } from '../core/types';

interface Input { name: string; text: string; bytes?: number }
export interface State {
  businessDate: string; inputs: Partial<Record<FileKind, Input>>;
  sales: ParseResult | null; settlements: ParseResult | null;
  exceptions: Exception[]; totals: Totals | null; status: CloseoutStatus; reviewer: string; confirmedAt: string | null;
}
export type Action =
  | { t: 'DATE'; date: string } | { t: 'LOAD'; kind: FileKind; name: string; text: string; bytes?: number }
  | { t: 'DEMO'; date: string; sales: string; settlements: string } | { t: 'RUN' }
  | { t: 'DECIDE'; id: string; decision: Exclude<Decision, 'OPEN'>; note: string }
  | { t: 'CONFIRM'; reviewer: string; at: string } | { t: 'RESET' };

const today = () => new Date().toISOString().slice(0, 10);
export const initial: State = { businessDate: today(), inputs: {}, sales: null, settlements: null, exceptions: [], totals: null, status: 'DRAFT', reviewer: '', confirmedAt: null };

function parseAll(s: State): State {
  const sales = s.inputs.sales ? parseCsv(s.inputs.sales.text, 'sales', s.businessDate, s.inputs.sales.name, s.inputs.sales.bytes) : null;
  const settlements = s.inputs.settlements ? parseCsv(s.inputs.settlements.text, 'settlements', s.businessDate, s.inputs.settlements.name, s.inputs.settlements.bytes) : null;
  const clean = (result: ParseResult | null) => result?.ok && result.errors.length === 0;
  return { ...s, sales, settlements, exceptions: [], totals: null, status: clean(sales) && clean(settlements) ? 'IMPORTED' : 'DRAFT' };
}

export function reducer(s: State, a: Action): State {
  if (s.status === 'CONFIRMED' && a.t !== 'RESET') return s; // confirmed closeouts are read-only
  switch (a.t) {
    case 'DATE': return parseAll({ ...s, businessDate: a.date });
    case 'LOAD': return parseAll({ ...s, inputs: { ...s.inputs, [a.kind]: { name: a.name, text: a.text, bytes: a.bytes } } });
    case 'DEMO': return parseAll({ ...initial, businessDate: a.date, inputs: { sales: { name: 'demo_sales.csv', text: a.sales }, settlements: { name: 'demo_settlements.csv', text: a.settlements } } });
    case 'RUN': {
      if (s.status !== 'IMPORTED' || !s.sales || !s.settlements) return s;
      return { ...s, status: 'RECONCILED', exceptions: reconcile(s.sales.rows, s.settlements.rows), totals: computeTotals(s.sales.rows, s.settlements.rows) };
    }
    case 'DECIDE': {
      if (!a.note.trim()) return s; // a note is required
      const at = new Date().toISOString();
      return { ...s, status: 'IN_REVIEW', exceptions: s.exceptions.map((e) => (e.id === a.id ? { ...e, decision: a.decision, note: a.note.trim(), decidedAt: at } : e)) };
    }
    case 'CONFIRM':
      if (s.exceptions.some((e) => e.decision === 'OPEN') || !a.reviewer.trim() || !s.totals) return s;
      return { ...s, status: 'CONFIRMED', reviewer: a.reviewer.trim(), confirmedAt: a.at };
    case 'RESET': return { ...initial, businessDate: today() };
  }
}
