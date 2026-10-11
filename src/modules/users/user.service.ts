import * as httpError from '../../common/utils/httpError';
import { getSkip, paginated, type PaginationQuery } from '../../common/utils/pagination';
import { hashPassword } from '../../common/utils/password';
import { Note } from '../notes/note.model';
import { Post } from '../posts/post.model';
import { User } from './user.model';
import type {
  CreateUserInput,
  InterestGroupsQuery,
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
  if (!user) throw httpError.notFound('User not found');
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput | UpdateProfileInput) {
  const update: Record<string, unknown> = { ...input };
  if ('password' in input && input.password) {
    update.password = await hashPassword(input.password);
    // a password reset by an admin should sign the user out everywhere
    update.$inc = { tokenVersion: 1 };
  }

  const user = await User.findByIdAndUpdate(id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!user) throw httpError.notFound('User not found');
  return user;
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) throw httpError.badRequest('You cannot delete your own account');

  const user = await User.findByIdAndDelete(id).lean();
  if (!user) throw httpError.notFound('User not found');

  // Both deletes use the leading `owner` / `author` field of their compound indexes.
  await Promise.all([Note.deleteMany({ owner: user._id }), Post.deleteMany({ author: user._id })]);
}

// Scenario 1: users grouped by interest, in a single aggregate() call.
// Pagination total comes from $facet so no separate count query is needed.
export async function groupUsersByInterest({ interest, ...page }: InterestGroupsQuery) {
  // `$gt: ''` keeps only users with at least one interest and gives the
  // planner index bounds on { interests: 1 } instead of a collection scan.
  const match = interest ? { interests: interest } : { interests: { $gt: '' } };

  const [result] = await User.aggregate<{
    items: { interest: string; count: number; users: unknown[] }[];
    total: { count: number }[];
  }>([
    { $match: match },
    { $project: { name: 1, email: 1, interests: 1 } },
    { $unwind: '$interests' },
    ...(interest ? [{ $match: { interests: interest } }] : []),
    { $sort: { name: 1 } },
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: { $push: { _id: '$_id', name: '$name', email: '$email' } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $facet: {
        items: [
          { $skip: getSkip(page) },
          { $limit: page.limit },
          { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return paginated(result.items, result.total[0]?.count ?? 0, page);
}
