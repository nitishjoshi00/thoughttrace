import { useState, useEffect } from 'react';
import { getStats } from './api';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="tt-state">Loading stats<span className="tt-loading"></span></p>;
  if (error) return <p className="tt-state tt-error">{error}</p>;

  return (
    <div className="tt-page">
      <div className="tt-hero">
        <h1>Overview</h1>
        <p>A summary of everything you've tracked.</p>
      </div>

      <div className="tt-stat-row">
        <div className="tt-stat">
          <div className="tt-num">{stats.totalProblems}</div>
          <div className="tt-label">Total Problems</div>
        </div>
        <div className="tt-stat">
          <div className="tt-num">{stats.totalThoughts}</div>
          <div className="tt-label">Total Thoughts</div>
        </div>
      </div>

      <h2 style={{ marginTop: 32 }}>By Difficulty</h2>
      {stats.byDifficulty.map((row) => (
        <div key={row.difficulty} className="tt-card">
          <div className="tt-title">{row.difficulty}<span className={`tt-badge ${row.difficulty}`}>{row.count}</span></div>
        </div>
      ))}
    </div>
  );
}

export default Stats;