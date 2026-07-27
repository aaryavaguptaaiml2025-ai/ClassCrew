import { attendanceRepository } from '../repositories/attendance.repository.js';
import { classroomRepository } from '../repositories/classroom.repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const attendanceService = {
  async markAttendance(teacherId: string, data: {
    classroomId: string; date: string; records: { studentId: string; status: string }[];
  }) {
    const classroom = await classroomRepository.findById(data.classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);

    const records = data.records.map((r) => ({
      classroom_id: data.classroomId,
      student_id: r.studentId,
      date: data.date,
      status: r.status as 'present' | 'absent',
    }));

    return attendanceRepository.upsert(records);
  },

  async getByClassroomAndDate(classroomId: string, date: string) {
    return attendanceRepository.findByClassroomAndDate(classroomId, date);
  },

  async getByClassroom(classroomId: string) {
    return attendanceRepository.findByClassroomId(classroomId);
  },

  async getStudentAttendance(studentId: string, classroomId?: string) {
    return attendanceRepository.findByStudentId(studentId, classroomId);
  },

  async getAttendancePercentage(studentId: string, classroomId: string) {
    return attendanceRepository.getAttendancePercentage(studentId, classroomId);
  },

  async getClassroomAverageAttendance(classroomId: string) {
    return attendanceRepository.getClassroomAverageAttendance(classroomId);
  },

  async getAttendanceDates(classroomId: string) {
    return attendanceRepository.getAttendanceDates(classroomId);
  },
};
