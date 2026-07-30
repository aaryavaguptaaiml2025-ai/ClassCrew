import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const firebaseUid = req.firebaseUid!;
      // Use the verified email from Firebase token, not from req.body
      const verifiedEmail = req.firebaseEmail || req.body.email;

      let result;
      if (role === 'teacher') {
        result = await authService.registerTeacher(firebaseUid, verifiedEmail, req.body);
      } else {
        result = await authService.registerStudent(firebaseUid, verifiedEmail, req.body);
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
      if (!result) {
        sendSuccess(res, null, 'User profile not found in database');
        return;
      }
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
