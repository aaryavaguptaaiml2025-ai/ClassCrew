import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { classroomService } from '../services/classroom.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export const classroomController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);

      if (user.role === 'teacher') {
        const teacher = await userRepository.getTeacherProfile(user.id);
        if (!teacher) throw new AppError('Teacher profile not found', 404);
        const classrooms = await classroomService.getTeacherClassrooms(teacher.teacher_id);
        sendSuccess(res, classrooms);
      } else {
        const student = await userRepository.getStudentProfile(user.id);
        if (!student) throw new AppError('Student profile not found', 404);
        const classrooms = await classroomService.getStudentClassrooms(student.student_id);
        sendSuccess(res, classrooms);
      }
    } catch (error) {
      next(error);
    }
  },

  async detail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroom = await classroomService.getClassroomDetail(req.params.id as string);
      sendSuccess(res, classroom);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classroom = await classroomService.create(teacher.teacher_id, req.body);
      sendCreated(res, classroom, 'Classroom created successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classroom = await classroomService.update(req.params.id as string, teacher.teacher_id, req.body);
      sendSuccess(res, classroom, 'Classroom updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      await classroomService.delete(req.params.id as string, teacher.teacher_id);
      sendSuccess(res, null, 'Classroom deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async join(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const student = await userRepository.getStudentProfile(user.id);
      if (!student) throw new AppError('Student profile not found', 404);
      const classroom = await classroomService.join(student.student_id, req.body.joinCode, user.id);
      sendSuccess(res, classroom, 'Successfully joined classroom');
    } catch (error) {
      next(error);
    }
  },

  async members(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = await classroomService.getMembers(req.params.id as string);
      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  },
};
