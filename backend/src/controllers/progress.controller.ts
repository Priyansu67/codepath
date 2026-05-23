import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as progressService from '../services/progress.service';

export const toggleProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { problemId, isCompleted } = req.body as { problemId: string; isCompleted: boolean };
  const progress = await progressService.toggleProgress(req.user!._id, problemId, isCompleted);
  res.json({ success: true, data: { progress } });
});

export const getMyProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const progress = await progressService.getUserProgress(req.user!._id);
  res.json({ success: true, data: { progress } });
});

export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await progressService.getStats(req.user!._id);
  res.json({ success: true, data: stats });
});
