import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { USER_ROLE_TO_PANEL, UserRole } from '../constants/roles';
import type { JwtPayload, TokenPair } from '../types/auth.types';
import { generateSecureToken } from '../utils/crypto';

type DecodedAccessToken = JwtPayload & {
  sub?: string;
};

function normalizePayload(payload: DecodedAccessToken): JwtPayload {
  const id = payload._id ?? payload.sub;

  if (!id) {
    throw new Error('Invalid access token payload');
  }

  const role = payload.role as UserRole;
  return {
    _id: id,
    email: payload.email,
    role,
    restaurantId: payload.restaurantId,
    panel: payload.panel ?? USER_ROLE_TO_PANEL[role],
    internal_role: payload.internal_role,
    mustChangePassword: payload.mustChangePassword,
  };
}

export function signAccessToken(payload: Omit<JwtPayload, 'panel'> & { panel?: JwtPayload['panel'] }): string {
  const panel = payload.panel ?? USER_ROLE_TO_PANEL[payload.role as UserRole];
  return jwt.sign({ ...payload, panel }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(): string {
  return generateSecureToken(64);
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as DecodedAccessToken;
  return normalizePayload(payload);
}

export function generateTokenPair(payload: Omit<JwtPayload, 'panel'> & { panel?: JwtPayload['panel'] }): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: generateRefreshToken(),
  };
}