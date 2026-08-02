import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { api } from '@/services/api';
import type { Marks } from '@/types';
import toast from 'react-hot-toast';

export default function StudentMarksPage() {
  const [marksList, setMarksList] = useState<Marks[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<Marks[]>('/marks/student');
        if (res.success) setMarksList(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch marks';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Academic Report Card</h1>
          <p className="topbar__subtitle">View internal, quiz, and semester examination results.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading report card...</div>
      ) : marksList.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon"><GraduationCap size={40} color="var(--text-tertiary)" /></div>
          <h3 className="empty-state__title">No Marks Published Yet</h3>
          <p className="empty-state__text">Your teachers will publish internal and examination scores here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject / Classroom</th>
                <th>Internal (20)</th>
                <th>Quiz (20)</th>
                <th>Mid Sem (30)</th>
                <th>End Sem (30)</th>
                <th>Total Grade</th>
              </tr>
            </thead>
            <tbody>
              {marksList.map((m) => {
                const total = (m.internal || 0) + (m.quiz || 0) + (m.midSemester || 0) + (m.endSemester || 0);
                return (
                  <tr key={m.marksId}>
                    <td style={{ fontWeight: 700 }}>Classroom Marks</td>
                    <td>{m.internal !== null ? `${m.internal} / 20` : '-'}</td>
                    <td>{m.quiz !== null ? `${m.quiz} / 20` : '-'}</td>
                    <td>{m.midSemester !== null ? `${m.midSemester} / 30` : '-'}</td>
                    <td>{m.endSemester !== null ? `${m.endSemester} / 30` : '-'}</td>
                    <td>
                      <span className={`badge ${total >= 40 ? 'badge--success' : 'badge--danger'}`} style={{ fontSize: 13, fontWeight: 800 }}>
                        {total} / 100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
