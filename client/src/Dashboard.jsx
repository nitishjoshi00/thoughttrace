import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from './api';

function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProblems()
      .then((res) => setProblems(res.data))
      .catch(() => setError('Failed to load problems'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="tt-state">Loading problems<span className="tt-loading"></span></p>;
  if (error) return <p className="tt-state tt-error">{error}</p>;

  return (
    <div className="tt-page">
      <div className="tt-hero">
        <h1>Trace your thinking.</h1>
        <p>Log how you reason through problems, then let AI reconstruct your thought process into a clear explanation.</p>
      </div>

      <h2>Problems ({problems.length})</h2>
      {problems.map((p) => (
        <Link key={p.id} to={`/problem/${p.id}`} className="tt-card">
          <div className="tt-title">{p.title}<span className={`tt-badge ${p.difficulty}`}>{p.difficulty}</span></div>
          <div className="tt-meta">{p.topic}</div>
        </Link>
      ))}
    </div>
  );
}

export default Dashboard;