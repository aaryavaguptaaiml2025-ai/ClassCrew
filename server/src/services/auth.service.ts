import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

export const authService = {
  async registerStudent(firebaseUid: string, data: {
    name: string; email: string; rollNumber: string; branch: string; semester: string; section: string;
  }) {
    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
    if (existingUser) throw new AppError('User already registered', 409);

    const user = await userRepository.create({ firebase_uid: firebaseUid, role: 'student', email: data.email });
    const student = await userRepository.createStudent({
      user_id: user.id, name: data.name, roll_number: data.rollNumber,
      branch: data.branch, semester: data.semester, section: data.section,
      phone: null, bio: null, profile_image: null,
    });

    logger.info('Student registered', { userId: user.id, email: data.email });
    return { user, profile: student };
  },

  async registerTeacher(firebaseUid: string, data: {
    name: string; email: string; department: string; accessCode: string;
  }) {
    const validCode = process.env.TEACHER_ACCESS_CODE;
    if (!validCode || data.accessCode !== validCode) {
      throw new AppError('Invalid teacher access code', 403, ['The access code provided is incorrect']);
    }

    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
    if (existingUser) throw new AppError('User already registered', 409);

    const user = await userRepository.create({ firebase_uid: firebaseUid, role: 'teacher', email: data.email });
    const teacher = await userRepository.createTeacher({
      user_id: user.id, name: data.name, department: data.department,
      phone: null, bio: null, profile_image: null,
    });

    logger.info('Teacher registered', { userId: user.id, email: data.email });
    return { user, profile: teacher };
  },

  async getAuthenticatedUser(firebaseUid: string) {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    if (!user) throw new AppError('User not found', 404);

    const profile = user.role === 'teacher'
      ? await userRepository.getTeacherProfile(user.id)
      : await userRepository.getStudentProfile(user.id);

    if (!profile) throw new AppError('Profile not found', 404);
    return { user, profile };
  },
};
