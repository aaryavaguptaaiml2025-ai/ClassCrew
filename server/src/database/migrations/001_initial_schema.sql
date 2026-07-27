-- =============================================
-- CLASSCREW DATABASE SCHEMA
-- Version 1.0
-- PostgreSQL (Supabase)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'reviewed');
CREATE TYPE quiz_status AS ENUM ('upcoming', 'active', 'completed');
CREATE TYPE question_type AS ENUM ('mcq', 'true_false');
CREATE TYPE attendance_status AS ENUM ('present', 'absent');
CREATE TYPE calendar_event_type AS ENUM ('assignment', 'quiz', 'event');
CREATE TYPE notification_type AS ENUM (
  'assignment_published',
  'assignment_reviewed',
  'quiz_published',
  'quiz_completed',
  'marks_updated',
  'attendance_updated',
  'calendar_event',
  'student_joined',
  'assignment_submitted'
);

-- =============================================
-- USERS TABLE
-- Base authentication record linked to Firebase
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  role user_role NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- TEACHERS TABLE
-- =============================================

CREATE TABLE teachers (
  teacher_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);

-- =============================================
-- STUDENTS TABLE
-- =============================================

CREATE TABLE students (
  student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  branch VARCHAR(100) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  section VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_branch_semester ON students(branch, semester, section);

-- =============================================
-- CLASSROOMS TABLE
-- =============================================

CREATE TABLE classrooms (
  classroom_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  semester VARCHAR(10),
  section VARCHAR(10),
  join_code VARCHAR(10) NOT NULL UNIQUE,
  invite_link TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_join_code ON classrooms(join_code);

-- =============================================
-- CLASSROOM MEMBERS (Many-to-Many junction)
-- One classroom → many students
-- One student → many classrooms
-- =============================================

CREATE TABLE classroom_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

CREATE INDEX idx_cm_classroom_id ON classroom_members(classroom_id);
CREATE INDEX idx_cm_student_id ON classroom_members(student_id);

-- =============================================
-- ASSIGNMENTS TABLE
-- =============================================

CREATE TABLE assignments (
  assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  status assignment_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- =============================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- =============================================

CREATE TABLE assignment_submissions (
  submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  teacher_marks NUMERIC(6,2),
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);

-- =============================================
-- QUIZZES TABLE
-- =============================================

CREATE TABLE quizzes (
  quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL CHECK (duration >= 1 AND duration <= 180),
  total_marks NUMERIC(6,2) NOT NULL,
  status quiz_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_classroom_id ON quizzes(classroom_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================

CREATE TABLE quiz_questions (
  question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type question_type NOT NULL DEFAULT 'mcq',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  marks NUMERIC(6,2) NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================

CREATE TABLE quiz_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  score NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_marks NUMERIC(6,2) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_taken INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================

CREATE TABLE attendance (
  attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(classroom_id, student_id, date)
);

CREATE INDEX idx_attendance_classroom_id ON attendance(classroom_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_classroom_date ON attendance(classroom_id, date);

-- =============================================
-- MARKS TABLE
-- One row per student per classroom
-- Quiz marks auto-updated; teacher edits internal, mid, end
-- =============================================

CREATE TABLE marks (
  marks_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  internal NUMERIC(6,2),
  quiz NUMERIC(6,2),
  mid_semester NUMERIC(6,2),
  end_semester NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

CREATE INDEX idx_marks_classroom_id ON marks(classroom_id);
CREATE INDEX idx_marks_student_id ON marks(student_id);

-- =============================================
-- CALENDAR EVENTS TABLE
-- =============================================

CREATE TABLE calendar_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  type calendar_event_type NOT NULL DEFAULT 'event',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_classroom_id ON calendar_events(classroom_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- AUDIT LOG TABLE (for tracking important events)
-- =============================================

CREATE TABLE audit_log (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically sets updated_at on row update
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
