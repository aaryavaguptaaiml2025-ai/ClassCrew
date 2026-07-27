import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../validators/schemas.js';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authenticate, validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.me);

export default router;
