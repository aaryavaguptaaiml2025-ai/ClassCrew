-- =============================================
-- CLASSCREW DEMO SEED DATA
-- Version 1.0
-- Insert sample data for demo & testing
-- =============================================

-- 1. Demo Users
INSERT INTO users (id, firebase_uid, role, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo_teacher_uid_123', 'teacher', 'teacher@classcrew.com'),
  ('22222222-2222-2222-2222-222222222222', 'demo_student_uid_456', 'student', 'student1@classcrew.com'),
  ('33333333-3333-3333-3333-333333333333', 'demo_student_uid_789', 'student', 'student2@classcrew.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Demo Teacher Profile
INSERT INTO teachers (teacher_id, user_id, name, department, phone, bio) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Dr. Sarah Connor', 'Computer Science', '+1-555-0192', 'Professor of Computer Science & Software Engineering.')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Demo Student Profiles
INSERT INTO students (student_id, user_id, name, roll_number, branch, semester, section) VALUES
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Alex Vance', 'CS2026-001', 'Computer Science', '6', 'A'),
  ('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Jordan Lee', 'CS2026-002', 'Computer Science', '6', 'A')
ON CONFLICT (roll_number) DO NOTHING;

-- 4. Demo Classrooms
INSERT INTO classrooms (classroom_id, teacher_id, title, subject, description, semester, section, join_code, invite_link) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Data Structures & Algorithms', 'Computer Science', 'Core course on trees, graphs, sorting, and dynamic programming.', '6', 'A', 'A3T26X', 'https://classcrew.app/join/A3T26X'),
  ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Operating Systems & Concurrency', 'Computer Science', 'Deep dive into process scheduling, virtual memory, and threads.', '6', 'A', 'OS2026', 'https://classcrew.app/join/OS2026')
ON CONFLICT (join_code) DO NOTHING;

-- 5. Classroom Members
INSERT INTO classroom_members (classroom_id, student_id) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'),
  ('c1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222')
ON CONFLICT (classroom_id, student_id) DO NOTHING;

-- 6. Sample Assignments
INSERT INTO assignments (assignment_id, classroom_id, title, description, due_date, max_marks, status) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Lab Report 1: Red-Black Trees', 'Implement insert & rebalance methods in C++/Java.', NOW() + INTERVAL '7 days', 100, 'published'),
  ('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Problem Set 2: Graph Shortest Path', 'Dijkstra and Bellman-Ford algorithm implementation.', NOW() + INTERVAL '14 days', 50, 'published')
ON CONFLICT DO NOTHING;

-- 7. Sample Quizzes
INSERT INTO quizzes (quiz_id, classroom_id, title, description, duration, total_marks, status) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Mid-Term Quiz: Trees & Graphs', 'Multiple choice quiz on binary trees and graph traversals.', 15, 10, 'active')
ON CONFLICT DO NOTHING;

-- 8. Quiz Questions
INSERT INTO quiz_questions (quiz_id, question, type, options, correct_answer, marks, sort_order) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'What is the average time complexity of searching in a Balanced Binary Search Tree?', 'mcq', '["O(1)", "O(log N)", "O(N)", "O(N log N)"]'::jsonb, 'O(log N)', 5, 1),
  ('e1111111-1111-1111-1111-111111111111', 'Dijkstra algorithm works correctly on graphs with negative edge weights.', 'true_false', '["True", "False"]'::jsonb, 'False', 5, 2)
ON CONFLICT DO NOTHING;

-- 9. Sample Attendance
INSERT INTO attendance (classroom_id, student_id, date, status) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', CURRENT_DATE, 'present'),
  ('c1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', CURRENT_DATE, 'present')
ON CONFLICT (classroom_id, student_id, date) DO NOTHING;

-- 10. Sample Marks
INSERT INTO marks (classroom_id, student_id, internal, quiz, mid_semester, end_semester) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 18, 19, 27, 28),
  ('c1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 16, 17, 25, 26)
ON CONFLICT (classroom_id, student_id) DO NOTHING;
