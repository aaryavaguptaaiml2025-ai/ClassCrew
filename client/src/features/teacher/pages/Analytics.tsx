import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';
import { api } from '@/services/api';
import type { TeacherAnalytics } from '@/types';
import toast from 'react-hot-toast';

export default function TeacherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<TeacherAnalytics>('/analytics/teacher/overview');
        if (res.success) setAnalytics(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch analytics';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading class analytics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Analytics & Insights</h1>
          <p className="topbar__subtitle">Comprehensive class performance, attendance patterns, and top performers.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Attendance Trend Visual */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={20} className="text-gradient" />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Attendance Trend (Recent Days)</h2>
          </div>

          {!analytics || analytics.attendanceTrend.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No attendance records recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analytics.attendanceTrend.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{item.date}</span>
                    <span style={{ color: 'var(--brand-purple)', fontWeight: 700 }}>{item.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers Leaderboard */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={20} className="text-gradient" />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Top Performers</h2>
          </div>

          {!analytics || analytics.topPerformers.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Marks data required to generate leaderboards.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.topPerformers.map((student, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 10, backgroundColor: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="sidebar__avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      #{i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Roll: {student.rollNumber}</div>
                    </div>
                  </div>
                  <span className="badge badge--success" style={{ fontWeight: 800 }}>
                    {student.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
