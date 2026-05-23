import { Topic } from '../models/Topic';
import { Problem } from '../models/Problem';
import { AppError } from '../utils/AppError';
import type { CreateTopicInput, UpdateTopicInput, CreateProblemInput, UpdateProblemInput } from '../validators/admin.validator';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function adminListTopics() {
  return Topic.find().sort({ order: 1 }).lean();
}

export async function adminCreateTopic(data: CreateTopicInput) {
  const slug = slugify(data.title);
  const existing = await Topic.findOne({ slug }).lean();
  if (existing) throw new AppError('A topic with this title already exists', 409, 'DUPLICATE_KEY');

  const topic = await Topic.create({ ...data, slug, problemCount: 0 });
  return topic.toObject();
}

export async function adminUpdateTopic(id: string, data: UpdateTopicInput) {
  const update: Record<string, unknown> = { ...data };
  if (data.title) update.slug = slugify(data.title);

  const topic = await Topic.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
  if (!topic) throw new AppError('Topic not found', 404, 'NOT_FOUND');
  return topic;
}

export async function adminDeleteTopic(id: string) {
  const problemCount = await Problem.countDocuments({ topicId: id });
  if (problemCount > 0) {
    throw new AppError(
      `Cannot delete — topic has ${problemCount} problem(s). Delete them first.`,
      409,
      'CONFLICT'
    );
  }
  const topic = await Topic.findByIdAndDelete(id).lean();
  if (!topic) throw new AppError('Topic not found', 404, 'NOT_FOUND');
}

// ─── Problems ─────────────────────────────────────────────────────────────────

export async function adminListProblems(topicId?: string) {
  const filter = topicId ? { topicId } : {};
  return Problem.find(filter).sort({ topicSlug: 1, order: 1 }).lean();
}

export async function adminCreateProblem(data: CreateProblemInput) {
  const topic = await Topic.findById(data.topicId).lean();
  if (!topic) throw new AppError('Topic not found', 404, 'NOT_FOUND');

  const slug = slugify(data.title);
  const existing = await Problem.findOne({ slug, topicId: data.topicId }).lean();
  if (existing) throw new AppError('A problem with this title already exists in this topic', 409, 'DUPLICATE_KEY');

  const problem = await Problem.create({ ...data, slug, topicSlug: topic.slug });

  await Topic.findByIdAndUpdate(data.topicId, { $inc: { problemCount: 1 } });

  return problem.toObject();
}

export async function adminUpdateProblem(id: string, data: UpdateProblemInput) {
  const update: Record<string, unknown> = { ...data };
  if (data.title) update.slug = slugify(data.title);

  const problem = await Problem.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
  if (!problem) throw new AppError('Problem not found', 404, 'NOT_FOUND');
  return problem;
}

export async function adminDeleteProblem(id: string) {
  const problem = await Problem.findByIdAndDelete(id).lean();
  if (!problem) throw new AppError('Problem not found', 404, 'NOT_FOUND');

  await Topic.findByIdAndUpdate(problem.topicId, { $inc: { problemCount: -1 } });
}

// ─── Users overview ───────────────────────────────────────────────────────────

export async function adminGetStats() {
  const { User } = await import('../models/User');
  const { UserProgress } = await import('../models/UserProgress');

  const [totalUsers, totalProblems, totalCompletions] = await Promise.all([
    User.countDocuments(),
    Problem.countDocuments(),
    UserProgress.countDocuments({ isCompleted: true }),
  ]);

  return { totalUsers, totalProblems, totalCompletions };
}
