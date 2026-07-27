export const APP_NAME = 'ClassCrew';
export const APP_TAGLINE = 'One Classroom. Every Connection.';
export const APP_DESCRIPTION =
  'A modern classroom collaboration platform that makes classroom management simple, beautiful and enjoyable.';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  MY_CLASSROOMS: '/my-classrooms',
  PROFILE: '/profile',
  CLASSROOM: '/classroom/:id',
  CLASSROOM_ASSIGNMENTS: '/classroom/:id/assignments',
  CLASSROOM_ATTENDANCE: '/classroom/:id/attendance',
  CLASSROOM_QUIZ: '/classroom/:id/quiz',
  CLASSROOM_MEMBERS: '/classroom/:id/members',
  CLASSROOM_MARKS: '/classroom/:id/marks',
  CLASSROOM_CALENDAR: '/classroom/:id/calendar',
  CLASSROOM_SETTINGS: '/classroom/:id/settings',
  ANALYTICS: '/analytics',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    ME: '/auth/me',
  },
  CLASSROOMS: {
    LIST: '/classrooms',
    DETAIL: (id: string) => `/classrooms/${id}`,
    CREATE: '/classrooms',
    UPDATE: (id: string) => `/classrooms/${id}`,
    DELETE: (id: string) => `/classrooms/${id}`,
    JOIN: '/classrooms/join',
    MEMBERS: (id: string) => `/classrooms/${id}/members`,
  },
  ASSIGNMENTS: {
    LIST: '/assignments',
    DETAIL: (id: string) => `/assignments/${id}`,
    CREATE: '/assignments',
    UPDATE: (id: string) => `/assignments/${id}`,
    DELETE: (id: string) => `/assignments/${id}`,
    SUBMIT: (id: string) => `/assignments/${id}/submit`,
    SUBMISSIONS: (id: string) => `/assignments/${id}/submissions`,
    REVIEW: (id: string) => `/submissions/${id}/review`,
  },
  QUIZZES: {
    LIST: '/quizzes',
    DETAIL: (id: string) => `/quizzes/${id}`,
    CREATE: '/quizzes',
    UPDATE: (id: string) => `/quizzes/${id}`,
    DELETE: (id: string) => `/quizzes/${id}`,
    START: (id: string) => `/quizzes/${id}/start`,
    SUBMIT_ATTEMPT: (id: string) => `/quizzes/${id}/submit`,
    RESULTS: (id: string) => `/quizzes/${id}/results`,
  },
  ATTENDANCE: {
    LIST: '/attendance',
    CREATE: '/attendance',
    UPDATE: (id: string) => `/attendance/${id}`,
    STUDENT: (id: string) => `/attendance/student/${id}`,
  },
  MARKS: {
    LIST: '/marks',
    UPDATE: (id: string) => `/marks/${id}`,
    STUDENT: (id: string) => `/marks/student/${id}`,
  },
  CALENDAR: {
    LIST: '/calendar',
    CREATE: '/calendar',
    UPDATE: (id: string) => `/calendar/${id}`,
    DELETE: (id: string) => `/calendar/${id}`,
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    UPLOAD_IMAGE: '/profile/image',
  },
  ANALYTICS: {
    TEACHER: '/analytics/teacher',
    STUDENT: '/analytics/student',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/read',
    DELETE: (id: string) => `/notifications/${id}`,
  },
} as const;

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
] as const;

export const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const SECTIONS = ['A', 'B', 'C', 'D'] as const;

export const THEME_KEY = 'classcrew-theme';
export const SIDEBAR_COLLAPSED_KEY = 'classcrew-sidebar-collapsed';

export const PAGINATION_DEFAULT_LIMIT = 20;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

export const QUIZ_MIN_DURATION = 1;
export const QUIZ_MAX_DURATION = 180;

export const CLASSROOM_NAME_MAX_LENGTH = 100;
export const ASSIGNMENT_TITLE_MAX_LENGTH = 150;
