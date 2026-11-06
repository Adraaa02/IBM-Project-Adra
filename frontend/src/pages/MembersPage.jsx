import { useEffect, useState } from 'react';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [tab, setTab] = useState('members');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, bRes] = await Promise.all([
          usersAPI.getAll('new_member'),
          usersAPI.getAll('buddy'),
        ]);
        setMembers(mRes.data);
        setBuddies(bRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const list = tab === 'members' ? members : buddies;
  const filtered = list.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u) => {
    setSelectedUser(u);
    setEditForm({ name: u.name, phone: u.phone, department: u.department, bio: u.bio });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await usersAPI.update(selectedUser._id, editForm);
      if (tab === 'members') {
        setMembers((prev) => prev.map((m) => (m._id === res.data._id ? res.data : m)));
      } else {
        setBuddies((prev) => prev.map((b) => (b._id === res.data._id ? res.data : b)));
      }
      setEditing(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersAPI.delete(id);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      setBuddies((prev) => prev.filter((b) => b._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Member Management</h1>
          <p className="page-subtitle">View and manage all registered members and buddies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>
          New Members ({members.length})
        </button>
        <button className={`tab${tab === 'buddies' ? ' active' : ''}`} onClick={() => setTab('buddies')}>
          Buddies ({buddies.length})
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No {tab === 'members' ? 'members' : 'buddies'} found</p>
          </div>
        </div>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Joined</th>
                {user.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="table-user">
                      <div className="avatar-circle small">{u.name[0]?.toUpperCase()}</div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.department || '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  {user.role === 'admin' && (
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Member</h3>
              <button className="modal-close" onClick={() => setEditing(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
