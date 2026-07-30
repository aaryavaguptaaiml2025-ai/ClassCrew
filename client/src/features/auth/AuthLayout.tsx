import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__brand">
          <Link to="/" className="auth-layout__logo-link">
            <div className="auth-layout__logo">CC</div>
            <span className="auth-layout__logo-text">ClassCrew</span>
          </Link>
        </div>

        <motion.div
          className="auth-layout__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="auth-layout__header">
            <motion.h1
              className="auth-layout__title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="auth-layout__subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {children}
          </motion.div>
        </motion.div>

        <div className="auth-layout__footer">
          <p>© 2026 ClassCrew. All rights reserved.</p>
        </div>
      </div>

      <div className="auth-layout__right">
        <div className="auth-layout__hero">
          <motion.div
            className="auth-layout__hero-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="auth-layout__hero-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="18" fill="url(#hero-grad)" />
                <text x="32" y="40" fontFamily="Inter,sans-serif" fontSize="24" fontWeight="800" fill="white" textAnchor="middle">CC</text>
                <defs>
                  <linearGradient id="hero-grad" x1="0" y1="0" x2="64" y2="64">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="auth-layout__hero-title">
              One Classroom.<br />Every Connection.
            </h2>
            <p className="auth-layout__hero-text">
              A modern platform that makes classroom management simple, beautiful, and enjoyable for teachers and students.
            </p>

            <div className="auth-layout__hero-features">
              {[
                { icon: 'F1', label: 'Smart Assignments' },
                { icon: 'F2', label: 'Live Analytics' },
                { icon: 'F3', label: 'Interactive Quizzes' },
                { icon: 'F4', label: 'Attendance Tracking' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="auth-layout__hero-feature"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                >
                  <span className="auth-layout__hero-feature-icon">{feature.icon}</span>
                  <span>{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="auth-layout__hero-bg">
            <div className="auth-layout__orb auth-layout__orb--1" />
            <div className="auth-layout__orb auth-layout__orb--2" />
            <div className="auth-layout__orb auth-layout__orb--3" />
          </div>
        </div>
      </div>
    </div>
  );
}
