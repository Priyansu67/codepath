import { Types } from 'mongoose';
import { Topic } from '../models/Topic';
import { Problem } from '../models/Problem';
import { UserProgress } from '../models/UserProgress';
import { AppError } from '../utils/AppError';
import { TopicStats } from '../types';

interface EnrichedProblem {
  _id: unknown;
  topicId: unknown;
  topicSlug: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  subtopic: string;
  resources: { youtubeUrl: string; leetcodeUrl: string; codeforcesUrl: string; articleUrl: string };
  tags: string[];
  isCompleted: boolean;
  completedAt: Date | null;
}

interface TopicDetailResult {
  topic: unknown;
  problems: EnrichedProblem[];
  stats: { total: number; completed: number; percentage: number };
}

interface TopicWithStats {
  _id: unknown;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  problemCount: number;
  stats: TopicStats;
}

export async function getAllTopics(userId: string): Promise<TopicWithStats[]> {
  const [topics, problems, progress] = await Promise.all([
    Topic.find().sort({ order: 1 }).lean(),
    Problem.find().select('topicId difficulty').lean(),
    UserProgress.find({ userId: new Types.ObjectId(userId), isCompleted: true })
      .select('problemId')
      .lean(),
  ]);

  const completedSet = new Set(progress.map((p) => p.problemId.toString()));

  return topics.map((topic) => {
    const topicProblems = problems.filter(
      (p) => p.topicId.toString() === topic._id.toString()
    );
    const completed = topicProblems.filter((p) => completedSet.has(p._id.toString())).length;
    const total = topicProblems.length;

    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    const completedByDifficulty = { easy: 0, medium: 0, hard: 0 };

    topicProblems.forEach((p) => {
      byDifficulty[p.difficulty]++;
      if (completedSet.has(p._id.toString())) completedByDifficulty[p.difficulty]++;
    });

    return {
      ...topic,
      stats: {
        total,
        completed,
        percentage: total ? Math.round((completed / total) * 100) : 0,
        byDifficulty,
        completedByDifficulty,
      },
    };
  });
}

export async function getTopicBySlug(slug: string, userId: string): Promise<TopicDetailResult> {
  const topic = await Topic.findOne({ slug }).lean();
  if (!topic) throw new AppError('Topic not found', 404, 'NOT_FOUND');

  const problems = await Problem.find({ topicId: topic._id }).sort({ order: 1 }).lean();

  const progress = await UserProgress.find({
    userId: new Types.ObjectId(userId),
    problemId: { $in: problems.map((p) => p._id) },
  }).lean();

  const progressMap = new Map(progress.map((p) => [p.problemId.toString(), p]));

  const enrichedProblems = problems.map((p) => ({
    ...p,
    isCompleted: progressMap.get(p._id.toString())?.isCompleted ?? false,
    completedAt: progressMap.get(p._id.toString())?.completedAt ?? null,
  }));

  const completed = enrichedProblems.filter((p) => p.isCompleted).length;
  const total = enrichedProblems.length;

  return {
    topic,
    problems: enrichedProblems,
    stats: { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 },
  };
}
