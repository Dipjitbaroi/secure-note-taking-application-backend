import * as httpError from '../../common/utils/httpError';
import { toObjectId } from '../../common/utils/objectId';
import { getSkip, paginated, type PaginationQuery } from '../../common/utils/pagination';
import type { Role } from '../../common/types/role';
import { User } from '../users/user.model';
import { Post } from './post.model';
import type { CreatePostInput, UpdatePostInput } from './post.validation';

export async function createPost(authorId: string, input: CreatePostInput) {
  const post = await Post.create({ ...input, author: authorId });
  return post.toJSON();
}

export async function listPosts(query: PaginationQuery) {
  const [items, total] = await Promise.all([
    Post.find()
      .sort({ _id: -1 })
      .skip(getSkip(query))
      .limit(query.limit)
      .populate('author', 'name')
      .lean(),
    Post.estimatedDocumentCount(),
  ]);
  return paginated(items, total, query);
}

export async function getPost(id: string) {
  const post = await Post.findById(id).populate('author', 'name').lean();
  if (!post) throw httpError.notFound('Post not found');
  return post;
}

// Scenario 2: one aggregation pipeline on `users` that pulls the user's posts in via $lookup.
//  - $match on _id → default _id index
//  - $lookup localField/foreignField becomes { author: <id> } + $sort { _id: -1 }
//    in the sub-pipeline → { author: 1, _id: -1 } index on posts
export async function getPostsByUser(userId: string, query: PaginationQuery) {
  const [user] = await User.aggregate<{
    _id: unknown;
    name: string;
    posts: { items: unknown[]; total: { count: number }[] }[];
  }>([
    { $match: { _id: toObjectId(userId) } },
    { $project: { name: 1 } },
    {
      $lookup: {
        from: Post.collection.name,
        localField: '_id',
        foreignField: 'author',
        pipeline: [
          { $sort: { _id: -1 } },
          {
            $facet: {
              items: [
                { $skip: getSkip(query) },
                { $limit: query.limit },
                { $project: { author: 0 } },
              ],
              total: [{ $count: 'count' }],
            },
          },
        ],
        as: 'posts',
      },
    },
  ]);

  if (!user) throw httpError.notFound('User not found');

  const { items, total } = user.posts[0];
  return {
    author: { _id: user._id, name: user.name },
    ...paginated(items, total[0]?.count ?? 0, query),
  };
}

export async function updatePost(id: string, authorId: string, input: UpdatePostInput) {
  const post = await Post.findOneAndUpdate({ _id: id, author: authorId }, input, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!post) throw httpError.notFound('Post not found');
  return post;
}

// Authors can delete their own posts; admins can remove any post (moderation).
export async function deletePost(id: string, requester: { id: string; role: Role }) {
  const filter = requester.role === 'admin' ? { _id: id } : { _id: id, author: requester.id };
  const post = await Post.findOneAndDelete(filter).lean();
  if (!post) throw httpError.notFound('Post not found');
}
