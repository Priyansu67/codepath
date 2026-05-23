import { Router } from 'express';
import { getTopics, getTopicBySlug } from '../controllers/topic.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/', getTopics);
router.get('/:slug', getTopicBySlug);

export default router;
