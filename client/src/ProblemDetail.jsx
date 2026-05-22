import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getThoughts, addThought, reconstruct, getProblems, deleteThought } from './api';

function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [reconstruction, setReconstruction] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getProblems()
      .then((res) => setProblem(res.data.find((p) => p.id === id)))
      .catch(() => {});
    getThoughts(id)
      .then((res) => setThoughts(res.data))
      .catch(() => setStatus('Failed to load thoughts'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddThought = async () => {
    if (!newThought.trim()) return;
    try {
      await addThought(id, { raw_thought: newThought });
      setNewThought('');
      const res = await getThoughts(id);
      setThoughts(res.data);
    } catch (err) {
      setStatus('Failed to add thought');
    }
  };

  const handleDeleteThought = async (thoughtId) => {
    try {
      await deleteThought(id, thoughtId);
      const res = await getThoughts(id);
      setThoughts(res.data);
    } catch (err) {
      setStatus('Failed to delete thought');
    }
  };

  const handleReconstruct = async () => {
    try {
      setAiLoading(true);
      const res = await reconstruct(id);
      setReconstruction(res.data.reconstruction);
    } catch (err) {
      setStatus('Failed to reconstruct');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <p className="tt-state">Loading<span className="tt-loading"></span></p>;

  return (
    <div className="tt-page">
      <div className="tt-hero">
        <h1>{problem ? problem.title : 'Problem Detail'}</h1>
        <p>{problem ? `${problem.difficulty} · ${problem.topic}` : 'Your thoughts and the AI reconstruction.'}</p>
      </div>

      <h2>Thoughts ({thoughts.length})</h2>
      {thoughts.map((t) => (
        <div key={t.id} className="tt-thought" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>{t.raw_thought}</span>
          <button onClick={() => handleDeleteThought(t.id)} className="tt-delete">×</button>
        </div>
      ))}

      <div style={{ marginTop: 18 }}>
        <textarea className="tt-textarea" value={newThought} onChange={(e) => setNewThought(e.target.value)} placeholder="Write a thought about how you're solving this..." />
        <button className="tt-btn" onClick={handleAddThought} style={{ marginTop: 10 }}>Add Thought</button>
      </div>

      <h2 style={{ marginTop: 32 }}>AI Reconstruction</h2>
      <button className="tt-btn" onClick={handleReconstruct} disabled={aiLoading}>
        {aiLoading ? 'Reconstructing...' : 'Reconstruct My Thinking'}
      </button>

      {reconstruction && (
        <div className="tt-reconstruction">
          <h3>Reconstruction</h3>
          <ReactMarkdown>{reconstruction}</ReactMarkdown>
        </div>
      )}

      {status && <p style={{ marginTop: 12 }} className="tt-error">{status}</p>}
    </div>
  );
}

export default ProblemDetail;