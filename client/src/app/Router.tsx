import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

// Public
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));

// Shared / Layouts
const TeacherLayout = lazy(() => import('@/features/teacher/TeacherLayout'));
const StudentLayout = lazy(() => import('@/features/student/StudentLayout'));
const ClassroomDetailPage = lazy(() => import('@/features/classroom/ClassroomDetailPage'));
const NotificationsPage = lazy(() => import('@/features/shared/NotificationsPage'));
const SettingsPage = lazy(() => import('@/features/shared/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/shared/ProfilePage'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('@/features/teacher/pages/Dashboard'));
const TeacherClassrooms = lazy(() => import('@/features/teacher/pages/MyClassrooms'));
const TeacherAssignments = lazy(() => import('@/features/teacher/pages/Assignments'));
const TeacherQuizzes = lazy(() => import('@/features/teacher/pages/Quizzes'));
const TeacherAttendance = lazy(() => import('@/features/teacher/pages/Attendance'));
const TeacherMarks = lazy(() => import('@/features/teacher/pages/Marks'));
const TeacherAnalytics = lazy(() => import('@/features/teacher/pages/Analytics'));

// Student Pages
const StudentClassrooms = lazy(() => import('@/features/student/pages/MyClassrooms'));
const StudentAssignments = lazy(() => import('@/features/student/pages/Assignments'));
const StudentQuizzes = lazy(() => import('@/features/student/pages/Quizzes'));
const StudentCalendarPage = lazy(() => import('@/features/student/pages/CalendarPage'));
const StudentMarksPage = lazy(() => import('@/features/student/pages/Marks'));

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'teacher' | 'student' }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'teacher' ? '/dashboard' : '/my-classrooms'} replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'teacher' ? '/dashboard' : '/my-classrooms'} replace />;
  }
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Teacher Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout><TeacherDashboard /></TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout><TeacherAttendance /></TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout><TeacherAnalytics /></TeacherLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/calendar" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout><StudentCalendarPage /></StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout><ProfilePage /></StudentLayout>
            </ProtectedRoute>
          } />

          {/* Role-Based Shared Routes */}
          <Route path="/my-classrooms" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<TeacherClassrooms />} studentComp={<StudentClassrooms />} />
            </ProtectedRoute>
          } />
          <Route path="/classrooms/:classroomId" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<ClassroomDetailPage />} studentComp={<ClassroomDetailPage />} />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<TeacherAssignments />} studentComp={<StudentAssignments />} />
            </ProtectedRoute>
          } />
          <Route path="/quizzes" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<TeacherQuizzes />} studentComp={<StudentQuizzes />} />
            </ProtectedRoute>
          } />
          <Route path="/marks" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<TeacherMarks />} studentComp={<StudentMarksPage />} />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<NotificationsPage />} studentComp={<NotificationsPage />} />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <RoleBasedWrapper teacherComp={<SettingsPage />} studentComp={<SettingsPage />} />
            </ProtectedRoute>
          } />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function RoleBasedWrapper({ teacherComp, studentComp }: { teacherComp: React.ReactNode; studentComp: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <TeacherLayout>{teacherComp}</TeacherLayout>;
  }

  return <StudentLayout>{studentComp}</StudentLayout>;
}
