import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as topicService from '../services/topic.service';

export const getTopics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const topics = await topicService.getAllTopics(req.user!._id);
  res.json({ success: true, data: { topics } });
});

export const getTopicBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await topicService.getTopicBySlug(req.params.slug, req.user!._id);
  res.json({ success: true, data: result });
});
