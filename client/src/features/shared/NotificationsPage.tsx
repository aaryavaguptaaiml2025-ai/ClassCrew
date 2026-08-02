import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, FileText, Brain, GraduationCap, CalendarCheck, UserPlus } from 'lucide-react';
import { api } from '@/services/api';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Notification[]>('/notifications');
      if (res.success) setNotifications(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.success) {
        toast.success('All notifications marked as read');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment_published':
      case 'assignment_submitted':
        return <FileText size={18} style={{ color: '#a855f7' }} />;
      case 'quiz_published':
      case 'quiz_completed':
        return <Brain size={18} style={{ color: '#ec4899' }} />;
      case 'marks_updated':
        return <GraduationCap size={18} style={{ color: '#22c55e' }} />;
      case 'student_joined':
        return <UserPlus size={18} style={{ color: '#3b82f6' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--brand-purple)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Notifications</h1>
          <p className="topbar__subtitle">Stay up to date with classroom activities, announcements, and results.</p>
        </div>
        <div className="topbar__right">
          <button className="btn btn--outline" onClick={markAllAsRead}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon"><Bell size={40} color="var(--text-tertiary)" /></div>
          <h3 className="empty-state__title">No Notifications</h3>
          <p className="empty-state__text">You are all caught up! No recent notifications found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <motion.div
              key={n.notificationId}
              className="card"
              whileHover={{ x: 3 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: 16,
                backgroundColor: n.isRead ? 'var(--bg-card)' : 'var(--bg-secondary)',
                borderLeft: n.isRead ? '1px solid var(--border-card)' : '4px solid var(--brand-purple)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: 15, color: 'var(--text-primary)' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
