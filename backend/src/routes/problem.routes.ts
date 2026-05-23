import { Router } from 'express';
import { getProblems, getProblemById } from '../controllers/problem.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/', getProblems);
router.get('/:id', getProblemById);

export default router;
