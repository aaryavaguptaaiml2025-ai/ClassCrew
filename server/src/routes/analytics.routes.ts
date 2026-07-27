import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { analyticsController } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/teacher', authenticate, analyticsController.teacher);
router.get('/student', authenticate, analyticsController.student);

export default router;
