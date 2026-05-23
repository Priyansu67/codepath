import { Router } from 'express';
import { getTopics, getTopicBySlug } from '../controllers/topic.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.use(optionalAuth);
router.get('/', getTopics);
router.get('/:slug', getTopicBySlug);

export default router;
