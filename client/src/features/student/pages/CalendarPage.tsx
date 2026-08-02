import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, FileText, Brain, Bookmark, Calendar } from 'lucide-react';
import { api } from '@/services/api';
import type { CalendarEvent } from '@/types';
import toast from 'react-hot-toast';

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<CalendarEvent[]>('/calendar');
        if (res.success) setEvents(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch calendar';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Academic Calendar</h1>
          <p className="topbar__subtitle">Stay organized with upcoming assignment due dates, quiz schedules, and class events.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading schedule...</div>
      ) : events.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon"><Calendar size={40} color="var(--text-tertiary)" /></div>
          <h3 className="empty-state__title">No Scheduled Events</h3>
          <p className="empty-state__text">You have no upcoming deadlines or scheduled quizzes on your calendar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((evt) => (
            <motion.div
              key={evt.eventId}
              className="card"
              whileHover={{ x: 4 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: evt.type === 'assignment' ? 'rgba(168,85,247,0.1)' : evt.type === 'quiz' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: evt.type === 'assignment' ? '#a855f7' : evt.type === 'quiz' ? '#ec4899' : '#3b82f6',
                  }}
                >
                  {evt.type === 'assignment' ? <FileText size={20} /> : evt.type === 'quiz' ? <Brain size={20} /> : <Bookmark size={20} />}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{evt.title}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{evt.description}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {new Date(evt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {new Date(evt.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
