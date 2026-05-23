import mongoose, { Document, Model, Types } from 'mongoose';

export interface IUserProgress {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  isCompleted: boolean;
  completedAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProgressDocument extends IUserProgress, Document {}

const userProgressSchema = new mongoose.Schema<IUserProgressDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
userProgressSchema.index({ userId: 1, completedAt: -1 });

export const UserProgress: Model<IUserProgressDocument> =
  mongoose.model<IUserProgressDocument>('UserProgress', userProgressSchema);
