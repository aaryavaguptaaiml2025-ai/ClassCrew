import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const firebaseUid = req.firebaseUid!;

      let result;
      if (role === 'teacher') {
        result = await authService.registerTeacher(firebaseUid, req.body);
      } else {
        result = await authService.registerStudent(firebaseUid, req.body);
      }

      sendCreated(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const firebaseUid = req.firebaseUid!;
      const result = await authService.getAuthenticatedUser(firebaseUid);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
