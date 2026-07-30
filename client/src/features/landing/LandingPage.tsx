import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '@/styles/landing.css';

const FEATURES = [
  { icon: 'CC1', title: 'Smart Classrooms', text: 'Create classrooms instantly with auto-generated join codes. Students join in seconds.', color: 'rgba(168,85,247,0.1)' },
  { icon: 'CC2', title: 'Assignments', text: 'Create, publish, and track assignments. Students submit with one click. Teachers review inline.', color: 'rgba(236,72,153,0.1)' },
  { icon: 'CC3', title: 'Interactive Quizzes', text: 'MCQ and true/false quizzes with auto-grading, timers, and instant score reporting.', color: 'rgba(99,102,241,0.1)' },
  { icon: 'CC4', title: 'Live Analytics', text: 'Real-time dashboards with attendance trends, performance charts, and class insights.', color: 'rgba(59,130,246,0.1)' },
  { icon: 'CC5', title: 'Attendance', text: 'Mark attendance in bulk. Students see their percentage live. Teachers see patterns.', color: 'rgba(34,197,94,0.1)' },
  { icon: 'CC6', title: 'Notifications', text: 'Instant alerts for new assignments, quiz results, and classroom updates.', color: 'rgba(245,158,11,0.1)' },
];

const STEPS = [
  { num: '1', title: 'Create Account', text: 'Sign up as a teacher or student. Teachers need an access code from their institution.' },
  { num: '2', title: 'Join or Create', text: 'Teachers create classrooms. Students join using a 6-character code.' },
  { num: '3', title: 'Start Learning', text: 'Manage assignments, take quizzes, track attendance — all in one beautiful interface.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav__brand">
          <div className="landing-nav__logo">CC</div>
          <span className="landing-nav__name">ClassCrew</span>
        </div>
        <div className="landing-nav__actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ border: scrolled ? undefined : '1px solid transparent' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="btn btn--outline btn--sm">
            Log In
          </Link>
          <Link to="/register" className="btn btn--primary btn--sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero__badge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Built for modern classrooms
        </motion.div>

        <motion.h1
          className="landing-hero__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          One Classroom.{' '}
          <span className="text-gradient">Every Connection.</span>
        </motion.h1>

        <motion.p
          className="landing-hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          The modern classroom management platform that makes teaching and learning simple, beautiful, and enjoyable.
        </motion.p>

        <motion.div
          className="landing-hero__cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/register" className="btn btn--primary btn--lg">
            Start for Free →
          </Link>
          <Link to="/login" className="btn btn--outline btn--lg">
            Sign In
          </Link>
        </motion.div>

        <div className="landing-hero__bg">
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <div className="landing-hero__orb landing-hero__orb--3" />
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features__header">
          <p className="landing-features__label">Features</p>
          <h2 className="landing-features__title">Everything you need, nothing you don&apos;t</h2>
          <p className="landing-features__subtitle">
            Designed for educators and students who want a better classroom experience.
          </p>
        </div>

        <div className="landing-features__grid">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <div className="feature-card__icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__text">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps">
        <div className="landing-steps__inner">
          <div className="landing-features__header">
            <p className="landing-features__label">How It Works</p>
            <h2 className="landing-features__title">Get started in 3 steps</h2>
            <p className="landing-features__subtitle">
              From sign-up to your first classroom in under two minutes.
            </p>
          </div>

          <div className="landing-steps__grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                className="step-card"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="step-card__number">{step.num}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__text">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <motion.div
          className="landing-cta__card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-cta__title">Ready to transform your classroom?</h2>
          <p className="landing-cta__text">
            Join educators and students who are already using ClassCrew to make learning better.
          </p>
          <Link to="/register" className="btn btn--primary btn--lg">
            Create Your Free Account →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="landing-footer__text">&copy; 2026 ClassCrew. Built for education.</p>
        <div className="landing-footer__links">
          <a href="#" className="landing-footer__link">Privacy</a>
          <a href="#" className="landing-footer__link">Terms</a>
          <a href="#" className="landing-footer__link">Contact</a>
        </div>
      </footer>
    </div>
  );
}
