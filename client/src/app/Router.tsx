import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));

const TeacherLayout = lazy(() => import('@/features/teacher/TeacherLayout'));
const TeacherDashboard = lazy(() => import('@/features/teacher/pages/Dashboard'));
const TeacherClassrooms = lazy(() => import('@/features/teacher/pages/MyClassrooms'));

const StudentLayout = lazy(() => import('@/features/student/StudentLayout'));
const StudentClassrooms = lazy(() => import('@/features/student/pages/MyClassrooms'));

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
          <Route path="/my-classrooms" element={
            <ProtectedRoute>
              {/* Both roles can access - layout determined by role */}
              <RoleBasedClassrooms />
            </ProtectedRoute>
          } />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function RoleBasedClassrooms() {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <TeacherLayout><TeacherClassrooms /></TeacherLayout>;
  }

  return <StudentLayout><StudentClassrooms /></StudentLayout>;
}
