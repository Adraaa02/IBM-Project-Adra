import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, matchesAPI, progressAPI } from '../api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [matchRes, progRes] = await Promise.all([
          matchesAPI.getAll(),
          progressAPI.getAll(),
        ]);
        setMatches(matchRes.data);
        setProgresses(progRes.data);

        if (user.role === 'admin') {
          const statsRes = await usersAPI.getStats();
          setStats(statsRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const myMatch = matches[0];
  const myProgress = progresses[0];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user.name}</strong>! Here's your overview.
          </p>
        </div>
      </div>

      {/* Admin Stats */}
      {user.role === 'admin' && stats && (
        <div className="stats-grid">
          <StatCard icon="👥" label="New Members" value={stats.totalMembers} color="orange" />
          <StatCard icon="🤝" label="Buddies" value={stats.totalBuddies} color="teal" />
          <StatCard icon="🔗" label="Active Matches" value={matches.filter((m) => m.status === 'active').length} color="purple" />
          <StatCard icon="✅" label="Completed" value={matches.filter((m) => m.status === 'completed').length} color="green" />
        </div>
      )}

      {/* Buddy/Member view */}
      {user.role !== 'admin' && (
        <div className="stats-grid">
          <StatCard
            icon={user.role === 'buddy' ? '👥' : '🤝'}
            label={user.role === 'buddy' ? 'Members Assigned' : 'My Buddy'}
            value={matches.length}
            color="orange"
          />
          <StatCard
            icon="📈"
            label="Overall Progress"
            value={`${myProgress?.overallProgress ?? 0}%`}
            color="teal"
          />
          <StatCard
            icon="✅"
            label="Milestones Done"
            value={myProgress?.milestones?.filter((m) => m.completed).length ?? 0}
            color="purple"
          />
          <StatCard
            icon="💬"
            label="Active Chats"
            value={matches.filter((m) => m.status === 'active').length}
            color="green"
          />
        </div>
      )}

      <div className="dashboard-grid">
        {/* Recent Matches */}
        <div className="card">
          <div className="card-header">
            <h3>
              {user.role === 'admin' ? 'Recent Matches' : user.role === 'buddy' ? 'My Members' : 'My Buddy'}
            </h3>
          </div>
          {matches.length === 0 ? (
            <EmptyState icon="🤝" message="No matches yet" />
          ) : (
            <div className="match-list">
              {matches.slice(0, 5).map((match) => (
                <MatchRow key={match._id} match={match} currentUserId={user._id || user.id} />
              ))}
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="card">
          <div className="card-header">
            <h3>Progress Overview</h3>
          </div>
          {progresses.length === 0 ? (
            <EmptyState icon="📈" message="No progress data yet" />
          ) : (
            <div className="progress-list">
              {progresses.slice(0, 5).map((p) => (
                <ProgressRow key={p._id} progress={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function MatchRow({ match, currentUserId }) {
  const other =
    match.newMember?._id === currentUserId || match.newMember?.id === currentUserId
      ? match.buddy
      : match.newMember;

  return (
    <div className="list-row">
      <div className="avatar-circle">{other?.name?.[0]?.toUpperCase()}</div>
      <div className="list-row-info">
        <div className="list-row-name">{other?.name}</div>
        <div className="list-row-sub">{other?.department || 'No department'}</div>
      </div>
      <span className={`status-badge status-${match.status}`}>{match.status}</span>
    </div>
  );
}

function ProgressRow({ progress }) {
  const pct = progress.overallProgress ?? 0;
  return (
    <div className="progress-row">
      <div className="progress-row-header">
        <span>{progress.newMember?.name}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
