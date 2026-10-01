// src/modules/users/users.service.ts
// User business logic â€” all queries filter isDeleted: false by default

import { UserModel, IUser } from './users.model';
import { hashPassword } from '../../utils/crypto';
import { RegisterInput, UpdateProfileInput } from './users.schema';
import { UserRole } from '../../constants/roles';

/**
 * Create a new user with hashed password.
 */
export async function createUser(
  input: RegisterInput & { role?: UserRole },
  role: UserRole = input.role ?? UserRole.CUSTOMER
): Promise<IUser> {
  const hashedPassword = input.password ? await hashPassword(input.password) : undefined;

  const user = await UserModel.create({
    name: input.name,
    email: input.email ? input.email.toLowerCase() : undefined,
    mobile: input.mobile,
    password: hashedPassword,
    role,
  });

  // Return without password
  const userObj = user.toObject();
  delete (userObj as any).password;
  return userObj as IUser;
}

/**
 * Find user by email (includes password for auth).
 */
export async function findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
  const query = UserModel.findOne({ email: email.toLowerCase() });
  if (includePassword) query.select('+password');
  return query.exec();
}

/**
 * Find user by mobile (includes password for auth).
 */
export async function findByMobile(mobile: string, includePassword: boolean = false): Promise<IUser | null> {
  const query = UserModel.findOne({ mobile });
  if (includePassword) query.select('+password');
  return query.exec();
}

/**
 * Find user by ID.
 */
export async function findById(id: string, selects?: string): Promise<IUser | null> {
  const query = UserModel.findById(id);
  if (selects) query.select(selects);
  return query.exec();
}

/**
 * Find user by ID with refresh tokens (for auth operations).
 */
export async function findByIdWithTokens(id: string): Promise<IUser | null> {
  return UserModel.findById(id).select('+refreshTokens +password').exec();
}

/**
 * Update user profile.
 */
export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser | null> {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: input },
    { new: true, runValidators: true }
  ).exec();
}

/**
 * Soft-delete a user account.
 */
export async function softDeleteUser(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    isDeleted: true,
    deletedAt: new Date(),
    email: `deleted_${Date.now()}_${userId}@deleted.com`, // Free up email for reuse
    mobile: `deleted_${Date.now()}_${userId}`,            // Free up mobile for reuse
    refreshTokens: [],
  });
}

/**
 * Check if account is locked.
 */
export function isAccountLocked(user: IUser): boolean {
  if (!user.lockUntil) return false;
  return new Date() < new Date(user.lockUntil);
}

/**
 * Increment failed login attempts and lock if threshold reached.
 */
export async function incrementFailedAttempts(userId: string): Promise<void> {
  const user = await UserModel.findById(userId);
  if (!user) return;

  user.failedLoginAttempts += 1;

  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
  }

  await user.save();
}

/**
 * Reset failed login attempts on successful login.
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    failedLoginAttempts: 0,
    lockUntil: null,
    lastLoginAt: new Date(),
  });
}

/**
 * Check if email is already registered.
 */
export async function emailExists(email?: string): Promise<boolean> {
  if (!email) return false;
  const count = await UserModel.countDocuments({ email: email.toLowerCase() });
  return count > 0;
}

/**
 * Check if mobile is already registered.
 */
export async function mobileExists(mobile: string): Promise<boolean> {
  const count = await UserModel.countDocuments({ mobile });
  return count > 0;
}
