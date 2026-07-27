import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const profileService = {
  async getProfile(userId: string, role: string) {
    if (role === 'teacher') {
      const profile = await userRepository.getTeacherProfile(userId);
      if (!profile) throw new AppError('Profile not found', 404);
      return profile;
    }
    const profile = await userRepository.getStudentProfile(userId);
    if (!profile) throw new AppError('Profile not found', 404);
    return profile;
  },

  async updateProfile(userId: string, role: string, updates: Record<string, unknown>) {
    if (role === 'teacher') {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      return userRepository.updateTeacher(userId, dbUpdates);
    }
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.rollNumber) dbUpdates.roll_number = updates.rollNumber;
    if (updates.branch) dbUpdates.branch = updates.branch;
    if (updates.semester) dbUpdates.semester = updates.semester;
    if (updates.section) dbUpdates.section = updates.section;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    return userRepository.updateStudent(userId, dbUpdates);
  },
};
