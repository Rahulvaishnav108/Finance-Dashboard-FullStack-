/** Money is handled as integer cents. Floating point is never used. */
export function parseCents(s: string): { cents: number } | { error: string } {
  const t = s.trim();
  if (t === '') return { error: 'Amount is empty. Enter a number such as 12.50.' };
  if (t.startsWith('-')) return { error: 'Negative amounts (refunds) are not supported yet. Remove or fix this row.' };
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) return { error: `"${s}" is not a valid amount. Use digits with at most 2 decimals.` };
  return { cents: parseInt(m[1], 10) * 100 + parseInt((m[2] ?? '').padEnd(2, '0') || '0', 10) };
}
export function fmt(c: number): string {
  const a = Math.abs(c);
  return `${c < 0 ? '-' : ''}${Math.floor(a / 100)}.${String(a % 100).padStart(2, '0')}`;
}
