import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from './AuthLayout';
import '@/styles/auth.css';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address');

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      if (message.includes('user-not-found')) {
        setError('No account found with this email.');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a password reset link to ${email}`}>
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            padding: '20px 0',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={32} style={{ color: 'var(--success-500)' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
              Open the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
            </p>
          </div>

          <button
            type="button"
            className="auth-btn auth-btn--outline auth-btn--full"
            onClick={() => { setSent(false); setEmail(''); }}
          >
            Try a different email
          </button>

          <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {error && (
        <motion.div
          className="auth-alert auth-alert--error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>⚠️</span> {error}
        </motion.div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__group">
          <label className="auth-form__label" htmlFor="reset-email">
            Email Address
          </label>
          <div className="auth-form__input-wrapper">
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              id="reset-email"
              type="email"
              className="auth-form__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn auth-btn--primary auth-btn--full"
          disabled={isLoading}
        >
          {isLoading ? <div className="auth-btn__spinner" /> : 'Send Reset Link'}
        </button>
      </form>

      <p className="auth-footer-text">
        <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
