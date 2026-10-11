import { ApiError } from '../../common/utils/ApiError';
import { getSkip, paginated, type PaginationQuery } from '../../common/utils/pagination';
import { hashPassword } from '../../common/utils/password';
import { Note } from '../notes/note.model';
import { Post } from '../posts/post.model';
import { User } from './user.model';
import type {
  CreateUserInput,
  UpdateProfileInput,
  UpdateUserInput,
} from './user.validation';

export async function createUser(input: CreateUserInput) {
  const user = await User.create({ ...input, password: await hashPassword(input.password) });
  return user.toJSON();
}

export async function listUsers(query: PaginationQuery) {
  const [items, total] = await Promise.all([
    User.find().sort({ _id: -1 }).skip(getSkip(query)).limit(query.limit).lean(),
    User.estimatedDocumentCount(),
  ]);
  return paginated(items, total, query);
}

export async function getUserById(id: string) {
  const user = await User.findById(id).lean();
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput | UpdateProfileInput) {
  const update = { ...input };
  if ('password' in update && update.password) {
    update.password = await hashPassword(update.password);
  }

  const user = await User.findByIdAndUpdate(id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) throw ApiError.badRequest('You cannot delete your own account');

  const user = await User.findByIdAndDelete(id).lean();
  if (!user) throw ApiError.notFound('User not found');

  // Both deletes use the leading `owner` / `author` field of their compound indexes.
  await Promise.all([Note.deleteMany({ owner: user._id }), Post.deleteMany({ author: user._id })]);
}
