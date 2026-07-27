import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { calendarService } from '../services/calendar.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';

export const calendarController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      if (classroomId) {
        const events = await calendarService.getByClassroom(classroomId);
        sendSuccess(res, events);
      } else {
        const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
        if (!user) throw new AppError('User not found', 404);
        const student = await userRepository.getStudentProfile(user.id);
        if (!student) throw new AppError('Student not found', 404);
        const events = await calendarService.getStudentEvents(student.student_id);
        sendSuccess(res, events);
      }
    } catch (error) { next(error); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const event = await calendarService.create(teacher.teacher_id, req.body);
      sendCreated(res, event, 'Event created');
    } catch (error) { next(error); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const event = await calendarService.update(req.params.id as string, teacher.teacher_id, req.body);
      sendSuccess(res, event, 'Event updated');
    } catch (error) { next(error); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      await calendarService.delete(req.params.id as string, teacher.teacher_id);
      sendSuccess(res, null, 'Event deleted');
    } catch (error) { next(error); }
  },
};
