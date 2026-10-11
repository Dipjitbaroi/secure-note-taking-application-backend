import { ApiError } from '../../common/utils/ApiError';
import { signToken } from '../../common/utils/jwt';
import { comparePassword, hashPassword } from '../../common/utils/password';
import { User } from '../users/user.model';
import { createUser } from '../users/user.service';
import type { LoginInput, RegisterInput } from './auth.validation';

// Compared against when the email doesn't exist, so a login for an unknown
// email takes about as long as one with a wrong password.
const dummyHash = hashPassword('dummy-password-for-timing');

function issueToken(user: { _id: unknown; role: 'user' | 'admin' }) {
  return signToken({ sub: String(user._id), role: user.role });
}

export async function register(input: RegisterInput) {
  const user = await createUser({ ...input, role: 'user' });
  return { user, token: issueToken(user) };
}

export async function login({ email, password }: LoginInput) {
  const user = await User.findOne({ email }).select('+password');

  const valid = await comparePassword(password, user?.password ?? (await dummyHash));
  if (!user || !valid) throw ApiError.unauthorized('Invalid email or password');

  return { user: user.toJSON(), token: issueToken(user) };
}
