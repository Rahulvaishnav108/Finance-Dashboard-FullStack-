import type { Banner, Exception, Totals } from './types';
/** "Balanced" only when nothing is left to explain. */
export function banner(totals: Totals, ex: Exception[]): Banner {
  if (ex.some((e) => e.decision === 'OPEN')) return 'Needs review';
  if (ex.length === 0) return totals.diffCents === 0 ? 'Balanced' : 'Needs review';
  return 'Reviewed with exceptions';
}
export const canComplete = (ex: Exception[]) => ex.every((e) => e.decision !== 'OPEN');
