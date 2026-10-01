import type { AppRole } from '../constants/roles';
import type { Panel } from '../constants/roles';

// src/types/auth.types.ts
// Authentication-related type definitions

export interface JwtPayload {
  _id: string;
  email: string;
  role: AppRole;
  restaurantId?: string;
  /** The panel this token was issued for (e.g. 'kitchen', 'staff', 'admin') */
  panel: Panel;
  /** Internal sub-role within the panel (e.g. 'HEAD_CHEF', 'FLOOR_SUPERVISOR') */
  internal_role?: string;
  mustChangePassword?: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email?: string;
  mobile?: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export interface RefreshTokenDoc {
  token: string;        // bcrypt-hashed refresh token
  userId: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
}