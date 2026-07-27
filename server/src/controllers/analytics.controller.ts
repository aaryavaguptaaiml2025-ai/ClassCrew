import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { analyticsService } from '../services/analytics.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyticsController = {
  async teacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const analytics = await analyticsService.getTeacherAnalytics(teacher.teacher_id);
      sendSuccess(res, analytics);
    } catch (error) { next(error); }
  },

  async student(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const student = await userRepository.getStudentProfile(user.id);
      if (!student) throw new AppError('Student not found', 404);
      const analytics = await analyticsService.getStudentAnalytics(student.student_id);
      sendSuccess(res, analytics);
    } catch (error) { next(error); }
  },
};
