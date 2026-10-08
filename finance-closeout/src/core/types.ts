export type FileKind = 'sales' | 'settlements';
export type Method = 'card' | 'cash' | 'other';
export interface SourceRow { file: FileKind; rowNumber: number; raw: Record<string, string>; orderId: string; cents: number; method: Method; time: string }
export interface RowIssue { file: FileKind; rowNumber: number; field: string; reason: string }
export interface ParseResult { ok: boolean; fatal?: string; fileName: string; rows: SourceRow[]; errors: RowIssue[]; warnings: RowIssue[] }
export type ExType = 'DUPLICATE' | 'AMOUNT_MISMATCH' | 'UNMATCHED_SALE' | 'UNMATCHED_SETTLEMENT';
export type Decision = 'OPEN' | 'RESOLVED' | 'ACKNOWLEDGED';
export interface Exception { id: string; type: ExType; orderId: string; sales: SourceRow[]; settlements: SourceRow[]; salesCents: number | null; settlementCents: number | null; diffCents: number; decision: Decision; note: string; decidedAt: string | null }
export interface Totals { salesCents: number; settlementCents: number; expectedSettlementCents: number; diffCents: number; byMethod: Record<string, { sales: number; settled: number }> }
export type CloseoutStatus = 'DRAFT' | 'IMPORTED' | 'RECONCILED' | 'IN_REVIEW' | 'CONFIRMED';
export type Banner = 'Balanced' | 'Reviewed with exceptions' | 'Needs review';
