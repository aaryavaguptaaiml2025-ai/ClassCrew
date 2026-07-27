import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationController } from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, notificationController.list);
router.patch('/read', authenticate, notificationController.markRead);
router.delete('/:id', authenticate, notificationController.delete);

export default router;
