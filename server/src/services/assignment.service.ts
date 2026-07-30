import { assignmentRepository } from '../repositories/assignment.repository.js';
import { classroomRepository } from '../repositories/classroom.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

export const assignmentService = {
  async create(teacherId: string, data: {
    classroomId: string; title: string; description?: string; dueDate: string; maxMarks: number; status: string;
  }) {
    const classroom = await classroomRepository.findById(data.classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('You can only create assignments in your classrooms', 403);

    const assignment = await assignmentRepository.create({
      classroom_id: data.classroomId,
      title: data.title,
      description: data.description || null,
      due_date: data.dueDate,
      max_marks: data.maxMarks,
      status: data.status as 'draft' | 'published' | 'closed',
    });

    if (data.status === 'published') {
      const members = await classroomRepository.getMembers(data.classroomId) as Record<string, unknown>[];
      const notifications = members.map((m) => {
        const student = m.students as Record<string, unknown>;
        return {
          user_id: student.user_id as string,
          title: 'New Assignment',
          message: `"${data.title}" has been posted in ${classroom.title}`,
          type: 'assignment_published' as const,
          reference_id: assignment.assignment_id,
          reference_type: 'assignment',
        };
      }).filter((n) => n.user_id);

      if (notifications.length > 0) {
        await notificationRepository.createBulk(notifications);
      }

      const memberStudents = await classroomRepository.getMembers(data.classroomId);
      for (const member of memberStudents) {
        const student = (member as Record<string, unknown>).students as Record<string, unknown>;
        if (student?.student_id) {
          await assignmentRepository.createSubmission({
            assignment_id: assignment.assignment_id,
            student_id: student.student_id as string,
            status: 'pending',
            submitted_at: null,
            teacher_marks: null,
            teacher_feedback: null,
          });
        }
      }
    }

    logger.info('Assignment created', { assignmentId: assignment.assignment_id });
    return assignment;
  },

  async getByClassroom(classroomId: string) {
    return assignmentRepository.findByClassroomId(classroomId);
  },

  async getByUser(userId: string, role: string) {
    if (role === 'teacher') {
      const teacher = await userRepository.getTeacherProfile(userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classrooms = await classroomRepository.findByTeacherId(teacher.teacher_id);
      const allAssignments = [];
      for (const c of classrooms) {
        const assignments = await assignmentRepository.findByClassroomId(c.classroom_id);
        allAssignments.push(...assignments.map((a) => ({ ...a, classroomTitle: c.title })));
      }
      return allAssignments;
    } else {
      const student = await userRepository.getStudentProfile(userId);
      if (!student) throw new AppError('Student profile not found', 404);
      const classrooms = await classroomRepository.findByStudentId(student.student_id);
      const allAssignments = [];
      for (const c of classrooms) {
        const assignments = await assignmentRepository.findByClassroomId(c.classroom_id);
        allAssignments.push(...assignments.map((a) => ({ ...a, classroomTitle: c.title })));
      }
      return allAssignments;
    }
  },

  async getDetail(assignmentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    const counts = await assignmentRepository.getSubmissionCount(assignmentId);
    return { ...assignment, ...counts };
  },

  async update(assignmentId: string, teacherId: string, updates: Record<string, unknown>) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    const classroom = await classroomRepository.findById(assignment.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.maxMarks !== undefined) dbUpdates.max_marks = updates.maxMarks;
    if (updates.status) dbUpdates.status = updates.status;

    return assignmentRepository.update(assignmentId, dbUpdates);
  },

  async delete(assignmentId: string, teacherId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    const classroom = await classroomRepository.findById(assignment.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);
    await assignmentRepository.delete(assignmentId);
  },

  async submit(assignmentId: string, studentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    let submission = await assignmentRepository.getSubmission(assignmentId, studentId);
    if (submission && submission.status !== 'pending') {
      throw new AppError('Assignment already submitted', 409);
    }

    if (!submission) {
      submission = await assignmentRepository.createSubmission({
        assignment_id: assignmentId,
        student_id: studentId,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        teacher_marks: null,
        teacher_feedback: null,
      });
    } else {
      submission = await assignmentRepository.updateSubmission(submission.submission_id, {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });
    }

    return submission;
  },

  async getSubmissions(assignmentId: string) {
    return assignmentRepository.getSubmissions(assignmentId);
  },

  async reviewSubmission(submissionId: string, data: { status: string; teacherMarks?: number; teacherFeedback?: string }) {
    const updates: Record<string, unknown> = { status: data.status };
    if (data.teacherMarks !== undefined) updates.teacher_marks = data.teacherMarks;
    if (data.teacherFeedback !== undefined) updates.teacher_feedback = data.teacherFeedback;
    return assignmentRepository.updateSubmission(submissionId, updates);
  },
};
