import { z } from 'zod';

export const registerStudentSchema = z.object({
  role: z.literal('student'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  rollNumber: z.string().min(1, 'Roll number is required').max(50),
  branch: z.string().min(1, 'Branch is required'),
  semester: z.string().min(1, 'Semester is required'),
  section: z.string().min(1, 'Section is required'),
});

export const registerTeacherSchema = z.object({
  role: z.literal('teacher'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  accessCode: z.string().min(1, 'Access code is required'),
});

export const registerSchema = z.discriminatedUnion('role', [
  registerStudentSchema,
  registerTeacherSchema,
]);

export const createClassroomSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(100),
  description: z.string().max(500).optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
});

export const updateClassroomSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
});

export const joinClassroomSchema = z.object({
  joinCode: z.string().min(1, 'Join code is required'),
});

export const createAssignmentSchema = z.object({
  classroomId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.number().min(0, 'Marks cannot be negative').default(100),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  maxMarks: z.number().min(0).optional(),
  status: z.enum(['draft', 'published', 'closed']).optional(),
});

export const reviewSubmissionSchema = z.object({
  status: z.enum(['submitted', 'reviewed']),
  teacherMarks: z.number().min(0).optional(),
  teacherFeedback: z.string().max(1000).optional(),
});

export const createQuizSchema = z.object({
  classroomId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  duration: z.number().min(1, 'Minimum 1 minute').max(180, 'Maximum 180 minutes'),
  totalMarks: z.number().min(0),
  status: z.enum(['upcoming', 'active', 'completed']).default('upcoming'),
  questions: z.array(z.object({
    question: z.string().min(1),
    type: z.enum(['mcq', 'true_false']),
    options: z.array(z.string()),
    correctAnswer: z.string().min(1),
    marks: z.number().min(0).default(1),
    sortOrder: z.number().default(0),
  })).min(1, 'At least one question is required'),
});

export const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.string()),
  timeTaken: z.number().min(0),
});

export const markAttendanceSchema = z.object({
  classroomId: z.string().uuid(),
  date: z.string().min(1, 'Date is required'),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(['present', 'absent']),
  })).min(1, 'At least one record is required'),
});

export const updateMarksSchema = z.object({
  internal: z.number().min(0).nullable().optional(),
  quiz: z.number().min(0).nullable().optional(),
  midSemester: z.number().min(0).nullable().optional(),
  endSemester: z.number().min(0).nullable().optional(),
});

export const createCalendarEventSchema = z.object({
  classroomId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['assignment', 'quiz', 'event']).default('event'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  branch: z.string().optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
});
