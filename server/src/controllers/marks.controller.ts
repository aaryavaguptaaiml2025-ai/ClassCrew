import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { marksService } from '../services/marks.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';
import { marksRepository } from '../repositories/marks.repository.js';

export const marksController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      if (!classroomId) throw new AppError('classroomId is required', 400);
      const marks = await marksService.getByClassroom(classroomId);
      sendSuccess(res, marks);
    } catch (error) { next(error); }
  },

  async saveBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);

      const { classroomId, records } = req.body;
      if (!classroomId || !records) throw new AppError('classroomId and records are required', 400);

      const saved = [];
      for (const record of records) {
        const result = await marksRepository.upsert({
          classroom_id: classroomId,
          student_id: record.studentId,
          internal: record.internal ?? null,
          quiz: record.quiz ?? null,
          mid_semester: record.midSemester ?? null,
          end_semester: record.endSemester ?? null,
        });
        saved.push(result);
      }

      sendSuccess(res, saved, 'Marks saved successfully');
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
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const student = await userRepository.getStudentProfile(user.id);
      if (!student) throw new AppError('Student not found', 404);
      const marks = await marksService.getByStudent(student.student_id);
      sendSuccess(res, marks);
    } catch (error) { next(error); }
  },
};
