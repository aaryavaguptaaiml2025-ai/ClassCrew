import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateMarksSchema } from '../validators/schemas.js';
import { marksController } from '../controllers/marks.controller.js';

const router = Router();

router.get('/', authenticate, marksController.list);
router.patch('/:id', authenticate, validate(updateMarksSchema), marksController.update);
router.get('/student/:id', authenticate, marksController.studentMarks);

export default router;
