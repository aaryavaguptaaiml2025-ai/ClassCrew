import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAssignmentSchema, updateAssignmentSchema, reviewSubmissionSchema } from '../validators/schemas.js';
import { assignmentController } from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', authenticate, assignmentController.list);
router.get('/:id', authenticate, assignmentController.detail);
router.post('/', authenticate, validate(createAssignmentSchema), assignmentController.create);
router.patch('/:id', authenticate, validate(updateAssignmentSchema), assignmentController.update);
router.delete('/:id', authenticate, assignmentController.delete);
router.post('/:id/submit', authenticate, assignmentController.submit);
router.get('/:id/submissions', authenticate, assignmentController.submissions);
router.patch('/:id/review', authenticate, validate(reviewSubmissionSchema), assignmentController.review);

export default router;
