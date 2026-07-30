import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { assignmentService } from '../services/assignment.service.js';
import { classroomService } from '../services/classroom.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';

export const assignmentController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      if (classroomId) {
        const assignments = await assignmentService.getByClassroom(classroomId);
        sendSuccess(res, assignments);
      } else {
        // Get assignments across all classrooms for the user
        const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
        if (!user) throw new AppError('User not found', 404);
        const assignments = await assignmentService.getByUser(user.id, user.role);
        sendSuccess(res, assignments);
      }
    } catch (error) { next(error); }
  },

  async detail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await assignmentService.getDetail(req.params.id as string);
      sendSuccess(res, assignment);
    } catch (error) { next(error); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const assignment = await assignmentService.create(teacher.teacher_id, req.body);
      sendCreated(res, assignment, 'Assignment created');
    } catch (error) { next(error); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const assignment = await assignmentService.update(req.params.id as string, teacher.teacher_id, req.body);
      sendSuccess(res, assignment, 'Assignment updated');
    } catch (error) { next(error); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      await assignmentService.delete(req.params.id as string, teacher.teacher_id);
      sendSuccess(res, null, 'Assignment deleted');
    } catch (error) { next(error); }
  },

  async submit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const student = await userRepository.getStudentProfile(user.id);
      if (!student) throw new AppError('Student profile not found', 404);
      const submission = await assignmentService.submit(req.params.id as string, student.student_id);
      sendSuccess(res, submission, 'Assignment submitted');
    } catch (error) { next(error); }
  },

  async submissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await assignmentService.getSubmissions(req.params.id as string);
      sendSuccess(res, submissions);
    } catch (error) { next(error); }
  },

  async review(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const submission = await assignmentService.reviewSubmission(req.params.id as string, req.body);
      sendSuccess(res, submission, 'Submission reviewed');
    } catch (error) { next(error); }
  },
};
