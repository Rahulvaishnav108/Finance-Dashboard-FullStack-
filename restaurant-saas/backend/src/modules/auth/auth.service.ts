import { env } from '../../config/env';
import logger from '../../config/logger';
import { ErrorCode } from '../../constants/errors';
import { USER_ROLE_TO_PANEL, UserRole } from '../../constants/roles';
import { sendPasswordResetEmail } from '../../services/mail.service';
import { generateTokenPair } from '../../services/jwt.service';
import type { JwtPayload } from '../../types/auth.types';
import { AppError } from '../../utils/AppError';
import { comparePassword, compareToken, generateSecureToken, hashPassword, hashToken } from '../../utils/crypto';
import { parseExpiry } from '../../utils/date';
import { UserModel, type IUser } from '../users/users.model';
import * as userService from '../users/users.service';
import type { LoginInput, RegisterInput } from './auth.schema';

function getInternalRole(user: IUser): string | undefined {
  switch (user.role) {
    case UserRole.KITCHEN_STAFF:
      return user.kitchen_role ?? undefined;
    case UserRole.SERVICE_STAFF:
      return user.staff_role ?? undefined;
    case UserRole.CLEANING_STAFF:
      return user.cleaning_role ?? undefined;
    default:
      return undefined;
  }
}

function buildPayload(user: IUser): JwtPayload {
  return {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    panel: USER_ROLE_TO_PANEL[user.role],
    internal_role: getInternalRole(user),
    mustChangePassword: user.mustChangePassword,
    ...(user.restaurantId && { restaurantId: user.restaurantId.toString() }),
  };
}

export async function register(input: RegisterInput, _requester?: unknown) {
  if (await userService.emailExists(input.email)) {
    throw new AppError('Email already registered', 409, ErrorCode.CONFLICT);
  }
  if (await userService.mobileExists(input.mobile)) {
    throw new AppError('Mobile number already registered', 409, ErrorCode.CONFLICT);
  }

  const user = await userService.createUser(input);
  const payload = buildPayload(user);
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

  return { user, ...tokens };
}

export async function login(input: LoginInput, meta?: { userAgent?: string; ip?: string }) {
  let user: IUser | null = null;

  if (input.email) {
    user = await userService.findByEmail(input.email, true);
  } else if (input.mobile) {
    user = await userService.findByMobile(input.mobile, true);
  }

  if (!user) {
    throw new AppError('Invalid credentials', 401, ErrorCode.UNAUTHORIZED);
  }

  if (userService.isAccountLocked(user)) {
    throw new AppError('Account is temporarily locked. Please try again later.', 423, ErrorCode.ACCOUNT_LOCKED);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is not active', 403, ErrorCode.FORBIDDEN);
  }

  const isValid = await comparePassword(input.password, user.password);

  if (!isValid) {
    await userService.incrementFailedAttempts(user._id.toString());
    throw new AppError('Invalid credentials', 401, ErrorCode.UNAUTHORIZED);
  }

  await userService.resetFailedAttempts(user._id.toString());

  const payload = buildPayload(user);
  const tokens = generateTokenPair(payload);

  const tokenHash = await hashToken(tokens.refreshToken);
  await UserModel.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        tokenHash,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
        expiresAt: new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN)),
      },
    },
  });

  const userObj = user.toObject();
  delete (userObj as { password?: string }).password;
  delete (userObj as { refreshTokens?: unknown[] }).refreshTokens;

  return { user: userObj, ...tokens };
}

export async function refresh(oldRefreshToken: string) {
  const users = await UserModel.find({}).select('+refreshTokens');

  let matchedUser: IUser | null = null;
  let matchedTokenIndex = -1;

  for (const user of users) {
    if (!user.refreshTokens?.length) {
      continue;
    }

    for (let index = 0; index < user.refreshTokens.length; index += 1) {
      const refreshToken = user.refreshTokens[index];

      if (new Date() > new Date(refreshToken.expiresAt)) {
        continue;
      }

      const isMatch = await compareToken(oldRefreshToken, refreshToken.tokenHash);
      if (isMatch) {
        matchedUser = user;
        matchedTokenIndex = index;
        break;
      }
    }

    if (matchedUser) {
      break;
    }
  }

  if (!matchedUser || matchedTokenIndex === -1) {
    throw new AppError('Invalid refresh token', 401, ErrorCode.REFRESH_TOKEN_INVALID);
  }

  matchedUser.refreshTokens.splice(matchedTokenIndex, 1);
  matchedUser.refreshTokens = matchedUser.refreshTokens.filter((refreshToken) => new Date() < new Date(refreshToken.expiresAt));

  const payload = buildPayload(matchedUser);
  const tokens = generateTokenPair(payload);
  const tokenHash = await hashToken(tokens.refreshToken);

  matchedUser.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN)),
    createdAt: new Date(),
  } as IUser['refreshTokens'][number]);

  await matchedUser.save();

  return {
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  user: matchedUser,
  };
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  const user = await UserModel.findById(userId).select('+refreshTokens');
  if (!user) {
    return;
  }

  const filtered = [];
  for (const token of user.refreshTokens) {
    const isMatch = await compareToken(refreshToken, token.tokenHash);
    if (!isMatch) {
      filtered.push(token);
    }
  }

  user.refreshTokens = filtered as IUser['refreshTokens'];
  await user.save();
}

export async function logoutAll(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { refreshTokens: [] });
}

export async function getSessions(userId: string) {
  const user = await UserModel.findById(userId).select('+refreshTokens');
  if (!user) {
    return [];
  }

  return user.refreshTokens
    .filter((refreshToken) => new Date() < new Date(refreshToken.expiresAt))
    .map((refreshToken) => ({
      _id: (refreshToken as { _id?: string })._id,
      userAgent: refreshToken.userAgent,
      ip: refreshToken.ip,
      createdAt: refreshToken.createdAt,
      expiresAt: refreshToken.expiresAt,
    }));
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { _id: sessionId } },
  });
}

export async function forgotPassword(email: string): Promise<{ delivered: boolean; resetToken?: string }> {
  const user = await userService.findByEmail(email);

  if (!user) {
    logger.info(`Password reset requested for non-existent email: ${email}`);
    return { delivered: false };
  }

  const resetToken = generateSecureToken(32);
  const hashedToken = await hashToken(resetToken);

  await UserModel.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
  });

  const delivered = await sendPasswordResetEmail(email, resetToken);

  return {
    delivered,
    ...(env.isProduction ? {} : { resetToken }),
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const users = await UserModel.find({
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken');

  let matchedUser: IUser | null = null;

  for (const user of users) {
    if (!user.passwordResetToken) {
      continue;
    }

    const isMatch = await compareToken(token, user.passwordResetToken);
    if (isMatch) {
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
}