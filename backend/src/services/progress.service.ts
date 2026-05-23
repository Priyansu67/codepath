import { Types } from 'mongoose';
import { Problem } from '../models/Problem';
import { Topic } from '../models/Topic';
import { UserProgress, IUserProgressDocument } from '../models/UserProgress';
import { AppError } from '../utils/AppError';
import { getRedis, isRedisAvailable } from '../config/redis';

export async function toggleProgress(
  userId: string,
  problemId: string,
  isCompleted: boolean
): Promise<IUserProgressDocument> {
  const problem = await Problem.findById(problemId).lean();
  if (!problem) throw new AppError('Problem not found', 404, 'NOT_FOUND');

  const progress = await UserProgress.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), problemId: new Types.ObjectId(problemId) },
    {
      $set: { isCompleted, completedAt: isCompleted ? new Date() : null },
      $setOnInsert: {
        userId: new Types.ObjectId(userId),
        problemId: new Types.ObjectId(problemId),
      },
    },
    { upsert: true, new: true }
  );

  if (!progress) throw new AppError('Failed to update progress', 500);

  const redis = getRedis();
  if (isRedisAvailable() && redis) {
    await redis.del(`stats:${userId}`);
  }

  return progress;
}

export async function getUserProgress(userId: string) {
  return UserProgress.find({ userId: new Types.ObjectId(userId) }).lean();
}

export async function getStats(userId: string) {
  const redis = getRedis();
  const cacheKey = `stats:${userId}`;

  if (isRedisAvailable() && redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as ReturnType<typeof buildStats>;
  }

  const [topics, problems, progress] = await Promise.all([
    Topic.find().sort({ order: 1 }).lean(),
    Problem.find().lean(),
    UserProgress.find({ userId: new Types.ObjectId(userId), isCompleted: true }).lean(),
  ]);

  const completedSet = new Set(progress.map((p) => p.problemId.toString()));
  const stats = buildStats(topics, problems, completedSet);

  if (isRedisAvailable() && redis) {
    await redis.setex(cacheKey, 300, JSON.stringify(stats));
  }

  return stats;
}

function buildStats(
  topics: Array<{ _id: unknown; slug: string; title: string; icon: string }>,
  problems: Array<{ _id: unknown; topicId: unknown; difficulty: 'easy' | 'medium' | 'hard' }>,
  completedSet: Set<string>
) {
  const overall = {
    total: problems.length,
    completed: completedSet.size,
    percentage: problems.length ? Math.round((completedSet.size / problems.length) * 100) : 0,
  };

  const byDifficulty = {
    easy: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    hard: { total: 0, completed: 0 },
  };

  problems.forEach((p) => {
    byDifficulty[p.difficulty].total++;
    if (completedSet.has(String(p._id))) byDifficulty[p.difficulty].completed++;
  });

  const perTopic = topics.map((topic) => {
    const tp = problems.filter((p) => String(p.topicId) === String(topic._id));
    const done = tp.filter((p) => completedSet.has(String(p._id))).length;
    return {
      topicId: topic._id,
      slug: topic.slug,
      title: topic.title,
      icon: topic.icon,
      total: tp.length,
      completed: done,
      percentage: tp.length ? Math.round((done / tp.length) * 100) : 0,
    };
  });

  return { overall, byDifficulty, perTopic };
}
