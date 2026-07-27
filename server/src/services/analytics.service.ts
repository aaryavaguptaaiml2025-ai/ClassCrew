import { supabase } from '../config/supabase.js';
import { classroomRepository } from '../repositories/classroom.repository.js';
import { attendanceRepository } from '../repositories/attendance.repository.js';
import { assignmentRepository } from '../repositories/assignment.repository.js';

export const analyticsService = {
  async getTeacherAnalytics(teacherId: string) {
    const classrooms = await classroomRepository.findByTeacherId(teacherId);
    let totalStudents = 0;
    let totalClassrooms = classrooms.length;
    let pendingAssignments = 0;
    let activeQuizzes = 0;
    let totalAttendancePercent = 0;
    let classroomsWithAttendance = 0;

    for (const classroom of classrooms) {
      const memberCount = await classroomRepository.getMemberCount(classroom.classroom_id);
      totalStudents += memberCount;

      const { count: pendingCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.classroom_id)
        .eq('status', 'published');
      pendingAssignments += pendingCount || 0;

      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.classroom_id)
        .eq('status', 'active');
      activeQuizzes += quizCount || 0;

      const avg = await attendanceRepository.getClassroomAverageAttendance(classroom.classroom_id);
      if (avg > 0) {
        totalAttendancePercent += avg;
        classroomsWithAttendance++;
      }
    }

    const averageAttendance = classroomsWithAttendance > 0
      ? Math.round(totalAttendancePercent / classroomsWithAttendance)
      : 0;

    return {
      stats: {
        totalClassrooms,
        totalStudents,
        pendingAssignments,
        activeQuizzes,
        averageAttendance,
      },
      attendanceTrend: [],
      marksDistribution: [],
      quizPerformance: [],
      assignmentCompletion: [],
      topPerformers: [],
    };
  },

  async getStudentAnalytics(studentId: string) {
    const classrooms = await classroomRepository.findByStudentId(studentId);
    let totalPresent = 0;
    let totalAttendance = 0;
    let assignmentsSubmitted = 0;
    let assignmentsPending = 0;

    for (const classroom of classrooms) {
      const attendance = await attendanceRepository.findByStudentId(studentId, classroom.classroom_id);
      totalAttendance += attendance.length;
      totalPresent += attendance.filter((a) => a.status === 'present').length;
    }

    const pendingCount = await assignmentRepository.getPendingCountForStudent(studentId);
    assignmentsPending = pendingCount;

    const { count: submittedCount } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .in('status', ['submitted', 'reviewed']);
    assignmentsSubmitted = submittedCount || 0;

    const attendancePercentage = totalAttendance > 0
      ? Math.round((totalPresent / totalAttendance) * 100)
      : 0;

    return {
      attendancePercentage,
      assignmentsSubmitted,
      assignmentsPending,
      quizAverage: 0,
      averageMarks: 0,
      attendanceTrend: [],
      marksTrend: [],
      quizPerformance: [],
    };
  },
};
