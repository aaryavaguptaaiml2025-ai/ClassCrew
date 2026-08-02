import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FileText, Brain, CalendarCheck,
  BarChart3, Bell, Settings, LogOut, Menu, X, Sun, Moon, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ClassCrewLogo from '@/components/shared/Logo';
import '@/styles/components.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-classrooms', icon: BookOpen, label: 'My Classrooms' },
  { to: '/assignments', icon: FileText, label: 'Assignments' },
  { to: '/quizzes', icon: Brain, label: 'Quizzes' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/marks', icon: GraduationCap, label: 'Marks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const BOTTOM_NAV = [
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const teacherName = profile && 'name' in profile ? profile.name : 'Teacher';
  const initials = teacherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="sidebar__brand">
        <ClassCrewLogo size={30} showText={true} />
      </div>

      <p className="sidebar__section-label">Main Menu</p>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="sidebar__link-icon" size={18} />
            {item.label}
          </NavLink>
        ))}

        <p className="sidebar__section-label">Settings</p>
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="sidebar__link-icon" size={18} />
            {item.label}
          </NavLink>
        ))}

        <button className="sidebar__link" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="sidebar__link-icon" size={18} /> : <Moon className="sidebar__link-icon" size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button className="sidebar__link" onClick={handleLogout} style={{ color: 'var(--danger-500)' }}>
          <LogOut className="sidebar__link-icon" size={18} />
          Log Out
        </button>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{teacherName}</div>
            <div className="sidebar__user-role">Teacher</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar" style={{ display: 'none' }}>
        {sidebarContent}
      </aside>
      <style>{`
        @media (min-width: 769px) {
          .sidebar { display: flex !important; }
        }
      `}</style>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="modal-overlay" style={{ zIndex: 49 }} onClick={() => setMobileOpen(false)}>
          <motion.aside
            className="sidebar sidebar--open"
            style={{ position: 'fixed', left: 0, top: 0, boxShadow: 'var(--shadow-xl)' }}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-btn"
              style={{ position: 'absolute', top: 16, right: 16 }}
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </motion.aside>
        </div>
      )}

      <main className="app-layout__main">
        {/* Mobile Menu Button */}
        <div style={{ display: 'none' }}>
          <button className="icon-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .app-layout__main > div:first-child { display: flex !important; margin-bottom: 16px; }
          }
        `}</style>

        {children}
      </main>
    </div>
  );
}
