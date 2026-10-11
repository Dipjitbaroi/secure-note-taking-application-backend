import { Schema, model, type InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

// Scenario 2 ($lookup from users): the lookup turns into a $match on `author`
// followed by $sort { _id: -1 } inside the sub-pipeline, so this index handles both.
// Also used by the deleteMany({ author }) cascade when a user is removed.
postSchema.index({ author: 1, _id: -1 });

// Not added on purpose:
// - public feed is sorted by { _id: -1 } → default _id index
// - get / update / delete a single post → default _id index

export type PostDoc = InferSchemaType<typeof postSchema>;
export const Post = model('Post', postSchema);
