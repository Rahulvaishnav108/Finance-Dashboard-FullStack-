// src/modules/users/users.controller.ts
// User route handlers

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import * as userService from './users.service';
import { comparePassword, hashPassword } from '../../utils/crypto';
import { sendPasswordChangedAlertEmail } from '../../services/mail.service';
import logger from '../../config/logger';

/**
 * GET /auth/me — Get current authenticated user's profile.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findById(req.user!._id);

  if (!user) {
    throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
  }

  sendSuccess(res, { user });
});

/**
 * PATCH /users/me — Update current user's profile.
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!._id, req.body);

  if (!user) {
    throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
  }

  sendSuccess(res, { user });
});

/**
 * PATCH /users/me/password — Change password.
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findByIdWithTokens(req.user!._id);

  if (!user) {
    throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
  }

  const { currentPassword, newPassword } = req.body;

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400, ErrorCode.INVALID_REQUEST);
  }

  user.password = await hashPassword(newPassword);
  user.mustChangePassword = false;
  user.refreshTokens = []; // Invalidate all sessions on password change
  await user.save();

  try {
    await sendPasswordChangedAlertEmail(
      user.email,
      user.name,
      req.ip,
      req.headers['user-agent']
    );
  } catch (err) {
    logger.error('Failed to send password changed alert', err);
  }

  sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
});

/**
 * DELETE /users/me — Soft-delete account (requires confirmation text).
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.softDeleteUser(req.user!._id);
  sendSuccess(res, { message: 'Account deleted successfully' });
});