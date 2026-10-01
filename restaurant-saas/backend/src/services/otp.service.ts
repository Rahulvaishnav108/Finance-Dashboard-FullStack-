import mongoose, { Document, Schema } from 'mongoose';
import fs from 'fs';
import logger from '../config/logger';
import { ErrorCode } from '../constants/errors';
import { AppError } from '../utils/AppError';
import { comparePassword, generateOTP, hashPassword } from '../utils/crypto';
import { sendOTPEmail } from './mail.service';

interface IOtp extends Document {
  identifier: string;
  type: 'email' | 'mobile';
  otpHash: string;
  attempts: number;
  blockedUntil?: Date | null;
  expiresAt: Date;
  otpVerifiedAt?: Date | null;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  identifier: { type: String, required: true },
  type: { type: String, enum: ['email', 'mobile'], required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  blockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  otpVerifiedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ identifier: 1, type: 1 });

const OtpModel = mongoose.model<IOtp>('Otp', otpSchema);

export const OTP_EXPIRY_MINUTES = 2;
const MAX_OTP_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_BLOCK_MINUTES = 15;

export async function createOTP(identifier: string, type: 'email' | 'mobile'): Promise<{ otp: string; expiresAt: Date }> {
  const now = new Date();
  const existing = await OtpModel.findOne({ identifier, type }).sort({ createdAt: -1 });

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    throw new AppError(
      'OTP requests are temporarily blocked. Please try again later.',
      403,
      ErrorCode.FORBIDDEN,
    );
  }

  if (existing && existing.createdAt >= new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000)) {
    throw new AppError('Please wait before requesting another OTP', 429, ErrorCode.RATE_LIMIT_EXCEEDED);
  }

  await OtpModel.deleteMany({ identifier, type });

  const plainOtp = generateOTP(type === 'mobile' ? 4 : 6);
  const otpHash = await hashPassword(plainOtp);

  await OtpModel.create({
    identifier,
    type,
    otpHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  logger.info(`OTP generated for ${type}: ${identifier}`);

  if (type === 'email') {
    const emailSent = await sendOTPEmail(identifier, plainOtp, OTP_EXPIRY_MINUTES);
    if (!emailSent) {
      logger.error(`Failed to send OTP email to ${identifier}`);
    }
  }

  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    logger.warn(`[DEV ONLY] OTP for ${identifier}: ${plainOtp}`);
    try {
      fs.writeFileSync('otp.txt', `OTP for ${identifier}: ${plainOtp}\n`);
      // Also write to workspace root if possible
      try {
        fs.writeFileSync('../otp.txt', `OTP for ${identifier}: ${plainOtp}\n`);
      } catch (rootErr) {
        // Ignore errors if workspace root is not writable
      }
    } catch (err) {
      logger.error('Failed to write OTP to file', err);
    }
  }

  return { otp: plainOtp, expiresAt };
}

export async function verifyOTP(identifier: string, type: 'email' | 'mobile', otp: string): Promise<boolean> {
  const record = await OtpModel.findOne({ identifier, type }).sort({ createdAt: -1 });

  if (!record) {
    throw new AppError('Invalid OTP', 400, ErrorCode.INVALID_OTP);
  }

  if (record.otpVerifiedAt) {
    throw new AppError('This OTP has already been used.', 400, ErrorCode.OTP_ALREADY_USED);
  }

  if (record.blockedUntil && record.blockedUntil > new Date()) {
    throw new AppError('Too many OTP attempts. Please try again later.', 403, ErrorCode.FORBIDDEN);
  }

  if (record.expiresAt <= new Date()) {
    throw new AppError('This OTP has expired. Please request a new OTP.', 400, ErrorCode.OTP_EXPIRED);
  }

  const isValid = await comparePassword(otp, record.otpHash);

  if (!isValid) {
    record.attempts += 1;

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      record.blockedUntil = new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000);
      await record.save();
      throw new AppError(
        'Too many invalid OTP attempts. Please try again later.',
        429,
        ErrorCode.OTP_ATTEMPTS_EXCEEDED,
      );
    }

    await record.save();
    throw new AppError(`Invalid OTP. ${MAX_OTP_ATTEMPTS - record.attempts} attempts remaining`, 400, ErrorCode.INVALID_OTP);
  }

  record.otpVerifiedAt = new Date();
  await record.save();

  return true;
}