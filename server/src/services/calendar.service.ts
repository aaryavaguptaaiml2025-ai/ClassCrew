import { calendarRepository } from '../repositories/calendar.repository.js';
import { classroomRepository } from '../repositories/classroom.repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const calendarService = {
  async create(teacherId: string, data: {
    classroomId: string; title: string; description?: string; date: string; type: string;
  }) {
    const classroom = await classroomRepository.findById(data.classroomId);
    if (!classroom) throw new AppError('Classroom not found', 404);
    if (classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);

    return calendarRepository.create({
      classroom_id: data.classroomId,
      title: data.title,
      description: data.description || null,
      date: data.date,
      type: data.type as 'assignment' | 'quiz' | 'event',
    });
  },

  async getByClassroom(classroomId: string) {
    return calendarRepository.findByClassroomId(classroomId);
  },

  async getStudentEvents(studentId: string) {
    return calendarRepository.findByStudentClassrooms(studentId);
  },

  async update(eventId: string, teacherId: string, updates: Record<string, unknown>) {
    const event = await calendarRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);
    const classroom = await classroomRepository.findById(event.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);
    return calendarRepository.update(eventId, updates);
  },

  async delete(eventId: string, teacherId: string) {
    const event = await calendarRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);
    const classroom = await classroomRepository.findById(event.classroom_id);
    if (!classroom || classroom.teacher_id !== teacherId) throw new AppError('Permission denied', 403);
    await calendarRepository.delete(eventId);
  },
};
