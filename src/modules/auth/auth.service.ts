import type { Role } from '../../common/types/role';
import { ApiError } from '../../common/utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { comparePassword, hashPassword } from '../../common/utils/password';
import { User } from '../users/user.model';
import { createUser } from '../users/user.service';
import type { ChangePasswordInput, LoginInput, RegisterInput } from './auth.validation';

// Compared against when the email doesn't exist, so a login for an unknown
// email takes about as long as one with a wrong password.
const dummyHash = hashPassword('dummy-password-for-timing');

function issueTokens(user: { _id: unknown; role: Role; tokenVersion?: number }) {
  const sub = String(user._id);
  const tv = user.tokenVersion ?? 0;
  return {
    accessToken: signAccessToken({ sub, role: user.role, tv }),
    refreshToken: signRefreshToken({ sub, tv }),
  };
}

export async function register(input: RegisterInput) {
  const user = await createUser({ ...input, role: 'user' });
  return { user, ...issueTokens(user) };
}

export async function login({ email, password }: LoginInput) {
  const user = await User.findOne({ email }).select('+password +tokenVersion');

  const valid = await comparePassword(password, user?.password ?? (await dummyHash));
  if (!user || !valid) throw ApiError.unauthorized('Invalid email or password');

  return { user: user.toJSON(), ...issueTokens(user) };
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select('+tokenVersion').lean();
  if (!user || user.tokenVersion !== payload.tv) {
    throw ApiError.unauthorized('Session expired, please log in again');
  }

  const { tokenVersion: _tv, ...publicUser } = user;
  return { user: publicUser, ...issueTokens(user) };
}

// Bumping tokenVersion invalidates every access/refresh token issued so far,
// so logout signs the user out on all devices.
export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  try {
    const { sub, tv } = verifyRefreshToken(refreshToken);
    await User.updateOne({ _id: sub, tokenVersion: tv }, { $inc: { tokenVersion: 1 } });
  } catch {
    // expired or invalid token — nothing to revoke, the cookie gets cleared anyway
  }
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+password +tokenVersion');
  if (!user) throw ApiError.notFound('User not found');

  if (!(await comparePassword(input.currentPassword, user.password))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = await hashPassword(input.newPassword);
  user.tokenVersion += 1;
  await user.save();

  // other sessions are now invalid; hand this one fresh tokens so it stays logged in
  return issueTokens(user);
}
