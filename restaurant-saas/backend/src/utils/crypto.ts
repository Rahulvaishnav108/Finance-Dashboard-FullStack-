// src/utils/crypto.ts
// Cryptographic utilities — hashing, comparison, token generation

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Hash a refresh token with bcrypt before storing in DB.
 * Per instruction.md: refresh tokens must be hashed, not stored plain.
 */
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compare a plain token against a bcrypt hash.
 */
export async function compareToken(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash a password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compare a plain password against a bcrypt hash.
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Timing-safe string comparison.
 * Per instruction.md: use crypto.timingSafeEqual() for all token comparisons — no ===
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate a cryptographically secure random token.
 * Used for: invite tokens, reset tokens, OTP, session tokens.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a numeric OTP of specified length.
 */
export function generateOTP(length: number = 6): string {
  const max = Math.pow(10, length);
  const otp = crypto.randomInt(0, max);
  return otp.toString().padStart(length, '0');
}
