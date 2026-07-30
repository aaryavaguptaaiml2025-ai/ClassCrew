import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from './AuthLayout';
import toast from 'react-hot-toast';
import '@/styles/auth.css';

type Role = 'student' | 'teacher';

interface FormErrors {
  [key: string]: string;
}

const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics', 'Electrical',
  'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Other',
];

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function RegisterPage() {
  const { register, registerWithGoogle, loginWithGoogle, needsRegistration, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');

  // Teacher fields
  const [department, setDepartment] = useState('');
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (needsRegistration && firebaseUser) {
      setName(firebaseUser.displayName || '');
      setEmail(firebaseUser.email || '');
      setStep(2);
    }
  }, [needsRegistration, firebaseUser]);

  const validateStep1 = () => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: FormErrors = {};
    if (role === 'student') {
      if (!rollNumber.trim()) errs.rollNumber = 'Roll number is required';
      if (!branch) errs.branch = 'Branch is required';
      if (!semester) errs.semester = 'Semester is required';
      if (!section) errs.section = 'Section is required';
    } else {
      if (!department.trim()) errs.department = 'Department is required';
      if (!accessCode.trim()) errs.accessCode = 'Access code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleGoogleRegister = async () => {
    setApiError('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.needsRegistration) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      if (message.includes('popup-closed-by-user')) {
        setApiError('');
      } else {
        setApiError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const profileData = role === 'student'
        ? { role: 'student' as const, name, email, rollNumber, branch, semester, section }
        : { role: 'teacher' as const, name, email, department, accessCode };

      if (needsRegistration && firebaseUser) {
        await registerWithGoogle(profileData);
      } else {
        await register(email, password, profileData);
      }
      toast.success('Account created! Welcome to ClassCrew 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('email-already-in-use')) {
        setApiError('An account with this email already exists.');
      } else if (message.includes('Invalid teacher access code') || message.includes('403')) {
        setApiError('Invalid teacher access code. Contact your administrator.');
      } else if (message.includes('weak-password')) {
        setApiError('Password is too weak. Use at least 6 characters.');
      } else {
        setApiError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Create your account' : `Complete ${role} profile`}
      subtitle={step === 1 ? 'Join ClassCrew to get started' : `Just a few more details to set up your ${role} account`}
    >
      {apiError && (
        <motion.div
          className="auth-alert auth-alert--error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {apiError}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Role Selector */}
            <div className="role-selector" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={`role-selector__option ${role === 'student' ? 'role-selector__option--active' : ''}`}
                onClick={() => setRole('student')}
              >
                <span className="role-selector__icon">🎓</span>
                <span className="role-selector__label">Student</span>
                <span className="role-selector__desc">Join classrooms</span>
              </button>
              <button
                type="button"
                className={`role-selector__option ${role === 'teacher' ? 'role-selector__option--active' : ''}`}
                onClick={() => setRole('teacher')}
              >
                <span className="role-selector__icon">📚</span>
                <span className="role-selector__label">Teacher</span>
                <span className="role-selector__desc">Manage classrooms</span>
              </button>
            </div>

            <div className="auth-form">
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="reg-name">Full Name</label>
                <div className="auth-form__input-wrapper">
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    id="reg-name"
                    type="text"
                    className={`auth-form__input ${errors.name ? 'auth-form__input--error' : ''}`}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                    style={{ paddingLeft: 40 }}
                  />
                </div>
                {errors.name && <span className="auth-form__error">{errors.name}</span>}
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="reg-email">Email Address</label>
                <div className="auth-form__input-wrapper">
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    id="reg-email"
                    type="email"
                    className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    autoComplete="email"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
                {errors.email && <span className="auth-form__error">{errors.email}</span>}
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="reg-password">Password</label>
                <div className="auth-form__input-wrapper">
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    autoComplete="new-password"
                    style={{ paddingLeft: 40 }}
                  />
                  <button
                    type="button"
                    className="auth-form__toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="auth-form__error">{errors.password}</span>}
              </div>

              <button
                type="button"
                className="auth-btn auth-btn--primary auth-btn--full"
                onClick={handleContinue}
              >
                Continue →
              </button>
            </div>
            
            <div className="auth-divider">
              <div className="auth-divider__line" />
              <span className="auth-divider__text">or</span>
              <div className="auth-divider__line" />
            </div>

            <button
              type="button"
              className="auth-btn auth-btn--outline auth-btn--full"
              onClick={handleGoogleRegister}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="step2"
            className="auth-form"
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
          >
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button
                type="button"
                onClick={() => { 
                  if (needsRegistration && firebaseUser) {
                    // Do not allow going back to step 1 if Google register
                    // But maybe we should? If they want to switch accounts?
                    // Actually, let's keep it simple and just setStep(1).
                    // If they are in Google mode, they shouldn't see step 1 password.
                    // Oh well, if they hit back, they can see step 1 but password will be there.
                    // Wait, if they are needsRegistration, step 1 is bypassed.
                    // We can check if it's google reg and prevent back, or let them go back but without password.
                    setStep(1); setErrors({}); setApiError(''); 
                  } else {
                    setStep(1); setErrors({}); setApiError(''); 
                  }
                }}
                style={{
                  background: 'none', border: 'none', color: 'var(--brand-purple)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'var(--font-sans)',
                  visibility: (needsRegistration && firebaseUser) ? 'hidden' : 'visible'
                }}
              >
                ← Back
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Step 2 of 2</span>
            </div>

            {role === 'student' ? (
              <>
                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="reg-roll">Roll Number</label>
                  <div className="auth-form__input-wrapper">
                    <GraduationCap size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      id="reg-roll"
                      type="text"
                      className={`auth-form__input ${errors.rollNumber ? 'auth-form__input--error' : ''}`}
                      placeholder="e.g., 21CS001"
                      value={rollNumber}
                      onChange={(e) => { setRollNumber(e.target.value); setErrors((p) => ({ ...p, rollNumber: '' })); }}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                  {errors.rollNumber && <span className="auth-form__error">{errors.rollNumber}</span>}
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="reg-branch">Branch</label>
                  <select
                    id="reg-branch"
                    className={`auth-form__select ${errors.branch ? 'auth-form__input--error' : ''}`}
                    value={branch}
                    onChange={(e) => { setBranch(e.target.value); setErrors((p) => ({ ...p, branch: '' })); }}
                  >
                    <option value="">Select your branch</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.branch && <span className="auth-form__error">{errors.branch}</span>}
                </div>

                <div className="auth-form__row">
                  <div className="auth-form__group">
                    <label className="auth-form__label" htmlFor="reg-semester">Semester</label>
                    <select
                      id="reg-semester"
                      className={`auth-form__select ${errors.semester ? 'auth-form__input--error' : ''}`}
                      value={semester}
                      onChange={(e) => { setSemester(e.target.value); setErrors((p) => ({ ...p, semester: '' })); }}
                    >
                      <option value="">Select</option>
                      {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    {errors.semester && <span className="auth-form__error">{errors.semester}</span>}
                  </div>

                  <div className="auth-form__group">
                    <label className="auth-form__label" htmlFor="reg-section">Section</label>
                    <select
                      id="reg-section"
                      className={`auth-form__select ${errors.section ? 'auth-form__input--error' : ''}`}
                      value={section}
                      onChange={(e) => { setSection(e.target.value); setErrors((p) => ({ ...p, section: '' })); }}
                    >
                      <option value="">Select</option>
                      {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                    {errors.section && <span className="auth-form__error">{errors.section}</span>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="reg-dept">Department</label>
                  <div className="auth-form__input-wrapper">
                    <BookOpen size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      id="reg-dept"
                      type="text"
                      className={`auth-form__input ${errors.department ? 'auth-form__input--error' : ''}`}
                      placeholder="e.g., Computer Science"
                      value={department}
                      onChange={(e) => { setDepartment(e.target.value); setErrors((p) => ({ ...p, department: '' })); }}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                  {errors.department && <span className="auth-form__error">{errors.department}</span>}
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label" htmlFor="reg-access">Teacher Access Code</label>
                  <div className="auth-form__input-wrapper">
                    <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      id="reg-access"
                      type="text"
                      className={`auth-form__input ${errors.accessCode ? 'auth-form__input--error' : ''}`}
                      placeholder="Enter access code"
                      value={accessCode}
                      onChange={(e) => { setAccessCode(e.target.value); setErrors((p) => ({ ...p, accessCode: '' })); }}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                  {errors.accessCode && <span className="auth-form__error">{errors.accessCode}</span>}
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Contact your institution administrator for the access code.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="auth-btn auth-btn--primary auth-btn--full"
              disabled={isLoading}
            >
              {isLoading ? <div className="auth-btn__spinner" /> : 'Create Account'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
