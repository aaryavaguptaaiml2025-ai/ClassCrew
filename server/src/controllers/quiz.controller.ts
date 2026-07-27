import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { quizService } from '../services/quiz.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getQueryString } from '../utils/query.js';

export const quizController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classroomId = getQueryString(req, 'classroomId');
      if (!classroomId) throw new AppError('classroomId is required', 400);
      const quizzes = await quizService.getByClassroom(classroomId);
      sendSuccess(res, quizzes);
    } catch (error) { next(error); }
  },

  async detail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.getDetail(req.params.id as string);
      sendSuccess(res, quiz);
    } catch (error) { next(error); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const quiz = await quizService.create(teacher.teacher_id, req.body);
      sendCreated(res, quiz, 'Quiz created');
    } catch (error) { next(error); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      const quiz = await quizService.update(req.params.id as string, teacher.teacher_id, req.body);
      sendSuccess(res, quiz, 'Quiz updated');
    } catch (error) { next(error); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const teacher = await userRepository.getTeacherProfile(user.id);
      if (!teacher) throw new AppError('Teacher not found', 404);
      await quizService.delete(req.params.id as string, teacher.teacher_id);
      sendSuccess(res, null, 'Quiz deleted');
    } catch (error) { next(error); }
  },

  async start(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const questions = await quizService.getQuestionsForStudent(req.params.id as string);
      sendSuccess(res, questions);
    } catch (error) { next(error); }
  },

  async submitAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findByFirebaseUid(req.firebaseUid!);
      if (!user) throw new AppError('User not found', 404);
      const student = await userRepository.getStudentProfile(user.id);
      if (!student) throw new AppError('Student not found', 404);
      const attempt = await quizService.submitAttempt(req.params.id as string, student.student_id, req.body);
      sendSuccess(res, attempt, 'Quiz submitted');
    } catch (error) { next(error); }
  },

  async results(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const results = await quizService.getResults(req.params.id as string);
      sendSuccess(res, results);
    } catch (error) { next(error); }
  },
};
