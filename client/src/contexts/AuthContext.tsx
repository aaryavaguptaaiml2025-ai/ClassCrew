import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/services/api';
import type { AuthUser, User, Teacher, Student } from '@/types';

type RegisterPayload =
  | { role: 'student'; name: string; email: string; rollNumber: string; branch: string; semester: string; section: string }
  | { role: 'teacher'; name: string; email: string; department: string; accessCode: string };

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  profile: Teacher | Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsRegistration: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ needsRegistration: boolean }>;
  register: (email: string, password: string, profileData: RegisterPayload) => Promise<void>;
  registerWithGoogle: (profileData: Omit<RegisterPayload, 'email'> & { email?: string }) => Promise<void>;
  registerStudent: (data: StudentRegistrationData) => Promise<void>;
  registerTeacher: (data: TeacherRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface StudentRegistrationData {
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  branch: string;
  semester: string;
  section: string;
}

export interface TeacherRegistrationData {
  name: string;
  email: string;
  password: string;
  department: string;
  accessCode: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Teacher | Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const fetchUserProfile = async (): Promise<boolean> => {
    try {
      const response = await api.get<AuthUser>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        setNeedsRegistration(false);
        return true;
      }
      setUser(null);
      setProfile(null);
      return false;
    } catch {
      setUser(null);
      setProfile(null);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const hasProfile = await fetchUserProfile();
        if (!hasProfile) {
          setNeedsRegistration(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setNeedsRegistration(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setFirebaseUser(credential.user);
    const hasProfile = await fetchUserProfile();
    if (!hasProfile) {
      // User exists in Firebase but not in DB — sign them out
      await signOut(auth);
      setFirebaseUser(null);
      throw new Error('Account profile not found. Please click "Sign Up" to create your account.');
    }
  };

  const loginWithGoogle = async (): Promise<{ needsRegistration: boolean }> => {
    const credential = await signInWithPopup(auth, googleProvider);
    setFirebaseUser(credential.user);
    const hasProfile = await fetchUserProfile();
    if (!hasProfile) {
      // Keep user signed in — they need to complete registration
      setNeedsRegistration(true);
      return { needsRegistration: true };
    }
    return { needsRegistration: false };
  };

  // Register with Google: user is already authenticated via Google popup,
  // just need to create the backend profile
  const registerWithGoogle = async (profileData: Omit<RegisterPayload, 'email'> & { email?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user. Please sign in with Google first.');
    }

    const email = auth.currentUser.email || profileData.email;
    if (!email) {
      throw new Error('Email is required for registration.');
    }

    await api.post('/auth/register', {
      ...profileData,
      email,
    });

    await fetchUserProfile();
    setNeedsRegistration(false);
  };

  const registerStudent = async (data: StudentRegistrationData) => {
    let credential: UserCredential | null = null;
    try {
      credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      setFirebaseUser(credential.user);

      await api.post('/auth/register', {
        role: 'student',
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        branch: data.branch,
        semester: data.semester,
        section: data.section,
      });

      await fetchUserProfile();
    } catch (error) {
      // Rollback: delete the Firebase user if backend registration failed
      if (credential?.user) {
        try {
          await credential.user.delete();
        } catch {
          // If delete fails, sign out at minimum
          await signOut(auth);
        }
        setFirebaseUser(null);
      }
      throw error;
    }
  };

  const registerTeacher = async (data: TeacherRegistrationData) => {
    let credential: UserCredential | null = null;
    try {
      credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      setFirebaseUser(credential.user);

      await api.post('/auth/register', {
        role: 'teacher',
        name: data.name,
        email: data.email,
        department: data.department,
        accessCode: data.accessCode,
      });

      await fetchUserProfile();
    } catch (error) {
      // Rollback: delete the Firebase user if backend registration failed
      if (credential?.user) {
        try {
          await credential.user.delete();
        } catch {
          await signOut(auth);
        }
        setFirebaseUser(null);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, profileData: RegisterPayload) => {
    if (profileData.role === 'student') {
      await registerStudent({ ...profileData, email, password });
    } else {
      await registerTeacher({ ...profileData, email, password });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUser(null);
    setProfile(null);
    setNeedsRegistration(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        needsRegistration,
        login,
        loginWithGoogle,
        register,
        registerWithGoogle,
        registerStudent,
        registerTeacher,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
