import {
  forgotPasswordSchema,
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  verifyResetOtpSchema,
} from '../../modules/users/users.schema';

describe('Auth Contract Schemas', () => {
  it('accepts mobile-only customer OTP request payloads', () => {
    expect(requestOtpSchema.parse({ mobile: '9999999999' })).toEqual({
      mobile: '9999999999',
    });
  });

  it('rejects non-document customer OTP request payloads', () => {
    const result = requestOtpSchema.safeParse({ email: 'guest@example.com' });

    expect(result.success).toBe(false);
  });

  it('accepts email-only forgot password and verify-reset payloads', () => {
    expect(forgotPasswordSchema.parse({ email: 'staff@example.com' })).toEqual({
      email: 'staff@example.com',
    });

    expect(
      verifyResetOtpSchema.parse({
        email: 'staff@example.com',
        otp: '123456',
      }),
    ).toEqual({
      email: 'staff@example.com',
      otp: '123456',
    });
  });

  it('accepts mobile OTP verification with optional onboarding name', () => {
    expect(
      verifyOtpSchema.parse({
        mobile: '9999999999',
        otp: '1234',
        name: 'Aarav',
      }),
    ).toEqual({
      mobile: '9999999999',
      otp: '1234',
      name: 'Aarav',
    });
  });

  it('requires resetToken and newPassword for password reset completion', () => {
    expect(
      resetPasswordSchema.parse({
        resetToken: 'reset-token',
        newPassword: 'StrongPassword123',
      }),
    ).toEqual({
      resetToken: 'reset-token',
      newPassword: 'StrongPassword123',
    });

    const legacyPayload = resetPasswordSchema.safeParse({
      token: 'legacy-token',
      password: 'StrongPassword123',
    });

    expect(legacyPayload.success).toBe(false);
  });
});
