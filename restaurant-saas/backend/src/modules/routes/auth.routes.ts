import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiters';
import {
  forgotPassword,
  getMe,
  getSessions,
  login,
  logout,
  refresh,
  register,
  requestOtp,
  resetPassword,
  revokeSession,
  verifyOtp,
  verifyResetOtp,
} from '../auth/auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
  verifyOtpSchema,
} from '../auth/auth.schema';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/request-otp', validate({ body: requestOtpSchema }), requestOtp);
authRouter.post('/verify-otp', validate({ body: verifyOtpSchema }), verifyOtp);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', requireAuth, logout);
authRouter.get('/me', requireAuth, getMe);
authRouter.post('/forgot-password', validate({ body: forgotPasswordSchema }), forgotPassword);
authRouter.post('/verify-reset-otp', validate({ body: verifyResetOtpSchema }), verifyResetOtp);
authRouter.post('/reset-password', validate({ body: resetPasswordSchema }), resetPassword);
authRouter.get('/sessions', requireAuth, getSessions);
authRouter.delete('/sessions/:sessionId', requireAuth, revokeSession);
