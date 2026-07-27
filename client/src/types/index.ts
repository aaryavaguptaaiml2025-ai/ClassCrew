export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  firebaseUid: string;
  role: UserRole;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  teacherId: string;
  userId: string;
  name: string;
  department: string;
  phone: string;
  bio: string;
  profileImage: string | null;
}

export interface Student {
  studentId: string;
  userId: string;
  name: string;
  rollNumber: string;
  branch: string;
  semester: string;
  section: string;
  phone: string;
  bio: string;
  profileImage: string | null;
}

export interface Classroom {
  classroomId: string;
  teacherId: string;
  title: string;
  subject: string;
  description: string;
  semester: string;
  section: string;
  joinCode: string;
  inviteLink: string;
  qrCode: string;
  createdAt: string;
  teacherName?: string;
  teacherImage?: string | null;
  studentCount?: number;
  pendingAssignments?: number;
  activeQuizzes?: number;
  averageAttendance?: number;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: string;
  joinedAt: string;
  student?: Student;
}

export interface Assignment {
  assignmentId: string;
  classroomId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: AssignmentStatus;
  createdAt: string;
  classroomTitle?: string;
  submissionCount?: number;
  totalStudents?: number;
}

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface AssignmentSubmission {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  teacherMarks: number | null;
  teacherFeedback: string | null;
  studentName?: string;
  studentRollNumber?: string;
  studentImage?: string | null;
}

export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed';

export interface Quiz {
  quizId: string;
  classroomId: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  status: QuizStatus;
  createdAt: string;
  classroomTitle?: string;
  questionCount?: number;
  attemptCount?: number;
  totalStudents?: number;
}

export type QuizStatus = 'upcoming' | 'active' | 'completed';

export interface QuizQuestion {
  questionId: string;
  quizId: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  marks: number;
  order: number;
}

export type QuestionType = 'mcq' | 'true_false';

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  answers: Record<string, string>;
  submittedAt: string;
  timeTaken: number;
  studentName?: string;
  studentRollNumber?: string;
}

export interface Attendance {
  attendanceId: string;
  classroomId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  studentName?: string;
  studentRollNumber?: string;
  studentImage?: string | null;
}

export type AttendanceStatus = 'present' | 'absent';

export interface Marks {
  marksId: string;
  classroomId: string;
  studentId: string;
  internal: number | null;
  quiz: number | null;
  midSemester: number | null;
  endSemester: number | null;
  studentName?: string;
  studentRollNumber?: string;
}

export interface CalendarEvent {
  eventId: string;
  classroomId: string;
  title: string;
  description: string;
  date: string;
  type: CalendarEventType;
  createdAt: string;
}

export type CalendarEventType = 'assignment' | 'quiz' | 'event';

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

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

export interface AuthUser {
  user: User;
  profile: Teacher | Student;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalClassrooms: number;
  totalStudents: number;
  pendingAssignments: number;
  activeQuizzes: number;
  averageAttendance: number;
}

export interface TeacherAnalytics {
  attendanceTrend: { date: string; percentage: number }[];
  marksDistribution: { range: string; count: number }[];
  quizPerformance: { quiz: string; average: number }[];
  assignmentCompletion: { assignment: string; completed: number; total: number }[];
  topPerformers: { name: string; rollNumber: string; score: number; image: string | null }[];
}

export interface StudentAnalytics {
  attendancePercentage: number;
  assignmentsSubmitted: number;
  assignmentsPending: number;
  quizAverage: number;
  averageMarks: number;
  attendanceTrend: { month: string; percentage: number }[];
  marksTrend: { subject: string; marks: number; total: number }[];
  quizPerformance: { quiz: string; score: number; total: number }[];
}
