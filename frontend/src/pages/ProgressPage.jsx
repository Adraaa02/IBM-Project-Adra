import { useEffect, useState } from 'react';
import { progressAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProgressPage() {
  const { user } = useAuth();
  const [progresses, setProgresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    progressAPI.getAll().then((res) => {
      setProgresses(res.data);
      if (res.data.length > 0) {
        setSelected(res.data[0]);
        setReport(res.data[0].buddyReport || '');
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectProgress = (p) => {
    setSelected(p);
    setReport(p.buddyReport || '');
    setSaved(false);
  };

  const toggleMilestone = async (index) => {
    if (!selected) return;
    const updated = selected.milestones.map((m, i) =>
      i === index
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : null }
        : m
    );
    const completedCount = updated.filter((m) => m.completed).length;
    const overallProgress = Math.round((completedCount / updated.length) * 100);
    try {
      const res = await progressAPI.update(selected.match?._id || selected.match, {
        milestones: updated,
        overallProgress,
      });
      setProgresses((prev) => prev.map((p) => (p._id === res.data._id ? res.data : p)));
      setSelected(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const saveReport = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await progressAPI.update(selected.match?._id || selected.match, { buddyReport: report });
      setProgresses((prev) => prev.map((p) => (p._id === res.data._id ? res.data : p)));
      setSelected(res.data);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Tracking</h1>
          <p className="page-subtitle">Track onboarding milestones and submit progress reports</p>
        </div>
      </div>

      {progresses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <p>No progress records found</p>
          </div>
        </div>
      ) : (
        <div className="progress-layout">
          {/* List */}
          <div className="progress-sidebar">
            {progresses.map((p) => (
              <button
                key={p._id}
                className={`progress-contact${selected?._id === p._id ? ' active' : ''}`}
                onClick={() => selectProgress(p)}
              >
                <div className="avatar-circle small">{p.newMember?.name?.[0]?.toUpperCase()}</div>
                <div className="progress-contact-info">
                  <div className="progress-contact-name">{p.newMember?.name}</div>
                  <div className="mini-bar">
                    <div className="mini-bar-fill" style={{ width: `${p.overallProgress}%` }} />
                  </div>
                  <div className="progress-pct-small">{p.overallProgress}%</div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="progress-detail">
              <div className="card">
                <div className="card-header">
                  <h3>{selected.newMember?.name}'s Progress</h3>
                  <span className="progress-pct">{selected.overallProgress}%</span>
                </div>

                <div className="progress-bar-bg big">
                  <div className="progress-bar-fill" style={{ width: `${selected.overallProgress}%` }} />
                </div>

                <div className="member-info-row">
                  <div>
                    <span className="info-label">Member:</span> {selected.newMember?.name}
                    {' '}<span className="muted">({selected.newMember?.department})</span>
                  </div>
                  <div>
                    <span className="info-label">Buddy:</span> {selected.buddy?.name}
                  </div>
                </div>

                <h4 className="milestones-title">Milestones</h4>
                <div className="milestones">
                  {selected.milestones?.map((m, i) => (
                    <div
                      key={i}
                      className={`milestone${m.completed ? ' done' : ''}`}
                      onClick={() =>
                        (user.role === 'buddy' || user.role === 'admin') && toggleMilestone(i)
                      }
                      style={{ cursor: user.role !== 'new_member' ? 'pointer' : 'default' }}
                    >
                      <span className="milestone-check">{m.completed ? '✅' : '⬜'}</span>
                      <div>
                        <div className="milestone-title">{m.title}</div>
                        {m.completedAt && (
                          <div className="milestone-date">
                            Completed {new Date(m.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buddy Report */}
              {(user.role === 'buddy' || user.role === 'admin') && (
                <div className="card">
                  <div className="card-header">
                    <h3>Buddy Progress Report</h3>
                  </div>
                  <textarea
                    className="report-textarea"
                    placeholder="Write your progress report about this member…"
                    value={report}
                    onChange={(e) => { setReport(e.target.value); setSaved(false); }}
                    rows={5}
                  />
                  <div className="report-actions">
                    {saved && <span className="save-feedback">✅ Saved!</span>}
                    <button className="btn btn-primary" onClick={saveReport} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Report'}
                    </button>
                  </div>
                </div>
              )}

              {user.role === 'new_member' && selected.buddyReport && (
                <div className="card">
                  <div className="card-header"><h3>Buddy's Report</h3></div>
                  <p className="report-text">{selected.buddyReport}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
