import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
});

export const getProblems = () => API.get('/problems');
export const createProblem = (data) => API.post('/problems', data);
export const getThoughts = (id) => API.get(`/problems/${id}/thoughts`);
export const addThought = (id, data) => API.post(`/problems/${id}/thoughts`, data);
export const reconstruct = (id) => API.post(`/ai/reconstruct/${id}`);
export const getStats = () => API.get('/stats');
export const deleteThought = (problemId, thoughtId) => API.delete(`/problems/${problemId}/thoughts/${thoughtId}`);