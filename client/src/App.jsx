import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import LogThought from './LogThought';
import ProblemDetail from './ProblemDetail';
import Stats from './Stats';

function App() {
  return (
    <BrowserRouter>
      <nav className="tt-nav">
        <Link to="/" className="tt-brand"><span className="dot"></span>Thought<span>Trace</span></Link>
        <Link to="/">Dashboard</Link>
        <Link to="/log">Log Problem</Link>
        <Link to="/stats">Overview</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogThought />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;