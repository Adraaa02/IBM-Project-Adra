import { useState } from 'react';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'HR', 'Other'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const res = await usersAPI.update(user._id || user.id, form);
      updateUser(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    if (pwForm.password.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    setPwError('');
    setPwSuccess(false);
    try {
      await usersAPI.update(user._id || user.id, { password: pwForm.password });
      setPwSuccess(true);
      setPwForm({ password: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and settings</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Avatar & Info */}
        <div className="card profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-circle xl">{user?.name?.[0]?.toUpperCase()}</div>
            <h2 className="profile-name">{user?.name}</h2>
            <span className={`role-badge role-${user?.role}`}>{formatRole(user?.role)}</span>
            <p className="profile-email">{user?.email}</p>
          </div>
          <div className="profile-meta">
            {user?.department && (
              <div className="profile-meta-item">
                <span className="meta-icon">🏢</span>
                <span>{user.department}</span>
              </div>
            )}
            {user?.phone && (
              <div className="profile-meta-item">
                <span className="meta-icon">📞</span>
                <span>{user.phone}</span>
              </div>
            )}
            {user?.bio && (
              <div className="profile-meta-item bio">
                <span className="meta-icon">📝</span>
                <span>{user.bio}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-forms">
          {/* Edit Profile */}
          <div className="card">
            <div className="card-header"><h3>Edit Profile</h3></div>
            {success && <div className="alert alert-success">✅ Profile updated successfully!</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself…"
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header"><h3>Change Password</h3></div>
            {pwSuccess && <div className="alert alert-success">✅ Password changed successfully!</div>}
            {pwError && <div className="alert alert-error">{pwError}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={pwForm.password}
                  onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRole(role) {
  if (!role) return '';
  return role === 'new_member' ? 'New Member' : role.charAt(0).toUpperCase() + role.slice(1);
}
