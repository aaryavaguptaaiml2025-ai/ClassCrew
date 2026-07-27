import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, GraduationCap, BookOpen, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, profile } = useAuth();

  const isStudent = user?.role === 'student';
  const name = profile && 'name' in profile ? profile.name : 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">My Profile</h1>
          <p className="topbar__subtitle">View your student profile details and academic enrollment metadata.</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="sidebar__avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{name}</h2>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.email}</div>
            <span className="badge badge--purple" style={{ marginTop: 4, textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-secondary)', margin: '4px 0' }} />

        {isStudent && profile && 'rollNumber' in profile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="auth-form__label">Roll Number</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.rollNumber}</div>
            </div>

            <div>
              <div className="auth-form__label">Branch</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.branch}</div>
            </div>

            <div>
              <div className="auth-form__label">Semester</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Semester {profile.semester}</div>
            </div>

            <div>
              <div className="auth-form__label">Section</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Section {profile.section}</div>
            </div>
          </div>
        ) : profile && 'department' in profile ? (
          <div>
            <div className="auth-form__label">Department</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.department}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
