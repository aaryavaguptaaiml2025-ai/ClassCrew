import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Save, Search, BarChart3 } from 'lucide-react';
import { api } from '@/services/api';
import type { Classroom, ClassroomMember, Marks } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherMarks() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [students, setStudents] = useState<ClassroomMember[]>([]);
  const [marksData, setMarksData] = useState<Record<string, { internal: number | ''; quiz: number | ''; midSemester: number | ''; endSemester: number | '' }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await api.get<Classroom[]>('/classrooms');
        if (res.success && res.data.length > 0) {
          setClassrooms(res.data);
          setSelectedClassroomId(res.data[0].classroomId);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch classrooms';
        toast.error(msg);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (!selectedClassroomId) return;
    const fetchMarks = async () => {
      try {
        setIsLoading(true);
        const [mRes, marksRes] = await Promise.all([
          api.get<ClassroomMember[]>(`/classrooms/${selectedClassroomId}/members`),
          api.get<Marks[]>(`/marks?classroomId=${selectedClassroomId}`),
        ]);

        if (mRes.success) {
          setStudents(mRes.data);
          const map: Record<string, { internal: number | ''; quiz: number | ''; midSemester: number | ''; endSemester: number | '' }> = {};
          mRes.data.forEach((s) => {
            map[s.studentId] = { internal: '', quiz: '', midSemester: '', endSemester: '' };
          });

          if (marksRes.success && marksRes.data.length > 0) {
            marksRes.data.forEach((m) => {
              map[m.studentId] = {
                internal: m.internal ?? '',
                quiz: m.quiz ?? '',
                midSemester: m.midSemester ?? '',
                endSemester: m.endSemester ?? '',
              };
            });
          }
          setMarksData(map);
        }
      } catch {
        toast.error('Failed to load gradebook');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarks();
  }, [selectedClassroomId]);

  const updateMark = (studentId: string, field: 'internal' | 'quiz' | 'midSemester' | 'endSemester', val: string) => {
    const num = val === '' ? '' : Math.min(100, Math.max(0, Number(val)));
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedClassroomId || students.length === 0) return;
    setIsSaving(true);
    try {
      const records = students.map((s) => {
        const m = marksData[s.studentId] || { internal: '', quiz: '', midSemester: '', endSemester: '' };
        return {
          studentId: s.studentId,
          internal: m.internal === '' ? null : Number(m.internal),
          quiz: m.quiz === '' ? null : Number(m.quiz),
          midSemester: m.midSemester === '' ? null : Number(m.midSemester),
          endSemester: m.endSemester === '' ? null : Number(m.endSemester),
        };
      });

      const res = await api.post('/marks', {
        classroomId: selectedClassroomId,
        records,
      });

      if (res.success) {
        toast.success('Gradebook saved successfully!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save gradebook';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Gradebook & Marks</h1>
          <p className="topbar__subtitle">Manage internal, quiz, and semester examination marks for students.</p>
        </div>
        <div className="topbar__right">
          <button className="btn btn--primary" onClick={handleSaveMarks} disabled={isSaving || students.length === 0}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Gradebook'}
          </button>
        </div>
      </div>

      {/* Selector */}
      <div className="card" style={{ maxWidth: 400 }}>
        <div className="auth-form__group">
          <label className="auth-form__label">Select Classroom</label>
          <select
            className="auth-form__select"
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
          >
            {classrooms.map((c) => (
              <option key={c.classroomId} value={c.classroomId}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading gradebook...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><BarChart3 size={40} color="var(--text-tertiary)" /></div>
            <h3 className="empty-state__title">No Enrolled Students</h3>
            <p className="empty-state__text">Students will appear in the gradebook once they join this classroom.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Internal (20)</th>
                <th>Quiz (20)</th>
                <th>Mid Sem (30)</th>
                <th>End Sem (30)</th>
                <th>Total (100)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const m = marksData[s.studentId] || { internal: '', quiz: '', midSemester: '', endSemester: '' };
                const total = (Number(m.internal) || 0) + (Number(m.quiz) || 0) + (Number(m.midSemester) || 0) + (Number(m.endSemester) || 0);

                return (
                  <tr key={s.studentId}>
                    <td style={{ fontWeight: 600 }}>{s.student?.name || 'Student'}</td>
                    <td>{s.student?.rollNumber || '-'}</td>
                    <td>
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 80, padding: '4px 8px', textAlign: 'center' }}
                        value={m.internal}
                        onChange={(e) => updateMark(s.studentId, 'internal', e.target.value)}
                        placeholder="0-20"
                        min={0}
                        max={20}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 80, padding: '4px 8px', textAlign: 'center' }}
                        value={m.quiz}
                        onChange={(e) => updateMark(s.studentId, 'quiz', e.target.value)}
                        placeholder="0-20"
                        min={0}
                        max={20}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 80, padding: '4px 8px', textAlign: 'center' }}
                        value={m.midSemester}
                        onChange={(e) => updateMark(s.studentId, 'midSemester', e.target.value)}
                        placeholder="0-30"
                        min={0}
                        max={30}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 80, padding: '4px 8px', textAlign: 'center' }}
                        value={m.endSemester}
                        onChange={(e) => updateMark(s.studentId, 'endSemester', e.target.value)}
                        placeholder="0-30"
                        min={0}
                        max={30}
                      />
                    </td>
                    <td>
                      <span className={`badge ${total >= 40 ? 'badge--success' : 'badge--danger'}`} style={{ fontSize: 13, fontWeight: 700 }}>
                        {total} / 100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
