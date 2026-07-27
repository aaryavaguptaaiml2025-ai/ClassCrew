export type UserRole = 'teacher' | 'student';
export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed';
export type QuizStatus = 'upcoming' | 'active' | 'completed';
export type QuestionType = 'mcq' | 'true_false';
export type AttendanceStatus = 'present' | 'absent';
export type CalendarEventType = 'assignment' | 'quiz' | 'event';
export type NotificationType =
  | 'assignment_published'
  | 'assignment_reviewed'
  | 'quiz_published'
  | 'quiz_completed'
  | 'marks_updated'
  | 'attendance_updated'
  | 'calendar_event'
  | 'student_joined'
  | 'assignment_submitted';

export interface DbUser {
  id: string;
  firebase_uid: string;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeacher {
  teacher_id: string;
  user_id: string;
  name: string;
  department: string | null;
  phone: string | null;
  bio: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbStudent {
  student_id: string;
  user_id: string;
  name: string;
  roll_number: string;
  branch: string;
  semester: string;
  section: string;
  phone: string | null;
  bio: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbClassroom {
  classroom_id: string;
  teacher_id: string;
  title: string;
  subject: string;
  description: string | null;
  semester: string | null;
  section: string | null;
  join_code: string;
  invite_link: string;
  qr_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbClassroomMember {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
}

export interface DbAssignment {
  assignment_id: string;
  classroom_id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_marks: number;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
}

export interface DbAssignmentSubmission {
  submission_id: string;
  assignment_id: string;
  student_id: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  teacher_marks: number | null;
  teacher_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbQuiz {
  quiz_id: string;
  classroom_id: string;
  title: string;
  description: string | null;
  duration: number;
  total_marks: number;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
}

export interface DbQuizQuestion {
  question_id: string;
  quiz_id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correct_answer: string;
  marks: number;
  sort_order: number;
  created_at: string;
}

export interface DbQuizAttempt {
  attempt_id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  answers: Record<string, string>;
  time_taken: number;
  submitted_at: string;
}

export interface DbAttendance {
  attendance_id: string;
  classroom_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface DbMarks {
  marks_id: string;
  classroom_id: string;
  student_id: string;
  internal: number | null;
  quiz: number | null;
  mid_semester: number | null;
  end_semester: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbCalendarEvent {
  event_id: string;
  classroom_id: string;
  title: string;
  description: string | null;
  date: string;
  type: CalendarEventType;
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export interface DbAuditLog {
  log_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
