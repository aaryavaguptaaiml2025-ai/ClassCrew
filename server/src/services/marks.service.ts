import { marksRepository } from '../repositories/marks.repository.js';

export const marksService = {
  async getByClassroom(classroomId: string) {
    return marksRepository.findByClassroomId(classroomId);
  },

  async getByStudent(studentId: string) {
    return marksRepository.findByStudentId(studentId);
  },

  async update(marksId: string, _teacherId: string, updates: {
    internal?: number | null; quiz?: number | null;
    midSemester?: number | null; endSemester?: number | null;
  }) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.internal !== undefined) dbUpdates.internal = updates.internal;
    if (updates.quiz !== undefined) dbUpdates.quiz = updates.quiz;
    if (updates.midSemester !== undefined) dbUpdates.mid_semester = updates.midSemester;
    if (updates.endSemester !== undefined) dbUpdates.end_semester = updates.endSemester;

    return marksRepository.update(marksId, dbUpdates);
  },
};
