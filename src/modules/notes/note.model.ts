import { Schema, model, type InferSchemaType } from 'mongoose';

const noteSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

// "My notes" list: find({ owner }).sort({ _id: -1 }) — equality on owner, then the
// sort is read straight off the index (no in-memory SORT stage).
// Also serves countDocuments({ owner }), the admin `?owner=` filter and the
// deleteMany({ owner }) cascade when a user is removed.
noteSchema.index({ owner: 1, _id: -1 });

// Not added on purpose:
// - get / update / delete a single note go through the default _id index
// - admin "all notes" list is sorted by { _id: -1 }, covered by the _id index

export type NoteDoc = InferSchemaType<typeof noteSchema>;
export const Note = model('Note', noteSchema);
