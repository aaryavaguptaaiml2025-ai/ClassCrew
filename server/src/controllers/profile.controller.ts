import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { profileService } from '../services/profile.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export const profileController = {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const profile = await profileService.getProfile(user.id, user.role);
      sendSuccess(res, { user, profile });
    } catch (error) { next(error); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const profile = await profileService.updateProfile(user.id, user.role, req.body);
      sendSuccess(res, profile, 'Profile updated');
    } catch (error) { next(error); }
  },
};
