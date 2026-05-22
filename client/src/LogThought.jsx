import { useState } from 'react';
import { createProblem } from './api';

function LogThought() {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim()) { setStatus('Title is required'); return; }
    try {
      setStatus('Saving...');
      const res = await createProblem({ title, difficulty, topic });
      setStatus(`Created: ${res.data.title}`);
      setTitle(''); setTopic(''); setDifficulty('Easy');
    } catch (err) {
      setStatus('Failed to create problem');
    }
  };

  return (
    <div className="tt-page">
      <div className="tt-hero">
        <h1>Log a problem.</h1>
        <p>Add a new problem you're working through.</p>
      </div>

      <div className="tt-field">
        <label>Title</label>
        <input className="tt-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Two Sum" />
      </div>

      <div className="tt-field">
        <label>Difficulty</label>
        <select className="tt-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <div className="tt-field">
        <label>Topic</label>
        <input className="tt-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Arrays" />
      </div>

      <button className="tt-btn" onClick={handleSubmit}>Create Problem</button>

      {status && <p style={{ marginTop: 16, color: 'var(--text-dim)' }}>{status}</p>}
    </div>
  );
}

export default LogThought;