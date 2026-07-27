import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Lock, User, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, profile, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await resetPassword(user.email);
      toast.success(`Password reset link sent to ${user.email}!`);
    } catch {
      toast.error('Failed to send reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const name = profile && 'name' in profile ? profile.name : 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Account & Settings</h1>
          <p className="topbar__subtitle">Manage your preference, theme mode, and security options.</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} className="text-gradient" /> Profile Summary
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="sidebar__avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
            <span className="badge badge--purple" style={{ marginTop: 4, textTransform: 'capitalize' }}>
              {user?.role} Account
            </span>
          </div>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Appearance Theme</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Currently using <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
          </p>
        </div>
        <button className="btn btn--outline" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Security Settings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} className="text-gradient" /> Security & Password
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Request a password reset link sent to your registered email address.
        </p>
        <div>
          <button className="btn btn--outline" onClick={handlePasswordReset} disabled={isSendingReset}>
            <Lock size={14} /> {isSendingReset ? 'Sending Email...' : 'Send Password Reset Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
