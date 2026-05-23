import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import {
  createTopicSchema,
  updateTopicSchema,
  createProblemSchema,
  updateProblemSchema,
} from '../validators/admin.validator';
import * as adminService from '../services/admin.service';

// ─── Topics ───────────────────────────────────────────────────────────────────

export const listTopics = asyncHandler(async (_req: Request, res: Response) => {
  const topics = await adminService.adminListTopics();
  res.json({ success: true, data: { topics } });
});

export const createTopic = [
  validate(createTopicSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const topic = await adminService.adminCreateTopic(req.body);
    res.status(201).json({ success: true, data: { topic } });
  }),
];

export const updateTopic = [
  validate(updateTopicSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const topic = await adminService.adminUpdateTopic(req.params.id, req.body);
    res.json({ success: true, data: { topic } });
  }),
];

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  await adminService.adminDeleteTopic(req.params.id);
  res.status(204).end();
});

// ─── Problems ─────────────────────────────────────────────────────────────────

export const listProblems = asyncHandler(async (req: Request, res: Response) => {
  const topicId = req.query.topicId as string | undefined;
  const problems = await adminService.adminListProblems(topicId);
  res.json({ success: true, data: { problems } });
});

export const createProblem = [
  validate(createProblemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const problem = await adminService.adminCreateProblem(req.body);
    res.status(201).json({ success: true, data: { problem } });
  }),
];

export const updateProblem = [
  validate(updateProblemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const problem = await adminService.adminUpdateProblem(req.params.id, req.body);
    res.json({ success: true, data: { problem } });
  }),
];

export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  await adminService.adminDeleteProblem(req.params.id);
  res.status(204).end();
});

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.adminGetStats();
  res.json({ success: true, data: stats });
});
