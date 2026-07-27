import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCalendarEventSchema } from '../validators/schemas.js';
import { calendarController } from '../controllers/calendar.controller.js';

const router = Router();

router.get('/', authenticate, calendarController.list);
router.post('/', authenticate, validate(createCalendarEventSchema), calendarController.create);
router.patch('/:id', authenticate, calendarController.update);
router.delete('/:id', authenticate, calendarController.delete);

export default router;
