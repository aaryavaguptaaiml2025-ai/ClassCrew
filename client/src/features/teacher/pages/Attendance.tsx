import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle, XCircle, Save, Users } from 'lucide-react';
import { api } from '@/services/api';
import type { Classroom, ClassroomMember, Attendance } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherAttendance() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<ClassroomMember[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent'>>({});
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
    if (!selectedClassroomId || !date) return;
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        const [mRes, aRes] = await Promise.all([
          api.get<ClassroomMember[]>(`/classrooms/${selectedClassroomId}/members`),
          api.get<Attendance[]>(`/attendance?classroomId=${selectedClassroomId}&date=${date}`),
        ]);

        if (mRes.success) {
          setStudents(mRes.data);
          const initialMap: Record<string, 'present' | 'absent'> = {};
          mRes.data.forEach((m) => {
            initialMap[m.studentId] = 'present'; // default present
          });

          if (aRes.success && aRes.data.length > 0) {
            aRes.data.forEach((att) => {
              initialMap[att.studentId] = att.status;
            });
          }
          setAttendanceRecords(initialMap);
        }
      } catch {
        toast.error('Failed to load attendance register');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceData();
  }, [selectedClassroomId, date]);

  const toggleStudentStatus = (studentId: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    students.forEach((s) => {
      updated[s.studentId] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassroomId || students.length === 0) return;
    setIsSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        status: attendanceRecords[s.studentId] || 'present',
      }));

      const res = await api.post('/attendance', {
        classroomId: selectedClassroomId,
        date,
        records,
      });

      if (res.success) {
        toast.success('Attendance register saved successfully! 📋');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save attendance';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendanceRecords).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceRecords).filter((s) => s === 'absent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Attendance Register</h1>
          <p className="topbar__subtitle">Mark daily attendance and track student presence records.</p>
        </div>
        <div className="topbar__right">
          <button className="btn btn--primary" onClick={handleSaveAttendance} disabled={isSaving || students.length === 0}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="auth-form__group" style={{ flex: 1, minWidth: 200 }}>
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

        <div className="auth-form__group" style={{ flex: 1, minWidth: 180 }}>
          <label className="auth-form__label">Attendance Date</label>
          <input
            type="date"
            className="auth-form__input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Summary & Bulk Controls */}
      {students.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="badge badge--success" style={{ fontSize: 13, padding: '6px 12px' }}>
              Present: {presentCount}
            </span>
            <span className="badge badge--danger" style={{ fontSize: 13, padding: '6px 12px' }}>
              Absent: {absentCount}
            </span>
            <span className="badge badge--neutral" style={{ fontSize: 13, padding: '6px 12px' }}>
              Total: {students.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--outline btn--sm" onClick={() => markAll('present')}>
              Mark All Present
            </button>
            <button className="btn btn--outline btn--sm" onClick={() => markAll('absent')}>
              Mark All Absent
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading student register...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3 className="empty-state__title">No Students Enrolled</h3>
            <p className="empty-state__text">Share the classroom code to enroll students before marking attendance.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const status = attendanceRecords[s.studentId] || 'present';
                return (
                  <tr key={s.studentId}>
                    <td style={{ fontWeight: 600 }}>{s.student?.name || 'Student'}</td>
                    <td>{s.student?.rollNumber || '-'}</td>
                    <td>{s.student?.branch || '-'}</td>
                    <td>
                      <span className={`badge ${status === 'present' ? 'badge--success' : 'badge--danger'}`}>
                        {status === 'present' ? <CheckCircle size={12} /> : <XCircle size={12} />} {status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn--sm ${status === 'present' ? 'btn--outline' : 'btn--primary'}`}
                        onClick={() => toggleStudentStatus(s.studentId)}
                      >
                        Toggle Status
                      </button>
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
