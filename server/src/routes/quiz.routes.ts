import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createQuizSchema, submitQuizSchema } from '../validators/schemas.js';
import { quizController } from '../controllers/quiz.controller.js';

const router = Router();

router.get('/', authenticate, quizController.list);
router.get('/:id', authenticate, quizController.detail);
router.post('/', authenticate, validate(createQuizSchema), quizController.create);
router.patch('/:id', authenticate, quizController.update);
router.delete('/:id', authenticate, quizController.delete);
router.get('/:id/start', authenticate, quizController.start);
router.post('/:id/submit', authenticate, validate(submitQuizSchema), quizController.submitAttempt);
router.get('/:id/results', authenticate, quizController.results);

export default router;
