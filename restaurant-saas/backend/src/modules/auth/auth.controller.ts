import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { UserRole, USER_ROLE_TO_PANEL, type Panel } from '../../constants/roles';
import { ErrorCode } from '../../constants/errors';
import { sendOTPEmail, sendPasswordChangedAlertEmail } from '../../services/mail.service';
import * as otpService from '../../services/otp.service';
import { generateTokenPair } from '../../services/jwt.service';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { hashToken } from '../../utils/crypto';
import { COOKIE_OPTIONS } from '../../utils/constants';
import { parseExpiry } from '../../utils/date';
import { sendSuccess } from '../../utils/response';
import * as authService from './auth.service';
import { getMe } from '../users/users.controller';
import { UserModel } from '../users/users.model';
import { logAudit, logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { generateSecureToken } from '../../utils/crypto';
import logger from '../../config/logger';

// ── Panel-aware cookie helpers ────────────────────────────────────────

function panelRefreshCookieName(panel: Panel): string {
  return `ra_${panel}_refresh_token`;
}

function setRefreshCookie(res: Response, refreshToken: string, panel?: Panel): void {
  const cookieName = panel ? panelRefreshCookieName(panel) : env.REFRESH_COOKIE_NAME;
  res.cookie(cookieName, refreshToken, {
    ...COOKIE_OPTIONS,
    domain: env.COOKIE_DOMAIN,
    maxAge: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
  });
}

function clearRefreshCookie(res: Response, panel?: Panel): void {
  const cookieName = panel ? panelRefreshCookieName(panel) : env.REFRESH_COOKIE_NAME;
  res.clearCookie(cookieName, {
    ...COOKIE_OPTIONS,
    domain: env.COOKIE_DOMAIN,
  });
}

export { getMe };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, req.user);
  const panel = USER_ROLE_TO_PANEL[(result.user as any).role as UserRole] ?? undefined;

  setRefreshCookie(res, result.refreshToken, panel);

  sendSuccess(
    res,
    {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
    201,
  );

  void logAuditRaw({
    actorId: result.user._id.toString(),
    actorRole: result.user.role,
    entityType: AuditEntity.USER,
    entityId: result.user._id.toString(),
    action: AuditAction.AUTH_REGISTER,
    metadata: { email: result.user.email },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  const panel = USER_ROLE_TO_PANEL[(result.user as any).role as UserRole] ?? undefined;

  setRefreshCookie(res, result.refreshToken, panel);

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    panel,
  });

  void logAuditRaw({
    actorId: result.user._id.toString(),
    actorRole: result.user.role,
    entityType: AuditEntity.USER,
    entityId: result.user._id.toString(),
    action: AuditAction.AUTH_LOGIN,
    metadata: { email: result.user.email, panel },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
});

const ALL_PANELS: Panel[] = ['customer', 'kitchen', 'staff', 'cleaning', 'admin', 'superadmin'];

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Try panel-specific cookies first, then legacy cookie, then body
  let oldToken: string | undefined;
  let sourcePanel: Panel | undefined;

  for (const p of ALL_PANELS) {
    const cookieVal = req.cookies?.[panelRefreshCookieName(p)];
    if (cookieVal) {
      oldToken = cookieVal;
      sourcePanel = p;
      break;
    }
  }

  if (!oldToken) {
    oldToken = req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  }

  if (!oldToken) {
    throw new AppError('Refresh token not found', 401, ErrorCode.REFRESH_TOKEN_INVALID);
  }

  const result = await authService.refresh(oldToken);

  // Determine panel from the refreshed user if we don't already know
  const panel = sourcePanel ?? USER_ROLE_TO_PANEL[(result.user as any).role as UserRole] ?? undefined;

  setRefreshCookie(res, result.refreshToken, panel);

  sendSuccess(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  if (req.user) {
    void logAudit(req, {
      entityType: AuditEntity.USER,
      entityId: req.user._id.toString(),
      action: AuditAction.AUTH_REFRESH,
      metadata: { panel },
    });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const panel = req.user?.panel;

  // Try panel-specific cookie first, then legacy
  const refreshToken = (panel ? req.cookies?.[panelRefreshCookieName(panel)] : null)
    || req.cookies?.[env.REFRESH_COOKIE_NAME]
    || req.body?.refreshToken;

  if (req.user && refreshToken) {
    await authService.logout(req.user._id, refreshToken);
  }

  // Clear the panel-specific cookie
  if (panel) {
    clearRefreshCookie(res, panel);
  }
  // Also clear legacy cookie for backwards compatibility
  clearRefreshCookie(res);

  sendSuccess(res, { message: 'Logged out successfully' });

  if (req.user) {
    void logAudit(req, {
      entityType: AuditEntity.USER,
      entityId: req.user._id.toString(),
      action: AuditAction.AUTH_LOGOUT,
      metadata: { panel },
    });
  }
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user || user.role === UserRole.CUSTOMER) {
    sendSuccess(res, {
      otpSent: true,
    });
    return;
  }

  const { otp, expiresAt } = await otpService.createOTP(email, 'email');
  await sendOTPEmail(email, otp);

  sendSuccess(res, {
    otpSent: true,
    otpExpiresAt: expiresAt,
  });
  void logAuditRaw({
    actorId: user._id.toString(),
    actorRole: user.role,
    restaurantId: user.restaurantId?.toString(),
    entityType: AuditEntity.USER,
    entityId: user._id.toString(),
    action: AuditAction.AUTH_FORGOT_PASSWORD,
    metadata: { email },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
});

export const verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  await otpService.verifyOTP(email, 'email', otp);

  //const { generateSecureToken, hashToken: hashResetToken } = await import('../../utils/crypto');
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
  }

  const resetToken = generateSecureToken(32);
  const hashedToken = await hashToken(resetToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  sendSuccess(res, {
    resetToken,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  const { compareToken, hashPassword } = await import('../../utils/crypto');

  const users = await UserModel.find({
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken');

  let matchedUser = null;

  for (const user of users) {
    if (user.passwordResetToken && (await compareToken(resetToken, user.passwordResetToken))) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new AppError('Invalid or expired reset token', 400, ErrorCode.INVALID_REQUEST);
  }

  matchedUser.password = await hashPassword(newPassword);
  matchedUser.passwordResetToken = undefined;
  matchedUser.passwordResetExpires = undefined;
  matchedUser.refreshTokens = [];
  await matchedUser.save();

  void logAuditRaw({
    actorId: matchedUser._id.toString(),
    actorRole: matchedUser.role,
    restaurantId: matchedUser.restaurantId?.toString(),
    entityType: AuditEntity.USER,
    entityId: matchedUser._id.toString(),
    action: AuditAction.AUTH_RESET_PASSWORD,
    metadata: { email: matchedUser.email },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  try {
    await sendPasswordChangedAlertEmail(
      matchedUser.email,
      matchedUser.name,
      req.ip,
      req.headers['user-agent']
    );
  } catch (err) {
    logger.error('Failed to send password changed alert', err);
  }

  sendSuccess(res, {});
});

export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  const { expiresAt } = await otpService.createOTP(mobile, 'mobile');

  const userExists = await UserModel.exists({ mobile });
  sendSuccess(res, { otpSent: true, exists: !!userExists, otpExpiresAt: expiresAt });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, otp, name } = req.body;

  await otpService.verifyOTP(mobile, 'mobile', otp);

  let user = await UserModel.findOne({ mobile });

  if (!user) {
    const customerName = name || 'Guest Customer';
    user = await UserModel.create({
      name: customerName,
      mobile,
      email: `otp_${mobile}@placeholder.com`,
      role: UserRole.CUSTOMER,
      isMobileVerified: true,
    });

    logger.info(`Customer registered dynamically via OTP: ${mobile}`);
  } else {
    if (user.role !== UserRole.CUSTOMER) {
      throw new AppError('OTP login is only available for customer accounts', 403, ErrorCode.FORBIDDEN);
    }

    user.isMobileVerified = true;
    if (name) {
      user.name = name;
    }
    await user.save();
  }

  const payload = {
    _id: user._id.toString(),
    email: user.email ?? '',
    role: user.role,
    ...(user.restaurantId && { restaurantId: user.restaurantId.toString() }),
  };

  const tokens = generateTokenPair(payload);
  const tokenHash = await hashToken(tokens.refreshToken);

  await UserModel.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        tokenHash,
        expiresAt: new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN)),
      },
    },
  });

  setRefreshCookie(res, tokens.refreshToken);

  void logAuditRaw({
    actorId: user._id.toString(),
    actorRole: user.role,
    restaurantId: user.restaurantId?.toString(),
    entityType: AuditEntity.USER,
    entityId: user._id.toString(),
    action: AuditAction.AUTH_LOGIN,
    metadata: { mobile, mode: 'otp' },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  sendSuccess(res, {
    customerId: user._id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await authService.getSessions(req.user!._id);
  sendSuccess(res, { sessions });
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  await authService.revokeSession(req.user!._id, req.params.sessionId);
  sendSuccess(res, { message: 'Session revoked' });

  void logAudit(req, {
    entityType: AuditEntity.USER,
    entityId: req.user!._id.toString(),
    action: AuditAction.AUTH_SESSION_REVOKED,
    metadata: { sessionId: req.params.sessionId },
  });
});