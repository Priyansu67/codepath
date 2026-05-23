import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as admin from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', admin.getStats);

router.get('/topics', admin.listTopics);
router.post('/topics', ...admin.createTopic);
router.patch('/topics/:id', ...admin.updateTopic);
router.delete('/topics/:id', admin.deleteTopic);

router.get('/problems', admin.listProblems);
router.post('/problems', ...admin.createProblem);
router.patch('/problems/:id', ...admin.updateProblem);
router.delete('/problems/:id', admin.deleteProblem);

export default router;
