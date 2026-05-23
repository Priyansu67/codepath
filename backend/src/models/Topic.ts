import mongoose, { Document, Model } from 'mongoose';

export interface ITopic {
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  problemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicDocument extends ITopic, Document {}

const topicSchema = new mongoose.Schema<ITopicDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📚' },
    order: { type: Number, required: true },
    problemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

topicSchema.index({ slug: 1 }, { unique: true });
topicSchema.index({ order: 1 });

export const Topic: Model<ITopicDocument> = mongoose.model<ITopicDocument>('Topic', topicSchema);
