import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Problem } from '../models/Problem';
import { AppError } from '../utils/AppError';

export const getProblems = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '50', difficulty, topicId } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (difficulty) filter.difficulty = difficulty;
  if (topicId) filter.topicId = topicId;

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .sort({ topicId: 1, order: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Problem.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { problems, total, page: Number(page), limit: Number(limit) },
  });
});

export const getProblemById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const problem = await Problem.findById(req.params.id).lean();
  if (!problem) throw new AppError('Problem not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: { problem } });
});
