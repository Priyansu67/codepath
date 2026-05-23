import mongoose, { Document, Model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  role: 'student' | 'admin';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
