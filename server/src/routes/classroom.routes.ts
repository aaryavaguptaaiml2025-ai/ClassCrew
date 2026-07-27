import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createClassroomSchema, updateClassroomSchema, joinClassroomSchema } from '../validators/schemas.js';
import { classroomController } from '../controllers/classroom.controller.js';

const router = Router();

router.get('/', authenticate, classroomController.list);
router.get('/:id', authenticate, classroomController.detail);
router.post('/', authenticate, validate(createClassroomSchema), classroomController.create);
router.patch('/:id', authenticate, validate(updateClassroomSchema), classroomController.update);
router.delete('/:id', authenticate, classroomController.delete);
router.post('/join', authenticate, validate(joinClassroomSchema), classroomController.join);
router.get('/:id/members', authenticate, classroomController.members);

export default router;
