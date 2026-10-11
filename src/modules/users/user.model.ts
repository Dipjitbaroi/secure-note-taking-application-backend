import { Schema, model, type InferSchemaType } from 'mongoose';
import { ROLES } from '../../common/types/role';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    interests: { type: [String], default: [] },
    // Bumped on logout / password change; tokens carrying an older version are rejected.
    tokenVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true, versionKey: false },
);

// Login: User.findOne({ email }). Also enforces one account per email.
userSchema.index({ email: 1 }, { unique: true });

// "Group by interests" aggregation: the leading $match on `interests`
// (with or without a specific interest filter) runs as an IXSCAN on this multikey index.
userSchema.index({ interests: 1 });

// Not added on purpose:
// - profile / admin get-by-id use the default _id index
// - admin user list is sorted by { _id: -1 }, which the _id index already covers

userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.password;
    delete ret.tokenVersion;
    return ret;
  },
});

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
