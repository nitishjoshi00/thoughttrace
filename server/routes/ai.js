const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const pool = require('../db');

const openaiClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

router.post('/reconstruct/:problemId', async (req, res) => {
  const { problemId } = req.params;
  try {
    const problemResult = await pool.query(
      'SELECT * FROM problems WHERE id = $1',
      [problemId]
    );
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const problem = problemResult.rows[0];

    const thoughtsResult = await pool.query(
      'SELECT raw_thought FROM thoughts WHERE problem_id = $1 ORDER BY created_at ASC',
      [problemId]
    );
    const thoughtTexts = thoughtsResult.rows.map((row) => row.raw_thought || '').filter(Boolean);

    const prompt = `You are a DSA tutor, student is solving ${problem.title} ${problem.difficulty} ${problem.topic}, here are their thoughts ${thoughtTexts.join('\n')}, reconstruct their thinking clearly`;

    const completion = await openaiClient.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    });

    const reconstruction = (completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) || '';

    await pool.query(
      'UPDATE problems SET reconstruction = $1 WHERE id = $2',
      [reconstruction, problemId]
    );

    res.status(200).json({ reconstruction });
  } catch (error) {
    console.error('Error reconstructing problem:', error);
    res.status(500).json({ error: 'Failed to reconstruct problem' });
  }
});

module.exports = router;