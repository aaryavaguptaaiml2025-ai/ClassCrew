import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, UserCheck, Plus, Search, KeyRound } from 'lucide-react';
import { api } from '@/services/api';
import type { Classroom } from '@/types';
import toast from 'react-hot-toast';

export default function StudentClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Join Modal State
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
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

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      return toast.error('Please enter a 6-character join code');
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<Classroom>('/classrooms/join', { joinCode: cleanCode });
      if (res.success) {
        toast.success(`Successfully joined "${res.data.title}"! 🎉`);
        setIsJoinOpen(false);
        setJoinCode('');
        fetchClassrooms();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join classroom';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClassrooms = classrooms.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    (c.teacherName && c.teacherName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">My Classrooms</h1>
          <p className="topbar__subtitle">All your enrolled classes and subject materials in one place.</p>
        </div>
        <div className="topbar__right">
          <div className="search-input">
            <Search className="search-input__icon" size={16} />
            <input
              type="text"
              className="search-input__field"
              placeholder="Search your classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={() => setIsJoinOpen(true)}>
            <Plus size={16} /> Join Classroom
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading classrooms...</div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">🎒</div>
          <h3 className="empty-state__title">{search ? 'No Classrooms Found' : 'No Enrolled Classrooms'}</h3>
          <p className="empty-state__text">
            {search ? `No classes matching "${search}".` : 'Ask your teacher for a 6-character classroom code to join your first class!'}
          </p>
          {!search && (
            <button className="btn btn--primary" onClick={() => setIsJoinOpen(true)}>
              <Plus size={16} /> Join Classroom
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
                <div style={{ marginBottom: 12 }}>
                  <h3 className="classroom-card__title">{c.title}</h3>
                  <div className="classroom-card__subject">{c.subject}</div>
                </div>

                {c.teacherName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <UserCheck size={14} className="text-gradient" />
                    <span>Teacher: <strong>{c.teacherName}</strong></span>
                  </div>
                )}

                {c.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                )}

                <div className="classroom-card__meta">
                  <div className="classroom-card__meta-item">
                    <BookOpen size={14} /> Sem {c.semester} - Sec {c.section}
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to={`/classrooms/${c.classroomId}`} className="btn btn--outline btn--sm">
                    Enter Classroom →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Join Classroom */}
      {isJoinOpen && (
        <div className="modal-overlay" onClick={() => setIsJoinOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Join a Classroom</h2>
              <button className="modal__close" onClick={() => setIsJoinOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleJoinClassroom}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  Enter the 6-character code provided by your teacher to enroll instantly.
                </p>

                <div className="auth-form__group">
                  <label className="auth-form__label">Classroom Code *</label>
                  <div className="auth-form__input-wrapper">
                    <KeyRound size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      className="auth-form__input"
                      style={{ paddingLeft: 42, letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}
                      placeholder="e.g. A3T26X"
                      maxLength={10}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      autoFocus
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsJoinOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Joining...' : 'Join Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
