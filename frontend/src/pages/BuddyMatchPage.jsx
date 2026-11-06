import { useEffect, useState } from 'react';
import { matchesAPI, usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function BuddyMatchPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [members, setMembers] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ newMemberId: '', buddyId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [autoRunning, setAutoRunning] = useState(false);

  const load = async () => {
    try {
      const [mRes, bRes, matchRes] = await Promise.all([
        usersAPI.getAll('new_member'),
        usersAPI.getAll('buddy'),
        matchesAPI.getAll(),
      ]);
      setMembers(mRes.data);
      setBuddies(bRes.data);
      setMatches(matchRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await matchesAPI.create(form);
      setMatches((prev) => [res.data, ...prev]);
      setShowForm(false);
      setForm({ newMemberId: '', buddyId: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuto = async () => {
    setAutoRunning(true);
    try {
      const res = await matchesAPI.autoMatch();
      alert(`✅ Auto-matched ${res.data.matched} new member(s)!`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Auto match failed');
    } finally {
      setAutoRunning(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this match?')) return;
    try {
      await matchesAPI.delete(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      alert('Failed to delete match');
    }
  };

  const handleStatusChange = async (id, status) => {
    const res = await matchesAPI.update(id, { status });
    setMatches((prev) => prev.map((m) => (m._id === id ? res.data : m)));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buddy Matching</h1>
          <p className="page-subtitle">
            {user.role === 'admin'
              ? 'Create and manage buddy–member pairings'
              : 'View your current buddy assignment'}
          </p>
        </div>
        {user.role === 'admin' && (
          <div className="header-actions">
            <button className="btn btn-outline" onClick={handleAuto} disabled={autoRunning}>
              {autoRunning ? 'Matching…' : '⚡ Auto Match'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create Match
            </button>
          </div>
        )}
      </div>

      {/* Match Cards */}
      {matches.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🤝</div>
            <p>No matches yet</p>
            {user.role === 'admin' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Create First Match
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="match-cards">
          {matches.map((match) => (
            <MatchCard
              key={match._id}
              match={match}
              isAdmin={user.role === 'admin'}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Create Match Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Match</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>New Member *</label>
                <select
                  value={form.newMemberId}
                  onChange={(e) => setForm({ ...form, newMemberId: e.target.value })}
                  required
                >
                  <option value="">Select a new member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} — {m.department || 'No dept'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Buddy *</label>
                <select
                  value={form.buddyId}
                  onChange={(e) => setForm({ ...form, buddyId: e.target.value })}
                  required
                >
                  <option value="">Select a buddy</option>
                  {buddies.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} — {b.department || 'No dept'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any notes about this match…"
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, isAdmin, onDelete, onStatusChange }) {
  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className={`status-badge status-${match.status}`}>{match.status}</span>
        <span className="match-type">{match.matchedBy === 'auto' ? '⚡ Auto' : '✋ Manual'}</span>
      </div>
      <div className="match-card-body">
        <div className="match-person">
          <div className="avatar-circle">{match.newMember?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="match-person-name">{match.newMember?.name}</div>
            <div className="match-person-role">New Member</div>
            <div className="match-person-dept">{match.newMember?.department || 'No dept'}</div>
          </div>
        </div>
        <div className="match-connector">🤝</div>
        <div className="match-person">
          <div className="avatar-circle buddy">{match.buddy?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="match-person-name">{match.buddy?.name}</div>
            <div className="match-person-role">Buddy</div>
            <div className="match-person-dept">{match.buddy?.department || 'No dept'}</div>
          </div>
        </div>
      </div>
      {match.notes && <div className="match-notes">📝 {match.notes}</div>}
      {isAdmin && (
        <div className="match-card-footer">
          <select
            value={match.status}
            onChange={(e) => onStatusChange(match._id, e.target.value)}
            className="status-select"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(match._id)}>Remove</button>
        </div>
      )}
    </div>
  );
}
