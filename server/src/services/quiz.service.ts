import { quizRepository } from '../repositories/quiz.repository.js';
import { classroomRepository } from '../repositories/classroom.repository.js';
import { marksRepository } from '../repositories/marks.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

export const quizService = {
  async create(teacherId: string, data: {
    classroomId: string; title: string; description?: string;
    duration: number; totalMarks: number; status: string;
    questions: { question: string; type: string; options: string[]; correctAnswer: string; marks: number; sortOrder: number }[];
  }) {
    const classroom = await classroomRepository.findById(data.classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);

    const quiz = await quizRepository.create({
      classroom_id: data.classroomId,
      title: data.title,
      description: data.description || null,
      duration: data.duration,
      total_marks: data.totalMarks,
      status: data.status as 'upcoming' | 'active' | 'completed',
    });

    for (const q of data.questions) {
      await quizRepository.createQuestion({
        quiz_id: quiz.quiz_id,
        question: q.question,
        type: q.type as 'mcq' | 'true_false',
        options: q.options,
        correct_answer: q.correctAnswer,
        marks: q.marks,
        sort_order: q.sortOrder,
      });
    }

    logger.info('Quiz created', { quizId: quiz.quiz_id, questionCount: data.questions.length });
    return quiz;
  },

  async getByClassroom(classroomId: string) {
    const quizzes = await quizRepository.findByClassroomId(classroomId);
    const enriched = await Promise.all(quizzes.map(async (q) => {
      const questionCount = await quizRepository.getQuestionCount(q.quiz_id);
      const attemptCount = await quizRepository.getAttemptCount(q.quiz_id);
      return { ...q, questionCount, attemptCount };
    }));
    return enriched;
  },

  async getByUser(userId: string, role: string) {
    if (role === 'teacher') {
      const teacher = await userRepository.getTeacherProfile(userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classrooms = await classroomRepository.findByTeacherId(teacher.teacher_id);
      const allQuizzes = [];
      for (const c of classrooms) {
        const quizzes = await quizRepository.findByClassroomId(c.classroom_id);
        const enriched = await Promise.all(quizzes.map(async (q) => {
          const questionCount = await quizRepository.getQuestionCount(q.quiz_id);
          const attemptCount = await quizRepository.getAttemptCount(q.quiz_id);
          return { ...q, questionCount, attemptCount, classroomTitle: c.title };
        }));
        allQuizzes.push(...enriched);
      }
      return allQuizzes;
    } else {
      const student = await userRepository.getStudentProfile(userId);
      if (!student) throw new AppError('Student profile not found', 404);
      const classrooms = await classroomRepository.findByStudentId(student.student_id);
      const allQuizzes = [];
      for (const c of classrooms) {
        const quizzes = await quizRepository.findByClassroomId(c.classroom_id);
        const enriched = await Promise.all(quizzes.map(async (q) => {
          const questionCount = await quizRepository.getQuestionCount(q.quiz_id);
          const attemptCount = await quizRepository.getAttemptCount(q.quiz_id);
          return { ...q, questionCount, attemptCount, classroomTitle: c.title };
        }));
        allQuizzes.push(...enriched);
      }
      return allQuizzes;
    }
  },

  async getDetail(quizId: string) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    const questions = await quizRepository.getQuestions(quizId);
    const attemptCount = await quizRepository.getAttemptCount(quizId);
    return { ...quiz, questions, attemptCount };
  },

  async getQuestionsForStudent(quizId: string) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    if (quiz.status !== 'active') throw new AppError('Quiz is not active', 400);
    const questions = await quizRepository.getQuestions(quizId);
    return questions.map((q) => ({
      question_id: q.question_id,
      question: q.question,
      type: q.type,
      options: q.options,
      marks: q.marks,
      sort_order: q.sort_order,
    }));
  },

  async submitAttempt(quizId: string, studentId: string, data: { answers: Record<string, string>; timeTaken: number }) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const existingAttempt = await quizRepository.getAttempt(quizId, studentId);
    if (existingAttempt) throw new AppError('Quiz already submitted', 409);

    const questions = await quizRepository.getQuestions(quizId);
    let score = 0;
    for (const question of questions) {
      if (data.answers[question.question_id] === question.correct_answer) {
        score += question.marks;
      }
    }

    const attempt = await quizRepository.createAttempt({
      quiz_id: quizId,
      student_id: studentId,
      score,
      total_marks: quiz.total_marks,
      answers: data.answers,
      time_taken: data.timeTaken,
    });

    const classroom = await classroomRepository.findById(quiz.classroom_id);
    if (classroom) {
      await marksRepository.updateQuizMarks(classroom.classroom_id, studentId, score);
    }

    logger.info('Quiz attempt submitted', { quizId, studentId, score, totalMarks: quiz.total_marks });
    return attempt;
  },

  async getResults(quizId: string) {
    return quizRepository.getAttempts(quizId);
  },

  async update(quizId: string, teacherId: string, updates: Partial<{ title: string; description: string; duration: number; status: string }>) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    const classroom = await classroomRepository.findById(quiz.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.status) dbUpdates.status = updates.status;

    return quizRepository.update(quizId, dbUpdates);
  },

  async delete(quizId: string, teacherId: string) {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    const classroom = await classroomRepository.findById(quiz.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);
    await quizRepository.delete(quizId);
  },
};
