import { classroomRepository } from '../repositories/classroom.repository.js';
import { marksRepository } from '../repositories/marks.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const classroomService = {
  async create(teacherId: string, data: {
    title: string; subject: string; description?: string; semester?: string; section?: string;
  }) {
    const joinCode = generateJoinCode();
    const inviteLink = `${process.env.CLIENT_URL}/join/${joinCode}`;

    const classroom = await classroomRepository.create({
      teacher_id: teacherId,
      title: data.title,
      subject: data.subject,
      description: data.description || null,
      semester: data.semester || null,
      section: data.section || null,
      join_code: joinCode,
      invite_link: inviteLink,
      qr_code: null,
    });

    logger.info('Classroom created', { classroomId: classroom.classroom_id, title: data.title });
    return classroom;
  },

  async getTeacherClassrooms(teacherId: string) {
    const classrooms = await classroomRepository.findByTeacherId(teacherId);
    const enriched = await Promise.all(classrooms.map(async (c) => {
      const studentCount = await classroomRepository.getMemberCount(c.classroom_id);
      return { ...c, studentCount };
    }));
    return enriched;
  },

  async getStudentClassrooms(studentId: string) {
    return classroomRepository.findByStudentId(studentId);
  },

  async getClassroomDetail(classroomId: string) {
    const classroom = await classroomRepository.findById(classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    const studentCount = await classroomRepository.getMemberCount(classroomId);
    const teacher = await userRepository.getTeacherProfile(classroom.teacher_id);
    return { ...classroom, studentCount, teacher };
  },

  async update(classroomId: string, teacherId: string, updates: Partial<{ title: string; subject: string; description: string; semester: string; section: string }>) {
    const classroom = await classroomRepository.findById(classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('You can only edit your own classrooms', 403);
    return classroomRepository.update(classroomId, updates);
  },

  async delete(classroomId: string, teacherId: string) {
    const classroom = await classroomRepository.findById(classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('You can only delete your own classrooms', 403);
    await classroomRepository.delete(classroomId);
    logger.info('Classroom deleted', { classroomId });
  },

  async join(studentId: string, joinCode: string, userId: string) {
    const classroom = await classroomRepository.findByJoinCode(joinCode.toUpperCase());
    if (!classroom) throw new AppError('Invalid join code. Please check and try again.', 404);

    const isMember = await classroomRepository.isMember(classroom.classroom_id, studentId);
    if (isMember) throw new AppError('You have already joined this classroom', 409);

    await classroomRepository.addMember(classroom.classroom_id, studentId);
    await marksRepository.ensureMarksRowExists(classroom.classroom_id, studentId);

    const teacher = await userRepository.getTeacherProfile(classroom.teacher_id);
    if (teacher) {
      const student = await userRepository.getStudentProfile(userId);
      const teacherUser = await userRepository.findById(teacher.user_id);
      if (teacherUser && student) {
        await notificationRepository.create({
          user_id: teacherUser.id,
          title: 'New Student Joined',
          message: `${student.name} joined ${classroom.title}`,
          type: 'student_joined',
          reference_id: classroom.classroom_id,
          reference_type: 'classroom',
        });
      }
    }

    logger.info('Student joined classroom', { studentId, classroomId: classroom.classroom_id });
    return classroom;
  },

  async getMembers(classroomId: string) {
    return classroomRepository.getMembers(classroomId);
  },
};
