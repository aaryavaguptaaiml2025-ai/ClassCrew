import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, Brain, CalendarCheck } from 'lucide-react';
import ClassCrewLogo from '@/components/shared/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const HERO_FEATURES = [
  { icon: FileText, label: 'Smart Assignments', color: '#ec4899' },
  { icon: BarChart3, label: 'Live Analytics', color: '#3b82f6' },
  { icon: Brain, label: 'Interactive Quizzes', color: '#a855f7' },
  { icon: CalendarCheck, label: 'Attendance Tracking', color: '#22c55e' },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__brand">
          <Link to="/" className="auth-layout__logo-link">
            <ClassCrewLogo size={34} showText={true} />
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
              <ClassCrewLogo size={64} showText={false} />
            </div>
            <h2 className="auth-layout__hero-title">
              One Classroom.<br />Every Connection.
            </h2>
            <p className="auth-layout__hero-text">
              A modern platform that makes classroom management simple, beautiful, and enjoyable for teachers and students.
            </p>

            <div className="auth-layout__hero-features">
              {HERO_FEATURES.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    className="auth-layout__hero-feature"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  >
                    <span className="auth-layout__hero-feature-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      <IconComponent size={18} color={feature.color} />
                    </span>
                    <span>{feature.label}</span>
                  </motion.div>
                );
              })}
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
