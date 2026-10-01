// src/modules/users/users.routes.ts
// User route definitions

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema, deleteAccountSchema } from './users.schema';
import * as userController from './users.controller';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /users/me — Get current user profile
router.get('/me', userController.getMe);

// PATCH /users/me — Update profile
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateProfile);

// PATCH /users/me/password — Change password
router.patch('/me/password', validate({ body: changePasswordSchema }), userController.changePassword);

// DELETE /users/me — Delete account
router.delete('/me', validate({ body: deleteAccountSchema }), userController.deleteAccount);

export default router;
