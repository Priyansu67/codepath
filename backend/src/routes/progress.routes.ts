import { Router } from 'express';
import { toggleProgress, getMyProgress, getStats } from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { toggleProgressSchema } from '../validators/progress.validator';

const router = Router();

router.use(requireAuth);
router.get('/me', getMyProgress);
router.get('/stats', getStats);
router.post('/toggle', validate(toggleProgressSchema), toggleProgress);

export default router;
