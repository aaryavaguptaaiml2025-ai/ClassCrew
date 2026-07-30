import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import { api } from '@/services/api';
import type { Assignment, Classroom, AssignmentSubmission } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [teacherMarks, setTeacherMarks] = useState<number>(0);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [aRes, cRes] = await Promise.all([
        api.get<Assignment[]>('/assignments'),
        api.get<Classroom[]>('/classrooms'),
      ]);
      if (aRes.success) setAssignments(aRes.data);
      if (cRes.success) setClassrooms(cRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch assignments';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classroomId || !dueDate) {
      return toast.error('Title, Classroom, and Due Date are required');
    }
    setIsSubmitting(true);
    try {
      const res = await api.post<Assignment>('/assignments', {
        title,
        classroomId,
        description,
        dueDate,
        maxMarks: Number(maxMarks),
        status,
      });
      if (res.success) {
        toast.success(`Assignment "${title}" created!`);
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
        setDueDate('');
        fetchData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create assignment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmissionsModal = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsLoadingSubmissions(true);
    try {
      const res = await api.get<AssignmentSubmission[]>(`/assignments/${assignment.assignmentId}/submissions`);
      if (res.success) setSubmissions(res.data);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await api.patch(`/assignments/${gradingSubmission.submissionId}/review`, {
        status: 'reviewed',
        teacherMarks: Number(teacherMarks),
        teacherFeedback,
      });
      if (res.success) {
        toast.success('Marks and feedback updated!');
        setGradingSubmission(null);
        if (selectedAssignment) openSubmissionsModal(selectedAssignment);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to grade submission';
      toast.error(msg);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Assignments</h1>
          <p className="topbar__subtitle">Create, publish, and grade student assignments across your classrooms.</p>
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
          <button className="btn btn--primary" onClick={() => {
            if (classrooms.length > 0) setClassroomId(classrooms[0].classroomId);
            setIsCreateOpen(true);
          }}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {['all', 'published', 'draft', 'closed'].map((st) => (
          <button
            key={st}
            className={`tabs__tab ${statusFilter === st ? 'tabs__tab--active' : ''}`}
            onClick={() => setStatusFilter(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">📝</div>
          <h3 className="empty-state__title">No Assignments Found</h3>
          <p className="empty-state__text">Create assignments to post homework and projects to your classrooms.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredAssignments.map((a) => (
            <motion.div
              key={a.assignmentId}
              className="card"
              whileHover={{ y: -1 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                  <span className={`badge ${a.status === 'published' ? 'badge--success' : a.status === 'draft' ? 'badge--warning' : 'badge--neutral'}`}>
                    {a.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 16 }}>
                  <span>Classroom: <strong>{a.classroomTitle || 'Classroom'}</strong></span>
                  <span>Due: {new Date(a.dueDate).toLocaleString()}</span>
                  <span>Max Marks: {a.maxMarks}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--outline btn--sm" onClick={() => openSubmissionsModal(a)}>
                  <Eye size={14} /> Submissions ({a.submissionCount || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create Assignment */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Create Assignment</h2>
              <button className="modal__close" onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="auth-form__group">
                  <label className="auth-form__label">Classroom *</label>
                  <select
                    className="auth-form__select"
                    value={classroomId}
                    onChange={(e) => setClassroomId(e.target.value)}
                    required
                  >
                    <option value="">Select classroom</option>
                    {classrooms.map((c) => (
                      <option key={c.classroomId} value={c.classroomId}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Assignment Title *</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="e.g. Lab Report 1: Tree Traversals"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Instructions / Description</label>
                  <textarea
                    className="auth-form__input"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    placeholder="Provide details and guidelines for students..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="auth-form__row">
                  <div className="auth-form__group">
                    <label className="auth-form__label">Due Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="auth-form__input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-form__group">
                    <label className="auth-form__label">Max Marks</label>
                    <input
                      type="number"
                      className="auth-form__input"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      min={1}
                      max={1000}
                    />
                  </div>
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Status</label>
                  <select
                    className="auth-form__select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Review Submissions */}
      {selectedAssignment && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Submissions: {selectedAssignment.title}</h2>
              <button className="modal__close" onClick={() => setSelectedAssignment(null)}>✕</button>
            </div>
            <div className="modal__body">
              {isLoadingSubmissions ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading student submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state__text">No student submissions recorded yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Status</th>
                      <th>Marks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.submissionId}>
                        <td style={{ fontWeight: 600 }}>{sub.studentName || 'Student'}</td>
                        <td>{sub.studentRollNumber || '-'}</td>
                        <td>
                          <span className={`badge ${sub.status === 'reviewed' ? 'badge--success' : sub.status === 'submitted' ? 'badge--purple' : 'badge--neutral'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td>{sub.teacherMarks !== null ? `${sub.teacherMarks} / ${selectedAssignment.maxMarks}` : '-'}</td>
                        <td>
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setTeacherMarks(sub.teacherMarks || 0);
                              setTeacherFeedback(sub.teacherFeedback || '');
                            }}
                          >
                            Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Grade Single Submission */}
      {gradingSubmission && (
        <div className="modal-overlay" onClick={() => setGradingSubmission(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Grade Submission: {gradingSubmission.studentName}</h2>
              <button className="modal__close" onClick={() => setGradingSubmission(null)}>✕</button>
            </div>
            <form onSubmit={handleGradeSubmission}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="auth-form__group">
                  <label className="auth-form__label">Marks Awarded (out of {selectedAssignment?.maxMarks}) *</label>
                  <input
                    type="number"
                    className="auth-form__input"
                    value={teacherMarks}
                    onChange={(e) => setTeacherMarks(Number(e.target.value))}
                    min={0}
                    max={selectedAssignment?.maxMarks || 100}
                    required
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Teacher Feedback</label>
                  <textarea
                    className="auth-form__input"
                    style={{ minHeight: 80 }}
                    placeholder="Feedback for student..."
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
