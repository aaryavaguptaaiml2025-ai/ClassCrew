import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, FileText, Brain, CalendarCheck, GraduationCap, Copy, Check, Plus, ArrowLeft, Trash2, Edit
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Classroom, ClassroomMember, Assignment, Quiz } from '@/types';
import toast from 'react-hot-toast';

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'assignments' | 'quizzes'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchClassroomData = async () => {
      try {
        setIsLoading(true);
        const [cRes, mRes, aRes, qRes] = await Promise.all([
          api.get<Classroom>(`/classrooms/${id}`),
          api.get<ClassroomMember[]>(`/classrooms/${id}/members`),
          api.get<Assignment[]>(`/assignments?classroomId=${id}`),
          api.get<Quiz[]>(`/quizzes?classroomId=${id}`),
        ]);
        if (cRes.success) setClassroom(cRes.data);
        if (mRes.success) setMembers(mRes.data);
        if (aRes.success) setAssignments(aRes.data);
        if (qRes.success) setQuizzes(qRes.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load classroom';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassroomData();
  }, [id]);

  const copyCode = () => {
    if (!classroom?.joinCode) return;
    navigator.clipboard.writeText(classroom.joinCode);
    setCopiedCode(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading classroom details...</div>;
  }

  if (!classroom) {
    return (
      <div className="empty-state card">
        <div className="empty-state__icon"></div>
        <h3 className="empty-state__title">Classroom Not Found</h3>
        <p className="empty-state__text">The classroom you requested could not be found or you do not have permission.</p>
        <Link to="/my-classrooms" className="btn btn--primary">
          <ArrowLeft size={16} /> Back to My Classrooms
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: 28, background: 'var(--gradient-card)', border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link to="/my-classrooms" className="auth-link auth-link--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <ArrowLeft size={14} /> My Classrooms
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {classroom.title}
            </h1>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{classroom.subject}</span>
              <span>•</span>
              <span>Semester {classroom.semester} ({classroom.section})</span>
              {classroom.teacherName && (
                <>
                  <span>•</span>
                  <span>Teacher: <strong>{classroom.teacherName}</strong></span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isTeacher && (
              <button className="badge badge--purple" style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', gap: 6 }} onClick={copyCode}>
                {copiedCode ? <Check size={14} /> : <Copy size={14} />} Code: <strong>{classroom.joinCode}</strong>
              </button>
            )}
          </div>
        </div>

        {classroom.description && (
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.6 }}>
            {classroom.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tabs__tab ${activeTab === 'overview' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tabs__tab ${activeTab === 'members' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </button>
        <button
          className={`tabs__tab ${activeTab === 'assignments' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
        <button
          className={`tabs__tab ${activeTab === 'quizzes' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes ({quizzes.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} className="text-gradient" /> Recent Assignments
            </h3>
            {assignments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No assignments posted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assignments.slice(0, 3).map((a) => (
                  <div key={a.assignmentId} style={{ padding: 10, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${a.status === 'published' ? 'badge--success' : 'badge--neutral'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={18} className="text-gradient" /> Active Quizzes
            </h3>
            {quizzes.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No quizzes created yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quizzes.slice(0, 3).map((q) => (
                  <div key={q.quizId} style={{ padding: 10, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{q.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{q.duration} mins • {q.totalMarks} marks</div>
                    </div>
                    <span className={`badge ${q.status === 'active' ? 'badge--purple' : 'badge--neutral'}`}>{q.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {members.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">👥</div>
              <h3 className="empty-state__title">No Students Joined</h3>
              <p className="empty-state__text">Share the join code <strong>{classroom.joinCode}</strong> with your students to enroll them.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>Semester / Section</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.student?.name || 'Student'}</td>
                    <td>{m.student?.rollNumber || '-'}</td>
                    <td>{m.student?.branch || '-'}</td>
                    <td>Sem {m.student?.semester || classroom.semester} ({m.student?.section || classroom.section})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isTeacher && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/assignments" className="btn btn--primary">
                <Plus size={16} /> Manage Assignments
              </Link>
            </div>
          )}
          {assignments.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state__icon">📋</div>
              <h3 className="empty-state__title">No Assignments</h3>
              <p className="empty-state__text">There are currently no assignments in this classroom.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map((a) => (
                <div key={a.assignmentId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Due: {new Date(a.dueDate).toLocaleString()} • Max Marks: {a.maxMarks}
                    </div>
                  </div>
                  <span className={`badge ${a.status === 'published' ? 'badge--success' : 'badge--neutral'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isTeacher && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/quizzes" className="btn btn--primary">
                <Plus size={16} /> Manage Quizzes
              </Link>
            </div>
          )}
          {quizzes.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state__icon">🧠</div>
              <h3 className="empty-state__title">No Quizzes</h3>
              <p className="empty-state__text">There are currently no quizzes scheduled for this classroom.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {quizzes.map((q) => (
                <div key={q.quizId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{q.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Duration: {q.duration} mins • Total Marks: {q.totalMarks}
                    </div>
                  </div>
                  <span className={`badge ${q.status === 'active' ? 'badge--purple' : 'badge--neutral'}`}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
