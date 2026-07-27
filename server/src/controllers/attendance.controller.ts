import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { attendanceService } from '../services/attendance.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';

export const attendanceController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      const date = getQueryString(req, 'date');
      if (!classroomId) throw new AppError('classroomId is required', 400);
      if (date) {
        const records = await attendanceService.getByClassroomAndDate(classroomId, date);
        sendSuccess(res, records);
      } else {
        const dates = await attendanceService.getAttendanceDates(classroomId);
        sendSuccess(res, dates);
      }
    } catch (error) { next(error); }
  },

  async mark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const records = await attendanceService.markAttendance(teacher.teacher_id, req.body);
      sendSuccess(res, records, 'Attendance marked');
    } catch (error) { next(error); }
  },

  async studentAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      const records = await attendanceService.getStudentAttendance(req.params.id as string, classroomId);
      sendSuccess(res, records);
    } catch (error) { next(error); }
  },
};
