import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, Copy, Check, Search, X } from 'lucide-react';
import { api } from '@/services/api';
import type { Classroom } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Classroom[]>('/classrooms');
      if (res.success) setClassrooms(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch classrooms';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
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
        fetchClassrooms();
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
    toast.success('Join code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredClassrooms = classrooms.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.joinCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">My Classrooms</h1>
          <p className="topbar__subtitle">Manage your active classes, students, and course materials.</p>
        </div>
        <div className="topbar__right">
          <div className="search-input">
            <Search className="search-input__icon" size={16} />
            <input
              type="text"
              className="search-input__field"
              placeholder="Search classrooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Create Classroom
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading classrooms...</div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon"><BookOpen size={40} color="var(--text-tertiary)" /></div>
          <h3 className="empty-state__title">{search ? 'No Classrooms Found' : 'No Classrooms Yet'}</h3>
          <p className="empty-state__text">
            {search ? `No classrooms matching "${search}".` : 'Create your first classroom to start sharing assignments, quizzes, and tracking attendance.'}
          </p>
          {!search && (
            <button className="btn btn--primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} /> Create Classroom
            </button>
          )}
        </div>
      ) : (
        <div className="classroom-grid">
          {filteredClassrooms.map((c) => (
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
                    <BookOpen size={14} /> Sem {c.semester} - Sec {c.section}
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to={`/classrooms/${c.classroomId}`} className="btn btn--outline btn--sm">
                    Open Classroom →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create Classroom */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Create New Classroom</h2>
              <button className="modal__close" onClick={() => setIsCreateOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateClassroom}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="auth-form__group">
                  <label className="auth-form__label">Classroom Title *</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="e.g. Operating Systems"
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
                    placeholder="Brief course overview..."
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
