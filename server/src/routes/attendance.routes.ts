import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { markAttendanceSchema } from '../validators/schemas.js';
import { attendanceController } from '../controllers/attendance.controller.js';

const router = Router();

router.get('/', authenticate, attendanceController.list);
router.post('/', authenticate, validate(markAttendanceSchema), attendanceController.mark);
router.get('/student/:id', authenticate, attendanceController.studentAttendance);

export default router;
