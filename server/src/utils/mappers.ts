import type { DbClassroom, DbClassroomMember } from '../types/database.js';

/**
 * Maps a DbClassroom (snake_case) to the frontend Classroom shape (camelCase).
 * Spreads any extra enrichment properties (e.g. studentCount, teacher).
 */
export function mapClassroom(
  db: DbClassroom & Record<string, unknown>
): Record<string, unknown> {
  return {
    classroomId: db.classroom_id,
    teacherId: db.teacher_id,
    title: db.title,
    subject: db.subject,
    description: db.description,
    semester: db.semester,
    section: db.section,
    joinCode: db.join_code,
    inviteLink: db.invite_link,
    qrCode: db.qr_code,
    createdAt: db.created_at,
    // Preserve any enrichment fields already using camelCase
    ...(db.studentCount !== undefined ? { studentCount: db.studentCount } : {}),
    ...(db.teacher !== undefined ? { teacher: db.teacher } : {}),
    ...(db.joined_at !== undefined ? { joinedAt: db.joined_at } : {}),
  };
}

/**
 * Maps an array of DbClassroom rows to frontend shape.
 */
export function mapClassrooms(
  rows: (DbClassroom & Record<string, unknown>)[]
): Record<string, unknown>[] {
  return rows.map(mapClassroom);
}

/**
 * Maps a DbClassroomMember (snake_case) to frontend shape (camelCase).
 */
export function mapClassroomMember(
  db: DbClassroomMember & Record<string, unknown>
): Record<string, unknown> {
  return {
    id: db.id,
    classroomId: db.classroom_id,
    studentId: db.student_id,
    joinedAt: db.joined_at,
    ...(db.students !== undefined ? { student: db.students } : {}),
  };
}
