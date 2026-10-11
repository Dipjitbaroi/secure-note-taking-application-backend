import { hashPassword } from '../../common/utils/password';
import { User } from './user.model';
import type { CreateUserInput } from './user.validation';

export async function createUser(input: CreateUserInput) {
  const user = await User.create({ ...input, password: await hashPassword(input.password) });
  return user.toJSON();
}
