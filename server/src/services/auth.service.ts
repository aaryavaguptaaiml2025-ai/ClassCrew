import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const authService = {
  async registerStudent(firebaseUid: string, verifiedEmail: string, data: {
    name: string; rollNumber: string; branch: string; semester: string; section: string;
  }) {
    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
    if (existingUser) throw new AppError('User already registered', 409);

    const user = await userRepository.create({
      firebase_uid: firebaseUid,
      role: 'student',
      email: verifiedEmail,
    });

    const student = await userRepository.createStudent({
      user_id: user.id,
      name: data.name,
      roll_number: data.rollNumber,
      branch: data.branch,
      semester: data.semester,
      section: data.section,
      phone: null,
      bio: null,
      profile_image: null,
    });

    logger.info('Student registered', { userId: user.id, email: verifiedEmail });
    return { user, profile: student };
  },

  async registerTeacher(firebaseUid: string, verifiedEmail: string, data: {
    name: string; department: string; accessCode: string;
  }) {
    if (!env.TEACHER_ACCESS_CODE || data.accessCode !== env.TEACHER_ACCESS_CODE) {
      throw new AppError('Invalid teacher access code', 403, ['The access code provided is incorrect']);
    }

    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
    if (existingUser) throw new AppError('User already registered', 409);

    const user = await userRepository.create({
      firebase_uid: firebaseUid,
      role: 'teacher',
      email: verifiedEmail,
    });

    const teacher = await userRepository.createTeacher({
      user_id: user.id,
      name: data.name,
      department: data.department,
      phone: null,
      bio: null,
      profile_image: null,
    });

    logger.info('Teacher registered', { userId: user.id, email: verifiedEmail });
    return { user, profile: teacher };
  },

  async getAuthenticatedUser(firebaseUid: string) {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    if (!user) return null;

    const profile = user.role === 'teacher'
      ? await userRepository.getTeacherProfile(user.id)
      : await userRepository.getStudentProfile(user.id);

    if (!profile) return null;
    return { user, profile };
  },
};
