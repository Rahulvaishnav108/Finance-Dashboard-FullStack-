import mongoose from 'mongoose';
import { createOTP, verifyOTP } from '../../services/otp.service';
import { ErrorCode } from '../../constants/errors';

jest.mock('../../services/mail.service', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true),
}));

describe('OTP Service', () => {
  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection('otps').deleteMany({});
    }
    jest.clearAllMocks();
  });

  it('creates and verifies a valid OTP', async () => {
    const { otp } = await createOTP('test@example.com', 'email');
    expect(otp).toHaveLength(6);

    const isValid = await verifyOTP('test@example.com', 'email', otp);
    expect(isValid).toBe(true);
  });

  it('rejects an invalid OTP', async () => {
    await createOTP('test2@example.com', 'email');

    try {
      await verifyOTP('test2@example.com', 'email', '000000');
      fail('Expected verifyOTP to throw');
    } catch (err: any) {
      expect(err.code).toBe(ErrorCode.INVALID_OTP);
    }
  });

  it('rejects an already used OTP', async () => {
    const { otp } = await createOTP('used@example.com', 'email');

    // First verification should succeed
    const isValid = await verifyOTP('used@example.com', 'email', otp);
    expect(isValid).toBe(true);

    // Second verification should fail as ALREADY_USED
    try {
      await verifyOTP('used@example.com', 'email', otp);
      fail('Expected verifyOTP to throw');
    } catch (err: any) {
      expect(err.message).toBe('This OTP has already been used.');
      expect(err.code).toBe(ErrorCode.OTP_ALREADY_USED);
    }
  });

  it('rejects an expired OTP', async () => {
    // Create OTP
    const { otp } = await createOTP('expired@example.com', 'email');

    // Manually expire it in DB
    const OtpModel = mongoose.model('Otp');
    await OtpModel.updateOne({ identifier: 'expired@example.com' }, { $set: { expiresAt: new Date(Date.now() - 1000) } });

    try {
      await verifyOTP('expired@example.com', 'email', otp);
      fail('Expected verifyOTP to throw');
    } catch (err: any) {
      expect(err.message).toBe('This OTP has expired. Please request a new OTP.');
      expect(err.code).toBe(ErrorCode.OTP_EXPIRED);
    }
  });

  it('invalidates previous OTP on resend', async () => {
    const { otp: oldOtp } = await createOTP('resend@example.com', 'email');

    // Bypass cooldown logic for test by backdating the previous OTP
    const OtpModel = mongoose.model('Otp');
    await OtpModel.updateOne({ identifier: 'resend@example.com' }, { $set: { createdAt: new Date(Date.now() - 120000) } });

    const { otp: newOtp } = await createOTP('resend@example.com', 'email');

    // Old OTP should be invalid (not found / invalid)
    try {
      await verifyOTP('resend@example.com', 'email', oldOtp);
      fail('Expected verifyOTP to throw');
    } catch (err: any) {
      expect(err.code).toBe(ErrorCode.INVALID_OTP);
    }

    // New OTP should be valid
    const isValid = await verifyOTP('resend@example.com', 'email', newOtp);
    expect(isValid).toBe(true);
  });
});