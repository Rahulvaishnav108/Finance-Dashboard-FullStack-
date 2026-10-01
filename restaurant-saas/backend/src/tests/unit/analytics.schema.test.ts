import { analyticsQuerySchema } from '../../modules/analytics/analytics.schema';

describe('analytics query schema', () => {
  it('parses valid date filters, groupBy, and optional restaurantId', () => {
    const result = analyticsQuerySchema.parse({
      from: '2026-01-01',
      to: '2026-01-31',
      groupBy: 'month',
      restaurantId: '507f1f77bcf86cd799439011',
    });

    expect(result).toEqual({
      from: '2026-01-01',
      to: '2026-01-31',
      groupBy: 'month',
      restaurantId: '507f1f77bcf86cd799439011',
    });
  });

  it('accepts ISO datetime filters', () => {
    const result = analyticsQuerySchema.parse({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.999Z',
    });

    expect(result).toEqual({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.999Z',
    });
  });

  it('rejects invalid restaurant ids', () => {
    const result = analyticsQuerySchema.safeParse({
      restaurantId: 'not-an-object-id',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe('Invalid restaurant id');
  });

  it('rejects reversed date ranges', () => {
    const result = analyticsQuerySchema.safeParse({
      from: '2026-02-01',
      to: '2026-01-31',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe('From date must be before or equal to to date');
  });
});
