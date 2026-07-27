import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notification.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export const notificationController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const result = await notificationService.getNotifications(user.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  },

  async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      await notificationService.markAllRead(user.id);
      sendSuccess(res, null, 'Notifications marked as read');
    } catch (error) { next(error); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id as string);
      sendSuccess(res, null, 'Notification deleted');
    } catch (error) { next(error); }
  },
};
