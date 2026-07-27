import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Search, Upload } from 'lucide-react';
import { api } from '@/services/api';
import type { Assignment, AssignmentSubmission } from '@/types';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Assignment[]>('/assignments');
      if (res.success) setAssignments(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch assignments';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleTurnIn = async () => {
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    try {
      const res = await api.post<AssignmentSubmission>(`/assignments/${selectedAssignment.assignmentId}/submit`);
      if (res.success) {
        toast.success(`Submitted "${selectedAssignment.title}"! 🎉`);
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit assignment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">My Assignments</h1>
          <p className="topbar__subtitle">View due dates, submit your coursework, and check teacher feedback.</p>
        </div>
        <div className="topbar__right">
          <div className="search-input">
            <Search className="search-input__icon" size={16} />
            <input
              type="text"
              className="search-input__field"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">📝</div>
          <h3 className="empty-state__title">No Assignments Found</h3>
          <p className="empty-state__text">You are all caught up! No active assignments found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((a) => (
            <motion.div
              key={a.assignmentId}
              className="card"
              whileHover={{ y: -1 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 16 }}>
                  <span>Classroom: <strong>{a.classroomTitle || 'Classroom'}</strong></span>
                  <span>Due: {new Date(a.dueDate).toLocaleString()}</span>
                  <span>Max Marks: {a.maxMarks}</span>
                </div>
                {a.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{a.description}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => setSelectedAssignment(a)}
                >
                  <Upload size={14} /> Turn In Work
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {selectedAssignment && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Submit: {selectedAssignment.title}</h2>
              <button className="modal__close" onClick={() => setSelectedAssignment(null)}>✕</button>
            </div>
            <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Are you ready to mark this assignment as completed? Your teacher will be notified immediately.
              </p>

              <div className="card" style={{ backgroundColor: 'var(--bg-secondary)', padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedAssignment.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button type="button" className="btn btn--outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={handleTurnIn} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
