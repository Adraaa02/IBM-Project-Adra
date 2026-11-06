import { useEffect, useState } from 'react';
import { evaluationsAPI, matchesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const STAR_LABELS = { communication: 'Communication', helpfulness: 'Helpfulness', availability: 'Availability', overall: 'Overall' };

export default function EvaluationPage() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    matchId: '',
    evaluateeId: '',
    type: '',
    ratings: { communication: 5, helpfulness: 5, availability: 5, overall: 5 },
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [evRes, matchRes] = await Promise.all([
        evaluationsAPI.getAll(),
        matchesAPI.getAll(),
      ]);
      setEvaluations(evRes.data);
      setMatches(matchRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMatchSelect = (matchId) => {
    const match = matches.find((m) => m._id === matchId);
    if (!match) return;
    const uid = user._id || user.id;
    const isBuddy = match.buddy?._id === uid || match.buddy?.id === uid;
    const evaluateeId = isBuddy ? match.newMember?._id : match.buddy?._id;
    const type = isBuddy ? 'buddy_rates_member' : 'member_rates_buddy';
    setForm((f) => ({ ...f, matchId, evaluateeId, type }));
  };

  const handleRating = (key, val) => {
    setForm((f) => ({ ...f, ratings: { ...f.ratings, [key]: val } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await evaluationsAPI.submit(form);
      setEvaluations((prev) => [res.data, ...prev]);
      setShowForm(false);
      setForm({
        matchId: '',
        evaluateeId: '',
        type: '',
        ratings: { communication: 5, helpfulness: 5, availability: 5, overall: 5 },
        feedback: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evaluation</h1>
          <p className="page-subtitle">Submit and view evaluations for the onboarding program</p>
        </div>
        {matches.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Submit Evaluation
          </button>
        )}
      </div>

      {evaluations.length === 0 && !showForm ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <p>No evaluations yet. Be the first to share feedback!</p>
            {matches.length > 0 && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Submit Evaluation
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="eval-grid">
          {evaluations.map((ev) => (
            <EvalCard key={ev._id} evaluation={ev} />
          ))}
        </div>
      )}

      {/* Evaluation Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Evaluation</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Match *</label>
                <select
                  value={form.matchId}
                  onChange={(e) => handleMatchSelect(e.target.value)}
                  required
                >
                  <option value="">Choose a match…</option>
                  {matches.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.newMember?.name} ↔ {m.buddy?.name}
                    </option>
                  ))}
                </select>
              </div>

              {form.matchId && (
                <>
                  <div className="ratings-section">
                    <h4>Rate your experience</h4>
                    {Object.entries(STAR_LABELS).map(([key, label]) => (
                      <div key={key} className="rating-row">
                        <label>{label}</label>
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={`star${form.ratings[key] >= n ? ' active' : ''}`}
                              onClick={() => handleRating(key, n)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="rating-val">{form.ratings[key]}/5</span>
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Written Feedback</label>
                    <textarea
                      value={form.feedback}
                      onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                      placeholder="Share your honest feedback…"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !form.matchId}>
                  {submitting ? 'Submitting…' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StarDisplay({ value }) {
  return (
    <span className="star-display">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}

function EvalCard({ evaluation }) {
  const avg = Object.values(evaluation.ratings || {}).reduce((a, b) => a + b, 0) / 4;
  return (
    <div className="eval-card">
      <div className="eval-card-header">
        <div className="eval-parties">
          <div className="eval-person">
            <div className="avatar-circle small">{evaluation.evaluator?.name?.[0]?.toUpperCase()}</div>
            <span>{evaluation.evaluator?.name}</span>
          </div>
          <span className="eval-arrow">→</span>
          <div className="eval-person">
            <div className="avatar-circle small buddy">{evaluation.evaluatee?.name?.[0]?.toUpperCase()}</div>
            <span>{evaluation.evaluatee?.name}</span>
          </div>
        </div>
        <div className="eval-avg">
          <StarDisplay value={Math.round(avg)} />
          <span className="eval-avg-val">{avg.toFixed(1)}</span>
        </div>
      </div>

      <div className="eval-ratings">
        {Object.entries(evaluation.ratings || {}).map(([key, val]) => (
          <div key={key} className="eval-rating-row">
            <span className="eval-rating-label">{STAR_LABELS[key]}</span>
            <StarDisplay value={val} />
          </div>
        ))}
      </div>

      {evaluation.feedback && (
        <div className="eval-feedback">"{evaluation.feedback}"</div>
      )}

      <div className="eval-date">
        {new Date(evaluation.submittedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
