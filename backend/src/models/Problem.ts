import mongoose, { Document, Model, Types } from 'mongoose';

export interface IResources {
  youtubeUrl: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  articleUrl: string;
}

export interface IProblem {
  topicId: Types.ObjectId;
  topicSlug: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  subtopic: string;
  resources: IResources;
  tags: string[];
  companyTags: string[];
  avgTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblemDocument extends IProblem, Document {}

const problemSchema = new mongoose.Schema<IProblemDocument>(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicSlug: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    order: { type: Number, required: true },
    subtopic: { type: String, default: '' },
    resources: {
      youtubeUrl: { type: String, default: '' },
      leetcodeUrl: { type: String, default: '' },
      codeforcesUrl: { type: String, default: '' },
      articleUrl: { type: String, default: '' },
    },
    tags: [String],
    companyTags: [{ type: String }],
    avgTime: { type: String, default: '' },
  },
  { timestamps: true }
);

problemSchema.index({ topicId: 1, order: 1 });
problemSchema.index({ topicSlug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ slug: 1, topicId: 1 }, { unique: true });

export const Problem: Model<IProblemDocument> = mongoose.model<IProblemDocument>(
  'Problem',
  problemSchema
);
