import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, FileText, Brain, CalendarCheck, Plus, Copy, Check, ArrowRight
} from 'lucide-react';
import { api } from '@/services/api';
import type { DashboardStats, Classroom } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClassrooms: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    activeQuizzes: 0,
    averageAttendance: 0,
  });
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, classroomsRes] = await Promise.all([
        api.get<DashboardStats>('/analytics/teacher/stats'),
        api.get<Classroom[]>('/classrooms'),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (classroomsRes.success) setClassrooms(classroomsRes.data);
    } catch {
      // Fallback data if API not populated yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      return toast.error('Classroom title and subject are required');
    }
    setIsSubmitting(true);
    try {
      const res = await api.post<Classroom>('/classrooms', {
        title,
        subject,
        description,
        semester,
        section,
      });
      if (res.success) {
        toast.success(`Classroom "${title}" created! Code: ${res.data.joinCode}`);
        setIsCreateOpen(false);
        setTitle('');
        setSubject('');
        setDescription('');
        fetchData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create classroom';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Join code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Header */}
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Teacher Overview</h1>
          <p className="topbar__subtitle">Welcome back. Here is your classroom summary.</p>
        </div>
        <div className="topbar__right">
          <button className="btn btn--primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Create Classroom
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--purple">
              <BookOpen size={20} />
            </div>
            <span className="stat-card__trend stat-card__trend--up">Active</span>
          </div>
          <div className="stat-card__value">{isLoading ? '...' : stats.totalClassrooms}</div>
          <div className="stat-card__label">Classrooms</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--blue">
              <Users size={20} />
            </div>
            <span className="stat-card__trend stat-card__trend--up">Enrolled</span>
          </div>
          <div className="stat-card__value">{isLoading ? '...' : stats.totalStudents}</div>
          <div className="stat-card__label">Total Students</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--amber">
              <FileText size={20} />
            </div>
            <span className="stat-card__trend stat-card__trend--up">To Review</span>
          </div>
          <div className="stat-card__value">{isLoading ? '...' : stats.pendingAssignments}</div>
          <div className="stat-card__label">Submissions Pending</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--pink">
              <Brain size={20} />
            </div>
            <span className="stat-card__trend stat-card__trend--up">Live</span>
          </div>
          <div className="stat-card__value">{isLoading ? '...' : stats.activeQuizzes}</div>
          <div className="stat-card__label">Active Quizzes</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--green">
              <CalendarCheck size={20} />
            </div>
            <span className="stat-card__trend stat-card__trend--up">Average</span>
          </div>
          <div className="stat-card__value">{isLoading ? '...' : `${stats.averageAttendance}%`}</div>
          <div className="stat-card__label">Attendance Rate</div>
        </div>
      </div>

      {/* Classrooms Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>My Classrooms</h2>
          <Link to="/my-classrooms" className="auth-link auth-link--sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            View all ({classrooms.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading classrooms...</div>
        ) : classrooms.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state__icon">📚</div>
            <h3 className="empty-state__title">No Classrooms Yet</h3>
            <p className="empty-state__text">Create your first classroom to start sharing assignments, quizzes, and tracking attendance.</p>
            <button className="btn btn--primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} /> Create Classroom
            </button>
          </div>
        ) : (
          <div className="classroom-grid">
            {classrooms.slice(0, 6).map((c) => (
              <motion.div
                key={c.classroomId}
                className="card classroom-card card--clickable"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <div className="classroom-card__banner" />
                <div className="classroom-card__body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 className="classroom-card__title">{c.title}</h3>
                      <div className="classroom-card__subject">{c.subject}</div>
                    </div>
                    <button
                      type="button"
                      className="badge badge--purple"
                      style={{ border: 'none', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      onClick={(e) => { e.stopPropagation(); copyJoinCode(c.joinCode); }}
                      title="Click to copy join code"
                    >
                      {copiedCode === c.joinCode ? <Check size={12} /> : <Copy size={12} />} {c.joinCode}
                    </button>
                  </div>

                  {c.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                  )}

                  <div className="classroom-card__meta">
                    <div className="classroom-card__meta-item">
                      <Users size={14} /> {c.studentCount || 0} Students
                    </div>
                    <div className="classroom-card__meta-item">
                      <FileText size={14} /> Sem {c.semester} - Sec {c.section}
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/classrooms/${c.classroomId}`} className="btn btn--outline btn--sm">
                      Manage Classroom →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Classroom */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Create New Classroom</h2>
              <button className="modal__close" onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClassroom}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="auth-form__group">
                  <label className="auth-form__label">Classroom Title *</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="e.g. Data Structures & Algorithms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Subject *</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="e.g. Computer Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Description</label>
                  <textarea
                    className="auth-form__input"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    placeholder="Brief description of course overview..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="auth-form__row">
                  <div className="auth-form__group">
                    <label className="auth-form__label">Semester</label>
                    <select
                      className="auth-form__select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      {['1','2','3','4','5','6','7','8'].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-form__group">
                    <label className="auth-form__label">Section</label>
                    <select
                      className="auth-form__select"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    >
                      {['A','B','C','D','E','F'].map((sec) => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
