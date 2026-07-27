import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { marksService } from '../services/marks.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';

export const marksController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      if (!classroomId) throw new AppError('classroomId is required', 400);
      const marks = await marksService.getByClassroom(classroomId);
      sendSuccess(res, marks);
    } catch (error) { next(error); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const marks = await marksService.update(req.params.id as string, teacher.teacher_id, req.body);
      sendSuccess(res, marks, 'Marks updated');
    } catch (error) { next(error); }
  },

  async studentMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const marks = await marksService.getByStudent(req.params.id as string);
      sendSuccess(res, marks);
    } catch (error) { next(error); }
  },
};
