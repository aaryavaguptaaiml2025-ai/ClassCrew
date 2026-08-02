import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from './AuthLayout';
import toast from 'react-hot-toast';
import '@/styles/auth.css';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('INVALID_LOGIN_CREDENTIALS')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.includes('user-not-found')) {
        setError('No account found with this email. Please sign up.');
      } else if (message.includes('invalid-api-key') || message.includes('API_KEY_INVALID') || message.includes('api-key-not-valid')) {
        setError('Firebase API Key is missing or invalid. Check client/.env configuration.');
      } else if (message.includes('too-many-requests')) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsRegistration) {
        // Google user exists but no DB profile — redirect to register to complete profile
        toast('Please complete your profile to continue.');
        navigate('/register');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      if (message.includes('invalid-api-key') || message.includes('API_KEY_INVALID')) {
        setError('Firebase API Key is invalid. Check client/.env configuration.');
      } else if (message.includes('popup-closed-by-user')) {
        setError('');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ClassCrew account">
      {error && (
        <motion.div
          className="auth-alert auth-alert--error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__group">
          <label className="auth-form__label" htmlFor="login-email">
            Email Address
          </label>
          <div className="auth-form__input-wrapper">
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              id="login-email"
              type="email"
              className="auth-form__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div className="auth-form__group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-form__label" htmlFor="login-password">
              Password
            </label>
            <Link to="/forgot-password" className="auth-link auth-link--sm">
              Forgot password?
            </Link>
          </div>
          <div className="auth-form__input-wrapper">
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-form__input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          className="auth-btn auth-btn--primary auth-btn--full"
          disabled={isLoading}
        >
          {isLoading ? <div className="auth-btn__spinner" /> : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider">
        <div className="auth-divider__line" />
        <span className="auth-divider__text">or</span>
        <div className="auth-divider__line" />
      </div>

      <button
        type="button"
        className="auth-btn auth-btn--outline auth-btn--full"
        onClick={handleGoogleLogin}
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

      <p className="auth-footer-text">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="auth-link">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
