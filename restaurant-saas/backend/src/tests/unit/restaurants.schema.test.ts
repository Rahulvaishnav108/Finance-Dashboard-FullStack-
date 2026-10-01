import {
  updateRestaurantSettingsSchema,
} from '../../modules/restaurants/restaurants.schema';

describe('Restaurant Settings Schema', () => {
  it('parses a full settings payload and normalizes currency', () => {
    const result = updateRestaurantSettingsSchema.parse({
      currency: 'inr',
      taxRate: 0.18,
      serviceChargeEnabled: true,
      sessionDurationMinutes: 120,
    });

    expect(result).toEqual({
      currency: 'INR',
      taxRate: 0.18,
      serviceChargeEnabled: true,
      sessionDurationMinutes: 120,
    });
  });

  it('allows partial updates for restaurant settings', () => {
    const result = updateRestaurantSettingsSchema.parse({
      currency: 'usd',
      sessionDurationMinutes: 45,
    });

    expect(result).toEqual({
      currency: 'USD',
      sessionDurationMinutes: 45,
    });
  });

  it('rejects an empty update payload', () => {
    const result = updateRestaurantSettingsSchema.safeParse({});

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe('At least one field is required');
  });

  it.each([
    [{ currency: 'rupee' }, 'Currency must be a 3-letter ISO code'],
    [{ taxRate: -0.01 }, 'Tax rate cannot be negative'],
    [{ taxRate: 1.25 }, 'Tax rate must be a decimal between 0 and 1 (e.g. 0.05 for 5%)'],
    [{ sessionDurationMinutes: 10 }, 'Session duration must be at least 15 minutes'],
  ])('rejects invalid payload %j', (payload, expectedMessage) => {
    const result = updateRestaurantSettingsSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe(expectedMessage);
  });
});