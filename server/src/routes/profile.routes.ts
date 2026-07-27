import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/schemas.js';
import { profileController } from '../controllers/profile.controller.js';

const router = Router();

router.get('/', authenticate, profileController.get);
router.patch('/', authenticate, validate(updateProfileSchema), profileController.update);

export default router;
